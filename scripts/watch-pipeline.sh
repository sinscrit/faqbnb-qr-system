#!/bin/bash
# watch-pipeline.sh - Real-time pipeline activity monitor
# Last Modified: 2026-01-23
#
# Shows what agents are doing during pipeline execution:
# - Agent log output (real-time)
# - File changes in docs/
# - Current processing task
#
# Usage:
#   ./scripts/watch-pipeline.sh                    # Watch all epics
#   ./scripts/watch-pipeline.sh --epic 4           # Watch specific epic
#   ./scripts/watch-pipeline.sh --task 3.1         # Watch specific task

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m'
BOLD='\033[1m'

EPIC=""
TASK=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --epic|-e)
            EPIC="$2"
            shift 2
            ;;
        --task|-t)
            TASK="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --epic, -e NUM    Watch specific epic (1-5)"
            echo "  --task, -t ID     Watch specific task (e.g., 3.1)"
            echo "  --help, -h        Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Determine which state files to watch
if [ -n "$EPIC" ]; then
    STATE_PATTERN="pipeline-l10n-epic${EPIC}-*-state.json"
else
    STATE_PATTERN="pipeline-l10n-epic*-state.json"
fi

# Function to get current processing task
get_processing_task() {
    for state_file in pipelines-execution/$STATE_PATTERN; do
        if [ -f "$state_file" ]; then
            result=$(cat "$state_file" 2>/dev/null | jq -r '.tasks[] | select(.status == "processing") | "\(.id) | \(.request_id) | \(.title)"' 2>/dev/null | head -1)
            if [ -n "$result" ]; then
                epic_name=$(basename "$state_file" | sed 's/pipeline-l10n-//' | sed 's/-state.json//')
                echo "$epic_name: $result"
            fi
        fi
    done
}

# Function to find latest agent log
get_latest_log() {
    if [ -n "$TASK" ]; then
        ls -t pipelines-execution/agent-output-${TASK}-*.log 2>/dev/null | head -1
    else
        ls -t pipelines-execution/agent-output-*.log 2>/dev/null | head -1
    fi
}


# Track last log file and position
LAST_LOG=""
LAST_LOG_SIZE=0

while true; do
    # Clear screen completely before redrawing (prevents overwrite artifacts)
    clear

    # Header
    echo -e "${BOLD}${BLUE}============================================================${NC}"
    echo -e "${BOLD}${BLUE}PIPELINE ACTIVITY MONITOR${NC}  ${GRAY}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${BOLD}${BLUE}============================================================${NC}"

    if [ -n "$EPIC" ]; then
        echo -e "${YELLOW}Watching: Epic $EPIC${NC}  ${GRAY}(Ctrl+C to exit)${NC}"
    elif [ -n "$TASK" ]; then
        echo -e "${YELLOW}Watching: Task $TASK${NC}  ${GRAY}(Ctrl+C to exit)${NC}"
    else
        echo -e "${YELLOW}Watching: All epics${NC}  ${GRAY}(Ctrl+C to exit)${NC}"
    fi
    echo ""

    # Show current processing task
    echo -e "${BOLD}${GREEN}▶ CURRENTLY PROCESSING:${NC}"
    processing=$(get_processing_task)
    if [ -n "$processing" ]; then
        echo -e "  ${YELLOW}$processing${NC}"
    else
        echo -e "  ${GRAY}(no tasks currently processing)${NC}"
    fi
    echo ""

    # Find latest log
    CURRENT_LOG=$(get_latest_log)

    if [ -n "$CURRENT_LOG" ] && [ -f "$CURRENT_LOG" ]; then
        # Check if log changed
        CURRENT_SIZE=$(wc -c < "$CURRENT_LOG" 2>/dev/null || echo 0)

        if [ "$CURRENT_LOG" != "$LAST_LOG" ]; then
            # New log file
            LAST_LOG="$CURRENT_LOG"
            LAST_LOG_SIZE=0
        fi

        echo -e "${BOLD}${CYAN}▶ AGENT LOG: $(basename $CURRENT_LOG)${NC}"
        echo -e "${GRAY}────────────────────────────────────────────────────────────${NC}"

        # Show last 30 lines of the log file
        tail -30 "$CURRENT_LOG" 2>/dev/null

        echo -e "${GRAY}────────────────────────────────────────────────────────────${NC}"
        LAST_LOG_SIZE=$CURRENT_SIZE
    else
        echo -e "${BOLD}${CYAN}▶ AGENT LOG:${NC}"
        echo -e "  ${GRAY}(waiting for agent activity...)${NC}"
    fi
    echo ""

    # Show recent doc changes
    echo -e "${CYAN}Recent doc changes:${NC}"
    ls -lt docs/REQ-*.md 2>/dev/null | head -5 | while read line; do
        echo -e "  ${GRAY}$line${NC}"
    done

    sleep 2
done
