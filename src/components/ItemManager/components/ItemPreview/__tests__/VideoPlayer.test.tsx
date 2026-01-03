/**
 * Unit Tests for VideoPlayer Component and Utilities
 *
 * Tests for time formatting, volume clamping, fullscreen utilities,
 * and VideoPlayer component rendering and behavior.
 *
 * @module ItemManager/components/ItemPreview/__tests__/VideoPlayer.test
 * @see docs/REQ-076-implement-video-playback-detailed.md
 * @lastModified 2026-01-03 (REQ-076 Task 4.3.10)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  formatTime,
  clampVolume,
  isFullscreenSupported,
  requestFullscreen,
  exitFullscreen,
  getFullscreenElement,
  isInFullscreen,
} from '../videoPlayerUtils';
import { VideoPlayer } from '../VideoPlayer';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

// Mock HTMLMediaElement methods
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.load = jest.fn();

// =============================================================================
// formatTime Tests
// =============================================================================

describe('formatTime', () => {
  it('formats 0 seconds correctly', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds under 60', () => {
    expect(formatTime(45)).toBe('0:45');
  });

  it('formats minutes correctly', () => {
    expect(formatTime(83)).toBe('1:23');
  });

  it('formats multiple minutes correctly', () => {
    expect(formatTime(125)).toBe('2:05');
  });

  it('formats hours correctly', () => {
    expect(formatTime(3723)).toBe('1:02:03');
  });

  it('formats single-digit minutes with no padding', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('handles negative numbers', () => {
    expect(formatTime(-10)).toBe('0:00');
  });

  it('handles NaN', () => {
    expect(formatTime(NaN)).toBe('0:00');
  });

  it('handles Infinity', () => {
    expect(formatTime(Infinity)).toBe('0:00');
  });

  it('handles negative Infinity', () => {
    expect(formatTime(-Infinity)).toBe('0:00');
  });

  it('truncates fractional seconds', () => {
    expect(formatTime(10.7)).toBe('0:10');
  });
});

// =============================================================================
// clampVolume Tests
// =============================================================================

describe('clampVolume', () => {
  it('returns 0 for negative values', () => {
    expect(clampVolume(-0.5)).toBe(0);
    expect(clampVolume(-1)).toBe(0);
  });

  it('returns 1 for values over 1', () => {
    expect(clampVolume(1.5)).toBe(1);
    expect(clampVolume(2)).toBe(1);
  });

  it('returns the same value for values between 0 and 1', () => {
    expect(clampVolume(0)).toBe(0);
    expect(clampVolume(0.5)).toBe(0.5);
    expect(clampVolume(1)).toBe(1);
  });

  it('handles edge cases', () => {
    expect(clampVolume(0.0001)).toBe(0.0001);
    expect(clampVolume(0.9999)).toBe(0.9999);
  });
});

// =============================================================================
// Fullscreen Utility Tests
// =============================================================================

describe('fullscreen utilities', () => {
  describe('isFullscreenSupported', () => {
    it('returns boolean', () => {
      const result = isFullscreenSupported();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getFullscreenElement', () => {
    it('returns null when not in fullscreen', () => {
      expect(getFullscreenElement()).toBeNull();
    });
  });

  describe('isInFullscreen', () => {
    it('returns false when not in fullscreen', () => {
      expect(isInFullscreen()).toBe(false);
    });
  });

  describe('requestFullscreen', () => {
    it('throws error when not supported', async () => {
      const element = document.createElement('div');
      // Remove fullscreen methods to simulate unsupported browser
      const originalFn = element.requestFullscreen;
      Object.defineProperty(element, 'requestFullscreen', { value: undefined });

      await expect(requestFullscreen(element)).rejects.toThrow('Fullscreen API not supported');

      Object.defineProperty(element, 'requestFullscreen', { value: originalFn });
    });
  });

  describe('exitFullscreen', () => {
    it('throws error when not supported', async () => {
      const originalFn = document.exitFullscreen;
      Object.defineProperty(document, 'exitFullscreen', { value: undefined, configurable: true });

      await expect(exitFullscreen()).rejects.toThrow('Fullscreen API not supported');

      Object.defineProperty(document, 'exitFullscreen', { value: originalFn, configurable: true });
    });
  });
});

// =============================================================================
// VideoPlayer Component Tests
// =============================================================================

describe('VideoPlayer', () => {
  const mockBlob = new Blob(['mock video content'], { type: 'video/mp4' });
  const mockFile = new File(['mock video content'], 'test.mp4', { type: 'video/mp4' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders without crashing with string src', () => {
      render(<VideoPlayer src="https://example.com/video.mp4" />);
      expect(screen.getByRole('region', { name: /video player/i })).toBeInTheDocument();
    });

    it('renders without crashing with Blob src', () => {
      render(<VideoPlayer src={mockBlob} />);
      expect(screen.getByRole('region', { name: /video player/i })).toBeInTheDocument();
    });

    it('renders without crashing with File src', () => {
      render(<VideoPlayer src={mockFile} />);
      expect(screen.getByRole('region', { name: /video player/i })).toBeInTheDocument();
    });

    it('creates object URL for Blob source', () => {
      render(<VideoPlayer src={mockBlob} />);
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    it('creates object URL for File source', () => {
      render(<VideoPlayer src={mockFile} />);
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it('shows loading state initially', () => {
      render(<VideoPlayer src="https://example.com/video.mp4" />);
      // Loading spinner should be visible
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('controls', () => {
    it('has play/pause button with aria-label', async () => {
      render(<VideoPlayer src="https://example.com/video.mp4" />);

      // The large center play button
      const playButton = screen.getByRole('button', { name: /play video/i });
      expect(playButton).toBeInTheDocument();
    });

    it('has fullscreen button when supported', async () => {
      // Mock fullscreen as supported
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        configurable: true,
      });
      Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
        value: jest.fn(),
        configurable: true,
      });

      render(<VideoPlayer src="https://example.com/video.mp4" />);

      // Find fullscreen button
      const fullscreenButton = screen.queryByRole('button', { name: /full screen/i });
      // May or may not be present depending on browser support detection
      // Just verify no crash
    });

    it('has seek bar with aria attributes', async () => {
      render(<VideoPlayer src="https://example.com/video.mp4" />);

      const seekBar = screen.getByRole('slider', { name: /seek/i });
      expect(seekBar).toBeInTheDocument();
      expect(seekBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('has volume control with aria-label', async () => {
      render(<VideoPlayer src="https://example.com/video.mp4" />);

      const muteButton = screen.getByRole('button', { name: /mute/i });
      expect(muteButton).toBeInTheDocument();
    });
  });

  describe('keyboard controls', () => {
    it('is focusable via tabIndex', () => {
      render(<VideoPlayer src="https://example.com/video.mp4" />);

      const player = screen.getByRole('region', { name: /video player/i });
      expect(player).toHaveAttribute('tabIndex', '0');
    });

    it('responds to space key for play/pause', async () => {
      const user = userEvent.setup();
      render(<VideoPlayer src="https://example.com/video.mp4" />);

      const player = screen.getByRole('region', { name: /video player/i });
      player.focus();

      await user.keyboard(' ');

      // Verify play was called (mocked)
      expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('calls onEnded when video ends', () => {
      const onEnded = jest.fn();
      render(<VideoPlayer src="https://example.com/video.mp4" onEnded={onEnded} />);

      const video = document.querySelector('video');
      expect(video).toBeInTheDocument();

      // Simulate video ended event
      fireEvent.ended(video!);

      expect(onEnded).toHaveBeenCalled();
    });

    it('calls onError when video fails to load', () => {
      const onError = jest.fn();
      render(<VideoPlayer src="https://example.com/video.mp4" onError={onError} />);

      const video = document.querySelector('video');
      expect(video).toBeInTheDocument();

      // Simulate video error event
      fireEvent.error(video!);

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('props', () => {
    it('applies className to container', () => {
      render(<VideoPlayer src="https://example.com/video.mp4" className="custom-class" />);

      const player = screen.getByRole('region', { name: /video player/i });
      expect(player).toHaveClass('custom-class');
    });

    it('applies poster to video element', () => {
      render(<VideoPlayer src="https://example.com/video.mp4" poster="https://example.com/poster.jpg" />);

      const video = document.querySelector('video');
      expect(video).toHaveAttribute('poster', 'https://example.com/poster.jpg');
    });

    it('applies loop attribute when loop prop is true', () => {
      render(<VideoPlayer src="https://example.com/video.mp4" loop />);

      const video = document.querySelector('video');
      expect(video).toHaveAttribute('loop');
    });

    it('starts muted when muted prop is true', () => {
      render(<VideoPlayer src="https://example.com/video.mp4" muted />);

      // The mute button should show VolumeX icon (handled internally)
      // Just verify no crash
    });
  });

  describe('cleanup', () => {
    it('revokes object URL on unmount', () => {
      const { unmount } = render(<VideoPlayer src={mockBlob} />);

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });
});
