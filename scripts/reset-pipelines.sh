#!/usr/bin/env bash
# =============================================================================
# Pipeline Reset Script
# =============================================================================
# Resets pipeline state, kills running processes, and clears request files.
#
# Usage:
#   ./scripts/reset-pipelines.sh              # Reset all epics (2-5)
#   ./scripts/reset-pipelines.sh --epics "2,3" # Reset specific epics
#   ./scripts/reset-pipelines.sh --all        # Reset everything including epic 1
#   ./scripts/reset-pipelines.sh --dry-run    # Show what would be reset
#
# Created: 2026-01-18
# =============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( dirname "$SCRIPT_DIR" )"
PIPELINES_DIR="$PROJECT_DIR/pipelines-execution"
DOCS_DIR="$PROJECT_DIR/docs"

# Default values
EPICS="2,3,4,5"
DRY_RUN=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --epics)
            EPICS="$2"
            shift 2
            ;;
        --all)
            EPICS="1,2,3,4,5"
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            head -15 "$0" | tail -12
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

EPIC_LIST=$(echo "$EPICS" | tr ',' ' ')

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Pipeline Reset${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Epics to reset: ${YELLOW}${EPICS}${NC}"
echo -e "Dry run: ${YELLOW}${DRY_RUN}${NC}"
echo ""

# Step 1: Kill running processes
echo -e "${YELLOW}Step 1: Killing running processes...${NC}"
if [[ "$DRY_RUN" == "false" ]]; then
    pkill -f "pipeline_orchestrator" 2>/dev/null && echo "  Killed pipeline_orchestrator" || echo "  No pipeline_orchestrator running"
    pkill -f "claude.*-p" 2>/dev/null && echo "  Killed claude agents" || echo "  No claude agents running"
else
    echo "  [DRY-RUN] Would kill pipeline_orchestrator and claude agents"
fi

# Step 2: Remove state files
echo ""
echo -e "${YELLOW}Step 2: Removing state files...${NC}"
for epic in $EPIC_LIST; do
    state_pattern="$PIPELINES_DIR/pipeline-l10n-epic${epic}-*-state.json"
    for state_file in $state_pattern; do
        if [[ -f "$state_file" ]]; then
            if [[ "$DRY_RUN" == "false" ]]; then
                rm -f "$state_file"
                echo -e "  ${GREEN}Removed:${NC} $(basename $state_file)"
            else
                echo "  [DRY-RUN] Would remove: $(basename $state_file)"
            fi
        fi
    done
done

# Step 3: Remove parallel configs
echo ""
echo -e "${YELLOW}Step 3: Removing parallel configs...${NC}"
for epic in $EPIC_LIST; do
    parallel_pattern="$PIPELINES_DIR/parallel-pipeline-l10n-epic${epic}-*.yaml"
    for parallel_file in $parallel_pattern; do
        if [[ -f "$parallel_file" ]]; then
            if [[ "$DRY_RUN" == "false" ]]; then
                rm -f "$parallel_file"
                echo -e "  ${GREEN}Removed:${NC} $(basename $parallel_file)"
            else
                echo "  [DRY-RUN] Would remove: $(basename $parallel_file)"
            fi
        fi
    done
done

# Step 4: Reset request files
echo ""
echo -e "${YELLOW}Step 4: Resetting request files...${NC}"
for epic in $EPIC_LIST; do
    request_file="$DOCS_DIR/gen_requests_epic${epic}.md"
    if [[ "$DRY_RUN" == "false" ]]; then
        cat > "$request_file" << EOF
# Generated Requests - Epic ${epic}

This file contains auto-generated feature requests for L10N Epic ${epic}.

---

EOF
        echo -e "  ${GREEN}Reset:${NC} gen_requests_epic${epic}.md"
    else
        echo "  [DRY-RUN] Would reset: gen_requests_epic${epic}.md"
    fi
done

# Step 5: Clear log files (optional)
echo ""
echo -e "${YELLOW}Step 5: Clearing log files...${NC}"
for epic in $EPIC_LIST; do
    log_pattern="$PIPELINES_DIR/*epic${epic}*.log"
    for log_file in $log_pattern; do
        if [[ -f "$log_file" ]]; then
            if [[ "$DRY_RUN" == "false" ]]; then
                > "$log_file"  # Truncate instead of delete
                echo -e "  ${GREEN}Cleared:${NC} $(basename $log_file)"
            else
                echo "  [DRY-RUN] Would clear: $(basename $log_file)"
            fi
        fi
    done
done

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Reset complete!${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Run pipelines with:"
echo -e "  ${GREEN}./scripts/run-epics.sh --parallel --epics \"$EPICS\" --stages \"request,overview\"${NC}"
