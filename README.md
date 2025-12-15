# UART Terminal

Cross-platform UART/Serial terminal application built with Tauri, React, and TypeScript. Provides a modern interface for serial communication with comprehensive configuration options and real-time data monitoring.

## Features

### Port Management

- Automatic port detection and listing
- Port information display (name, description, VID/PID for USB devices)
- Manual port refresh
- Support for USB, Bluetooth, and PCI serial ports

### Connection Configuration

- Baud rate: 300 to 921600 (default: 115200)
- Data bits: 5, 6, 7, 8 (default: 8)
- Stop bits: 1, 2 (default: 1)
- Parity: None, Odd, Even (default: None)
- Flow control: None, Software, Hardware (default: None)
- Timeout configuration (default: 1000ms)
- Hardware control signals: RTS, CTS, DTR, DSR, DCD

### Data Transmission (TX)

- Text mode: Send ASCII text with UTF-8 encoding
- Hex mode: Send raw hexadecimal data
- Enter key behavior:
  - Send LF (0x0A)
  - Send CR (0x0D)
  - Send CRLF (0x0D 0x0A)
  - Send break signal
- Backspace key: Send backspace (0x08) or delete (0x7F)
- Delete key: Send backspace (0x08), delete (0x7F), or VT sequence (ESC [ 3 ~)
- Meta keys:
  - Ctrl+A through Ctrl+Z send 0x01-0x1A
  - Alt+char sends ESC + char (e.g., Alt+A sends 0x1B 0x41)

### Data Reception (RX)

- Automatic data polling (100ms interval)
- Dual display format: ASCII text and hexadecimal representation
- Data type interpretation: ASCII or Number (hex, uint8, int16, etc.)
- ANSI escape code parsing with configurable maximum length
- Newline behavior:
  - Don't move cursor
  - Move cursor down one line
  - Move cursor to start of line and down
  - Swallow \n bytes option
- Carriage return behavior:
  - Don't move cursor
  - Move cursor to start of current line
  - Move cursor to start and down one line
  - Swallow \r bytes option
- Non-visible character display:
  - Swallow
  - Control code glyphs for ASCII control codes, hex glyphs for others
  - Hex code glyphs for all non-visible characters

### Terminal Display

- Real-time data display with automatic scrolling
- Manual scroll control with auto-scroll toggle
- Line filtering: All, TX only, RX only
- Search functionality with real-time filtering
- Maximum line limit (default: 1000 lines)
- Local TX echo option
- Terminal-style appearance with monospace font

### User Interface

- Tabbed interface: Metrics, Settings, Terminal, Logs
- Settings organized into tabs:
  - Connection Configuration
  - TX Settings
  - RX Settings
  - Display (placeholder)
  - General (placeholder)
  - Profiles (placeholder)
  - Sounds (placeholder)
- Connection status indicator
- Error display with clear messaging
- Responsive layout with sidebar navigation

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- Lucide React icons

### Backend

- Rust
- Tauri 2
- Tokio (async runtime)
- tokio-serial (async serial port operations)
- serialport (port enumeration and management)

## Requirements

- Rust (latest stable)
- Node.js 18+ and npm
- System dependencies for serial port access:
  - Windows: Built-in support
  - Linux: `libudev-dev` (Ubuntu/Debian) or equivalent
  - macOS: Built-in support

## Installation

### Development

1. Clone the repository:

```bash
git clone https://github.com/chadlrnsn/uart-terminal-rs.git
cd uart-terminal-rs
```

2. Install frontend dependencies:

```bash
npm ci
```

3. Install Rust dependencies (automatically handled by Cargo):

```bash
cd src-tauri
cargo build
cd ..
```

4. Run in development mode:

```bash
npm run tauri dev
```

### Building

Build the application:

```bash
npm run tauri build
```

The built application will be in `src-tauri/target/release/`.

## Usage

### Connecting to a Port

1. Open the application
2. Navigate to Settings tab
3. Select a port from the dropdown
4. Configure port settings (baud rate, data bits, etc.)
5. Click "Connect"

### Sending Data

1. Navigate to Terminal tab
2. Use the "Send Data" panel at the bottom
3. Choose Text or Hex mode
4. Enter data and press Enter or click Send button
5. In Text mode: Shift+Enter for new line, Enter to send
6. In Hex mode: Enter space-separated hex bytes (e.g., `48 65 6C 6C 6F`)

### Viewing Received Data

- Received data automatically appears in the terminal
- Each line is prefixed with `[RX]` or `[TX]`
- Data is shown in both ASCII and hex format: `[RX] Hello (48 65 6C 6C 6F)`
- Use filters to show only TX or RX data
- Use search to find specific content

### Terminal Controls

- **Auto-scroll**: Automatically scrolls to bottom when new data arrives
- **Local TX Echo**: Shows transmitted data in terminal (disabled by default)
- **Filter**: Show All, TX only, or RX only
- **Search**: Real-time text search in terminal output
- **Clear**: Remove all terminal data

## Architecture

### Backend (Rust)

The backend uses an async architecture with Tokio:

- `ComPortManager`: Manages serial port connections
- `PortSettings`: Configuration structure for port parameters
- `PortInfo`: Port metadata (name, description, VID/PID)
- Tauri commands expose functionality to frontend:
  - `list_ports`: Enumerate available serial ports
  - `open_port`: Open a port with specified settings
  - `close_port`: Close an open port
  - `write_data`: Send data to port
  - `read_data`: Read data from port
  - `update_settings`: Update port settings (requires reconnection)
  - `is_port_open`: Check if port is open
  - `close_all_ports`: Close all open ports

### Frontend (React)

- Component-based architecture
- Custom hooks for port management (`useComPort`)
- State management with React hooks
- Real-time data polling (100ms interval)
- Type-safe interfaces with TypeScript

## Development Guide

### Project Structure

```text
uart-terminal/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── types.ts           # TypeScript type definitions
│   └── App.tsx            # Main application component
├── src-tauri/             # Tauri backend
│   ├── src/
│   │   ├── main.rs        # Entry point
│   │   ├── lib.rs         # Tauri command handlers
│   │   ├── com_port.rs    # Serial port management
│   │   └── error.rs       # Error types
│   └── Cargo.toml         # Rust dependencies
└── README.md
```

### Code Style

- Rust: Follows standard Rust conventions, uses `Result` for error handling
- TypeScript: Strict mode enabled, uses functional components and hooks
- Commits: Conventional Commits format

### Testing

Run Rust tests:

```bash
cd src-tauri
cargo test
```

## License

[Specify your license here]

## Contributing

Contributions are welcome. Please ensure:

- Code follows project conventions
- All tests pass
- Commits follow Conventional Commits format
- Pull requests include description of changes

## Known Limitations

- Display, General, Profiles, and Sounds settings tabs are placeholders
- Metrics and Logs tabs are placeholders
- No data logging to file
- No connection profiles persistence
- No script/automation support
