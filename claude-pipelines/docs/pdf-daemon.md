# PDF Pipeline Daemon

*Created: 2026-01-11*
*Last Modified: 2026-01-19*

Automated daemon for processing PDF documents into implemented code through the agent pipeline.

## Table of Contents

- [Overview](#overview)
- [Workflow](#workflow)
- [Installation](#installation)
- [Configuration](#configuration)
- [CLI Reference](#cli-reference)
- [Daemon Stages](#daemon-stages)
- [Agent 00: Implementation Planner](#agent-00-implementation-planner)
- [Agent 00b: Pipeline Creator](#agent-00b-pipeline-creator)
- [Route Tracing](#route-tracing)
- [State Management](#state-management)
- [PDF Naming Convention](#pdf-naming-convention)
- [Troubleshooting](#troubleshooting)

---

## Overview

The PDF Pipeline Daemon monitors an inbox directory for PDF files and processes them through a complete automation pipeline:

```
PDF (PRD) → Extract → Agent 00 → Agent 00b → Orchestrator → Implemented Code
```

### Key Features

- **Inbox Monitoring**: Watches configured directory for new PDFs
- **PDF Validation**: Enforces naming convention and project codes
- **Holistic Processing**: Treats each PDF as a single PRD document
- **Route Tracing**: Maps PRD routes to actual components before planning
- **Resumable**: Saves state at each stage for crash recovery
- **Configurable Depth**: Can stop at any stage (extract, parse, plan, full)

---

## Workflow

### Complete Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PDF PIPELINE DAEMON                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Stage 1: PDF Extraction                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  pdf_extractor.py (pdfplumber)                                   │   │
│  │  Input: CPL-FAQBNB-feature-123.pdf                              │   │
│  │  Output: Raw extracted text                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  Stage 2: PRD Creation                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Convert raw text to structured PRD markdown                     │   │
│  │  Output: docs/prd/intake/prd-{name}-{timestamp}.md              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  Stage 3: Route Tracing                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  route_tracer.py                                                 │   │
│  │  Maps routes mentioned in PRD → actual page files → components  │   │
│  │  Output: route_trace.json                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  Stage 4: Agent 00 - Implementation Planner                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Creates global implementation plan with:                        │   │
│  │  - Verified component targets (from route trace)                 │   │
│  │  - Phased task breakdown                                         │   │
│  │  - Dependency analysis                                           │   │
│  │  Output: docs/prd/Plan-{ID}-{name}.md                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  Stage 5: Agent 00b - Pipeline Creator                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Converts implementation plan to pipeline YAML                   │   │
│  │  - Extracts tasks using patterns                                 │   │
│  │  - Defines agent invocation templates                            │   │
│  │  - Sets timeouts and output paths                                │   │
│  │  Output: pipelines-execution/pipeline-{name}.yaml               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  Stage 6: Orchestrator Execution                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  pipeline_orchestrator.py                                        │   │
│  │  Runs 6-stage agent pipeline:                                    │   │
│  │  request → overview → details → impl → testcheck → usecases     │   │
│  │  Output: Implemented code + test harness                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Installation

### Prerequisites

```bash
# Required Python packages
pip install pdfplumber pyyaml

# Claude CLI must be installed and authenticated
claude --version
```

### Directory Setup

The daemon expects this directory structure:

```
project-root/
├── claude-pipelines/
│   ├── daemon/
│   │   ├── pdf_daemon.py
│   │   ├── pdf_extractor.py
│   │   ├── config.py
│   │   ├── state.py
│   │   ├── route_tracer.py
│   │   ├── daemon_config.yaml
│   │   └── state/
│   │       ├── daemon-state.json
│   │       └── jobs/
│   └── inbox/              # Default inbox (configurable)
├── docs/
│   └── prd/
│       └── intake/         # PRD output directory
└── pipelines-execution/    # Generated pipeline YAMLs
```

---

## Configuration

### Configuration File: `daemon_config.yaml`

```yaml
daemon:
  # Directory monitoring
  inbox_dir: /Users/username/Downloads/tailscale  # Where PDFs arrive
  processed_dir: ./claude-pipelines/processed     # Successful PDFs moved here
  failed_dir: ./claude-pipelines/failed           # Failed PDFs moved here
  rejected_dir: ./claude-pipelines/rejected       # Invalid PDFs moved here

  # PDF naming validation
  pdf_prefix: CPL                     # Required prefix
  project_code_length: 6              # Project code must be this length
  approved_projects:                  # Whitelist of project codes
    - FAQBNB

  # Processing control
  pipeline_depth: full                # extract_only | parse_only | plan_only | full
  poll_interval: 30                   # Seconds between inbox checks

  # State management
  log_file: ./claude-pipelines/daemon/logs/daemon.log
  state_file: ./claude-pipelines/daemon/state/daemon-state.json
  pid_file: ./claude-pipelines/daemon/daemon.pid

pdf_extraction:
  library: pdfplumber                 # pdfplumber | pypdf2
  timeout: 30                         # Seconds

parser_skill:
  skill_file: ./claude-pipelines/skills/pdf-request-parser.md
  timeout: 120
  output_dir: ./docs/prd/intake

agents:
  implementation_planner:
    name: "00-implementation-planner"
    timeout: 600
    allowed_tools: "Read,Write,Bash,Glob,Grep,Task,Edit"

  pipeline_creator:
    name: "00b-pipeline-creator"
    timeout: 300
    allowed_tools: "Read,Write,Glob,Grep,Edit"

orchestrator:
  script: ./claude-pipelines/pipeline_orchestrator.py
  default_timeout: 900

notifications:
  on_complete: log                    # none | log | slack | email
  on_failure: log
```

### Pipeline Depth Options

| Depth | Stages Executed | Use Case |
|-------|-----------------|----------|
| `extract_only` | PDF extraction only | Testing extraction |
| `parse_only` | Extract + PRD creation | Manual review before planning |
| `plan_only` | Extract + PRD + Agent 00 | Review plan before YAML generation |
| `full` | All stages including orchestrator | Complete automation |

---

## CLI Reference

### Starting the Daemon

```bash
# Foreground mode (see output in terminal)
python -m claude_pipelines.daemon.pdf_daemon --config daemon_config.yaml

# Background daemon mode
python -m claude_pipelines.daemon.pdf_daemon --config daemon_config.yaml --daemon

# Or from the daemon directory
cd claude-pipelines/daemon
python pdf_daemon.py --config daemon_config.yaml
```

### Daemon Control

```bash
# Check daemon status
python -m claude_pipelines.daemon.pdf_daemon --status

# Stop running daemon
python -m claude_pipelines.daemon.pdf_daemon --stop

# Process single PDF (no daemon, immediate processing)
python -m claude_pipelines.daemon.pdf_daemon --single /path/to/file.pdf
```

### CLI Flags

| Flag | Description |
|------|-------------|
| `--config FILE` | Path to daemon configuration YAML |
| `--daemon` | Run as background daemon |
| `--status` | Show daemon status and exit |
| `--stop` | Stop running daemon |
| `--single FILE` | Process single PDF immediately (no daemon) |
| `--verbose` | Enable debug logging |

---

## Daemon Stages

### Stage: Extracting

```python
job.stage = "extracting"
```

Uses `pdf_extractor.py` with pdfplumber to extract raw text from PDF.

**Output:** Raw text string stored in job state

### Stage: Creating PRD

```python
job.stage = "creating_prd"
```

Converts extracted text to structured PRD markdown.

**Output:** `docs/prd/intake/prd-{PDF_STEM}-{TIMESTAMP}.md`

### Stage: Agent 00

```python
job.stage = "agent_00"
```

Invokes Agent 00 (Implementation Planner) to create global implementation plan.

**Output:** `docs/prd/Plan-{ID}-{name}.md` + `route_trace.json`

### Stage: Agent 00b

```python
job.stage = "agent_00b"
```

Invokes Agent 00b (Pipeline Creator) to generate pipeline YAML.

**Output:** `pipelines-execution/pipeline-{name}.yaml`

### Stage: Orchestrator

```python
job.stage = "orchestrator"
```

Executes the generated pipeline through `pipeline_orchestrator.py`.

**Output:** Implemented code changes

### Stage: Completed / Failed

```python
job.stage = "completed"  # Success
job.stage = "failed"     # Error occurred
```

Final states. Failed jobs with `yaml_path` set can be resumed from orchestrator stage.

---

## Agent 00: Implementation Planner

### Purpose

Creates a comprehensive implementation plan from the PRD, ensuring correct component targeting through route verification.

### Two-Layer Verification

| Layer | Responsibility | Catches |
|-------|----------------|---------|
| **Daemon (Layer 1)** | Route → Page → Component trace | Wrong file paths, missing pages |
| **Agent 00 (Layer 2)** | Semantic verification | Wrong component (similar names, legacy code) |

### Invocation

```bash
claude -p "{prompt}" \
  --allowedTools "Read,Write,Bash,Glob,Grep,Task,Edit" \
  --dangerously-skip-permissions
```

### Output Format

The implementation plan includes:

```markdown
# Implementation Plan: {Feature Name}

## Route-to-Component Verification

### Trace Data
- **PRD Route:** /dashboard2/create
- **Page File:** src/app/dashboard2/create/page.tsx
- **Traced Component:** ItemCreationWorkflow

### Semantic Verification
- **PRD says:** "Step X of 10"
- **Component has:** WORKFLOW_STEPS with 10 entries ✓
- **Match:** CONFIRMED

## Phase 1: {Phase Name}

- [ ] **Task 1.1:** {Task title}
  {Task description}

- [ ] **Task 1.2:** {Task title}
  {Task description}

## Phase 2: {Phase Name}
...
```

### Anti-Rationalization Rules

Agent 00 must follow strict rules to prevent targeting wrong components:

| Forbidden Conclusion | Why It's Wrong |
|----------------------|----------------|
| "The PRD must be outdated" | PRD is source of truth |
| "The screenshot is from an older version" | Screenshots document DESIRED behavior |
| "The 4-stage system is what they meant by 10 steps" | Different numbers = different concepts |

See `daemon/agent_00_route_verification.md` for complete protocol.

---

## Agent 00b: Pipeline Creator

### Purpose

Converts the implementation plan into a **complete** pipeline YAML configuration that the orchestrator can execute. This includes all 6 stages and context for testcheck/usecases.

### Requirements

Agent 00b MUST generate:

1. **All 6 stages** (not just stages 1-4)
2. **Context section** extracted from implementation plan
3. **Implementation section** with technology stack info

### Invocation

```bash
claude -p "{prompt}" \
  --allowedTools "Read,Write,Glob,Grep,Edit" \
  --dangerously-skip-permissions
```

### Output Format

Generates `pipeline-{name}.yaml` with complete structure:

```yaml
pipeline:
  name: feature-name-implementation
  version: "1.0"
  mode: per_request
  default_timeout: 900

# REQUIRED: Context extracted from implementation plan
context:
  prd_vision: |
    <Extracted from implementation plan header>

  user_stories:
    - <User story 1 from PRD>
    - <User story 2 from PRD>

  key_features:
    - <Feature 1 being implemented>
    - <Feature 2 being implemented>

  epic_specific_scenarios:
    - <Testing scenarios specific to this epic>

source:
  path: ../docs/prd/Plan-{ID}-{name}.md
  extraction:
    task_pattern: '^\s*-\s*\[\s*\]\s*\*\*Task\s+(\d+\.\d+):\*\*\s+(.+?)$'
    task_groups:
      id: 1
      title: 2

outputs:
  requests: ../docs/gen_requests.md
  state: ./pipeline-{name}-state.json

# REQUIRED: Technology configuration for testcheck
implementation:
  technology:
    database: supabase       # or: postgres, mongodb, none
    browser_testing: false   # true if UI testing needed
  required_tools:
    - supabase_mcp           # if database: supabase
  precheck:
    timeout: 120

# REQUIRED: All 6 stages
# NOTE: Pipeline uses 01p and 02p agents (require explicit file path)
request_stages:
  # Stage 1-4: Per-task stages
  - id: request
    name: "Create Request"
    agent:
      name: "01p-request-fa-pipeline"  # Pipeline version - requires file path
      ...

  - id: overview
    name: "Create Overview"
    agent:
      name: "02p-techlead-overview-pipeline"  # Pipeline version - requires file path
      # CRITICAL: Must generate Dependencies section for parallel execution
      # See: templates/overview-stage-template.yaml
      ...

  - id: details
    name: "Create Detailed Tasks"
    agent:
      name: "03-senior-dev-task-breakdown"
      ...

  - id: implementation
    name: "Implementation"
    agent:
      name: "05-spec-implementation"
      ...

  # Stage 5-6: Pipeline-level stages (run ONCE, not per-task)
  - id: testcheck
    name: "Test Check & Verification"
    mode: pipeline              # <-- Critical: runs once
    agent:
      name: "06a-pipeline-testcheck"
      invocation_template: |
        Run pipeline-level test verification for: {pipeline_name}

        ## PRD Context
        {prd_vision}

        **State File**: {state_file_path}
        **Total Tasks**: {total_tasks}
        **Request Range**: {first_request_id} through {last_request_id}
        ...
    timeout: 1200
    output:
      type: verification

  - id: usecases
    name: "Use Case Test Generation"
    mode: pipeline              # <-- Critical: runs once
    agent:
      name: "06b-usecase-generator"
      invocation_template: |
        Generate end-to-end use case test scenarios for: {pipeline_name}

        ## PRD Vision
        {prd_vision}

        ## User Stories
        {user_stories}

        ## Epic-Specific Scenarios
        {epic_specific_scenarios}
        ...
    timeout: 900
    output:
      type: usecases
```

### Context Extraction

Agent 00b must read the implementation plan and extract:

| Field | Source | Purpose |
|-------|--------|---------|
| `prd_vision` | Plan header/overview | Gives testcheck/usecases the big picture |
| `user_stories` | "User Stories" or "Requirements" section | Drives use case generation |
| `key_features` | Phase descriptions | Lists what's being built |
| `epic_specific_scenarios` | Inferred from epic type | Testing focus areas |

### Request ID Handling

For the request stage, Agent 00b includes:

```yaml
invocation_template: |
  IMPORTANT: Before creating the request:
  1. Read docs/gen_requests.md to find the HIGHEST existing REQ-XXX number
  2. Use the NEXT sequential number
  3. Format MUST be REQ-XXX (three digits minimum)
  4. Append the new request to docs/gen_requests.md
```

### Overview Stage: Dependencies Section

The overview stage (02p-techlead-overview-pipeline) is **critical** for parallel execution planning.

The overview document MUST include a `## Dependencies` section:

```markdown
## Dependencies

### Depends On (Completed First)
- **REQ-XXX** (Task X.Y): <Description>
  - <What this task provides that we need>

### Blocks (Requires This First)
- **REQ-XXX** (Task X.Y): <Description>
  - <What we provide that they need>

### Parallel Safety
- **Files touched**: <List of files modified>
- **Conflicts with**: <Tasks with file overlap>
- **Safe to parallelize with**: <Tasks with no conflicts>
```

This information is parsed by `pipeline_dependencies.py` to:
- Build dependency graph for parallel execution
- Compute topological execution order
- Identify parallel clusters (tasks that can run simultaneously)
- Detect dependency cycles

### Template References

Agent 00b should reference these templates:

- **Request stage**: `claude-pipelines/templates/request-stage-template.yaml`
- **Overview stage**: `claude-pipelines/templates/overview-stage-template.yaml`
- **Pipeline-level stages**: `claude-pipelines/templates/pipeline-level-stages-template.yaml`

---

## Route Tracing

### Purpose

Maps routes mentioned in PRDs to their actual rendering components, preventing Agent 00 from targeting wrong files.

### Supported Frameworks

| Framework | Detection | Route Mapping |
|-----------|-----------|---------------|
| Next.js App Router | `src/app/` directory | `/route` → `src/app/route/page.tsx` |
| Next.js Pages Router | `src/pages/` or `pages/` | `/route` → `src/pages/route.tsx` |
| Vite + React Router | `vite.config.ts` | Check router config |
| Create React App | `src/index.tsx` | Check router config |

### Route Tracer Output

```json
{
  "prd_path": "docs/prd/intake/prd-feature.md",
  "project_root": "/path/to/project",
  "framework_detected": "nextjs_app_router",
  "routes_found": ["/dashboard2/create", "/dashboard2"],
  "traces": [
    {
      "route": "/dashboard2/create",
      "page_file": "src/app/dashboard2/create/page.tsx",
      "page_file_exists": true,
      "primary_component": "ItemCreationWorkflow",
      "component_directory": "src/components/ItemCreationWorkflow",
      "all_imports": ["ItemCreationWorkflow", "DashboardLayout"],
      "framework": "nextjs_app_router",
      "verification_hints": [
        "Check WORKFLOW_STEPS for step count",
        "Verify component name matches PRD"
      ]
    }
  ],
  "summary": {
    "total_routes": 2,
    "traced_successfully": 2,
    "missing_pages": 0
  }
}
```

### Usage

```python
from daemon.route_tracer import trace_prd_routes, save_trace_result

# Trace routes from PRD
result = trace_prd_routes(prd_path, project_root)

# Save for Agent 00
save_trace_result(result, 'route_trace.json')
```

---

## State Management

### Daemon State

Global daemon state stored in `daemon-state.json`:

```json
{
  "daemon_started": "2026-01-19T10:00:00",
  "last_poll": "2026-01-19T12:30:00",
  "pdfs_processed": 5,
  "pdfs_failed": 1,
  "active_job": null
}
```

### Job State

Per-PDF job state stored in `state/jobs/{pdf-name}.job.yaml`:

```yaml
pdf_path: /path/to/CPL-FAQBNB-feature-123.pdf
project_code: FAQBNB
stage: agent_00b
started_at: "2026-01-19T10:05:00"
updated_at: "2026-01-19T10:15:00"

# Intermediate outputs (for resumption)
prd_path: docs/prd/intake/prd-CPL-FAQBNB-feature-123-20260119.md
plan_path: docs/prd/Plan-110-Feature-Name.md
yaml_path: null  # Not yet created

error: null
```

### Resumption

The daemon automatically resumes incomplete jobs:

```python
# On startup, find incomplete jobs
incomplete = PDFJobState.find_incomplete(state_dir)

for job in incomplete:
    # Resume from last completed stage
    if job.stage == "agent_00":
        run_agent_00(job)
    elif job.stage == "agent_00b":
        run_agent_00b(job)
    elif job.stage == "orchestrator":
        run_orchestrator(job)
```

Failed jobs with `yaml_path` set are automatically retried from the orchestrator stage.

---

## PDF Naming Convention

### Required Format

```
{PREFIX}-{PROJECT_CODE}-{IDENTIFIER}.pdf
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| `PREFIX` | Configurable prefix | `CPL` |
| `PROJECT_CODE` | Approved project code (exact length) | `FAQBNB` |
| `IDENTIFIER` | Any identifier | `review-20260111` |

### Valid Examples

```
CPL-FAQBNB-review-20260111.pdf        ✓
CPL-FAQBNB-l10n-epic1.pdf             ✓
CPL-FAQBNB-feature-dashboard.pdf      ✓
```

### Invalid Examples

```
review-20260111.pdf                    ✗ Missing prefix and project code
CPL-review-20260111.pdf               ✗ Missing project code
CPL-INVALID-review.pdf                ✗ Project code not in approved list
FAQBNB-review.pdf                     ✗ Missing prefix
```

### Rejection Handling

Invalid PDFs are moved to `rejected_dir` with a `.rejected` file explaining why:

```
CPL-INVALID-review.pdf
CPL-INVALID-review.pdf.rejected  # Contains: "Project code 'INVALID' not in approved list"
```

---

## Troubleshooting

### Daemon Won't Start

```
Error: Daemon already running (pid: 12345)
```

**Solution:** Stop existing daemon or remove stale PID file:
```bash
python -m claude_pipelines.daemon.pdf_daemon --stop
# or
rm claude-pipelines/daemon/daemon.pid
```

### PDF Not Detected

**Check:**
1. PDF is in configured `inbox_dir`
2. Filename matches naming convention
3. Project code is in `approved_projects` list

```bash
# Verify configuration
python -c "from daemon.config import load_config; c = load_config(); print(c.daemon.inbox_dir)"
```

### Agent 00 Targets Wrong Component

**Symptoms:** Implementation plan modifies wrong files

**Solution:**
1. Check `route_trace.json` for traced component
2. Verify PRD route matches actual application route
3. Review `agent_00_route_verification.md` protocol
4. Add explicit route hints in PRD if needed

### Job Stuck in Stage

**Check job state:**
```bash
cat claude-pipelines/daemon/state/jobs/{pdf-name}.job.yaml
```

**Resume manually:**
```bash
# If stuck at orchestrator stage with yaml_path set
python pipeline_orchestrator.py --config {yaml_path} --resume
```

### Extraction Fails

```
Error: Failed to extract text from PDF
```

**Solutions:**
1. Ensure PDF is text-based (not scanned image)
2. Try alternative library: set `pdf_extraction.library: pypdf2`
3. Check PDF isn't password-protected

### Agent Timeout

```
Error: Agent exceeded timeout (600s)
```

**Solution:** Increase timeout in `daemon_config.yaml`:
```yaml
agents:
  implementation_planner:
    timeout: 900  # Increase from 600
```

---

## See Also

- [Main Pipeline Documentation](./README.md)
- [Agent 00 Verification Protocol](../daemon/agent_00_route_verification.md)
- [Pipeline Configuration Reference](./README.md#configuration-reference)
