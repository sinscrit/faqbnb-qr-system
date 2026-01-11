# claude-pipelines/daemon/config.py
# Daemon Configuration Module
# Created: 2026-01-11
# Last Modified: 2026-01-11
#
# Configuration loading and validation for the PDF Pipeline Daemon.

"""
Daemon Configuration

Loads and validates daemon configuration from YAML files.
Provides defaults and type-safe access to settings.

Usage:
    from daemon.config import load_config, DaemonConfig

    config = load_config(Path("daemon_config.yaml"))
    print(config.daemon.poll_interval)
"""

import logging
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Default configuration values
DEFAULTS = {
    "daemon": {
        "inbox_dir": "./claude-pipelines/inbox",
        "processed_dir": "./claude-pipelines/processed",
        "failed_dir": "./claude-pipelines/failed",
        "poll_interval": 30,
        "log_file": "./claude-pipelines/daemon/logs/daemon.log",
        "state_file": "./claude-pipelines/daemon/state/daemon-state.json",
        "pid_file": "./claude-pipelines/daemon/daemon.pid",
    },
    "pdf_extraction": {
        "library": "pdfplumber",
        "timeout": 30,
    },
    "parser_skill": {
        "skill_file": "./claude-pipelines/skills/pdf-request-parser.md",
        "timeout": 120,
        "output_dir": "./docs/prd/intake",
    },
    "agents": {
        "implementation_planner": {
            "name": "00-implementation-planner",
            "timeout": 600,
            "allowed_tools": "Read,Write,Bash,Glob,Grep,Task,Edit",
        },
        "pipeline_creator": {
            "name": "00b-pipeline-creator",
            "timeout": 300,
            "allowed_tools": "Read,Write,Glob,Grep,Edit",
        },
    },
    "orchestrator": {
        "script": "./claude-pipelines/pipeline_orchestrator.py",
        "default_timeout": 900,
    },
    "notifications": {
        "on_complete": "log",
        "on_failure": "log",
    },
}


@dataclass
class DaemonSettings:
    """Daemon-specific settings."""
    inbox_dir: Path
    processed_dir: Path
    failed_dir: Path
    poll_interval: int
    log_file: Path
    state_file: Path
    pid_file: Path


@dataclass
class PDFExtractionSettings:
    """PDF extraction settings."""
    library: str
    timeout: int


@dataclass
class ParserSkillSettings:
    """Parser skill settings."""
    skill_file: Path
    timeout: int
    output_dir: Path


@dataclass
class AgentSettings:
    """Single agent settings."""
    name: str
    timeout: int
    allowed_tools: str


@dataclass
class OrchestratorSettings:
    """Orchestrator settings."""
    script: Path
    default_timeout: int


@dataclass
class NotificationSettings:
    """Notification settings."""
    on_complete: str
    on_failure: str


@dataclass
class DaemonConfig:
    """Complete daemon configuration."""
    daemon: DaemonSettings
    pdf_extraction: PDFExtractionSettings
    parser_skill: ParserSkillSettings
    implementation_planner: AgentSettings
    pipeline_creator: AgentSettings
    orchestrator: OrchestratorSettings
    notifications: NotificationSettings
    project_root: Path = field(default_factory=lambda: Path.cwd())

    def validate(self) -> list[str]:
        """
        Validate configuration values.

        Returns:
            List of validation error messages (empty if valid)
        """
        errors = []

        # Check poll interval
        if self.daemon.poll_interval < 1:
            errors.append("poll_interval must be at least 1 second")

        # Check timeouts
        if self.pdf_extraction.timeout < 1:
            errors.append("pdf_extraction.timeout must be at least 1 second")
        if self.parser_skill.timeout < 1:
            errors.append("parser_skill.timeout must be at least 1 second")
        if self.implementation_planner.timeout < 60:
            errors.append("implementation_planner.timeout should be at least 60 seconds")

        # Check library
        if self.pdf_extraction.library not in ("pdfplumber", "pypdf2"):
            errors.append(f"Unknown PDF library: {self.pdf_extraction.library}")

        # Check notification values
        valid_notifications = ("none", "log", "slack", "email")
        if self.notifications.on_complete not in valid_notifications:
            errors.append(f"Invalid on_complete: {self.notifications.on_complete}")
        if self.notifications.on_failure not in valid_notifications:
            errors.append(f"Invalid on_failure: {self.notifications.on_failure}")

        return errors


def load_config(config_path: Optional[Path] = None, project_root: Optional[Path] = None) -> DaemonConfig:
    """
    Load daemon configuration from YAML file.

    Args:
        config_path: Path to config YAML file (uses defaults if None)
        project_root: Project root directory (defaults to cwd)

    Returns:
        DaemonConfig instance

    Raises:
        ValueError: If configuration is invalid
    """
    try:
        import yaml
    except ImportError:
        logger.error("PyYAML not installed. Run: pip install pyyaml")
        raise

    project_root = project_root or Path.cwd()
    raw_config: Dict[str, Any] = {}

    # Load from file if provided
    if config_path and config_path.exists():
        logger.info(f"Loading config from: {config_path}")
        with open(config_path, 'r') as f:
            raw_config = yaml.safe_load(f) or {}
    else:
        logger.info("Using default configuration")

    # Merge with defaults
    def merge_dicts(base: dict, override: dict) -> dict:
        result = base.copy()
        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = merge_dicts(result[key], value)
            else:
                result[key] = value
        return result

    config_data = merge_dicts(DEFAULTS, raw_config)

    # Build config object
    config = DaemonConfig(
        daemon=DaemonSettings(
            inbox_dir=Path(config_data["daemon"]["inbox_dir"]),
            processed_dir=Path(config_data["daemon"]["processed_dir"]),
            failed_dir=Path(config_data["daemon"]["failed_dir"]),
            poll_interval=int(config_data["daemon"]["poll_interval"]),
            log_file=Path(config_data["daemon"]["log_file"]),
            state_file=Path(config_data["daemon"]["state_file"]),
            pid_file=Path(config_data["daemon"]["pid_file"]),
        ),
        pdf_extraction=PDFExtractionSettings(
            library=config_data["pdf_extraction"]["library"],
            timeout=int(config_data["pdf_extraction"]["timeout"]),
        ),
        parser_skill=ParserSkillSettings(
            skill_file=Path(config_data["parser_skill"]["skill_file"]),
            timeout=int(config_data["parser_skill"]["timeout"]),
            output_dir=Path(config_data["parser_skill"]["output_dir"]),
        ),
        implementation_planner=AgentSettings(
            name=config_data["agents"]["implementation_planner"]["name"],
            timeout=int(config_data["agents"]["implementation_planner"]["timeout"]),
            allowed_tools=config_data["agents"]["implementation_planner"]["allowed_tools"],
        ),
        pipeline_creator=AgentSettings(
            name=config_data["agents"]["pipeline_creator"]["name"],
            timeout=int(config_data["agents"]["pipeline_creator"]["timeout"]),
            allowed_tools=config_data["agents"]["pipeline_creator"]["allowed_tools"],
        ),
        orchestrator=OrchestratorSettings(
            script=Path(config_data["orchestrator"]["script"]),
            default_timeout=int(config_data["orchestrator"]["default_timeout"]),
        ),
        notifications=NotificationSettings(
            on_complete=config_data["notifications"]["on_complete"],
            on_failure=config_data["notifications"]["on_failure"],
        ),
        project_root=project_root,
    )

    # Validate
    errors = config.validate()
    if errors:
        error_msg = "Configuration validation failed:\n" + "\n".join(f"  - {e}" for e in errors)
        logger.error(error_msg)
        raise ValueError(error_msg)

    logger.info("Configuration loaded and validated successfully")
    return config


def create_default_config(output_path: Path) -> None:
    """
    Create a default configuration file.

    Args:
        output_path: Path to write the config file
    """
    try:
        import yaml
    except ImportError:
        raise ImportError("PyYAML not installed. Run: pip install pyyaml")

    with open(output_path, 'w') as f:
        yaml.dump(DEFAULTS, f, default_flow_style=False, sort_keys=False)

    logger.info(f"Default configuration written to: {output_path}")


# CLI support for configuration management
if __name__ == "__main__":
    import sys

    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python config.py create <output_path>  - Create default config")
        print("  python config.py validate <config_path> - Validate config")
        sys.exit(1)

    command = sys.argv[1]

    if command == "create" and len(sys.argv) >= 3:
        create_default_config(Path(sys.argv[2]))
    elif command == "validate" and len(sys.argv) >= 3:
        try:
            config = load_config(Path(sys.argv[2]))
            print("Configuration is valid!")
            print(f"  Inbox: {config.daemon.inbox_dir}")
            print(f"  Poll interval: {config.daemon.poll_interval}s")
            print(f"  PDF library: {config.pdf_extraction.library}")
        except ValueError as e:
            print(f"Validation failed: {e}")
            sys.exit(1)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
