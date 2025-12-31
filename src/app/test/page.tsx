'use client';

/**
 * ItemCapture Test Index Page
 *
 * Central hub for testing all ItemCapture components and flows.
 * Provides links to individual test harnesses and documented use cases.
 *
 * @route /test
 * @created 2025-12-31
 * @lastModified 2025-12-31
 */

import Link from 'next/link';

interface TestLink {
  href: string;
  title: string;
  description: string;
}

const mainTests: TestLink[] = [
  {
    href: '/test/item-capture',
    title: 'Full Wizard',
    description: 'Complete ItemCapture flow - metadata → content → capture → edit → review',
  },
];

const stepTests: TestLink[] = [
  {
    href: '/test/metadata-step',
    title: 'MetadataStep',
    description: 'Title, location, tags, appliance type inputs',
  },
  {
    href: '/test/content-type-step',
    title: 'ContentTypeStep',
    description: 'Select Video/Photo/Text/Upload options',
  },
  {
    href: '/test/video-capture-step',
    title: 'VideoCaptureStep',
    description: 'Camera access and video recording',
  },
  {
    href: '/test/photo-capture-step',
    title: 'PhotoCaptureStep',
    description: 'Camera access and photo capture',
  },
  {
    href: '/test/file-upload-step',
    title: 'FileUploadStep',
    description: 'Drag-drop, file picker, PDF handling',
  },
  {
    href: '/test/text-editor-step',
    title: 'TextEditorStep',
    description: 'Markdown text entry',
  },
  {
    href: '/test/media-editor-step',
    title: 'MediaEditorStep',
    description: 'Crop/rotate/trim editing flow',
  },
  {
    href: '/test/review-step',
    title: 'ReviewStep',
    description: 'Final review before submit',
  },
];

const editorTests: TestLink[] = [
  {
    href: '/test/image-cropper',
    title: 'ImageCropper',
    description: 'Crop uploaded images with aspect ratio controls',
  },
  {
    href: '/test/image-rotator',
    title: 'ImageRotator',
    description: 'Rotate images in 90° increments',
  },
  {
    href: '/test/video-trimmer',
    title: 'VideoTrimmer',
    description: 'Trim video start/end points',
  },
  {
    href: '/test/markdown-editor',
    title: 'MarkdownEditor',
    description: 'Rich text formatting with preview',
  },
];

const componentTests: TestLink[] = [
  {
    href: '/test/camera-preview',
    title: 'CameraPreview',
    description: 'Camera stream display component',
  },
  {
    href: '/test/media-thumbnail',
    title: 'MediaThumbnail',
    description: 'Thumbnail rendering for various media types',
  },
];

interface UseCase {
  title: string;
  steps: string[];
  testPath: string;
}

const useCases: UseCase[] = [
  {
    title: 'Use Case 1: Complete Video Capture Flow',
    testPath: '/test/item-capture',
    steps: [
      'Go to Full Wizard',
      'Metadata Step: Enter title "How to use the washing machine", select location, add tags',
      'Content Type: Select "Video"',
      'Video Capture: Allow camera, record a short video (5-10 sec), stop',
      'Media Editor: Optionally trim the video',
      'Review: Verify all data, submit',
    ],
  },
  {
    title: 'Use Case 2: Photo Documentation',
    testPath: '/test/item-capture',
    steps: [
      'Go to Full Wizard',
      'Metadata Step: Enter title "Thermostat settings", select "HVAC" appliance',
      'Content Type: Select "Photo"',
      'Photo Capture: Take multiple photos (up to 10)',
      'Media Editor: Crop/rotate as needed',
      'Review: Submit',
    ],
  },
  {
    title: 'Use Case 3: PDF Upload (Manual/Instructions)',
    testPath: '/test/item-capture',
    steps: [
      'Go to Full Wizard',
      'Metadata Step: Enter title "Dishwasher Manual"',
      'Content Type: Select "Upload"',
      'File Upload: Drag a PDF file, verify thumbnail generation with page count',
      'Review: Submit',
    ],
  },
  {
    title: 'Use Case 4: Text Instructions',
    testPath: '/test/item-capture',
    steps: [
      'Go to Full Wizard',
      'Metadata Step: Enter title "WiFi Password Reset"',
      'Content Type: Select "Text"',
      'Text Editor: Write markdown instructions with headers, lists',
      'Review: Verify formatted preview, submit',
    ],
  },
  {
    title: 'Use Case 5: Multi-Media Item',
    testPath: '/test/item-capture',
    steps: [
      'Go to Full Wizard',
      'Complete metadata',
      'Content Type: Select "Photo" → Take 2 photos',
      'Click "Add More" → Select "Video" → Record short clip',
      'Click "Add More" → Select "Text" → Add notes',
      'Review: Verify all 3 media items appear',
    ],
  },
  {
    title: 'Use Case 6: Validation Testing',
    testPath: '/test/metadata-step',
    steps: [
      'Go to MetadataStep test',
      'Try to proceed with empty title → Should show validation error',
      'Enter title < 3 chars → Should show "Title must be at least 3 characters"',
      'Fill valid data → Should allow navigation',
    ],
  },
  {
    title: 'Use Case 7: Cancel/Reset Flow',
    testPath: '/test/item-capture',
    steps: [
      'Go to Full Wizard',
      'Fill out metadata, select content type',
      'Click Cancel → Should reset wizard or show confirmation',
      'Verify state is cleared',
    ],
  },
];

function TestLinkCard({ href, title, description }: TestLink) {
  return (
    <Link
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
    >
      <h3 className="font-semibold text-blue-600">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </Link>
  );
}

function UseCaseCard({ useCase }: { useCase: UseCase }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{useCase.title}</h3>
        <Link
          href={useCase.testPath}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Start Test
        </Link>
      </div>
      <ol className="list-decimal list-inside space-y-1">
        {useCase.steps.map((step, idx) => (
          <li key={idx} className="text-sm text-gray-600">
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function TestIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ItemCapture Test Harness</h1>
          <p className="text-gray-600 mt-2">
            Test all ItemCapture wizard components and flows. Open DevTools Console to see output.
          </p>
        </div>

        {/* Main Wizard */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🚀 Main Wizard</h2>
          <div className="grid gap-4">
            {mainTests.map((test) => (
              <TestLinkCard key={test.href} {...test} />
            ))}
          </div>
        </section>

        {/* Step Components */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Step Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stepTests.map((test) => (
              <TestLinkCard key={test.href} {...test} />
            ))}
          </div>
        </section>

        {/* Editor Components */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">✂️ Editor Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editorTests.map((test) => (
              <TestLinkCard key={test.href} {...test} />
            ))}
          </div>
        </section>

        {/* Shared Components */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🧩 Shared Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {componentTests.map((test) => (
              <TestLinkCard key={test.href} {...test} />
            ))}
          </div>
        </section>

        {/* Divider */}
        <hr className="my-8 border-gray-300" />

        {/* Use Cases */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Test Use Cases</h2>
          <p className="text-gray-600 mb-4">
            Follow these step-by-step scenarios to thoroughly test the ItemCapture implementation.
          </p>
          <div className="space-y-4">
            {useCases.map((useCase, idx) => (
              <UseCaseCard key={idx} useCase={useCase} />
            ))}
          </div>
        </section>

        {/* Mobile Testing Note */}
        <section className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">📱 Mobile Testing</h2>
          <p className="text-sm text-yellow-700 mb-2">
            Test on mobile devices (iOS Safari, Android Chrome) for:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            <li>Camera permissions</li>
            <li>Touch interactions on cropper/trimmer</li>
            <li>Responsive layout</li>
            <li>File upload from camera roll</li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 py-4">
          ItemCapture Test Harness • Generated 2025-12-31
        </footer>
      </div>
    </div>
  );
}
