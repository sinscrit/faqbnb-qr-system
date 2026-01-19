#!/bin/bash
# =============================================================================
# Pipeline Dashboard - Linux/macOS Installation Script
# =============================================================================
# Installs dependencies and sets up the remote dashboard client.
#
# Usage: ./install.sh [--server URL]
#
# Created: 2026-01-18
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Pipeline Dashboard - Remote Client Installer        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check Python
echo -e "${YELLOW}Checking Python installation...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
    echo -e "  ${GREEN}✓${NC} Found: $PYTHON_VERSION"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
    echo -e "  ${GREEN}✓${NC} Found: $PYTHON_VERSION"
else
    echo -e "  ${RED}✗${NC} Python not found!"
    echo ""
    echo "Please install Python 3.7 or later:"
    echo "  - macOS: brew install python3"
    echo "  - Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "  - Fedora: sudo dnf install python3 python3-pip"
    exit 1
fi

# Check pip
echo -e "${YELLOW}Checking pip installation...${NC}"
if $PYTHON_CMD -m pip --version &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} pip is available"
else
    echo -e "  ${YELLOW}!${NC} pip not found, attempting to install..."
    $PYTHON_CMD -m ensurepip --default-pip 2>/dev/null || {
        echo -e "  ${RED}✗${NC} Could not install pip"
        echo "Please install pip manually:"
        echo "  curl https://bootstrap.pypa.io/get-pip.py | $PYTHON_CMD"
        exit 1
    }
fi

# Install dependencies
echo ""
echo -e "${YELLOW}Installing Python dependencies...${NC}"
$PYTHON_CMD -m pip install --user --quiet rich pyyaml 2>/dev/null || \
$PYTHON_CMD -m pip install --quiet rich pyyaml || {
    echo -e "  ${RED}✗${NC} Failed to install dependencies"
    exit 1
}
echo -e "  ${GREEN}✓${NC} rich installed"
echo -e "  ${GREEN}✓${NC} pyyaml installed"

# Make scripts executable
echo ""
echo -e "${YELLOW}Setting up scripts...${NC}"
chmod +x "$SCRIPT_DIR/dashboard.sh" 2>/dev/null || true
chmod +x "$SCRIPT_DIR/pipeline-dashboard.py" 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Scripts are executable"

# Create config file template
CONFIG_FILE="$SCRIPT_DIR/.dashboard-config"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "# Pipeline Dashboard Configuration" > "$CONFIG_FILE"
    echo "# Uncomment and set your server URL:" >> "$CONFIG_FILE"
    echo "# REMOTE_URL=http://192.168.1.4:8080/" >> "$CONFIG_FILE"
    echo -e "  ${GREEN}✓${NC} Created config template: .dashboard-config"
fi

# Test import
echo ""
echo -e "${YELLOW}Testing installation...${NC}"
if $PYTHON_CMD -c "from rich.console import Console; print('  ✓ rich module OK')" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} All modules loaded successfully"
else
    echo -e "  ${RED}✗${NC} Module test failed"
    exit 1
fi

# Done
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Installation Complete!                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Usage:"
echo -e "  ${BLUE}./dashboard.sh --remote http://SERVER_IP:8080/${NC}"
echo ""
echo "Or edit .dashboard-config to set a default server URL."
echo ""

# Prompt for server URL
read -p "Enter WebDAV server URL (or press Enter to skip): " SERVER_URL
if [ -n "$SERVER_URL" ]; then
    echo "REMOTE_URL=$SERVER_URL" > "$CONFIG_FILE"
    echo ""
    echo -e "${GREEN}Server URL saved. You can now run:${NC}"
    echo -e "  ${BLUE}./dashboard.sh${NC}"
fi
