/**
 * Unit Tests for Trim Utilities
 *
 * Tests for time formatting, validation, and position calculation functions
 * used by the VideoTrimmer component.
 *
 * @module ItemCapture/editors/__tests__/trimUtils.test
 * @see docs/REQ-049-implement-videotrimmer-v1-simplified-detailed.md
 * @lastModified 2025-12-31 (REQ-049 Task 14)
 */

import {
  formatTime,
  parseTime,
  validateTrim,
  timeToPercent,
  percentToTime,
  clampMarkerPosition,
} from '../trimUtils';

// =============================================================================
// formatTime Tests
// =============================================================================

describe('formatTime', () => {
  it('formats 0 seconds correctly', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats seconds under 60', () => {
    expect(formatTime(45)).toBe('00:45');
  });

  it('formats single-digit seconds with padding', () => {
    expect(formatTime(5)).toBe('00:05');
  });

  it('formats minutes correctly', () => {
    expect(formatTime(65)).toBe('01:05');
  });

  it('formats multiple minutes correctly', () => {
    expect(formatTime(125)).toBe('02:05');
  });

  it('formats hours correctly', () => {
    expect(formatTime(3661)).toBe('1:01:01');
  });

  it('formats multi-hour videos correctly', () => {
    expect(formatTime(7322)).toBe('2:02:02');
  });

  it('handles negative numbers', () => {
    expect(formatTime(-10)).toBe('00:00');
  });

  it('handles NaN', () => {
    expect(formatTime(NaN)).toBe('00:00');
  });

  it('handles Infinity', () => {
    expect(formatTime(Infinity)).toBe('00:00');
  });

  it('handles negative Infinity', () => {
    expect(formatTime(-Infinity)).toBe('00:00');
  });

  it('truncates fractional seconds', () => {
    expect(formatTime(10.7)).toBe('00:10');
  });
});

// =============================================================================
// parseTime Tests
// =============================================================================

describe('parseTime', () => {
  it('parses MM:SS format', () => {
    expect(parseTime('01:30')).toBe(90);
  });

  it('parses MM:SS with zero minutes', () => {
    expect(parseTime('00:45')).toBe(45);
  });

  it('parses MM:SS with zero seconds', () => {
    expect(parseTime('02:00')).toBe(120);
  });

  it('parses HH:MM:SS format', () => {
    expect(parseTime('1:01:01')).toBe(3661);
  });

  it('parses HH:MM:SS with leading zeros', () => {
    expect(parseTime('01:01:01')).toBe(3661);
  });

  it('parses long hours', () => {
    expect(parseTime('10:30:00')).toBe(37800);
  });

  it('returns null for invalid format (no colon)', () => {
    expect(parseTime('invalid')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseTime('')).toBeNull();
  });

  it('returns null for single segment', () => {
    expect(parseTime('123')).toBeNull();
  });

  it('returns null for non-numeric segments', () => {
    expect(parseTime('ab:cd')).toBeNull();
  });

  it('returns null for too many segments', () => {
    expect(parseTime('1:2:3:4')).toBeNull();
  });
});

// =============================================================================
// validateTrim Tests
// =============================================================================

describe('validateTrim', () => {
  it('validates correct trim', () => {
    expect(validateTrim(0, 10, 60)).toEqual({ isValid: true });
  });

  it('validates trim spanning full video', () => {
    expect(validateTrim(0, 60, 60)).toEqual({ isValid: true });
  });

  it('validates trim in middle of video', () => {
    expect(validateTrim(10, 50, 60)).toEqual({ isValid: true });
  });

  it('rejects negative start time', () => {
    const result = validateTrim(-1, 10, 60);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('negative');
  });

  it('rejects end time exceeding duration', () => {
    const result = validateTrim(0, 70, 60);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('exceeds');
  });

  it('rejects start >= end (equal)', () => {
    const result = validateTrim(10, 10, 60);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('before');
  });

  it('rejects start > end', () => {
    const result = validateTrim(20, 10, 60);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('before');
  });

  it('rejects trim shorter than minimum duration', () => {
    const result = validateTrim(0, 0.5, 60, 1);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Minimum');
  });

  it('accepts trim exactly at minimum duration', () => {
    const result = validateTrim(0, 1, 60, 1);
    expect(result.isValid).toBe(true);
  });

  it('uses custom minimum duration', () => {
    const result = validateTrim(0, 4, 60, 5);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('5 seconds');
  });

  it('formats minimum duration message for singular second', () => {
    const result = validateTrim(0, 0.5, 60, 1);
    expect(result.error).toContain('1 second');
    expect(result.error).not.toContain('1 seconds');
  });

  it('formats minimum duration message for plural seconds', () => {
    const result = validateTrim(0, 1.5, 60, 2);
    expect(result.error).toContain('2 seconds');
  });
});

// =============================================================================
// timeToPercent Tests
// =============================================================================

describe('timeToPercent', () => {
  it('converts correctly at midpoint', () => {
    expect(timeToPercent(30, 60)).toBe(50);
  });

  it('converts at start', () => {
    expect(timeToPercent(0, 60)).toBe(0);
  });

  it('converts at end', () => {
    expect(timeToPercent(60, 60)).toBe(100);
  });

  it('converts quarter mark', () => {
    expect(timeToPercent(15, 60)).toBe(25);
  });

  it('handles zero duration', () => {
    expect(timeToPercent(30, 0)).toBe(0);
  });

  it('handles negative duration', () => {
    expect(timeToPercent(30, -10)).toBe(0);
  });

  it('clamps to 100 when time exceeds duration', () => {
    expect(timeToPercent(70, 60)).toBe(100);
  });

  it('clamps to 0 for negative time', () => {
    expect(timeToPercent(-10, 60)).toBe(0);
  });
});

// =============================================================================
// percentToTime Tests
// =============================================================================

describe('percentToTime', () => {
  it('converts correctly at midpoint', () => {
    expect(percentToTime(50, 60)).toBe(30);
  });

  it('converts at start', () => {
    expect(percentToTime(0, 60)).toBe(0);
  });

  it('converts at end', () => {
    expect(percentToTime(100, 60)).toBe(60);
  });

  it('converts quarter mark', () => {
    expect(percentToTime(25, 60)).toBe(15);
  });

  it('clamps to duration when percent exceeds 100', () => {
    expect(percentToTime(150, 60)).toBe(60);
  });

  it('clamps to 0 for negative percent', () => {
    expect(percentToTime(-10, 60)).toBe(0);
  });
});

// =============================================================================
// clampMarkerPosition Tests
// =============================================================================

describe('clampMarkerPosition', () => {
  const duration = 60;
  const minGap = 1;

  describe('start marker clamping', () => {
    it('clamps start marker to not exceed end minus minGap', () => {
      expect(clampMarkerPosition(15, 10, true, duration, minGap)).toBe(9);
    });

    it('allows start marker below end minus minGap', () => {
      expect(clampMarkerPosition(5, 10, true, duration, minGap)).toBe(5);
    });

    it('clamps start marker to not go below 0', () => {
      expect(clampMarkerPosition(-5, 10, true, duration, minGap)).toBe(0);
    });

    it('clamps start marker to not exceed duration', () => {
      expect(clampMarkerPosition(70, 60, true, duration, minGap)).toBe(59);
    });
  });

  describe('end marker clamping', () => {
    it('clamps end marker to not go below start plus minGap', () => {
      expect(clampMarkerPosition(5, 10, false, duration, minGap)).toBe(11);
    });

    it('allows end marker above start plus minGap', () => {
      expect(clampMarkerPosition(20, 10, false, duration, minGap)).toBe(20);
    });

    it('clamps end marker to not exceed duration', () => {
      expect(clampMarkerPosition(70, 50, false, duration, minGap)).toBe(60);
    });

    it('clamps end marker to not go below 0', () => {
      expect(clampMarkerPosition(-5, 0, false, duration, minGap)).toBe(1);
    });
  });

  describe('custom minGap', () => {
    it('respects larger minGap for start marker', () => {
      expect(clampMarkerPosition(48, 50, true, duration, 5)).toBe(45);
    });

    it('respects larger minGap for end marker', () => {
      expect(clampMarkerPosition(12, 10, false, duration, 5)).toBe(15);
    });
  });

  describe('edge cases', () => {
    it('handles markers at same position (start)', () => {
      expect(clampMarkerPosition(30, 30, true, duration, minGap)).toBe(29);
    });

    it('handles markers at same position (end)', () => {
      expect(clampMarkerPosition(30, 30, false, duration, minGap)).toBe(31);
    });

    it('handles very short video', () => {
      expect(clampMarkerPosition(5, 5, true, 10, 1)).toBe(4);
    });
  });
});
