# claude-pipelines/daemon/__init__.py
# PDF Pipeline Daemon Package
# Created: 2026-01-11
# Last Modified: 2026-01-11
#
# Daemon system for automated PDF → Pipeline processing

from .pdf_extractor import extract_pdf_text
from .config import DaemonConfig, load_config
from .state import DaemonState, load_state, save_state

__all__ = [
    'extract_pdf_text',
    'DaemonConfig',
    'load_config',
    'DaemonState',
    'load_state',
    'save_state',
]

__version__ = '0.1.0'
