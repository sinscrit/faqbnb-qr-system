#!/usr/bin/env python3
"""
Pipeline Orchestrator - Project Agnostic

A thin orchestrator that processes implementation plans through agent pipelines.
All project-specific configuration is read from a YAML config file.

Usage:
    python orchestrator.py --config /path/to/pipeline.yaml
    python orchestrator.py --config ./pipeline.yaml --dry-run
    python orchestrator.py --config ./pipeline.yaml --resume
    python orchestrator.py --config ./pipeline.yaml --keep
    python orchestrator.py --config ./pipeline.yaml --list-tasks

The orchestrator makes NO assumptions about:
- Project structure or paths
- Implementation plan format (defined in YAML)
- Agent names or invocation patterns (defined in YAML)
- Output locations (defined in YAML)
"""

import argparse
import hashlib
import json
import logging
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional, Any, Tuple, List

try:
    import yaml
except ImportError:
    print("Error: PyYAML is required. Install with: pip install pyyaml")
    sys.exit(1)


# =============================================================================
# Logging Setup
# =============================================================================

def setup_logging(log_path: Optional[Path] = None, verbose: bool = False):
    """Configure logging to file and console."""
    log_format = '%(asctime)s [%(levelname)s] %(message)s'
    date_format = '%Y-%m-%d %H:%M:%S'
    
    # Root logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG if verbose else logging.INFO)
    
    # Clear existing handlers
    logger.handlers = []
    
    # Console handler (INFO and above)
    console = logging.StreamHandler(sys.stdout)
    console.setLevel(logging.INFO)
    console.setFormatter(logging.Formatter(log_format, date_format))
    logger.addHandler(console)
    
    # File handler (DEBUG and above) if path provided
    if log_path:
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_path, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(logging.Formatter(log_format, date_format))
        logger.addHandler(file_handler)
        logging.info(f"Logging to: {log_path}")
    
    return logger


# =============================================================================
# Data Structures
# =============================================================================

@dataclass
class Task:
    """Represents a single task extracted from the implementation plan."""
    id: str
    phase: str
    phase_name: str
    title: str
    description: str
    raw_match: str = ""              # Original matched text for debugging
    status: str = "pending"          # pending, processing, completed, failed, skipped
    request_id: Optional[str] = None
    error: Optional[str] = None
    processed_at: Optional[str] = None
    files: Optional[dict] = None     # Track files created for this task: {stage_id: filepath}


# =============================================================================
# Configuration Loading
# =============================================================================

def load_config(config_path: Path) -> dict:
    """Load and validate pipeline configuration."""
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")
    
    config = yaml.safe_load(config_path.read_text(encoding='utf-8'))
    
    # Resolve paths relative to config file location
    config_dir = config_path.parent
    config['_config_dir'] = config_dir
    
    # Resolve source path
    source_path = config.get('source', {}).get('path', '')
    if source_path and not Path(source_path).is_absolute():
        config['source']['_resolved_path'] = config_dir / source_path
    else:
        config['source']['_resolved_path'] = Path(source_path)
    
    # Resolve output paths
    for key in ['requests', 'state', 'logs', 'overviews', 'details']:
        if key in config.get('outputs', {}):
            out_path = config['outputs'][key]
            if out_path and not Path(out_path).is_absolute():
                config['outputs'][f'_{key}_resolved'] = config_dir / out_path
            else:
                config['outputs'][f'_{key}_resolved'] = Path(out_path)
    
    validate_config(config)
    return config


def validate_config(config: dict):
    """Validate required configuration fields."""
    required = [
        ('pipeline.name', config.get('pipeline', {}).get('name')),
        ('source.path', config.get('source', {}).get('path')),
        ('source.extraction', config.get('source', {}).get('extraction')),
        ('outputs.state', config.get('outputs', {}).get('state')),
    ]
    
    # Check for either stages or request_stages
    has_stages = bool(config.get('stages'))
    has_request_stages = bool(config.get('request_stages'))
    
    if not has_stages and not has_request_stages:
        required.append(('stages or request_stages', None))
    
    missing = [name for name, value in required if not value]
    if missing:
        raise ValueError(f"Missing required config fields: {', '.join(missing)}")
    
    # Validate extraction patterns
    extraction = config['source']['extraction']
    if 'task_pattern' not in extraction:
        raise ValueError("source.extraction.task_pattern is required")


# =============================================================================
# Task Extraction (Pattern-Driven)
# =============================================================================

def extract_tasks(config: dict) -> list[Task]:
    """
    Extract tasks from source document using patterns defined in config.
    
    Config structure expected:
        source:
          extraction:
            task_pattern: "regex with named groups"
            task_groups:
              id: "group_name"
              title: "group_name"
            phase_pattern: "regex with named groups" (optional)
            phase_groups:
              number: "group_name"
              name: "group_name"
            description:
              mode: "following_bullets" | "same_line" | "none"
              end_patterns: ["regex1", "regex2"]
    """
    source_path = config['source']['_resolved_path']
    if not source_path.exists():
        raise FileNotFoundError(f"Source file not found: {source_path}")
    
    content = source_path.read_text(encoding='utf-8')
    extraction = config['source']['extraction']
    
    tasks = []
    
    # Compile patterns
    task_pattern = re.compile(extraction['task_pattern'], re.MULTILINE)
    task_groups = extraction.get('task_groups', {'id': 1, 'title': 2})
    
    phase_pattern = None
    phase_groups = {}
    if 'phase_pattern' in extraction:
        phase_pattern = re.compile(extraction['phase_pattern'], re.MULTILINE)
        phase_groups = extraction.get('phase_groups', {'number': 1, 'name': 2})
    
    # Find all phases and their positions
    phases = []
    if phase_pattern:
        for m in phase_pattern.finditer(content):
            phase_num = m.group(phase_groups.get('number', 1))
            phase_name = m.group(phase_groups.get('name', 2))
            phases.append((m.start(), phase_num, phase_name.strip()))
    
    # If no phase pattern or no matches, use a default single phase
    if not phases:
        phases = [(0, "1", "Default")]
    
    # Find all tasks
    for match in task_pattern.finditer(content):
        task_pos = match.start()
        
        # Extract task fields using configured group references
        id_group = task_groups.get('id', 1)
        title_group = task_groups.get('title', 2)
        
        try:
            task_id = match.group(id_group)
        except (IndexError, re.error):
            task_id = f"unknown-{len(tasks)}"
        
        try:
            task_title = match.group(title_group)
        except (IndexError, re.error):
            task_title = "Unknown task"
        
        # Determine phase
        current_phase = phases[0][1]
        current_phase_name = phases[0][2]
        for i, (phase_pos, phase_num, phase_name) in enumerate(phases):
            next_phase_pos = phases[i + 1][0] if i + 1 < len(phases) else len(content)
            if phase_pos <= task_pos < next_phase_pos:
                current_phase = phase_num
                current_phase_name = phase_name
                break
        
        # Extract description
        description = extract_description(content, match.end(), extraction)
        
        tasks.append(Task(
            id=str(task_id).strip(),
            phase=str(current_phase),
            phase_name=current_phase_name,
            title=task_title.strip(),
            description=description,
            raw_match=match.group(0)
        ))
    
    return tasks


def extract_description(content: str, start_pos: int, extraction: dict) -> str:
    """Extract task description based on configured mode."""
    desc_config = extraction.get('description', {})
    mode = desc_config.get('mode', 'following_bullets')
    
    if mode == 'none':
        return ""
    
    if mode == 'same_line':
        # Description is on the same line after the match
        line_end = content.find('\n', start_pos)
        if line_end == -1:
            return content[start_pos:].strip()
        return content[start_pos:line_end].strip()
    
    # Default: following_bullets
    end_patterns = desc_config.get('end_patterns', [
        r'^\s*-\s*\[\s*\]\s*\*\*',  # Next task
        r'^###\s+',                  # Next section
        r'^##\s+',                   # Next major section
        r'^\|\s*Task',               # Table
    ])
    
    # Compile end patterns
    compiled_ends = [re.compile(p, re.MULTILINE) for p in end_patterns]
    
    # Find end of current line
    line_end = content.find('\n', start_pos)
    if line_end == -1:
        return ""
    
    description_lines = []
    pos = line_end + 1
    
    while pos < len(content):
        next_newline = content.find('\n', pos)
        if next_newline == -1:
            line = content[pos:]
            next_newline = len(content)
        else:
            line = content[pos:next_newline]
        
        # Check end patterns
        should_stop = False
        for pattern in compiled_ends:
            if pattern.match(line):
                should_stop = True
                break
        
        if should_stop:
            break
        
        stripped = line.strip()
        
        # Include bullet points
        if stripped.startswith('- ') or stripped.startswith('* '):
            description_lines.append(stripped[2:])
        elif stripped and description_lines:
            # Continuation line
            description_lines[-1] += ' ' + stripped
        
        pos = next_newline + 1
    
    return '\n'.join(description_lines)


# =============================================================================
# State Management
# =============================================================================

def compute_file_hash(path: Path) -> str:
    """Compute MD5 hash of file for change detection."""
    return hashlib.md5(path.read_bytes()).hexdigest()


def load_state(state_path: Path) -> Optional[dict]:
    """Load pipeline state from JSON file."""
    if state_path.exists():
        state = json.loads(state_path.read_text(encoding='utf-8'))
        # Migrate: ensure per-stage completion flags exist based on files present
        migrate_stage_completion_flags(state)
        return state
    return None


def migrate_stage_completion_flags(state: dict):
    """
    Migrate legacy state: add per-stage completion flags based on files present.

    This ensures tasks that have output files from previous runs (before the
    per-stage tracking was added) get their {stage_id}_completed flags set.
    """
    for task_dict in state.get('tasks', []):
        files = task_dict.get('files', {})

        # If task has request file but no request_completed flag, add it
        if files.get('request') and not task_dict.get('request_completed'):
            task_dict['request_completed'] = True

        # If task has overview file but no overview_completed flag, add it
        if files.get('overview') and not task_dict.get('overview_completed'):
            task_dict['overview_completed'] = True

        # If task has details file but no details_completed flag, add it
        if files.get('details') and not task_dict.get('details_completed'):
            task_dict['details_completed'] = True

        # If task has implementation file but no implementation_completed flag, add it
        if files.get('implementation') and not task_dict.get('implementation_completed'):
            task_dict['implementation_completed'] = True

        # If task has verification but no testcheck_completed flag, add it
        if files.get('verification') and not task_dict.get('testcheck_completed'):
            task_dict['testcheck_completed'] = True


def save_state(state: dict, state_path: Path):
    """Save pipeline state to JSON file."""
    state['updated_at'] = datetime.now().isoformat()
    
    # Ensure parent directory exists
    state_path.parent.mkdir(parents=True, exist_ok=True)
    
    state_path.write_text(
        json.dumps(state, indent=2, default=str),
        encoding='utf-8'
    )


def initialize_state(config: dict, tasks: list[Task]) -> dict:
    """Create initial pipeline state from config and extracted tasks."""
    source_path = config['source']['_resolved_path']
    
    # Determine pipeline mode
    mode = config.get('pipeline', {}).get('mode', 'horizontal')
    
    # Build stages dict from config
    stages = {}
    stage_list = config.get('stages', []) or config.get('request_stages', [])
    for stage in stage_list:
        stage_id = stage['id']
        stages[stage_id] = {
            "status": "pending" if stage.get('enabled', True) else "disabled",
            "started_at": None,
            "completed_at": None,
            "tasks_total": len(tasks) if stage.get('enabled', True) else 0,
            "tasks_completed": 0,
            "tasks_failed": 0,
            "current_task_index": 0
        }
    
    # Initialize tasks with files tracking
    task_dicts = []
    for t in tasks:
        td = asdict(t)
        if td.get('files') is None:
            td['files'] = {}
        task_dicts.append(td)
    
    return {
        "pipeline": config['pipeline']['name'],
        "version": config['pipeline'].get('version', '1.0'),
        "mode": mode,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "status": "not_started",
        "current_stage": stage_list[0]['id'] if stage_list else None,
        "current_task_index": 0,
        "source_file": str(source_path),
        "source_hash": compute_file_hash(source_path),
        "tasks": task_dicts,
        "stages": stages,
        "errors": [],
        "metadata": {
            "total_requests_generated": 0,
            "last_request_id": None,
            "first_request_id": None,
            "config_file": str(config.get('_config_path', 'unknown'))
        }
    }


# =============================================================================
# Precheck Functions
# =============================================================================

def get_implementation_config(config: dict) -> dict:
    """
    Extract implementation configuration from pipeline config.
    Returns technology context and required tools.
    """
    impl_config = config.get('implementation', {})
    return {
        'technology': impl_config.get('technology', {}),
        'required_tools': impl_config.get('required_tools', []),
        'precheck': impl_config.get('precheck', {}),
    }


def get_precheck_status(state: dict) -> Optional[dict]:
    """Get precheck status from state, if it exists."""
    return state.get('precheck')


def is_precheck_required(state: dict, config: dict) -> bool:
    """
    Determine if precheck needs to run.
    Returns True if:
    - No precheck has been run yet
    - Required tools are specified in config
    """
    impl_config = get_implementation_config(config)
    required_tools = impl_config.get('required_tools', [])

    # No required tools = no precheck needed
    if not required_tools:
        return False

    # Check if precheck already exists in state
    precheck = get_precheck_status(state)
    if precheck and precheck.get('status') in ['passed', 'failed']:
        return False

    return True


def build_precheck_prompt(config: dict) -> str:
    """
    Build the prompt for the lightweight precheck agent.
    """
    impl_config = get_implementation_config(config)
    required_tools = impl_config.get('required_tools', [])

    tool_checks = []
    for tool in required_tools:
        if tool == 'playwright_mcp':
            tool_checks.append("""
**Tool: playwright_mcp**
- This tool requires Chrome to be running with CDP (Chrome DevTools Protocol) on port 9223
- Verify Playwright MCP is available by taking a browser snapshot using browser_snapshot
- If the tool fails or times out, it likely means Chrome is NOT running with remote debugging

To start Chrome with CDP enabled, run:
```
/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9223 --user-data-dir=/tmp/chrome-debug
```
""")
        # Add other tool checks as needed in the future

    prompt = f"""You are a lightweight precheck agent. Your ONLY job is to verify that required tools are available.

**Required Tools to Verify:**
{chr(10).join(tool_checks)}

**Instructions:**
1. For each tool listed above, attempt to use it
2. If browser_snapshot fails or you cannot connect, report it as unavailable
3. Report the result in this EXACT format (JSON):

```json
{{
  "tools": {{
    "playwright_mcp": {{
      "available": true/false,
      "notes": "Description of result or error message"
    }}
  }},
  "all_passed": true/false
}}
```

4. Do NOT do anything else - no implementation, no file changes
5. Be concise - this is just a verification step

Begin verification now.
"""
    return prompt


def run_precheck(config: dict, state: dict, force: bool = False) -> Tuple[bool, dict]:
    """
    Run precheck to verify required tools are available.

    Args:
        config: Pipeline configuration
        state: Pipeline state
        force: If True, run precheck even if already done

    Returns:
        Tuple of (success, precheck_result)
    """
    impl_config = get_implementation_config(config)
    required_tools = impl_config.get('required_tools', [])
    precheck_timeout = impl_config.get('precheck', {}).get('timeout', 120)

    # Check if precheck already done and not forcing
    if not force:
        existing = get_precheck_status(state)
        if existing and existing.get('status') == 'passed':
            print(f"  Precheck already passed at {existing.get('completed_at', 'unknown')}")
            return True, existing

    if not required_tools:
        print("  No required tools configured, skipping precheck")
        result = {
            'status': 'passed',
            'completed_at': datetime.now().isoformat(),
            'tools': {},
            'notes': 'No required tools configured'
        }
        return True, result

    print(f"\n{'='*60}")
    print("Running Precheck")
    print(f"  Required tools: {', '.join(required_tools)}")
    print(f"  Timeout: {precheck_timeout}s")
    print(f"{'='*60}")

    # Build prompt
    prompt = build_precheck_prompt(config)

    # Invoke lightweight agent
    command = [
        "claude",
        "-p",
        prompt,
        "--allowedTools",
        "mcp__playwright__browser_snapshot,mcp__playwright__browser_navigate"
    ]

    logging.info(f"Running precheck for tools: {required_tools}")

    try:
        start_time = time.time()
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=precheck_timeout,
            cwd=config.get('_config_dir', Path.cwd())
        )
        elapsed = time.time() - start_time
        elapsed_str = format_duration(elapsed)

        if result.returncode == 0:
            # Parse the output to find JSON result
            output = result.stdout

            # Try to extract JSON from output
            json_match = re.search(r'```json\s*(.*?)\s*```', output, re.DOTALL)
            if json_match:
                try:
                    parsed = json.loads(json_match.group(1))
                    all_passed = parsed.get('all_passed', False)
                    tools_result = parsed.get('tools', {})
                except json.JSONDecodeError:
                    # Fallback: assume passed if agent completed successfully
                    all_passed = True
                    tools_result = {tool: {'available': True, 'notes': 'Agent completed'} for tool in required_tools}
            else:
                # No JSON found, check if output suggests success
                all_passed = 'error' not in output.lower() and 'fail' not in output.lower()
                tools_result = {tool: {'available': all_passed, 'notes': 'Inferred from output'} for tool in required_tools}

            precheck_result = {
                'status': 'passed' if all_passed else 'failed',
                'completed_at': datetime.now().isoformat(),
                'elapsed': elapsed_str,
                'tools': tools_result,
            }

            if all_passed:
                logging.info(f"Precheck passed in {elapsed_str}")
                print(f"  ✓ Precheck passed ({elapsed_str})")
                for tool, info in tools_result.items():
                    status = "✓" if info.get('available') else "✗"
                    print(f"    {status} {tool}: {info.get('notes', 'OK')}")
            else:
                logging.warning(f"Precheck failed: some tools unavailable")
                print(f"  ✗ Precheck failed ({elapsed_str})")
                for tool, info in tools_result.items():
                    status = "✓" if info.get('available') else "✗"
                    print(f"    {status} {tool}: {info.get('notes', 'Unknown')}")

            return all_passed, precheck_result
        else:
            error_msg = result.stderr[:200] if result.stderr else "Unknown error"
            logging.error(f"Precheck agent failed: {error_msg}")
            precheck_result = {
                'status': 'failed',
                'completed_at': datetime.now().isoformat(),
                'elapsed': elapsed_str,
                'tools': {tool: {'available': False, 'notes': 'Agent failed'} for tool in required_tools},
                'error': error_msg
            }
            print(f"  ✗ Precheck agent failed ({elapsed_str}): {error_msg[:60]}...")
            return False, precheck_result

    except subprocess.TimeoutExpired:
        logging.error(f"Precheck timed out after {precheck_timeout}s")
        precheck_result = {
            'status': 'failed',
            'completed_at': datetime.now().isoformat(),
            'tools': {tool: {'available': False, 'notes': 'Timeout'} for tool in required_tools},
            'error': f'Timeout after {precheck_timeout}s'
        }
        print(f"  ✗ Precheck timed out after {precheck_timeout}s")
        return False, precheck_result
    except Exception as e:
        logging.exception(f"Precheck error: {e}")
        precheck_result = {
            'status': 'failed',
            'completed_at': datetime.now().isoformat(),
            'tools': {tool: {'available': False, 'notes': str(e)} for tool in required_tools},
            'error': str(e)
        }
        print(f"  ✗ Precheck error: {e}")
        return False, precheck_result


def build_project_context_prompt(config: dict, state: dict) -> str:
    """
    Build the project context string to inject into implementation agent prompt.
    Based on technology config and precheck results.
    """
    impl_config = get_implementation_config(config)
    technology = impl_config.get('technology', {})
    precheck = get_precheck_status(state) or {}

    context_lines = ["**Project Context** (from pipeline configuration):"]

    # Database context
    db = technology.get('database', 'unknown')
    if db == 'none':
        context_lines.append("- Database: NONE - This project has no database. Skip all database-related checks and operations.")
    elif db:
        context_lines.append(f"- Database: {db}")

    # Browser testing context
    browser_testing = technology.get('browser_testing', False)
    if browser_testing:
        # Check precheck results for playwright
        playwright_status = precheck.get('tools', {}).get('playwright_mcp', {})
        if playwright_status.get('available', False):
            context_lines.append("- Browser Testing: Playwright MCP is AVAILABLE and verified. Use it for browser-based verification.")
        else:
            context_lines.append("- Browser Testing: Playwright MCP configured but NOT verified. Browser testing may not work.")
    else:
        context_lines.append("- Browser Testing: Not required for this project.")

    # Add any other technology context as needed

    return "\n".join(context_lines)


# =============================================================================
# Request ID Tracking
# =============================================================================

def parse_request_ids_from_file(requests_file: Path) -> List[str]:
    """
    Parse all REQ-XXX IDs from the requests file.
    Returns a list of IDs in order of appearance.
    """
    if not requests_file.exists():
        return []
    
    content = requests_file.read_text(encoding='utf-8')
    
    # Match REQ-XXX pattern (e.g., REQ-001, REQ-042)
    pattern = re.compile(r'\bREQ-(\d+)\b')
    matches = pattern.findall(content)
    
    # Return unique IDs preserving order
    seen = set()
    ids = []
    for num in matches:
        req_id = f"REQ-{num}"
        if req_id not in seen:
            seen.add(req_id)
            ids.append(req_id)
    
    return ids


def get_last_request_id(requests_file: Path) -> Optional[str]:
    """Get the last REQ-XXX ID from the requests file."""
    ids = parse_request_ids_from_file(requests_file)
    return ids[-1] if ids else None


def get_request_id_number(req_id: str) -> int:
    """Extract the numeric part from REQ-XXX."""
    match = re.search(r'REQ-(\d+)', req_id)
    return int(match.group(1)) if match else 0


def delete_requests_in_range(requests_file: Path, first_id: str, last_id: str, config: dict = None) -> bool:
    """
    Delete requests from first_id through last_id (inclusive) from the file.
    Also deletes associated overview and details files if config is provided.
    Returns True if successful.
    """
    if not requests_file.exists():
        return True
    
    first_num = get_request_id_number(first_id)
    last_num = get_request_id_number(last_id)
    
    if first_num == 0 or last_num == 0:
        return False
    
    content = requests_file.read_text(encoding='utf-8')
    
    # Split into sections by the --- separator before ## REQ-XXX
    # Pattern matches: ---\n\n## REQ-XXX: ... until next --- or end
    sections = re.split(r'(?=---\s*\n\s*## REQ-)', content)
    
    # Keep sections that are NOT in the range to delete
    kept_sections = []
    deleted_count = 0
    
    for section in sections:
        # Check if this section contains a REQ-XXX header
        match = re.search(r'## REQ-(\d+):', section)
        if match:
            req_num = int(match.group(1))
            if first_num <= req_num <= last_num:
                # Skip this section (delete it)
                deleted_count += 1
                continue
        
        kept_sections.append(section)
    
    # Reassemble the file
    new_content = ''.join(kept_sections)
    
    # Clean up any trailing whitespace or extra separators
    new_content = re.sub(r'\n{3,}', '\n\n', new_content)
    new_content = new_content.rstrip() + '\n'
    
    # Write back
    requests_file.write_text(new_content, encoding='utf-8')
    
    print(f"  Deleted {deleted_count} requests ({first_id} through {last_id})")
    
    # Delete associated overview and details files
    if config:
        deleted_files = 0
        
        # Get output directories
        overviews_dir = config['outputs'].get('_overviews_resolved')
        details_dir = config['outputs'].get('_details_resolved')
        
        for req_num in range(first_num, last_num + 1):
            req_id = f"REQ-{req_num:03d}"
            
            # Delete overview files matching pattern REQ-XXX-*-overview.md
            if overviews_dir and overviews_dir.exists():
                for overview_file in overviews_dir.glob(f"{req_id}-*-overview.md"):
                    overview_file.unlink()
                    deleted_files += 1
                # Also check old pattern without slug
                old_pattern = overviews_dir / f"{req_id}-overview.md"
                if old_pattern.exists():
                    old_pattern.unlink()
                    deleted_files += 1
            
            # Delete details files matching pattern REQ-XXX-*-detailed.md
            if details_dir and details_dir.exists():
                for details_file in details_dir.glob(f"{req_id}-*-detailed.md"):
                    details_file.unlink()
                    deleted_files += 1
                # Also check old patterns
                for old_pattern_name in [f"{req_id}-details.md", f"{req_id}-detailed.md"]:
                    old_pattern = details_dir / old_pattern_name
                    if old_pattern.exists():
                        old_pattern.unlink()
                        deleted_files += 1
        
        if deleted_files > 0:
            print(f"  Deleted {deleted_files} associated files (overviews/details)")
    
    return True


def verify_requests_file_state(
    requests_file: Path, 
    state: dict
) -> Tuple[bool, Optional[str]]:
    """
    Verify that the requests file matches what we expect from state.
    Returns (is_valid, warning_message).
    """
    metadata = state.get('metadata', {})
    expected_first = metadata.get('first_request_id')
    expected_last = metadata.get('last_request_id')
    
    if not expected_first or not expected_last:
        return True, None
    
    actual_ids = parse_request_ids_from_file(requests_file)
    
    if not actual_ids:
        return False, f"Requests file is empty but state shows {expected_first} to {expected_last}"
    
    # Check if expected range exists in file
    expected_first_num = get_request_id_number(expected_first)
    expected_last_num = get_request_id_number(expected_last)
    
    actual_nums = [get_request_id_number(id) for id in actual_ids]
    
    # Check if our range is present
    range_present = all(
        num in actual_nums 
        for num in range(expected_first_num, expected_last_num + 1)
    )
    
    if not range_present:
        return False, f"Expected {expected_first} through {expected_last} but file has been modified"
    
    return True, None


# =============================================================================
# Agent Invocation
# =============================================================================

def format_task_for_agent(task: Task, template: str, task_dict: dict = None,
                          config: dict = None, state: dict = None, stage_id: str = None) -> str:
    """
    Format a task into a prompt using the configured template.

    Available template variables:
      {task_id}, {task_title}, {task_title_slug}, {task_description},
      {phase}, {phase_name}, {full_task},
      {request_id}, {request_id_num}, {request_title},
      {overview_file}, {details_file},
      {implementation_plan_path}, {requests_file_path},
      {project_context}
    """
    full_task = f"Phase {task.phase} ({task.phase_name}), Task {task.id}: {task.title}"
    if task.description:
        full_task += "\nDetails:\n"
        for line in task.description.split('\n'):
            if line.strip():
                full_task += f"  - {line.strip()}\n"
    
    # Get request_id from task_dict if available
    request_id = task_dict.get('request_id', '') if task_dict else ''
    request_id_num = request_id.replace('REQ-', '').replace('req-', '') if request_id else ''
    request_title = task.title
    
    # Create slug from title (lowercase, hyphens, no special chars)
    import re
    title_slug = task.title.lower()
    title_slug = re.sub(r'[^a-z0-9\s-]', '', title_slug)  # Remove special chars
    title_slug = re.sub(r'\s+', '-', title_slug)           # Spaces to hyphens
    title_slug = re.sub(r'-+', '-', title_slug)            # Collapse multiple hyphens
    title_slug = title_slug.strip('-')                      # Remove leading/trailing hyphens
    # Truncate to reasonable length
    if len(title_slug) > 50:
        title_slug = title_slug[:50].rsplit('-', 1)[0]
    
    # Get file paths from task_dict if available
    files = task_dict.get('files', {}) if task_dict else {}
    overview_file = files.get('overview', '')
    details_file = files.get('details', '')
    
    # Get paths from config
    implementation_plan_path = ''
    requests_file_path = ''
    if config:
        source_path = config.get('source', {}).get('_resolved_path')
        if source_path:
            implementation_plan_path = str(source_path)
        requests_path = config.get('outputs', {}).get('_requests_resolved')
        if requests_path:
            requests_file_path = str(requests_path)
    
    # Format task description with proper indentation for multi-line
    task_description_formatted = task.description.replace('\n', '\n        ') if task.description else ''

    # Build project context for implementation stage
    project_context = ''
    if stage_id == 'implementation' and config and state:
        project_context = build_project_context_prompt(config, state)

    return template.format(
        task_id=task.id,
        task_title=task.title,
        task_title_slug=title_slug,
        task_description=task.description,
        task_description_formatted=task_description_formatted,
        phase=task.phase,
        phase_name=task.phase_name,
        full_task=full_task,
        request_id=request_id,
        request_id_num=request_id_num,
        request_title=request_title,
        overview_file=overview_file,
        details_file=details_file,
        implementation_plan_path=implementation_plan_path,
        requests_file_path=requests_file_path,
        project_context=project_context,
    )


def invoke_agent(task: Task, stage_config: dict, dry_run: bool = False,
                 task_dict: dict = None, config: dict = None,
                 state: dict = None, stage_id: str = None) -> tuple[bool, Optional[str]]:
    """
    Invoke the configured agent for a single task.

    Stage config expected:
        agent:
          invocation_template: "prompt template with {full_task}"
          command: ["claude", "-p", "{prompt}"]
          timeout: 120  (optional, overrides global default)

    Global default from config:
        pipeline:
          default_timeout: 900  (15 minutes)
    """
    import time

    agent_config = stage_config.get('agent', {})
    agent_name = agent_config.get('name', 'unknown')

    # Get invocation template
    template = agent_config.get('invocation_template',
                                agent_config.get('invocation',
                                                 'Process this task: {full_task}'))

    prompt = format_task_for_agent(task, template, task_dict, config, state, stage_id)
    
    logging.debug(f"Agent: {agent_name}, Task: {task.id}")
    logging.debug(f"Prompt (first 200 chars): {prompt[:200]}...")
    
    if dry_run:
        print(f"    [DRY RUN] Would invoke: {agent_name}")
        print(f"    Prompt: {prompt[:80]}...")
        logging.debug(f"[DRY RUN] Skipped invocation for {agent_name}")
        return True, None
    
    # Get command template
    command_template = agent_config.get('command', ['claude', '-p', '{prompt}'])
    
    # Get timeout: stage-specific > global default > hardcoded default (900s = 15 min)
    global_timeout = config.get('pipeline', {}).get('default_timeout', 900) if config else 900
    timeout = agent_config.get('timeout', global_timeout)
    
    # Build actual command
    command = []
    for part in command_template:
        if '{prompt}' in part:
            command.append(part.replace('{prompt}', prompt))
        else:
            command.append(part)
    
    # Include request_id in log if available
    request_id = task_dict.get('request_id', '') if task_dict else ''
    req_info = f" [{request_id}]" if request_id else ""
    logging.info(f"Invoking {agent_name} for task {task.id}{req_info} (timeout: {timeout}s)")
    logging.debug(f"Command: {command[0]} ... (args hidden)")
    
    start_time = time.time()
    
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=stage_config.get('working_directory')
        )
        
        elapsed = time.time() - start_time
        elapsed_str = format_duration(elapsed)
        
        if result.returncode == 0:
            logging.info(f"Agent {agent_name} completed successfully for task {task.id}{req_info} in {elapsed_str}")
            logging.debug(f"Stdout (first 500 chars): {result.stdout[:500] if result.stdout else 'empty'}")
            return True, None
        else:
            error_msg = f"Exit code {result.returncode}: {result.stderr[:500]}"
            logging.error(f"Agent {agent_name} failed for task {task.id}{req_info} after {elapsed_str}: {error_msg}")
            return False, error_msg
            
    except subprocess.TimeoutExpired:
        elapsed = time.time() - start_time
        elapsed_str = format_duration(elapsed)
        error_msg = f"Agent timed out ({timeout}s)"
        logging.error(f"Agent {agent_name} timed out for task {task.id}{req_info} after {elapsed_str}")
        return False, error_msg
    except FileNotFoundError as e:
        error_msg = f"Command not found: {command[0]}. Ensure it's in PATH."
        logging.error(f"Command not found: {command[0]}")
        return False, error_msg
    except Exception as e:
        elapsed = time.time() - start_time
        elapsed_str = format_duration(elapsed)
        error_msg = f"Unexpected error: {str(e)}"
        logging.exception(f"Unexpected error invoking {agent_name} for task {task.id}{req_info} after {elapsed_str}")
        return False, error_msg


def format_duration(seconds: float) -> str:
    """Format duration in human-readable form."""
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins}m {secs}s"
    else:
        hours = int(seconds // 3600)
        mins = int((seconds % 3600) // 60)
        return f"{hours}h {mins}m"


def run_task_stages(
    task: Task,
    task_dict: dict,
    config: dict,
    state: dict,
    dry_run: bool = False,
    stage_filter: Optional[List[str]] = None
) -> bool:
    """
    Run all stages for a single task (vertical/per-request mode).
    Returns True if all stages completed successfully.

    Args:
        stage_filter: Optional list of stage IDs to run. If None, run all stages.
    """
    import time

    request_stages = config.get('request_stages', [])
    requests_file = config['outputs'].get('_requests_resolved')
    retry_config = config.get('retry', {})
    max_retries = retry_config.get('max_attempts', 2)
    on_failure = retry_config.get('on_failure', 'skip_and_log')

    for stage in request_stages:
        if not stage.get('enabled', True):
            continue

        # Skip stages not in filter (if filter is specified)
        if stage_filter and stage['id'] not in stage_filter:
            continue
        
        stage_id = stage['id']
        agent_name = stage.get('agent', {}).get('name', stage_id)

        print(f"  → {stage.get('name', stage_id)}: {agent_name}")

        # Check stage dependencies
        if stage_id == 'overview' and not task_dict.get('request_id'):
            print(f"    ✗ Skipping: No request_id (request stage not completed)")
            return False

        if stage_id == 'details' and not task_dict.get('files', {}).get('overview'):
            print(f"    ✗ Skipping: No overview file (overview stage not completed)")
            return False

        if stage_id == 'implementation' and not task_dict.get('files', {}).get('details'):
            print(f"    ✗ Skipping: No details file (details stage not completed)")
            return False

        if stage_id == 'testcheck' and not task_dict.get('implementation_completed'):
            print(f"    ✗ Skipping: Implementation stage not completed")
            return False

        # Attempt invocation with retries
        success = False
        error = None
        
        stage_start = time.time()
        
        for attempt in range(max_retries):
            if attempt > 0:
                print(f"    Retry {attempt + 1}/{max_retries}")

            success, error = invoke_agent(task, stage, dry_run, task_dict, config, state, stage_id)

            if success:
                break
        
        stage_elapsed = time.time() - stage_start
        stage_elapsed_str = format_duration(stage_elapsed)
        
        if not success:
            print(f"    ✗ Failed ({stage_elapsed_str}): {error[:60] if error else 'unknown'}...")
            task_dict['error'] = f"Stage {stage_id}: {error}"
            
            if on_failure == 'stop':
                return False
            elif on_failure == 'skip_and_log':
                state['errors'].append({
                    'stage': stage_id,
                    'task_id': task.id,
                    'error': error,
                    'timestamp': datetime.now().isoformat()
                })
                return False
            # continue = try next stage anyway (probably not useful for vertical)
        
        # Mark stage as completed for this task
        if not dry_run:
            task_dict[f'{stage_id}_completed'] = True

        # Track output based on stage type
        if stage_id == 'request' and requests_file and not dry_run:
            # Track request ID
            new_last_id = get_last_request_id(requests_file)
            task_dict['request_id'] = new_last_id
            task_dict['files']['request'] = f"{requests_file}#{new_last_id}"
            
            # Update global metadata
            state['metadata']['last_request_id'] = new_last_id
            if not state['metadata'].get('first_request_id'):
                state['metadata']['first_request_id'] = new_last_id
            
            print(f"    ✓ Created {new_last_id} ({stage_elapsed_str})")
            
        elif stage_id == 'overview' and not dry_run:
            # Track overview file
            output_config = stage.get('output', {})
            if output_config.get('type') == 'file':
                directory = config['outputs'].get('_overviews_resolved', Path('./docs/overviews'))
                filename_template = output_config.get('filename', '{request_id}-{task_title_slug}-overview.md')
                
                # Create slug for filename
                import re
                title_slug = task.title.lower()
                title_slug = re.sub(r'[^a-z0-9\s-]', '', title_slug)
                title_slug = re.sub(r'\s+', '-', title_slug)
                title_slug = re.sub(r'-+', '-', title_slug)
                title_slug = title_slug.strip('-')
                if len(title_slug) > 50:
                    title_slug = title_slug[:50].rsplit('-', 1)[0]
                
                filename = filename_template.format(
                    request_id=task_dict.get('request_id', 'unknown'),
                    task_title_slug=title_slug
                )
                filepath = directory / filename
                task_dict['files']['overview'] = str(filepath)
                print(f"    ✓ Created {filepath.name} ({stage_elapsed_str})")
            else:
                print(f"    ✓ Completed ({stage_elapsed_str})")
                
        elif stage_id == 'details' and not dry_run:
            # Track details file
            output_config = stage.get('output', {})
            if output_config.get('type') == 'file':
                directory = config['outputs'].get('_details_resolved', Path('./docs/details'))
                filename_template = output_config.get('filename', '{request_id}-{task_title_slug}-detailed.md')
                
                # Create slug for filename
                import re
                title_slug = task.title.lower()
                title_slug = re.sub(r'[^a-z0-9\s-]', '', title_slug)
                title_slug = re.sub(r'\s+', '-', title_slug)
                title_slug = re.sub(r'-+', '-', title_slug)
                title_slug = title_slug.strip('-')
                if len(title_slug) > 50:
                    title_slug = title_slug[:50].rsplit('-', 1)[0]
                
                filename = filename_template.format(
                    request_id=task_dict.get('request_id', 'unknown'),
                    task_title_slug=title_slug
                )
                filepath = directory / filename
                task_dict['files']['details'] = str(filepath)
                print(f"    ✓ Created {filepath.name} ({stage_elapsed_str})")
            else:
                print(f"    ✓ Completed ({stage_elapsed_str})")

        elif stage_id == 'testcheck' and not dry_run:
            # Track verification results
            task_dict['files']['verification'] = True

            # Check if this is the last task - if so, record test harness info
            tasks = state.get('tasks', [])
            task_index = next((i for i, t in enumerate(tasks) if t.get('id') == task.id), -1)
            is_last_task = (task_index == len(tasks) - 1)

            if is_last_task:
                # Initialize verification summary in state
                if 'verification' not in state:
                    state['verification'] = {
                        'completed_at': datetime.now().isoformat(),
                        'status': 'completed',
                        'tasks_verified': 0,
                        'discrepancies': [],
                        'test_harness_url': None
                    }
                print(f"    ✓ Verification complete - test harness deployed ({stage_elapsed_str})")
            else:
                print(f"    ✓ Verified ({stage_elapsed_str})")
        else:
            if not dry_run:
                print(f"    ✓ Completed ({stage_elapsed_str})")
            else:
                print(f"    ✓ Completed")

    return True


# =============================================================================
# Pipeline Execution
# =============================================================================

def get_enabled_stage(config: dict, stage_id: str) -> Optional[dict]:
    """Get stage config by ID if enabled."""
    for stage in config.get('stages', []):
        if stage['id'] == stage_id and stage.get('enabled', True):
            return stage
    return None


def parse_stage_filter(stages_str: str, config: dict) -> List[str]:
    """
    Parse stage filter string into list of stage IDs.
    Accepts stage names (request, overview, details) or numbers (1, 2, 3).

    Examples:
        "3" -> ["details"]
        "details" -> ["details"]
        "2,3" -> ["overview", "details"]
        "overview,details" -> ["overview", "details"]
    """
    request_stages = config.get('request_stages', []) or config.get('stages', [])

    # Build mapping of number -> stage_id
    stage_ids = [s['id'] for s in request_stages if s.get('enabled', True)]
    num_to_id = {str(i+1): stage_ids[i] for i in range(len(stage_ids))}

    result = []
    for part in stages_str.split(','):
        part = part.strip().lower()
        if not part:
            continue

        # Check if it's a number
        if part in num_to_id:
            stage_id = num_to_id[part]
            if stage_id not in result:
                result.append(stage_id)
        # Check if it's a valid stage name
        elif part in stage_ids:
            if part not in result:
                result.append(part)
        else:
            print(f"Warning: Unknown stage '{part}', skipping. Valid: {stage_ids} or 1-{len(stage_ids)}")

    return result


def parse_task_indices(indices_str: str, total_tasks: int) -> List[int]:
    """
    Parse comma-separated task indices string into list of 0-based indices.
    Input is 1-based (user-friendly), output is 0-based (internal).
    
    Examples:
        "2,3" -> [1, 2]
        "1,5,10" -> [0, 4, 9]
        "1-5" -> [0, 1, 2, 3, 4]
        "1,3-5,10" -> [0, 2, 3, 4, 9]
    """
    indices = set()
    
    for part in indices_str.split(','):
        part = part.strip()
        if not part:
            continue
            
        if '-' in part:
            # Range: "1-5"
            try:
                start, end = part.split('-', 1)
                start_idx = int(start.strip())
                end_idx = int(end.strip())
                for i in range(start_idx, end_idx + 1):
                    if 1 <= i <= total_tasks:
                        indices.add(i - 1)  # Convert to 0-based
            except ValueError:
                print(f"Warning: Invalid range '{part}', skipping")
        else:
            # Single index
            try:
                idx = int(part)
                if 1 <= idx <= total_tasks:
                    indices.add(idx - 1)  # Convert to 0-based
                else:
                    print(f"Warning: Index {idx} out of range (1-{total_tasks}), skipping")
            except ValueError:
                print(f"Warning: Invalid index '{part}', skipping")
    
    return sorted(indices)


def run_stage(state: dict, config: dict, stage_id: str, dry_run: bool = False, task_indices: Optional[List[int]] = None):
    """Execute a single pipeline stage."""
    stage_config = get_enabled_stage(config, stage_id)
    if not stage_config:
        print(f"Stage '{stage_id}' not found or disabled")
        return
    
    stage_state = state['stages'][stage_id]
    stage_state['status'] = 'running'
    stage_state['started_at'] = datetime.now().isoformat()
    
    tasks = state['tasks']
    
    # Determine which tasks to process
    if task_indices is not None:
        # Process only specified indices
        tasks_to_process = [(i, tasks[i]) for i in task_indices if i < len(tasks)]
        start_index = 0  # Not used in this mode
        print(f"\n{'='*60}")
        print(f"Stage: {stage_config.get('name', stage_id)}")
        print(f"Processing {len(tasks_to_process)} specific tasks: {[i+1 for i, _ in tasks_to_process]}")
        print(f"{'='*60}")
    else:
        # Normal mode: process from current index
        start_index = stage_state.get('current_task_index', 0)
        tasks_to_process = [(i, tasks[i]) for i in range(start_index, len(tasks))]
        print(f"\n{'='*60}")
        print(f"Stage: {stage_config.get('name', stage_id)}")
        print(f"Tasks: {len(tasks)} total, starting from index {start_index}")
        print(f"{'='*60}")
    
    # Get requests file path for tracking
    requests_file = config['outputs'].get('_requests_resolved')
    
    # Record the last request ID before we start (for tracking range)
    if requests_file and not dry_run and task_indices is None:
        last_id_before = get_last_request_id(requests_file)
        if start_index == 0:  # Fresh start
            state['metadata']['request_id_before_run'] = last_id_before
    
    # Retry config
    retry_config = stage_config.get('retry', {})
    max_retries = retry_config.get('max_attempts', 2)
    on_failure = retry_config.get('on_failure', 'skip_and_log')
    
    processed_count = 0
    total_to_process = len(tasks_to_process)
    
    for i, task_dict in tasks_to_process:
        task = Task(**{k: v for k, v in task_dict.items() if k in Task.__dataclass_fields__})
        
        processed_count += 1
        print(f"\n[{processed_count}/{total_to_process}] Task {i+1} - {task.id}: {task.title}")
        
        if task_dict.get('status') == 'completed':
            print(f"  → Already completed, skipping")
            continue
        
        if task_dict.get('status') == 'skipped':
            print(f"  → Previously skipped")
            continue
        
        # Update state (only update index in normal mode)
        task_dict['status'] = 'processing'
        if task_indices is None:
            stage_state['current_task_index'] = i
        
        # Attempt invocation
        success = False
        error = None
        
        for attempt in range(max_retries):
            if attempt > 0:
                print(f"  → Retry {attempt + 1}/{max_retries}")

            success, error = invoke_agent(task, stage_config, dry_run, task_dict, config, state, stage_id)

            if success:
                break

        # Update task status
        if success:
            task_dict['status'] = 'completed'
            task_dict['processed_at'] = datetime.now().isoformat()
            stage_state['tasks_completed'] += 1

            # Track the request ID created for this task
            if requests_file and not dry_run:
                new_last_id = get_last_request_id(requests_file)
                task_dict['request_id'] = new_last_id
                state['metadata']['last_request_id'] = new_last_id
                state['metadata']['total_requests_generated'] = stage_state['tasks_completed']
                
                # Set first request ID if this is the first successful task
                if not state['metadata'].get('first_request_id'):
                    state['metadata']['first_request_id'] = new_last_id
                
                print(f"  ✓ Completed → {new_last_id}")
            else:
                print(f"  ✓ Completed")
            
            # Save state after each successful task (for resume capability)
            state_path = config['outputs']['_state_resolved']
            save_state(state, state_path)
            
        else:
            if on_failure == 'skip_and_log':
                task_dict['status'] = 'skipped'
                task_dict['error'] = error
                stage_state['tasks_failed'] += 1
                state['errors'].append({
                    'stage': stage_id,
                    'task_id': task.id,
                    'error': error,
                    'timestamp': datetime.now().isoformat()
                })
                print(f"  ✗ Skipped: {error[:80] if error else 'unknown'}...")
            elif on_failure == 'stop':
                task_dict['status'] = 'failed'
                task_dict['error'] = error
                stage_state['status'] = 'failed'
                state['status'] = 'failed'
                print(f"  ✗ Failed (stopping): {error[:80] if error else 'unknown'}...")
                return
            else:  # continue
                task_dict['status'] = 'failed'
                task_dict['error'] = error
                stage_state['tasks_failed'] += 1
                print(f"  ✗ Failed: {error[:80] if error else 'unknown'}...")
    
    # Stage complete
    stage_state['status'] = 'completed'
    stage_state['completed_at'] = datetime.now().isoformat()
    
    print(f"\n{'='*60}")
    print(f"Stage Complete: {stage_config.get('name', stage_id)}")
    print(f"  Completed: {stage_state['tasks_completed']}")
    print(f"  Failed/Skipped: {stage_state['tasks_failed']}")
    
    # Show request range created
    first_req = state['metadata'].get('first_request_id')
    last_req = state['metadata'].get('last_request_id')
    if first_req and last_req:
        print(f"  Requests: {first_req} through {last_req}")
    
    print(f"{'='*60}")


def run_pipeline(state: dict, config: dict, dry_run: bool = False, task_indices: Optional[List[int]] = None, horizontal: bool = False, stage_filter: Optional[List[str]] = None):
    """Run pipeline in configured mode (horizontal or per_request)."""
    # CLI flag overrides config
    if horizontal:
        mode = 'horizontal'
    else:
        mode = config.get('pipeline', {}).get('mode', 'per_request')

    if mode == 'horizontal':
        run_pipeline_horizontal(state, config, dry_run, task_indices, stage_filter)
    else:
        run_pipeline_per_request(state, config, dry_run, task_indices, stage_filter)


def run_pipeline_per_request(state: dict, config: dict, dry_run: bool = False, task_indices: Optional[List[int]] = None, stage_filter: Optional[List[str]] = None):
    """
    Run pipeline in per-request mode: all stages for each task before moving to next.

    Flow: Task1(request→overview→details) → Task2(request→overview→details) → ...

    Args:
        stage_filter: Optional list of stage IDs to run. If None, run all stages.
    """
    import time

    state['status'] = 'running'
    tasks = state['tasks']

    # Determine which tasks to process
    if task_indices is not None:
        tasks_to_process = [(i, tasks[i]) for i in task_indices if i < len(tasks)]
    elif stage_filter:
        # When running specific stages, process ALL tasks (stage-level skip logic will handle completed ones)
        tasks_to_process = [(i, tasks[i]) for i in range(len(tasks))]
    else:
        # Start from current_task_index for resume capability (only when running all stages)
        start_index = state.get('current_task_index', 0)
        tasks_to_process = [(i, tasks[i]) for i in range(start_index, len(tasks))]

    total_to_process = len(tasks_to_process)

    print(f"\n{'='*60}")
    print(f"Pipeline: {config['pipeline']['name']} (per-request mode)")
    print(f"Tasks: {total_to_process} to process")
    if stage_filter:
        print(f"Stages: {', '.join(stage_filter)}")
    print(f"{'='*60}")
    
    state_path = config['outputs']['_state_resolved']
    completed_count = 0
    pipeline_start = time.time()
    
    for idx, (i, task_dict) in enumerate(tasks_to_process):
        task = Task(**{k: v for k, v in task_dict.items() if k in Task.__dataclass_fields__})
        
        # Initialize files dict if not present
        if task_dict.get('files') is None:
            task_dict['files'] = {}
        
        print(f"\n[{idx+1}/{total_to_process}] Task {i+1} - {task.id}: {task.title}")

        # Skip logic depends on whether we're filtering to specific stages
        if stage_filter:
            # When running specific stages, check if ALL requested stages are done
            all_stages_done = all(
                task_dict.get(f"{sid}_completed", False)
                for sid in stage_filter
            )
            if all_stages_done:
                print(f"  → Requested stage(s) already completed, skipping")
                continue
        else:
            # When running all stages, check overall task status
            if task_dict.get('status') == 'completed':
                print(f"  → Already completed, skipping")
                continue

            if task_dict.get('status') == 'skipped':
                print(f"  → Previously skipped")
                continue
        
        # Update state
        task_dict['status'] = 'processing'
        state['current_task_index'] = i
        
        # Run all stages for this task
        task_start = time.time()
        success = run_task_stages(task, task_dict, config, state, dry_run, stage_filter)
        task_elapsed = time.time() - task_start
        task_elapsed_str = format_duration(task_elapsed)
        
        if success:
            task_dict['status'] = 'completed'
            task_dict['processed_at'] = datetime.now().isoformat()
            completed_count += 1
            state['metadata']['total_requests_generated'] = completed_count
            print(f"  ✓ Request package complete: {task_dict.get('request_id', 'N/A')} (total: {task_elapsed_str})")
        else:
            task_dict['status'] = 'failed'
            print(f"  ✗ Request package failed (after {task_elapsed_str})")
        
        # Save state after each task
        save_state(state, state_path)
    
    pipeline_elapsed = time.time() - pipeline_start
    pipeline_elapsed_str = format_duration(pipeline_elapsed)
    
    # Update final status
    all_completed = all(t.get('status') == 'completed' for t in tasks)
    state['status'] = 'completed' if all_completed else 'partial'
    
    print(f"\n{'='*60}")
    print(f"Pipeline Complete")
    print(f"  Completed: {completed_count}/{total_to_process}")
    print(f"  Total time: {pipeline_elapsed_str}")
    first_req = state['metadata'].get('first_request_id')
    last_req = state['metadata'].get('last_request_id')
    if first_req and last_req:
        print(f"  Requests: {first_req} through {last_req}")
    print(f"{'='*60}")


def run_pipeline_horizontal(state: dict, config: dict, dry_run: bool = False, task_indices: Optional[List[int]] = None, stage_filter: Optional[List[str]] = None):
    """
    Run pipeline in horizontal mode: all tasks through stage 1, then all through stage 2, etc.

    Flow: All Tasks(request) → All Tasks(overview) → All Tasks(details)

    Args:
        stage_filter: Optional list of stage IDs to run. If None, run all stages.
    """
    import time

    state['status'] = 'running'
    tasks = state['tasks']

    # Use request_stages (preferred) or fall back to stages
    stages = config.get('request_stages', []) or config.get('stages', [])

    # Determine which tasks to process
    if task_indices is not None:
        tasks_to_process = [(i, tasks[i]) for i in task_indices if i < len(tasks)]
    else:
        tasks_to_process = [(i, tasks[i]) for i in range(len(tasks))]

    total_tasks = len(tasks_to_process)
    state_path = config['outputs']['_state_resolved']
    requests_file = config['outputs'].get('_requests_resolved')

    print(f"\n{'='*60}")
    print(f"Pipeline: {config['pipeline']['name']} (horizontal mode)")
    if stage_filter:
        print(f"Stages: {', '.join(stage_filter)}")
    else:
        print(f"Stages: {len([s for s in stages if s.get('enabled', True)])}")
    print(f"Tasks: {total_tasks} to process")
    print(f"{'='*60}")

    pipeline_start = time.time()

    # Process each stage across all tasks
    for stage in stages:
        if not stage.get('enabled', True):
            continue

        # Skip stages not in filter (if filter is specified)
        if stage_filter and stage['id'] not in stage_filter:
            continue
        
        stage_id = stage['id']
        agent_name = stage.get('agent', {}).get('name', stage_id)
        
        # Check if stage already completed (for resume)
        stage_state = state['stages'].get(stage_id, {})
        if stage_state.get('status') == 'completed' and task_indices is None:
            print(f"\nStage '{stage_id}' already completed, skipping")
            continue
        
        print(f"\n{'='*60}")
        print(f"Stage: {stage.get('name', stage_id)} ({agent_name})")
        print(f"Processing {total_tasks} tasks")
        print(f"{'='*60}")
        
        # Update stage state
        if stage_id not in state['stages']:
            state['stages'][stage_id] = {
                "status": "pending",
                "tasks_total": total_tasks,
                "tasks_completed": 0,
                "tasks_failed": 0,
                "current_task_index": 0
            }
        
        stage_state = state['stages'][stage_id]
        stage_state['status'] = 'running'
        stage_state['started_at'] = datetime.now().isoformat()
        
        # Get retry config
        retry_config = stage.get('retry', config.get('retry', {}))
        max_retries = retry_config.get('max_attempts', 2)
        on_failure = retry_config.get('on_failure', 'skip_and_log')
        
        stage_start = time.time()
        
        # Process all tasks for this stage
        for idx, (i, task_dict) in enumerate(tasks_to_process):
            task = Task(**{k: v for k, v in task_dict.items() if k in Task.__dataclass_fields__})
            
            # Initialize files dict if not present
            if task_dict.get('files') is None:
                task_dict['files'] = {}
            
            print(f"\n[{idx+1}/{total_tasks}] Task {i+1} - {task.id}: {task.title}")
            
            # For stages after request, check if previous stage completed for this task
            if stage_id == 'overview' and not task_dict.get('request_id'):
                print(f"  → Skipping: No request_id (request stage not completed)")
                continue
            
            if stage_id == 'details' and not task_dict.get('files', {}).get('overview'):
                print(f"  → Skipping: No overview file (overview stage not completed)")
                continue

            if stage_id == 'implementation' and not task_dict.get('files', {}).get('details'):
                print(f"  → Skipping: No details file (details stage not completed)")
                continue

            # Check if this stage already done for this task
            stage_done_key = f"{stage_id}_completed"
            if task_dict.get(stage_done_key):
                print(f"  → Already completed for this task, skipping")
                continue
            
            # Attempt invocation with retries
            success = False
            error = None
            
            task_start = time.time()
            
            for attempt in range(max_retries):
                if attempt > 0:
                    print(f"  → Retry {attempt + 1}/{max_retries}")

                success, error = invoke_agent(task, stage, dry_run, task_dict, config, state, stage_id)

                if success:
                    break

            task_elapsed = time.time() - task_start
            task_elapsed_str = format_duration(task_elapsed)
            
            if success:
                stage_state['tasks_completed'] += 1
                task_dict[stage_done_key] = True
                
                # Track output based on stage type
                if stage_id == 'request' and requests_file and not dry_run:
                    new_last_id = get_last_request_id(requests_file)
                    task_dict['request_id'] = new_last_id
                    task_dict['files']['request'] = f"{requests_file}#{new_last_id}"
                    state['metadata']['last_request_id'] = new_last_id
                    if not state['metadata'].get('first_request_id'):
                        state['metadata']['first_request_id'] = new_last_id
                    state['metadata']['total_requests_generated'] = stage_state['tasks_completed']
                    print(f"    ✓ Created {new_last_id} ({task_elapsed_str})")
                    
                elif stage_id == 'overview' and not dry_run:
                    output_config = stage.get('output', {})
                    if output_config.get('type') == 'file':
                        directory = config['outputs'].get('_overviews_resolved', Path('./docs/overviews'))
                        filename_template = output_config.get('filename', '{request_id}-{task_title_slug}-overview.md')
                        import re
                        title_slug = task.title.lower()
                        title_slug = re.sub(r'[^a-z0-9\s-]', '', title_slug)
                        title_slug = re.sub(r'\s+', '-', title_slug)
                        title_slug = re.sub(r'-+', '-', title_slug)
                        title_slug = title_slug.strip('-')[:50]
                        filename = filename_template.format(
                            request_id=task_dict.get('request_id', 'unknown'),
                            task_title_slug=title_slug
                        )
                        task_dict['files']['overview'] = str(directory / filename)
                        print(f"    ✓ Created {filename} ({task_elapsed_str})")
                    else:
                        print(f"    ✓ Completed ({task_elapsed_str})")
                        
                elif stage_id == 'details' and not dry_run:
                    output_config = stage.get('output', {})
                    if output_config.get('type') == 'file':
                        directory = config['outputs'].get('_details_resolved', Path('./docs/details'))
                        filename_template = output_config.get('filename', '{request_id}-{task_title_slug}-detailed.md')
                        import re
                        title_slug = task.title.lower()
                        title_slug = re.sub(r'[^a-z0-9\s-]', '', title_slug)
                        title_slug = re.sub(r'\s+', '-', title_slug)
                        title_slug = re.sub(r'-+', '-', title_slug)
                        title_slug = title_slug.strip('-')[:50]
                        filename = filename_template.format(
                            request_id=task_dict.get('request_id', 'unknown'),
                            task_title_slug=title_slug
                        )
                        task_dict['files']['details'] = str(directory / filename)
                        print(f"    ✓ Created {filename} ({task_elapsed_str})")
                    else:
                        print(f"    ✓ Completed ({task_elapsed_str})")
                else:
                    print(f"    ✓ Completed ({task_elapsed_str})")
                
                # Save state after each successful task
                save_state(state, state_path)
                
            else:
                stage_state['tasks_failed'] += 1
                print(f"    ✗ Failed ({task_elapsed_str}): {error[:60] if error else 'unknown'}...")
                
                if on_failure == 'stop':
                    stage_state['status'] = 'failed'
                    state['status'] = 'failed'
                    return
                elif on_failure == 'skip_and_log':
                    state['errors'].append({
                        'stage': stage_id,
                        'task_id': task.id,
                        'error': error,
                        'timestamp': datetime.now().isoformat()
                    })
        
        # Stage complete
        stage_elapsed = time.time() - stage_start
        stage_elapsed_str = format_duration(stage_elapsed)
        
        stage_state['status'] = 'completed'
        stage_state['completed_at'] = datetime.now().isoformat()
        
        print(f"\n  Stage '{stage_id}' complete: {stage_state['tasks_completed']}/{total_tasks} succeeded ({stage_elapsed_str})")
        
        # Check for stop hooks
        if stage.get('stop_hook') and not dry_run:
            print(f"\n[STOP HOOK] Stage '{stage_id}' complete.")
            print("Review outputs before continuing.")
            response = input("Continue to next stage? (y/N): ")
            if response.lower() != 'y':
                state['status'] = 'paused'
                return
    
    pipeline_elapsed = time.time() - pipeline_start
    pipeline_elapsed_str = format_duration(pipeline_elapsed)
    
    state['status'] = 'completed'
    
    print(f"\n{'='*60}")
    print(f"Pipeline Complete (horizontal mode)")
    print(f"  Total time: {pipeline_elapsed_str}")
    first_req = state['metadata'].get('first_request_id')
    last_req = state['metadata'].get('last_request_id')
    if first_req and last_req:
        print(f"  Requests: {first_req} through {last_req}")
    print(f"{'='*60}")


# =============================================================================
# Rerun Handling
# =============================================================================

def reset_state_for_rerun(state: dict, tasks: list[Task]) -> dict:
    """Reset state for a fresh rerun while preserving structure."""
    # Reset all tasks to pending
    for task_dict in state['tasks']:
        task_dict['status'] = 'pending'
        task_dict['request_id'] = None
        task_dict['error'] = None
        task_dict['processed_at'] = None
        task_dict['files'] = {}  # Clear files tracking
    
    # Reset stage state
    for stage_id, stage_state in state['stages'].items():
        if stage_state.get('status') != 'disabled':
            stage_state['status'] = 'pending'
            stage_state['started_at'] = None
            stage_state['completed_at'] = None
            stage_state['tasks_completed'] = 0
            stage_state['tasks_failed'] = 0
            stage_state['current_task_index'] = 0
    
    # Reset metadata
    state['metadata']['first_request_id'] = None
    state['metadata']['last_request_id'] = None
    state['metadata']['request_id_before_run'] = None
    state['metadata']['total_requests_generated'] = 0
    
    # Reset overall state
    state['status'] = 'not_started'
    state['current_task_index'] = 0
    state['errors'] = []
    state['updated_at'] = datetime.now().isoformat()
    
    return state


def prompt_rerun_action(state: dict, config: dict) -> str:
    """
    Prompt user for action when rerunning with existing state.
    Returns: 'resume', 'delete', 'keep', or 'abort'
    """
    metadata = state.get('metadata', {})
    first_req = metadata.get('first_request_id')
    last_req = metadata.get('last_request_id')
    total = metadata.get('total_requests_generated', 0)
    
    # Get current stage progress
    current_stage = state.get('current_stage', 'request')
    stage_state = state.get('stages', {}).get(current_stage, {})
    current_index = stage_state.get('current_task_index', 0)
    total_tasks = stage_state.get('tasks_total', 0)
    completed_tasks = stage_state.get('tasks_completed', 0)
    
    print(f"\n{'='*60}")
    print("PREVIOUS RUN DETECTED")
    print(f"{'='*60}")
    
    if first_req and last_req:
        print(f"\n  Requests created: {first_req} through {last_req} ({total} total)")
    
    print(f"  Tasks completed: {completed_tasks}/{total_tasks}")
    
    if stage_state.get('status') == 'completed':
        print(f"  Stage status: COMPLETED")
    elif current_index > 0:
        print(f"  Stopped at task: {current_index + 1}/{total_tasks}")
    
    print(f"\n  What would you like to do?\n")
    print(f"  [R] Resume - Continue from task {current_index + 1}")
    print(f"  [D] Delete - Remove {first_req} to {last_req} and regenerate all")
    print(f"  [K] Keep   - Keep existing requests, only process remaining tasks")
    print(f"  [A] Abort  - Exit without changes")
    print()
    
    while True:
        response = input("  Choice [R/D/K/A]: ").strip().upper()
        if response in ['R', 'D', 'K', 'A']:
            return {'R': 'resume', 'D': 'delete', 'K': 'keep', 'A': 'abort'}[response]
        print("  Invalid choice. Please enter R, D, K, or A.")


def handle_rerun(
    state: dict, 
    config: dict, 
    tasks: list[Task],
    action: Optional[str] = None
) -> Optional[dict]:
    """
    Handle rerun scenarios based on user choice or flag.
    Returns updated state or None if aborted.
    
    action: 'resume', 'delete', 'keep', 'abort', or None (prompt user)
    """
    metadata = state.get('metadata', {})
    first_req = metadata.get('first_request_id')
    last_req = metadata.get('last_request_id')
    
    # If no requests were created, treat as fresh start
    if not first_req or not last_req:
        return state
    
    # Prompt user if no action specified
    if action is None:
        action = prompt_rerun_action(state, config)
    
    requests_file = config['outputs'].get('_requests_resolved')
    
    if action == 'abort':
        print("\nAborted.")
        return None
    
    elif action == 'resume':
        print("\nResuming from previous state...")
        return state
    
    elif action == 'keep':
        print("\nKeeping existing requests, processing remaining tasks...")
        return state
    
    elif action == 'delete':
        print(f"\nDeleting requests {first_req} through {last_req}...")
        
        if requests_file and requests_file.exists():
            # Verify file state before deleting
            is_valid, warning = verify_requests_file_state(requests_file, state)
            if not is_valid:
                print(f"\n  Warning: {warning}")
                confirm = input("  Continue anyway? (yes/N): ")
                if confirm.lower() != 'yes':
                    print("  Aborted.")
                    return None
            
            # Delete the requests and associated files
            success = delete_requests_in_range(requests_file, first_req, last_req, config)
            if not success:
                print("  Error deleting requests. Aborting.")
                return None
        
        # Reset state
        state = reset_state_for_rerun(state, tasks)
        print("  State reset. Starting fresh.\n")
        return state
    
    return state


# =============================================================================
# CLI Commands
# =============================================================================

def cmd_list_tasks(config: dict):
    """List all extracted tasks."""
    tasks = extract_tasks(config)
    
    print(f"\n{'='*60}")
    print(f"Extracted Tasks ({len(tasks)} total)")
    print(f"{'='*60}")
    
    current_phase = None
    for task in tasks:
        if task.phase != current_phase:
            current_phase = task.phase
            print(f"\n### Phase {task.phase}: {task.phase_name}")
        
        print(f"  {task.id}: {task.title}")
        if task.description:
            for line in task.description.split('\n')[:2]:
                print(f"       - {line}")


def cmd_show_config(config: dict):
    """Display resolved configuration."""
    print(f"\n{'='*60}")
    print("Resolved Configuration")
    print(f"{'='*60}")
    print(f"\nPipeline: {config['pipeline']['name']}")
    print(f"Source: {config['source']['_resolved_path']}")
    print(f"State: {config['outputs'].get('_state_resolved', 'N/A')}")
    print(f"\nStages:")
    for stage in config.get('stages', []):
        status = "enabled" if stage.get('enabled', True) else "disabled"
        print(f"  - {stage['id']}: {stage.get('name', 'unnamed')} [{status}]")


def cmd_reset_state(config: dict):
    """Reset pipeline state (with confirmation)."""
    state_path = config['outputs']['_state_resolved']
    
    if not state_path.exists():
        print("No state file exists.")
        return
    
    response = input(f"Delete {state_path} and reset all progress? (yes/N): ")
    if response.lower() == 'yes':
        state_path.unlink()
        print("State reset.")
    else:
        print("Cancelled.")


# =============================================================================
# Main
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Project-agnostic pipeline orchestrator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --config ./pipeline.yaml --list-tasks
  %(prog)s --config ./pipeline.yaml --dry-run
  %(prog)s --config ./pipeline.yaml
  %(prog)s --config ./pipeline.yaml --resume
  %(prog)s --config ./pipeline.yaml --keep
  %(prog)s --config ./pipeline.yaml --delete
  %(prog)s --config ./pipeline.yaml --tasks "2,3"        # Process tasks 2 and 3 only
  %(prog)s --config ./pipeline.yaml --tasks "1-5"        # Process tasks 1 through 5
  %(prog)s --config ./pipeline.yaml --tasks "1,5,10-15"  # Process tasks 1, 5, and 10-15
  %(prog)s --config ./pipeline.yaml --stages "3"         # Run only stage 3 (details)
  %(prog)s --config ./pipeline.yaml --stages "details"   # Same as above, by name
  %(prog)s --config ./pipeline.yaml --stages "2,3"       # Run stages 2 and 3
  %(prog)s --config ./pipeline.yaml --stages "3" --tasks "1,2"  # Stage 3 for tasks 1 and 2
  %(prog)s --config ./pipeline.yaml --precheck-only      # Verify tools only, don't run pipeline
  %(prog)s --config ./pipeline.yaml --stages "4" --precheck  # Force precheck before implementation
  %(prog)s --config ./pipeline.yaml --stages "4" --force # Continue even if precheck fails
        """
    )
    
    parser.add_argument(
        '--config', '-c',
        required=True,
        help='Path to pipeline YAML configuration file'
    )
    
    parser.add_argument(
        '--tasks', '-t',
        type=str,
        default=None,
        help='Process only specific task indices (comma-separated, 1-based). E.g., "2,3" or "1,5,10"'
    )

    parser.add_argument(
        '--stages', '-s',
        type=str,
        default=None,
        help='Run only specific stages (comma-separated). Use numbers (1,2,3) or names (request,overview,details). E.g., "3" or "details" or "2,3"'
    )

    # Rerun action flags (mutually exclusive)
    rerun_group = parser.add_mutually_exclusive_group()
    rerun_group.add_argument(
        '--resume', '-r',
        action='store_true',
        help='Resume from where previous run stopped'
    )
    rerun_group.add_argument(
        '--keep', '-k',
        action='store_true',
        help='Keep existing requests, only process remaining tasks'
    )
    rerun_group.add_argument(
        '--delete', '-d',
        action='store_true',
        help='Delete previous requests and regenerate all'
    )
    
    parser.add_argument(
        '--dry-run', '-n',
        action='store_true',
        help='Parse and simulate without invoking agents'
    )
    parser.add_argument(
        '--list-tasks', '-l',
        action='store_true',
        help='List extracted tasks and exit'
    )
    parser.add_argument(
        '--show-config',
        action='store_true',
        help='Show resolved configuration and exit'
    )
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Reset pipeline state (interactive)'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    parser.add_argument(
        '--horizontal',
        action='store_true',
        help='Run in horizontal mode (all tasks per stage) instead of per-request mode'
    )

    # Precheck flags
    parser.add_argument(
        '--precheck',
        action='store_true',
        help='Force precheck to run (verify required tools) before implementation'
    )
    parser.add_argument(
        '--precheck-only',
        action='store_true',
        help='Run precheck only and exit (do not run pipeline)'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force continue even if precheck fails (use with caution)'
    )

    args = parser.parse_args()
    
    # Load configuration
    config_path = Path(args.config).resolve()
    try:
        config = load_config(config_path)
        config['_config_path'] = config_path
    except (FileNotFoundError, ValueError) as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    # Setup logging
    log_path = config['outputs'].get('_logs_resolved')
    setup_logging(log_path, verbose=args.verbose)
    
    logging.info(f"Pipeline: {config['pipeline']['name']}")
    logging.debug(f"Config: {config_path}")
    
    # Handle info commands
    if args.show_config:
        cmd_show_config(config)
        return
    
    if args.list_tasks:
        cmd_list_tasks(config)
        return
    
    if args.reset:
        cmd_reset_state(config)
        return
    
    # Extract tasks
    print(f"Loading: {config['source']['_resolved_path']}")
    try:
        tasks = extract_tasks(config)
    except Exception as e:
        print(f"Error extracting tasks: {e}")
        sys.exit(1)
    
    print(f"Found {len(tasks)} tasks")
    
    # Determine rerun action from flags
    rerun_action = None
    if args.resume:
        rerun_action = 'resume'
    elif args.keep:
        rerun_action = 'keep'
    elif args.delete:
        rerun_action = 'delete'
    
    # Load or initialize state
    state_path = config['outputs']['_state_resolved']

    if state_path.exists():
        print(f"Found existing state: {state_path}")
        state = load_state(state_path)
    else:
        print("Initializing new pipeline state")
        state = initialize_state(config, tasks)

    # Handle --precheck-only early (before rerun prompts)
    if args.precheck_only:
        print("\n[PRECHECK ONLY MODE]")
        success, precheck_result = run_precheck(config, state, force=True)
        state['precheck'] = precheck_result
        save_state(state, state_path)
        if success:
            print("\nPrecheck passed. Ready for implementation.")
            sys.exit(0)
        else:
            print("\n  ✗ Precheck failed. Required tools are not available.")
            print("\n  For playwright_mcp, ensure Chrome is running with CDP enabled:")
            print("    /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \\")
            print("      --remote-debugging-port=9223 --user-data-dir=/tmp/chrome-debug")
            sys.exit(1)

    # From here on, we need proper state handling for pipeline execution
    if state_path.exists():
        # Check source file changes
        current_hash = compute_file_hash(config['source']['_resolved_path'])
        if state.get('source_hash') != current_hash:
            print("\nWarning: Source file has changed since last run")
            if rerun_action is None:
                response = input("Continue anyway? (y/N): ")
                if response.lower() != 'y':
                    sys.exit(0)

        # Handle rerun scenarios (always handle if state exists, even in dry-run for delete)
        has_requests = bool(state.get('metadata', {}).get('first_request_id'))

        if has_requests:
            # In dry-run mode, only prompt if not using a flag
            if args.dry_run and rerun_action is None:
                print("\n[DRY RUN] Skipping rerun prompt, using 'keep' behavior")
                rerun_action = 'keep'

            state = handle_rerun(state, config, tasks, rerun_action)
            if state is None:
                sys.exit(0)
    
    # Save initial state
    save_state(state, state_path)
    
    # Parse task indices if specified
    task_indices = None
    if args.tasks:
        total_tasks = len(state['tasks'])
        task_indices = parse_task_indices(args.tasks, total_tasks)
        if not task_indices:
            print(f"Error: No valid task indices in '{args.tasks}'")
            sys.exit(1)
        print(f"Will process {len(task_indices)} specific task(s): {[i+1 for i in task_indices]}")

        # If --delete flag is used with --tasks, reset the status of those specific tasks
        if args.delete:
            for idx in task_indices:
                task_dict = state['tasks'][idx]
                if task_dict.get('status') == 'completed':
                    task_dict['status'] = 'pending'
                    task_dict['request_id'] = None
                    task_dict['error'] = None
                    task_dict['processed_at'] = None
            print(f"Reset {len(task_indices)} task(s) for re-processing")

    # Parse stage filter if specified
    stage_filter = None
    if args.stages:
        stage_filter = parse_stage_filter(args.stages, config)
        if not stage_filter:
            print(f"Error: No valid stages in '{args.stages}'")
            sys.exit(1)
        print(f"Will run {len(stage_filter)} stage(s): {stage_filter}")

    # Handle precheck for implementation stage
    # Precheck is needed if:
    # - --precheck flag is set (force precheck before pipeline)
    # - Implementation stage is in the stage_filter and precheck hasn't passed yet
    # Note: --precheck-only is handled earlier and exits before reaching here
    implementation_requested = stage_filter is None or 'implementation' in stage_filter
    force_precheck = args.precheck

    if implementation_requested:
        # Check if precheck is needed
        needs_precheck = is_precheck_required(state, config) or force_precheck

        if needs_precheck and not args.dry_run:
            success, precheck_result = run_precheck(config, state, force=force_precheck)
            state['precheck'] = precheck_result
            save_state(state, state_path)

            if not success:
                if args.force:
                    print("\n  ⚠ Precheck failed but --force flag set. Continuing anyway...")
                    logging.warning("Precheck failed but continuing due to --force flag")
                else:
                    print("\n  ✗ Precheck failed. Required tools are not available.")
                    print("\n  For playwright_mcp, ensure Chrome is running with CDP enabled:")
                    print("    /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \\")
                    print("      --remote-debugging-port=9223 --user-data-dir=/tmp/chrome-debug")
                    print("\n  Options:")
                    print("    --force         Continue anyway (browser tests may fail)")
                    print("    --precheck-only Run diagnostics only")
                    sys.exit(1)

    # Run pipeline
    try:
        run_pipeline(state, config, dry_run=args.dry_run, task_indices=task_indices, horizontal=args.horizontal, stage_filter=stage_filter)
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        state['status'] = 'paused'
    finally:
        save_state(state, state_path)
        print(f"\nState saved: {state_path}")


if __name__ == '__main__':
    main()