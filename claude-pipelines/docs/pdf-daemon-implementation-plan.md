# PDF Pipeline Daemon - Implementation Plan

*Created: 2026-01-11*
*Last Modified: 2026-01-11*
*Status: DRAFT*

## Overview

A daemon system that monitors for incoming PDF files containing feature requests, extracts and parses them using a hybrid Python/Claude approach, then feeds them through the existing pipeline infrastructure.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PDF Pipeline Daemon                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐                                                   │
│  │   File Watcher   │  Monitors ./inbox/ for new PDFs                   │
│  │   (watchdog)     │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │  PDF Extractor   │  Python (pdfplumber) → Raw text (~100ms)          │
│  │  (Python)        │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │  Request Parser  │  Claude Skill → Structured requests (~5-10s)      │
│  │  (Claude Skill)  │  Outputs: Individual PRD files                    │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │     Agent 00     │  Implementation Planner (~5-10 min per request)   │
│  │  (existing)      │  Outputs: Implementation plan .md                 │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │    Agent 00b     │  Pipeline Creator (~2-5 min)                      │
│  │  (existing)      │  Outputs: pipeline-XXX.yaml                       │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │   Orchestrator   │  Existing pipeline_orchestrator.py                │
│  │  (existing)      │  Executes: request → overview → details → impl   │
│  └──────────────────┘                                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. File Watcher (Python)

**Purpose:** Monitor inbox directory for new PDFs

**Library:** `watchdog`

**Behavior:**
- Poll `./inbox/` directory every N seconds
- On new PDF detected, trigger processing pipeline
- Move processed PDFs to `./processed/`
- Move failed PDFs to `./failed/` with error log

### 2. PDF Extractor (Python)

**Purpose:** Fast text extraction from PDF

**Library:** `pdfplumber` (preferred) or `PyPDF2`

**Input:** PDF file path
**Output:** Raw text string

**Why pdfplumber:**
- Better text extraction than PyPDF2
- Handles tables and formatting well
- ~100ms extraction time

### 3. Request Parser (Claude Skill)

**Purpose:** Parse extracted text into structured request objects

**Input:** Raw PDF text (passed via stdin or temp file)
**Output:** Individual PRD markdown files in `docs/prd/intake/`

**Skill Characteristics:**
- Lightweight (no codebase exploration)
- Fast (~5-10 seconds)
- Outputs structured JSON or creates PRD files directly

### 4. Agent 00: Implementation Planner (Existing)

**Purpose:** Create implementation plan from PRD

**Input:** PRD file path
**Output:** Implementation plan markdown

**Invocation:**
```bash
claude -p "use agent 00-implementation-planner for PRD at {prd_path}"
```

### 5. Agent 00b: Pipeline Creator (Existing)

**Purpose:** Generate pipeline YAML from implementation plan

**Input:** Implementation plan path
**Output:** `pipeline-{name}.yaml`

**Invocation:**
```bash
claude -p "use agent 00b-pipeline-creator for plan at {plan_path}"
```

### 6. Orchestrator (Existing)

**Purpose:** Execute the pipeline

**Invocation:**
```bash
python claude-pipelines/pipeline_orchestrator.py --config {yaml_path}
```

---

## File Structure

```
claude-pipelines/
├── daemon/
│   ├── __init__.py
│   ├── pdf_daemon.py           # Main daemon entry point
│   ├── pdf_extractor.py        # PDF text extraction
│   ├── daemon_config.yaml      # Daemon configuration
│   └── state/
│       └── daemon-state.json   # Daemon state tracking
├── skills/
│   └── pdf-request-parser.md   # Claude skill definition
├── inbox/                      # Drop PDFs here
├── processed/                  # Successfully processed PDFs
├── failed/                     # Failed PDFs with error logs
└── docs/
    └── ...
```

---

## Implementation Tasks

### Phase 1: Core Infrastructure (3-4 hours)

#### Task 1.1: Create daemon directory structure
- Create `claude-pipelines/daemon/` directory
- Create `inbox/`, `processed/`, `failed/` directories
- Create `__init__.py`

#### Task 1.2: Implement PDF extractor module
- File: `claude-pipelines/daemon/pdf_extractor.py`
- Function: `extract_text(pdf_path: Path) -> str`
- Use pdfplumber for extraction
- Handle extraction errors gracefully

#### Task 1.3: Create daemon configuration
- File: `claude-pipelines/daemon/daemon_config.yaml`
- Settings: inbox path, poll interval, timeouts, etc.

### Phase 2: Claude Skill (2-3 hours)

#### Task 2.1: Define PDF request parser skill
- File: `claude-pipelines/skills/pdf-request-parser.md`
- Input: Raw PDF text
- Output: Structured JSON with request boundaries
- Define expected PDF structure/delimiters

#### Task 2.2: Create skill invocation wrapper
- Function in daemon to invoke skill via `claude` CLI
- Parse skill output (JSON)
- Create individual PRD files from parsed requests

### Phase 3: Daemon Orchestration (3-4 hours)

#### Task 3.1: Implement main daemon class
- File: `claude-pipelines/daemon/pdf_daemon.py`
- Class: `PipelineDaemon`
- Methods: `start()`, `stop()`, `process_pdf()`, `run_loop()`

#### Task 3.2: Implement file watcher
- Use `watchdog` library
- Monitor `inbox/` directory
- Trigger `process_pdf()` on new files

#### Task 3.3: Implement request processing pipeline
- Call PDF extractor
- Invoke parser skill
- For each request:
  - Invoke Agent 00
  - Invoke Agent 00b
  - Run orchestrator

#### Task 3.4: Add CLI interface
- Entry point: `python -m claude-pipelines.daemon.pdf_daemon`
- Flags: `--config`, `--daemon`, `--status`, `--stop`

### Phase 4: State Management (2-3 hours)

#### Task 4.1: Implement daemon state tracking
- File: `claude-pipelines/daemon/state/daemon-state.json`
- Track: PDFs processed, active pipelines, errors

#### Task 4.2: Add resume capability
- Resume interrupted processing on daemon restart
- Track which stage each PDF reached

#### Task 4.3: Add error handling and logging
- Comprehensive error handling
- Log to `claude-pipelines/daemon/logs/daemon.log`
- Move failed PDFs to `failed/` with error context

---

## Configuration Schema

```yaml
# claude-pipelines/daemon/daemon_config.yaml

daemon:
  inbox_dir: ./claude-pipelines/inbox
  processed_dir: ./claude-pipelines/processed
  failed_dir: ./claude-pipelines/failed
  poll_interval: 30          # seconds
  log_file: ./claude-pipelines/daemon/logs/daemon.log
  state_file: ./claude-pipelines/daemon/state/daemon-state.json

pdf_extraction:
  library: pdfplumber        # or pypdf2
  timeout: 30                # seconds

parser_skill:
  name: pdf-request-parser
  timeout: 60                # seconds
  output_dir: ./docs/prd/intake

agents:
  implementation_planner:
    timeout: 600             # 10 minutes
    allowed_tools: "Read,Write,Bash,Glob,Grep"

  pipeline_creator:
    timeout: 300             # 5 minutes
    allowed_tools: "Read,Write,Glob,Grep"

orchestrator:
  script: ./claude-pipelines/pipeline_orchestrator.py
  default_timeout: 900       # 15 minutes per stage

notifications:
  on_complete: none          # none, log, slack
  on_failure: log
```

---

## Claude Skill Definition

```markdown
# PDF Request Parser Skill

## Purpose
Parse extracted PDF text into structured feature requests.

## Input
Raw text extracted from PDF (via stdin or file path argument)

## Expected PDF Structure
The PDF is generated by another Claude skill and follows this format:

---
## REQUEST 1: [Title]

**Priority:** [High/Medium/Low]
**Category:** [Feature/Bug/Enhancement]

### Description
[Description text]

### Acceptance Criteria
- [Criterion 1]
- [Criterion 2]

---
## REQUEST 2: [Title]
...

## Output Format
JSON array of request objects:

```json
{
  "requests": [
    {
      "id": 1,
      "title": "Feature Title",
      "priority": "High",
      "category": "Feature",
      "description": "Description text...",
      "acceptance_criteria": ["Criterion 1", "Criterion 2"]
    }
  ],
  "metadata": {
    "source_pdf": "filename.pdf",
    "extracted_at": "2026-01-11T12:00:00Z",
    "total_requests": 5
  }
}
```

## Instructions
1. Identify request boundaries (--- delimiters or ## REQUEST headers)
2. Extract structured fields from each request
3. Validate all required fields are present
4. Output valid JSON to stdout
```

---

## Daemon Main Loop (Pseudocode)

```python
class PipelineDaemon:
    def __init__(self, config_path: Path):
        self.config = load_config(config_path)
        self.state = load_state()
        self.running = False

    def start(self):
        """Start the daemon main loop."""
        self.running = True
        logger.info("PDF Pipeline Daemon started")

        while self.running:
            self.check_inbox()
            time.sleep(self.config['daemon']['poll_interval'])

    def check_inbox(self):
        """Check inbox for new PDFs."""
        for pdf_path in Path(self.config['daemon']['inbox_dir']).glob('*.pdf'):
            if not self.is_processed(pdf_path):
                self.process_pdf(pdf_path)

    def process_pdf(self, pdf_path: Path):
        """Process a single PDF through the full pipeline."""
        try:
            # Step 1: Extract text from PDF
            logger.info(f"Extracting text from {pdf_path.name}")
            text = extract_pdf_text(pdf_path)

            # Step 2: Parse requests using Claude skill
            logger.info("Parsing requests with Claude skill")
            requests = self.invoke_parser_skill(text)

            # Step 3: Process each request
            for request in requests:
                self.process_request(request, pdf_path)

            # Step 4: Move to processed
            self.move_to_processed(pdf_path)
            logger.info(f"Successfully processed {pdf_path.name}")

        except Exception as e:
            logger.error(f"Failed to process {pdf_path.name}: {e}")
            self.move_to_failed(pdf_path, str(e))

    def process_request(self, request: dict, source_pdf: Path):
        """Process a single request through agents and orchestrator."""
        # Create PRD file
        prd_path = self.create_prd_file(request)

        # Agent 00: Create implementation plan
        plan_path = self.invoke_agent_00(prd_path)

        # Agent 00b: Create pipeline YAML
        yaml_path = self.invoke_agent_00b(plan_path)

        # Run orchestrator
        self.run_orchestrator(yaml_path)

    def invoke_parser_skill(self, text: str) -> list[dict]:
        """Invoke Claude skill to parse PDF text."""
        result = subprocess.run(
            ["claude", "-p", f"Parse these requests:\n\n{text}"],
            capture_output=True,
            text=True,
            timeout=self.config['parser_skill']['timeout']
        )
        return json.loads(result.stdout)['requests']

    def invoke_agent_00(self, prd_path: Path) -> Path:
        """Invoke implementation planner agent."""
        subprocess.run(
            ["claude", "-p",
             f"use agent 00-implementation-planner for PRD at {prd_path}",
             "--allowedTools", self.config['agents']['implementation_planner']['allowed_tools']],
            timeout=self.config['agents']['implementation_planner']['timeout']
        )
        # Return path to generated plan (convention-based)
        return prd_path.with_suffix('-implementation-plan.md')

    def invoke_agent_00b(self, plan_path: Path) -> Path:
        """Invoke pipeline creator agent."""
        subprocess.run(
            ["claude", "-p",
             f"use agent 00b-pipeline-creator for plan at {plan_path}",
             "--allowedTools", self.config['agents']['pipeline_creator']['allowed_tools']],
            timeout=self.config['agents']['pipeline_creator']['timeout']
        )
        # Return path to generated YAML
        return Path(f"pipeline-{plan_path.stem}.yaml")

    def run_orchestrator(self, yaml_path: Path):
        """Run the pipeline orchestrator."""
        subprocess.run(
            ["python", self.config['orchestrator']['script'],
             "--config", str(yaml_path)],
            timeout=None  # Let orchestrator manage its own timeouts
        )
```

---

## Usage

```bash
# Start daemon in foreground
python -m claude_pipelines.daemon.pdf_daemon --config daemon_config.yaml

# Start daemon in background
python -m claude_pipelines.daemon.pdf_daemon --config daemon_config.yaml --daemon

# Check daemon status
python -m claude_pipelines.daemon.pdf_daemon --status

# Stop daemon
python -m claude_pipelines.daemon.pdf_daemon --stop

# Process single PDF (no daemon)
python -m claude_pipelines.daemon.pdf_daemon --single /path/to/file.pdf
```

---

## Timeline Estimate

| Phase | Tasks | Effort |
|-------|-------|--------|
| Phase 1: Core Infrastructure | 1.1, 1.2, 1.3 | 3-4 hours |
| Phase 2: Claude Skill | 2.1, 2.2 | 2-3 hours |
| Phase 3: Daemon Orchestration | 3.1, 3.2, 3.3, 3.4 | 3-4 hours |
| Phase 4: State Management | 4.1, 4.2, 4.3 | 2-3 hours |
| **Total** | | **10-14 hours** |

---

## Dependencies

### Python Packages
```
pdfplumber>=0.10.0    # PDF text extraction
watchdog>=3.0.0       # File system monitoring
pyyaml>=6.0           # Configuration parsing
```

### External
- Claude CLI (`claude`) installed and authenticated
- Existing agents (00-implementation-planner, 00b-pipeline-creator)
- Existing pipeline_orchestrator.py

---

## Success Criteria

1. **PDF Detection:** Daemon detects new PDFs within poll interval
2. **Text Extraction:** PDF text extracted accurately in <1 second
3. **Request Parsing:** Skill correctly identifies and structures all requests
4. **Agent Integration:** Agents 00 and 00b invoked successfully
5. **Pipeline Execution:** Orchestrator runs to completion
6. **Error Handling:** Failed PDFs moved to failed/ with error context
7. **Resumability:** Daemon can resume after restart

---

## Future Enhancements

1. **Parallel Request Processing:** Process multiple requests concurrently
2. **Web Dashboard:** Status UI for monitoring daemon
3. **Slack/Email Notifications:** Alert on completion/failure
4. **PDF Validation:** Pre-validate PDF structure before processing
5. **Rate Limiting:** Control pipeline execution rate
