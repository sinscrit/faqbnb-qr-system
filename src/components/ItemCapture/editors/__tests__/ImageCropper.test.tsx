/**
 * Integration tests for ImageCropper component
 *
 * @module ItemCapture/editors/__tests__/ImageCropper.test
 * @see docs/REQ-047-implement-imagecropper-detailed.md
 * @lastModified 2025-12-31
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageCropper from '../ImageCropper';
import type { AspectRatioPreset } from '../ImageCropper';

// =============================================================================
// Mocks
// =============================================================================

// Mock the CSS import
jest.mock('../imageCropper.css', () => ({}));

// Mock react-image-crop with a simplified implementation
jest.mock('react-image-crop', () => {
  const React = require('react');

  const ReactCrop = ({
    children,
    crop,
    onChange,
    onComplete,
    aspect,
    minWidth,
    minHeight,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    crop?: { x: number; y: number; width: number; height: number; unit: string };
    onChange: (crop: unknown) => void;
    onComplete: (crop: unknown) => void;
    aspect?: number;
    minWidth?: number;
    minHeight?: number;
    disabled?: boolean;
    className?: string;
  }) => {
    return (
      <div
        data-testid="react-crop"
        data-aspect={aspect}
        data-min-width={minWidth}
        data-min-height={minHeight}
        data-disabled={disabled}
        className={className}
        onClick={() => {
          if (!disabled) {
            const newCrop = { x: 10, y: 10, width: 100, height: 100, unit: 'px' };
            onChange(newCrop);
            onComplete(newCrop);
          }
        }}
      >
        {children}
      </div>
    );
  };

  const centerCrop = (crop: unknown) => crop;
  const makeAspectCrop = (crop: unknown) => crop;

  return {
    __esModule: true,
    default: ReactCrop,
    centerCrop,
    makeAspectCrop,
  };
});

// Mock cropUtils
jest.mock('../cropUtils', () => ({
  executeCrop: jest.fn().mockImplementation(() => {
    return Promise.resolve(
      new Blob(['cropped image data'], { type: 'image/jpeg' })
    );
  }),
  calculateScaleFactors: jest.fn().mockReturnValue({ scaleX: 1, scaleY: 1 }),
  isValidCrop: jest.fn().mockReturnValue(true),
}));

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a test image data URL
 */
function createTestImageUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 150;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(0, 0, 200, 150);
  return canvas.toDataURL('image/png');
}

const defaultProps = {
  imageSrc: createTestImageUrl(),
  onCropComplete: jest.fn(),
  onCancel: jest.fn(),
};

// =============================================================================
// Tests
// =============================================================================

describe('ImageCropper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset URL mock
    jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =============================================================================
  // Rendering Tests
  // =============================================================================

  describe('rendering', () => {
    it('renders image with ReactCrop', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByTestId('react-crop')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders with provided imageSrc', () => {
      const customSrc = 'https://example.com/test.jpg';
      render(<ImageCropper {...defaultProps} imageSrc={customSrc} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', customSrc);
    });

    it('applies custom className', () => {
      const { container } = render(
        <ImageCropper {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // =============================================================================
  // Aspect Ratio Toolbar Tests
  // =============================================================================

  describe('aspect ratio toolbar', () => {
    it('renders all four aspect ratio buttons', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByRole('button', { name: /free/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /1:1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /4:3/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /16:9/i })).toBeInTheDocument();
    });

    it('Free button is selected by default', () => {
      render(<ImageCropper {...defaultProps} />);

      const freeButton = screen.getByRole('button', { name: /free/i });
      expect(freeButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('selects initialAspectRatio when provided', () => {
      render(<ImageCropper {...defaultProps} initialAspectRatio="1:1" />);

      const squareButton = screen.getByRole('button', { name: /1:1/i });
      expect(squareButton).toHaveAttribute('aria-pressed', 'true');

      const freeButton = screen.getByRole('button', { name: /free/i });
      expect(freeButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('clicking aspect ratio button changes active state', async () => {
      const user = userEvent.setup();
      render(<ImageCropper {...defaultProps} />);

      const squareButton = screen.getByRole('button', { name: /1:1/i });
      await user.click(squareButton);

      expect(squareButton).toHaveAttribute('aria-pressed', 'true');
      expect(
        screen.getByRole('button', { name: /free/i })
      ).toHaveAttribute('aria-pressed', 'false');
    });

    it('all buttons have minimum 44x44px touch target', () => {
      render(<ImageCropper {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('min-w-[44px]');
        expect(button).toHaveClass('min-h-[44px]');
      });
    });
  });

  // =============================================================================
  // Cancel Button Tests
  // =============================================================================

  describe('cancel functionality', () => {
    it('renders Cancel button', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('calls onCancel when Cancel button is clicked', async () => {
      const onCancel = jest.fn();
      const user = userEvent.setup();
      render(<ImageCropper {...defaultProps} onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // =============================================================================
  // Apply Button Tests
  // =============================================================================

  describe('apply functionality', () => {
    it('renders Apply Crop button', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /apply crop/i })
      ).toBeInTheDocument();
    });

    it('Apply button is initially disabled (no crop selection)', () => {
      render(<ImageCropper {...defaultProps} />);

      const applyButton = screen.getByRole('button', { name: /apply crop/i });
      expect(applyButton).toBeDisabled();
    });

    it('Apply button becomes enabled after crop selection', async () => {
      render(<ImageCropper {...defaultProps} />);

      // Simulate a crop selection by clicking on ReactCrop area
      const reactCrop = screen.getByTestId('react-crop');
      fireEvent.click(reactCrop);

      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /apply crop/i });
        expect(applyButton).not.toBeDisabled();
      });
    });

    it('calls onCropComplete with Blob when Apply is clicked', async () => {
      const onCropComplete = jest.fn();
      const user = userEvent.setup();

      render(
        <ImageCropper {...defaultProps} onCropComplete={onCropComplete} />
      );

      // Trigger image load
      const img = screen.getByRole('img');
      fireEvent.load(img);

      // Simulate crop selection
      const reactCrop = screen.getByTestId('react-crop');
      fireEvent.click(reactCrop);

      // Wait for Apply button to be enabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply crop/i })).not.toBeDisabled();
      });

      // Click Apply
      await user.click(screen.getByRole('button', { name: /apply crop/i }));

      await waitFor(() => {
        expect(onCropComplete).toHaveBeenCalledWith(expect.any(Blob));
      });
    });

    it('shows "Applying..." text while processing', async () => {
      const onCropComplete = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => setTimeout(resolve, 100));
      });
      const user = userEvent.setup();

      render(
        <ImageCropper {...defaultProps} onCropComplete={onCropComplete} />
      );

      // Trigger load and selection
      fireEvent.load(screen.getByRole('img'));
      fireEvent.click(screen.getByTestId('react-crop'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply crop/i })).not.toBeDisabled();
      });

      // Click Apply
      await user.click(screen.getByRole('button', { name: /apply crop/i }));

      // Check for processing state
      expect(screen.getByText(/applying/i)).toBeInTheDocument();
    });
  });

  // =============================================================================
  // Disabled States Tests
  // =============================================================================

  describe('disabled states', () => {
    it('disables aspect ratio buttons during processing', async () => {
      // Set up a delayed mock to keep processing state
      const { executeCrop } = require('../cropUtils');
      executeCrop.mockImplementation(() => {
        return new Promise((resolve) => setTimeout(() => {
          resolve(new Blob(['data'], { type: 'image/jpeg' }));
        }, 200));
      });

      const user = userEvent.setup();
      render(<ImageCropper {...defaultProps} />);

      // Enable apply button
      fireEvent.load(screen.getByRole('img'));
      fireEvent.click(screen.getByTestId('react-crop'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply crop/i })).not.toBeDisabled();
      });

      // Start processing
      await user.click(screen.getByRole('button', { name: /apply crop/i }));

      // Check aspect buttons are disabled
      const aspectButtons = screen.getAllByRole('button').filter(
        (btn) => btn.textContent !== 'Cancel' && btn.textContent !== 'Applying...'
      );
      aspectButtons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });

    it('disables Cancel button during processing', async () => {
      const { executeCrop } = require('../cropUtils');
      executeCrop.mockImplementation(() => {
        return new Promise((resolve) => setTimeout(() => {
          resolve(new Blob(['data'], { type: 'image/jpeg' }));
        }, 200));
      });

      const user = userEvent.setup();
      render(<ImageCropper {...defaultProps} />);

      fireEvent.load(screen.getByRole('img'));
      fireEvent.click(screen.getByTestId('react-crop'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply crop/i })).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: /apply crop/i }));

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });

  // =============================================================================
  // Preview Tests
  // =============================================================================

  describe('preview section', () => {
    it('renders preview label', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });

    it('shows placeholder text when no crop selected', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(
        screen.getByText(/select area to preview/i)
      ).toBeInTheDocument();
    });
  });

  // =============================================================================
  // Error Handling Tests
  // =============================================================================

  describe('error handling', () => {
    it('displays error message when crop fails', async () => {
      const { executeCrop } = require('../cropUtils');
      executeCrop.mockRejectedValueOnce(new Error('Crop operation failed'));

      const user = userEvent.setup();
      render(<ImageCropper {...defaultProps} />);

      fireEvent.load(screen.getByRole('img'));
      fireEvent.click(screen.getByTestId('react-crop'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply crop/i })).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: /apply crop/i }));

      await waitFor(() => {
        expect(screen.getByText(/crop operation failed/i)).toBeInTheDocument();
      });
    });

    it('allows dismissing error message', async () => {
      const { executeCrop } = require('../cropUtils');
      executeCrop.mockRejectedValueOnce(new Error('Test error'));

      const user = userEvent.setup();
      render(<ImageCropper {...defaultProps} />);

      fireEvent.load(screen.getByRole('img'));
      fireEvent.click(screen.getByTestId('react-crop'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply crop/i })).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: /apply crop/i }));

      await waitFor(() => {
        expect(screen.getByText(/test error/i)).toBeInTheDocument();
      });

      // Click dismiss button
      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      await waitFor(() => {
        expect(screen.queryByText(/test error/i)).not.toBeInTheDocument();
      });
    });

    it('shows error when image fails to load', () => {
      render(<ImageCropper {...defaultProps} imageSrc="invalid-url" />);

      const img = screen.getByRole('img');
      fireEvent.error(img);

      expect(
        screen.getByText(/failed to load image/i)
      ).toBeInTheDocument();
    });
  });

  // =============================================================================
  // Loading State Tests
  // =============================================================================

  describe('loading states', () => {
    it('shows loading state before image loads', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByText(/loading image/i)).toBeInTheDocument();
    });

    it('hides loading state after image loads', () => {
      render(<ImageCropper {...defaultProps} />);

      const img = screen.getByRole('img');
      fireEvent.load(img);

      expect(screen.queryByText(/loading image/i)).not.toBeInTheDocument();
    });
  });

  // =============================================================================
  // Large Image Warning Tests
  // =============================================================================

  describe('large image handling', () => {
    it('shows warning for large images when image loads', () => {
      render(<ImageCropper {...defaultProps} />);

      const img = screen.getByRole('img');

      // Mock large dimensions
      Object.defineProperty(img, 'naturalWidth', {
        value: 5000,
        configurable: true,
      });
      Object.defineProperty(img, 'naturalHeight', {
        value: 4000,
        configurable: true,
      });

      fireEvent.load(img);

      expect(screen.getByText(/large image detected/i)).toBeInTheDocument();
    });
  });

  // =============================================================================
  // Accessibility Tests
  // =============================================================================

  describe('accessibility', () => {
    it('has aria-pressed on aspect ratio buttons', () => {
      render(<ImageCropper {...defaultProps} />);

      const buttons = [
        screen.getByRole('button', { name: /free/i }),
        screen.getByRole('button', { name: /1:1/i }),
        screen.getByRole('button', { name: /4:3/i }),
        screen.getByRole('button', { name: /16:9/i }),
      ];

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });

    it('has aria-label on dismiss error button', async () => {
      const { executeCrop } = require('../cropUtils');
      executeCrop.mockRejectedValueOnce(new Error('Test'));

      const user = userEvent.setup();
      render(<ImageCropper {...defaultProps} />);

      fireEvent.load(screen.getByRole('img'));
      fireEvent.click(screen.getByTestId('react-crop'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply crop/i })).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: /apply crop/i }));

      await waitFor(() => {
        const dismissButton = screen.getByRole('button', { name: /dismiss/i });
        expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss error');
      });
    });
  });

  // =============================================================================
  // Props Handling Tests
  // =============================================================================

  describe('props handling', () => {
    it('uses default outputFormat of image/jpeg', async () => {
      const { executeCrop } = require('../cropUtils');

      const user = userEvent.setup();
      render(<ImageCropper {...defaultProps} />);

      fireEvent.load(screen.getByRole('img'));
      fireEvent.click(screen.getByTestId('react-crop'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply crop/i })).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: /apply crop/i }));

      await waitFor(() => {
        expect(executeCrop).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          'image/jpeg',
          0.92
        );
      });
    });

    it('uses custom outputFormat when provided', async () => {
      const { executeCrop } = require('../cropUtils');

      const user = userEvent.setup();
      render(<ImageCropper {...defaultProps} outputFormat="image/png" />);

      fireEvent.load(screen.getByRole('img'));
      fireEvent.click(screen.getByTestId('react-crop'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply crop/i })).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: /apply crop/i }));

      await waitFor(() => {
        expect(executeCrop).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          'image/png',
          0.92
        );
      });
    });

    it('uses custom outputQuality when provided', async () => {
      const { executeCrop } = require('../cropUtils');

      const user = userEvent.setup();
      render(<ImageCropper {...defaultProps} outputQuality={0.8} />);

      fireEvent.load(screen.getByRole('img'));
      fireEvent.click(screen.getByTestId('react-crop'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply crop/i })).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: /apply crop/i }));

      await waitFor(() => {
        expect(executeCrop).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          'image/jpeg',
          0.8
        );
      });
    });

    it('passes minWidth to ReactCrop', () => {
      render(<ImageCropper {...defaultProps} minWidth={100} />);

      const reactCrop = screen.getByTestId('react-crop');
      expect(reactCrop).toHaveAttribute('data-min-width', '100');
    });

    it('passes minHeight to ReactCrop', () => {
      render(<ImageCropper {...defaultProps} minHeight={100} />);

      const reactCrop = screen.getByTestId('react-crop');
      expect(reactCrop).toHaveAttribute('data-min-height', '100');
    });
  });
});
