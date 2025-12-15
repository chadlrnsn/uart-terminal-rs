use crate::error::{ComPortError, ComPortResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::sync::Mutex;
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
    ports: Arc<Mutex<HashMap<String, SerialStream>>>,
}

impl ComPortManager {
    pub fn new() -> Self {
        Self {
            ports: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn list_ports(&self) -> ComPortResult<Vec<PortInfo>> {
        let ports = serialport::available_ports()
            .map_err(|e| ComPortError::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to list ports: {}", e),
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
            .map_err(|e| ComPortError::OpenFailed(format!("{}: {}", port_name, e)))?;

        ports.insert(port_name.to_string(), port);
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
        let mut ports = self.ports.lock().await;

        let port = ports
            .get_mut(port_name)
            .ok_or_else(|| ComPortError::PortNotOpen(port_name.to_string()))?;

        let written = port
            .write(data)
            .await
            .map_err(|e| ComPortError::WriteFailed(format!("{}: {}", port_name, e)))?;

        port.flush()
            .await
            .map_err(|e| ComPortError::WriteFailed(format!("{}: {}", port_name, e)))?;

        Ok(written)
    }

    pub async fn read_data(&self, port_name: &str, buffer_size: usize) -> ComPortResult<Vec<u8>> {
        let mut ports = self.ports.lock().await;

        let port = ports
            .get_mut(port_name)
            .ok_or_else(|| ComPortError::PortNotOpen(port_name.to_string()))?;

        let mut buffer = vec![0u8; buffer_size];
        let bytes_read = port
            .read(&mut buffer)
            .await
            .map_err(|e| ComPortError::ReadFailed(format!("{}: {}", port_name, e)))?;

        buffer.truncate(bytes_read);
        Ok(buffer)
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

