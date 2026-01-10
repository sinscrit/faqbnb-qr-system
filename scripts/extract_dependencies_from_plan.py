#!/usr/bin/env python3
"""
Extract Dependencies from Implementation Plan

A one-time script to analyze an implementation plan and existing pipeline state
to infer task dependencies and update the state file.

This is useful when:
- Stages 1-3 were run before dependency tracking was added
- Overview files don't have ## Dependencies sections
- You need to bootstrap dependency information

Usage:
    python scripts/extract_dependencies_from_plan.py --config pipeline.yaml
    python scripts/extract_dependencies_from_plan.py --config pipeline.yaml --dry-run
    python scripts/extract_dependencies_from_plan.py --config pipeline.yaml --output deps.json

Last Modified: 2026-01-10
"""

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional

try:
    import yaml
except ImportError:
    print("Error: PyYAML required. pip install pyyaml")
    sys.exit(1)

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline_dependencies import (
    TaskDependencies,
    DependencyGraph,
    update_state_dependencies,
    recompute_dependency_graph,
    topological_sort,
)


def load_config(config_path: Path) -> dict:
    """Load pipeline configuration."""
    return yaml.safe_load(config_path.read_text(encoding='utf-8'))


def load_state(config: dict, config_path: Path) -> dict:
    """Load pipeline state."""
    state_file = config.get('outputs', {}).get('state', 'pipeline-state.json')
    state_path = config_path.parent / state_file

    if not state_path.exists():
        raise FileNotFoundError(f"State file not found: {state_path}")

    return json.loads(state_path.read_text(encoding='utf-8'))


def load_implementation_plan(config: dict, config_path: Path) -> str:
    """Load the implementation plan markdown."""
    plan_path = config.get('source', {}).get('path', '')
    if not plan_path:
        raise ValueError("No source.path in config")

    full_path = config_path.parent / plan_path
    if not full_path.exists():
        raise FileNotFoundError(f"Implementation plan not found: {full_path}")

    return full_path.read_text(encoding='utf-8')


def extract_tasks_from_state(state: dict) -> List[dict]:
    """Extract task info from pipeline state."""
    return state.get('tasks', [])


def parse_phase_structure(plan_content: str) -> Dict[str, List[str]]:
    """
    Parse the implementation plan to extract phase -> task mapping.

    Returns:
        Dict mapping phase number to list of task IDs
    """
    phases = {}
    current_phase = None

    # Pattern for phase headers: ### Phase 0: Database Refactoring
    phase_pattern = re.compile(r'^###\s+Phase\s+(\d+):\s+(.+?)(?:\s*\(|$)', re.MULTILINE)

    # Pattern for task headers: #### Task 0.1: Create Table
    task_pattern = re.compile(r'^####\s+Task\s+(\d+\.\d+):', re.MULTILINE)

    # Find all phases
    for match in phase_pattern.finditer(plan_content):
        phase_num = match.group(1)
        phases[phase_num] = []

    # Find all tasks and assign to phases
    lines = plan_content.split('\n')
    current_phase = None

    for line in lines:
        phase_match = phase_pattern.match(line)
        if phase_match:
            current_phase = phase_match.group(1)
            continue

        task_match = task_pattern.match(line)
        if task_match and current_phase:
            task_id = task_match.group(1)
            if current_phase not in phases:
                phases[current_phase] = []
            phases[current_phase].append(task_id)

    return phases


def infer_phase_dependencies(phases: Dict[str, List[str]]) -> Dict[str, List[str]]:
    """
    Infer dependencies based on phase structure.

    Rules:
    - First task in each phase depends on ALL tasks in previous phase
    - Tasks within a phase are usually sequential (depends on previous task)

    Returns:
        Dict mapping task_id to list of upstream dependencies
    """
    dependencies = {}
    sorted_phases = sorted(phases.keys(), key=int)

    prev_phase_tasks = []

    for phase_num in sorted_phases:
        phase_tasks = phases[phase_num]

        for i, task_id in enumerate(phase_tasks):
            deps = []

            if i == 0:
                # First task in phase depends on last task of previous phase
                if prev_phase_tasks:
                    deps.append(prev_phase_tasks[-1])
            else:
                # Other tasks depend on previous task in same phase
                deps.append(phase_tasks[i - 1])

            dependencies[task_id] = deps

        prev_phase_tasks = phase_tasks

    return dependencies


def analyze_file_dependencies(state: dict) -> Dict[str, Set[str]]:
    """
    Analyze overview files to extract files that will be MODIFIED.

    Focuses on the "Authorized Files" section to avoid false positives
    from files that are just mentioned for context.

    Returns:
        Dict mapping task_id to set of file paths that will be modified
    """
    file_mentions = {}

    for task in state.get('tasks', []):
        task_id = task.get('id')
        overview_path = task.get('files', {}).get('overview')

        if not overview_path or not Path(overview_path).exists():
            file_mentions[task_id] = set()
            continue

        content = Path(overview_path).read_text(encoding='utf-8')
        mentions = set()

        # First, try to find the "Authorized Files" section
        authorized_section = extract_authorized_files_section(content)

        if authorized_section:
            # Extract files from the authorized section only
            file_patterns = [
                r'`([^`]+\.(ts|tsx|js|jsx|sql|py))`',  # Backtick quoted code files
                r'\|\s*`?([^|`\s]+\.(ts|tsx|sql))`?\s*\|',  # Table cells
            ]
            for pattern in file_patterns:
                for match in re.finditer(pattern, authorized_section):
                    file_path = match.group(1).strip('`').strip()
                    if file_path and '/' in file_path:
                        mentions.add(file_path)
        else:
            # Fallback: look for specific modification indicators
            modification_patterns = [
                r'(?:CREATE|MODIFY|UPDATE|ADD|REMOVE|DELETE)\s+`([^`]+)`',
                r'(?:create|modify|update)\s+(?:the\s+)?`([^`]+)`',
                r'File:\s*`([^`]+)`',
            ]
            for pattern in modification_patterns:
                for match in re.finditer(pattern, content, re.IGNORECASE):
                    file_path = match.group(1).strip()
                    if '.' in file_path:
                        mentions.add(file_path)

        file_mentions[task_id] = mentions

    return file_mentions


def extract_authorized_files_section(content: str) -> Optional[str]:
    """
    Extract the "Authorized Files and Functions for Modification" section.
    """
    # Look for the section header
    patterns = [
        r'##\s*Authorized Files.*?(?=\n##|\Z)',
        r'###\s*Authorized Files.*?(?=\n###|\n##|\Z)',
        r'\*\*Authorized Files.*?\*\*.*?(?=\n##|\n\*\*[A-Z]|\Z)',
        r'Files to (?:Modify|Create).*?(?=\n##|\Z)',
    ]

    for pattern in patterns:
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(0)

    return None


def find_file_conflicts(file_mentions: Dict[str, Set[str]]) -> Dict[str, Set[str]]:
    """
    Find tasks that modify the same files.

    Returns:
        Dict mapping task_id to set of conflicting task_ids
    """
    conflicts = defaultdict(set)

    # Build reverse mapping: file -> tasks
    file_to_tasks = defaultdict(set)
    for task_id, files in file_mentions.items():
        for file_path in files:
            file_to_tasks[file_path].add(task_id)

    # Find conflicts
    for file_path, task_ids in file_to_tasks.items():
        if len(task_ids) > 1:
            for task_id in task_ids:
                conflicts[task_id].update(task_ids - {task_id})

    return dict(conflicts)


def enhance_dependencies_from_content(
    state: dict,
    base_deps: Dict[str, List[str]]
) -> Dict[str, List[str]]:
    """
    Enhance dependencies by analyzing overview content for task references.

    Looks for patterns like:
    - "Task 0.1"
    - "depends on REQ-148"
    - "requires the item_articles table"
    """
    enhanced = {k: list(v) for k, v in base_deps.items()}

    # Build mapping of request ID to task ID
    req_to_task = {}
    for task in state.get('tasks', []):
        task_id = task.get('id')
        request_id = task.get('request_id')
        if request_id:
            req_to_task[request_id] = task_id

    # Analyze each overview file
    for task in state.get('tasks', []):
        task_id = task.get('id')
        overview_path = task.get('files', {}).get('overview')

        if not overview_path or not Path(overview_path).exists():
            continue

        content = Path(overview_path).read_text(encoding='utf-8')

        # Look for task references
        task_refs = re.findall(r'Task\s+(\d+\.\d+)', content)
        for ref in task_refs:
            if ref != task_id and ref in enhanced:
                if ref not in enhanced.get(task_id, []):
                    if task_id not in enhanced:
                        enhanced[task_id] = []
                    # Only add if it makes sense (ref should be before task_id)
                    if float(ref) < float(task_id):
                        enhanced[task_id].append(ref)

        # Look for REQ references
        req_refs = re.findall(r'REQ-(\d+)', content)
        for req_num in req_refs:
            req_id = f"REQ-{req_num}"
            if req_id in req_to_task:
                ref_task = req_to_task[req_id]
                if ref_task != task_id and ref_task not in enhanced.get(task_id, []):
                    if float(ref_task) < float(task_id):
                        if task_id not in enhanced:
                            enhanced[task_id] = []
                        enhanced[task_id].append(ref_task)

    # Deduplicate
    for task_id in enhanced:
        enhanced[task_id] = list(set(enhanced[task_id]))

    return enhanced


def build_dependency_state(
    tasks: List[dict],
    dependencies: Dict[str, List[str]],
    file_mentions: Dict[str, Set[str]],
    conflicts: Dict[str, Set[str]]
) -> dict:
    """
    Build the dependencies section for the state file.
    """
    # Build task dependencies
    tasks_deps = {}

    for task in tasks:
        task_id = task.get('id')

        tasks_deps[task_id] = {
            'task_id': task_id,
            'depends_on': dependencies.get(task_id, []),
            'blocks': [],  # Will be computed from reverse of depends_on
            'files_touched': list(file_mentions.get(task_id, set())),
            'conflicts_with': list(conflicts.get(task_id, set())),
            'safe_to_parallelize': [],
            'extracted_at': datetime.now().isoformat(),
            'source_file': task.get('files', {}).get('overview'),
        }

    # Compute 'blocks' (reverse of depends_on)
    for task_id, deps in tasks_deps.items():
        for upstream in deps['depends_on']:
            if upstream in tasks_deps:
                if task_id not in tasks_deps[upstream]['blocks']:
                    tasks_deps[upstream]['blocks'].append(task_id)

    # Compute safe_to_parallelize
    all_task_ids = set(tasks_deps.keys())
    for task_id, deps in tasks_deps.items():
        # Tasks that don't conflict and aren't dependencies
        unsafe = set(deps['depends_on']) | set(deps['blocks']) | set(deps['conflicts_with']) | {task_id}
        safe = all_task_ids - unsafe
        deps['safe_to_parallelize'] = list(safe)

    # Build graph
    nodes = list(tasks_deps.keys())
    edges = []
    for task_id, deps in tasks_deps.items():
        for upstream in deps['depends_on']:
            edges.append((upstream, task_id))

    # Compute roots and leaves
    has_incoming = set(to_node for _, to_node in edges)
    has_outgoing = set(from_node for from_node, _ in edges)
    roots = [n for n in nodes if n not in has_incoming]
    leaves = [n for n in nodes if n not in has_outgoing]

    # Topological sort
    topo_order, has_cycle, cycle_tasks = topological_sort(nodes, edges)

    # Find critical path (simplified: longest chain)
    def find_longest_path():
        if not nodes:
            return []

        # Build adjacency
        adj = defaultdict(list)
        for from_n, to_n in edges:
            adj[from_n].append(to_n)

        # DFS with memoization
        memo = {}

        def dfs(node):
            if node in memo:
                return memo[node]

            max_path = [node]
            for neighbor in adj.get(node, []):
                path = dfs(neighbor)
                if len(path) + 1 > len(max_path):
                    max_path = [node] + path

            memo[node] = max_path
            return max_path

        longest = []
        for root in roots:
            path = dfs(root)
            if len(path) > len(longest):
                longest = path

        return longest

    critical_path = find_longest_path()

    # Identify parallel clusters
    def find_clusters():
        """Group tasks that can run in parallel."""
        if not nodes:
            return []

        # Tasks at same "level" can run in parallel
        levels = {}

        def get_level(task_id, visited=None):
            if visited is None:
                visited = set()
            if task_id in levels:
                return levels[task_id]
            if task_id in visited:
                return 0  # Cycle protection

            visited.add(task_id)
            deps = tasks_deps.get(task_id, {}).get('depends_on', [])
            if not deps:
                levels[task_id] = 0
            else:
                levels[task_id] = 1 + max(get_level(d, visited) for d in deps)

            return levels[task_id]

        for task_id in nodes:
            get_level(task_id)

        # Group by level, but split by conflicts
        level_groups = defaultdict(list)
        for task_id, level in sorted(levels.items(), key=lambda x: x[1]):
            level_groups[level].append(task_id)

        clusters = []
        for level in sorted(level_groups.keys()):
            level_tasks = level_groups[level]

            # Split level into non-conflicting groups
            remaining = set(level_tasks)
            while remaining:
                cluster = []
                task = remaining.pop()
                cluster.append(task)

                # Add non-conflicting tasks
                task_conflicts = set(tasks_deps.get(task, {}).get('conflicts_with', []))
                for other in list(remaining):
                    other_conflicts = set(tasks_deps.get(other, {}).get('conflicts_with', []))
                    if other not in task_conflicts and task not in other_conflicts:
                        cluster.append(other)
                        remaining.discard(other)
                        task_conflicts.update(other_conflicts)

                clusters.append(sorted(cluster))

        return clusters

    parallel_clusters = find_clusters()

    return {
        'tasks': tasks_deps,
        'graph': {
            'nodes': nodes,
            'edges': edges,
            'roots': roots,
            'leaves': leaves,
        },
        'execution': {
            'topological_order': topo_order,
            'critical_path': critical_path,
            'parallel_clusters': parallel_clusters,
            'has_cycles': has_cycle,
            'cycle_tasks': cycle_tasks,
        },
        'last_updated': datetime.now().isoformat(),
    }


def main():
    parser = argparse.ArgumentParser(
        description="Extract dependencies from implementation plan"
    )
    parser.add_argument(
        '--config', '-c',
        required=True,
        help='Path to pipeline YAML config'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without modifying state'
    )
    parser.add_argument(
        '--output', '-o',
        help='Output dependency info to separate JSON file'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Verbose output'
    )

    args = parser.parse_args()
    config_path = Path(args.config)

    print(f"Loading config: {config_path}")
    config = load_config(config_path)

    print(f"Loading state...")
    state = load_state(config, config_path)

    print(f"Loading implementation plan...")
    plan_content = load_implementation_plan(config, config_path)

    print(f"Parsing phase structure...")
    phases = parse_phase_structure(plan_content)
    print(f"  Found {len(phases)} phases")
    for phase, tasks in sorted(phases.items()):
        print(f"    Phase {phase}: {tasks}")

    print(f"\nInferring phase-based dependencies...")
    base_deps = infer_phase_dependencies(phases)

    print(f"\nAnalyzing file mentions in overviews...")
    file_mentions = analyze_file_dependencies(state)
    total_files = sum(len(f) for f in file_mentions.values())
    print(f"  Found {total_files} file mentions across {len(file_mentions)} tasks")

    print(f"\nFinding file conflicts...")
    conflicts = find_file_conflicts(file_mentions)
    conflict_count = sum(len(c) for c in conflicts.values()) // 2
    print(f"  Found {conflict_count} file conflict pairs")

    print(f"\nEnhancing dependencies from content analysis...")
    enhanced_deps = enhance_dependencies_from_content(state, base_deps)

    print(f"\nBuilding dependency graph...")
    tasks = extract_tasks_from_state(state)
    deps_section = build_dependency_state(tasks, enhanced_deps, file_mentions, conflicts)

    # Summary
    print(f"\n{'='*60}")
    print("DEPENDENCY ANALYSIS RESULTS")
    print('='*60)
    print(f"Tasks analyzed: {len(deps_section['tasks'])}")
    print(f"Graph nodes: {len(deps_section['graph']['nodes'])}")
    print(f"Graph edges: {len(deps_section['graph']['edges'])}")
    print(f"Root tasks: {deps_section['graph']['roots']}")
    print(f"Leaf tasks: {deps_section['graph']['leaves']}")
    print(f"Has cycles: {deps_section['execution']['has_cycles']}")
    print(f"Critical path: {deps_section['execution']['critical_path']}")
    print(f"Parallel clusters: {len(deps_section['execution']['parallel_clusters'])}")

    if args.verbose:
        print(f"\nCluster details:")
        for i, cluster in enumerate(deps_section['execution']['parallel_clusters']):
            print(f"  Cluster {i}: {cluster}")

    # Output
    if args.output:
        output_path = Path(args.output)
        output_path.write_text(json.dumps(deps_section, indent=2))
        print(f"\nDependency info written to: {output_path}")

    if args.dry_run:
        print(f"\n[DRY RUN] Would update state file with dependencies section")
        print(f"  State file: {config_path.parent / config.get('outputs', {}).get('state', 'state.json')}")
    else:
        # Update state file
        state['dependencies'] = deps_section
        state['updated_at'] = datetime.now().isoformat()

        state_file = config.get('outputs', {}).get('state', 'pipeline-state.json')
        state_path = config_path.parent / state_file

        state_path.write_text(json.dumps(state, indent=2, default=str))
        print(f"\n✓ State file updated: {state_path}")

    return 0


if __name__ == '__main__':
    sys.exit(main())
