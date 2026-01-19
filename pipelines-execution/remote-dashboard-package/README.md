# Pipeline Dashboard - Remote Client
# Last Updated: 2026-01-18

A terminal-based dashboard for monitoring pipeline state files via WebDAV.

## Quick Install

### Linux / macOS
```bash
chmod +x install.sh
./install.sh
```

### Windows (PowerShell as Administrator)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install.ps1
```

## Usage

After installation, run the dashboard with the remote server URL:

### Linux / macOS
```bash
./dashboard.sh --remote http://SERVER_IP:8080/
```

### Windows
```cmd
dashboard.bat --remote http://SERVER_IP:8080/
```

Or with PowerShell:
```powershell
python pipeline-dashboard.py --remote http://SERVER_IP:8080/
```

## Options

```
--remote, -R URL    WebDAV server URL (required for remote monitoring)
--refresh, -r N     Refresh interval in seconds (default: 3)
--once, -o          Render once and exit
--latest, -l        Show only the most recent pipeline
--deps              Show dependency graph
```

## Requirements

- Python 3.7+
- rich (installed automatically)

## Troubleshooting

1. **Connection refused**: Make sure the WebDAV server is running on the host machine
2. **No files found**: Verify pipeline state files exist on the server
3. **Import error**: Run the install script again to install dependencies
