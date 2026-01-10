#!/usr/bin/env python3
"""
Pipeline Dependency Extraction and Graph Management

This module handles incremental extraction of task dependencies from overview documents
and maintains a dependency graph in the pipeline state.

Features:
- Parse ## Dependencies sections from overview markdown files
- Incremental state updates (after each Stage 2 completion)
- Dependency graph operations (topological sort, cycle detection)
- Parallel cluster identification for worktree-based execution

Usage:
    from pipeline_dependencies import (
        extract_dependencies_from_overview,
        update_state_dependencies,
        get_execution_order,
        get_parallel_clusters,
        validate_dependencies
    )

Last Modified: 2026-01-09
"""

import json
import logging
import re
from collections import defaultdict
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Set, Tuple, Any

logger = logging.getLogger(__name__)


# =============================================================================
# Data Structures
# =============================================================================

@dataclass
class TaskDependencies:
    """Dependency information for a single task."""
    task_id: str
    depends_on: List[str] = field(default_factory=list)      # Upstream dependencies
    blocks: List[str] = field(default_factory=list)          # Downstream dependents
    files_touched: List[str] = field(default_factory=list)   # Files this task modifies
    conflicts_with: List[str] = field(default_factory=list)  # Tasks with file overlap
    safe_to_parallelize: List[str] = field(default_factory=list)  # No conflicts
    extracted_at: Optional[str] = None
    source_file: Optional[str] = None


@dataclass
class DependencyGraph:
    """Complete dependency graph for the pipeline."""
    nodes: List[str] = field(default_factory=list)           # All task IDs
    edges: List[Tuple[str, str]] = field(default_factory=list)  # (from, to) pairs
    roots: List[str] = field(default_factory=list)           # No dependencies
    leaves: List[str] = field(default_factory=list)          # Nothing depends on them

    def to_dict(self) -> dict:
        return {
            "nodes": self.nodes,
            "edges": self.edges,
            "roots": self.roots,
            "leaves": self.leaves
        }


@dataclass
class ExecutionPlan:
    """Computed execution plan based on dependencies."""
    topological_order: List[str] = field(default_factory=list)
    critical_path: List[str] = field(default_factory=list)
    parallel_clusters: List[List[str]] = field(default_factory=list)
    has_cycles: bool = False
    cycle_tasks: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "topological_order": self.topological_order,
            "critical_path": self.critical_path,
            "parallel_clusters": self.parallel_clusters,
            "has_cycles": self.has_cycles,
            "cycle_tasks": self.cycle_tasks
        }


# =============================================================================
# Extraction Functions
# =============================================================================

def extract_dependencies_from_overview(
    overview_path: Path,
    config: dict = None
) -> Optional[TaskDependencies]:
    """
    Extract dependency information from an overview document.

    Parses the ## Dependencies section looking for:
    - ### Depends On (upstream)
    - ### Blocks (downstream)
    - ### Parallel Safety (files touched, conflicts)

    Args:
        overview_path: Path to the overview markdown file
        config: Optional pipeline config with extraction patterns

    Returns:
        TaskDependencies object or None if extraction fails
    """
    if not overview_path.exists():
        logger.warning(f"Overview file not found: {overview_path}")
        return None

    content = overview_path.read_text(encoding='utf-8')

    # Extract task ID from filename (e.g., req-001-create-table-overview.md)
    task_id = extract_task_id_from_filename(overview_path.name)
    if not task_id:
        # Try to extract from content
        task_id = extract_task_id_from_content(content)

    if not task_id:
        logger.warning(f"Could not determine task ID for: {overview_path}")
        return None

    # Get extraction patterns from config or use defaults
    patterns = get_extraction_patterns(config)

    # Find Dependencies section
    deps_section = extract_section(content, patterns['section_pattern'])
    if not deps_section:
        logger.info(f"No Dependencies section found in: {overview_path}")
        return TaskDependencies(
            task_id=task_id,
            extracted_at=datetime.now().isoformat(),
            source_file=str(overview_path)
        )

    # Parse subsections
    depends_on = extract_task_references(
        extract_section(deps_section, patterns['depends_on_pattern']),
        patterns['task_ref_pattern']
    )

    blocks = extract_task_references(
        extract_section(deps_section, patterns['blocks_pattern']),
        patterns['task_ref_pattern']
    )

    # Parse parallel safety section
    parallel_section = extract_section(deps_section, patterns['parallel_safety_pattern'])
    files_touched = extract_files_touched(parallel_section, patterns['files_touched_pattern'])
    conflicts_with = extract_task_references(
        extract_line_content(parallel_section, "Conflicts with:"),
        patterns['task_ref_pattern']
    )
    safe_to_parallelize = extract_task_references(
        extract_line_content(parallel_section, "Safe to parallelize with:"),
        patterns['task_ref_pattern']
    )

    return TaskDependencies(
        task_id=task_id,
        depends_on=depends_on,
        blocks=blocks,
        files_touched=files_touched,
        conflicts_with=conflicts_with,
        safe_to_parallelize=safe_to_parallelize,
        extracted_at=datetime.now().isoformat(),
        source_file=str(overview_path)
    )


def get_extraction_patterns(config: dict = None) -> dict:
    """Get extraction patterns from config or return defaults."""
    if config:
        dep_config = config.get('dependency_tracking', {}).get('extraction', {})
    else:
        dep_config = {}

    return {
        'section_pattern': dep_config.get('section_pattern', r'^## Dependencies'),
        'depends_on_pattern': dep_config.get('depends_on_pattern', r'^### Depends On'),
        'blocks_pattern': dep_config.get('blocks_pattern', r'^### Blocks'),
        'parallel_safety_pattern': dep_config.get('parallel_safety_pattern', r'^### Parallel Safety'),
        'task_ref_pattern': dep_config.get('task_ref_pattern', r'Task\s+(\d+\.\d+)'),
        'files_touched_pattern': dep_config.get('files_touched_pattern', r'Files touched:\s*(.+)'),
    }


def extract_task_id_from_filename(filename: str) -> Optional[str]:
    """
    Extract task ID from overview filename.

    Examples:
        req-001-create-table-overview.md -> 0.1
        req-012-update-api-overview.md -> 1.2
        REQ-023-fix-bug-overview.md -> 2.3
    """
    match = re.search(r'req-?(\d+)', filename, re.IGNORECASE)
    if match:
        req_num = int(match.group(1))
        # Convert request number to task ID (e.g., 001 -> 0.1, 012 -> 1.2)
        phase = req_num // 10
        task = req_num % 10
        return f"{phase}.{task}"
    return None


def extract_task_id_from_content(content: str) -> Optional[str]:
    """Extract task ID from document content."""
    # Look for "Task X.Y" or "Task ID: X.Y" patterns
    match = re.search(r'Task\s*(?:ID)?:?\s*(\d+\.\d+)', content, re.IGNORECASE)
    if match:
        return match.group(1)
    return None


def extract_section(content: str, header_pattern: str) -> Optional[str]:
    """
    Extract a section from markdown content starting at header_pattern.
    Returns content until the next same-level or higher header.
    """
    lines = content.split('\n')
    in_section = False
    section_lines = []
    header_level = None

    for line in lines:
        # Check if this line matches the header pattern
        if re.match(header_pattern, line, re.MULTILINE):
            in_section = True
            # Determine header level (count #s)
            header_match = re.match(r'^(#+)', line)
            header_level = len(header_match.group(1)) if header_match else 2
            continue

        if in_section:
            # Check if we've hit a same-level or higher header
            header_match = re.match(r'^(#+)\s', line)
            if header_match:
                current_level = len(header_match.group(1))
                if current_level <= header_level:
                    break
            section_lines.append(line)

    return '\n'.join(section_lines).strip() if section_lines else None


def extract_task_references(content: Optional[str], pattern: str) -> List[str]:
    """Extract all task ID references from content."""
    if not content:
        return []

    matches = re.findall(pattern, content)
    return list(set(matches))  # Deduplicate


def extract_files_touched(content: Optional[str], pattern: str) -> List[str]:
    """Extract list of files touched from parallel safety section."""
    if not content:
        return []

    match = re.search(pattern, content, re.IGNORECASE)
    if match:
        files_str = match.group(1)
        # Parse comma or newline separated list
        files = re.split(r'[,\n]', files_str)
        return [f.strip().strip('`[]') for f in files if f.strip()]

    # Also look for bullet points with file paths
    file_patterns = re.findall(r'[-*]\s*`?([^\s`]+\.[a-z]+)`?', content, re.IGNORECASE)
    return list(set(file_patterns))


def extract_line_content(content: Optional[str], prefix: str) -> Optional[str]:
    """Extract content after a specific prefix in a line."""
    if not content:
        return None

    for line in content.split('\n'):
        if prefix.lower() in line.lower():
            # Return everything after the prefix
            idx = line.lower().index(prefix.lower()) + len(prefix)
            return line[idx:].strip()
    return None


# =============================================================================
# State Management
# =============================================================================

def update_state_dependencies(
    state: dict,
    task_deps: TaskDependencies,
    config: dict = None
) -> dict:
    """
    Update pipeline state with extracted dependencies.
    This is called incrementally after each Stage 2 completion.

    Args:
        state: Current pipeline state dict
        task_deps: Extracted dependencies for a task
        config: Optional pipeline config

    Returns:
        Updated state dict
    """
    # Ensure dependencies section exists
    if 'dependencies' not in state:
        state['dependencies'] = {
            'tasks': {},
            'graph': DependencyGraph().to_dict(),
            'execution': ExecutionPlan().to_dict(),
            'last_updated': None
        }

    # Update task dependencies
    state['dependencies']['tasks'][task_deps.task_id] = asdict(task_deps)
    state['dependencies']['last_updated'] = datetime.now().isoformat()

    # Recompute graph
    should_recompute = True
    if config:
        recompute_config = config.get('dependency_tracking', {}).get('recompute_clusters', {})
        should_recompute = recompute_config.get('on_extraction', True)

    if should_recompute:
        state = recompute_dependency_graph(state)

    # Update state timestamp
    state['updated_at'] = datetime.now().isoformat()

    return state


def recompute_dependency_graph(state: dict) -> dict:
    """
    Recompute the full dependency graph from all extracted task dependencies.
    """
    tasks_deps = state.get('dependencies', {}).get('tasks', {})

    if not tasks_deps:
        return state

    # Build graph
    graph = DependencyGraph()
    graph.nodes = list(tasks_deps.keys())

    # Build edges from depends_on relationships
    all_edges = set()
    dependents: Dict[str, Set[str]] = defaultdict(set)  # task -> tasks that depend on it
    dependencies: Dict[str, Set[str]] = defaultdict(set)  # task -> tasks it depends on

    for task_id, deps in tasks_deps.items():
        for upstream in deps.get('depends_on', []):
            all_edges.add((upstream, task_id))
            dependents[upstream].add(task_id)
            dependencies[task_id].add(upstream)

        for downstream in deps.get('blocks', []):
            all_edges.add((task_id, downstream))
            dependents[task_id].add(downstream)
            dependencies[downstream].add(task_id)

    graph.edges = list(all_edges)

    # Find roots (no dependencies)
    graph.roots = [t for t in graph.nodes if not dependencies.get(t)]

    # Find leaves (nothing depends on them)
    graph.leaves = [t for t in graph.nodes if not dependents.get(t)]

    state['dependencies']['graph'] = graph.to_dict()

    # Compute execution plan
    execution = compute_execution_plan(graph, tasks_deps)
    state['dependencies']['execution'] = execution.to_dict()

    return state


def compute_execution_plan(graph: DependencyGraph, tasks_deps: dict) -> ExecutionPlan:
    """
    Compute execution order and parallel clusters from dependency graph.
    """
    plan = ExecutionPlan()

    # Topological sort with cycle detection
    order, has_cycle, cycle_tasks = topological_sort(graph.nodes, graph.edges)
    plan.topological_order = order
    plan.has_cycles = has_cycle
    plan.cycle_tasks = cycle_tasks

    if has_cycle:
        logger.error(f"Dependency cycle detected involving tasks: {cycle_tasks}")
        return plan

    # Compute critical path
    plan.critical_path = find_critical_path(graph.nodes, graph.edges, tasks_deps)

    # Identify parallel clusters
    plan.parallel_clusters = identify_parallel_clusters(graph.nodes, graph.edges, tasks_deps)

    return plan


# =============================================================================
# Graph Algorithms
# =============================================================================

def topological_sort(
    nodes: List[str],
    edges: List[Tuple[str, str]]
) -> Tuple[List[str], bool, List[str]]:
    """
    Perform topological sort on the dependency graph.

    Returns:
        (sorted_order, has_cycle, cycle_tasks)
    """
    # Build adjacency list
    adj: Dict[str, List[str]] = defaultdict(list)
    in_degree: Dict[str, int] = {node: 0 for node in nodes}

    for from_node, to_node in edges:
        if from_node in in_degree and to_node in in_degree:
            adj[from_node].append(to_node)
            in_degree[to_node] += 1

    # Kahn's algorithm
    queue = [node for node in nodes if in_degree[node] == 0]
    result = []

    while queue:
        # Sort to ensure deterministic order
        queue.sort()
        node = queue.pop(0)
        result.append(node)

        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # Check for cycle
    if len(result) != len(nodes):
        cycle_tasks = [n for n in nodes if in_degree[n] > 0]
        return result, True, cycle_tasks

    return result, False, []


def find_critical_path(
    nodes: List[str],
    edges: List[Tuple[str, str]],
    tasks_deps: dict
) -> List[str]:
    """
    Find the critical path (longest dependency chain).
    """
    if not nodes:
        return []

    # Build adjacency list
    adj: Dict[str, List[str]] = defaultdict(list)
    for from_node, to_node in edges:
        adj[from_node].append(to_node)

    # Find longest path using DFS with memoization
    memo: Dict[str, Tuple[int, List[str]]] = {}

    def dfs(node: str) -> Tuple[int, List[str]]:
        if node in memo:
            return memo[node]

        max_length = 0
        max_path = [node]

        for neighbor in adj.get(node, []):
            if neighbor in nodes:  # Only consider known nodes
                length, path = dfs(neighbor)
                if length + 1 > max_length:
                    max_length = length + 1
                    max_path = [node] + path

        memo[node] = (max_length, max_path)
        return memo[node]

    # Find longest path from any root
    longest_length = 0
    critical_path = []

    # Start from nodes with no incoming edges
    roots = set(nodes) - {to_node for _, to_node in edges if to_node in nodes}
    if not roots:
        roots = set(nodes)

    for root in roots:
        if root in nodes:
            length, path = dfs(root)
            if length > longest_length:
                longest_length = length
                critical_path = path

    return critical_path


def identify_parallel_clusters(
    nodes: List[str],
    edges: List[Tuple[str, str]],
    tasks_deps: dict
) -> List[List[str]]:
    """
    Identify groups of tasks that can run in parallel.

    Tasks can run in parallel if:
    1. Neither depends on the other (directly or transitively)
    2. They don't modify the same files (no file conflicts)
    """
    if not nodes:
        return []

    # Build transitive dependency sets
    adj: Dict[str, Set[str]] = defaultdict(set)
    for from_node, to_node in edges:
        adj[from_node].add(to_node)

    # Compute transitive closure
    transitive_deps: Dict[str, Set[str]] = {}

    def get_all_deps(node: str, visited: Set[str] = None) -> Set[str]:
        if visited is None:
            visited = set()
        if node in transitive_deps:
            return transitive_deps[node]
        if node in visited:
            return set()

        visited.add(node)
        deps = set()
        for neighbor in adj.get(node, []):
            deps.add(neighbor)
            deps.update(get_all_deps(neighbor, visited))

        transitive_deps[node] = deps
        return deps

    for node in nodes:
        get_all_deps(node)

    # Build file conflict map
    file_to_tasks: Dict[str, Set[str]] = defaultdict(set)
    for task_id, deps in tasks_deps.items():
        for file_path in deps.get('files_touched', []):
            file_to_tasks[file_path].add(task_id)

    # Check if two tasks can run in parallel
    def can_parallelize(task_a: str, task_b: str) -> bool:
        # Check transitive dependencies
        if task_b in transitive_deps.get(task_a, set()):
            return False
        if task_a in transitive_deps.get(task_b, set()):
            return False

        # Check file conflicts
        files_a = set(tasks_deps.get(task_a, {}).get('files_touched', []))
        files_b = set(tasks_deps.get(task_b, {}).get('files_touched', []))
        if files_a & files_b:
            return False

        # Check explicit conflicts
        conflicts_a = set(tasks_deps.get(task_a, {}).get('conflicts_with', []))
        conflicts_b = set(tasks_deps.get(task_b, {}).get('conflicts_with', []))
        if task_b in conflicts_a or task_a in conflicts_b:
            return False

        return True

    # Group tasks into parallel clusters using greedy approach
    # Respect topological order within clusters
    topo_order, _, _ = topological_sort(nodes, edges)

    clusters: List[List[str]] = []
    assigned: Set[str] = set()

    for task in topo_order:
        if task in assigned:
            continue

        # Start new cluster with this task
        cluster = [task]
        assigned.add(task)

        # Try to add other unassigned tasks that can parallelize with all cluster members
        for other in topo_order:
            if other in assigned:
                continue

            # Check if other can parallelize with all current cluster members
            can_add = all(can_parallelize(other, member) for member in cluster)
            if can_add:
                cluster.append(other)
                assigned.add(other)

        clusters.append(cluster)

    return clusters


# =============================================================================
# Validation
# =============================================================================

def validate_dependencies(
    state: dict,
    config: dict = None
) -> Tuple[bool, List[str]]:
    """
    Validate extracted dependencies for issues.

    Returns:
        (is_valid, list of warning/error messages)
    """
    messages = []
    is_valid = True

    deps_info = state.get('dependencies', {})
    tasks_deps = deps_info.get('tasks', {})
    execution = deps_info.get('execution', {})

    # Get validation config
    if config:
        validation_config = config.get('dependency_tracking', {}).get('validation', {})
    else:
        validation_config = {}

    # Check for cycles
    if execution.get('has_cycles', False):
        cycle_tasks = execution.get('cycle_tasks', [])
        msg = f"ERROR: Dependency cycle detected: {cycle_tasks}"
        messages.append(msg)
        if validation_config.get('fail_on_cycles', True):
            is_valid = False

    # Check for tasks with no dependencies declared
    # Extract task IDs from the tasks list (which contains task dictionaries)
    tasks_list = state.get('tasks', [])
    if tasks_list and isinstance(tasks_list[0], dict):
        known_tasks = set(t.get('id') for t in tasks_list if t.get('id'))
    else:
        known_tasks = set(tasks_list) if tasks_list else set()

    for task_id, deps in tasks_deps.items():
        if not deps.get('depends_on') and not deps.get('blocks'):
            msg = f"WARNING: Task {task_id} has no dependencies declared"
            messages.append(msg)

    # Check for references to unknown tasks
    all_referenced = set()
    for deps in tasks_deps.values():
        all_referenced.update(deps.get('depends_on', []))
        all_referenced.update(deps.get('blocks', []))
        all_referenced.update(deps.get('conflicts_with', []))

    for ref in all_referenced:
        if ref not in tasks_deps and ref not in known_tasks:
            msg = f"WARNING: Reference to unknown task: {ref}"
            messages.append(msg)
            if validation_config.get('fail_on_missing_reference', False):
                is_valid = False

    return is_valid, messages


# =============================================================================
# Query Functions
# =============================================================================

def get_execution_order(state: dict) -> List[str]:
    """Get the computed topological execution order."""
    return state.get('dependencies', {}).get('execution', {}).get('topological_order', [])


def get_parallel_clusters(state: dict) -> List[List[str]]:
    """Get the computed parallel clusters."""
    return state.get('dependencies', {}).get('execution', {}).get('parallel_clusters', [])


def get_critical_path(state: dict) -> List[str]:
    """Get the critical path (longest dependency chain)."""
    return state.get('dependencies', {}).get('execution', {}).get('critical_path', [])


def get_task_dependencies(state: dict, task_id: str) -> Optional[dict]:
    """Get dependency info for a specific task."""
    return state.get('dependencies', {}).get('tasks', {}).get(task_id)


def get_blocking_tasks(state: dict) -> List[str]:
    """Get tasks that block the most downstream work."""
    tasks_deps = state.get('dependencies', {}).get('tasks', {})

    # Count how many tasks each task blocks (transitively)
    block_counts = {}
    for task_id, deps in tasks_deps.items():
        block_counts[task_id] = len(deps.get('blocks', []))

    # Sort by block count descending
    sorted_tasks = sorted(block_counts.items(), key=lambda x: x[1], reverse=True)
    return [task for task, count in sorted_tasks if count > 0]


def get_ready_tasks(state: dict) -> List[str]:
    """
    Get tasks that are ready to execute (all dependencies satisfied).
    Useful for parallel execution planning.
    """
    tasks_deps = state.get('dependencies', {}).get('tasks', {})
    completed_tasks = set()

    # Get completed tasks from state
    for task in state.get('tasks', []):
        if isinstance(task, dict) and task.get('status') == 'completed':
            completed_tasks.add(task.get('id'))

    ready = []
    for task_id, deps in tasks_deps.items():
        if task_id in completed_tasks:
            continue

        upstream = set(deps.get('depends_on', []))
        if upstream <= completed_tasks:
            ready.append(task_id)

    return ready


# =============================================================================
# CLI Integration
# =============================================================================

def extract_all_dependencies(config: dict, state: dict) -> dict:
    """
    Extract dependencies from all existing overview documents.
    Useful for rebuilding dependency info after interruption.

    Args:
        config: Pipeline configuration
        state: Current pipeline state

    Returns:
        Updated state with all dependencies
    """
    overview_dir = Path(config.get('outputs', {}).get('_overviews_resolved',
                        config.get('outputs', {}).get('overviews', './docs/')))

    if not overview_dir.exists():
        logger.warning(f"Overview directory not found: {overview_dir}")
        return state

    # Find all overview files
    overview_pattern = config.get('dependency_tracking', {}).get('extraction', {}).get(
        'overview_pattern', '*-overview.md'
    )

    overview_files = list(overview_dir.glob('*-overview.md'))
    logger.info(f"Found {len(overview_files)} overview files")

    for overview_path in overview_files:
        logger.info(f"Extracting dependencies from: {overview_path}")
        task_deps = extract_dependencies_from_overview(overview_path, config)
        if task_deps:
            state = update_state_dependencies(state, task_deps, config)

    return state


def print_dependency_summary(state: dict):
    """Print a summary of the dependency graph."""
    deps_info = state.get('dependencies', {})
    tasks_deps = deps_info.get('tasks', {})
    graph = deps_info.get('graph', {})
    execution = deps_info.get('execution', {})

    print("\n" + "=" * 60)
    print("DEPENDENCY SUMMARY")
    print("=" * 60)

    print(f"\nTasks with dependencies: {len(tasks_deps)}")
    print(f"Graph nodes: {len(graph.get('nodes', []))}")
    print(f"Graph edges: {len(graph.get('edges', []))}")
    print(f"Root tasks (no deps): {graph.get('roots', [])}")
    print(f"Leaf tasks (nothing depends on): {graph.get('leaves', [])}")

    print(f"\nExecution order: {execution.get('topological_order', [])}")
    print(f"Critical path: {execution.get('critical_path', [])}")
    print(f"Has cycles: {execution.get('has_cycles', False)}")

    clusters = execution.get('parallel_clusters', [])
    print(f"\nParallel clusters ({len(clusters)}):")
    for i, cluster in enumerate(clusters):
        print(f"  Cluster {i + 1}: {cluster}")

    print("\n" + "=" * 60)


# =============================================================================
# Entry Point (for standalone testing)
# =============================================================================

if __name__ == "__main__":
    import sys

    # Simple test mode
    if len(sys.argv) > 1:
        overview_path = Path(sys.argv[1])
        if overview_path.exists():
            deps = extract_dependencies_from_overview(overview_path)
            if deps:
                print(f"Extracted dependencies for task {deps.task_id}:")
                print(f"  Depends on: {deps.depends_on}")
                print(f"  Blocks: {deps.blocks}")
                print(f"  Files touched: {deps.files_touched}")
        else:
            print(f"File not found: {overview_path}")
    else:
        print("Usage: python pipeline_dependencies.py <overview_file.md>")
        print("\nThis module is designed to be imported by pipeline_orchestrator.py")
