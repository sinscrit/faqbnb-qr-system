/**
 * ItemCapture Hooks - Barrel Export
 *
 * This file exports all hooks for the ItemCapture component.
 *
 * @module ItemCapture/hooks
 * @lastModified 2025-12-31 (REQ-043)
 */

export {
  useItemCaptureState,
  createInitialState,
  validateMetadata,
  canSubmitState,
  getNextStep,
  validateStepTransition,
  STEP_TRANSITIONS,
  type UseItemCaptureStateReturn,
} from './useItemCaptureState';

export { useMediaCapture } from './useMediaCapture';

export { useFileUpload } from './useFileUpload';

export { usePDFThumbnail, type PDFThumbnailState } from './usePDFThumbnail';
