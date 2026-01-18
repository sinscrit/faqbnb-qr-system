/**
 * Unit Tests for ItemCreationWorkflow Constants
 *
 * Tests the new step separation constants introduced in REQ-196.
 * Validates USER_VISIBLE_STEPS, POST_WORKFLOW_SCREENS, WORKFLOW_STEPS composition,
 * and PROGRESS_WEIGHTS values.
 *
 * @module ItemCreationWorkflow/utils/__tests__/constants.test
 * @vitest-environment jsdom
 * @created 2026-01-12 (REQ-196 Step Count Fix)
 */

import { describe, it, expect } from 'vitest';
import {
  USER_VISIBLE_STEPS,
  POST_WORKFLOW_SCREENS,
  WORKFLOW_STEPS,
  PROGRESS_WEIGHTS,
} from '../constants';
import type {
  UserVisibleStepConst,
  PostWorkflowScreenConst,
  WorkflowStepConst,
} from '../constants';

// =============================================================================
// USER_VISIBLE_STEPS Tests
// =============================================================================

describe('USER_VISIBLE_STEPS', () => {
  it('contains exactly 8 steps', () => {
    expect(USER_VISIBLE_STEPS).toHaveLength(8);
  });

  it('starts with room-selection', () => {
    expect(USER_VISIBLE_STEPS[0]).toBe('room-selection');
  });

  it('ends with preview-save', () => {
    expect(USER_VISIBLE_STEPS[USER_VISIBLE_STEPS.length - 1]).toBe('preview-save');
  });

  it('contains expected steps in correct order', () => {
    const expectedSteps = [
      'room-selection',
      'item-type-selection',
      'specific-item-selection',
      'purpose-selection',
      'content-type-selection',
      'media-capture',
      'content-creation',
      'preview-save',
    ];
    expect(USER_VISIBLE_STEPS).toEqual(expectedSteps);
  });

  it('does not contain post-workflow screens', () => {
    expect(USER_VISIBLE_STEPS).not.toContain('next-action');
    expect(USER_VISIBLE_STEPS).not.toContain('session-summary');
  });
});

// =============================================================================
// POST_WORKFLOW_SCREENS Tests
// =============================================================================

describe('POST_WORKFLOW_SCREENS', () => {
  it('contains exactly 2 screens', () => {
    expect(POST_WORKFLOW_SCREENS).toHaveLength(2);
  });

  it('contains next-action and session-summary', () => {
    expect(POST_WORKFLOW_SCREENS).toContain('next-action');
    expect(POST_WORKFLOW_SCREENS).toContain('session-summary');
  });

  it('has next-action first', () => {
    expect(POST_WORKFLOW_SCREENS[0]).toBe('next-action');
  });

  it('has session-summary last', () => {
    expect(POST_WORKFLOW_SCREENS[1]).toBe('session-summary');
  });
});

// =============================================================================
// WORKFLOW_STEPS Composition Tests
// =============================================================================

describe('WORKFLOW_STEPS composition', () => {
  it('contains exactly 10 steps', () => {
    expect(WORKFLOW_STEPS).toHaveLength(10);
  });

  it('equals spread of USER_VISIBLE_STEPS and POST_WORKFLOW_SCREENS', () => {
    const expected = [...USER_VISIBLE_STEPS, ...POST_WORKFLOW_SCREENS];
    expect(WORKFLOW_STEPS).toEqual(expected);
  });

  it('first 8 steps match USER_VISIBLE_STEPS', () => {
    const first8 = WORKFLOW_STEPS.slice(0, 8);
    expect(first8).toEqual([...USER_VISIBLE_STEPS]);
  });

  it('last 2 steps match POST_WORKFLOW_SCREENS', () => {
    const last2 = WORKFLOW_STEPS.slice(-2);
    expect(last2).toEqual([...POST_WORKFLOW_SCREENS]);
  });
});

// =============================================================================
// PROGRESS_WEIGHTS Tests
// =============================================================================

describe('PROGRESS_WEIGHTS', () => {
  it('has preview-save at 100%', () => {
    expect(PROGRESS_WEIGHTS['preview-save']).toBe(100);
  });

  it('has next-action at 100%', () => {
    expect(PROGRESS_WEIGHTS['next-action']).toBe(100);
  });

  it('has session-summary at 100%', () => {
    expect(PROGRESS_WEIGHTS['session-summary']).toBe(100);
  });

  it('has all weights as positive numbers', () => {
    Object.values(PROGRESS_WEIGHTS).forEach(weight => {
      expect(weight).toBeGreaterThan(0);
      expect(typeof weight).toBe('number');
    });
  });

  it('has user-visible step weights monotonically increasing', () => {
    const userVisibleWeights = USER_VISIBLE_STEPS.map(
      step => PROGRESS_WEIGHTS[step]
    );

    for (let i = 1; i < userVisibleWeights.length; i++) {
      expect(userVisibleWeights[i]).toBeGreaterThan(userVisibleWeights[i - 1]);
    }
  });

  it('covers all workflow steps', () => {
    WORKFLOW_STEPS.forEach(step => {
      expect(PROGRESS_WEIGHTS[step]).toBeDefined();
    });
  });
});

// =============================================================================
// Type Compatibility Tests
// =============================================================================

describe('Type compatibility', () => {
  it('USER_VISIBLE_STEPS items are valid WorkflowStep values', () => {
    USER_VISIBLE_STEPS.forEach(step => {
      expect(WORKFLOW_STEPS).toContain(step);
    });
  });

  it('POST_WORKFLOW_SCREENS items are valid WorkflowStep values', () => {
    POST_WORKFLOW_SCREENS.forEach(screen => {
      expect(WORKFLOW_STEPS).toContain(screen);
    });
  });
});
