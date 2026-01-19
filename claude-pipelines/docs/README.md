# Pipeline Orchestration System

*Created: 2026-01-10*
*Last Modified: 2026-01-19*

A modular system for orchestrating AI agent pipelines that transform implementation plans into working code through structured stages.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Pipeline Modes](#pipeline-modes)
- [Parallel Epics](#parallel-epics)
- [Stages](#stages)
- [Agent Reference](#agent-reference)
- [Precheck](#precheck)
- [Test Harness](#test-harness)
- [Health Check](#health-check)
- [Dependency Tracking](#dependency-tracking)
- [Parallel Execution](#parallel-execution)
- [Configuration Reference](#configuration-reference)
- [CLI Reference](#cli-reference)
- [Dashboard](#dashboard)
- [Troubleshooting](#troubleshooting)
- [File Reference](#file-reference)

---

## Overview

The Pipeline Orchestration System automates the process of converting high-level implementation plans into executed code changes. It:

1. **Parses** implementation plans to extract individual tasks
2. **Routes** each task through configurable agent stages
3. **Tracks** dependencies between tasks
4. **Coordinates** parallel execution when possible
5. **Maintains** state for resumption and monitoring

### Key Benefits

- **Reproducible**: Same plan + config = same execution
- **Resumable**: Interrupt and continue where you left off
- **Observable**: Real-time dashboard shows progress
- **Parallel-capable**: Independent tasks run concurrently via git worktrees
- **Project-agnostic**: All specifics live in YAML configuration

---

## Architecture

### Complete Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPLETE PIPELINE SYSTEM                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ PDF DAEMON (Optional Entry Point) ─────────────────────────────────────┐│
│  │                                                                          ││
│  │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐             ││
│  │   │   PDF   │    │ Agent   │    │ Agent   │    │ Pipeline│             ││
│  │   │ Extract │───▶│   00    │───▶│  00b    │───▶│  YAML   │             ││
│  │   │         │    │ (Plan)  │    │ (YAML)  │    │         │             ││
│  │   └─────────┘    └─────────┘    └─────────┘    └────┬────┘             ││
│  │                                                      │                  ││
│  └──────────────────────────────────────────────────────┼──────────────────┘│
│                                                         │                    │
│                                                         ▼                    │
│  ┌─ PIPELINE ORCHESTRATOR ──────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────────┐   ││
│  │  │                    PER-TASK STAGES (1-4)                         │   ││
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │   ││
│  │  │  │ Stage 1 │  │ Stage 2 │  │ Stage 3 │  │ Stage 4 │             │   ││
│  │  │  │ Request │─▶│Overview │─▶│ Details │─▶│  Impl   │             │   ││
│  │  │  │  (01)   │  │  (02)   │  │  (03)   │  │  (05)   │             │   ││
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │   ││
│  │  └──────────────────────────────────────────────────────────────────┘   ││
│  │                                    │                                     ││
│  │                                    ▼                                     ││
│  │  ┌──────────────────────────────────────────────────────────────────┐   ││
│  │  │                  PIPELINE-LEVEL STAGES (5-6)                     │   ││
│  │  │  ┌─────────────────────┐    ┌─────────────────────┐             │   ││
│  │  │  │      Stage 5        │    │      Stage 6        │             │   ││
│  │  │  │     Testcheck       │───▶│     Use Cases       │             │   ││
│  │  │  │  (06a-testcheck)    │    │  (06b-usecases)     │             │   ││
│  │  │  └─────────────────────┘    └─────────────────────┘             │   ││
│  │  └──────────────────────────────────────────────────────────────────┘   ││
│  │                                    │                                     ││
│  │                                    ▼                                     ││
│  │                         ┌─────────────────────┐                          ││
│  │                         │    Test Harness     │                          ││
│  │                         │   (Generated Page)  │                          ││
│  │                         └─────────────────────┘                          ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Flow

```
PDF/PRD ──▶ Agent 00 ──▶ Agent 00b ──▶ Agent 01 ──▶ Agent 02 ──▶ Agent 03 ──▶ Agent 05 ──▶ Agent 06a ──▶ Agent 06b
            (Plan)       (YAML)        (Request)   (Overview)   (Details)    (Impl)       (Verify)      (UseCases)
```

### Orchestrator-Only Flow (No Daemon)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Pipeline Orchestration System                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  Implementation  │    │     Pipeline     │    │      State       │  │
│  │      Plan        │───▶│      YAML        │───▶│      JSON        │  │
│  │   (Markdown)     │    │    (Config)      │    │   (Progress)     │  │
│  └──────────────────┘    └────────┬─────────┘    └──────────────────┘  │
│                                   │                        ▲            │
│                                   ▼                        │            │
│  ┌────────────────────────────────────────────────────────┴──────────┐ │
│  │                      PIPELINE ORCHESTRATOR                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │ │
│  │  │   Stage 1   │  │   Stage 2   │  │   Stage 3   │  │  Stage 4  │ │ │
│  │  │   Request   │─▶│  Overview   │─▶│   Details   │─▶│   Impl    │ │ │
│  │  │   Agent     │  │   Agent     │  │   Agent     │  │   Agent   │ │ │
│  │  └─────────────┘  └──────┬──────┘  └─────────────┘  └───────────┘ │ │
│  │                          │                                         │ │
│  │                          ▼ post_stage hook                         │ │
│  │                   ┌─────────────────┐                              │ │
│  │                   │   DEPENDENCY    │                              │ │
│  │                   │   EXTRACTION    │                              │ │
│  │                   └─────────────────┘                              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                   │                                      │
│                                   │ (parallel mode)                      │
│                                   ▼                                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      PIPELINE DISTRIBUTOR                          │ │
│  │                                                                     │ │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │ │
│  │   │  Worktree   │    │  Worktree   │    │  Worktree   │           │ │
│  │   │  Cluster A  │    │  Cluster B  │    │  Cluster C  │           │ │
│  │   │             │    │             │    │             │           │ │
│  │   │ Orchestrator│    │ Orchestrator│    │ Orchestrator│           │ │
│  │   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘           │ │
│  │          │                  │                  │                   │ │
│  │          └──────────────────┼──────────────────┘                   │ │
│  │                             ▼                                      │ │
│  │                      ┌─────────────┐                               │ │
│  │                      │    MERGE    │                               │ │
│  │                      │   TO MAIN   │                               │ │
│  │                      └─────────────┘                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Input**: Implementation Plan (Markdown) + Pipeline Config (YAML)
2. **Parsing**: Tasks extracted using regex patterns from config
3. **Stage Processing**: Each task goes through enabled stages
4. **Dependency Extraction**: After Stage 2, dependencies are parsed and stored
5. **State Updates**: Progress saved to JSON after each step
6. **Output**: Generated documents, code changes, git commits

---

## Components

### 1. Pipeline Orchestrator (`pipeline_orchestrator.py`)

The core execution engine that:

- Loads and validates YAML configuration
- Parses implementation plans to extract tasks
- Invokes agents for each stage
- Manages state persistence
- Handles errors and resumption

```bash
# Basic usage
python pipeline_orchestrator.py --config ./pipeline.yaml

# Dry run (show what would execute)
python pipeline_orchestrator.py --config ./pipeline.yaml --dry-run

# Resume interrupted pipeline
python pipeline_orchestrator.py --config ./pipeline.yaml --resume

# Run specific tasks only
python pipeline_orchestrator.py --config ./pipeline.yaml --tasks "0.1,0.2,0.3"

# Run specific stages only
python pipeline_orchestrator.py --config ./pipeline.yaml --stages "request,overview"

# List tasks without executing
python pipeline_orchestrator.py --config ./pipeline.yaml --list-tasks
```

### 2. Pipeline Distributor (`pipeline_distributor.py`)

The parallel execution coordinator that:

- **Analyzes parallelization benefit** before execution
- Creates git worktrees for parallel clusters
- Spawns multiple orchestrator instances
- Monitors cluster progress
- Merges completed branches back to main
- Handles merge conflicts
- **Recommends optimal execution mode** based on dependency structure

```bash
# Run with parallel execution
python pipeline_distributor.py --config ./pipeline.yaml

# Limit concurrent worktrees
python pipeline_distributor.py --config ./pipeline.yaml --max-parallel 2

# Dry run (show cluster plan without executing)
python pipeline_distributor.py --config ./pipeline.yaml --dry-run

# Validate pipeline with Claude before execution
python pipeline_distributor.py --config ./pipeline.yaml --validate

# Dry run with validation (recommended first step)
python pipeline_distributor.py --config ./pipeline.yaml --dry-run --validate

# Resume interrupted parallel execution
python pipeline_distributor.py --config ./pipeline.yaml --resume
```

### 3. Pipeline Dependencies (`pipeline_dependencies.py`)

The dependency management module that:

- Extracts dependencies from overview documents
- Builds and validates the dependency graph
- Detects cycles and conflicts
- Identifies parallel clusters
- Computes critical path

```python
# Usage as a library
from pipeline_dependencies import (
    extract_dependencies_from_overview,
    update_state_dependencies,
    get_execution_order,
    get_parallel_clusters,
    validate_dependencies
)

# Extract from a single overview file
deps = extract_dependencies_from_overview(Path("docs/REQ-001-overview.md"), config)

# Get tasks that can run next (all dependencies satisfied)
ready = get_ready_tasks(state)

# Identify clusters for parallel execution
clusters = get_parallel_clusters(state)
```

### 4. Pipeline Dashboard (`scripts/pipeline-dashboard.py`)

A terminal UI for monitoring pipeline progress:

```bash
# Basic usage (auto-finds state files)
./scripts/dashboard.sh

# Single render (no live updates)
./scripts/dashboard.sh --once

# Custom refresh rate
./scripts/dashboard.sh -r 5

# Include worktree state files
./scripts/dashboard.sh --worktrees

# Show dependency graph
./scripts/dashboard.sh --deps

# Monitor specific state file
./scripts/dashboard.sh --file ./custom-pipeline-state.json
```

---

## Pipeline Modes

The orchestrator supports four execution modes, configured via `pipeline.mode`:

### 1. Horizontal Mode (`horizontal`)

**All tasks complete Stage N before any start Stage N+1.**

```
Stage 1: [Task 0.1] → [Task 0.2] → [Task 0.3] → [Task 0.4]
Stage 2: [Task 0.1] → [Task 0.2] → [Task 0.3] → [Task 0.4]
Stage 3: [Task 0.1] → [Task 0.2] → [Task 0.3] → [Task 0.4]
Stage 4: [Task 0.1] → [Task 0.2] → [Task 0.3] → [Task 0.4]
```

**Use when:**
- You want to review all requests before any overviews
- Batch approval workflows
- Each stage has a human review gate

**Advantages:**
- Clear phase boundaries
- Easy batch reviews
- Simple mental model

**Disadvantages:**
- Cannot start implementing Task 1 until Task N finishes Stage 3
- Longer time to first implementation

### 2. Per-Request Mode (`per_request`)

**Each task completes all stages before the next task starts.**

```
Task 0.1: [Stage 1] → [Stage 2] → [Stage 3] → [Stage 4]
Task 0.2: [Stage 1] → [Stage 2] → [Stage 3] → [Stage 4]
Task 0.3: [Stage 1] → [Stage 2] → [Stage 3] → [Stage 4]
```

**Use when:**
- Tasks are independent
- You want completed features quickly
- Running single agent development sessions

**Advantages:**
- First task fully complete earliest
- Good for incremental delivery
- Simple to understand

**Disadvantages:**
- No parallelization benefit
- Dependencies between tasks not respected

### 3. Hybrid Mode (`hybrid`) - Recommended

**Stages 1-2 horizontal, then respects dependencies for Stages 3-4.**

```
Phase 1 (Horizontal):
  Stage 1: [Task 0.1] → [Task 0.2] → [Task 0.3] → [Task 0.4]
  Stage 2: [Task 0.1] → [Task 0.2] → [Task 0.3] → [Task 0.4]

Phase 2 (Dependency-Aware):
  → Extract dependencies after each Stage 2 completion
  → Analyze dependency graph

Phase 3 (Ordered):
  Stage 3+4: Execute in topological order respecting dependencies
```

**Use when:**
- Tasks have dependencies
- You want dependency analysis before implementation
- Balance between batch planning and ordered execution

**Advantages:**
- Best of both modes
- Dependencies properly respected
- Can identify parallelizable work

**Disadvantages:**
- More complex execution model
- Requires dependency sections in overviews

### 4. Parallel Mode (`parallel`)

**Like hybrid, but runs independent clusters concurrently using git worktrees.**

```
Phase 1 (Horizontal on main):
  Stage 1-2: All tasks through overview stage

Phase 2 (Analysis):
  → Extract all dependencies
  → Identify parallel clusters

Phase 3 (Parallel Execution):
  Worktree A (Cluster 1): [0.1] → [0.2] → [0.3]  ─┐
  Worktree B (Cluster 2): [1.1] → [1.2]          ├─▶ Merge to main
  Worktree C (Cluster 3): [2.1] → [2.2] → [2.3]  ─┘

Phase 4 (Sequential):
  Main branch: Tasks that depend on merged work
```

**Use when:**
- Many independent task clusters exist
- You have multiple CPU cores/agents available
- Maximum throughput is important

**Advantages:**
- Fastest total execution time
- Maximizes resource utilization
- Automatic conflict detection

**Disadvantages:**
- More complex setup
- Requires git worktree support
- Merge conflicts possible

---

## Parallel Epics

Multiple epics can run simultaneously by using **isolated request files**. This prevents request ID conflicts when multiple pipelines create requests concurrently.

### Configuration

Each epic uses its own requests file:

```yaml
# pipeline-l10n-epic2.yaml
outputs:
  requests: ../docs/gen_requests_epic2.md
  state: ./pipeline-l10n-epic2-state.json

# pipeline-l10n-epic3.yaml
outputs:
  requests: ../docs/gen_requests_epic3.md
  state: ./pipeline-l10n-epic3-state.json
```

### Request File Layout

```
docs/
├── gen_requests.md        # Original/shared requests (Epic 1)
├── gen_requests_epic2.md  # Epic 2 requests (isolated)
├── gen_requests_epic3.md  # Epic 3 requests (isolated)
├── gen_requests_epic4.md  # Epic 4 requests (isolated)
└── gen_requests_epic5.md  # Epic 5 requests (isolated)
```

### Running Multiple Epics in Parallel

```bash
# Terminal 1: Run Epic 2
python pipeline_orchestrator.py --config ./pipeline-l10n-epic2.yaml

# Terminal 2: Run Epic 3 (simultaneously)
python pipeline_orchestrator.py --config ./pipeline-l10n-epic3.yaml

# Terminal 3: Run Epic 4 (simultaneously)
python pipeline_orchestrator.py --config ./pipeline-l10n-epic4.yaml
```

### Benefits

| Feature | Benefit |
|---------|---------|
| Isolated request files | No request ID conflicts |
| Separate state files | Independent progress tracking |
| Separate log files | Clear debugging per epic |
| Dashboard monitoring | View all epics simultaneously |

### Dashboard Monitoring

The dashboard automatically discovers all pipeline state files:

```bash
# Monitor all epics at once
python pipeline-dashboard.py --watch-new

# Or specify directory containing all state files
python pipeline-dashboard.py --dir ./pipelines-execution
```

### Prerequisites

Before running epics in parallel, ensure:

1. **Isolated requests files exist**: Create empty `gen_requests_epicN.md` files
2. **No file conflicts**: Epics should modify different parts of the codebase
3. **Shared dependencies complete**: If Epic 3 depends on Epic 1, complete Epic 1 first

### Example: L10N Epic Structure

```
Epic 1 (Foundation)     ← Run first (creates base infrastructure)
    │
    ├── Epic 2 (Static UI)         ← Can run in parallel
    ├── Epic 3 (Dynamic Content)   ← Can run in parallel
    ├── Epic 4 (Guest Experience)  ← Can run in parallel
    └── Epic 5 (Owner Management)  ← Can run in parallel
```

---

## Stages

Each stage represents a transformation step, typically backed by an AI agent.

### Stage 1: Request (`request`)

**Purpose:** Formalize the task as a tracked request.

**Input:** Task title and description from implementation plan
**Output:** Entry in `docs/gen_requests.md` with request ID (e.g., REQ-148)

**Agent Actions:**
- Parse task requirements
- Generate formal request documentation
- Assign unique request ID
- Add to request tracking file

### Stage 2: Overview (`overview`)

**Purpose:** Analyze codebase and create technical implementation breakdown with task dependencies.

**Input:** Request from Stage 1
**Output:** `docs/REQ-XXX-*-overview.md`

**Agent Actions:**
- Investigate existing codebase
- Identify files and functions to modify
- Document integration points
- **CRITICAL: Write Dependencies section** (required for parallel execution)
- Create ordered implementation steps

**REQUIRED Dependencies Section:**

The overview document MUST include a `## Dependencies` section with these subsections:

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

This information is parsed by `pipeline_dependencies.py` to build the dependency graph.

**Template:** See `templates/overview-stage-template.yaml` for full invocation template.

**Post-Stage Hook:** After each Stage 2 completion, dependency extraction runs automatically.

### Stage 3: Details (`details`)

**Purpose:** Create granular, actionable task breakdown.

**Input:** Overview from Stage 2
**Output:** `docs/REQ-XXX-*-detailed.md`

**Agent Actions:**
- Break down into 1 story-point tasks
- Add code snippets and examples
- Specify test requirements
- Document edge cases

### Stage 4: Implementation (`implementation`)

**Purpose:** Execute the implementation plan.

**Input:** Detailed spec from Stage 3
**Output:** Code changes, tests, commits

**Agent Actions:**
- Write code following the spec
- Run tests and fix failures
- Update documentation
- Create git commits

### Stage 5: Test Check (`testcheck`)

**Purpose:** Pipeline-level verification and test harness generation.

**Mode:** Pipeline (runs once for entire pipeline, not per-task)

**Input:** Pipeline state file, implementation plan
**Output:** Verification results, test harness page

**Agent:** `06a-pipeline-testcheck`

**Agent Actions:**
- Read state file to understand implemented tasks
- Verify implementations against specifications
- Run build verification: `npm run type-check` && `npm run build`
- Generate test harness page for manual QA testing
- Update state file with verification results

**Prerequisite:** At least one task must have `implementation_completed=true`

**State Fields Added:**
```json
{
  "testcheck_completed": true,
  "testcheck_completed_at": "2026-01-19T12:00:00",
  "verification": {
    "status": "passed",
    "build_status": "passed",
    "deployed_url": "http://localhost:3000/testing/pipeline-name"
  },
  "test_harness_url": "src/app/testing/pipeline-name/page.tsx"
}
```

### Stage 6: Use Cases (`usecases`)

**Purpose:** Generate end-to-end test scenarios based on PRD intent.

**Mode:** Pipeline (runs once for entire pipeline)

**Input:** Implementation plan, state file with implemented tasks
**Output:** Use case test scenarios stored in state

**Agent:** `06b-usecase-generator`

**Agent Actions:**
- Read implementation plan for PRD intent and user stories
- Read state file to understand what was implemented
- Generate comprehensive use case test scenarios:
  - Happy path flows
  - Edge cases and error handling
  - Feature-specific scenarios (e.g., multi-language for L10N)
- Add use cases to state file under `usecases` key

**State Fields Added:**
```json
{
  "usecases": {
    "generated_at": "2026-01-19T12:00:00",
    "items": [
      {
        "id": "UC-001",
        "title": "User changes language preference",
        "category": "happy-path",
        "description": "Verify language switching works correctly",
        "steps": [
          {"step": 1, "action": "Navigate to settings", "expected": "Settings page loads"}
        ],
        "expected_results": ["Language changes immediately", "Preference persists"]
      }
    ]
  }
}
```

---

## Agent Reference

The pipeline uses specialized AI agents for each stage. Each agent is designed for a specific task type.

### Orchestrator Agents (Stages 1-6)

| Agent ID | Name | Stage | Purpose |
|----------|------|-------|---------|
| `01-request-fa` | Request Functional Analyst | request | Creates formal requirement from task description |
| `02-techlead-overview` | Tech Lead Overview | overview | Investigates codebase, creates implementation breakdown |
| `03-senior-dev-task-breakdown` | Senior Dev Task Breakdown | details | Creates granular 1-point implementation tasks |
| `05-spec-implementation` | Spec Implementation | implementation | Autonomously implements all tasks from spec |
| `06a-pipeline-testcheck` | Pipeline Test Check | testcheck | Verifies implementation, generates test harness |
| `06b-usecase-generator` | Use Case Generator | usecases | Creates E2E test scenarios from PRD intent |

### Daemon Agents (Pre-Orchestrator)

| Agent ID | Name | Purpose |
|----------|------|---------|
| `00-implementation-planner` | Implementation Planner | Creates global implementation plan from PRD |
| `00b-pipeline-creator` | Pipeline Creator | Converts implementation plan to pipeline YAML |

### Agent 00b: Pipeline Creator Responsibilities

Agent 00b is responsible for generating **complete** pipeline YAML configurations including:

1. **All 6 stages** - Not just stages 1-4, but also testcheck and usecases
2. **Context section** - Extracts PRD vision, user stories, key features from implementation plan
3. **Implementation section** - Technology stack and required tools for testcheck

**Why this matters:** The testcheck and usecases stages need PRD context to generate meaningful test scenarios. Agent 00b extracts this at YAML creation time so it's available when those stages run.

```yaml
# Agent 00b must generate:
context:
  prd_vision: "..."       # For testcheck/usecases prompts
  user_stories: [...]     # Drives use case generation
  epic_specific_scenarios: [...]  # Testing focus areas

request_stages:
  - id: request           # Stage 1
  - id: overview          # Stage 2
  - id: details           # Stage 3
  - id: implementation    # Stage 4
  - id: testcheck         # Stage 5 (mode: pipeline)
  - id: usecases          # Stage 6 (mode: pipeline)
```

See [PDF Daemon Documentation](./pdf-daemon.md#agent-00b-pipeline-creator) for complete requirements.

### Agent Invocation

Agents are invoked via the Claude CLI with stage-specific prompts:

```bash
claude -p "{prompt}" --allowedTools "Read,Write,Bash,..." --dangerously-skip-permissions
```

Each stage defines:
- `invocation_template`: Prompt template with `{variables}`
- `command`: CLI command with arguments
- `timeout`: Maximum execution time in seconds
- `output`: Expected output type and location

See [PDF Daemon Documentation](./pdf-daemon.md) for details on daemon agents.

---

## Precheck

The precheck phase runs before pipeline execution to verify the environment is ready.

### What Precheck Does

1. **Clear .next Cache** - Removes the `.next` directory if present to prevent corrupted cache issues that can cause Internal Server Errors during testing
2. **Verify Required Tools** - Uses a lightweight Claude agent to verify tools like `playwright_mcp` are available

### Precheck Behavior

| Scenario | Behavior |
|----------|----------|
| First run | Precheck runs automatically |
| `--resume` | Precheck skipped if previously passed |
| `--precheck` | Force re-run precheck |

### Example Output

```
============================================================
Running Precheck
  Required tools: playwright_mcp
  Timeout: 120s
============================================================
  ✓ Cleared .next cache directory (prevents corrupted cache issues)
  ✓ Precheck passed (8.2s)
    ✓ playwright_mcp: Browser snapshot successful
```

### Precheck Result in State

```json
{
  "precheck": {
    "status": "passed",
    "completed_at": "2025-01-10T12:34:56",
    "elapsed": "8.2s",
    "next_cache_cleared": true,
    "tools": {
      "playwright_mcp": {
        "available": true,
        "notes": "Browser snapshot successful"
      }
    }
  }
}
```

### When to Force Precheck

Use `--precheck` flag when:
- You've restarted Chrome/CDP
- You're experiencing Internal Server Errors
- The `.next` cache may be corrupted (after crashes or interruptions)

```bash
python pipeline_orchestrator.py --config ./pipeline.yaml --resume --precheck
```

---

## Test Harness

The testcheck stage generates a test harness page for manual QA testing.

### What Gets Generated

A Next.js page at `src/app/testing/{pipeline-name}/page.tsx` containing:

- **LLM Instructions**: Contextual guidance from the PRD for AI-assisted testing
- **Component Tests**: List of implemented components with test scenarios
- **Use Case Tests**: Sequential test flows with step-by-step guidance
- **Pipeline Reference**: All tasks with completion status

### Viewing Test Harness URLs

```bash
# Display test harness URL(s) from state file
python pipeline_orchestrator.py --config ./pipeline.yaml --test-harness

# Output:
# Test Harness Status
# ====================
# Testcheck completed: 2026-01-19T12:00:00
# Build status: passed
# Local URL: http://localhost:3000/testing/l10n-epic1-foundation
```

### Master Index

A master index page at `src/app/testing/page.tsx` lists all pipeline test harnesses:

```
/testing/
├── page.tsx                          # Master index
├── l10n-epic1-foundation/page.tsx    # Epic 1 test harness
├── l10n-epic2-static-ui/page.tsx     # Epic 2 test harness
└── ...
```

---

## Health Check

The health check validates the pipeline environment before execution.

### Running Health Check

```bash
# Human-readable output
python pipeline_orchestrator.py --config ./pipeline.yaml --health-check

# JSON output (for automation)
python pipeline_orchestrator.py --config ./pipeline.yaml --health-check-json

# Skip Claude CLI verification
python pipeline_orchestrator.py --config ./pipeline.yaml --health-check --skip-claude-checks
```

### What Health Check Validates

1. **Configuration**: YAML syntax, required fields, path resolution
2. **Source File**: Implementation plan exists and is readable
3. **Output Directories**: Write permissions for state, logs, docs
4. **Claude CLI**: Available and responsive (unless skipped)
5. **Required Tools**: MCP servers and tools specified in config

### Example Output

```
Pipeline Health Check
=====================
✓ Configuration loaded successfully
✓ Source file exists: ../docs/prd/Plan-110-L10N-Epic1-Foundation.md
✓ Output directories writable
✓ Claude CLI available
✓ Required tools: supabase_mcp

Health check passed!
```

---

## Dependency Tracking

Dependencies are tracked incrementally to support parallel execution planning.

**Template:** See `templates/overview-stage-template.yaml` for the full overview stage template.

### Why Dependencies Matter

Dependencies enable:
1. **Parallel Execution:** Tasks without conflicts can run simultaneously in git worktrees
2. **Optimal Ordering:** Topological sort ensures prerequisites complete first
3. **Cycle Detection:** Identifies invalid circular dependencies before execution
4. **Conflict Avoidance:** Prevents parallel tasks from modifying the same files

### How Dependencies Are Captured

1. **During Stage 2:** Agent writes a `## Dependencies` section in overview document.

**REQUIRED Format:**

```markdown
## Dependencies

### Depends On (Completed First)
- **REQ-235** (Task 3.1): Translation service module structure
  - Provides `ITranslationProvider` interface we implement
  - Creates `/src/lib/translation-service/` directory structure

- **REQ-238** (Task 3.4): Rate limiter utility
  - Provides `RateLimiter` class for API throttling

### Blocks (Requires This First)
- **REQ-240** (Task 3.6): Main translation service wrapper
  - Uses our `ClaudeTranslationProvider` class
  - Imports from `/src/lib/translation-service/providers/claude-provider.ts`

- **REQ-242** (Task 3.8): API endpoint for manual translation testing
  - Tests the provider we implement

### Parallel Safety
- **Files touched**:
  - `/src/lib/translation-service/providers/claude-provider.ts` (create)
  - `/src/lib/translation-service/providers/index.ts` (modify)
  - `package.json` (modify - add @anthropic-ai/sdk)

- **Conflicts with**: REQ-237 (both modify providers/index.ts)

- **Safe to parallelize with**: REQ-239 (retry logic - different files)
```

### Dependency Identification Guidelines

When the overview agent identifies dependencies, it should consider:

**For "Depends On":**
- Type dependencies (needs types/interfaces from another task)
- Infrastructure dependencies (needs database tables, API routes)
- Component dependencies (uses components created by another task)
- Configuration dependencies (needs env vars, config files)

**For "Blocks":**
- What does this task create that other tasks will use?
- Are there downstream tasks that import from files we create?
- Does the implementation plan show tasks that build on this one?

**For "Parallel Safety":**
- Which files will be created or modified?
- Do any other tasks in the same phase touch these files?
- Could two tasks both try to modify the same function?

2. **Post-Stage Hook:** After Stage 2 completes, the orchestrator runs:
   ```python
   extract_dependencies_from_overview(overview_path, config)
   update_state_dependencies(state, task_deps, config)
   ```

3. **State Update:** Dependencies stored in state JSON:
   ```json
   {
     "dependencies": {
       "tasks": {
         "0.1": {
           "depends_on": [],
           "blocks": ["0.2", "0.3"],
           "files_touched": ["src/db/migrations/001.sql"],
           "conflicts_with": [],
           "safe_to_parallelize": ["1.1", "1.2"]
         }
       },
       "graph": {
         "nodes": ["0.1", "0.2", ...],
         "edges": [["0.1", "0.2"], ...],
         "roots": ["0.1"],
         "leaves": ["6.4"]
       },
       "execution": {
         "topological_order": [...],
         "critical_path": [...],
         "parallel_clusters": [[...], [...]]
       }
     }
   }
   ```

### Retroactive Extraction

If stages 1-3 already completed without dependency sections:

```bash
# Extract dependencies from existing overview files
python scripts/extract_dependencies_from_plan.py --config ./pipeline.yaml
```

This script:
- Parses phase structure from implementation plan
- Infers sequential dependencies
- Analyzes file mentions for conflict detection
- Updates state file with dependency graph

---

## Parallel Execution

When `mode: parallel` is enabled, the distributor coordinates worktree-based parallel execution.

### Prerequisites

- Git repository with clean working state
- Sufficient disk space for worktrees
- `parallelization.enabled: true` in config

### Execution Phases

#### Phase 1: Gathering (Main Branch)
```
Run Stages 1-2 for all tasks on main branch
Extract dependencies after each Stage 2
```

#### Phase 2: Analysis
```
Build dependency graph
Identify independent clusters (tasks with no inter-dependencies)
Validate no cycles exist
Analyze parallelization benefit
```

### Parallelization Analysis

The distributor automatically analyzes whether parallel execution would benefit your pipeline and provides recommendations:

```
============================================================
PARALLELIZATION ANALYSIS
============================================================
  Total tasks: 28
  Total clusters: 28
  Multi-task clusters: 0
  Single-task clusters: 28
  Max cluster size: 1
  Sequential tasks: 0
  Parallelization enabled: False

RECOMMENDATION:
  Parallelization is DISABLED. This is appropriate for this pipeline.
  Dependency structure is heavily sequential (28 single-task clusters).
  Parallel execution would provide minimal benefit.
  Recommendation: Use the orchestrator directly for sequential execution:
    python pipeline_orchestrator.py --config ./pipeline.yaml --resume
```

**Analysis Scenarios:**

| Scenario | Recommendation |
|----------|----------------|
| Disabled + Would benefit | Warning: Enable parallelization for speedup |
| Disabled + No benefit | Info: Sequential execution is appropriate |
| Enabled + Would benefit | Info: Shows potential speedup |
| Enabled + No benefit | Warning: Use orchestrator directly, avoid overhead |

Use `--dry-run` to see the analysis without executing:

```bash
python pipeline_distributor.py --config ./pipeline.yaml --dry-run
```

### Pipeline Validation (Claude Review)

The `--validate` flag invokes Claude to review the pipeline structure and task coherence before execution:

```bash
python pipeline_distributor.py --config ./pipeline.yaml --dry-run --validate
```

**What Claude Reviews:**
1. Task ordering and dependency logic
2. Missing or incorrect dependencies
3. Tasks that seem out of order
4. Overall pipeline coherence
5. Potential implementation issues

**Example Output:**
```
============================================================
PIPELINE VALIDATION (Claude Review)
============================================================
Invoking Claude for pipeline validation...

Claude's Assessment:
----------------------------------------
  PASS

  The pipeline structure is well-organized with proper phase
  sequencing. Database tasks (Phase 0) correctly precede the
  application layer tasks. Dependencies follow a logical order.

  No issues found.
----------------------------------------
```

**Validation Outcomes:**

| Status | Effect |
|--------|--------|
| PASS | Continue execution |
| WARN | Log warnings, continue execution |
| FAIL | Abort execution (in non-dry-run mode) |

**Recommended Workflow:**
```bash
# Always validate before first execution
python pipeline_distributor.py --config ./pipeline.yaml --dry-run --validate

# If validation passes, execute
python pipeline_distributor.py --config ./pipeline.yaml
```

#### Phase 3: Distribution
```
For each cluster:
  1. Create git worktree: ../.worktrees/pipeline-name/cluster-N
  2. Create branch: pipeline/pipeline-name/cluster-N
  3. Spawn orchestrator instance
  4. Monitor progress
```

#### Phase 4: Merge
```
For each completed cluster:
  1. Verify build passes
  2. Merge branch to main
  3. Handle conflicts if any
  4. Cleanup worktree
```

#### Phase 5: Sequential
```
Run remaining tasks that depended on merged work
```

### Worktree Layout

```
project-root/
├── (main working directory)
├── pipeline-state.json
└── ../.worktrees/
    └── ui-ux-workflow/
        ├── cluster-0/
        │   ├── (full repo checkout)
        │   └── pipeline-*-state.json
        ├── cluster-1/
        └── cluster-2/
```

### Conflict Handling

When `on_merge_conflict: pause_and_notify`:

1. Distributor pauses execution
2. Logs conflict details
3. Waits for manual resolution
4. Resumes on user signal

---

## Configuration Reference

### Pipeline Section

```yaml
pipeline:
  name: string              # Unique pipeline identifier
  version: string           # Semantic version
  description: string       # Human-readable description
  mode: string              # horizontal | per_request | hybrid | parallel
  default_timeout: integer  # Seconds before agent timeout (default: 900)
```

### Parallelization Section

```yaml
parallelization:
  enabled: boolean          # Enable worktree-based parallelism
  max_concurrent: integer   # Max simultaneous worktrees (default: 3)
  branch_pattern: string    # Branch naming template
  worktree_dir: string      # Worktree location template
  merge_strategy: string    # sequential | rebase | squash
  cleanup_worktrees: bool   # Delete worktrees after merge
  on_merge_conflict: string # pause_and_notify | abort | manual
```

### Dependency Tracking Section

```yaml
dependency_tracking:
  enabled: boolean          # Enable dependency extraction
  extraction:
    section_pattern: string           # Regex for dependency section header
    depends_on_pattern: string        # Regex for depends_on subsection
    blocks_pattern: string            # Regex for blocks subsection
    task_ref_pattern: string          # Regex to match task references
    files_touched_pattern: string     # Regex to extract file lists
  validation:
    fail_on_cycles: boolean           # Abort if cycles detected
    warn_on_no_dependencies: boolean  # Warn if no deps found
```

### Source Section

```yaml
source:
  type: string              # markdown | json | yaml
  file: string              # Path to implementation plan
  encoding: string          # File encoding (default: utf-8)
```

### Parsing Section

```yaml
parsing:
  task_pattern: string      # Regex to extract tasks
  capture_groups:           # Named groups mapping
    phase: integer
    phase_name: integer
    task_id: integer
    title: integer
  description:
    method: string          # content_until_next | explicit_end | fixed_lines
    end_pattern: string     # Pattern marking description end
```

### Stages Section

```yaml
stages:
  - id: string              # Unique stage identifier
    name: string            # Display name
    description: string     # What this stage does
    enabled: boolean        # Whether to run this stage

    agent:
      name: string          # Agent identifier
      invocation_template: string  # Prompt template with {variables}
      command: list         # Command to invoke agent
      timeout: integer      # Override default timeout

    output:
      type: string          # request | overview | details | implementation
      directory: string     # Output directory
      filename_template: string  # Filename pattern

    post_stage:
      action: string        # extract_dependencies | custom_script
      script: string        # Path to custom script
```

### Request Tracking Section

```yaml
request_tracking:
  enabled: boolean          # Enable request ID generation
  file: string              # Path to requests file
  id_pattern: string        # Regex to find last ID
  id_format: string         # Format for new IDs
  starting_id: integer      # First ID if file empty
```

---

## CLI Reference

### pipeline_orchestrator.py

| Flag | Description |
|------|-------------|
| `--config FILE` | Path to pipeline YAML configuration (required) |
| `--dry-run` | Show what would execute without running |
| `--resume` | Continue from last saved state |
| `--precheck` | Force re-run precheck even if already passed |
| `--precheck-only` | Run precheck and exit |
| `--keep` | Keep state file after completion |
| `--delete` | Delete state file and exit |
| `--list-tasks` | Print extracted tasks and exit |
| `--show-config` | Show resolved configuration and exit |
| `--tasks IDS` | Run only specified tasks (comma-separated) |
| `--stages IDS` | Run only specified stages (comma-separated) |
| `--horizontal` | Force horizontal mode (overrides config) |
| `--reset` | Reset specific task(s) to pending state |
| `--verbose` | Enable debug logging |
| `--force` | Force operations (skip confirmations) |
| `--test-harness` | Display test harness URL(s) from state |
| `--health-check` | Run pipeline health check |
| `--health-check-json` | Run health check with JSON output |
| `--skip-claude-checks` | Skip Claude CLI checks in health check |

### pipeline_distributor.py

| Flag | Description |
|------|-------------|
| `--config FILE` | Path to pipeline YAML configuration (required) |
| `--dry-run` | Show cluster plan without executing |
| `--validate` | Run Claude to validate pipeline before execution |
| `--resume` | Continue interrupted parallel execution |
| `--max-parallel N` | Override max concurrent worktrees |
| `--verbose` | Enable debug logging |
| `--status` | Show current distributor status and exit |
| `--cleanup` | Clean up worktrees and exit |

### scripts/dashboard.sh

| Flag | Description |
|------|-------------|
| `--once` | Single render, no live updates |
| `-r N`, `--refresh N` | Refresh interval in seconds |
| `--worktrees`, `-w` | Include worktree state files |
| `--deps` | Show dependency graph |
| `--file FILE` | Monitor specific state file |

---

## Dashboard

The dashboard provides real-time visibility into pipeline progress.

### Display Sections

```
╔═══════════════════════════════════════════════════════════════════════╗
║ Pipeline: ui-ux-workflow-improvements                      v1.1      ║
║ Status: RUNNING          Mode: hybrid          Updated: 12:34:56     ║
╠═══════════════════════════════════════════════════════════════════════╣
║ Stage Progress:                                                       ║
║   request:    ████████████████████████████████████████ 28/28 (100%)  ║
║   overview:   ████████████████████████████████████████ 28/28 (100%)  ║
║   details:    ████████████████████████████████████████ 28/28 (100%)  ║
║   implement:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/28 (0%)    ║
╠═══════════════════════════════════════════════════════════════════════╣
║ Dependencies:                                                         ║
║   Graph: 28 nodes, 68 edges                                          ║
║   Roots: 0.1                    Leaves: 6.4                          ║
║   Critical Path: 0.1 → 0.2 → ... → 6.4 (28 tasks)                    ║
║   Parallel Clusters: 28                                               ║
╠═══════════════════════════════════════════════════════════════════════╣
║ Tasks:                                                                ║
║   [✓] 0.1  Create item_articles Table                                ║
║   [✓] 0.2  Add article_id to item_links Table                        ║
║   [▶] 0.3  Create RLS Policies for item_articles      ◄ CURRENT      ║
║   [ ] 0.4  Update API Endpoints                                      ║
║   ...                                                                 ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### Task Status Icons

| Icon | Meaning |
|------|---------|
| `[ ]` | Pending |
| `[▶]` | In Progress |
| `[✓]` | Completed |
| `[✗]` | Failed |
| `[⊘]` | Skipped |

### Stage Indicators

Each task shows stage completion indicators:

```
R✓O✓D✓I✓T✓  - All stages complete, tests passed
R✓O✓D✓I⚠T✗  - Implementation done but tests failed
R✓O✓D✓I?T?  - Implementation done, test status unclear
R✓O✓D✓I○    - Details done, implementation pending
R✓O✓D○I○    - Overview done, details pending
```

| Indicator | Meaning |
|-----------|---------|
| `R✓` | Request stage completed |
| `O✓` | Overview stage completed |
| `D✓` | Details stage completed |
| `I✓` | Implementation completed, tests passed |
| `I⚠` | Implementation completed, tests FAILED |
| `I?` | Implementation completed, test status unclear |
| `I○` | Implementation pending |
| `T✓` | Tests explicitly passed |
| `T✗` | Tests explicitly failed |
| `T?` | Test status unknown |

### Test Result Tracking

The orchestrator automatically parses agent output to detect test results:

- **Tests Passed**: Output contains patterns like "tests passed", "verification successful"
- **Tests Failed**: Output contains "test failed", "Internal Server Error", "verification failed"
- **Tests Ran**: Any verification/testing activity detected
- **No Tests**: No test execution detected in output

Test results are stored in each task:

```json
{
  "implementation_completed": true,
  "tests_ran": true,
  "tests_passed": true,
  "test_summary": "Tests passed successfully"
}
```

### Worktree View (with `--worktrees`)

```
╠═══════════════════════════════════════════════════════════════════════╣
║ Worktrees:                                                            ║
║   main:      28 tasks, 0 in_progress                                  ║
║   cluster-0: 8 tasks, 1 in_progress   ▶ 1.3 Update State Machine      ║
║   cluster-1: 6 tasks, 1 in_progress   ▶ 2.1 Create PurposeStep        ║
║   cluster-2: 5 tasks, 0 in_progress   ✓ Complete                      ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## Troubleshooting

### Common Issues

#### Pipeline won't start
```
Error: State file already exists
```
**Solution:** Use `--resume` to continue or delete the state file to restart.

#### Agent timeout
```
Error: Agent exceeded timeout (900s)
```
**Solution:** Increase `default_timeout` in config or per-stage `timeout`.

#### Tasks not found
```
Warning: No tasks extracted from implementation plan
```
**Solution:** Check `parsing.task_pattern` regex matches your plan format.

#### Dependency cycles detected
```
Error: Cycle detected involving tasks: 1.1, 1.3, 1.5
```
**Solution:** Review overview files and fix circular dependency references.

#### Merge conflicts in parallel mode
```
Error: Merge conflict in cluster-1 branch
```
**Solution:**
1. Navigate to worktree: `cd ../.worktrees/pipeline-name/cluster-1`
2. Resolve conflicts manually
3. Commit resolution
4. Resume distributor

#### Worktree creation fails
```
Error: fatal: 'path' is already checked out
```
**Solution:** Remove stale worktrees: `git worktree prune`

#### Internal Server Error during tests
```
Error: Test returned "Internal Server Error"
```
**Cause:** Corrupted `.next` cache directory from previous builds or crashes.

**Solution:**
1. Run precheck with force flag: `--precheck`
2. Or manually clear cache: `rm -rf .next`

The precheck phase now automatically clears `.next` cache to prevent this issue.

### Debugging Tips

1. **Check logs:**
   ```bash
   tail -f pipeline-*.log
   ```

2. **Validate config:**
   ```bash
   python pipeline_orchestrator.py --config ./pipeline.yaml --dry-run
   ```

3. **Inspect state:**
   ```bash
   cat pipeline-*-state.json | python -m json.tool
   ```

4. **Test regex patterns:**
   ```python
   import re
   pattern = r"#### Task (\d+)\.(\d+): (.+)"
   re.findall(pattern, plan_content)
   ```

5. **Reset to clean state:**
   ```bash
   rm pipeline-*-state.json
   git worktree prune
   rm -rf ../.worktrees/
   ```

### Getting Help

- Check inline comments in YAML configuration
- Review docstrings in Python modules
- Examine `pipeline_ideas.md` for known issues and planned improvements

---

## Quick Start Example

1. **Create implementation plan** (`docs/prd/my-feature-plan.md`):
   ```markdown
   # My Feature Implementation Plan

   ## Phase 0: Setup
   #### Task 0.1: Create database table
   Create the new users table with proper schema.

   #### Task 0.2: Add API endpoint
   Create REST endpoint for user operations.
   ```

2. **Create pipeline config** (`pipeline-my-feature.yaml`):
   ```yaml
   pipeline:
     name: my-feature
     version: "1.0"
     mode: hybrid

   source:
     type: markdown
     file: ./docs/prd/my-feature-plan.md

   # ... (copy from existing pipeline config and customize)
   ```

3. **Run the pipeline:**
   ```bash
   # Dry run first
   python pipeline_orchestrator.py --config ./pipeline-my-feature.yaml --dry-run

   # Execute
   python pipeline_orchestrator.py --config ./pipeline-my-feature.yaml
   ```

4. **Monitor progress:**
   ```bash
   ./scripts/dashboard.sh
   ```

---

## File Reference

### Core Orchestrator Files

| File | Purpose |
|------|---------|
| `pipeline_orchestrator.py` | Core orchestration engine |
| `pipeline_distributor.py` | Parallel execution coordinator |
| `pipeline_dependencies.py` | Dependency extraction and graph |
| `pipeline-dashboard.py` | Terminal UI for monitoring |
| `scripts/dashboard.sh` | Dashboard launcher script |
| `pipeline-*.yaml` | Pipeline configurations |
| `pipeline-*-state.json` | Execution state files |

### Daemon Files (see [PDF Daemon Documentation](./pdf-daemon.md))

| File | Purpose |
|------|---------|
| `daemon/pdf_daemon.py` | Main daemon entry point |
| `daemon/pdf_extractor.py` | PDF text extraction (pdfplumber) |
| `daemon/config.py` | Configuration loading and validation |
| `daemon/state.py` | Daemon state management |
| `daemon/route_tracer.py` | Route-to-component tracing |
| `daemon/daemon_config.yaml` | Daemon configuration file |
| `daemon/agent_00_route_verification.md` | Agent 00 verification protocol |

### Documentation

| File | Purpose |
|------|---------|
| `docs/README.md` | This file - main documentation |
| `docs/pdf-daemon.md` | PDF daemon detailed documentation |
| `docs/pipeline_ideas.md` | Future enhancements and ideas |
