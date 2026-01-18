/**
 * ItemCapture Hooks - Barrel Export
 *
 * This file exports all hooks for the ItemCapture component.
 *
 * @module ItemCapture/hooks
 * @lastModified 2025-12-31 (REQ-052 - Added useItemValidation)
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

export { useMediaEditor } from './useMediaEditor';

export { useItemValidation, type UseItemValidationReturn, type ValidatableField } from './useItemValidation';
