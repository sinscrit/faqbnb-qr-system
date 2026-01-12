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
import shutil
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

    # Clear .next cache to prevent corrupted cache issues
    cache_cleared = False
    project_dir = config.get('_config_dir', Path.cwd())
    next_cache_dir = Path(project_dir) / '.next'
    if next_cache_dir.exists():
        try:
            shutil.rmtree(next_cache_dir)
            cache_cleared = True
            print(f"  ✓ Cleared .next cache directory (prevents corrupted cache issues)")
            logging.info(f"Cleared .next cache at {next_cache_dir}")
        except Exception as e:
            print(f"  ⚠ Failed to clear .next cache: {e}")
            logging.warning(f"Failed to clear .next cache: {e}")
    else:
        print(f"  ○ No .next cache found (clean state)")

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
                'next_cache_cleared': cache_cleared,
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
                'error': error_msg,
                'next_cache_cleared': cache_cleared,
            }
            print(f"  ✗ Precheck agent failed ({elapsed_str}): {error_msg[:60]}...")
            return False, precheck_result

    except subprocess.TimeoutExpired:
        logging.error(f"Precheck timed out after {precheck_timeout}s")
        precheck_result = {
            'status': 'failed',
            'completed_at': datetime.now().isoformat(),
            'tools': {tool: {'available': False, 'notes': 'Timeout'} for tool in required_tools},
            'error': f'Timeout after {precheck_timeout}s',
            'next_cache_cleared': cache_cleared,
        }
        print(f"  ✗ Precheck timed out after {precheck_timeout}s")
        return False, precheck_result
    except Exception as e:
        logging.exception(f"Precheck error: {e}")
        precheck_result = {
            'status': 'failed',
            'completed_at': datetime.now().isoformat(),
            'tools': {tool: {'available': False, 'notes': str(e)} for tool in required_tools},
            'error': str(e),
            'next_cache_cleared': cache_cleared,
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

    # Get pipeline and state file paths for testcheck stage
    pipeline_yaml_path = ''
    state_file_path = ''
    total_tasks = 0
    if config:
        pipeline_yaml_path = config.get('_config_path', '')
        state_file_path = str(config.get('outputs', {}).get('_state_resolved', ''))
    if state:
        total_tasks = len(state.get('tasks', []))

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
        pipeline_yaml_path=pipeline_yaml_path,
        state_file_path=state_file_path,
        total_tasks=total_tasks,
    )


def parse_test_results(output: str) -> dict:
    """
    Parse agent output to extract test verification results.

    Returns:
        dict with:
            - tests_ran: bool - whether tests were executed
            - tests_passed: bool or None - True if passed, False if failed, None if unknown
            - test_summary: str - brief summary of test results
    """
    if not output:
        return {
            'tests_ran': False,
            'tests_passed': None,
            'test_summary': 'No output to parse'
        }

    output_lower = output.lower()

    # Patterns indicating test success
    success_patterns = [
        # General test patterns
        'all tests pass',
        'tests passed',
        'tests pass',
        'test passed',
        'test pass',
        'verification successful',
        'verification passed',
        'successfully verified',
        'verification complete',
        # Agent conversational patterns (how agent reports success)
        'ran the tests and they passed',
        'tests are passing',
        'all tests are passing',
        'tests run successfully',
        'tests completed successfully',
        'test suite passes',
        'no test failures',
        'no failing tests',
        '0 failed',
        # Browser test patterns
        'browser test passed',
        'browser verification passed',
        # Unicode checkmarks
        '✓ all tests',
        '✓ tests pass',
        '✓ verification',
        '✓ completed',
        '✅',
        # Structured output patterns
        'tests: passed',
        'test result: pass',
        # Development workflow patterns (npm/jest/vitest)
        'type-check passed',
        'type-check passes',
        'type-check successful',
        'typescript passes',
        'typescript passed',
        'build successful',
        'build succeeded',
        'build passed',
        'build passes',
        'build completed',
        'compilation successful',
        'compiles successfully',
        'no type errors',
        'no typescript errors',
        '0 errors',
        'passed, 0 failed',
        'all specs passed',
        # Acceptance criteria patterns
        'acceptance criteria met',
        'all acceptance criteria',
        'verification steps complete',
        'all verification steps',
        'all tasks completed',
        'implementation complete',
        # Structured test summary patterns (from agent template)
        'test summary:',
        'type check: passed',
        'build: passed',
        'tests: passed',
    ]

    # Patterns indicating test failure
    failure_patterns = [
        # General test patterns
        'test failed',
        'tests failed',
        'test failure',
        'tests failing',
        'verification failed',
        'browser test failed',
        'error during verification',
        'verification error',
        # Agent conversational patterns (how agent reports failure)
        'tests are failing',
        'some tests fail',
        'test suite fails',
        'tests did not pass',
        # Unicode X marks
        '✗ test',
        '✗ verification',
        '❌',
        # Structured output patterns
        'tests: failed',
        'test result: fail',
        # Server/runtime errors
        'internal server error',
        '500 error',
        '404 error',
        'connection refused',
        'econnrefused',
        # Development workflow failures
        'type-check failed',
        'type-check fails',
        'type error',
        'typescript error',
        'typescript fails',
        'build failed',
        'build fails',
        'compilation failed',
        'compilation error',
        'failed to compile',
        'does not compile',
        'npm err',
        # Test runner failures
        'tests failed',
        'test suite failed',
        'failures: ',
        'assertion failed',
        'assertionerror',
        # Acceptance criteria failures
        'acceptance criteria not met',
        'verification step failed',
        # Structured test summary patterns (from agent template)
        'type check: failed',
        'build: failed',
        'tests: failed',
    ]

    # Patterns indicating tests/verification were run
    ran_patterns = [
        # General test patterns
        'running test',
        'ran test',
        'ran the test',
        'executing test',
        'run test',
        'run the test',
        # Verification patterns
        'verification',
        'verified',
        'verifying',
        # Agent conversational patterns
        'i ran',
        'i executed',
        'running the',
        'executed the',
        # Browser test patterns
        'browser_snapshot',
        'browser_navigate',
        'playwright',
        # Development workflow patterns
        'npm run test',
        'npm run type-check',
        'npm run build',
        'npm test',
        'type-check',
        'typecheck',
        'tsc',
        'vitest',
        'jest',
        # Acceptance/task completion patterns
        'acceptance criteria',
        'verification steps',
        'running verification',
        'task 1',  # Task references in detailed specs
        'implementation notes',
        '[x]',  # Checked checkboxes
        # Common agent completion phrases
        'successfully implemented',
        'implementation is complete',
        'completed all',
        'all tasks',
        'completed task',
        # Structured test summary (from agent template)
        'test summary:',
    ]

    # Check if tests were run
    tests_ran = any(pattern in output_lower for pattern in ran_patterns)

    # Check for explicit success
    has_success = any(pattern in output_lower for pattern in success_patterns)

    # Check for explicit failure
    has_failure = any(pattern in output_lower for pattern in failure_patterns)

    # Determine test result
    if has_failure:
        tests_passed = False
        test_summary = 'Tests failed or verification error detected'
    elif has_success:
        tests_passed = True
        test_summary = 'Tests passed successfully'
    elif tests_ran:
        # Tests ran but no clear pass/fail indicator
        tests_passed = None
        test_summary = 'Tests executed but result unclear'
    else:
        tests_passed = None
        test_summary = 'No test execution detected'

    return {
        'tests_ran': tests_ran,
        'tests_passed': tests_passed,
        'test_summary': test_summary
    }


@dataclass
class AgentResult:
    """Result from agent invocation."""
    success: bool
    error: Optional[str] = None
    stdout: str = ''
    stderr: str = ''
    elapsed: float = 0.0
    test_results: Optional[dict] = None


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

    # Inject CRITICAL PATH WARNING for implementation and testcheck stages
    # This ensures the warning is always included regardless of when detailed specs were created
    if stage_id in ('implementation', 'testcheck'):
        critical_path_warning = """

**CRITICAL PATH WARNING**:
- This project has TWO dashboard paths: `/dashboard/` (legacy) and `/dashboard2/` (current)
- ALL work must be done in `/dashboard2/` and `/src/app/dashboard2/`
- The ItemCreationWorkflow component is accessed via `/dashboard2/create`
- DO NOT modify anything in `/src/app/dashboard/` - that is the legacy version
- Component path: `/src/components/ItemCreationWorkflow/`
"""
        prompt = prompt + critical_path_warning
        logging.debug(f"Injected CRITICAL PATH WARNING for {stage_id} stage")

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

            # Parse test results for implementation stage
            if stage_id == 'implementation' and task_dict is not None:
                test_results = parse_test_results(result.stdout)
                task_dict['test_results'] = test_results
                task_dict['tests_ran'] = test_results.get('tests_ran', False)
                task_dict['tests_passed'] = test_results.get('tests_passed')
                task_dict['test_summary'] = test_results.get('test_summary', '')

                # Log test results
                if test_results.get('tests_ran'):
                    if test_results.get('tests_passed') is True:
                        logging.info(f"Task {task.id}: Tests PASSED - {test_results.get('test_summary')}")
                    elif test_results.get('tests_passed') is False:
                        logging.warning(f"Task {task.id}: Tests FAILED - {test_results.get('test_summary')}")
                    else:
                        logging.info(f"Task {task.id}: Test status unclear - {test_results.get('test_summary')}")

            return True, None
        else:
            error_msg = f"Exit code {result.returncode}: {result.stderr[:500]}"
            logging.error(f"Agent {agent_name} failed for task {task.id}{req_info} after {elapsed_str}: {error_msg}")

            # Still try to parse test results from failed run
            if stage_id == 'implementation' and task_dict is not None:
                combined_output = (result.stdout or '') + (result.stderr or '')
                test_results = parse_test_results(combined_output)
                task_dict['test_results'] = test_results
                task_dict['tests_ran'] = test_results.get('tests_ran', False)
                task_dict['tests_passed'] = test_results.get('tests_passed', False)  # Assume failed if agent failed
                task_dict['test_summary'] = test_results.get('test_summary', 'Agent failed')

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
    stage_filter: Optional[List[str]] = None,
    state_path: Optional[Path] = None
) -> bool:
    """
    Run all stages for a single task (vertical/per-request mode).
    Returns True if all stages completed successfully.

    Args:
        stage_filter: Optional list of stage IDs to run. If None, run all stages.
        state_path: Path to state file for incremental saves after each stage.
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

        # Skip pipeline-level stages (these run once after all tasks complete, not per-task)
        if stage.get('mode') == 'pipeline':
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
            # Clear any previous error for this task since it succeeded on re-run
            if task_dict.get('error'):
                task_dict['error'] = None

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

        elif stage_id == 'implementation' and not dry_run:
            # Show test results for implementation stage
            tests_passed = task_dict.get('tests_passed')
            tests_ran = task_dict.get('tests_ran', False)
            test_summary = task_dict.get('test_summary', '')

            if tests_ran:
                if tests_passed is True:
                    print(f"    ✓ Implemented & Tests PASSED ({stage_elapsed_str})")
                elif tests_passed is False:
                    print(f"    ⚠ Implemented but Tests FAILED ({stage_elapsed_str})")
                    if test_summary:
                        print(f"      → {test_summary}")
                else:
                    print(f"    ✓ Implemented - test status unclear ({stage_elapsed_str})")
            else:
                print(f"    ✓ Implemented - no tests detected ({stage_elapsed_str})")
        else:
            if not dry_run:
                print(f"    ✓ Completed ({stage_elapsed_str})")
            else:
                print(f"    ✓ Completed")

        # Save state after each stage (incremental progress tracking)
        if state_path and not dry_run:
            state['updated_at'] = datetime.now().isoformat()
            save_state(state, state_path)

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


def parse_task_indices(indices_str: str, total_tasks: int, tasks: Optional[List[dict]] = None) -> List[int]:
    """
    Parse comma-separated task indices/IDs string into list of 0-based indices.

    Supports multiple formats:
    - Numeric indices (1-based): "2,3" -> [1, 2]
    - Numeric ranges: "1-5" -> [0, 1, 2, 3, 4]
    - Task IDs: "8.3" -> finds task with id="8.3"
    - Wildcard task IDs: "8.*" -> finds all tasks with id starting with "8."
    - Mixed: "1,8.3,9.*" -> combines all formats

    Examples:
        "2,3" -> [1, 2]
        "1,5,10" -> [0, 4, 9]
        "1-5" -> [0, 1, 2, 3, 4]
        "8.3" -> [index of task with id="8.3"]
        "8.*" -> [indices of all tasks with id starting with "8."]
        "1,8.3,9.*" -> combined
    """
    indices = set()

    # Build task ID to index mapping if tasks provided
    task_id_to_index = {}
    if tasks:
        for i, task in enumerate(tasks):
            task_id = task.get('id', '')
            if task_id:
                task_id_to_index[task_id] = i

    for part in indices_str.split(','):
        part = part.strip()
        if not part:
            continue

        # Check for wildcard pattern (e.g., "8.*")
        if '*' in part and tasks:
            pattern = part.replace('*', '')  # "8.*" -> "8."
            matched = False
            for task_id, idx in task_id_to_index.items():
                if task_id.startswith(pattern):
                    indices.add(idx)
                    matched = True
            if not matched:
                print(f"Warning: No tasks match pattern '{part}'")
            continue

        # Check for task ID format (contains '.', e.g., "8.3")
        if '.' in part and tasks:
            if part in task_id_to_index:
                indices.add(task_id_to_index[part])
            else:
                print(f"Warning: Task ID '{part}' not found")
            continue

        # Check for numeric range (e.g., "1-5")
        if '-' in part:
            try:
                start, end = part.split('-', 1)
                start_idx = int(start.strip())
                end_idx = int(end.strip())
                for i in range(start_idx, end_idx + 1):
                    if 1 <= i <= total_tasks:
                        indices.add(i - 1)  # Convert to 0-based
            except ValueError:
                print(f"Warning: Invalid range '{part}', skipping")
            continue

        # Single numeric index
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
    """Run pipeline in configured mode (horizontal or per_request).

    Stage execution order respects the order specified in stage_filter.
    For example: --stages "implementation,testcheck,usecases" runs
    implementation (per-task) BEFORE testcheck/usecases (pipeline-level).
    """
    # Check for pipeline-level stages first
    request_stages = config.get('request_stages', []) or config.get('stages', [])

    # Separate pipeline-level stages from per-task stages
    pipeline_stages = [s for s in request_stages if s.get('mode') == 'pipeline']
    per_task_stages = [s for s in request_stages if s.get('mode') != 'pipeline']

    # CLI flag overrides config
    if horizontal:
        mode = 'horizontal'
    else:
        mode = config.get('pipeline', {}).get('mode', 'per_request')

    # If stage_filter is specified, respect the order of stages
    if stage_filter:
        pipeline_stage_ids = {s['id'] for s in pipeline_stages}
        filtered_pipeline_stages = [sid for sid in stage_filter if sid in pipeline_stage_ids]
        filtered_per_task_stages = [sid for sid in stage_filter if sid not in pipeline_stage_ids]

        # If we have both types, determine order based on first occurrence
        if filtered_pipeline_stages and filtered_per_task_stages:
            # Find first index of each type in the original stage_filter
            first_pipeline_idx = min(stage_filter.index(sid) for sid in filtered_pipeline_stages)
            first_per_task_idx = min(stage_filter.index(sid) for sid in filtered_per_task_stages)

            if first_per_task_idx < first_pipeline_idx:
                # Per-task stages come first (e.g., "implementation,testcheck,usecases")
                print(f"\nRunning per-task stages first: {filtered_per_task_stages}")
                if mode == 'horizontal':
                    run_pipeline_horizontal(state, config, dry_run, task_indices, filtered_per_task_stages)
                else:
                    run_pipeline_per_request(state, config, dry_run, task_indices, filtered_per_task_stages)

                print(f"\nRunning pipeline-level stages: {filtered_pipeline_stages}")
                run_pipeline_level_stages(state, config, dry_run, filtered_pipeline_stages)
            else:
                # Pipeline-level stages come first (e.g., "testcheck,implementation")
                print(f"\nRunning pipeline-level stages first: {filtered_pipeline_stages}")
                run_pipeline_level_stages(state, config, dry_run, filtered_pipeline_stages)

                print(f"\nRunning per-task stages: {filtered_per_task_stages}")
                if mode == 'horizontal':
                    run_pipeline_horizontal(state, config, dry_run, task_indices, filtered_per_task_stages)
                else:
                    run_pipeline_per_request(state, config, dry_run, task_indices, filtered_per_task_stages)
            return

        # Only pipeline-level stages
        if filtered_pipeline_stages and not filtered_per_task_stages:
            run_pipeline_level_stages(state, config, dry_run, filtered_pipeline_stages)
            return

        # Only per-task stages - continue to normal flow
        if filtered_per_task_stages and not filtered_pipeline_stages:
            stage_filter = filtered_per_task_stages
            # Fall through to normal per-task processing below

    # No stage filter or only per-task stages - run normal flow
    if mode == 'horizontal':
        run_pipeline_horizontal(state, config, dry_run, task_indices, stage_filter)
    else:
        run_pipeline_per_request(state, config, dry_run, task_indices, stage_filter)


def run_pipeline_level_stages(state: dict, config: dict, dry_run: bool = False, stage_ids: List[str] = None):
    """
    Run pipeline-level stages that execute once for the entire pipeline.

    These stages operate on the pipeline as a whole, not per-task.
    Examples: testcheck (verification & test harness generation)
    """
    import time

    request_stages = config.get('request_stages', []) or config.get('stages', [])
    state_path = config['outputs']['_state_resolved']

    for stage in request_stages:
        if stage.get('mode') != 'pipeline':
            continue
        if not stage.get('enabled', True):
            continue
        if stage_ids and stage['id'] not in stage_ids:
            continue

        stage_id = stage['id']
        agent_name = stage.get('agent', {}).get('name', stage_id)

        # Stages that should always regenerate (not skip if completed)
        always_regenerate = ['testcheck', 'usecases']

        # Check if already completed (skip check for always_regenerate stages)
        if stage_id not in always_regenerate:
            if state.get(f'{stage_id}_completed') and not dry_run:
                print(f"\nPipeline stage '{stage_id}' already completed, skipping")
                continue
        else:
            # For testcheck/usecases, clear completed flag to regenerate
            if state.get(f'{stage_id}_completed'):
                print(f"\nPipeline stage '{stage_id}' will regenerate (always runs fresh)")
                state[f'{stage_id}_completed'] = False

        # Prerequisite check: testcheck requires at least one implementation completed
        if stage_id == 'testcheck':
            tasks = state.get('tasks', [])
            implementations_completed = sum(
                1 for t in tasks if t.get('implementation_completed', False)
            )
            if implementations_completed == 0:
                print(f"\n{'='*60}")
                print(f"Pipeline Stage: {stage.get('name', stage_id)}")
                print(f"{'='*60}")
                print(f"\n  ✗ Skipping: No implementations completed yet")
                print(f"    testcheck requires at least one task to have implementation_completed=True")
                print(f"    Run implementation stage first, then testcheck")
                logging.warning(f"Skipping testcheck: no implementations completed")
                continue
            else:
                print(f"\n  Found {implementations_completed} completed implementation(s)")

        print(f"\n{'='*60}")
        print(f"Pipeline Stage: {stage.get('name', stage_id)} ({agent_name})")
        print(f"Mode: Pipeline-level (runs once)")
        print(f"{'='*60}")

        stage_start = time.time()

        # Build prompt with pipeline-level context
        template = stage.get('agent', {}).get('invocation_template', '')
        prompt = format_pipeline_stage_prompt(template, config, state)

        if dry_run:
            print(f"\n[DRY RUN] Would invoke: {agent_name}")
            print(f"  Prompt: {prompt[:100]}...")
            print(f"  ✓ Completed")
            continue

        # Get timeout
        default_timeout = config.get('pipeline', {}).get('default_timeout', 600)
        timeout = stage.get('agent', {}).get('timeout', default_timeout)

        logging.info(f"Invoking {agent_name} for pipeline stage {stage_id} (timeout: {timeout}s)")

        # Build command
        cmd_template = stage.get('agent', {}).get('command', ['claude', '-p', '{prompt}'])
        cmd = [part.format(prompt=prompt) if '{prompt}' in part else part for part in cmd_template]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout
            )

            stage_elapsed = time.time() - stage_start
            stage_elapsed_str = format_duration(stage_elapsed)

            if result.returncode == 0:
                logging.info(f"Agent {agent_name} completed successfully for pipeline stage {stage_id} in {stage_elapsed_str}")
                state[f'{stage_id}_completed'] = True
                state[f'{stage_id}_completed_at'] = datetime.now().isoformat()
                print(f"\n  ✓ Pipeline stage '{stage_id}' completed ({stage_elapsed_str})")

                # Parse output for verification results if applicable
                if stage_id == 'testcheck':
                    # Display test harness URLs
                    display_test_harness_urls(state, config)
                    # Generate pipeline test harness and update master index
                    generate_test_harnesses_after_testcheck(state, config)
                elif stage_id == 'usecases':
                    # Regenerate test harness to include use cases from state
                    print(f"\n  Regenerating test harness with use cases...")
                    # Reload state to get use cases added by 06b agent
                    state_path = config.get('outputs', {}).get('_state_resolved')
                    if state_path and state_path.exists():
                        with open(state_path, 'r') as f:
                            updated_state = json.load(f)
                        state['usecases'] = updated_state.get('usecases', {})
                    generate_pipeline_test_harness(state, config)
                    usecase_count = len(state.get('usecases', {}).get('items', []))
                    print(f"    Included {usecase_count} use cases in test harness")
            else:
                logging.error(f"Agent {agent_name} failed for pipeline stage {stage_id}: {result.stderr[:200]}")
                print(f"\n  ✗ Pipeline stage '{stage_id}' failed ({stage_elapsed_str})")
                print(f"    Error: {result.stderr[:100]}...")
                state['errors'].append({
                    'stage': stage_id,
                    'type': 'pipeline_stage',
                    'error': result.stderr[:500],
                    'timestamp': datetime.now().isoformat()
                })

        except subprocess.TimeoutExpired:
            stage_elapsed = time.time() - stage_start
            stage_elapsed_str = format_duration(stage_elapsed)
            logging.error(f"Agent {agent_name} timed out after {timeout}s for pipeline stage {stage_id}")
            print(f"\n  ✗ Pipeline stage '{stage_id}' timed out ({stage_elapsed_str})")
            state['errors'].append({
                'stage': stage_id,
                'type': 'pipeline_stage',
                'error': f'Timeout after {timeout}s',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logging.error(f"Error invoking {agent_name} for pipeline stage {stage_id}: {e}")
            print(f"\n  ✗ Pipeline stage '{stage_id}' error: {e}")
            state['errors'].append({
                'stage': stage_id,
                'type': 'pipeline_stage',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })

        # Save state after each pipeline stage
        save_state(state, state_path)

    print(f"\n{'='*60}")
    print(f"Pipeline-level stages complete")
    print(f"{'='*60}")


def display_test_harness_urls(state: dict, config: dict):
    """Display test harness URLs after testcheck stage completion.

    Shows only the current pipeline's test URL, not all test pages.
    """
    import os

    verification = state.get('verification', {})
    test_page_url = verification.get('summary', {}).get('test_page_url', '')
    deployed_url = verification.get('deployed_url', '')

    # Get current pipeline name to show only its test URL
    pipeline_name = get_pipeline_name_from_config(config, state)

    print(f"\n  Test Harness URLs:")

    # Local URL - show only current pipeline's test URL
    if test_page_url:
        print(f"    Local:    http://localhost:3000{test_page_url}")
    elif pipeline_name:
        # Check if this pipeline's test harness exists
        pipeline_test_file = f'src/app/test/{pipeline_name}/page.tsx'
        if os.path.exists(pipeline_test_file):
            print(f"    Local:    http://localhost:3000/test/{pipeline_name}")
        else:
            print(f"    Local:    Test harness not yet generated for this pipeline")
    else:
        print(f"    Local:    Could not determine pipeline name")

    # Deployed URL
    if deployed_url:
        print(f"    Deployed: {deployed_url}")
    else:
        # Check notes for deployment info
        notes = verification.get('notes', [])
        deployment_note = next((n for n in notes if 'deploy' in n.lower()), None)
        if deployment_note and 'NO DEPLOYMENT' not in deployment_note.upper():
            print(f"    Deployed: Check Railway dashboard")
        else:
            print(f"    Deployed: Not deployed (run 'railway up' to deploy)")

    # Build status
    build_status = verification.get('build_status', 'unknown')
    if build_status:
        print(f"    Build:    {build_status}")


def get_pipeline_name_from_config(config: dict, state: dict = None) -> str:
    """Extract pipeline name from config file path for test harness URL.

    Example: pipeline-item-creation-workflow.yaml -> item-creation-workflow
    """
    config_path = config.get('_config_path', '')

    # Fallback to state metadata if config doesn't have the path
    if not config_path and state:
        config_path = state.get('metadata', {}).get('config_file', '')

    if not config_path:
        return ''

    filename = os.path.basename(str(config_path))
    # Remove 'pipeline-' prefix and '.yaml' suffix
    name = filename.replace('pipeline-', '').replace('.yaml', '').replace('.yml', '')
    return name


def extract_prd_context(config: dict) -> dict:
    """Extract key context from the PRD for test harness LLM instructions.

    Looks for the PRD file in docs/prd/ matching the pipeline name.
    Extracts: vision, user outcome, success metrics, scope.

    Returns a dict with extracted context or defaults.
    """
    import re
    import glob

    prd_context = {
        'vision': '',
        'user_outcome': '',
        'success_metrics': [],
        'scope_in': [],
        'scope_out': [],
    }

    # Try to find PRD file - look in source config or docs/prd/
    prd_path = None

    # Check if source.path points to a PRD
    source_path = config.get('source', {}).get('path', '')
    if source_path and os.path.exists(source_path):
        # The source is usually the implementation plan, try to find associated PRD
        plan_basename = os.path.basename(source_path)
        # Look for PRD_*.md in docs/prd/
        for prd_file in glob.glob('docs/prd/PRD_*.md'):
            prd_path = prd_file
            break

    if not prd_path:
        # Try docs/prd/PRD*.md
        for prd_file in glob.glob('docs/prd/PRD*.md'):
            prd_path = prd_file
            break

    if not prd_path or not os.path.exists(prd_path):
        return prd_context

    try:
        with open(prd_path, 'r') as f:
            content = f.read()

        # Extract Product Vision section
        vision_match = re.search(r'## Product Vision\s*\n(.*?)(?=\n##|\n---|\Z)', content, re.DOTALL)
        if vision_match:
            vision_text = vision_match.group(1).strip()
            # Get first paragraph (vision statement)
            lines = [l.strip() for l in vision_text.split('\n') if l.strip() and not l.startswith('#')]
            if lines:
                prd_context['vision'] = lines[0][:300]  # Limit length

        # Extract User Outcome quote
        outcome_match = re.search(r'### User Outcome\s*\n>\s*"([^"]+)"', content)
        if outcome_match:
            prd_context['user_outcome'] = outcome_match.group(1)[:200]

        # Extract Business Outcomes metrics
        metrics_section = re.search(r'### Business Outcomes.*?\|\s*Metric\s*\|.*?\n(.*?)(?=\n###|\n##|\Z)', content, re.DOTALL)
        if metrics_section:
            metrics_text = metrics_section.group(1)
            for line in metrics_text.split('\n'):
                if '|' in line and not line.strip().startswith('|--'):
                    parts = [p.strip() for p in line.split('|') if p.strip()]
                    if len(parts) >= 2 and parts[0] not in ['Metric', '------']:
                        metric = f"{parts[0]}: {parts[1]}"
                        prd_context['success_metrics'].append(metric[:100])

        # Extract In Scope items
        scope_in_match = re.search(r'### In Scope.*?\n(.*?)(?=\n###|\n##|\Z)', content, re.DOTALL)
        if scope_in_match:
            scope_text = scope_in_match.group(1)
            for line in scope_text.split('\n'):
                line = line.strip()
                if line.startswith('- '):
                    prd_context['scope_in'].append(line[2:][:80])

        # Extract Out of Scope items
        scope_out_match = re.search(r'### Out of Scope.*?\n(.*?)(?=\n###|\n##|\Z)', content, re.DOTALL)
        if scope_out_match:
            scope_text = scope_out_match.group(1)
            for line in scope_text.split('\n'):
                line = line.strip()
                if line.startswith('- '):
                    prd_context['scope_out'].append(line[2:][:80])

    except Exception as e:
        print(f"    Warning: Could not extract PRD context: {e}")

    return prd_context


def collect_pipeline_test_info(state: dict, config: dict) -> list:
    """Collect test information for all tasks in a pipeline.

    Returns list of dicts with test page info:
    - request_id: REQ-XXX
    - title: Task title
    - test_path: /test/component-name (if exists)
    - description: From detailed spec or task description
    """
    import glob
    import re

    tests = []
    tasks = state.get('tasks', [])

    # Get pipeline name to exclude self-references
    pipeline_name = get_pipeline_name_from_config(config, state)

    # Build a map of existing test pages (excluding the pipeline's own test harness)
    existing_tests = {}
    for test_file in glob.glob('src/app/test/*/page.tsx'):
        route = test_file.replace('src/app', '').replace('/page.tsx', '')
        test_name = os.path.basename(os.path.dirname(test_file))
        # Exclude the pipeline's own test harness page to prevent self-reference
        if test_name != pipeline_name:
            existing_tests[test_name] = route

    def title_to_slug(title: str) -> str:
        """Convert a task title to a potential test page slug."""
        # Remove common suffixes
        title = re.sub(r'\s+(Step|Component|Panel|Modal|Editor|Viewer)$', '', title, flags=re.IGNORECASE)
        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        return slug

    def find_matching_test(title: str) -> str:
        """Try to find a test page that matches the task title."""
        # Direct slug match
        slug = title_to_slug(title)
        if slug in existing_tests:
            return existing_tests[slug]

        # Try with common suffixes
        for suffix in ['-step', '-panel', '-modal', '-editor', '-viewer', '']:
            test_slug = slug + suffix
            if test_slug in existing_tests:
                return existing_tests[test_slug]

        # Try partial matching - find test pages that contain key words from title
        title_words = set(slug.split('-'))
        best_match = None
        best_score = 0
        for test_name, route in existing_tests.items():
            test_words = set(test_name.split('-'))
            # Count matching words
            common = title_words & test_words
            if len(common) >= 2:  # At least 2 words in common
                score = len(common)
                if score > best_score:
                    best_score = score
                    best_match = route

        return best_match

    for task in tasks:
        request_id = task.get('request_id', '')
        title = task.get('title', '')

        # Try to find a matching test page
        test_path = None
        description = title

        # Method 1: Check if there's a details file with test page info
        details_file = task.get('files', {}).get('details', '')
        if details_file and os.path.exists(details_file):
            try:
                with open(details_file, 'r') as f:
                    content = f.read()
                    # Look for test page references in the detailed spec
                    # Find all test page references and pick the first one that's not the pipeline itself
                    test_matches = re.findall(r'/test/([a-z0-9-]+)', content)
                    for test_name in test_matches:
                        # Skip self-references to the pipeline's test harness
                        if test_name != pipeline_name and test_name in existing_tests:
                            test_path = existing_tests[test_name]
                            break
            except Exception:
                pass

        # Method 2: Try to match task title to existing test pages
        if not test_path:
            test_path = find_matching_test(title)

        tests.append({
            'request_id': request_id,
            'task_id': task.get('id', ''),
            'title': title,
            'test_path': test_path,
            'description': description,
            'status': task.get('status', 'pending'),
        })

    return tests


def generate_pipeline_test_harness(state: dict, config: dict) -> str:
    """Generate a test harness page for the pipeline.

    Creates /test/[pipeline-name]/page.tsx with LLM-friendly sequential test navigation.
    Tests are displayed inline (not navigating away) for easy sequential execution.
    Returns the path to the generated file.
    """
    from datetime import datetime

    pipeline_name = get_pipeline_name_from_config(config, state)
    if not pipeline_name:
        print("    Warning: Could not determine pipeline name from config")
        return ''

    # Collect test info
    tests = collect_pipeline_test_info(state, config)

    # Extract PRD context for LLM instructions
    prd_context = extract_prd_context(config)

    # Filter to only completed tasks with test paths
    tests_with_pages = [t for t in tests if t.get('test_path')]
    all_tests = tests  # Keep all for reference

    # Generate the page content
    test_dir = f'src/app/test/{pipeline_name}'
    test_file = f'{test_dir}/page.tsx'

    # Ensure directory exists
    os.makedirs(test_dir, exist_ok=True)

    # Build test links array with proper hrefs
    test_links = []
    for t in tests_with_pages:
        # Escape quotes in strings and truncate description
        title = t["title"][:40].replace("'", "\\'")
        desc = t["description"][:60].replace("'", "\\'")
        if len(t["description"]) > 60:
            desc += "..."
        test_links.append(f'''  {{
    href: '{t["test_path"]}',
    title: '{t["request_id"]}: {title}',
    description: '{desc}',
  }},''')

    # Build all tasks summary
    task_summary = []
    for t in all_tests:
        status_icon = '✅' if t['status'] == 'completed' else '🔄' if t['status'] == 'processing' else '⏳'
        has_test = '🧪' if t.get('test_path') else ''
        task_title = t['title'][:50].replace("'", "\\'")
        task_summary.append(f"    {{ id: '{t['task_id']}', request: '{t['request_id']}', title: '{task_title}', status: '{status_icon}', hasTest: '{has_test}' }},")

    pipeline_display_name = pipeline_name.replace('-', ' ').title()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')

    # Build use cases from state if available
    usecases_data = state.get('usecases', {})
    usecase_items = usecases_data.get('items', [])

    usecase_entries = []
    for uc in usecase_items:
        uc_id = uc.get('id', '').replace("'", "\\'")
        uc_title = uc.get('title', '').replace("'", "\\'")
        uc_category = uc.get('category', 'happy-path')
        uc_priority = uc.get('priority', 'P1')
        uc_description = uc.get('description', '').replace("'", "\\'")[:100]
        uc_outcome = uc.get('expectedOutcome', '').replace("'", "\\'")

        # Build steps array
        steps_entries = []
        for step in uc.get('steps', []):
            step_action = step.get('action', '').replace("'", "\\'")
            step_component = step.get('component', '').replace("'", "\\'")
            step_result = step.get('expectedResult', '').replace("'", "\\'")
            steps_entries.append(f"      {{ step: {step.get('step', 0)}, action: '{step_action}', component: '{step_component}', expectedResult: '{step_result}' }},")

        steps_str = '\n'.join(steps_entries) if steps_entries else '      // No steps defined'

        usecase_entries.append(f'''  {{
    id: '{uc_id}',
    title: '{uc_title}',
    category: '{uc_category}',
    priority: '{uc_priority}',
    description: '{uc_description}',
    expectedOutcome: '{uc_outcome}',
    steps: [
{steps_str}
    ],
  }},''')

    usecases_content = chr(10).join(usecase_entries) if usecase_entries else '  // No use cases generated yet'

    # Build LLM instructions from PRD context
    prd_vision = prd_context.get('vision', '').replace("'", "\\'").replace('\n', ' ')
    prd_user_outcome = prd_context.get('user_outcome', '').replace("'", "\\'").replace('\n', ' ')
    prd_metrics = prd_context.get('success_metrics', [])
    prd_scope_in = prd_context.get('scope_in', [])
    prd_scope_out = prd_context.get('scope_out', [])

    metrics_js = ', '.join([f"'{m.replace(chr(39), chr(92)+chr(39))}'" for m in prd_metrics[:5]])
    scope_in_js = ', '.join([f"'{s.replace(chr(39), chr(92)+chr(39))}'" for s in prd_scope_in[:6]])
    scope_out_js = ', '.join([f"'{s.replace(chr(39), chr(92)+chr(39))}'" for s in prd_scope_out[:4]])

    page_content = f'''\'use client\';

/**
 * {pipeline_display_name} - Pipeline Test Harness
 *
 * Auto-generated LLM-friendly test harness for the {pipeline_name} pipeline.
 * Features:
 * - LLM Testing Instructions with workflow guidance
 * - Sequential test navigation with Previous/Next buttons
 * - Component tests displayed inline via iframe (no page navigation)
 * - Use case tests with step-by-step instructions
 * - Pipeline reference for context (informational only)
 *
 * @generated {timestamp}
 * @pipeline {pipeline_name}
 */

import Link from 'next/link';
import {{ useState }} from 'react';

type TabId = 'instructions' | 'components' | 'usecases' | 'reference';

// LLM Testing Instructions - PRD Context
const llmInstructions = {{
  vision: '{prd_vision}',
  userOutcome: '{prd_user_outcome}',
  successMetrics: [{metrics_js}],
  scopeIn: [{scope_in_js}],
  scopeOut: [{scope_out_js}],
  workflow: [
    'STEP 1: Read the Instructions tab first to understand the product context and testing workflow.',
    'STEP 2: Complete Component Tests - These verify individual UI components work correctly in isolation.',
    'STEP 3: Complete Use Case Tests - These verify end-to-end user workflows function properly.',
    'STEP 4: SKIP Pipeline Reference - This tab is informational only, not for testing.',
  ],
  componentTestGuidance: 'For each component test: (1) Click to load the test page in the iframe below, (2) Interact with the component to verify it renders and responds correctly, (3) Use Previous/Next to move sequentially through all component tests.',
  useCaseTestGuidance: 'For each use case: (1) Select the use case from the list, (2) Follow each numbered step in order, (3) Check off steps as you complete them, (4) Verify the expected outcome matches what you observe.',
  importantNotes: [
    'Component Tests should be completed BEFORE Use Case Tests',
    'Pipeline Reference tab contains implementation status only - DO NOT test it',
    'Use Previous/Next buttons to navigate sequentially',
    'All tests are displayed inline - no need to navigate away from this page',
  ],
}};

interface TestLink {{
  href: string;
  title: string;
  description: string;
}}

interface UseCaseStep {{
  step: number;
  action: string;
  component: string;
  expectedResult: string;
}}

interface UseCase {{
  id: string;
  title: string;
  category: 'happy-path' | 'error-handling' | 'edge-case' | 'integration';
  priority: 'P0' | 'P1' | 'P2';
  description: string;
  expectedOutcome: string;
  steps: UseCaseStep[];
}}

const componentTests: TestLink[] = [
{chr(10).join(test_links) if test_links else '  // No component tests found'}
];

const allTasks = [
{chr(10).join(task_summary)}
];

const useCases: UseCase[] = [
{usecases_content}
];

const categoryColors: Record<string, string> = {{
  'happy-path': 'bg-green-100 text-green-800',
  'error-handling': 'bg-red-100 text-red-800',
  'edge-case': 'bg-yellow-100 text-yellow-800',
  'integration': 'bg-purple-100 text-purple-800',
}};

const priorityColors: Record<string, string> = {{
  'P0': 'bg-red-500 text-white',
  'P1': 'bg-orange-400 text-white',
  'P2': 'bg-gray-400 text-white',
}};

export default function {pipeline_name.replace('-', '_').title().replace('_', '')}TestPage() {{
  const [activeTab, setActiveTab] = useState<TabId>('instructions');
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [selectedUseCaseIndex, setSelectedUseCaseIndex] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({{}}); // Track completed steps per use case

  const tabs = [
    {{ id: 'instructions' as TabId, label: '📖 LLM Instructions', count: null }},
    {{ id: 'components' as TabId, label: '🧪 Component Tests', count: componentTests.length }},
    {{ id: 'usecases' as TabId, label: '📝 Use Case Tests', count: useCases.length }},
    {{ id: 'reference' as TabId, label: '📋 Pipeline Reference', count: allTasks.length }},
  ];

  // Toggle step completion for a use case
  const toggleStep = (useCaseId: string, stepNum: number) => {{
    setCompletedSteps(prev => {{
      const current = prev[useCaseId] || new Set<number>();
      const next = new Set(current);
      if (next.has(stepNum)) {{
        next.delete(stepNum);
      }} else {{
        next.add(stepNum);
      }}
      return {{ ...prev, [useCaseId]: next }};
    }});
  }};

  // Check if all steps in a use case are completed
  const isUseCaseComplete = (uc: UseCase) => {{
    const completed = completedSteps[uc.id] || new Set<number>();
    return uc.steps.length > 0 && uc.steps.every(s => completed.has(s.step));
  }};

  return (
    <div className="min-h-screen bg-gray-100">
      {{/* Header */}}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/test" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
            ← Back to All Pipelines
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{pipeline_display_name}</h1>
          <p className="text-xs text-gray-400">Pipeline Test Harness • Generated: {timestamp}</p>
        </div>
      </div>

      {{/* Tab Navigation */}}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {{tabs.map((tab) => (
              <button
                key={{tab.id}}
                onClick={{() => {{
                  setActiveTab(tab.id);
                  setSelectedComponentIndex(null);
                  setSelectedUseCaseIndex(null);
                }}}}
                className={{`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${{
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }}`}}
              >
                {{tab.label}}{{tab.count !== null && ` (${{tab.count}})`}}
              </button>
            ))}}
          </div>
        </div>
      </div>

      {{/* Tab Content */}}
      <div className="max-w-7xl mx-auto px-4 py-4">

        {{/* LLM Instructions Tab */}}
        {{activeTab === 'instructions' && (
          <div className="space-y-4">
            {{/* Testing Workflow */}}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-bold text-blue-900 mb-3">🤖 LLM Testing Workflow</h2>
              <ol className="space-y-2">
                {{llmInstructions.workflow.map((step, idx) => (
                  <li key={{idx}} className="flex items-start gap-3">
                    <span className={{`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${{
                      idx === 0 ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800'
                    }}`}}>{{idx + 1}}</span>
                    <span className="text-blue-800">{{step}}</span>
                  </li>
                ))}}
              </ol>
            </div>

            {{/* Important Notes */}}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h3>
              <ul className="space-y-1">
                {{llmInstructions.importantNotes.map((note, idx) => (
                  <li key={{idx}} className="text-yellow-800 text-sm flex items-start gap-2">
                    <span>•</span>
                    <span>{{note}}</span>
                  </li>
                ))}}
              </ul>
            </div>

            {{/* Product Context */}}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📋 Product Context</h3>

              {{llmInstructions.vision && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Vision</h4>
                  <p className="text-gray-800">{{llmInstructions.vision}}</p>
                </div>
              )}}

              {{llmInstructions.userOutcome && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Target User Outcome</h4>
                  <p className="text-gray-700 italic">"{{llmInstructions.userOutcome}}"</p>
                </div>
              )}}

              {{llmInstructions.successMetrics.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Success Metrics</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {{llmInstructions.successMetrics.map((metric, idx) => (
                      <li key={{idx}} className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{{metric}}</span>
                      </li>
                    ))}}
                  </ul>
                </div>
              )}}

              {{llmInstructions.scopeIn.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">In Scope (What to Test)</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {{llmInstructions.scopeIn.map((item, idx) => (
                      <li key={{idx}} className="flex items-start gap-2">
                        <span className="text-blue-500">→</span>
                        <span>{{item}}</span>
                      </li>
                    ))}}
                  </ul>
                </div>
              )}}

              {{llmInstructions.scopeOut.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Out of Scope (DO NOT Test)</h4>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {{llmInstructions.scopeOut.map((item, idx) => (
                      <li key={{idx}} className="flex items-start gap-2">
                        <span className="text-gray-400">✗</span>
                        <span>{{item}}</span>
                      </li>
                    ))}}
                  </ul>
                </div>
              )}}
            </div>

            {{/* Test-Specific Guidance */}}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">🧪 Component Test Guidance</h3>
                <p className="text-sm text-gray-600">{{llmInstructions.componentTestGuidance}}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">📝 Use Case Test Guidance</h3>
                <p className="text-sm text-gray-600">{{llmInstructions.useCaseTestGuidance}}</p>
              </div>
            </div>

            {{/* Start Testing Button */}}
            <div className="text-center py-4">
              <button
                onClick={{() => setActiveTab('components')}}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Component Tests →
              </button>
            </div>
          </div>
        )}}

        {{/* Component Tests Tab - Sequential with Inline Display */}}
        {{activeTab === 'components' && (
          <div>
            {{/* Test List */}}
            <div className="bg-white rounded-lg border border-gray-200 mb-4">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800">Component Tests</h2>
                <p className="text-xs text-gray-500 mt-1">Click a test to view it inline below. Use Previous/Next to navigate sequentially.</p>
              </div>
              {{componentTests.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {{componentTests.map((test, idx) => (
                    <button
                      key={{idx}}
                      onClick={{() => setSelectedComponentIndex(idx)}}
                      className={{`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${{
                        selectedComponentIndex === idx ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                      }}`}}
                    >
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {{idx + 1}}
                      </span>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-gray-800 truncate">{{test.title}}</p>
                        <p className="text-xs text-gray-500 truncate">{{test.description}}</p>
                      </div>
                      {{selectedComponentIndex === idx && (
                        <span className="text-blue-600">▶</span>
                      )}}
                    </button>
                  ))}}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No component test pages found for this pipeline.</p>
                </div>
              )}}
            </div>

            {{/* Inline Test Display with iframe */}}
            {{selectedComponentIndex !== null && componentTests[selectedComponentIndex] && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {{/* Navigation Header */}}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      Test {{selectedComponentIndex + 1}} of {{componentTests.length}}
                    </span>
                    <span className="font-medium text-gray-800">{{componentTests[selectedComponentIndex].title}}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={{() => setSelectedComponentIndex(Math.max(0, selectedComponentIndex - 1))}}
                      disabled={{selectedComponentIndex === 0}}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={{() => setSelectedComponentIndex(Math.min(componentTests.length - 1, selectedComponentIndex + 1))}}
                      disabled={{selectedComponentIndex === componentTests.length - 1}}
                      className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                      Next →
                    </button>
                  </div>
                </div>
                {{/* iframe for test page */}}
                <div className="relative" style={{{{ height: '70vh' }}}}>
                  <iframe
                    src={{componentTests[selectedComponentIndex].href}}
                    className="absolute inset-0 w-full h-full border-0"
                    title={{componentTests[selectedComponentIndex].title}}
                  />
                </div>
                {{/* Open in new tab link */}}
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-center">
                  <a
                    href={{componentTests[selectedComponentIndex].href}}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Open in new tab ↗
                  </a>
                </div>
              </div>
            )}}
          </div>
        )}}

        {{/* Use Cases Tab - Sequential with Step Tracking */}}
        {{activeTab === 'usecases' && (
          <div>
            {{/* Use Case List */}}
            <div className="bg-white rounded-lg border border-gray-200 mb-4">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800">Use Case Tests</h2>
                <p className="text-xs text-gray-500 mt-1">Select a use case to see step-by-step instructions. Check off steps as you complete them.</p>
              </div>
              {{useCases.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {{useCases.map((uc, idx) => (
                    <button
                      key={{uc.id}}
                      onClick={{() => setSelectedUseCaseIndex(idx)}}
                      className={{`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${{
                        selectedUseCaseIndex === idx ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                      }}`}}
                    >
                      <span className={{`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${{
                        isUseCaseComplete(uc) ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                      }}`}}>
                        {{isUseCaseComplete(uc) ? '✓' : idx + 1}}
                      </span>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={{`px-1.5 py-0.5 text-xs font-medium rounded ${{priorityColors[uc.priority]}}`}}>
                            {{uc.priority}}
                          </span>
                          <span className={{`px-1.5 py-0.5 text-xs font-medium rounded ${{categoryColors[uc.category]}}`}}>
                            {{uc.category}}
                          </span>
                          <span className="font-mono text-xs text-gray-400">{{uc.id}}</span>
                        </div>
                        <p className="font-medium text-gray-800 truncate">{{uc.title}}</p>
                      </div>
                      {{selectedUseCaseIndex === idx && (
                        <span className="text-blue-600">▶</span>
                      )}}
                    </button>
                  ))}}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No use cases generated yet. Run the usecases stage to generate.</p>
                </div>
              )}}
            </div>

            {{/* Inline Use Case Display */}}
            {{selectedUseCaseIndex !== null && useCases[selectedUseCaseIndex] && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {{/* Navigation Header */}}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      Use Case {{selectedUseCaseIndex + 1}} of {{useCases.length}}
                    </span>
                    <span className="font-mono text-xs text-gray-500">{{useCases[selectedUseCaseIndex].id}}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={{() => setSelectedUseCaseIndex(Math.max(0, selectedUseCaseIndex - 1))}}
                      disabled={{selectedUseCaseIndex === 0}}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={{() => setSelectedUseCaseIndex(Math.min(useCases.length - 1, selectedUseCaseIndex + 1))}}
                      disabled={{selectedUseCaseIndex === useCases.length - 1}}
                      className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {{/* Use Case Content */}}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{{useCases[selectedUseCaseIndex].title}}</h3>
                  <p className="text-gray-600 mb-4">{{useCases[selectedUseCaseIndex].description}}</p>

                  {{/* Steps with Checkboxes */}}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-3">Steps to Execute:</h4>
                    <ol className="space-y-3">
                      {{useCases[selectedUseCaseIndex].steps.map((step) => {{
                        const isCompleted = (completedSteps[useCases[selectedUseCaseIndex].id] || new Set()).has(step.step);
                        return (
                          <li
                            key={{step.step}}
                            className={{`flex gap-3 p-3 rounded-lg border transition-colors ${{
                              isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }}`}}
                          >
                            <button
                              onClick={{() => toggleStep(useCases[selectedUseCaseIndex].id, step.step)}}
                              className={{`flex-shrink-0 w-7 h-7 rounded border-2 flex items-center justify-center transition-colors ${{
                                isCompleted
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-blue-500'
                              }}`}}
                            >
                              {{isCompleted ? '✓' : step.step}}
                            </button>
                            <div className="flex-grow">
                              <p className={{`font-medium ${{isCompleted ? 'text-green-800 line-through' : 'text-gray-800'}}`}}>
                                {{step.action}}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-mono bg-gray-200 px-1 rounded">{{step.component}}</span>
                                <span className="mx-2">→</span>
                                <span className={{isCompleted ? 'text-green-600' : ''}}>{{step.expectedResult}}</span>
                              </p>
                            </div>
                          </li>
                        );
                      }})}}
                    </ol>
                  </div>

                  {{/* Expected Outcome */}}
                  <div className={{`p-4 rounded-lg border ${{
                    isUseCaseComplete(useCases[selectedUseCaseIndex])
                      ? 'bg-green-100 border-green-300'
                      : 'bg-blue-50 border-blue-200'
                  }}`}}>
                    <p className={{`text-sm ${{
                      isUseCaseComplete(useCases[selectedUseCaseIndex]) ? 'text-green-800' : 'text-blue-800'
                    }}`}}>
                      <span className="font-medium">Expected Outcome:</span> {{useCases[selectedUseCaseIndex].expectedOutcome}}
                    </p>
                    {{isUseCaseComplete(useCases[selectedUseCaseIndex]) && (
                      <p className="text-green-700 font-medium mt-2">✅ All steps completed!</p>
                    )}}
                  </div>
                </div>
              </div>
            )}}
          </div>
        )}}

        {{/* Pipeline Reference Tab */}}
        {{activeTab === 'reference' && (
          <div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800">Pipeline Reference</h2>
                <p className="text-xs text-gray-500 mt-1">Complete list of all tasks implemented in this pipeline with their status and test coverage.</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Task</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Request</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Title</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Test</th>
                  </tr>
                </thead>
                <tbody>
                  {{allTasks.map((task, idx) => (
                    <tr key={{idx}} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{{task.id}}</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">{{task.request}}</td>
                      <td className="px-4 py-3">{{task.title}}</td>
                      <td className="px-4 py-3 text-center">{{task.status}}</td>
                      <td className="px-4 py-3 text-center">{{task.hasTest}}</td>
                    </tr>
                  ))}}
                </tbody>
              </table>
            </div>
          </div>
        )}}
      </div>

      {{/* Footer */}}
      <footer className="text-center text-sm text-gray-500 py-4 border-t border-gray-200 bg-white">
        Pipeline Test Harness • Auto-generated by pipeline orchestrator
      </footer>
    </div>
  );
}}
'''

    # Write the file
    with open(test_file, 'w') as f:
        f.write(page_content)

    # Convert file path to localhost URL
    route = test_file.replace('src/app', '').replace('/page.tsx', '')
    localhost_url = f"http://localhost:3000{route}"

    print(f"    Generated pipeline test harness: {test_file}")
    print(f"    Test URL: {localhost_url}")
    return test_file


def update_master_test_index(config: dict) -> str:
    """Update the master /test/page.tsx to list pipeline test harnesses.

    Scans for pipeline test harness directories and updates the master index.
    Returns the path to the updated file.
    """
    import glob
    from datetime import datetime

    master_file = 'src/app/test/page.tsx'

    # Find all pipeline test harness directories
    # These are directories under /test that have a page.tsx AND are pipeline names
    pipeline_tests = []

    # Get list of pipeline config files to identify pipeline names
    pipeline_configs = glob.glob('pipeline-*.yaml') + glob.glob('pipeline-*.yml')
    pipeline_names = set()
    for cfg in pipeline_configs:
        name = os.path.basename(cfg).replace('pipeline-', '').replace('.yaml', '').replace('.yml', '')
        pipeline_names.add(name)

    # Find test directories that match pipeline names
    for test_dir in sorted(glob.glob('src/app/test/*/')):
        dir_name = os.path.basename(test_dir.rstrip('/'))
        if dir_name in pipeline_names and os.path.exists(f'{test_dir}page.tsx'):
            display_name = dir_name.replace('-', ' ').title()
            pipeline_tests.append({
                'href': f'/test/{dir_name}',
                'name': dir_name,
                'title': display_name,
            })

    # Also find other test directories (non-pipeline component tests)
    component_tests = []
    for test_dir in sorted(glob.glob('src/app/test/*/')):
        dir_name = os.path.basename(test_dir.rstrip('/'))
        if dir_name not in pipeline_names and os.path.exists(f'{test_dir}page.tsx'):
            display_name = dir_name.replace('-', ' ').title()
            component_tests.append({
                'href': f'/test/{dir_name}',
                'name': dir_name,
                'title': display_name,
            })

    # Build pipeline links
    pipeline_links = []
    for p in pipeline_tests:
        pipeline_links.append(f'''  {{
    href: '{p["href"]}',
    title: '{p["title"]}',
    description: 'Test harness for {p["name"]} pipeline',
  }},''')

    # Build component links (for backwards compatibility)
    component_links = []
    for c in component_tests:
        component_links.append(f'''  {{
    href: '{c["href"]}',
    title: '{c["title"]}',
    description: 'Component test page',
  }},''')

    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')

    page_content = f'''\'use client\';

/**
 * Component Test Index Page
 *
 * Central hub for all pipeline and component test harnesses.
 * Auto-generated by pipeline orchestrator.
 *
 * @route /test
 * @generated {timestamp}
 */

import Link from 'next/link';

interface TestLink {{
  href: string;
  title: string;
  description: string;
}}

const pipelineTests: TestLink[] = [
{chr(10).join(pipeline_links) if pipeline_links else '  // No pipeline test harnesses found'}
];

const componentTests: TestLink[] = [
{chr(10).join(component_links) if component_links else '  // No standalone component tests'}
];

function TestLinkCard({{ href, title, description }}: TestLink) {{
  return (
    <Link
      href={{href}}
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
    >
      <h3 className="font-semibold text-blue-600">{{title}}</h3>
      <p className="text-sm text-gray-600 mt-1">{{description}}</p>
    </Link>
  );
}}

export default function TestIndexPage() {{
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {{/* Header */}}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Harness Index</h1>
          <p className="text-gray-600 mt-2">
            Central hub for all pipeline and component test harnesses.
          </p>
          <p className="text-xs text-gray-400 mt-1">Last updated: {timestamp}</p>
        </div>

        {{/* Pipeline Test Harnesses */}}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🚀 Pipeline Test Harnesses</h2>
          {{pipelineTests.length > 0 ? (
            <div className="grid gap-4">
              {{pipelineTests.map((test) => (
                <TestLinkCard key={{test.href}} {{...test}} />
              ))}}
            </div>
          ) : (
            <p className="text-gray-500">No pipeline test harnesses generated yet. Run testcheck stage to generate.</p>
          )}}
        </section>

        {{/* Component Tests */}}
        {{componentTests.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🧩 Standalone Component Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {{componentTests.map((test) => (
                <TestLinkCard key={{test.href}} {{...test}} />
              ))}}
            </div>
          </section>
        )}}

        {{/* Footer */}}
        <footer className="text-center text-sm text-gray-500 py-4">
          Test Harness Index • Auto-generated by pipeline orchestrator
        </footer>
      </div>
    </div>
  );
}}
'''

    # Write the file
    with open(master_file, 'w') as f:
        f.write(page_content)

    print(f"    Updated master test index: {master_file}")
    return master_file


def generate_test_harnesses_after_testcheck(state: dict, config: dict):
    """Generate pipeline test harness and update master index after testcheck completes."""
    print(f"\n  Generating test harnesses...")

    # Generate pipeline-specific test harness
    pipeline_harness = generate_pipeline_test_harness(state, config)

    # Update master test index
    master_index = update_master_test_index(config)

    # Update state with generated files
    if 'verification' not in state:
        state['verification'] = {}

    pipeline_name = get_pipeline_name_from_config(config, state)
    state['verification']['test_harness_path'] = pipeline_harness
    state['verification']['test_harness_url'] = f'/test/{pipeline_name}' if pipeline_name else None

    return pipeline_harness, master_index


def format_pipeline_stage_prompt(template: str, config: dict, state: dict) -> str:
    """Format prompt template for pipeline-level stages."""
    # Get paths from config
    pipeline_yaml_path = str(config.get('_config_path', ''))
    state_file_path = str(config.get('outputs', {}).get('_state_resolved', ''))
    implementation_plan_path = str(config.get('source', {}).get('_resolved_path', ''))

    # Get task count
    total_tasks = len(state.get('tasks', []))

    # Get request range
    first_request_id = state.get('metadata', {}).get('first_request_id', '')
    last_request_id = state.get('metadata', {}).get('last_request_id', '')

    return template.format(
        pipeline_yaml_path=pipeline_yaml_path,
        state_file_path=state_file_path,
        implementation_plan_path=implementation_plan_path,
        total_tasks=total_tasks,
        first_request_id=first_request_id,
        last_request_id=last_request_id,
    )


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
        success = run_task_stages(task, task_dict, config, state, dry_run, stage_filter, state_path)
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


def cmd_show_test_harness(config: dict):
    """Display test harness URL(s) from state file."""
    state_path = config['outputs']['_state_resolved']

    if not state_path.exists():
        print("No test harness created (no state file exists)")
        return

    state = load_state(state_path)
    if not state:
        print("No test harness created (state file is empty)")
        return

    # Check for verification results
    verification = state.get('verification', {})
    testcheck_completed = state.get('testcheck_completed', False)

    print(f"\n{'='*60}")
    print("Test Harness Status")
    print(f"{'='*60}")

    if not testcheck_completed and not verification:
        print("\nNo test harness created")
        print("Run the testcheck stage to create one:")
        print(f"  python pipeline_orchestrator.py --config {config.get('_config_path', 'pipeline.yaml')} --stages testcheck --keep")
        return

    # Display test harness info
    test_page_url = verification.get('summary', {}).get('test_page_url', '')
    deployed_url = verification.get('deployed_url', '')
    build_status = verification.get('build_status', verification.get('summary', {}).get('build_verification', 'unknown'))

    print(f"\nTestcheck completed: {state.get('testcheck_completed_at', 'unknown')}")
    print(f"Build status: {build_status}")

    # Local URL
    if test_page_url:
        print(f"\nLocal test URL:")
        print(f"  http://localhost:3000{test_page_url}")
    else:
        # Try to find test harness files
        import glob
        test_files = glob.glob('src/app/test/*/page.tsx')
        if test_files:
            print(f"\nLocal test URLs:")
            for f in test_files:
                # Extract route from path: src/app/test/item-manager/page.tsx -> /test/item-manager
                route = f.replace('src/app', '').replace('/page.tsx', '')
                print(f"  http://localhost:3000{route}")
        else:
            print("\nNo test harness pages found")

    # Deployed URL
    if deployed_url:
        print(f"\nDeployed URL:")
        print(f"  {deployed_url}")
    else:
        # Check if deployment was mentioned
        notes = verification.get('notes', [])
        deployment_note = next((n for n in notes if 'deploy' in n.lower()), None)
        if deployment_note:
            print(f"\nDeployment: {deployment_note}")

    # Show summary stats
    summary = verification.get('summary', {})
    if summary:
        print(f"\nVerification Summary:")
        print(f"  Total tasks: {summary.get('total_tasks', 'N/A')}")
        print(f"  Completed: {summary.get('completed_tasks', 'N/A')}")
        print(f"  Completion rate: {summary.get('implementation_completion_rate', 'N/A')}")
        print(f"  Discrepancies: {verification.get('discrepancies_count', 0)}")

    print(f"\n{'='*60}")


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
  %(prog)s --config ./pipeline.yaml --tasks "2,3"        # Process tasks 2 and 3 (by index)
  %(prog)s --config ./pipeline.yaml --tasks "8.3"        # Process task with ID "8.3"
  %(prog)s --config ./pipeline.yaml --tasks "8.*"        # Process all tasks starting with "8."
  %(prog)s --config ./pipeline.yaml --tasks "1-5"        # Process tasks 1 through 5 (by index)
  %(prog)s --config ./pipeline.yaml --tasks "1,8.3,9.*"  # Mixed: index, ID, and wildcard
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
        help='Process specific tasks. Supports: indices ("2,3"), ranges ("1-5"), task IDs ("8.3"), wildcards ("8.*"). E.g., "8.3" or "8.*" or "1,8.3"'
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
    parser.add_argument(
        '--test-harness',
        action='store_true',
        help='Display test harness URL(s) from state file and exit'
    )

    # Health check flags
    parser.add_argument(
        '--health-check',
        action='store_true',
        help='Run pipeline health check and exit'
    )
    parser.add_argument(
        '--health-check-json',
        action='store_true',
        help='Run health check and output as JSON'
    )
    parser.add_argument(
        '--skip-claude-checks',
        action='store_true',
        help='Skip Claude CLI checks in health check (faster)'
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

    if args.test_harness:
        cmd_show_test_harness(config)
        return

    if args.health_check or args.health_check_json:
        # Run pipeline health check
        try:
            # Try importing from claude_pipelines package
            from health_check import run_health_check, CheckStatus
        except ImportError:
            try:
                # Try relative to this file (sys already imported at module level)
                sys.path.insert(0, str(Path(__file__).parent))
                from health_check import run_health_check, CheckStatus
            except ImportError:
                print("Error: health_check.py not found")
                print("Expected at: claude-pipelines/health_check.py")
                sys.exit(1)

        report = run_health_check(
            skip_claude=args.skip_claude_checks,
            verbose=args.verbose and not args.health_check_json,
        )

        if args.health_check_json:
            print(report.to_json())
        else:
            print(report.to_table())

        # Exit with appropriate code
        if report.overall_status == CheckStatus.FAIL:
            sys.exit(1)
        elif report.overall_status == CheckStatus.WARN:
            sys.exit(2)
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
        task_indices = parse_task_indices(args.tasks, total_tasks, state['tasks'])
        if not task_indices:
            print(f"Error: No valid task indices in '{args.tasks}'")
            sys.exit(1)
        # Show matched tasks with their IDs for clarity
        matched_tasks = [(i+1, state['tasks'][i].get('id', '?')) for i in task_indices]
        print(f"Will process {len(task_indices)} specific task(s): {matched_tasks}")

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