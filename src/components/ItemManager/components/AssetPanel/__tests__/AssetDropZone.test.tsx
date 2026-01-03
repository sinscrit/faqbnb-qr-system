/**
 * AssetDropZone Component Tests
 *
 * Unit tests for the AssetDropZone drag-and-drop file upload component.
 *
 * @see docs/REQ-083-implement-assetdropzone-detailed.md
 * @lastModified 2026-01-03 (REQ-083 Task 11 - Unit tests)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssetDropZone, AssetDropZoneProps } from '../AssetDropZone';

// =============================================================================
// Test Utilities
// =============================================================================

const defaultProps: AssetDropZoneProps = {
  onFilesSelected: jest.fn(),
};

function renderDropZone(props: Partial<AssetDropZoneProps> = {}) {
  const finalProps = { ...defaultProps, ...props };
  return render(<AssetDropZone {...finalProps} />);
}

function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const file = new File(['x'.repeat(size)], name, { type });
  return file;
}

function createDataTransfer(files: File[]): DataTransfer {
  const dataTransfer = {
    files,
    items: files.map((file) => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
    })),
    types: ['Files'],
    dropEffect: 'none' as DataTransfer['dropEffect'],
    effectAllowed: 'all' as DataTransfer['effectAllowed'],
    setData: jest.fn(),
    getData: jest.fn(),
    clearData: jest.fn(),
    setDragImage: jest.fn(),
  };
  return dataTransfer as unknown as DataTransfer;
}

// =============================================================================
// Tests
// =============================================================================

describe('AssetDropZone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders with default props', () => {
      renderDropZone();

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Drag files here or click to browse')).toBeInTheDocument();
    });

    it('shows empty state instructional text', () => {
      renderDropZone();

      expect(screen.getByText('Supports images, videos, PDFs')).toBeInTheDocument();
      expect(screen.getByText(/Max .* per file/)).toBeInTheDocument();
    });

    it('renders in compact mode with reduced height', () => {
      renderDropZone({ compact: true });

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveClass('min-h-[80px]');
      expect(dropZone).not.toHaveClass('min-h-[140px]');
    });

    it('hides secondary text in compact mode', () => {
      renderDropZone({ compact: true });

      expect(screen.queryByText('Supports images, videos, PDFs')).not.toBeInTheDocument();
      expect(screen.queryByText(/Max .* per file/)).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Disabled State Tests
  // ===========================================================================

  describe('Disabled State', () => {
    it('applies disabled styling', () => {
      renderDropZone({ disabled: true });

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveAttribute('aria-disabled', 'true');
      expect(dropZone).toHaveClass('opacity-50');
      expect(dropZone).toHaveClass('pointer-events-none');
    });

    it('prevents interaction when disabled', () => {
      const onFilesSelected = jest.fn();
      renderDropZone({ disabled: true, onFilesSelected });

      const dropZone = screen.getByRole('button');
      fireEvent.click(dropZone);

      // The file picker shouldn't open when disabled
      expect(dropZone).toHaveClass('pointer-events-none');
    });
  });

  // ===========================================================================
  // Keyboard Accessibility Tests
  // ===========================================================================

  describe('Keyboard Accessibility', () => {
    it('has correct ARIA attributes', () => {
      renderDropZone();

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveAttribute('role', 'button');
      expect(dropZone).toHaveAttribute('tabIndex', '0');
      expect(dropZone).toHaveAttribute('aria-label', 'Drop files here or click to select');
    });

    it('focuses drop zone on Tab', async () => {
      const user = userEvent.setup();
      renderDropZone();

      await user.tab();

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveFocus();
    });

    it('has visible focus ring', () => {
      renderDropZone();

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveClass('focus:ring-2');
      expect(dropZone).toHaveClass('focus:ring-blue-500');
    });
  });

  // ===========================================================================
  // Drag and Drop Tests
  // ===========================================================================

  describe('Drag and Drop', () => {
    it('shows valid drag state for allowed file types', () => {
      renderDropZone();

      const dropZone = screen.getByRole('button');
      const imageFile = createMockFile('test.jpg', 1000, 'image/jpeg');
      const dataTransfer = createDataTransfer([imageFile]);

      fireEvent.dragEnter(dropZone, { dataTransfer });

      expect(screen.getByText('Drop files here')).toBeInTheDocument();
      expect(dropZone).toHaveClass('border-blue-500');
      expect(dropZone).toHaveClass('bg-blue-50');
    });

    it('shows invalid drag state for disallowed file types', () => {
      renderDropZone({ allowedMediaTypes: ['image'] });

      const dropZone = screen.getByRole('button');
      const textFile = createMockFile('test.txt', 1000, 'text/plain');
      const dataTransfer = createDataTransfer([textFile]);

      fireEvent.dragEnter(dropZone, { dataTransfer });

      expect(screen.getByText('Invalid file type')).toBeInTheDocument();
      expect(dropZone).toHaveClass('border-red-500');
      expect(dropZone).toHaveClass('bg-red-50');
    });

    it('resets state when drag leaves', () => {
      renderDropZone();

      const dropZone = screen.getByRole('button');
      const imageFile = createMockFile('test.jpg', 1000, 'image/jpeg');
      const dataTransfer = createDataTransfer([imageFile]);

      fireEvent.dragEnter(dropZone, { dataTransfer });
      expect(screen.getByText('Drop files here')).toBeInTheDocument();

      fireEvent.dragLeave(dropZone);
      expect(screen.queryByText('Drop files here')).not.toBeInTheDocument();
      expect(screen.getByText('Drag files here or click to browse')).toBeInTheDocument();
    });

    it('calls onFilesSelected with valid files on drop', async () => {
      const onFilesSelected = jest.fn();
      renderDropZone({ onFilesSelected });

      const dropZone = screen.getByRole('button');
      const imageFile = createMockFile('test.jpg', 1000, 'image/jpeg');
      const dataTransfer = createDataTransfer([imageFile]);

      fireEvent.dragEnter(dropZone, { dataTransfer });
      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'test.jpg' })
          ])
        );
      });
    });
  });

  // ===========================================================================
  // File Type Validation Tests
  // ===========================================================================

  describe('File Type Validation', () => {
    it('accepts images when allowedMediaTypes includes image', async () => {
      const onFilesSelected = jest.fn();
      renderDropZone({ allowedMediaTypes: ['image'], onFilesSelected });

      const dropZone = screen.getByRole('button');
      const imageFile = createMockFile('test.png', 1000, 'image/png');
      const dataTransfer = createDataTransfer([imageFile]);

      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalled();
      });
    });

    it('accepts videos when allowedMediaTypes includes video', async () => {
      const onFilesSelected = jest.fn();
      renderDropZone({ allowedMediaTypes: ['video'], onFilesSelected });

      const dropZone = screen.getByRole('button');
      const videoFile = createMockFile('test.mp4', 1000, 'video/mp4');
      const dataTransfer = createDataTransfer([videoFile]);

      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalled();
      });
    });

    it('accepts PDFs when allowedMediaTypes includes pdf', async () => {
      const onFilesSelected = jest.fn();
      renderDropZone({ allowedMediaTypes: ['pdf'], onFilesSelected });

      const dropZone = screen.getByRole('button');
      const pdfFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const dataTransfer = createDataTransfer([pdfFile]);

      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalled();
      });
    });

    it('shows correct supported types label for images only', () => {
      renderDropZone({ allowedMediaTypes: ['image'] });

      expect(screen.getByText('Supports images')).toBeInTheDocument();
    });

    it('shows correct supported types label for videos only', () => {
      renderDropZone({ allowedMediaTypes: ['video'] });

      expect(screen.getByText('Supports videos')).toBeInTheDocument();
    });

    it('shows correct supported types label for multiple types', () => {
      renderDropZone({ allowedMediaTypes: ['image', 'pdf'] });

      expect(screen.getByText('Supports images, PDFs')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // File Size Validation Tests
  // ===========================================================================

  describe('File Size Validation', () => {
    it('displays correct max file size', () => {
      renderDropZone({ maxFileSize: 50 * 1024 * 1024 }); // 50MB

      expect(screen.getByText('Max 50 MB per file')).toBeInTheDocument();
    });

    it('displays smaller file sizes correctly', () => {
      renderDropZone({ maxFileSize: 1 * 1024 * 1024 }); // 1MB

      expect(screen.getByText('Max 1 MB per file')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Screen Reader Announcements Tests
  // ===========================================================================

  describe('Screen Reader Announcements', () => {
    it('has aria-live region for announcements', () => {
      renderDropZone();

      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('announces valid drag state', () => {
      renderDropZone();

      const dropZone = screen.getByRole('button');
      const imageFile = createMockFile('test.jpg', 1000, 'image/jpeg');
      const dataTransfer = createDataTransfer([imageFile]);

      fireEvent.dragEnter(dropZone, { dataTransfer });

      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('Drop zone active. Release to upload files.');
    });

    it('announces invalid drag state', () => {
      renderDropZone({ allowedMediaTypes: ['image'] });

      const dropZone = screen.getByRole('button');
      const textFile = createMockFile('test.txt', 1000, 'text/plain');
      const dataTransfer = createDataTransfer([textFile]);

      fireEvent.dragEnter(dropZone, { dataTransfer });

      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('Invalid file type. Cannot drop this file.');
    });
  });

  // ===========================================================================
  // className Prop Tests
  // ===========================================================================

  describe('className Prop', () => {
    it('applies additional className', () => {
      const { container } = renderDropZone({ className: 'custom-class' });

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });
});
