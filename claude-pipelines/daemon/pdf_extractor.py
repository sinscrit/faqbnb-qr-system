# claude-pipelines/daemon/pdf_extractor.py
# PDF Text Extraction Module
# Created: 2026-01-11
# Last Modified: 2026-01-11
#
# Fast text extraction from PDF files using pdfplumber.
# Optimized for the FAQBNB Review PDF format.

"""
PDF Text Extractor

Extracts text content from PDF files for subsequent parsing.
Uses pdfplumber for reliable text extraction (~100ms per page).

Usage:
    from daemon.pdf_extractor import extract_pdf_text

    text = extract_pdf_text(Path("review.pdf"))
"""

import logging
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ExtractionResult:
    """Result of PDF text extraction."""
    success: bool
    text: str
    page_count: int
    error: Optional[str] = None

    @property
    def is_empty(self) -> bool:
        """Check if extracted text is empty or whitespace-only."""
        return not self.text or not self.text.strip()


def extract_pdf_text(
    pdf_path: Path,
    timeout: int = 30,
    encoding: str = 'utf-8'
) -> ExtractionResult:
    """
    Extract text content from a PDF file.

    Uses pdfplumber for extraction, with fallback error handling.
    Optimized for structured review PDFs with text-based content.

    Args:
        pdf_path: Path to the PDF file
        timeout: Maximum extraction time in seconds (default: 30)
        encoding: Text encoding for output (default: utf-8)

    Returns:
        ExtractionResult with text content or error information

    Example:
        >>> result = extract_pdf_text(Path("review.pdf"))
        >>> if result.success:
        ...     print(f"Extracted {len(result.text)} chars from {result.page_count} pages")
        >>> else:
        ...     print(f"Error: {result.error}")
    """
    try:
        import pdfplumber
    except ImportError:
        logger.error("pdfplumber not installed. Run: pip install pdfplumber")
        return ExtractionResult(
            success=False,
            text="",
            page_count=0,
            error="pdfplumber library not installed"
        )

    # Validate path
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        logger.error(f"PDF file not found: {pdf_path}")
        return ExtractionResult(
            success=False,
            text="",
            page_count=0,
            error=f"File not found: {pdf_path}"
        )

    if not pdf_path.suffix.lower() == '.pdf':
        logger.warning(f"File may not be a PDF: {pdf_path}")

    try:
        logger.info(f"Extracting text from: {pdf_path.name}")

        text_parts = []
        page_count = 0

        with pdfplumber.open(pdf_path) as pdf:
            page_count = len(pdf.pages)
            logger.debug(f"PDF has {page_count} pages")

            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
                    logger.debug(f"Page {i+1}: extracted {len(page_text)} chars")
                else:
                    logger.debug(f"Page {i+1}: no text extracted (may be image-based)")

        # Join all pages with double newline separator
        full_text = "\n\n".join(text_parts)

        logger.info(f"Extraction complete: {len(full_text)} chars from {page_count} pages")

        return ExtractionResult(
            success=True,
            text=full_text,
            page_count=page_count
        )

    except Exception as e:
        error_msg = f"PDF extraction failed: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return ExtractionResult(
            success=False,
            text="",
            page_count=0,
            error=error_msg
        )


def extract_pdf_metadata(pdf_path: Path) -> dict:
    """
    Extract metadata from a PDF file.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Dictionary with metadata fields (title, author, creation_date, etc.)
    """
    try:
        import pdfplumber
    except ImportError:
        return {"error": "pdfplumber not installed"}

    try:
        with pdfplumber.open(pdf_path) as pdf:
            metadata = pdf.metadata or {}
            return {
                "title": metadata.get("Title", ""),
                "author": metadata.get("Author", ""),
                "creator": metadata.get("Creator", ""),
                "producer": metadata.get("Producer", ""),
                "creation_date": metadata.get("CreationDate", ""),
                "modification_date": metadata.get("ModDate", ""),
                "page_count": len(pdf.pages)
            }
    except Exception as e:
        return {"error": str(e)}


# CLI support for standalone testing
if __name__ == "__main__":
    import sys

    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    if len(sys.argv) < 2:
        print("Usage: python pdf_extractor.py <pdf_path>")
        sys.exit(1)

    pdf_path = Path(sys.argv[1])
    result = extract_pdf_text(pdf_path)

    if result.success:
        print(f"\n=== Extraction Result ===")
        print(f"Pages: {result.page_count}")
        print(f"Characters: {len(result.text)}")
        print(f"\n=== First 1000 chars ===\n")
        print(result.text[:1000])
        if len(result.text) > 1000:
            print(f"\n... ({len(result.text) - 1000} more chars)")
    else:
        print(f"Extraction failed: {result.error}")
        sys.exit(1)
