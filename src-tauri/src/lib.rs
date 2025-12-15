mod com_port;
mod error;

use com_port::{ComPortManager, PortInfo, PortSettings};
use serde::Serialize;
use std::sync::Arc;
use tokio::sync::Mutex;

type Manager = Arc<Mutex<ComPortManager>>;

#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

#[tauri::command]
async fn list_ports(manager: tauri::State<'_, Manager>) -> Result<Vec<PortInfo>, ErrorResponse> {
    let mgr = manager.lock().await;
    mgr.list_ports()
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

#[tauri::command]
async fn open_port(
    port_name: String,
    settings: PortSettings,
    manager: tauri::State<'_, Manager>,
) -> Result<(), ErrorResponse> {
    let mgr = manager.lock().await;
    mgr.open_port(&port_name, settings)
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

#[tauri::command]
async fn close_port(
    port_name: String,
    manager: tauri::State<'_, Manager>,
) -> Result<(), ErrorResponse> {
    let mgr = manager.lock().await;
    mgr.close_port(&port_name)
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

#[tauri::command]
async fn is_port_open(
    port_name: String,
    manager: tauri::State<'_, Manager>,
) -> Result<bool, ErrorResponse> {
    let mgr = manager.lock().await;
    Ok(mgr.is_port_open(&port_name).await)
}

#[tauri::command]
async fn write_data(
    port_name: String,
    data: Vec<u8>,
    manager: tauri::State<'_, Manager>,
) -> Result<usize, ErrorResponse> {
    let mgr = manager.lock().await;
    mgr.write_data(&port_name, &data)
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

#[tauri::command]
async fn read_data(
    port_name: String,
    buffer_size: usize,
    manager: tauri::State<'_, Manager>,
) -> Result<Vec<u8>, ErrorResponse> {
    let mgr = manager.lock().await;
    mgr.read_data(&port_name, buffer_size)
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

#[tauri::command]
async fn update_settings(
    port_name: String,
    settings: PortSettings,
    manager: tauri::State<'_, Manager>,
) -> Result<(), ErrorResponse> {
    let mgr = manager.lock().await;
    mgr.update_settings(&port_name, settings)
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

#[tauri::command]
async fn close_all_ports(manager: tauri::State<'_, Manager>) -> Result<(), ErrorResponse> {
    let mgr = manager.lock().await;
    mgr.close_all_ports().await;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let manager = Arc::new(Mutex::new(ComPortManager::new()));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(manager)
        .invoke_handler(tauri::generate_handler![
            list_ports,
            open_port,
            close_port,
            is_port_open,
            write_data,
            read_data,
            update_settings,
            close_all_ports
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
