#!/usr/bin/env python3
"""
Dev Server Monitor Daemon
=========================
Monitors the Next.js development server, automatically restarts it when down,
and uses Claude CLI for intelligent diagnostics and auto-fixing of common issues.

Usage:
    python scripts/dev-monitor.py              # Start monitoring
    python scripts/dev-monitor.py --daemon     # Run in background
    python scripts/dev-monitor.py --status     # Check daemon status
    python scripts/dev-monitor.py --stop       # Stop daemon

Created: 2026-01-10
"""

import argparse
import json
import logging
import os
import signal
import subprocess
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict, Any
import threading
import socket

# Try to import optional dependencies
try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False


# =============================================================================
# Configuration
# =============================================================================

@dataclass
class MonitorConfig:
    """Configuration for the dev server monitor."""
    check_interval: int = 10  # seconds between health checks
    check_timeout: int = 5    # seconds to wait for response
    max_restart_attempts: int = 2  # before calling Claude
    server_start_timeout: int = 90  # seconds to wait for server ready

    # Active development mode
    active_dev_mode: bool = True
    cooldown_after_restart: int = 30  # seconds to wait after restart

    server_url: str = "http://localhost:3000"
    server_command: str = "npm run dev"
    working_directory: str = "."

    auto_fix_enabled: bool = True
    clear_cache: bool = True
    kill_port_conflicts: bool = True
    max_memory_mb: int = 4096

    claude_enabled: bool = True
    max_diagnoses_per_hour: int = 20  # higher for active dev
    claude_cooldown_minutes: int = 5  # per-issue cooldown
    claude_allowed_tools: str = "Read,Bash,Glob,Grep"

    # Issue types that trigger/skip Claude
    claude_trigger_on: List[str] = field(default_factory=lambda: [
        'port_conflict', 'cache_corruption', 'memory_exhaustion', 'unknown_error'
    ])
    claude_skip_on: List[str] = field(default_factory=lambda: [
        'typescript_error', 'build_error'
    ])

    log_file: str = "scripts/dev-monitor.log"
    pid_file: str = "scripts/dev-monitor.pid"
    server_log_file: str = "/tmp/dev-server.log"

    @classmethod
    def from_yaml(cls, path: str) -> 'MonitorConfig':
        """Load configuration from YAML file."""
        if not HAS_YAML:
            logging.warning("PyYAML not installed, using defaults")
            return cls()

        if not os.path.exists(path):
            return cls()

        with open(path) as f:
            data = yaml.safe_load(f)

        config = cls()
        if 'monitor' in data:
            for key, value in data['monitor'].items():
                if hasattr(config, key):
                    setattr(config, key, value)
        if 'server' in data:
            if 'url' in data['server']:
                config.server_url = data['server']['url']
            if 'command' in data['server']:
                config.server_command = data['server']['command']
            if 'working_directory' in data['server']:
                config.working_directory = data['server']['working_directory']
        if 'auto_fix' in data:
            for key, value in data['auto_fix'].items():
                attr_name = key.replace('-', '_')
                if hasattr(config, attr_name):
                    setattr(config, attr_name, value)
        if 'claude' in data:
            if 'enabled' in data['claude']:
                config.claude_enabled = data['claude']['enabled']
            if 'max_diagnoses_per_hour' in data['claude']:
                config.max_diagnoses_per_hour = data['claude']['max_diagnoses_per_hour']

        return config


# =============================================================================
# Health Checker
# =============================================================================

class HealthChecker:
    """Checks if the dev server is responding."""

    def __init__(self, url: str, timeout: int = 5):
        self.url = url
        self.timeout = timeout
        self.consecutive_failures = 0
        self.last_check_time: Optional[datetime] = None
        self.last_status: Optional[bool] = None

    def check(self) -> bool:
        """
        Check if the server is healthy.
        Returns True if healthy, False otherwise.
        """
        self.last_check_time = datetime.now()

        try:
            if HAS_REQUESTS:
                response = requests.get(self.url, timeout=self.timeout)
                healthy = response.status_code == 200
            else:
                # Fallback to curl
                result = subprocess.run(
                    ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}',
                     self.url, '--max-time', str(self.timeout)],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout + 2
                )
                healthy = result.stdout.strip() == '200'

            if healthy:
                self.consecutive_failures = 0
            else:
                self.consecutive_failures += 1

            self.last_status = healthy
            return healthy

        except Exception as e:
            logging.debug(f"Health check failed: {e}")
            self.consecutive_failures += 1
            self.last_status = False
            return False

    def is_port_in_use(self, port: int = 3000) -> bool:
        """Check if port is in use."""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                return s.connect_ex(('localhost', port)) == 0
        except:
            return False


# =============================================================================
# Issue Detector
# =============================================================================

@dataclass
class Issue:
    """Represents a detected issue."""
    type: str
    description: str
    severity: str  # 'low', 'medium', 'high', 'critical'
    auto_fixable: bool
    fix_command: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)


class IssueDetector:
    """Detects common dev server issues."""

    def __init__(self, config: MonitorConfig):
        self.config = config
        self.project_dir = os.path.abspath(config.working_directory)

    def detect_all(self, server_logs: str = "") -> List[Issue]:
        """Detect all issues and return a list."""
        issues = []

        # Check for port conflicts
        port_issue = self._check_port_conflict()
        if port_issue:
            issues.append(port_issue)

        # Check for cache issues
        cache_issue = self._check_cache_corruption(server_logs)
        if cache_issue:
            issues.append(cache_issue)

        # Check for memory issues
        memory_issue = self._check_memory_issues(server_logs)
        if memory_issue:
            issues.append(memory_issue)

        # Check for TypeScript errors
        ts_issue = self._check_typescript_errors(server_logs)
        if ts_issue:
            issues.append(ts_issue)

        # Check for zombie processes
        zombie_issue = self._check_zombie_processes()
        if zombie_issue:
            issues.append(zombie_issue)

        return issues

    def _check_port_conflict(self) -> Optional[Issue]:
        """Check if another process is using port 3000."""
        try:
            result = subprocess.run(
                ['lsof', '-i', ':3000', '-t'],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                # Check if it's a next.js process
                for pid in pids:
                    try:
                        proc_result = subprocess.run(
                            ['ps', '-p', pid, '-o', 'comm='],
                            capture_output=True,
                            text=True
                        )
                        if 'node' not in proc_result.stdout.lower():
                            return Issue(
                                type='port_conflict',
                                description=f'Port 3000 is in use by non-node process (PID: {pid})',
                                severity='high',
                                auto_fixable=True,
                                fix_command=f'kill {pid}',
                                details={'pids': pids}
                            )
                    except:
                        pass
        except Exception as e:
            logging.debug(f"Port conflict check failed: {e}")

        return None

    def _check_cache_corruption(self, logs: str) -> Optional[Issue]:
        """Check for .next cache corruption indicators."""
        cache_error_patterns = [
            'ENOENT',
            'Cannot find module',
            'Module build failed',
            'Unexpected token',
            'corrupted',
            'invalid cache',
        ]

        logs_lower = logs.lower()
        for pattern in cache_error_patterns:
            if pattern.lower() in logs_lower:
                return Issue(
                    type='cache_corruption',
                    description='Possible .next cache corruption detected',
                    severity='medium',
                    auto_fixable=True,
                    fix_command='rm -rf .next/cache',
                    details={'pattern_matched': pattern}
                )

        return None

    def _check_memory_issues(self, logs: str) -> Optional[Issue]:
        """Check for memory exhaustion issues."""
        memory_patterns = [
            'JavaScript heap out of memory',
            'FATAL ERROR: Reached heap limit',
            'FATAL ERROR: CALL_AND_RETRY_LAST',
            'Allocation failed',
        ]

        for pattern in memory_patterns:
            if pattern in logs:
                return Issue(
                    type='memory_exhaustion',
                    description='Node.js ran out of memory',
                    severity='high',
                    auto_fixable=True,
                    fix_command=f'NODE_OPTIONS="--max-old-space-size={self.config.max_memory_mb}"',
                    details={'pattern_matched': pattern}
                )

        return None

    def _check_typescript_errors(self, logs: str) -> Optional[Issue]:
        """Check for TypeScript compilation errors."""
        ts_error_patterns = [
            'error TS',
            'Type error:',
            'Cannot find name',
            "Property '",
        ]

        for pattern in ts_error_patterns:
            if pattern in logs:
                return Issue(
                    type='typescript_error',
                    description='TypeScript compilation errors detected',
                    severity='high',
                    auto_fixable=False,  # Needs human review
                    details={'pattern_matched': pattern}
                )

        return None

    def _check_zombie_processes(self) -> Optional[Issue]:
        """Check for zombie node processes."""
        if not HAS_PSUTIL:
            return None

        try:
            zombie_pids = []
            for proc in psutil.process_iter(['pid', 'name', 'status']):
                if proc.info['name'] and 'node' in proc.info['name'].lower():
                    if proc.info['status'] == psutil.STATUS_ZOMBIE:
                        zombie_pids.append(proc.info['pid'])

            if zombie_pids:
                return Issue(
                    type='zombie_processes',
                    description=f'Found {len(zombie_pids)} zombie node processes',
                    severity='medium',
                    auto_fixable=True,
                    fix_command=f'kill -9 {" ".join(map(str, zombie_pids))}',
                    details={'pids': zombie_pids}
                )
        except Exception as e:
            logging.debug(f"Zombie check failed: {e}")

        return None


# =============================================================================
# Auto Fixer
# =============================================================================

class AutoFixer:
    """Automatically fixes detected issues."""

    def __init__(self, config: MonitorConfig):
        self.config = config
        self.project_dir = os.path.abspath(config.working_directory)
        self.actions_taken: List[Dict[str, Any]] = []

        # Self-identify: store our PID and all ancestor PIDs to avoid killing ourselves
        self.protected_pids = self._get_self_and_ancestors()
        logging.debug(f"Protected PIDs (self + ancestors): {self.protected_pids}")

    def _get_self_and_ancestors(self) -> set:
        """Get our own PID and all ancestor PIDs."""
        protected = {os.getpid()}

        if HAS_PSUTIL:
            try:
                proc = psutil.Process()
                while proc.parent() and proc.parent().pid != 1:
                    protected.add(proc.parent().pid)
                    proc = proc.parent()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        return protected

    def fix(self, issue: Issue) -> bool:
        """
        Attempt to fix an issue.
        Returns True if fixed successfully.
        """
        if not issue.auto_fixable:
            logging.info(f"Issue '{issue.type}' requires manual intervention")
            return False

        if not self.config.auto_fix_enabled:
            logging.info(f"Auto-fix disabled, skipping '{issue.type}'")
            return False

        logging.info(f"Attempting to fix: {issue.type}")

        try:
            if issue.type == 'port_conflict':
                return self._fix_port_conflict(issue)
            elif issue.type == 'cache_corruption':
                return self._fix_cache_corruption(issue)
            elif issue.type == 'memory_exhaustion':
                return self._fix_memory_exhaustion(issue)
            elif issue.type == 'zombie_processes':
                return self._fix_zombie_processes(issue)
            else:
                logging.warning(f"No fix handler for issue type: {issue.type}")
                return False
        except Exception as e:
            logging.error(f"Fix failed for {issue.type}: {e}")
            return False

    def _fix_port_conflict(self, issue: Issue) -> bool:
        """Kill process using port 3000."""
        if not self.config.kill_port_conflicts:
            return False

        pids = issue.details.get('pids', [])
        for pid in pids:
            # Don't kill ourselves or our ancestors
            if pid in self.protected_pids:
                logging.info(f"Process {pid} on port 3000 is protected (our process tree), skipping")
                continue
            try:
                subprocess.run(['kill', str(pid)], timeout=5)
                logging.info(f"Killed process {pid} using port 3000")
                self.actions_taken.append({
                    'action': 'kill_process',
                    'pid': pid,
                    'time': datetime.now().isoformat()
                })
            except Exception as e:
                logging.warning(f"Failed to kill {pid}: {e}")

        time.sleep(1)
        return True

    def _fix_cache_corruption(self, issue: Issue) -> bool:
        """Clear .next cache."""
        if not self.config.clear_cache:
            return False

        cache_path = os.path.join(self.project_dir, '.next', 'cache')
        if os.path.exists(cache_path):
            try:
                subprocess.run(['rm', '-rf', cache_path], timeout=30)
                logging.info(f"Cleared .next cache at {cache_path}")
                self.actions_taken.append({
                    'action': 'clear_cache',
                    'path': cache_path,
                    'time': datetime.now().isoformat()
                })
                return True
            except Exception as e:
                logging.warning(f"Failed to clear cache: {e}")

        return False

    def _fix_memory_exhaustion(self, issue: Issue) -> bool:
        """Set NODE_OPTIONS for higher memory limit."""
        # This is handled by the restarter with env vars
        self.actions_taken.append({
            'action': 'increase_memory',
            'max_mb': self.config.max_memory_mb,
            'time': datetime.now().isoformat()
        })
        return True

    def _fix_zombie_processes(self, issue: Issue) -> bool:
        """Handle zombie processes.

        Note: Zombies can't actually be killed - they're already dead.
        The only way to clean them up is to kill the parent or wait for parent to exit.
        We log this as informational and let the restart handle it.
        """
        pids = issue.details.get('pids', [])
        if not pids:
            return True

        logging.info(f"Found {len(pids)} zombie process(es) - attempting to clean up")

        # Try to kill parent processes, but protect ourselves
        if HAS_PSUTIL:
            for pid in pids:
                try:
                    proc = psutil.Process(pid)
                    parent = proc.parent()
                    if parent and parent.pid != 1:
                        if parent.pid in self.protected_pids:
                            logging.info(f"Zombie {pid} parent {parent.pid} is protected (our process tree), skipping")
                            continue
                        logging.info(f"Killing parent process {parent.pid} of zombie {pid}")
                        parent.terminate()
                        self.actions_taken.append({
                            'action': 'kill_zombie_parent',
                            'zombie_pid': pid,
                            'parent_pid': parent.pid,
                            'time': datetime.now().isoformat()
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
                except Exception as e:
                    logging.debug(f"Error handling zombie {pid}: {e}")

        return True


# =============================================================================
# Auto Restarter
# =============================================================================

class AutoRestarter:
    """Manages dev server process lifecycle."""

    def __init__(self, config: MonitorConfig):
        self.config = config
        self.project_dir = os.path.abspath(config.working_directory)
        self.server_process: Optional[subprocess.Popen] = None
        self.restart_count = 0
        self.last_restart: Optional[datetime] = None
        self.increased_memory = False
        self.restart_in_progress = False  # Prevent concurrent restarts

    def stop_server(self) -> bool:
        """Stop any running dev server."""
        logging.info("Stopping dev server...")

        try:
            # Kill by process if we have it
            if self.server_process:
                self.server_process.terminate()
                try:
                    self.server_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    self.server_process.kill()
                self.server_process = None

            # Also kill any processes on port 3000
            result = subprocess.run(
                ['lsof', '-i', ':3000', '-t'],
                capture_output=True,
                text=True
            )

            if result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    try:
                        subprocess.run(['kill', pid], timeout=5)
                    except:
                        pass
                time.sleep(2)

                # Force kill if still running
                for pid in pids:
                    try:
                        subprocess.run(['kill', '-9', pid], timeout=5)
                    except:
                        pass

            # Also pkill next processes
            subprocess.run(['pkill', '-f', 'next'], timeout=5)
            time.sleep(1)

            return True
        except Exception as e:
            logging.warning(f"Error stopping server: {e}")
            return False

    def start_server(self) -> bool:
        """Start the dev server."""
        logging.info("Starting dev server...")

        self.restart_count += 1
        self.last_restart = datetime.now()

        # Prepare environment
        env = os.environ.copy()
        if self.increased_memory:
            env['NODE_OPTIONS'] = f'--max-old-space-size={self.config.max_memory_mb}'

        try:
            # Start server in background
            log_file = open(self.config.server_log_file, 'w')
            self.server_process = subprocess.Popen(
                self.config.server_command.split(),
                cwd=self.project_dir,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                env=env,
                start_new_session=True
            )

            logging.info(f"Server process started (PID: {self.server_process.pid})")

            # Wait for server to be ready
            return self._wait_for_ready()

        except Exception as e:
            logging.error(f"Failed to start server: {e}")
            return False

    def _wait_for_ready(self) -> bool:
        """Wait for server to respond to health checks."""
        logging.info(f"Waiting for server to be ready (max {self.config.server_start_timeout}s)...")

        start_time = time.time()
        checker = HealthChecker(self.config.server_url, timeout=5)

        while time.time() - start_time < self.config.server_start_timeout:
            if checker.check():
                elapsed = time.time() - start_time
                logging.info(f"Server ready in {elapsed:.1f}s")
                return True
            time.sleep(2)

        logging.error("Server failed to become ready within timeout")
        return False

    def restart(self) -> bool:
        """Stop and start the server."""
        # Prevent concurrent restarts
        if self.restart_in_progress:
            logging.warning("Restart already in progress, skipping")
            return False

        self.restart_in_progress = True
        try:
            self.stop_server()
            time.sleep(2)  # Wait for port to be released
            return self.start_server()
        finally:
            self.restart_in_progress = False

    def get_server_logs(self, lines: int = 100) -> str:
        """Get recent server logs."""
        try:
            if os.path.exists(self.config.server_log_file):
                result = subprocess.run(
                    ['tail', '-n', str(lines), self.config.server_log_file],
                    capture_output=True,
                    text=True
                )
                return result.stdout
        except:
            pass
        return ""


# =============================================================================
# Maintenance Agent (Claude CLI)
# =============================================================================

class MaintenanceAgent:
    """Uses Claude CLI for intelligent diagnostics."""

    def __init__(self, config: MonitorConfig):
        self.config = config
        self.project_dir = os.path.abspath(config.working_directory)
        self.diagnoses_this_hour: List[datetime] = []
        self.issue_cooldowns: Dict[str, datetime] = {}  # Per-issue cooldown tracking

    def _should_skip_issue(self, issue_type: str) -> bool:
        """Check if this issue type should skip Claude (dev errors)."""
        if issue_type in self.config.claude_skip_on:
            logging.info(f"Skipping Claude for '{issue_type}' (developer-caused error)")
            return True
        return False

    def _is_on_cooldown(self, issue_type: str) -> bool:
        """Check if this issue type is on cooldown."""
        if issue_type not in self.issue_cooldowns:
            return False

        cooldown_until = self.issue_cooldowns[issue_type]
        if datetime.now() < cooldown_until:
            remaining = (cooldown_until - datetime.now()).seconds
            logging.info(f"Issue '{issue_type}' on cooldown ({remaining}s remaining)")
            return True

        return False

    def _set_cooldown(self, issue_type: str):
        """Set cooldown for an issue type."""
        cooldown_mins = self.config.claude_cooldown_minutes
        self.issue_cooldowns[issue_type] = datetime.now() + timedelta(minutes=cooldown_mins)

    def _can_diagnose(self, issues: List[Issue] = None) -> bool:
        """Check if we're within rate limits and should diagnose."""
        if not self.config.claude_enabled:
            return False

        # Check if all issues should be skipped
        if issues:
            issue_types = [i.type for i in issues]
            # If all issues are in skip list, don't call Claude
            if all(self._should_skip_issue(t) for t in issue_types):
                return False
            # If all issues are on cooldown, don't call Claude
            if all(self._is_on_cooldown(t) for t in issue_types):
                return False

        # Clean old entries from hourly rate limit
        cutoff = datetime.now() - timedelta(hours=1)
        self.diagnoses_this_hour = [d for d in self.diagnoses_this_hour if d > cutoff]

        return len(self.diagnoses_this_hour) < self.config.max_diagnoses_per_hour

    def diagnose(self, logs: str, issues: List[Issue], actions_taken: List[Dict]) -> Optional[Dict[str, Any]]:
        """
        Call Claude to diagnose issues.
        Returns diagnosis with recommended actions.
        """
        if not self._can_diagnose(issues):
            logging.info("Claude diagnosis skipped (rate limit, cooldown, or dev error)")
            return None

        self.diagnoses_this_hour.append(datetime.now())

        # Set cooldown for each issue type we're diagnosing
        for issue in issues:
            self._set_cooldown(issue.type)

        # Build prompt
        issues_text = "\n".join([
            f"- {i.type}: {i.description} (severity: {i.severity})"
            for i in issues
        ])

        actions_text = "\n".join([
            f"- {a['action']} at {a['time']}"
            for a in actions_taken[-10:]  # Last 10 actions
        ])

        prompt = f"""Analyze this dev server issue and suggest fixes:

## Server Logs (last 100 lines):
```
{logs[-5000:]}  # Truncate to avoid token limits
```

## Detected Issues:
{issues_text if issues_text else "None automatically detected"}

## Recent Actions Taken:
{actions_text if actions_text else "None"}

## Project Info:
- Working directory: {self.project_dir}
- Server command: {self.config.server_command}
- Server URL: {self.config.server_url}

## Instructions:
1. Analyze the root cause
2. Determine if this can be auto-fixed
3. Provide specific commands to run

Respond in JSON format:
{{
    "root_cause": "Brief description of the problem",
    "can_auto_fix": true/false,
    "fix_commands": ["command1", "command2"],
    "explanation": "Why this fix should work",
    "requires_manual": "What needs human review (if any)"
}}
"""

        logging.info("Calling Claude for diagnosis...")

        try:
            result = subprocess.run(
                [
                    'claude', '-p', prompt,
                    '--allowedTools', self.config.claude_allowed_tools,
                    '--output-format', 'text'
                ],
                capture_output=True,
                text=True,
                timeout=120,
                cwd=self.project_dir
            )

            if result.returncode == 0:
                response = result.stdout.strip()
                logging.info(f"Claude diagnosis received ({len(response)} chars)")

                # Try to parse JSON from response
                try:
                    # Find JSON in response
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', response)
                    if json_match:
                        diagnosis = json.loads(json_match.group())
                        return diagnosis
                except json.JSONDecodeError:
                    pass

                # Return raw response if JSON parsing fails
                return {
                    'root_cause': 'See raw response',
                    'can_auto_fix': False,
                    'raw_response': response
                }
            else:
                logging.error(f"Claude failed: {result.stderr}")
                return None

        except subprocess.TimeoutExpired:
            logging.error("Claude diagnosis timed out")
            return None
        except FileNotFoundError:
            logging.error("Claude CLI not found")
            return None
        except Exception as e:
            logging.error(f"Claude diagnosis error: {e}")
            return None

    def execute_fix(self, diagnosis: Dict[str, Any]) -> bool:
        """Execute fix commands from diagnosis."""
        if not diagnosis.get('can_auto_fix'):
            logging.info("Diagnosis indicates manual intervention required")
            if diagnosis.get('requires_manual'):
                logging.info(f"Manual action needed: {diagnosis['requires_manual']}")
            return False

        commands = diagnosis.get('fix_commands', [])
        if not commands:
            logging.info("No fix commands provided")
            return False

        success = True
        for cmd in commands:
            logging.info(f"Executing fix command: {cmd}")
            try:
                # Safety check - don't run destructive commands
                # Allow .next deletion (safe) but block system-wide destruction
                dangerous = ['rm -rf /', 'rm -rf ~', 'rm -rf /*', 'sudo rm', ':(){', 'mkfs', 'dd if=']
                is_dangerous = False
                for d in dangerous:
                    if d in cmd:
                        # Exception: allow rm -rf .next or rm -rf /path/to/project/.next
                        if 'rm -rf' in cmd and '.next' in cmd and '/.next' not in d:
                            continue  # This is safe
                        is_dangerous = True
                        break

                if is_dangerous:
                    logging.warning(f"Skipping potentially dangerous command: {cmd}")
                    continue

                # Skip long-running server commands - these should be handled by restarter
                server_commands = ['npm run dev', 'npm start', 'next dev', 'yarn dev']
                if any(sc in cmd for sc in server_commands):
                    logging.info(f"Skipping server command (handled by restarter): {cmd}")
                    continue

                result = subprocess.run(
                    cmd,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=60,
                    cwd=self.project_dir
                )

                if result.returncode != 0:
                    logging.warning(f"Command failed: {result.stderr}")
                    success = False
                else:
                    logging.info(f"Command succeeded")

            except subprocess.TimeoutExpired:
                logging.warning(f"Command timed out (60s): {cmd}")
                success = False
            except Exception as e:
                logging.error(f"Error executing command: {e}")
                success = False

        return success


# =============================================================================
# Main Monitor
# =============================================================================

class DevServerMonitor:
    """Main monitor daemon."""

    def __init__(self, config: MonitorConfig):
        self.config = config
        self.project_dir = os.path.abspath(config.working_directory)

        self.health_checker = HealthChecker(config.server_url, config.check_timeout)
        self.issue_detector = IssueDetector(config)
        self.auto_fixer = AutoFixer(config)
        self.restarter = AutoRestarter(config)
        self.maintenance_agent = MaintenanceAgent(config)

        self.running = False
        self.start_time: Optional[datetime] = None
        self.total_restarts = 0
        self.total_fixes = 0

    def start(self):
        """Start the monitoring loop."""
        self.running = True
        self.start_time = datetime.now()

        logging.info("=" * 60)
        logging.info("Dev Server Monitor Started")
        logging.info(f"Monitoring: {self.config.server_url}")
        logging.info(f"Check interval: {self.config.check_interval}s")
        logging.info("=" * 60)

        # Check if server is already running
        if not self.health_checker.check():
            logging.info("Server not running, starting...")
            self.restarter.start_server()
        else:
            logging.info("Server already running")

        # Main loop
        while self.running:
            try:
                self._monitor_cycle()
                time.sleep(self.config.check_interval)
            except KeyboardInterrupt:
                logging.info("Received interrupt, shutting down...")
                break
            except Exception as e:
                logging.error(f"Monitor cycle error: {e}")
                time.sleep(self.config.check_interval)

        self.stop()

    def _monitor_cycle(self):
        """Single monitoring cycle."""
        # Health check
        is_healthy = self.health_checker.check()

        if is_healthy:
            if self.health_checker.consecutive_failures > 0:
                # Just recovered
                logging.info("Server recovered")
            # Reset restart count on recovery
            self.restarter.restart_count = 0
            return

        # Server is unhealthy
        failures = self.health_checker.consecutive_failures
        logging.warning(f"Health check failed ({failures} consecutive)")

        # Get server logs for analysis
        logs = self.restarter.get_server_logs()

        # Detect issues
        issues = self.issue_detector.detect_all(logs)
        if issues:
            logging.info(f"Detected {len(issues)} issue(s):")
            for issue in issues:
                logging.info(f"  - {issue.type}: {issue.description}")

        # Try auto-fixes first
        fixes_applied = 0
        for issue in issues:
            if issue.auto_fixable:
                if self.auto_fixer.fix(issue):
                    self.total_fixes += 1
                    fixes_applied += 1

        # Wait for fixes to take effect before restart
        if fixes_applied > 0:
            logging.info(f"Waiting 3s for {fixes_applied} fix(es) to take effect...")
            time.sleep(3)

        # Reset restart count every 10 failures to keep trying
        if failures > 0 and failures % 10 == 0:
            logging.info(f"Resetting restart count after {failures} consecutive failures")
            self.restarter.restart_count = 0

        # Always attempt restart (the key fix!)
        logging.info(f"Attempting restart ({self.restarter.restart_count + 1}/{self.config.max_restart_attempts})")
        if self.restarter.restart():
            self.total_restarts += 1
            logging.info("Restart successful")
            return
        else:
            logging.warning("Restart failed")

        # If we've hit max restarts without success, call Claude for help
        if self.restarter.restart_count >= self.config.max_restart_attempts:
            logging.warning("Max restart attempts reached, calling Claude for diagnosis")

            diagnosis = self.maintenance_agent.diagnose(
                logs, issues, self.auto_fixer.actions_taken
            )

            if diagnosis:
                logging.info(f"Claude diagnosis: {diagnosis.get('root_cause', 'Unknown')}")

                if diagnosis.get('can_auto_fix'):
                    if self.maintenance_agent.execute_fix(diagnosis):
                        logging.info("Claude fix applied, will retry restart on next cycle")
                        # Don't reset restart_count here - let the periodic reset handle it
                else:
                    logging.error("Manual intervention required")
                    if diagnosis.get('requires_manual'):
                        logging.error(f"  -> {diagnosis['requires_manual']}")

    def stop(self):
        """Stop the monitor."""
        self.running = False
        logging.info("Monitor stopped")

        uptime = datetime.now() - self.start_time if self.start_time else timedelta(0)
        logging.info(f"Stats: uptime={uptime}, restarts={self.total_restarts}, fixes={self.total_fixes}")

    def get_status(self) -> Dict[str, Any]:
        """Get current status."""
        return {
            'running': self.running,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'server_healthy': self.health_checker.last_status,
            'consecutive_failures': self.health_checker.consecutive_failures,
            'total_restarts': self.total_restarts,
            'total_fixes': self.total_fixes,
            'server_restart_count': self.restarter.restart_count
        }


# =============================================================================
# Daemon Management
# =============================================================================

def write_pid_file(pid_file: str):
    """Write PID to file."""
    with open(pid_file, 'w') as f:
        f.write(str(os.getpid()))


def read_pid_file(pid_file: str) -> Optional[int]:
    """Read PID from file."""
    try:
        with open(pid_file) as f:
            return int(f.read().strip())
    except:
        return None


def remove_pid_file(pid_file: str):
    """Remove PID file."""
    try:
        os.remove(pid_file)
    except:
        pass


def is_daemon_running(pid_file: str) -> bool:
    """Check if daemon is running."""
    pid = read_pid_file(pid_file)
    if pid is None:
        return False

    try:
        os.kill(pid, 0)  # Check if process exists
        return True
    except OSError:
        return False


def stop_daemon(pid_file: str) -> bool:
    """Stop running daemon."""
    pid = read_pid_file(pid_file)
    if pid is None:
        print("No daemon running (no PID file)")
        return False

    try:
        os.kill(pid, signal.SIGTERM)
        print(f"Sent SIGTERM to daemon (PID: {pid})")

        # Wait for process to exit
        for _ in range(10):
            try:
                os.kill(pid, 0)
                time.sleep(0.5)
            except OSError:
                remove_pid_file(pid_file)
                print("Daemon stopped")
                return True

        # Force kill
        os.kill(pid, signal.SIGKILL)
        remove_pid_file(pid_file)
        print("Daemon force killed")
        return True

    except OSError as e:
        print(f"Error stopping daemon: {e}")
        remove_pid_file(pid_file)
        return False


def daemonize():
    """Fork into background."""
    # First fork
    pid = os.fork()
    if pid > 0:
        sys.exit(0)

    # Decouple from parent
    os.chdir('/')
    os.setsid()
    os.umask(0)

    # Second fork
    pid = os.fork()
    if pid > 0:
        sys.exit(0)

    # Redirect standard file descriptors
    sys.stdout.flush()
    sys.stderr.flush()

    with open('/dev/null', 'r') as devnull:
        os.dup2(devnull.fileno(), sys.stdin.fileno())

    with open('/dev/null', 'a+') as devnull:
        os.dup2(devnull.fileno(), sys.stdout.fileno())
        os.dup2(devnull.fileno(), sys.stderr.fileno())


# =============================================================================
# CLI
# =============================================================================

def setup_logging(log_file: str, verbose: bool = False):
    """Setup logging configuration."""
    level = logging.DEBUG if verbose else logging.INFO

    # Create handlers
    handlers = []

    # File handler
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s [%(levelname)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    ))
    handlers.append(file_handler)

    # Console handler (only if not daemon)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s [%(levelname)s] %(message)s',
        datefmt='%H:%M:%S'
    ))
    handlers.append(console_handler)

    # Configure root logger
    logging.basicConfig(level=logging.DEBUG, handlers=handlers)


def main():
    parser = argparse.ArgumentParser(
        description='Dev Server Monitor Daemon',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python dev-monitor.py              Start monitoring (foreground)
  python dev-monitor.py --daemon     Start as background daemon
  python dev-monitor.py --status     Check daemon status
  python dev-monitor.py --stop       Stop running daemon
        """
    )

    parser.add_argument('--config', '-c', default='scripts/dev-monitor-config.yaml',
                        help='Path to configuration file')
    parser.add_argument('--daemon', '-d', action='store_true',
                        help='Run as background daemon')
    parser.add_argument('--status', '-s', action='store_true',
                        help='Check daemon status')
    parser.add_argument('--stop', action='store_true',
                        help='Stop running daemon')
    parser.add_argument('--verbose', '-v', action='store_true',
                        help='Verbose output')
    parser.add_argument('--no-auto-fix', action='store_true',
                        help='Disable auto-fixing')
    parser.add_argument('--no-claude', action='store_true',
                        help='Disable Claude integration')

    args = parser.parse_args()

    # Find project directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    os.chdir(project_dir)

    # Load configuration
    config = MonitorConfig.from_yaml(args.config)
    config.working_directory = project_dir

    if args.no_auto_fix:
        config.auto_fix_enabled = False
    if args.no_claude:
        config.claude_enabled = False

    # Handle status check
    if args.status:
        if is_daemon_running(config.pid_file):
            pid = read_pid_file(config.pid_file)
            print(f"Daemon is running (PID: {pid})")
            return 0
        else:
            print("Daemon is not running")
            return 1

    # Handle stop
    if args.stop:
        return 0 if stop_daemon(config.pid_file) else 1

    # Check if already running
    if is_daemon_running(config.pid_file):
        print(f"Daemon already running (PID: {read_pid_file(config.pid_file)})")
        return 1

    # Setup logging
    setup_logging(config.log_file, args.verbose)

    # Daemonize if requested
    if args.daemon:
        print(f"Starting daemon... (log: {config.log_file})")
        daemonize()

    # Write PID file
    write_pid_file(config.pid_file)

    # Setup signal handlers
    def signal_handler(signum, frame):
        logging.info(f"Received signal {signum}")
        remove_pid_file(config.pid_file)
        sys.exit(0)

    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    # Start monitor
    try:
        monitor = DevServerMonitor(config)
        monitor.start()
    finally:
        remove_pid_file(config.pid_file)

    return 0


if __name__ == '__main__':
    sys.exit(main())
