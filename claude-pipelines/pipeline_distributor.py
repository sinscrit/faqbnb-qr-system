#!/usr/bin/env python3
"""
Pipeline Distributor - Parallel Execution Coordinator via Git Worktrees

A meta-orchestrator that coordinates parallel pipeline execution by:
1. Running Stages 1-2 on main branch to gather dependency information
2. Analyzing dependencies to identify parallelizable task clusters
3. Creating git worktrees for each cluster
4. Spawning orchestrator instances in parallel
5. Monitoring progress and merging completed worktrees
6. Continuing with dependent tasks

Usage:
    python pipeline_distributor.py --config pipeline.yaml
    python pipeline_distributor.py --config pipeline.yaml --dry-run
    python pipeline_distributor.py --config pipeline.yaml --max-parallel 3
    python pipeline_distributor.py --config pipeline.yaml --resume

The distributor delegates actual task execution to pipeline_orchestrator.py,
keeping concerns separated and each component testable.

Last Modified: 2026-01-10
"""

import argparse
import json
import logging
import os
import shutil
import signal
import subprocess
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Set, Tuple, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

try:
    import yaml
except ImportError:
    print("Error: PyYAML is required. Install with: pip install pyyaml")
    sys.exit(1)

# Import dependency module
try:
    from pipeline_dependencies import (
        extract_all_dependencies,
        get_parallel_clusters,
        get_execution_order,
        get_ready_tasks,
        validate_dependencies,
        recompute_dependency_graph,
    )
except ImportError:
    print("Error: pipeline_dependencies.py is required.")
    print("Make sure it's in the same directory as this script.")
    sys.exit(1)


# =============================================================================
# Logging Setup
# =============================================================================

def setup_logging(log_path: Optional[Path] = None, verbose: bool = False):
    """Configure logging to file and console."""
    log_format = '%(asctime)s [%(levelname)s] %(message)s'
    date_format = '%Y-%m-%d %H:%M:%S'

    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG if verbose else logging.INFO)
    logger.handlers = []

    # Console handler
    console = logging.StreamHandler(sys.stdout)
    console.setLevel(logging.INFO)
    console.setFormatter(logging.Formatter(log_format, date_format))
    logger.addHandler(console)

    # File handler
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
class WorktreeInfo:
    """Information about a git worktree."""
    name: str
    path: Path
    branch: str
    cluster_id: str
    tasks: List[str]
    status: str = "pending"  # pending, running, completed, failed, merging, merged
    process: Optional[subprocess.Popen] = field(default=None, repr=False)
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "path": str(self.path),
            "branch": self.branch,
            "cluster_id": self.cluster_id,
            "tasks": self.tasks,
            "status": self.status,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "error": self.error,
        }


@dataclass
class DistributorState:
    """State of the distributor execution."""
    pipeline_name: str
    config_path: str
    status: str = "not_started"
    mode: str = "parallel"
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())

    # Phase tracking
    current_phase: str = "init"  # init, gathering, analyzing, distributing, merging, finalizing
    phases_completed: List[str] = field(default_factory=list)

    # Cluster tracking
    total_clusters: int = 0
    clusters_completed: int = 0
    clusters_failed: int = 0

    # Worktree tracking
    worktrees: Dict[str, dict] = field(default_factory=dict)
    merge_queue: List[str] = field(default_factory=list)
    merged_branches: List[str] = field(default_factory=list)

    # Task tracking
    total_tasks: int = 0
    tasks_completed: int = 0
    sequential_tasks: List[str] = field(default_factory=list)  # Tasks that must run after merges

    # Errors
    errors: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


# =============================================================================
# Configuration
# =============================================================================

def load_config(config_path: Path) -> dict:
    """Load pipeline configuration."""
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    config = yaml.safe_load(config_path.read_text(encoding='utf-8'))
    config['_config_path'] = config_path
    config['_config_dir'] = config_path.parent

    # Resolve paths
    for key in ['state', 'logs']:
        if key in config.get('outputs', {}):
            out_path = config['outputs'][key]
            if out_path and not Path(out_path).is_absolute():
                config['outputs'][f'_{key}_resolved'] = config['_config_dir'] / out_path

    return config


def get_parallelization_config(config: dict) -> dict:
    """Extract parallelization settings from config."""
    defaults = {
        'enabled': True,
        'max_concurrent': 3,
        'branch_pattern': 'pipeline/{pipeline_name}/{cluster_id}',
        'worktree_dir': '../.worktrees/{pipeline_name}',
        'merge_strategy': 'sequential',
        'cleanup_worktrees': True,
        'on_merge_conflict': 'pause_and_notify',
    }

    parallel_config = config.get('parallelization', {})
    return {**defaults, **parallel_config}


# =============================================================================
# State Management
# =============================================================================

def get_distributor_state_path(config: dict) -> Path:
    """Get path for distributor state file."""
    config_dir = config.get('_config_dir', Path('.'))
    pipeline_name = config.get('pipeline', {}).get('name', 'pipeline')
    return config_dir / f"{pipeline_name}-distributor-state.json"


def load_distributor_state(state_path: Path) -> Optional[DistributorState]:
    """Load existing distributor state."""
    if not state_path.exists():
        return None

    try:
        data = json.loads(state_path.read_text(encoding='utf-8'))
        state = DistributorState(
            pipeline_name=data.get('pipeline_name', ''),
            config_path=data.get('config_path', ''),
        )
        for key, value in data.items():
            if hasattr(state, key):
                setattr(state, key, value)
        return state
    except Exception as e:
        logging.warning(f"Failed to load distributor state: {e}")
        return None


def save_distributor_state(state: DistributorState, state_path: Path):
    """Save distributor state to file."""
    state.updated_at = datetime.now().isoformat()
    state_path.write_text(
        json.dumps(state.to_dict(), indent=2, default=str),
        encoding='utf-8'
    )


def load_orchestrator_state(config: dict) -> Optional[dict]:
    """Load the main orchestrator state file."""
    state_path = config.get('outputs', {}).get('_state_resolved')
    if not state_path:
        state_path = config.get('_config_dir', Path('.')) / config.get('outputs', {}).get('state', 'pipeline-state.json')

    if not Path(state_path).exists():
        return None

    try:
        return json.loads(Path(state_path).read_text(encoding='utf-8'))
    except Exception as e:
        logging.warning(f"Failed to load orchestrator state: {e}")
        return None


# =============================================================================
# Git Worktree Management
# =============================================================================

def get_current_branch() -> str:
    """Get the current git branch name."""
    result = subprocess.run(
        ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
        capture_output=True,
        text=True
    )
    return result.stdout.strip() if result.returncode == 0 else 'main'


def list_worktrees() -> List[Dict[str, str]]:
    """List all git worktrees."""
    result = subprocess.run(
        ['git', 'worktree', 'list', '--porcelain'],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        return []

    worktrees = []
    current = {}

    for line in result.stdout.split('\n'):
        if line.startswith('worktree '):
            if current:
                worktrees.append(current)
            current = {'path': line[9:]}
        elif line.startswith('HEAD '):
            current['head'] = line[5:]
        elif line.startswith('branch '):
            current['branch'] = line[7:]
        elif line == 'bare':
            current['bare'] = True
        elif line == 'detached':
            current['detached'] = True

    if current:
        worktrees.append(current)

    return worktrees


def create_worktree(
    worktree_path: Path,
    branch_name: str,
    base_branch: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Create a new git worktree with a new branch.

    Args:
        worktree_path: Path for the new worktree
        branch_name: Name of the new branch to create
        base_branch: Branch to base the new branch on (default: current branch)

    Returns:
        (success, error_message)
    """
    # Ensure parent directory exists
    worktree_path.parent.mkdir(parents=True, exist_ok=True)

    # Build command
    cmd = ['git', 'worktree', 'add', str(worktree_path), '-b', branch_name]
    if base_branch:
        cmd.append(base_branch)

    logging.info(f"Creating worktree: {' '.join(cmd)}")

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        error = result.stderr.strip() or result.stdout.strip()
        logging.error(f"Failed to create worktree: {error}")
        return False, error

    logging.info(f"Created worktree at {worktree_path} on branch {branch_name}")
    return True, ""


def remove_worktree(worktree_path: Path, force: bool = False) -> Tuple[bool, str]:
    """
    Remove a git worktree.

    Args:
        worktree_path: Path of the worktree to remove
        force: Force removal even if there are changes

    Returns:
        (success, error_message)
    """
    cmd = ['git', 'worktree', 'remove', str(worktree_path)]
    if force:
        cmd.append('--force')

    logging.info(f"Removing worktree: {' '.join(cmd)}")

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        error = result.stderr.strip() or result.stdout.strip()
        logging.warning(f"Failed to remove worktree cleanly: {error}")

        # Try force removal
        if not force:
            return remove_worktree(worktree_path, force=True)

        return False, error

    logging.info(f"Removed worktree at {worktree_path}")
    return True, ""


def delete_branch(branch_name: str, force: bool = False) -> Tuple[bool, str]:
    """Delete a git branch."""
    cmd = ['git', 'branch', '-d' if not force else '-D', branch_name]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        error = result.stderr.strip()
        if 'not fully merged' in error and not force:
            return delete_branch(branch_name, force=True)
        return False, error

    return True, ""


def merge_branch(
    branch_name: str,
    strategy: str = 'sequential',
    message: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Merge a branch into the current branch.

    Args:
        branch_name: Branch to merge
        strategy: Merge strategy (sequential, rebase, squash)
        message: Custom merge commit message

    Returns:
        (success, error_message)
    """
    if strategy == 'rebase':
        cmd = ['git', 'rebase', branch_name]
    elif strategy == 'squash':
        cmd = ['git', 'merge', '--squash', branch_name]
    else:  # sequential (regular merge)
        cmd = ['git', 'merge', branch_name]
        if message:
            cmd.extend(['-m', message])

    logging.info(f"Merging branch: {' '.join(cmd)}")

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        error = result.stderr.strip() or result.stdout.strip()
        logging.error(f"Merge failed: {error}")
        return False, error

    # For squash merges, we need to commit
    if strategy == 'squash':
        commit_msg = message or f"Squash merge branch '{branch_name}'"
        commit_result = subprocess.run(
            ['git', 'commit', '-m', commit_msg],
            capture_output=True,
            text=True
        )
        if commit_result.returncode != 0:
            return False, commit_result.stderr.strip()

    logging.info(f"Successfully merged {branch_name}")
    return True, ""


def abort_merge() -> bool:
    """Abort an in-progress merge."""
    result = subprocess.run(['git', 'merge', '--abort'], capture_output=True)
    return result.returncode == 0


def has_uncommitted_changes() -> bool:
    """Check if there are uncommitted changes."""
    result = subprocess.run(
        ['git', 'status', '--porcelain'],
        capture_output=True,
        text=True
    )
    return bool(result.stdout.strip())


# =============================================================================
# Orchestrator Process Management
# =============================================================================

def run_orchestrator(
    config_path: Path,
    worktree_path: Optional[Path] = None,
    stages: Optional[List[str]] = None,
    tasks: Optional[List[str]] = None,
    dry_run: bool = False,
    extra_args: Optional[List[str]] = None
) -> subprocess.Popen:
    """
    Spawn an orchestrator process.

    Args:
        config_path: Path to pipeline config
        worktree_path: Working directory (worktree path)
        stages: Specific stages to run
        tasks: Specific tasks to run
        dry_run: Run in dry-run mode
        extra_args: Additional arguments

    Returns:
        Popen process object
    """
    # Build command
    cmd = [sys.executable, 'pipeline_orchestrator.py', '--config', str(config_path)]

    if stages:
        cmd.extend(['--stages', ','.join(stages)])

    if tasks:
        cmd.extend(['--tasks', ','.join(tasks)])

    if dry_run:
        cmd.append('--dry-run')

    if extra_args:
        cmd.extend(extra_args)

    # Set working directory
    cwd = worktree_path if worktree_path else None

    logging.info(f"Spawning orchestrator: {' '.join(cmd)}")
    if cwd:
        logging.info(f"  Working directory: {cwd}")

    # Start process
    process = subprocess.Popen(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    return process


def wait_for_orchestrator(
    process: subprocess.Popen,
    timeout: Optional[int] = None,
    log_prefix: str = ""
) -> Tuple[int, str]:
    """
    Wait for an orchestrator process to complete.

    Args:
        process: Popen process object
        timeout: Timeout in seconds
        log_prefix: Prefix for log messages

    Returns:
        (return_code, output)
    """
    output_lines = []

    try:
        start_time = time.time()

        while True:
            # Check timeout
            if timeout and (time.time() - start_time) > timeout:
                process.terminate()
                return -1, "Process timed out"

            # Read output
            line = process.stdout.readline()
            if line:
                line = line.rstrip()
                output_lines.append(line)
                if log_prefix:
                    logging.info(f"{log_prefix} {line}")

            # Check if process finished
            if process.poll() is not None:
                # Read remaining output
                remaining = process.stdout.read()
                if remaining:
                    for line in remaining.split('\n'):
                        if line.strip():
                            output_lines.append(line)
                            if log_prefix:
                                logging.info(f"{log_prefix} {line}")
                break

            time.sleep(0.1)

        return process.returncode, '\n'.join(output_lines)

    except Exception as e:
        logging.error(f"Error waiting for orchestrator: {e}")
        return -1, str(e)


# =============================================================================
# Cluster Management
# =============================================================================

def identify_execution_clusters(
    state: dict,
    max_parallel: int = 3
) -> Tuple[List[List[str]], List[str]]:
    """
    Identify clusters of tasks that can run in parallel.

    Returns:
        (parallel_clusters, sequential_tasks)
        - parallel_clusters: List of task ID lists that can run in parallel
        - sequential_tasks: Tasks that must run after all parallel work completes
    """
    clusters = get_parallel_clusters(state)

    if not clusters:
        # No dependency info, run everything sequentially
        tasks = [t.get('id') for t in state.get('tasks', [])]
        return [], tasks

    # Limit cluster count based on max_parallel
    parallel_clusters = []
    sequential_tasks = []

    # First pass: identify truly parallel clusters (can run at same time)
    # A cluster can run in parallel if none of its tasks depend on incomplete tasks
    execution_order = get_execution_order(state)
    deps_info = state.get('dependencies', {}).get('tasks', {})

    # Group clusters by their "depth" in the dependency graph
    cluster_depths = {}
    for i, cluster in enumerate(clusters):
        max_depth = 0
        for task_id in cluster:
            # Find position in execution order
            if task_id in execution_order:
                pos = execution_order.index(task_id)
                max_depth = max(max_depth, pos)
        cluster_depths[i] = max_depth

    # Sort clusters by depth
    sorted_clusters = sorted(range(len(clusters)), key=lambda i: cluster_depths[i])

    # Group clusters that can run together (same depth level)
    current_depth = -1
    current_group = []

    for cluster_idx in sorted_clusters:
        depth = cluster_depths[cluster_idx]

        if depth != current_depth:
            if current_group:
                # Add previous group
                if len(current_group) > 1:
                    parallel_clusters.append(current_group)
                else:
                    sequential_tasks.extend(current_group[0])
            current_group = [clusters[cluster_idx]]
            current_depth = depth
        else:
            current_group.append(clusters[cluster_idx])

    # Handle last group
    if current_group:
        if len(current_group) > 1:
            parallel_clusters.append(current_group)
        else:
            sequential_tasks.extend(current_group[0])

    return parallel_clusters, sequential_tasks


def create_cluster_worktrees(
    clusters: List[List[str]],
    config: dict,
    state: DistributorState
) -> List[WorktreeInfo]:
    """
    Create worktrees for parallel cluster execution.

    Args:
        clusters: List of task ID lists (each list is a cluster)
        config: Pipeline configuration
        state: Distributor state

    Returns:
        List of WorktreeInfo objects
    """
    parallel_config = get_parallelization_config(config)
    pipeline_name = config.get('pipeline', {}).get('name', 'pipeline')

    worktree_base = Path(parallel_config['worktree_dir'].format(
        pipeline_name=pipeline_name
    ))

    base_branch = get_current_branch()
    worktrees = []

    for i, cluster_tasks in enumerate(clusters):
        cluster_id = f"cluster-{i:02d}"

        # Build paths and names
        branch_name = parallel_config['branch_pattern'].format(
            pipeline_name=pipeline_name,
            cluster_id=cluster_id
        )
        worktree_path = worktree_base / cluster_id

        # Create worktree
        success, error = create_worktree(worktree_path, branch_name, base_branch)

        wt_info = WorktreeInfo(
            name=cluster_id,
            path=worktree_path,
            branch=branch_name,
            cluster_id=cluster_id,
            tasks=cluster_tasks,
            status="created" if success else "failed",
            error=error if not success else None,
        )

        worktrees.append(wt_info)
        state.worktrees[cluster_id] = wt_info.to_dict()

    return worktrees


# =============================================================================
# Main Distribution Logic
# =============================================================================

class PipelineDistributor:
    """Coordinates parallel pipeline execution via git worktrees."""

    def __init__(
        self,
        config_path: Path,
        max_parallel: int = 3,
        dry_run: bool = False,
        verbose: bool = False,
        validate: bool = False,
    ):
        self.config_path = config_path
        self.config = load_config(config_path)
        self.max_parallel = max_parallel
        self.dry_run = dry_run
        self.verbose = verbose
        self.validate = validate

        # State
        self.state_path = get_distributor_state_path(self.config)
        self.state: Optional[DistributorState] = None

        # Process tracking
        self.active_processes: Dict[str, subprocess.Popen] = {}
        self.process_lock = Lock()

        # Shutdown handling
        self._shutdown_requested = False
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        logging.warning("Shutdown requested, cleaning up...")
        self._shutdown_requested = True

        # Terminate active processes
        with self.process_lock:
            for name, proc in self.active_processes.items():
                logging.info(f"Terminating process for {name}")
                proc.terminate()

    def initialize_state(self) -> DistributorState:
        """Initialize or load distributor state."""
        existing = load_distributor_state(self.state_path)

        if existing and existing.status not in ('completed', 'failed'):
            logging.info(f"Resuming from existing state: {existing.current_phase}")
            return existing

        # Create new state
        state = DistributorState(
            pipeline_name=self.config.get('pipeline', {}).get('name', 'pipeline'),
            config_path=str(self.config_path),
        )

        save_distributor_state(state, self.state_path)
        return state

    def run_gathering_phase(self) -> bool:
        """
        Phase 1: Run Stages 1-2 on main to gather dependency information.

        Returns:
            True if successful
        """
        logging.info("=" * 60)
        logging.info("PHASE 1: Gathering Dependencies (Stages 1-2)")
        logging.info("=" * 60)

        self.state.current_phase = "gathering"
        save_distributor_state(self.state, self.state_path)

        if self.dry_run:
            logging.info("[DRY RUN] Would run orchestrator with stages: request, overview")
            return True

        # Run orchestrator for stages 1-2
        process = run_orchestrator(
            config_path=self.config_path,
            stages=['request', 'overview'],
            dry_run=False,
        )

        return_code, output = wait_for_orchestrator(
            process,
            log_prefix="[gather]"
        )

        if return_code != 0:
            self.state.errors.append(f"Gathering phase failed with code {return_code}")
            logging.error(f"Gathering phase failed: {output[-500:]}")
            return False

        self.state.phases_completed.append("gathering")
        save_distributor_state(self.state, self.state_path)

        logging.info("Gathering phase completed successfully")
        return True

    def run_analysis_phase(self) -> Tuple[List[List[str]], List[str]]:
        """
        Phase 2: Analyze dependencies and identify parallel clusters.

        Returns:
            (parallel_clusters, sequential_tasks)
        """
        logging.info("=" * 60)
        logging.info("PHASE 2: Analyzing Dependencies")
        logging.info("=" * 60)

        self.state.current_phase = "analyzing"
        save_distributor_state(self.state, self.state_path)

        # Load orchestrator state with dependency info
        orch_state = load_orchestrator_state(self.config)

        if not orch_state:
            logging.error("No orchestrator state found")
            return [], []

        # Check for dependency info
        deps_info = orch_state.get('dependencies')
        if not deps_info:
            logging.warning("No dependency information found in state")
            logging.info("Running full dependency extraction...")

            if not self.dry_run:
                orch_state = extract_all_dependencies(self.config, orch_state)

        # Validate dependencies
        is_valid, messages = validate_dependencies(orch_state, self.config)
        for msg in messages:
            logging.info(f"  {msg}")

        if not is_valid:
            logging.error("Dependency validation failed")
            self.state.errors.extend(messages)
            return [], []

        # Identify clusters
        parallel_clusters, sequential_tasks = identify_execution_clusters(
            orch_state,
            max_parallel=self.max_parallel
        )

        self.state.total_tasks = len(orch_state.get('tasks', []))
        self.state.total_clusters = len(parallel_clusters)
        self.state.sequential_tasks = sequential_tasks
        self.state.phases_completed.append("analyzing")
        save_distributor_state(self.state, self.state_path)

        logging.info(f"Found {len(parallel_clusters)} parallel cluster groups")
        logging.info(f"Found {len(sequential_tasks)} sequential tasks")

        for i, cluster_group in enumerate(parallel_clusters):
            logging.info(f"  Cluster group {i}: {len(cluster_group)} clusters")
            for j, cluster in enumerate(cluster_group):
                logging.info(f"    Cluster {j}: {cluster}")

        return parallel_clusters, sequential_tasks

    def analyze_parallelization_benefit(
        self,
        parallel_clusters: List[List[str]],
        sequential_tasks: List[str]
    ) -> dict:
        """
        Analyze whether parallel execution would provide benefit.

        Logs recommendations about parallelization settings.

        Args:
            parallel_clusters: Identified parallel cluster groups
            sequential_tasks: Tasks that must run sequentially

        Returns:
            Analysis results dictionary
        """
        logging.info("=" * 60)
        logging.info("PARALLELIZATION ANALYSIS")
        logging.info("=" * 60)

        # Get config settings
        para_config = self.config.get('parallelization', {})
        para_enabled = para_config.get('enabled', False)

        # Calculate metrics
        total_tasks = self.state.total_tasks
        total_clusters = sum(len(group) for group in parallel_clusters)

        # Count multi-task clusters (clusters with more than 1 task)
        multi_task_clusters = 0
        max_cluster_size = 0
        parallelizable_tasks = 0

        for group in parallel_clusters:
            for cluster in group:
                cluster_size = len(cluster) if isinstance(cluster, list) else 1
                if cluster_size > 1:
                    multi_task_clusters += 1
                max_cluster_size = max(max_cluster_size, cluster_size)
                parallelizable_tasks += cluster_size

        # Single-task clusters indicate sequential dependency chain
        single_task_clusters = total_clusters - multi_task_clusters

        # Calculate parallelization benefit
        if total_tasks > 0:
            parallel_ratio = parallelizable_tasks / total_tasks
            sequential_ratio = len(sequential_tasks) / total_tasks if sequential_tasks else 0
        else:
            parallel_ratio = 0
            sequential_ratio = 1

        # Determine if parallelization would help
        would_benefit = (
            multi_task_clusters > 0 or
            (total_clusters > 1 and max_cluster_size > 1)
        )

        # Build analysis result
        analysis = {
            'parallelization_enabled': para_enabled,
            'total_tasks': total_tasks,
            'total_clusters': total_clusters,
            'multi_task_clusters': multi_task_clusters,
            'single_task_clusters': single_task_clusters,
            'max_cluster_size': max_cluster_size,
            'sequential_tasks': len(sequential_tasks),
            'parallel_ratio': parallel_ratio,
            'would_benefit': would_benefit,
        }

        # Log analysis
        logging.info(f"  Total tasks: {total_tasks}")
        logging.info(f"  Total clusters: {total_clusters}")
        logging.info(f"  Multi-task clusters: {multi_task_clusters}")
        logging.info(f"  Single-task clusters: {single_task_clusters}")
        logging.info(f"  Max cluster size: {max_cluster_size}")
        logging.info(f"  Sequential tasks: {len(sequential_tasks)}")
        logging.info(f"  Parallelization enabled: {para_enabled}")
        logging.info("")

        # Provide recommendations
        logging.info("RECOMMENDATION:")

        if not para_enabled and would_benefit:
            logging.warning(
                "  Parallelization is DISABLED but could provide benefit."
            )
            logging.warning(
                f"  Found {multi_task_clusters} multi-task clusters that could run concurrently."
            )
            logging.warning(
                "  Consider setting 'parallelization.enabled: true' in your config."
            )
        elif not para_enabled and not would_benefit:
            logging.info(
                "  Parallelization is DISABLED. This is appropriate for this pipeline."
            )
            logging.info(
                f"  Dependency structure is heavily sequential ({single_task_clusters} single-task clusters)."
            )
            logging.info(
                "  Parallel execution would provide minimal benefit."
            )
            logging.info(
                "  Recommendation: Use the orchestrator directly for sequential execution:"
            )
            logging.info(
                f"    python pipeline_orchestrator.py --config {self.config_path} --resume"
            )
        elif para_enabled and would_benefit:
            logging.info(
                "  Parallelization is ENABLED and will provide benefit."
            )
            logging.info(
                f"  {multi_task_clusters} clusters can run concurrently."
            )
            potential_speedup = min(self.max_parallel, multi_task_clusters)
            logging.info(
                f"  Potential speedup: up to {potential_speedup}x with --max-parallel {self.max_parallel}"
            )
        elif para_enabled and not would_benefit:
            logging.warning(
                "  Parallelization is ENABLED but provides NO benefit for this pipeline."
            )
            logging.warning(
                f"  All {total_clusters} clusters are single-task (sequential dependencies)."
            )
            logging.warning(
                "  Consider using the orchestrator directly to avoid worktree overhead:"
            )
            logging.warning(
                f"    python pipeline_orchestrator.py --config {self.config_path} --resume"
            )

        logging.info("")

        return analysis

    def run_validation_phase(self) -> Tuple[bool, List[str]]:
        """
        Run Claude to validate pipeline structure and task coherence.

        Returns:
            (is_valid, messages) - Whether validation passed and any issues found
        """
        logging.info("=" * 60)
        logging.info("PIPELINE VALIDATION (Claude Review)")
        logging.info("=" * 60)

        # Load orchestrator state for full context
        orch_state = load_orchestrator_state(self.config)
        if not orch_state:
            logging.warning("No orchestrator state found, skipping validation")
            return True, ["No state to validate"]

        # Build validation summary
        tasks = orch_state.get('tasks', [])
        deps_info = orch_state.get('dependencies', {})
        tasks_deps = deps_info.get('tasks', {})
        graph = deps_info.get('graph', {})
        execution = deps_info.get('execution', {})

        # Create a summary for Claude
        summary_lines = [
            f"Pipeline: {self.config.get('pipeline', {}).get('name', 'unknown')}",
            f"Total Tasks: {len(tasks)}",
            f"Dependency Edges: {len(graph.get('edges', []))}",
            f"Root Tasks: {graph.get('roots', [])}",
            f"Leaf Tasks: {graph.get('leaves', [])}",
            f"Has Cycles: {execution.get('has_cycles', False)}",
            "",
            "TASKS:",
        ]

        for task in tasks[:30]:  # Limit to first 30 for context
            task_id = task.get('id', '?')
            title = task.get('title', 'Untitled')
            phase = task.get('phase_name', task.get('phase', ''))
            status = task.get('status', 'pending')
            deps = tasks_deps.get(task_id, {})
            depends_on = deps.get('depends_on', [])
            blocks = deps.get('blocks', [])

            summary_lines.append(f"  [{task_id}] {title}")
            summary_lines.append(f"      Phase: {phase}, Status: {status}")
            if depends_on:
                summary_lines.append(f"      Depends on: {depends_on}")
            if blocks:
                summary_lines.append(f"      Blocks: {blocks}")

        if len(tasks) > 30:
            summary_lines.append(f"  ... and {len(tasks) - 30} more tasks")

        summary = "\n".join(summary_lines)

        # Build validation prompt
        prompt = f"""Review this pipeline configuration and task structure for potential issues:

{summary}

Please analyze:
1. Does the task ordering and dependencies make logical sense?
2. Are there any tasks that seem out of order or have incorrect dependencies?
3. Are there any missing dependencies that should exist?
4. Are there any tasks that don't make sense given the overall pipeline goal?
5. Are there any potential issues with the implementation plan?

Provide a brief assessment with:
- PASS/WARN/FAIL status
- Any specific issues found
- Recommendations if applicable

Keep the response concise (under 500 words)."""

        logging.info("Invoking Claude for pipeline validation...")

        # Invoke Claude CLI
        try:
            cmd = [
                'claude',
                '-p', prompt,
                '--allowedTools', 'none',
                '--max-turns', '1'
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )

            if result.returncode != 0:
                logging.warning(f"Claude validation returned non-zero: {result.returncode}")
                if result.stderr:
                    logging.warning(f"stderr: {result.stderr[:500]}")
                return True, ["Validation skipped - Claude invocation failed"]

            response = result.stdout.strip()

            # Log the response
            logging.info("")
            logging.info("Claude's Assessment:")
            logging.info("-" * 40)
            for line in response.split('\n'):
                logging.info(f"  {line}")
            logging.info("-" * 40)

            # Parse response for status
            response_upper = response.upper()
            is_valid = True
            messages = []

            if 'FAIL' in response_upper:
                is_valid = False
                messages.append("Claude found critical issues with the pipeline")
            elif 'WARN' in response_upper:
                messages.append("Claude found potential issues (warnings)")
            else:
                messages.append("Claude validation passed")

            messages.append(response[:1000])  # Include response in messages

            return is_valid, messages

        except subprocess.TimeoutExpired:
            logging.warning("Claude validation timed out")
            return True, ["Validation skipped - timeout"]
        except FileNotFoundError:
            logging.warning("Claude CLI not found, skipping validation")
            return True, ["Validation skipped - claude CLI not found"]
        except Exception as e:
            logging.warning(f"Claude validation failed: {e}")
            return True, [f"Validation skipped - {e}"]

    def run_distribution_phase(
        self,
        cluster_group: List[List[str]]
    ) -> bool:
        """
        Phase 3: Create worktrees and run orchestrators in parallel.

        Args:
            cluster_group: List of clusters to run in parallel

        Returns:
            True if all clusters completed successfully
        """
        logging.info("=" * 60)
        logging.info(f"PHASE 3: Distributing {len(cluster_group)} Clusters")
        logging.info("=" * 60)

        self.state.current_phase = "distributing"
        save_distributor_state(self.state, self.state_path)

        if self.dry_run:
            for i, cluster in enumerate(cluster_group):
                logging.info(f"[DRY RUN] Would create worktree for cluster {i}: {cluster}")
            return True

        # Create worktrees
        worktrees = create_cluster_worktrees(
            cluster_group,
            self.config,
            self.state
        )

        # Check for creation failures
        failed = [wt for wt in worktrees if wt.status == "failed"]
        if failed:
            for wt in failed:
                logging.error(f"Failed to create worktree {wt.name}: {wt.error}")
            return False

        # Run orchestrators in parallel
        success = self._run_parallel_orchestrators(worktrees)

        return success

    def _run_parallel_orchestrators(
        self,
        worktrees: List[WorktreeInfo]
    ) -> bool:
        """Run orchestrators in parallel for each worktree."""

        def run_in_worktree(wt: WorktreeInfo) -> Tuple[str, bool, str]:
            """Run orchestrator in a single worktree."""
            wt.status = "running"
            wt.started_at = datetime.now().isoformat()
            self.state.worktrees[wt.cluster_id] = wt.to_dict()
            save_distributor_state(self.state, self.state_path)

            logging.info(f"Starting orchestrator in {wt.name} for tasks: {wt.tasks}")

            try:
                process = run_orchestrator(
                    config_path=self.config_path.name,  # Relative path in worktree
                    worktree_path=wt.path,
                    stages=['details', 'implementation'],
                    tasks=wt.tasks,
                )

                with self.process_lock:
                    self.active_processes[wt.cluster_id] = process
                    wt.process = process

                return_code, output = wait_for_orchestrator(
                    process,
                    log_prefix=f"[{wt.name}]"
                )

                with self.process_lock:
                    del self.active_processes[wt.cluster_id]

                if return_code == 0:
                    wt.status = "completed"
                    wt.completed_at = datetime.now().isoformat()
                    return wt.cluster_id, True, ""
                else:
                    wt.status = "failed"
                    wt.error = f"Exit code {return_code}"
                    wt.completed_at = datetime.now().isoformat()
                    return wt.cluster_id, False, output[-1000:]

            except Exception as e:
                wt.status = "failed"
                wt.error = str(e)
                wt.completed_at = datetime.now().isoformat()
                return wt.cluster_id, False, str(e)

            finally:
                self.state.worktrees[wt.cluster_id] = wt.to_dict()
                save_distributor_state(self.state, self.state_path)

        # Run in parallel using ThreadPoolExecutor
        all_success = True
        with ThreadPoolExecutor(max_workers=self.max_parallel) as executor:
            futures = {
                executor.submit(run_in_worktree, wt): wt
                for wt in worktrees
            }

            for future in as_completed(futures):
                if self._shutdown_requested:
                    logging.warning("Shutdown requested, cancelling remaining tasks")
                    executor.shutdown(wait=False)
                    return False

                wt = futures[future]
                try:
                    cluster_id, success, error = future.result()
                    if success:
                        logging.info(f"Cluster {cluster_id} completed successfully")
                        self.state.clusters_completed += 1
                        self.state.merge_queue.append(cluster_id)
                    else:
                        logging.error(f"Cluster {cluster_id} failed: {error}")
                        self.state.clusters_failed += 1
                        all_success = False
                except Exception as e:
                    logging.error(f"Exception in cluster {wt.cluster_id}: {e}")
                    self.state.clusters_failed += 1
                    all_success = False

                save_distributor_state(self.state, self.state_path)

        return all_success

    def run_merge_phase(self) -> bool:
        """
        Phase 4: Merge completed worktree branches back to main.

        Returns:
            True if all merges successful
        """
        logging.info("=" * 60)
        logging.info("PHASE 4: Merging Branches")
        logging.info("=" * 60)

        self.state.current_phase = "merging"
        save_distributor_state(self.state, self.state_path)

        if self.dry_run:
            for cluster_id in self.state.merge_queue:
                wt_info = self.state.worktrees.get(cluster_id, {})
                logging.info(f"[DRY RUN] Would merge branch: {wt_info.get('branch')}")
            return True

        parallel_config = get_parallelization_config(self.config)
        merge_strategy = parallel_config.get('merge_strategy', 'sequential')

        all_success = True
        for cluster_id in list(self.state.merge_queue):
            wt_info = self.state.worktrees.get(cluster_id, {})
            branch_name = wt_info.get('branch')

            if not branch_name:
                logging.warning(f"No branch info for cluster {cluster_id}")
                continue

            # Update status
            wt_info['status'] = 'merging'
            self.state.worktrees[cluster_id] = wt_info
            save_distributor_state(self.state, self.state_path)

            # Perform merge
            success, error = merge_branch(
                branch_name,
                strategy=merge_strategy,
                message=f"Merge cluster {cluster_id} from pipeline distribution"
            )

            if success:
                logging.info(f"Successfully merged {branch_name}")
                wt_info['status'] = 'merged'
                self.state.merged_branches.append(branch_name)
                self.state.merge_queue.remove(cluster_id)
            else:
                logging.error(f"Failed to merge {branch_name}: {error}")
                wt_info['status'] = 'merge_failed'
                wt_info['error'] = error
                all_success = False

                # Handle conflict based on config
                on_conflict = parallel_config.get('on_merge_conflict', 'pause_and_notify')
                if on_conflict == 'abort':
                    abort_merge()
                    break
                elif on_conflict == 'pause_and_notify':
                    logging.error("Merge conflict detected. Please resolve manually.")
                    logging.error(f"  Branch: {branch_name}")
                    logging.error(f"  Worktree: {wt_info.get('path')}")
                    break

            self.state.worktrees[cluster_id] = wt_info
            save_distributor_state(self.state, self.state_path)

        self.state.phases_completed.append("merging")
        save_distributor_state(self.state, self.state_path)

        return all_success

    def run_cleanup_phase(self):
        """Phase 5: Clean up worktrees and branches."""
        logging.info("=" * 60)
        logging.info("PHASE 5: Cleanup")
        logging.info("=" * 60)

        parallel_config = get_parallelization_config(self.config)
        if not parallel_config.get('cleanup_worktrees', True):
            logging.info("Cleanup disabled in config, skipping")
            return

        if self.dry_run:
            for cluster_id, wt_info in self.state.worktrees.items():
                logging.info(f"[DRY RUN] Would remove worktree: {wt_info.get('path')}")
                logging.info(f"[DRY RUN] Would delete branch: {wt_info.get('branch')}")
            return

        for cluster_id, wt_info in self.state.worktrees.items():
            if wt_info.get('status') != 'merged':
                logging.info(f"Skipping cleanup for {cluster_id} (status: {wt_info.get('status')})")
                continue

            worktree_path = Path(wt_info.get('path', ''))
            branch_name = wt_info.get('branch', '')

            # Remove worktree
            if worktree_path.exists():
                success, error = remove_worktree(worktree_path)
                if not success:
                    logging.warning(f"Failed to remove worktree {worktree_path}: {error}")

            # Delete branch
            if branch_name:
                success, error = delete_branch(branch_name)
                if not success:
                    logging.warning(f"Failed to delete branch {branch_name}: {error}")

        self.state.phases_completed.append("cleanup")
        save_distributor_state(self.state, self.state_path)

    def run_sequential_phase(self) -> bool:
        """
        Phase 6: Run remaining sequential tasks on main.

        Returns:
            True if successful
        """
        if not self.state.sequential_tasks:
            logging.info("No sequential tasks to run")
            return True

        logging.info("=" * 60)
        logging.info(f"PHASE 6: Running {len(self.state.sequential_tasks)} Sequential Tasks")
        logging.info("=" * 60)

        self.state.current_phase = "finalizing"
        save_distributor_state(self.state, self.state_path)

        if self.dry_run:
            logging.info(f"[DRY RUN] Would run tasks: {self.state.sequential_tasks}")
            return True

        process = run_orchestrator(
            config_path=self.config_path,
            stages=['details', 'implementation'],
            tasks=self.state.sequential_tasks,
        )

        return_code, output = wait_for_orchestrator(
            process,
            log_prefix="[sequential]"
        )

        if return_code != 0:
            self.state.errors.append(f"Sequential phase failed with code {return_code}")
            logging.error(f"Sequential phase failed")
            return False

        self.state.phases_completed.append("finalizing")
        save_distributor_state(self.state, self.state_path)

        return True

    def run(self) -> bool:
        """
        Execute the full distribution pipeline.

        Returns:
            True if successful
        """
        logging.info("=" * 60)
        logging.info("PIPELINE DISTRIBUTOR")
        logging.info("=" * 60)
        logging.info(f"Config: {self.config_path}")
        logging.info(f"Max parallel: {self.max_parallel}")
        logging.info(f"Dry run: {self.dry_run}")
        logging.info(f"Validate: {self.validate}")
        logging.info("")

        # Initialize state
        self.state = self.initialize_state()
        self.state.status = "running"
        save_distributor_state(self.state, self.state_path)

        try:
            # Phase 1: Gather dependencies
            if "gathering" not in self.state.phases_completed:
                if not self.run_gathering_phase():
                    self.state.status = "failed"
                    save_distributor_state(self.state, self.state_path)
                    return False

            # Phase 2: Analyze and identify clusters
            if "analyzing" not in self.state.phases_completed:
                parallel_clusters, sequential_tasks = self.run_analysis_phase()
            else:
                # Load from state
                orch_state = load_orchestrator_state(self.config)
                parallel_clusters, sequential_tasks = identify_execution_clusters(
                    orch_state or {},
                    max_parallel=self.max_parallel
                )

            # Analyze parallelization benefit and provide recommendations
            analysis = self.analyze_parallelization_benefit(
                parallel_clusters,
                sequential_tasks
            )

            # Run Claude validation if requested
            if self.validate:
                is_valid, validation_messages = self.run_validation_phase()

                if not is_valid:
                    logging.error("Pipeline validation FAILED")
                    for msg in validation_messages:
                        logging.error(f"  {msg}")

                    # In dry-run, continue to show full analysis
                    # In real run, abort
                    if not self.dry_run:
                        self.state.status = "validation_failed"
                        self.state.errors.extend(validation_messages)
                        save_distributor_state(self.state, self.state_path)
                        return False

            # In dry-run mode, stop here after showing analysis
            if self.dry_run:
                logging.info("=" * 60)
                logging.info("[DRY RUN] Analysis complete. No execution performed.")
                logging.info("=" * 60)
                self.state.status = "dry_run_complete"
                save_distributor_state(self.state, self.state_path)
                return True

            # If parallelization wouldn't benefit, suggest using orchestrator directly
            if not analysis['would_benefit']:
                para_enabled = self.config.get('parallelization', {}).get('enabled', False)
                if not para_enabled:
                    logging.info("Falling back to sequential orchestrator execution...")
                    return self.run_sequential_phase()

            # Phase 3: Distribute and run parallel clusters
            if parallel_clusters and "distributing" not in self.state.phases_completed:
                for i, cluster_group in enumerate(parallel_clusters):
                    logging.info(f"Processing cluster group {i + 1}/{len(parallel_clusters)}")

                    if not self.run_distribution_phase(cluster_group):
                        logging.error(f"Distribution phase {i + 1} failed")
                        # Continue with next group or handle based on config

                    # Phase 4: Merge after each group
                    if not self.run_merge_phase():
                        logging.warning("Some merges failed, continuing...")

            # Phase 5: Cleanup
            self.run_cleanup_phase()

            # Phase 6: Run sequential tasks
            if not self.run_sequential_phase():
                self.state.status = "failed"
                save_distributor_state(self.state, self.state_path)
                return False

            # Done!
            self.state.status = "completed"
            self.state.current_phase = "completed"
            save_distributor_state(self.state, self.state_path)

            logging.info("=" * 60)
            logging.info("DISTRIBUTION COMPLETE")
            logging.info("=" * 60)
            logging.info(f"Clusters completed: {self.state.clusters_completed}")
            logging.info(f"Clusters failed: {self.state.clusters_failed}")
            logging.info(f"Branches merged: {len(self.state.merged_branches)}")

            return True

        except Exception as e:
            logging.exception(f"Distribution failed with exception: {e}")
            self.state.status = "failed"
            self.state.errors.append(str(e))
            save_distributor_state(self.state, self.state_path)
            return False


# =============================================================================
# CLI
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Pipeline Distributor - Parallel execution via git worktrees"
    )

    parser.add_argument(
        '--config', '-c',
        type=str,
        required=True,
        help='Path to pipeline YAML configuration file'
    )

    parser.add_argument(
        '--max-parallel', '-p',
        type=int,
        default=3,
        help='Maximum number of parallel worktrees (default: 3)'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without executing'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )

    parser.add_argument(
        '--resume',
        action='store_true',
        help='Resume from existing distributor state'
    )

    parser.add_argument(
        '--status',
        action='store_true',
        help='Show current distributor status and exit'
    )

    parser.add_argument(
        '--cleanup',
        action='store_true',
        help='Clean up worktrees and exit'
    )

    parser.add_argument(
        '--validate',
        action='store_true',
        help='Run Claude to validate pipeline structure before execution'
    )

    args = parser.parse_args()

    # Setup logging
    config_path = Path(args.config)
    log_path = config_path.parent / f"{config_path.stem}-distributor.log"
    setup_logging(log_path, args.verbose)

    # Status check
    if args.status:
        config = load_config(config_path)
        state_path = get_distributor_state_path(config)
        state = load_distributor_state(state_path)

        if state:
            print(f"Pipeline: {state.pipeline_name}")
            print(f"Status: {state.status}")
            print(f"Phase: {state.current_phase}")
            print(f"Clusters: {state.clusters_completed}/{state.total_clusters} completed")
            print(f"Worktrees: {len(state.worktrees)}")
            print(f"Merge queue: {state.merge_queue}")
            print(f"Errors: {len(state.errors)}")
        else:
            print("No distributor state found")

        return

    # Cleanup only
    if args.cleanup:
        config = load_config(config_path)
        state_path = get_distributor_state_path(config)
        state = load_distributor_state(state_path)

        if state:
            distributor = PipelineDistributor(
                config_path=config_path,
                dry_run=args.dry_run,
            )
            distributor.state = state
            distributor.run_cleanup_phase()
        else:
            print("No distributor state found")

        return

    # Run distributor
    distributor = PipelineDistributor(
        config_path=config_path,
        max_parallel=args.max_parallel,
        dry_run=args.dry_run,
        verbose=args.verbose,
        validate=args.validate,
    )

    success = distributor.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
