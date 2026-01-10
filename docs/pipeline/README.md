# Pipeline Orchestration System

*Created: 2026-01-10*
*Last Modified: 2026-01-10*

A modular system for orchestrating AI agent pipelines that transform implementation plans into working code through structured stages.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Pipeline Modes](#pipeline-modes)
- [Stages](#stages)
- [Dependency Tracking](#dependency-tracking)
- [Parallel Execution](#parallel-execution)
- [Configuration Reference](#configuration-reference)
- [CLI Reference](#cli-reference)
- [Dashboard](#dashboard)
- [Troubleshooting](#troubleshooting)

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

**Purpose:** Analyze codebase and create technical implementation breakdown.

**Input:** Request from Stage 1
**Output:** `docs/REQ-XXX-*-overview.md`

**Agent Actions:**
- Investigate existing codebase
- Identify files and functions to modify
- Document integration points
- Write dependency section
- Create ordered implementation steps

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

---

## Dependency Tracking

Dependencies are tracked incrementally to support any execution mode.

### How Dependencies Are Captured

1. **During Stage 2:** Agent writes a `## Dependencies` section in overview:

```markdown
## Dependencies

### Depends On
- Task 0.1: Requires item_articles table to exist
- Task 0.2: Needs article_id column in item_links

### Blocks
- Task 0.4: API endpoints depend on this task
- Task 0.6: Data migration needs types defined

### Files Touched
- src/types/Item.ts
- src/api/items.ts

### Parallel Safety
Safe to run in parallel with tasks: 1.1, 1.2, 2.1
```

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
| `--keep` | Keep state file after completion |
| `--list-tasks` | Print extracted tasks and exit |
| `--tasks IDS` | Run only specified tasks (comma-separated) |
| `--stages IDS` | Run only specified stages (comma-separated) |
| `--verbose` | Enable debug logging |

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

| File | Purpose |
|------|---------|
| `pipeline_orchestrator.py` | Core orchestration engine |
| `pipeline_distributor.py` | Parallel execution coordinator |
| `pipeline_dependencies.py` | Dependency extraction and graph |
| `scripts/pipeline-dashboard.py` | Terminal UI for monitoring |
| `scripts/dashboard.sh` | Dashboard launcher script |
| `scripts/extract_dependencies_from_plan.py` | Retroactive dependency extraction |
| `pipeline-*.yaml` | Pipeline configurations |
| `pipeline-*-state.json` | Execution state files |
