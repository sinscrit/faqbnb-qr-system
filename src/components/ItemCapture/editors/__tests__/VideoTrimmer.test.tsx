/**
 * Integration Tests for VideoTrimmer Component
 *
 * Tests for the VideoTrimmer component's rendering, user interactions,
 * and callback invocations.
 *
 * @module ItemCapture/editors/__tests__/VideoTrimmer.test
 * @see docs/REQ-049-implement-videotrimmer-v1-simplified-detailed.md
 * @lastModified 2025-12-31 (REQ-049 Task 15)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VideoTrimmer, { TrimDescriptor } from '../VideoTrimmer';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock video element methods
beforeAll(() => {
  // Mock duration
  Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
    get() {
      return 60; // 60 second video
    },
  });

  // Mock play
  HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);

  // Mock pause
  HTMLMediaElement.prototype.pause = jest.fn();

  // Mock currentTime setter
  let _currentTime = 0;
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
    get() {
      return _currentTime;
    },
    set(value: number) {
      _currentTime = value;
    },
  });

  // Mock load
  HTMLMediaElement.prototype.load = jest.fn();
});

// =============================================================================
// Rendering Tests
// =============================================================================

describe('VideoTrimmer rendering', () => {
  it('renders with video element', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText(/loading video/i)).toBeInTheDocument();
  });

  it('renders Cancel button', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders Apply Trim button', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /apply trim/i })).toBeInTheDocument();
  });

  it('Apply button is disabled when not loaded', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /apply trim/i })).toBeDisabled();
  });

  it('renders playback control buttons', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByLabelText(/skip to start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/skip to end/i)).toBeInTheDocument();
  });

  it('renders debug info when debug prop is true', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
        debug={true}
      />
    );
    const pre = document.querySelector('pre');
    expect(pre).toBeInTheDocument();
  });

  it('does not render debug info when debug prop is false', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
        debug={false}
      />
    );
    const pre = document.querySelector('pre');
    expect(pre).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
        className="custom-class"
      />
    );
    // Check that custom class is applied to container
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });
});

// =============================================================================
// Callback Tests
// =============================================================================

describe('VideoTrimmer callbacks', () => {
  it('calls onCancel when Cancel button clicked', () => {
    const onCancel = jest.fn();
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel on Escape key press', () => {
    const onCancel = jest.fn();
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// Video Metadata Loading Tests
// =============================================================================

describe('VideoTrimmer metadata loading', () => {
  it('updates state when video metadata loads', async () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;

    // Simulate metadata loaded
    fireEvent.loadedMetadata(video);

    await waitFor(() => {
      expect(screen.queryByText(/loading video/i)).not.toBeInTheDocument();
    });
  });

  it('enables Apply button after metadata loads', async () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.loadedMetadata(video);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /apply trim/i })).not.toBeDisabled();
    });
  });
});

// =============================================================================
// Playback Control Tests
// =============================================================================

describe('VideoTrimmer playback controls', () => {
  it('playback controls are disabled when video not loaded', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByLabelText(/skip to start/i)).toBeDisabled();
    expect(screen.getByLabelText(/play/i)).toBeDisabled();
    expect(screen.getByLabelText(/skip to end/i)).toBeDisabled();
  });

  it('playback controls are enabled after metadata loads', async () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.loadedMetadata(video);

    await waitFor(() => {
      expect(screen.getByLabelText(/skip to start/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/play/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/skip to end/i)).not.toBeDisabled();
    });
  });

  it('clicking play button calls video.play()', async () => {
    const playSpy = jest.spyOn(HTMLMediaElement.prototype, 'play');

    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.loadedMetadata(video);

    await waitFor(() => {
      expect(screen.getByLabelText(/play/i)).not.toBeDisabled();
    });

    fireEvent.click(screen.getByLabelText(/play/i));
    expect(playSpy).toHaveBeenCalled();
  });
});

// =============================================================================
// Initial Trim Tests
// =============================================================================

describe('VideoTrimmer initial trim', () => {
  it('uses initialTrim prop when provided', async () => {
    const initialTrim: TrimDescriptor = {
      startTime: 10,
      endTime: 50,
      originalDuration: 60,
    };

    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
        initialTrim={initialTrim}
        debug={true}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.loadedMetadata(video);

    await waitFor(() => {
      const pre = document.querySelector('pre');
      expect(pre).toBeInTheDocument();
      const debugState = JSON.parse(pre!.textContent || '{}');
      expect(debugState.startMarker).toBe(10);
      expect(debugState.endMarker).toBe(50);
    });
  });
});

// =============================================================================
// Error Handling Tests
// =============================================================================

describe('VideoTrimmer error handling', () => {
  it('shows error message when video fails to load', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.error(video);

    expect(screen.getByText(/failed to load video/i)).toBeInTheDocument();
  });

  it('shows retry button on error', () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.error(video);

    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });
});

// =============================================================================
// ARIA Accessibility Tests
// =============================================================================

describe('VideoTrimmer accessibility', () => {
  it('has correct ARIA labels on markers after load', async () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.loadedMetadata(video);

    await waitFor(() => {
      const startSlider = screen.getByLabelText(/start trim point/i);
      const endSlider = screen.getByLabelText(/end trim point/i);

      expect(startSlider).toHaveAttribute('role', 'slider');
      expect(endSlider).toHaveAttribute('role', 'slider');
    });
  });

  it('has tabIndex on markers for keyboard focus', async () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.loadedMetadata(video);

    await waitFor(() => {
      const startSlider = screen.getByLabelText(/start trim point/i);
      const endSlider = screen.getByLabelText(/end trim point/i);

      expect(startSlider).toHaveAttribute('tabIndex', '0');
      expect(endSlider).toHaveAttribute('tabIndex', '0');
    });
  });
});

// =============================================================================
// Duration Display Tests
// =============================================================================

describe('VideoTrimmer duration display', () => {
  it('displays duration info after metadata loads', async () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.loadedMetadata(video);

    await waitFor(() => {
      // Check that duration is displayed (60 seconds = 01:00)
      expect(screen.getByText(/01:00/)).toBeInTheDocument();
    });
  });

  it('displays current position', async () => {
    render(
      <VideoTrimmer
        videoSrc="test.mp4"
        onTrimComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.loadedMetadata(video);

    await waitFor(() => {
      expect(screen.getByText(/current/i)).toBeInTheDocument();
    });
  });
});
