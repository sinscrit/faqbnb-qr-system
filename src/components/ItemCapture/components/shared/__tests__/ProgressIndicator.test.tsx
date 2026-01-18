/**
 * ProgressIndicator Unit Tests
 *
 * Tests for the ProgressIndicator component, STEP_TO_STAGE_INDEX mapping,
 * and getCurrentStageIndex function.
 *
 * @module ItemCapture/components/shared/__tests__/ProgressIndicator.test
 * @lastModified 2026-01-12 (REQ-188: Added tests for 'whats-next' step handling)
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  ProgressIndicator,
  STEP_TO_STAGE_INDEX,
  getCurrentStageIndex,
  PROGRESS_STAGES,
} from '../ProgressIndicator';
import type { WizardStep } from '../../../ItemCapture.types';

describe('ProgressIndicator', () => {
  describe('STEP_TO_STAGE_INDEX', () => {
    it('should map whats-next to -1 (post-workflow)', () => {
      expect(STEP_TO_STAGE_INDEX['whats-next']).toBe(-1);
    });

    it('should map review to 3 (final visible stage)', () => {
      expect(STEP_TO_STAGE_INDEX['review']).toBe(3);
    });

    it('should have mappings for all WizardStep values', () => {
      const allSteps: WizardStep[] = [
        'metadata',
        'content-type',
        'capture-video',
        'capture-photo',
        'upload-file',
        'write-text',
        'add-url',
        'edit-media',
        'add-more',
        'review',
        'whats-next',
      ];

      allSteps.forEach((step) => {
        expect(STEP_TO_STAGE_INDEX[step]).toBeDefined();
      });
    });

    it('should map metadata to 0 (first stage)', () => {
      expect(STEP_TO_STAGE_INDEX['metadata']).toBe(0);
    });

    it('should map content capture steps to 1', () => {
      expect(STEP_TO_STAGE_INDEX['content-type']).toBe(1);
      expect(STEP_TO_STAGE_INDEX['capture-video']).toBe(1);
      expect(STEP_TO_STAGE_INDEX['capture-photo']).toBe(1);
      expect(STEP_TO_STAGE_INDEX['upload-file']).toBe(1);
      expect(STEP_TO_STAGE_INDEX['write-text']).toBe(1);
      expect(STEP_TO_STAGE_INDEX['add-url']).toBe(1);
      expect(STEP_TO_STAGE_INDEX['add-more']).toBe(1);
    });

    it('should map edit-media to 2', () => {
      expect(STEP_TO_STAGE_INDEX['edit-media']).toBe(2);
    });
  });

  describe('getCurrentStageIndex', () => {
    it('should return -1 for whats-next step', () => {
      expect(getCurrentStageIndex('whats-next')).toBe(-1);
    });

    it('should return 0-3 for workflow steps', () => {
      expect(getCurrentStageIndex('metadata')).toBe(0);
      expect(getCurrentStageIndex('content-type')).toBe(1);
      expect(getCurrentStageIndex('edit-media')).toBe(2);
      expect(getCurrentStageIndex('review')).toBe(3);
    });
  });

  describe('ProgressIndicator component', () => {
    it('should return null when currentStep is whats-next', () => {
      const { container } = render(
        <ProgressIndicator currentStep="whats-next" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render progress for review step', () => {
      const { container } = render(
        <ProgressIndicator currentStep="review" />
      );
      expect(container.firstChild).not.toBeNull();
    });

    it('should show Step 4 of 4 for review step on mobile', () => {
      const { getByText } = render(
        <ProgressIndicator currentStep="review" />
      );
      expect(getByText(/Step 4 of 4/)).toBeInTheDocument();
    });

    it('should render progress for metadata step', () => {
      const { getByText } = render(
        <ProgressIndicator currentStep="metadata" />
      );
      expect(getByText(/Step 1 of 4/)).toBeInTheDocument();
    });

    it('should render progress for content-type step', () => {
      const { getByText } = render(
        <ProgressIndicator currentStep="content-type" />
      );
      expect(getByText(/Step 2 of 4/)).toBeInTheDocument();
    });

    it('should render progress for edit-media step', () => {
      const { getByText } = render(
        <ProgressIndicator currentStep="edit-media" />
      );
      expect(getByText(/Step 3 of 4/)).toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <ProgressIndicator currentStep="review" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('PROGRESS_STAGES', () => {
    it('should have exactly 4 stages', () => {
      expect(PROGRESS_STAGES.length).toBe(4);
    });

    it('should have Review as the final stage', () => {
      expect(PROGRESS_STAGES[3].id).toBe('review');
      expect(PROGRESS_STAGES[3].label).toBe('Review');
    });

    it('should have Details as the first stage', () => {
      expect(PROGRESS_STAGES[0].id).toBe('details');
      expect(PROGRESS_STAGES[0].label).toBe('Details');
    });

    it('should have correct stage order', () => {
      expect(PROGRESS_STAGES[0].id).toBe('details');
      expect(PROGRESS_STAGES[1].id).toBe('content');
      expect(PROGRESS_STAGES[2].id).toBe('edit');
      expect(PROGRESS_STAGES[3].id).toBe('review');
    });
  });
});
