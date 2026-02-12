#!/bin/bash
# Export Claude Code Setup Script
# Last Modified: 2026-02-07
#
# Exports all Claude Code configuration, agents, commands, skills,
# pipeline infrastructure, and monitoring scripts for transfer to another machine.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EXPORT_DIR="${1:-$HOME/claude-export}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="claude-export-${TIMESTAMP}.tar.gz"
CLAUDE_HOME="$HOME/.claude"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Claude Code Setup Export Tool          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Create export directory
echo -e "${YELLOW}Creating export directory: ${EXPORT_DIR}${NC}"
rm -rf "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR"/{global,project}

# ============================================
# GLOBAL CLAUDE CONFIG (~/.claude/)
# ============================================
echo -e "\n${GREEN}[1/5] Exporting global Claude config...${NC}"

# Agents
if [ -d "$CLAUDE_HOME/agents" ]; then
    cp -r "$CLAUDE_HOME/agents" "$EXPORT_DIR/global/"
    AGENT_COUNT=$(ls -1 "$CLAUDE_HOME/agents"/*.md 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  ✓ Agents: ${AGENT_COUNT} files"
else
    echo -e "  ${YELLOW}⚠ No agents directory found${NC}"
fi

# Commands (slash commands)
if [ -d "$CLAUDE_HOME/commands" ]; then
    cp -r "$CLAUDE_HOME/commands" "$EXPORT_DIR/global/"
    CMD_COUNT=$(ls -1 "$CLAUDE_HOME/commands"/*.md 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  ✓ Commands: ${CMD_COUNT} files"
else
    echo -e "  ${YELLOW}⚠ No commands directory found${NC}"
fi

# Skills
if [ -d "$CLAUDE_HOME/skills" ]; then
    cp -r "$CLAUDE_HOME/skills" "$EXPORT_DIR/global/"
    SKILL_COUNT=$(ls -1 "$CLAUDE_HOME/skills"/*.md 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  ✓ Skills: ${SKILL_COUNT} files"
else
    echo -e "  ${YELLOW}⚠ No skills directory found${NC}"
fi

# Settings
if [ -f "$CLAUDE_HOME/settings.json" ]; then
    cp "$CLAUDE_HOME/settings.json" "$EXPORT_DIR/global/"
    echo -e "  ✓ settings.json"
else
    echo -e "  ${YELLOW}⚠ No settings.json found${NC}"
fi

# Global CLAUDE.md
if [ -f "$CLAUDE_HOME/CLAUDE.md" ]; then
    cp "$CLAUDE_HOME/CLAUDE.md" "$EXPORT_DIR/global/"
    echo -e "  ✓ CLAUDE.md (global instructions)"
else
    echo -e "  ${YELLOW}⚠ No global CLAUDE.md found${NC}"
fi

# Plugins config
if [ -f "$CLAUDE_HOME/plugins/installed_plugins.json" ]; then
    mkdir -p "$EXPORT_DIR/global/plugins"
    cp "$CLAUDE_HOME/plugins/installed_plugins.json" "$EXPORT_DIR/global/plugins/"
    echo -e "  ✓ plugins/installed_plugins.json"
fi

# ============================================
# PROJECT-SPECIFIC FILES
# ============================================
echo -e "\n${GREEN}[2/5] Exporting project configuration...${NC}"

# Project CLAUDE.md
if [ -f "$PROJECT_DIR/CLAUDE.md" ]; then
    cp "$PROJECT_DIR/CLAUDE.md" "$EXPORT_DIR/project/"
    echo -e "  ✓ Project CLAUDE.md"
fi

# Project .claude directory
if [ -d "$PROJECT_DIR/.claude" ]; then
    cp -r "$PROJECT_DIR/.claude" "$EXPORT_DIR/project/"
    echo -e "  ✓ Project .claude/ directory"
fi

# ============================================
# PIPELINE INFRASTRUCTURE
# ============================================
echo -e "\n${GREEN}[3/5] Exporting pipeline infrastructure...${NC}"

# Claude pipelines (orchestrator, templates, etc.)
if [ -d "$PROJECT_DIR/claude-pipelines" ]; then
    mkdir -p "$EXPORT_DIR/project/claude-pipelines"
    # Copy Python scripts
    cp "$PROJECT_DIR/claude-pipelines"/*.py "$EXPORT_DIR/project/claude-pipelines/" 2>/dev/null || true
    # Copy templates
    if [ -d "$PROJECT_DIR/claude-pipelines/templates" ]; then
        cp -r "$PROJECT_DIR/claude-pipelines/templates" "$EXPORT_DIR/project/claude-pipelines/"
    fi
    # Copy docs
    if [ -d "$PROJECT_DIR/claude-pipelines/docs" ]; then
        cp -r "$PROJECT_DIR/claude-pipelines/docs" "$EXPORT_DIR/project/claude-pipelines/"
    fi
    # Copy daemon
    if [ -d "$PROJECT_DIR/claude-pipelines/daemon" ]; then
        cp -r "$PROJECT_DIR/claude-pipelines/daemon" "$EXPORT_DIR/project/claude-pipelines/"
    fi
    echo -e "  ✓ claude-pipelines/ (orchestrator, templates, daemon)"
fi

# ============================================
# MONITORING & UTILITY SCRIPTS
# ============================================
echo -e "\n${GREEN}[4/5] Exporting monitoring scripts...${NC}"

if [ -d "$PROJECT_DIR/scripts" ]; then
    mkdir -p "$EXPORT_DIR/project/scripts"
    # Copy shell scripts
    cp "$PROJECT_DIR/scripts"/*.sh "$EXPORT_DIR/project/scripts/" 2>/dev/null || true
    # Copy Python scripts
    cp "$PROJECT_DIR/scripts"/*.py "$EXPORT_DIR/project/scripts/" 2>/dev/null || true
    # Copy config files
    cp "$PROJECT_DIR/scripts"/*.yaml "$EXPORT_DIR/project/scripts/" 2>/dev/null || true
    cp "$PROJECT_DIR/scripts"/*.js "$EXPORT_DIR/project/scripts/" 2>/dev/null || true

    SCRIPT_COUNT=$(ls -1 "$EXPORT_DIR/project/scripts"/*.sh 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  ✓ scripts/ (${SCRIPT_COUNT} shell scripts + Python utilities)"
fi

# ============================================
# SAMPLE PIPELINE CONFIGS (optional)
# ============================================
# Copy sample pipeline YAML configs (not execution logs)
if [ -d "$PROJECT_DIR/pipelines-execution" ]; then
    mkdir -p "$EXPORT_DIR/project/pipelines-execution-samples"
    # Only copy YAML configs, not logs
    cp "$PROJECT_DIR/pipelines-execution"/*.yaml "$EXPORT_DIR/project/pipelines-execution-samples/" 2>/dev/null || true
    YAML_COUNT=$(ls -1 "$EXPORT_DIR/project/pipelines-execution-samples"/*.yaml 2>/dev/null | wc -l | tr -d ' ')
    if [ "$YAML_COUNT" -gt 0 ]; then
        echo -e "  ✓ Pipeline YAML samples: ${YAML_COUNT} configs"
    fi
fi

# ============================================
# CREATE IMPORT SCRIPT
# ============================================
echo -e "\n${GREEN}[5/5] Creating import script...${NC}"

cat > "$EXPORT_DIR/import-claude-setup.sh" << 'IMPORT_SCRIPT'
#!/bin/bash
# Import Claude Code Setup Script
# Run this on the target machine to restore Claude Code configuration
# Last Modified: 2026-02-07

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_HOME="$HOME/.claude"
TARGET_PROJECT="${1:-.}"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Claude Code Setup Import Tool          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if Claude Code is installed
if ! command -v claude &> /dev/null; then
    echo -e "${RED}Error: Claude Code CLI not found. Please install it first:${NC}"
    echo -e "  npm install -g @anthropic-ai/claude-code"
    exit 1
fi

echo -e "${YELLOW}Target project directory: $(realpath "$TARGET_PROJECT")${NC}"
echo ""

# ============================================
# RESTORE GLOBAL CONFIG
# ============================================
echo -e "${GREEN}[1/4] Restoring global Claude config...${NC}"

mkdir -p "$CLAUDE_HOME"/{agents,commands,skills,plugins}

if [ -d "$SCRIPT_DIR/global/agents" ]; then
    cp -r "$SCRIPT_DIR/global/agents"/* "$CLAUDE_HOME/agents/" 2>/dev/null || true
    echo -e "  ✓ Agents restored"
fi

if [ -d "$SCRIPT_DIR/global/commands" ]; then
    cp -r "$SCRIPT_DIR/global/commands"/* "$CLAUDE_HOME/commands/" 2>/dev/null || true
    echo -e "  ✓ Commands restored"
fi

if [ -d "$SCRIPT_DIR/global/skills" ]; then
    cp -r "$SCRIPT_DIR/global/skills"/* "$CLAUDE_HOME/skills/" 2>/dev/null || true
    echo -e "  ✓ Skills restored"
fi

if [ -f "$SCRIPT_DIR/global/settings.json" ]; then
    # Backup existing settings if present
    if [ -f "$CLAUDE_HOME/settings.json" ]; then
        cp "$CLAUDE_HOME/settings.json" "$CLAUDE_HOME/settings.json.backup"
        echo -e "  ${YELLOW}⚠ Existing settings.json backed up${NC}"
    fi
    cp "$SCRIPT_DIR/global/settings.json" "$CLAUDE_HOME/"
    echo -e "  ✓ settings.json restored"
fi

if [ -f "$SCRIPT_DIR/global/CLAUDE.md" ]; then
    if [ -f "$CLAUDE_HOME/CLAUDE.md" ]; then
        cp "$CLAUDE_HOME/CLAUDE.md" "$CLAUDE_HOME/CLAUDE.md.backup"
        echo -e "  ${YELLOW}⚠ Existing CLAUDE.md backed up${NC}"
    fi
    cp "$SCRIPT_DIR/global/CLAUDE.md" "$CLAUDE_HOME/"
    echo -e "  ✓ CLAUDE.md restored"
fi

if [ -f "$SCRIPT_DIR/global/plugins/installed_plugins.json" ]; then
    cp "$SCRIPT_DIR/global/plugins/installed_plugins.json" "$CLAUDE_HOME/plugins/"
    echo -e "  ✓ Plugins config restored"
fi

# ============================================
# RESTORE PROJECT CONFIG
# ============================================
echo -e "\n${GREEN}[2/4] Restoring project configuration...${NC}"

if [ -f "$SCRIPT_DIR/project/CLAUDE.md" ]; then
    cp "$SCRIPT_DIR/project/CLAUDE.md" "$TARGET_PROJECT/"
    echo -e "  ✓ Project CLAUDE.md"
fi

if [ -d "$SCRIPT_DIR/project/.claude" ]; then
    cp -r "$SCRIPT_DIR/project/.claude" "$TARGET_PROJECT/"
    echo -e "  ✓ Project .claude/ directory"
fi

# ============================================
# RESTORE PIPELINE INFRASTRUCTURE
# ============================================
echo -e "\n${GREEN}[3/4] Restoring pipeline infrastructure...${NC}"

if [ -d "$SCRIPT_DIR/project/claude-pipelines" ]; then
    mkdir -p "$TARGET_PROJECT/claude-pipelines"
    cp -r "$SCRIPT_DIR/project/claude-pipelines"/* "$TARGET_PROJECT/claude-pipelines/"
    chmod +x "$TARGET_PROJECT/claude-pipelines"/*.py 2>/dev/null || true
    echo -e "  ✓ claude-pipelines/"
fi

if [ -d "$SCRIPT_DIR/project/scripts" ]; then
    mkdir -p "$TARGET_PROJECT/scripts"
    cp -r "$SCRIPT_DIR/project/scripts"/* "$TARGET_PROJECT/scripts/"
    chmod +x "$TARGET_PROJECT/scripts"/*.sh 2>/dev/null || true
    chmod +x "$TARGET_PROJECT/scripts"/*.py 2>/dev/null || true
    echo -e "  ✓ scripts/"
fi

if [ -d "$SCRIPT_DIR/project/pipelines-execution-samples" ]; then
    mkdir -p "$TARGET_PROJECT/pipelines-execution"
    cp "$SCRIPT_DIR/project/pipelines-execution-samples"/*.yaml "$TARGET_PROJECT/pipelines-execution/" 2>/dev/null || true
    echo -e "  ✓ Pipeline YAML samples"
fi

# ============================================
# POST-IMPORT STEPS
# ============================================
echo -e "\n${GREEN}[4/4] Post-import steps...${NC}"

# Check for plugins that need reinstalling
if [ -f "$SCRIPT_DIR/global/plugins/installed_plugins.json" ]; then
    echo -e "\n${YELLOW}Plugins may need to be reinstalled:${NC}"
    cat "$SCRIPT_DIR/global/plugins/installed_plugins.json"
    echo -e "\n${YELLOW}Run: claude plugins install <plugin-name>${NC}"
fi

echo -e "\n${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}Import complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Reinstall any plugins listed above"
echo -e "  2. Verify MCP servers work (may need npx/npm installed)"
echo -e "  3. Run 'claude' to test the setup"
echo ""
IMPORT_SCRIPT

chmod +x "$EXPORT_DIR/import-claude-setup.sh"
echo -e "  ✓ import-claude-setup.sh created"

# ============================================
# CREATE ARCHIVE
# ============================================
echo -e "\n${GREEN}Creating archive...${NC}"
cd "$(dirname "$EXPORT_DIR")"
tar -czvf "$ARCHIVE_NAME" "$(basename "$EXPORT_DIR")" > /dev/null 2>&1
ARCHIVE_PATH="$(dirname "$EXPORT_DIR")/$ARCHIVE_NAME"
ARCHIVE_SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)

echo -e "\n${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}Export complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "Export directory: ${BLUE}$EXPORT_DIR${NC}"
echo -e "Archive created:  ${BLUE}$ARCHIVE_PATH${NC}"
echo -e "Archive size:     ${BLUE}$ARCHIVE_SIZE${NC}"
echo ""
echo -e "To transfer to another machine:"
echo -e "  1. Copy ${YELLOW}$ARCHIVE_NAME${NC} to the target machine"
echo -e "  2. Extract: ${YELLOW}tar -xzvf $ARCHIVE_NAME${NC}"
echo -e "  3. Run: ${YELLOW}cd claude-export && ./import-claude-setup.sh /path/to/project${NC}"
echo ""

# Summary
echo -e "${BLUE}Export Summary:${NC}"
echo -e "  Global config:"
find "$EXPORT_DIR/global" -type f 2>/dev/null | wc -l | xargs -I {} echo "    {} files"
echo -e "  Project files:"
find "$EXPORT_DIR/project" -type f 2>/dev/null | wc -l | xargs -I {} echo "    {} files"
