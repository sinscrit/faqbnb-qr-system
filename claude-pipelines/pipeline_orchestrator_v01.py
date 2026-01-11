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
import os
import re
import subprocess
import sys
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
    for key in ['requests', 'state', 'logs']:
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
        ('stages', config.get('stages')),
    ]
    
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
        return json.loads(state_path.read_text(encoding='utf-8'))
    return None


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
    
    # Build stages dict from config
    stages = {}
    for stage in config.get('stages', []):
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
    
    return {
        "pipeline": config['pipeline']['name'],
        "version": config['pipeline'].get('version', '1.0'),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "status": "not_started",
        "current_stage": config['stages'][0]['id'] if config['stages'] else None,
        "source_file": str(source_path),
        "source_hash": compute_file_hash(source_path),
        "tasks": [asdict(t) for t in tasks],
        "stages": stages,
        "errors": [],
        "metadata": {
            "total_requests_generated": 0,
            "last_request_id": None,
            "config_file": str(config.get('_config_path', 'unknown'))
        }
    }


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


def delete_requests_in_range(requests_file: Path, first_id: str, last_id: str) -> bool:
    """
    Delete requests from first_id through last_id (inclusive) from the file.
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

def format_task_for_agent(task: Task, template: str) -> str:
    """
    Format a task into a prompt using the configured template.
    
    Available template variables:
      {task_id}, {task_title}, {task_description},
      {phase}, {phase_name}, {full_task}
    """
    full_task = f"Phase {task.phase} ({task.phase_name}), Task {task.id}: {task.title}"
    if task.description:
        full_task += "\nDetails:\n"
        for line in task.description.split('\n'):
            if line.strip():
                full_task += f"  - {line.strip()}\n"
    
    return template.format(
        task_id=task.id,
        task_title=task.title,
        task_description=task.description,
        phase=task.phase,
        phase_name=task.phase_name,
        full_task=full_task
    )


def invoke_agent(task: Task, stage_config: dict, dry_run: bool = False) -> tuple[bool, Optional[str]]:
    """
    Invoke the configured agent for a single task.
    
    Stage config expected:
        agent:
          invocation_template: "prompt template with {full_task}"
          command: ["claude", "-p", "{prompt}"]
          timeout: 120
    """
    agent_config = stage_config.get('agent', {})
    
    # Get invocation template
    template = agent_config.get('invocation_template', 
                                agent_config.get('invocation', 
                                                 'Process this task: {full_task}'))
    
    prompt = format_task_for_agent(task, template)
    
    if dry_run:
        print(f"\n  [DRY RUN] Would invoke agent with:")
        print(f"  Prompt: {prompt[:100]}...")
        return True, None
    
    # Get command template
    command_template = agent_config.get('command', ['claude', '-p', '{prompt}'])
    timeout = agent_config.get('timeout', 120)
    
    # Build actual command
    command = []
    for part in command_template:
        if '{prompt}' in part:
            command.append(part.replace('{prompt}', prompt))
        else:
            command.append(part)
    
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=stage_config.get('working_directory')
        )
        
        if result.returncode == 0:
            return True, None
        else:
            return False, f"Exit code {result.returncode}: {result.stderr[:500]}"
            
    except subprocess.TimeoutExpired:
        return False, f"Agent timed out ({timeout}s)"
    except FileNotFoundError as e:
        return False, f"Command not found: {command[0]}. Ensure it's in PATH."
    except Exception as e:
        return False, f"Unexpected error: {str(e)}"


# =============================================================================
# Pipeline Execution
# =============================================================================

def get_enabled_stage(config: dict, stage_id: str) -> Optional[dict]:
    """Get stage config by ID if enabled."""
    for stage in config.get('stages', []):
        if stage['id'] == stage_id and stage.get('enabled', True):
            return stage
    return None


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
            
            success, error = invoke_agent(task, stage_config, dry_run)
            
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


def run_pipeline(state: dict, config: dict, dry_run: bool = False, task_indices: Optional[List[int]] = None):
    """Run all enabled stages in sequence."""
    state['status'] = 'running'
    
    for stage in config.get('stages', []):
        if not stage.get('enabled', True):
            continue
        
        stage_id = stage['id']
        stage_state = state['stages'].get(stage_id, {})
        
        # Skip completed stages (unless we're processing specific tasks)
        if stage_state.get('status') == 'completed' and task_indices is None:
            print(f"\nStage '{stage_id}' already completed, skipping")
            continue
        
        run_stage(state, config, stage_id, dry_run, task_indices)
        
        # Check for stop hooks
        if stage.get('stop_hook') and not dry_run:
            print(f"\n[STOP HOOK] Stage '{stage_id}' complete.")
            print("Review outputs before continuing.")
            response = input("Continue to next stage? (y/N): ")
            if response.lower() != 'y':
                state['status'] = 'paused'
                return
        
        # Stop if stage failed
        if state['stages'][stage_id].get('status') == 'failed':
            state['status'] = 'failed'
            return
    
    state['status'] = 'completed'


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
            
            # Delete the requests
            success = delete_requests_in_range(requests_file, first_req, last_req)
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
    
    args = parser.parse_args()
    
    # Load configuration
    config_path = Path(args.config).resolve()
    try:
        config = load_config(config_path)
        config['_config_path'] = config_path
    except (FileNotFoundError, ValueError) as e:
        print(f"Error: {e}")
        sys.exit(1)
    
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
        
    else:
        print("Initializing new pipeline state")
        state = initialize_state(config, tasks)
    
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
    
    # Run pipeline
    try:
        run_pipeline(state, config, dry_run=args.dry_run, task_indices=task_indices)
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        state['status'] = 'paused'
    finally:
        save_state(state, state_path)
        print(f"\nState saved: {state_path}")


if __name__ == '__main__':
    main()