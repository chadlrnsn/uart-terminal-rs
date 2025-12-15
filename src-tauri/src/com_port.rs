use crate::error::{ComPortError, ComPortResult};
use anyhow::Context;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::sync::Mutex;
use tokio::time::timeout;
use tokio_serial::{SerialPortBuilderExt, SerialStream};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortInfo {
    pub name: String,
    pub description: Option<String>,
    pub vid: Option<u16>,
    pub pid: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortSettings {
    pub baud_rate: u32,
    pub data_bits: u8,
    pub stop_bits: u8,
    pub parity: String,
    pub flow_control: String,
    pub timeout_ms: u64,
    #[serde(default)]
    pub rts: Option<bool>,
    #[serde(default)]
    pub cts: Option<bool>,
    #[serde(default)]
    pub dtr: Option<bool>,
    #[serde(default)]
    pub dsr: Option<bool>,
    #[serde(default)]
    pub dcd: Option<bool>,
}

impl Default for PortSettings {
    fn default() -> Self {
        Self {
            baud_rate: 115200,
            data_bits: 8,
            stop_bits: 1,
            parity: "None".to_string(),
            flow_control: "None".to_string(),
            timeout_ms: 1000,
            rts: None,
            cts: None,
            dtr: None,
            dsr: None,
            dcd: None,
        }
    }
}

pub struct ComPortManager {
    ports: Arc<Mutex<HashMap<String, Arc<Mutex<SerialStream>>>>>,
}

impl ComPortManager {
    pub fn new() -> Self {
        Self {
            ports: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn list_ports(&self) -> ComPortResult<Vec<PortInfo>> {
        let ports = serialport::available_ports()
            .context("Failed to enumerate available serial ports")
            .map_err(|e| ComPortError::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            )))?;

        let mut port_info_list = Vec::new();

        for port in ports {
            let (description, vid, pid) = match &port.port_type {
                serialport::SerialPortType::UsbPort(info) => (
                    Some(format!("USB Serial Port ({} {})", info.vid, info.pid)),
                    Some(info.vid),
                    Some(info.pid),
                ),
                serialport::SerialPortType::BluetoothPort => (
                    Some("Bluetooth Serial Port".to_string()),
                    None,
                    None,
                ),
                serialport::SerialPortType::PciPort => (
                    Some("PCI Serial Port".to_string()),
                    None,
                    None,
                ),
                serialport::SerialPortType::Unknown => (None, None, None),
            };

            port_info_list.push(PortInfo {
                name: port.port_name.clone(),
                description,
                vid,
                pid,
            });
        }

        Ok(port_info_list)
    }

    pub async fn open_port(
        &self,
        port_name: &str,
        settings: PortSettings,
    ) -> ComPortResult<()> {
        let mut ports = self.ports.lock().await;

        if ports.contains_key(port_name) {
            return Err(ComPortError::PortAlreadyOpen(port_name.to_string()));
        }

        let parity = match settings.parity.as_str() {
            "None" => tokio_serial::Parity::None,
            "Odd" => tokio_serial::Parity::Odd,
            "Even" => tokio_serial::Parity::Even,
            _ => return Err(ComPortError::InvalidConfiguration(
                format!("Invalid parity: {}", settings.parity),
            )),
        };

        let flow_control = match settings.flow_control.as_str() {
            "None" => tokio_serial::FlowControl::None,
            "Software" => tokio_serial::FlowControl::Software,
            "Hardware" => tokio_serial::FlowControl::Hardware,
            _ => return Err(ComPortError::InvalidConfiguration(
                format!("Invalid flow control: {}", settings.flow_control),
            )),
        };

        let stop_bits = match settings.stop_bits {
            1 => tokio_serial::StopBits::One,
            2 => tokio_serial::StopBits::Two,
            _ => return Err(ComPortError::InvalidConfiguration(
                format!("Invalid stop bits: {}", settings.stop_bits),
            )),
        };

        let data_bits = match settings.data_bits {
            5 => tokio_serial::DataBits::Five,
            6 => tokio_serial::DataBits::Six,
            7 => tokio_serial::DataBits::Seven,
            8 => tokio_serial::DataBits::Eight,
            _ => return Err(ComPortError::InvalidConfiguration(
                format!("Invalid data bits: {}", settings.data_bits),
            )),
        };

        let port = tokio_serial::new(port_name, settings.baud_rate)
            .data_bits(data_bits)
            .stop_bits(stop_bits)
            .parity(parity)
            .flow_control(flow_control)
            .timeout(std::time::Duration::from_millis(settings.timeout_ms))
            .open_native_async()
            .with_context(|| format!("Failed to open serial port: {}", port_name))
            .map_err(|e| ComPortError::OpenFailed(e.to_string()))?;

        ports.insert(port_name.to_string(), Arc::new(Mutex::new(port)));
        Ok(())
    }

    pub async fn close_port(&self, port_name: &str) -> ComPortResult<()> {
        let mut ports = self.ports.lock().await;

        if !ports.contains_key(port_name) {
            return Err(ComPortError::PortNotOpen(port_name.to_string()));
        }

        ports.remove(port_name);
        Ok(())
    }

    pub async fn is_port_open(&self, port_name: &str) -> bool {
        let ports = self.ports.lock().await;
        ports.contains_key(port_name)
    }

    pub async fn write_data(&self, port_name: &str, data: &[u8]) -> ComPortResult<usize> {
        let port_arc = {
            let ports = self.ports.lock().await;
            ports
                .get(port_name)
                .ok_or_else(|| ComPortError::PortNotOpen(port_name.to_string()))?
                .clone()
        };

        let mut port = port_arc.lock().await;

        let write_timeout = Duration::from_secs(3);
        let written = timeout(write_timeout, port.write(data))
            .await
            .map_err(|_| ComPortError::WriteFailed(
                format!("Write operation timed out after 3 seconds for port: {}", port_name)
            ))?
            .with_context(|| format!("Failed to write data to port: {}", port_name))
            .map_err(|e| ComPortError::WriteFailed(e.to_string()))?;

        timeout(write_timeout, port.flush())
            .await
            .map_err(|_| ComPortError::WriteFailed(
                format!("Flush operation timed out after 3 seconds for port: {}", port_name)
            ))?
            .with_context(|| format!("Failed to flush port: {}", port_name))
            .map_err(|e| ComPortError::WriteFailed(e.to_string()))?;

        Ok(written)
    }

    pub async fn read_data(&self, port_name: &str, buffer_size: usize) -> ComPortResult<Vec<u8>> {
        let port_arc = {
            let ports = self.ports.lock().await;
            ports
                .get(port_name)
                .ok_or_else(|| ComPortError::PortNotOpen(port_name.to_string()))?
                .clone()
        };

        let mut port = port_arc.lock().await;

        let mut buffer = vec![0u8; buffer_size];
        let read_timeout = Duration::from_secs(3);
        
        match timeout(read_timeout, port.read(&mut buffer)).await {
            Ok(Ok(bytes_read)) => {
                buffer.truncate(bytes_read);
                Ok(buffer)
            }
            Ok(Err(e)) => {
                Err(ComPortError::ReadFailed(
                    format!("Failed to read data from port {}: {}", port_name, e)
                ))
            }
            Err(_) => {
                Ok(Vec::new())
            }
        }
    }

    pub async fn update_settings(
        &self,
        port_name: &str,
        settings: PortSettings,
    ) -> ComPortResult<()> {
        let mut ports = self.ports.lock().await;

        if !ports.contains_key(port_name) {
            return Err(ComPortError::PortNotOpen(port_name.to_string()));
        }

        ports.remove(port_name);

        self.open_port(port_name, settings).await
    }

    pub async fn close_all_ports(&self) {
        let mut ports = self.ports.lock().await;
        ports.clear();
    }
}

impl Default for ComPortManager {
    fn default() -> Self {
        Self::new()
    }
}

