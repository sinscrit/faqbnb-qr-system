'use client';
/* eslint-disable react/no-unescaped-entities */

/**
 * Ui Ux Workflow Improvements - Pipeline Test Harness
 *
 * Auto-generated LLM-friendly test harness for the ui-ux-workflow-improvements pipeline.
 * Features:
 * - LLM Testing Instructions with workflow guidance
 * - Sequential test navigation with Previous/Next buttons
 * - Component tests displayed inline via iframe (no page navigation)
 * - Use case tests with step-by-step instructions
 * - Pipeline reference for context (informational only)
 *
 * @generated 2026-01-10 11:42
 * @pipeline ui-ux-workflow-improvements
 */

import Link from 'next/link';
import { useState } from 'react';

type TabId = 'instructions' | 'components' | 'usecases' | 'reference';

// LLM Testing Instructions - PRD Context
const llmInstructions = {
  vision: 'Guide property owners through a simple, intuitive workflow to create instructional content for household items—from selecting what to tag, through content creation, to printing QR codes—all in a single session without requiring technical knowledge.',
  userOutcome: 'I logged in, walked through my rental tagging each appliance, and had a sheet of QR codes printed in under 30 minutes. The app told me exactly what to do at each step.',
  successMetrics: ['Session completion rate: > 70% of started sessions result in at least one item created', 'Items per session: Average 3-5 items created per session', 'Time to first item: < 5 minutes from login to first saved item', 'QR code generation rate: > 60% of sessions end with QR codes generated/printed', 'Return rate: < 20% of users need to return to fix/redo items'],
  scopeIn: ['Complete user workflow from login to QR code printing', 'Room and item selection interface', 'Item type categorization (appliance, room item, general info)', 'Smart item suggestions based on room selection', 'Multi-item session management', 'QR code PDF generation'],
  scopeOut: ['Individual content capture UI (see: PRD Item Capture Component)', 'User authentication and login', 'Database persistence layer', 'Guest-facing QR code viewing experience'],
  workflow: [
    'STEP 1: Read the Instructions tab first to understand the product context and testing workflow.',
    'STEP 2: Complete Component Tests - These verify individual UI components work correctly in isolation.',
    'STEP 3: Complete Use Case Tests - These verify end-to-end user workflows function properly.',
    'STEP 4: SKIP Pipeline Reference - This tab is informational only, not for testing.',
  ],
  componentTestGuidance: 'For each component test: (1) Click to load the test page in the iframe below, (2) Interact with the component to verify it renders and responds correctly, (3) Use Previous/Next to move sequentially through all component tests.',
  useCaseTestGuidance: 'For each use case: (1) Select the use case from the list, (2) Follow each numbered step in order, (3) Check off steps as you complete them, (4) Verify the expected outcome matches what you observe.',
  importantNotes: [
    'Component Tests should be completed BEFORE Use Case Tests',
    'Pipeline Reference tab contains implementation status only - DO NOT test it',
    'Use Previous/Next buttons to navigate sequentially',
    'All tests are displayed inline - no need to navigate away from this page',
  ],
};

interface TestLink {
  href: string;
  title: string;
  description: string;
}

interface UseCaseStep {
  step: number;
  action: string;
  component: string;
  expectedResult: string;
}

interface UseCase {
  id: string;
  title: string;
  category: 'happy-path' | 'error-handling' | 'edge-case' | 'integration';
  priority: 'P0' | 'P1' | 'P2';
  description: string;
  expectedOutcome: string;
  steps: UseCaseStep[];
}

const componentTests: TestLink[] = [
  // No component tests found
];

const allTasks = [
    { id: '0.1', request: 'REQ-148', title: 'Create `item_articles` Table', status: '✅', hasTest: '' },
    { id: '0.2', request: 'REQ-149', title: 'Add `article_id` to `item_links` Table', status: '✅', hasTest: '' },
    { id: '0.3', request: 'REQ-150', title: 'Create RLS Policies for `item_articles`', status: '✅', hasTest: '' },
    { id: '0.4', request: 'REQ-151', title: 'Update API Endpoints', status: '✅', hasTest: '' },
    { id: '0.5', request: 'REQ-152', title: 'Update TypeScript Types', status: '✅', hasTest: '' },
    { id: '0.6', request: 'REQ-153', title: 'Data Migration (if needed)', status: '✅', hasTest: '' },
    { id: '1.1', request: 'REQ-154', title: 'Update Types and Constants', status: '✅', hasTest: '' },
    { id: '1.2', request: 'REQ-155', title: 'Create Title Generator Utility', status: '✅', hasTest: '' },
    { id: '1.3', request: 'REQ-156', title: 'Update State Machine', status: '✅', hasTest: '' },
    { id: '2.1', request: 'REQ-157', title: 'Create PurposeStep Component', status: '✅', hasTest: '' },
    { id: '2.2', request: 'REQ-158', title: 'Integrate PurposeStep into Workflow', status: '⏳', hasTest: '' },
    { id: '2.3', request: 'REQ-159', title: 'Create Unit Tests', status: '✅', hasTest: '' },
    { id: '3.1', request: 'REQ-160', title: 'Remove ContentSourceStep', status: '✅', hasTest: '' },
    { id: '3.2', request: 'REQ-161', title: 'Update ContentTypeStep Labels', status: '✅', hasTest: '' },
    { id: '3.3', request: 'REQ-162', title: 'Consolidate Content Options', status: '✅', hasTest: '' },
    { id: '4.1', request: 'REQ-163', title: 'Audit All Content Input Screens', status: '✅', hasTest: '' },
    { id: '4.2', request: 'REQ-164', title: 'Remove Bottom Navigation from Content Screens', status: '✅', hasTest: '' },
    { id: '4.3', request: 'REQ-165', title: 'Update Button Logic', status: '✅', hasTest: '' },
    { id: '4.4', request: 'REQ-166', title: 'Fix NextActionStep', status: '✅', hasTest: '' },
    { id: '5.1', request: 'REQ-167', title: 'Create ContentPreview Component', status: '✅', hasTest: '' },
    { id: '5.2', request: 'REQ-168', title: 'Redesign PreviewSaveStep Layout', status: '✅', hasTest: '' },
    { id: '5.3', request: 'REQ-169', title: 'Update Content Display', status: '✅', hasTest: '' },
    { id: '5.4', request: 'REQ-170', title: 'Pre-populate Fields', status: '✅', hasTest: '' },
    { id: '5.5', request: 'REQ-171', title: 'Update Tests', status: '✅', hasTest: '' },
    { id: '6.1', request: 'REQ-172', title: 'End-to-End Flow Testing', status: '✅', hasTest: '' },
    { id: '6.2', request: 'REQ-173', title: 'Mobile Responsiveness', status: '✅', hasTest: '' },
    { id: '6.3', request: 'REQ-174', title: 'Accessibility Audit', status: '✅', hasTest: '' },
    { id: '6.4', request: 'REQ-175', title: 'Update Documentation', status: '✅', hasTest: '' },
];

const useCases: UseCase[] = [
  {
    id: 'UC-HP-001',
    title: 'Complete Item Creation with Purpose Selection',
    category: 'happy-path',
    priority: 'P0',
    description: 'User creates a new item using the streamlined workflow with purpose selection, verifying the new 7-s',
    expectedOutcome: 'Item saved with article grouping, auto-generated title, QR code generated',
    steps: [
      { step: 1, action: 'Select \'Kitchen\' room from the room grid', component: 'RoomSelectionStep', expectedResult: 'Kitchen room card shows selected state, navigation enabled' },
      { step: 2, action: 'Select \'Appliance\' item type', component: 'ItemTypeStep', expectedResult: 'Appliance card selected, proceeds to specific item step' },
      { step: 3, action: 'Choose \'Coffee Machine\' from suggestions', component: 'SpecificItemStep', expectedResult: 'Item name set, proceeds directly to purpose selection (no content source step)' },
      { step: 4, action: 'Select \'How to Use\' purpose', component: 'PurposeStep', expectedResult: 'Purpose selected, auto-generated title shows as "How to Use - Coffee Machine"' },
      { step: 5, action: 'Select \'Record Video\' from consolidated content options', component: 'ContentTypeStep', expectedResult: 'All 5 content options visible (Record Video, Take Photo, Write Text, Upload File, Add Link)' },
      { step: 6, action: 'Record 10-second instructional video', component: 'ContentCreationStep', expectedResult: 'Video captured, proceeds to preview' },
      { step: 7, action: 'Review preview with actual content visible', component: 'PreviewSaveStep', expectedResult: 'Content preview shows video thumbnail, item details pre-filled, title editable' },
      { step: 8, action: 'Save item', component: 'PreviewSaveStep', expectedResult: 'Item saved successfully with article created' },
    ],
  },
  {
    id: 'UC-HP-002',
    title: 'Verify Auto-Generated Article Title',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify that article titles are auto-generated in the format "Purpose - Item" and can be edited',
    expectedOutcome: 'Article title auto-generated correctly and editable by user',
    steps: [
      { step: 1, action: 'Complete room, type, and specific item selection', component: 'Multiple Steps', expectedResult: 'Navigates to PurposeStep' },
      { step: 2, action: 'Select \'How to Clean\' purpose', component: 'PurposeStep', expectedResult: 'Purpose captured' },
      { step: 3, action: 'Complete content creation', component: 'ContentCreationStep', expectedResult: 'Proceeds to preview' },
      { step: 4, action: 'View auto-generated title in preview', component: 'PreviewSaveStep', expectedResult: 'Title shows "How to Clean - [Item Name]" format' },
      { step: 5, action: 'Click edit button on title', component: 'PreviewSaveStep', expectedResult: 'Title becomes editable' },
      { step: 6, action: 'Modify title and save', component: 'PreviewSaveStep', expectedResult: 'Custom title saved with item' },
    ],
  },
  {
    id: 'UC-HP-003',
    title: 'Verify Content Preview on Review Screen',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify that the review screen shows actual content previews instead of empty placeholders',
    expectedOutcome: 'Review screen displays actual content with proper previews, not empty placeholders',
    steps: [
      { step: 1, action: 'Create item with video content', component: 'ContentCreationStep', expectedResult: 'Video recorded successfully' },
      { step: 2, action: 'Navigate to preview screen', component: 'PreviewSaveStep', expectedResult: 'Preview screen loads' },
      { step: 3, action: 'Verify video thumbnail visible', component: 'ContentPreview', expectedResult: 'Video thumbnail displayed with duration badge' },
      { step: 4, action: 'Verify item details pre-filled', component: 'PreviewSaveStep', expectedResult: 'Room, Item Type, Purpose all displayed as read-only' },
      { step: 5, action: 'Verify content count badge', component: 'PreviewSaveStep', expectedResult: 'Badge shows "1 content piece" or similar' },
    ],
  },
  {
    id: 'UC-HP-004',
    title: 'Verify All Purpose Types Work',
    category: 'happy-path',
    priority: 'P1',
    description: 'Verify all 7 purpose types are selectable and generate correct titles',
    expectedOutcome: 'All 7 purpose types work correctly with keyboard and mouse',
    steps: [
      { step: 1, action: 'Verify 7 purpose cards displayed', component: 'PurposeStep', expectedResult: 'All purposes visible: How to Use, How to Clean, Troubleshooting, Safety Info, Maintenance, Features, Other' },
      { step: 2, action: 'Select each purpose type sequentially', component: 'PurposeStep', expectedResult: 'Each purpose card shows selected state with icon' },
      { step: 3, action: 'Verify keyboard navigation works', component: 'PurposeStep', expectedResult: 'Arrow keys navigate between purpose cards' },
      { step: 4, action: 'Verify Enter key selects purpose', component: 'PurposeStep', expectedResult: 'Enter confirms selection and auto-advances' },
    ],
  },
  {
    id: 'UC-HP-005',
    title: 'Verify Consolidated Content Options',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify that content type step shows all 5 options in a single view (no content source step)',
    expectedOutcome: 'Streamlined content selection with all options visible at once',
    steps: [
      { step: 1, action: 'Arrive at ContentTypeStep from PurposeStep', component: 'ContentTypeStep', expectedResult: 'No intermediate "content source" step' },
      { step: 2, action: 'Verify 5 content options visible', component: 'ContentTypeStep', expectedResult: 'Record Video, Take Photo, Write Text, Upload File, Add Link all displayed' },
      { step: 3, action: 'Verify \'Upload File\' shows format hints', component: 'ContentTypeStep', expectedResult: 'Subtitle shows "Video, Image, PDF, Text"' },
      { step: 4, action: 'Select any content option', component: 'ContentTypeStep', expectedResult: 'Navigates directly to content creation for that type' },
    ],
  },
  {
    id: 'UC-HP-006',
    title: 'Verify No Duplicate Bottom Navigation',
    category: 'happy-path',
    priority: 'P1',
    description: 'Verify that content input screens no longer have duplicate bottom navigation bars',
    expectedOutcome: 'All content screens have clean, single navigation pattern',
    steps: [
      { step: 1, action: 'Navigate to TextEditorStep', component: 'TextEditorStep', expectedResult: 'Only inline Back/Continue buttons, no bottom bar' },
      { step: 2, action: 'Navigate to FileUploadStep', component: 'FileUploadStep', expectedResult: 'Only inline navigation, no bottom bar' },
      { step: 3, action: 'Navigate to VideoCaptureStep', component: 'VideoCaptureStep', expectedResult: 'No duplicate bottom bar' },
      { step: 4, action: 'Navigate to PhotoCaptureStep', component: 'PhotoCaptureStep', expectedResult: 'No duplicate bottom bar' },
      { step: 5, action: 'Navigate to UrlInputStep', component: 'UrlInputStep', expectedResult: 'No duplicate bottom bar' },
      { step: 6, action: 'Navigate to NextActionStep', component: 'NextActionStep', expectedResult: 'Only 3 action cards, no bottom navigation bar' },
    ],
  },
  {
    id: 'UC-ERR-001',
    title: 'Cancel Confirmation with Content Added',
    category: 'error-handling',
    priority: 'P0',
    description: 'Verify confirmation dialog appears when user clicks Cancel after adding content',
    expectedOutcome: 'User is warned before accidentally losing created content',
    steps: [
      { step: 1, action: 'Create item and add video content', component: 'ContentCreationStep', expectedResult: 'Content added to item' },
      { step: 2, action: 'Navigate to NextActionStep', component: 'NextActionStep', expectedResult: 'Three action options displayed' },
      { step: 3, action: 'Click \'Cancel\' action card', component: 'NextActionStep', expectedResult: 'ConfirmExitDialog appears' },
      { step: 4, action: 'Verify warning message displayed', component: 'ConfirmExitDialog', expectedResult: 'Dialog warns about losing work' },
      { step: 5, action: 'Click \'Continue Editing\'', component: 'ConfirmExitDialog', expectedResult: 'Dialog closes, user stays in workflow' },
      { step: 6, action: 'Repeat and click \'Exit Anyway\'', component: 'ConfirmExitDialog', expectedResult: 'Workflow exits, content discarded' },
    ],
  },
  {
    id: 'UC-ERR-002',
    title: 'Handle Missing Purpose Selection',
    category: 'error-handling',
    priority: 'P1',
    description: 'Verify workflow handles case where user tries to proceed without selecting purpose',
    expectedOutcome: 'User cannot skip purpose selection step',
    steps: [
      { step: 1, action: 'Arrive at PurposeStep without selection', component: 'PurposeStep', expectedResult: 'No purpose cards selected initially' },
      { step: 2, action: 'Attempt to click Next/Continue', component: 'PurposeStep', expectedResult: 'Button disabled or navigation blocked' },
      { step: 3, action: 'Select a purpose', component: 'PurposeStep', expectedResult: 'Navigation enabled' },
    ],
  },
  {
    id: 'UC-ERR-003',
    title: 'Handle Empty Title Generation',
    category: 'error-handling',
    priority: 'P2',
    description: 'Verify title generator handles edge case where inputs are missing',
    expectedOutcome: 'Title generator handles fallback cases gracefully',
    steps: [
      { step: 1, action: 'Select \'Other\' purpose type', component: 'PurposeStep', expectedResult: 'Purpose set to Other' },
      { step: 2, action: 'View generated title in preview', component: 'PreviewSaveStep', expectedResult: 'Title falls back to item name only' },
      { step: 3, action: 'Verify title is still editable', component: 'PreviewSaveStep', expectedResult: 'User can provide custom title' },
    ],
  },
  {
    id: 'UC-EDGE-001',
    title: 'Mobile Touch Target Compliance',
    category: 'edge-case',
    priority: 'P0',
    description: 'Verify all interactive elements meet 48px minimum touch target on mobile',
    expectedOutcome: 'All UI elements meet WCAG touch target requirements on mobile',
    steps: [
      { step: 1, action: 'Navigate workflow on 320px viewport', component: 'All Steps', expectedResult: 'All cards and buttons are tappable' },
      { step: 2, action: 'Tap purpose cards', component: 'PurposeStep', expectedResult: 'Touch targets are 48px minimum' },
      { step: 3, action: 'Tap content type cards', component: 'ContentTypeStep', expectedResult: 'Touch targets are 48px minimum' },
      { step: 4, action: 'Verify drag handles on content reorder', component: 'PreviewSaveStep', expectedResult: 'Drag handles meet touch target size' },
    ],
  },
  {
    id: 'UC-EDGE-002',
    title: 'Keyboard Navigation Through Entire Flow',
    category: 'edge-case',
    priority: 'P1',
    description: 'Verify entire workflow can be completed using only keyboard',
    expectedOutcome: 'Full keyboard accessibility throughout workflow',
    steps: [
      { step: 1, action: 'Tab through room selection cards', component: 'RoomSelectionStep', expectedResult: 'Focus visible on each room card' },
      { step: 2, action: 'Press Enter to select room', component: 'RoomSelectionStep', expectedResult: 'Room selected, advances to next step' },
      { step: 3, action: 'Use arrow keys in PurposeStep', component: 'PurposeStep', expectedResult: 'Arrow keys navigate between purpose cards' },
      { step: 4, action: 'Complete entire flow with keyboard', component: 'All Steps', expectedResult: 'All steps accessible via keyboard' },
    ],
  },
  {
    id: 'UC-EDGE-003',
    title: 'Screen Reader Announcements',
    category: 'edge-case',
    priority: 'P1',
    description: 'Verify screen readers announce step changes and selections correctly',
    expectedOutcome: 'Screen reader users can understand workflow state at all times',
    steps: [
      { step: 1, action: 'Navigate to PurposeStep', component: 'PurposeStep', expectedResult: 'Screen reader announces "Purpose Selection, Step 4 of 7"' },
      { step: 2, action: 'Select a purpose card', component: 'PurposeStep', expectedResult: 'Announces selected purpose and auto-advance' },
      { step: 3, action: 'Navigate to PreviewSaveStep', component: 'PreviewSaveStep', expectedResult: 'Announces item details and content count' },
    ],
  },
  {
    id: 'UC-INT-001',
    title: 'Multi-Content Item with Article Grouping',
    category: 'integration',
    priority: 'P0',
    description: 'Verify multiple content pieces are grouped under the same article',
    expectedOutcome: 'Multiple content pieces grouped under single article with correct display order',
    steps: [
      { step: 1, action: 'Create item with video content', component: 'ContentCreationStep', expectedResult: 'Video added' },
      { step: 2, action: 'Navigate to preview, then "Add More Content"', component: 'PreviewSaveStep', expectedResult: 'Returns to content type selection' },
      { step: 3, action: 'Add PDF manual', component: 'ContentCreationStep', expectedResult: 'PDF added to same article' },
      { step: 4, action: 'View preview with both content pieces', component: 'PreviewSaveStep', expectedResult: 'Both video and PDF displayed in content grid' },
      { step: 5, action: 'Reorder content via drag-and-drop', component: 'ContentPieceCard', expectedResult: 'Order updated' },
      { step: 6, action: 'Save item', component: 'PreviewSaveStep', expectedResult: 'Item saved with article containing 2 links' },
    ],
  },
  {
    id: 'UC-INT-002',
    title: 'API Article Creation Flow',
    category: 'integration',
    priority: 'P0',
    description: 'Verify backend creates article record when item is saved',
    expectedOutcome: 'Database correctly stores article hierarchy',
    steps: [
      { step: 1, action: 'Complete item creation with purpose', component: 'Workflow', expectedResult: 'Item ready to save' },
      { step: 2, action: 'Click Save', component: 'PreviewSaveStep', expectedResult: 'API call made' },
      { step: 3, action: 'Verify item_articles record created', component: 'Database', expectedResult: 'Article with purpose and auto-title exists' },
      { step: 4, action: 'Verify item_links reference article_id', component: 'Database', expectedResult: 'Content links associated with article' },
    ],
  },
  {
    id: 'UC-INT-003',
    title: 'Session Summary Shows Articles',
    category: 'integration',
    priority: 'P1',
    description: 'Verify session summary displays items with their article titles',
    expectedOutcome: 'Session summary correctly displays items with article metadata',
    steps: [
      { step: 1, action: 'Create 2-3 items with different purposes', component: 'Workflow', expectedResult: 'Items saved' },
      { step: 2, action: 'Navigate to SessionSummaryStep', component: 'SessionSummaryStep', expectedResult: 'All items listed' },
      { step: 3, action: 'Verify article titles displayed', component: 'SessionItemCard', expectedResult: 'Titles show "Purpose - Item" format' },
      { step: 4, action: 'Verify QR codes generated', component: 'SessionSummaryStep', expectedResult: 'QR codes ready for each item' },
    ],
  },
];

const categoryColors: Record<string, string> = {
  'happy-path': 'bg-green-100 text-green-800',
  'error-handling': 'bg-red-100 text-red-800',
  'edge-case': 'bg-yellow-100 text-yellow-800',
  'integration': 'bg-purple-100 text-purple-800',
};

const priorityColors: Record<string, string> = {
  'P0': 'bg-red-500 text-white',
  'P1': 'bg-orange-400 text-white',
  'P2': 'bg-gray-400 text-white',
};

export default function UiUxWorkflowImprovementsTestPage() {
  const [activeTab, setActiveTab] = useState<TabId>('instructions');
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [selectedUseCaseIndex, setSelectedUseCaseIndex] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({}); // Track completed steps per use case

  const tabs = [
    { id: 'instructions' as TabId, label: '📖 LLM Instructions', count: null },
    { id: 'components' as TabId, label: '🧪 Component Tests', count: componentTests.length },
    { id: 'usecases' as TabId, label: '📝 Use Case Tests', count: useCases.length },
    { id: 'reference' as TabId, label: '📋 Pipeline Reference', count: allTasks.length },
  ];

  // Toggle step completion for a use case
  const toggleStep = (useCaseId: string, stepNum: number) => {
    setCompletedSteps(prev => {
      const current = prev[useCaseId] || new Set<number>();
      const next = new Set(current);
      if (next.has(stepNum)) {
        next.delete(stepNum);
      } else {
        next.add(stepNum);
      }
      return { ...prev, [useCaseId]: next };
    });
  };

  // Check if all steps in a use case are completed
  const isUseCaseComplete = (uc: UseCase) => {
    const completed = completedSteps[uc.id] || new Set<number>();
    return uc.steps.length > 0 && uc.steps.every(s => completed.has(s.step));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/test" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
            ← Back to All Pipelines
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Ui Ux Workflow Improvements</h1>
          <p className="text-xs text-gray-400">Pipeline Test Harness • Generated: 2026-01-10 11:42</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedComponentIndex(null);
                  setSelectedUseCaseIndex(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}{tab.count !== null && ` (${tab.count})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* LLM Instructions Tab */}
        {activeTab === 'instructions' && (
          <div className="space-y-4">
            {/* Testing Workflow */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-bold text-blue-900 mb-3">🤖 LLM Testing Workflow</h2>
              <ol className="space-y-2">
                {llmInstructions.workflow.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800'
                    }`}>{idx + 1}</span>
                    <span className="text-blue-800">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h3>
              <ul className="space-y-1">
                {llmInstructions.importantNotes.map((note, idx) => (
                  <li key={idx} className="text-yellow-800 text-sm flex items-start gap-2">
                    <span>•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Context */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📋 Product Context</h3>

              {llmInstructions.vision && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Vision</h4>
                  <p className="text-gray-800">{llmInstructions.vision}</p>
                </div>
              )}

              {llmInstructions.userOutcome && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Target User Outcome</h4>
                  <p className="text-gray-700 italic">"{llmInstructions.userOutcome}"</p>
                </div>
              )}

              {llmInstructions.successMetrics.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Success Metrics</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {llmInstructions.successMetrics.map((metric, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {llmInstructions.scopeIn.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">In Scope (What to Test)</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {llmInstructions.scopeIn.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {llmInstructions.scopeOut.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Out of Scope (DO NOT Test)</h4>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {llmInstructions.scopeOut.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-gray-400">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Test-Specific Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">🧪 Component Test Guidance</h3>
                <p className="text-sm text-gray-600">{llmInstructions.componentTestGuidance}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">📝 Use Case Test Guidance</h3>
                <p className="text-sm text-gray-600">{llmInstructions.useCaseTestGuidance}</p>
              </div>
            </div>

            {/* Start Testing Button */}
            <div className="text-center py-4">
              <button
                onClick={() => setActiveTab('components')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Component Tests →
              </button>
            </div>
          </div>
        )}

        {/* Component Tests Tab - Sequential with Inline Display */}
        {activeTab === 'components' && (
          <div>
            {/* Test List */}
            <div className="bg-white rounded-lg border border-gray-200 mb-4">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800">Component Tests</h2>
                <p className="text-xs text-gray-500 mt-1">Click a test to view it inline below. Use Previous/Next to navigate sequentially.</p>
              </div>
              {componentTests.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {componentTests.map((test, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedComponentIndex(idx)}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                        selectedComponentIndex === idx ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-gray-800 truncate">{test.title}</p>
                        <p className="text-xs text-gray-500 truncate">{test.description}</p>
                      </div>
                      {selectedComponentIndex === idx && (
                        <span className="text-blue-600">▶</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No component test pages found for this pipeline.</p>
                </div>
              )}
            </div>

            {/* Inline Test Display with iframe */}
            {selectedComponentIndex !== null && componentTests[selectedComponentIndex] && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Navigation Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      Test {selectedComponentIndex + 1} of {componentTests.length}
                    </span>
                    <span className="font-medium text-gray-800">{componentTests[selectedComponentIndex].title}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedComponentIndex(Math.max(0, selectedComponentIndex - 1))}
                      disabled={selectedComponentIndex === 0}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setSelectedComponentIndex(Math.min(componentTests.length - 1, selectedComponentIndex + 1))}
                      disabled={selectedComponentIndex === componentTests.length - 1}
                      className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                      Next →
                    </button>
                  </div>
                </div>
                {/* iframe for test page */}
                <div className="relative" style={{ height: '70vh' }}>
                  <iframe
                    src={componentTests[selectedComponentIndex].href}
                    className="absolute inset-0 w-full h-full border-0"
                    title={componentTests[selectedComponentIndex].title}
                  />
                </div>
                {/* Open in new tab link */}
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-center">
                  <a
                    href={componentTests[selectedComponentIndex].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Open in new tab ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Use Cases Tab - Sequential with Step Tracking */}
        {activeTab === 'usecases' && (
          <div>
            {/* Use Case List */}
            <div className="bg-white rounded-lg border border-gray-200 mb-4">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800">Use Case Tests</h2>
                <p className="text-xs text-gray-500 mt-1">Select a use case to see step-by-step instructions. Check off steps as you complete them.</p>
              </div>
              {useCases.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {useCases.map((uc, idx) => (
                    <button
                      key={uc.id}
                      onClick={() => setSelectedUseCaseIndex(idx)}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                        selectedUseCaseIndex === idx ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isUseCaseComplete(uc) ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {isUseCaseComplete(uc) ? '✓' : idx + 1}
                      </span>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${priorityColors[uc.priority]}`}>
                            {uc.priority}
                          </span>
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${categoryColors[uc.category]}`}>
                            {uc.category}
                          </span>
                          <span className="font-mono text-xs text-gray-400">{uc.id}</span>
                        </div>
                        <p className="font-medium text-gray-800 truncate">{uc.title}</p>
                      </div>
                      {selectedUseCaseIndex === idx && (
                        <span className="text-blue-600">▶</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No use cases generated yet. Run the usecases stage to generate.</p>
                </div>
              )}
            </div>

            {/* Inline Use Case Display */}
            {selectedUseCaseIndex !== null && useCases[selectedUseCaseIndex] && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Navigation Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      Use Case {selectedUseCaseIndex + 1} of {useCases.length}
                    </span>
                    <span className="font-mono text-xs text-gray-500">{useCases[selectedUseCaseIndex].id}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedUseCaseIndex(Math.max(0, selectedUseCaseIndex - 1))}
                      disabled={selectedUseCaseIndex === 0}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setSelectedUseCaseIndex(Math.min(useCases.length - 1, selectedUseCaseIndex + 1))}
                      disabled={selectedUseCaseIndex === useCases.length - 1}
                      className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Use Case Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCases[selectedUseCaseIndex].title}</h3>
                  <p className="text-gray-600 mb-4">{useCases[selectedUseCaseIndex].description}</p>

                  {/* Steps with Checkboxes */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-3">Steps to Execute:</h4>
                    <ol className="space-y-3">
                      {useCases[selectedUseCaseIndex].steps.map((step) => {
                        const isCompleted = (completedSteps[useCases[selectedUseCaseIndex].id] || new Set()).has(step.step);
                        return (
                          <li
                            key={step.step}
                            className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                              isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <button
                              onClick={() => toggleStep(useCases[selectedUseCaseIndex].id, step.step)}
                              className={`flex-shrink-0 w-7 h-7 rounded border-2 flex items-center justify-center transition-colors ${
                                isCompleted
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-blue-500'
                              }`}
                            >
                              {isCompleted ? '✓' : step.step}
                            </button>
                            <div className="flex-grow">
                              <p className={`font-medium ${isCompleted ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                                {step.action}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-mono bg-gray-200 px-1 rounded">{step.component}</span>
                                <span className="mx-2">→</span>
                                <span className={isCompleted ? 'text-green-600' : ''}>{step.expectedResult}</span>
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  {/* Expected Outcome */}
                  <div className={`p-4 rounded-lg border ${
                    isUseCaseComplete(useCases[selectedUseCaseIndex])
                      ? 'bg-green-100 border-green-300'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className={`text-sm ${
                      isUseCaseComplete(useCases[selectedUseCaseIndex]) ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      <span className="font-medium">Expected Outcome:</span> {useCases[selectedUseCaseIndex].expectedOutcome}
                    </p>
                    {isUseCaseComplete(useCases[selectedUseCaseIndex]) && (
                      <p className="text-green-700 font-medium mt-2">✅ All steps completed!</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pipeline Reference Tab */}
        {activeTab === 'reference' && (
          <div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800">Pipeline Reference</h2>
                <p className="text-xs text-gray-500 mt-1">Complete list of all tasks implemented in this pipeline with their status and test coverage.</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Task</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Request</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Title</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Test</th>
                  </tr>
                </thead>
                <tbody>
                  {allTasks.map((task, idx) => (
                    <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{task.id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">{task.request}</td>
                      <td className="px-4 py-3">{task.title}</td>
                      <td className="px-4 py-3 text-center">{task.status}</td>
                      <td className="px-4 py-3 text-center">{task.hasTest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4 border-t border-gray-200 bg-white">
        Pipeline Test Harness • Auto-generated by pipeline orchestrator
      </footer>
    </div>
  );
}
