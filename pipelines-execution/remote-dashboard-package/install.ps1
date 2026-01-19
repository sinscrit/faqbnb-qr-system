# =============================================================================
# Pipeline Dashboard - Windows Installation Script (PowerShell)
# =============================================================================
# Installs dependencies and sets up the remote dashboard client.
#
# Usage: .\install.ps1 [-ServerUrl URL]
#
# Created: 2026-01-18
# =============================================================================

param(
    [string]$ServerUrl = ""
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       Pipeline Dashboard - Remote Client Installer        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$PythonCmd = $null

# Try python3 first, then python
foreach ($cmd in @("python3", "python", "py -3", "py")) {
    try {
        $version = & $cmd.Split()[0] $cmd.Split()[1..$cmd.Split().Length] --version 2>&1
        if ($version -match "Python 3") {
            $PythonCmd = $cmd
            Write-Host "  [OK] Found: $version" -ForegroundColor Green
            break
        }
    } catch {
        continue
    }
}

if (-not $PythonCmd) {
    Write-Host "  [X] Python 3 not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python 3.7 or later from:"
    Write-Host "  https://www.python.org/downloads/windows/"
    Write-Host ""
    Write-Host "Make sure to check 'Add Python to PATH' during installation."
    exit 1
}

# Check pip
Write-Host "Checking pip installation..." -ForegroundColor Yellow
try {
    $pipVersion = & $PythonCmd.Split()[0] -m pip --version 2>&1
    Write-Host "  [OK] pip is available" -ForegroundColor Green
} catch {
    Write-Host "  [!] pip not found, attempting to install..." -ForegroundColor Yellow
    try {
        & $PythonCmd.Split()[0] -m ensurepip --default-pip
    } catch {
        Write-Host "  [X] Could not install pip" -ForegroundColor Red
        Write-Host "Please install pip manually from: https://pip.pypa.io/en/stable/installation/"
        exit 1
    }
}

# Install dependencies
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
try {
    & $PythonCmd.Split()[0] -m pip install --user --quiet rich pyyaml 2>$null
    if ($LASTEXITCODE -ne 0) {
        & $PythonCmd.Split()[0] -m pip install --quiet rich pyyaml
    }
    Write-Host "  [OK] rich installed" -ForegroundColor Green
    Write-Host "  [OK] pyyaml installed" -ForegroundColor Green
} catch {
    Write-Host "  [X] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create config file
Write-Host ""
Write-Host "Setting up configuration..." -ForegroundColor Yellow
$ConfigFile = Join-Path $ScriptDir "dashboard-config.txt"
if (-not (Test-Path $ConfigFile)) {
    @"
# Pipeline Dashboard Configuration
# Set your WebDAV server URL below:
# REMOTE_URL=http://192.168.1.4:8080/
"@ | Out-File -FilePath $ConfigFile -Encoding UTF8
    Write-Host "  [OK] Created config template: dashboard-config.txt" -ForegroundColor Green
}

# Test import
Write-Host ""
Write-Host "Testing installation..." -ForegroundColor Yellow
try {
    & $PythonCmd.Split()[0] -c "from rich.console import Console; print('  [OK] rich module loaded')"
    Write-Host "  [OK] All modules loaded successfully" -ForegroundColor Green
} catch {
    Write-Host "  [X] Module test failed" -ForegroundColor Red
    exit 1
}

# Create batch launcher
$BatchFile = Join-Path $ScriptDir "dashboard.bat"
@"
@echo off
REM Pipeline Dashboard Launcher for Windows
REM Created: 2026-01-18

setlocal

set SCRIPT_DIR=%~dp0
set CONFIG_FILE=%SCRIPT_DIR%dashboard-config.txt

REM Check for config file and load REMOTE_URL
if exist "%CONFIG_FILE%" (
    for /f "tokens=1,* delims==" %%a in ('findstr /r "^REMOTE_URL=" "%CONFIG_FILE%"') do (
        set REMOTE_URL=%%b
    )
)

REM If --remote not in args and REMOTE_URL is set, add it
echo %* | findstr /i "\-\-remote \-R" >nul
if errorlevel 1 (
    if defined REMOTE_URL (
        python "%SCRIPT_DIR%pipeline-dashboard.py" --remote %REMOTE_URL% %*
    ) else (
        python "%SCRIPT_DIR%pipeline-dashboard.py" %*
    )
) else (
    python "%SCRIPT_DIR%pipeline-dashboard.py" %*
)

endlocal
"@ | Out-File -FilePath $BatchFile -Encoding ASCII
Write-Host "  [OK] Created launcher: dashboard.bat" -ForegroundColor Green

# Done
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              Installation Complete!                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Usage:"
Write-Host "  dashboard.bat --remote http://SERVER_IP:8080/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or edit dashboard-config.txt to set a default server URL."
Write-Host ""

# Prompt for server URL
if (-not $ServerUrl) {
    $ServerUrl = Read-Host "Enter WebDAV server URL (or press Enter to skip)"
}

if ($ServerUrl) {
    "REMOTE_URL=$ServerUrl" | Out-File -FilePath $ConfigFile -Encoding UTF8
    Write-Host ""
    Write-Host "Server URL saved. You can now run:" -ForegroundColor Green
    Write-Host "  dashboard.bat" -ForegroundColor Cyan
}
