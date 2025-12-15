use thiserror::Error;

#[derive(Error, Debug)]
pub enum ComPortError {
    #[error("Port not found: {0}")]
    PortNotFound(String),

    #[error("Port already open: {0}")]
    PortAlreadyOpen(String),

    #[error("Port not open: {0}")]
    PortNotOpen(String),

    #[error("Failed to open port: {0}")]
    OpenFailed(String),

    #[error("Failed to read from port: {0}")]
    ReadFailed(String),

    #[error("Failed to write to port: {0}")]
    WriteFailed(String),

    #[error("Invalid baud rate: {0}")]
    InvalidBaudRate(u32),

    #[error("Invalid configuration: {0}")]
    InvalidConfiguration(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Serial port error: {0}")]
    SerialPortError(#[from] serialport::Error),
}

pub type ComPortResult<T> = Result<T, ComPortError>;

