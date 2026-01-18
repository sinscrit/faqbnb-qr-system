/**
 * Adapters Barrel Export
 *
 * Centralized exports for all adapter components that bridge ItemCapture
 * step components with ItemCreationWorkflow state management.
 *
 * @module ItemCreationWorkflow/components/steps/adapters
 * @see REQ-176 Add Missing Media Capture Step
 * @created 2026-01-10
 * @lastModified 2026-01-10
 */

// Component exports
export { default as VideoCaptureAdapter } from './VideoCaptureAdapter';
export { default as PhotoCaptureAdapter } from './PhotoCaptureAdapter';
export { default as FileUploadAdapter } from './FileUploadAdapter';
export { default as TextEditorAdapter } from './TextEditorAdapter';
export { default as UrlInputAdapter } from './UrlInputAdapter';

// Type exports
export type { VideoCaptureAdapterProps } from './VideoCaptureAdapter';
export type { PhotoCaptureAdapterProps } from './PhotoCaptureAdapter';
export type { FileUploadAdapterProps } from './FileUploadAdapter';
export type { TextEditorAdapterProps } from './TextEditorAdapter';
export type { UrlInputAdapterProps } from './UrlInputAdapter';
