#!/bin/bash
# =============================================================================
# GitHub Repository Project Board Setup Script
# =============================================================================
# Creates a repository-level GitHub Project with standard Agile columns,
# custom fields, and labels for tracking Epics, Stories, and Tasks.
#
# Usage:
#   ./scripts/setup-github-project.sh [REPO_OWNER/REPO_NAME] [PROJECT_TITLE]
#
# Examples:
#   ./scripts/setup-github-project.sh                    # Uses git remote origin
#   ./scripts/setup-github-project.sh sinscrit/faqbnb-qr-system "FAQBNB Development"
#
# Prerequisites:
#   - gh CLI installed and authenticated
#   - Project scope: gh auth refresh -s read:project -s project
#
# Created: 2026-01-05
# =============================================================================

set -e

# =============================================================================
# Configuration
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_PROJECT_TITLE="Development Board"

# Status columns for the board
STATUS_OPTIONS="Backlog,Ready,In Progress,Review,Done,Cancelled"

# Priority options
PRIORITY_OPTIONS="P0-Critical,P1-High,P2-Medium,P3-Low"

# Type options
TYPE_OPTIONS="Epic,Story,Task,Bug,Spike"

# Labels to create (name:description:color)
LABELS=(
    "epic:Large feature spanning multiple stories:8B5CF6"
    "story:User story (REQ-XXX):3B82F6"
    "task:Implementation task:10B981"
    "bug:Something isn't working:EF4444"
    "spike:Research or investigation:F59E0B"
    "blocked:Blocked by dependency:DC2626"
    "ready:Ready for development:22C55E"
    "in-progress:Currently being worked on:F59E0B"
    "needs-review:Awaiting code review:8B5CF6"
    "cancelled:Will not be implemented:6B7280"
)

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_gh_auth() {
    log_info "Checking GitHub CLI authentication..."
    if ! gh auth status &>/dev/null; then
        log_error "GitHub CLI not authenticated. Run: gh auth login"
        exit 1
    fi

    # Check for project scope
    if ! gh project list --owner "$(echo $REPO | cut -d'/' -f1)" &>/dev/null 2>&1; then
        log_error "Missing project scope. Run: gh auth refresh -s read:project -s project"
        exit 1
    fi

    log_success "GitHub CLI authenticated with project scope"
}

get_repo_from_remote() {
    local remote_url
    remote_url=$(git remote get-url origin 2>/dev/null || echo "")

    if [[ -z "$remote_url" ]]; then
        log_error "No git remote 'origin' found. Please specify REPO_OWNER/REPO_NAME"
        exit 1
    fi

    # Extract owner/repo from URL (handles both HTTPS and SSH)
    echo "$remote_url" | sed -E 's|.*github\.com[:/]([^/]+)/([^/.]+)(\.git)?$|\1/\2|'
}

# =============================================================================
# Main Setup Functions
# =============================================================================

create_labels() {
    log_info "Creating labels in repository..."

    for label_def in "${LABELS[@]}"; do
        IFS=':' read -r name description color <<< "$label_def"

        if gh label create "$name" \
            --description "$description" \
            --color "$color" \
            --repo "$REPO" 2>/dev/null; then
            log_success "Created label: $name"
        else
            log_warning "Label '$name' already exists or failed to create"
        fi
    done
}

create_project() {
    log_info "Creating repository-level project: $PROJECT_TITLE"

    # Create the project
    PROJECT_URL=$(gh project create \
        --owner "$REPO_OWNER" \
        --title "$PROJECT_TITLE" \
        --format json 2>/dev/null | jq -r '.url // empty')

    if [[ -z "$PROJECT_URL" ]]; then
        log_error "Failed to create project"
        exit 1
    fi

    # Get the project number
    PROJECT_NUMBER=$(gh project list --owner "$REPO_OWNER" --format json | \
        jq -r --arg title "$PROJECT_TITLE" '.projects[] | select(.title == $title) | .number')

    log_success "Created project #$PROJECT_NUMBER: $PROJECT_URL"
}

configure_status_field() {
    log_info "Configuring Status field with columns..."

    # Get the Status field ID
    STATUS_FIELD_ID=$(gh project field-list "$PROJECT_NUMBER" --owner "$REPO_OWNER" --format json | \
        jq -r '.fields[] | select(.name == "Status") | .id')

    if [[ -z "$STATUS_FIELD_ID" ]]; then
        log_error "Could not find Status field"
        return 1
    fi

    # Note: gh CLI doesn't support modifying existing single-select options directly
    # The Status field comes with default options (Todo, In Progress, Done)
    # We'll need to use the GitHub API or web UI to customize these

    log_warning "Status field options must be customized via GitHub web UI:"
    log_info "  1. Go to: $PROJECT_URL/settings"
    log_info "  2. Click 'Status' field"
    log_info "  3. Add/modify options: $STATUS_OPTIONS"
}

add_custom_fields() {
    log_info "Adding custom fields to project..."

    # Story Points (number)
    if gh project field-create "$PROJECT_NUMBER" \
        --owner "$REPO_OWNER" \
        --name "Story Points" \
        --data-type NUMBER 2>/dev/null; then
        log_success "Created field: Story Points"
    else
        log_warning "Field 'Story Points' may already exist"
    fi

    # Priority (single select)
    if gh project field-create "$PROJECT_NUMBER" \
        --owner "$REPO_OWNER" \
        --name "Priority" \
        --data-type SINGLE_SELECT \
        --single-select-options "$PRIORITY_OPTIONS" 2>/dev/null; then
        log_success "Created field: Priority"
    else
        log_warning "Field 'Priority' may already exist"
    fi

    # Type (single select)
    if gh project field-create "$PROJECT_NUMBER" \
        --owner "$REPO_OWNER" \
        --name "Type" \
        --data-type SINGLE_SELECT \
        --single-select-options "$TYPE_OPTIONS" 2>/dev/null; then
        log_success "Created field: Type"
    else
        log_warning "Field 'Type' may already exist"
    fi

    # Sprint/Iteration (iteration - optional)
    # gh project field-create "$PROJECT_NUMBER" \
    #     --owner "$REPO_OWNER" \
    #     --name "Sprint" \
    #     --data-type ITERATION 2>/dev/null

    # PRD Reference (text)
    if gh project field-create "$PROJECT_NUMBER" \
        --owner "$REPO_OWNER" \
        --name "PRD Reference" \
        --data-type TEXT 2>/dev/null; then
        log_success "Created field: PRD Reference"
    else
        log_warning "Field 'PRD Reference' may already exist"
    fi
}

link_repo_to_project() {
    log_info "Linking repository to project..."

    # Note: Repository linking is automatic when you add issues from that repo
    # There's no explicit "link" command in gh CLI

    log_info "Repository will be linked when issues are added to the project"
}

print_summary() {
    echo ""
    echo "============================================================================="
    echo -e "${GREEN}GitHub Project Setup Complete!${NC}"
    echo "============================================================================="
    echo ""
    echo "Project URL: $PROJECT_URL"
    echo "Project #:   $PROJECT_NUMBER"
    echo "Repository:  $REPO"
    echo ""
    echo "Custom Fields Created:"
    echo "  - Story Points (number)"
    echo "  - Priority (P0-Critical, P1-High, P2-Medium, P3-Low)"
    echo "  - Type (Epic, Story, Task, Bug, Spike)"
    echo "  - PRD Reference (text)"
    echo ""
    echo "Labels Created:"
    for label_def in "${LABELS[@]}"; do
        IFS=':' read -r name description color <<< "$label_def"
        echo "  - $name: $description"
    done
    echo ""
    echo -e "${YELLOW}IMPORTANT: Manual Step Required${NC}"
    echo "The Status field columns must be configured via the web UI:"
    echo "  1. Open: $PROJECT_URL/settings"
    echo "  2. Click the 'Status' field"
    echo "  3. Rename/add options to match: $STATUS_OPTIONS"
    echo ""
    echo "============================================================================="
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    echo "============================================================================="
    echo "GitHub Repository Project Board Setup"
    echo "============================================================================="
    echo ""

    # Parse arguments
    if [[ -n "$1" ]]; then
        REPO="$1"
    else
        REPO=$(get_repo_from_remote)
    fi

    REPO_OWNER=$(echo "$REPO" | cut -d'/' -f1)
    REPO_NAME=$(echo "$REPO" | cut -d'/' -f2)
    PROJECT_TITLE="${2:-$REPO_NAME Development}"

    log_info "Repository: $REPO"
    log_info "Project Title: $PROJECT_TITLE"
    echo ""

    # Verify authentication
    check_gh_auth
    echo ""

    # Create labels
    create_labels
    echo ""

    # Create project
    create_project
    echo ""

    # Add custom fields
    add_custom_fields
    echo ""

    # Configure status (manual step needed)
    configure_status_field
    echo ""

    # Print summary
    print_summary
}

# Run main function
main "$@"
