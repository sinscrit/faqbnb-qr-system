'use client';

/**
 * Item Creation Workflow - Pipeline Test Harness
 *
 * Auto-generated LLM-friendly test harness for the item-creation-workflow pipeline.
 * Features:
 * - LLM Testing Instructions with workflow guidance
 * - Sequential test navigation with Previous/Next buttons
 * - Component tests displayed inline via iframe (no page navigation)
 * - Use case tests with step-by-step instructions
 * - Pipeline reference for context (informational only)
 *
 * @generated 2026-01-05 22:04
 * @pipeline item-creation-workflow
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
  {
    href: '/test/basic-shared-components',
    title: 'REQ-097: Basic Shared Components',
    description: 'Basic Shared Components',
  },
  {
    href: '/test/content-type-step',
    title: 'REQ-103: Content Type Step',
    description: 'Content Type Step',
  },
  {
    href: '/test/print-options-panel',
    title: 'REQ-110: Print Options Panel',
    description: 'Print Options Panel',
  },
];

const allTasks = [
    { id: '1.1', request: 'REQ-093', title: 'Component Scaffold & Type Definitions', status: '✅', hasTest: '' },
    { id: '1.2', request: 'REQ-094', title: 'Workflow State Machine', status: '✅', hasTest: '' },
    { id: '1.3', request: 'REQ-095', title: 'Main Workflow Component', status: '✅', hasTest: '' },
    { id: '1.4', request: 'REQ-096', title: 'Session Persistence', status: '✅', hasTest: '' },
    { id: '1.5', request: 'REQ-097', title: 'Basic Shared Components', status: '✅', hasTest: '🧪' },
    { id: '2.1', request: 'REQ-098', title: 'Room Selection Step', status: '✅', hasTest: '' },
    { id: '2.2', request: 'REQ-099', title: 'Item Type Selection Step', status: '✅', hasTest: '' },
    { id: '2.3', request: 'REQ-100', title: 'Specific Item Selection Step', status: '✅', hasTest: '' },
    { id: '2.4', request: 'REQ-101', title: 'Suggestions Matrix Data', status: '✅', hasTest: '' },
    { id: '3.1', request: 'REQ-102', title: 'Content Source Step', status: '✅', hasTest: '' },
    { id: '3.2', request: 'REQ-103', title: 'Content Type Step', status: '✅', hasTest: '🧪' },
    { id: '3.3', request: 'REQ-104', title: 'URL Content with Preview', status: '✅', hasTest: '' },
    { id: '4.1', request: 'REQ-105', title: 'Content Creation Step', status: '✅', hasTest: '' },
    { id: '4.2', request: 'REQ-106', title: 'Preview & Save Step', status: '✅', hasTest: '' },
    { id: '5.1', request: 'REQ-107', title: 'Next Action Step', status: '✅', hasTest: '' },
    { id: '5.2', request: 'REQ-108', title: 'Multi-Content Item Support', status: '✅', hasTest: '' },
    { id: '6.1', request: 'REQ-109', title: 'Session Summary Step', status: '✅', hasTest: '' },
    { id: '6.2', request: 'REQ-110', title: 'Print Options Panel', status: '✅', hasTest: '🧪' },
    { id: '6.3', request: 'REQ-111', title: 'QR Code Integration', status: '✅', hasTest: '' },
    { id: '6.4', request: 'REQ-112', title: 'PDF Generation Integration', status: '✅', hasTest: '' },
    { id: '7.1', request: 'REQ-113', title: 'Error Handling & Edge Cases', status: '✅', hasTest: '' },
    { id: '7.2', request: 'REQ-114', title: 'Accessibility & Mobile Optimization', status: '✅', hasTest: '' },
    { id: '8.1', request: 'REQ-115', title: 'Unit Tests', status: '✅', hasTest: '' },
    { id: '8.2', request: 'REQ-116', title: 'Integration Tests', status: '✅', hasTest: '' },
    { id: '8.3', request: 'REQ-118', title: 'Documentation', status: '✅', hasTest: '' },
];

const useCases: UseCase[] = [
  {
    id: 'UC-HP-001',
    title: 'Complete Video Item Creation Flow',
    category: 'happy-path',
    priority: 'P0',
    description: 'User creates a new item with video content from start to finish, representing the primary use case f',
    expectedOutcome: 'Item saved with video content, QR code generated and visible in session summary',
    steps: [
      { step: 1, action: 'Select \'Kitchen\' room from the room grid', component: 'RoomSelectionStep', expectedResult: 'Kitchen room card shows selected state, navigation enabled' },
      { step: 2, action: 'Select \'Appliance\' item type', component: 'ItemTypeStep', expectedResult: 'Appliance card selected, proceeds to specific item step' },
      { step: 3, action: 'Choose \'Coffee Machine\' from suggestions or enter custom name', component: 'SpecificItemStep', expectedResult: 'Item name auto-generated as \'Kitchen - Coffee Machine\'' },
      { step: 4, action: 'Select \'Create Now\' content source option', component: 'ContentSourceStep', expectedResult: 'Content source set, proceeds to content type selection' },
      { step: 5, action: 'Select \'Record Video\' content type', component: 'ContentTypeStep', expectedResult: 'Camera interface activates for video recording' },
      { step: 6, action: 'Record 10-second instructional video', component: 'ContentCreationStep', expectedResult: 'Video captured, thumbnail generated, proceeds to preview' },
      { step: 7, action: 'Review preview and click \'Save Item\'', component: 'PreviewSaveStep', expectedResult: 'Item saved successfully, success toast displayed' },
      { step: 8, action: 'Select \'I\'m Done\' at next action prompt', component: 'NextActionStep', expectedResult: 'Proceeds to session summary' },
      { step: 9, action: 'Review session summary with created item', component: 'SessionSummaryStep', expectedResult: 'Item listed with thumbnail and QR code' },
    ],
  },
  {
    id: 'UC-HP-002',
    title: 'Create Item with Uploaded Photo',
    category: 'happy-path',
    priority: 'P0',
    description: 'User uploads an existing photo for an item instead of creating new content',
    expectedOutcome: 'Item created successfully with uploaded photo content',
    steps: [
      { step: 1, action: 'Select \'Laundry\' room', component: 'RoomSelectionStep', expectedResult: 'Laundry room selected' },
      { step: 2, action: 'Select \'Appliance\' type', component: 'ItemTypeStep', expectedResult: 'Type selected' },
      { step: 3, action: 'Choose \'Washer\' from suggestions', component: 'SpecificItemStep', expectedResult: 'Item name set to \'Laundry - Washer\'' },
      { step: 4, action: 'Select \'I have content\' option', component: 'ContentSourceStep', expectedResult: 'Upload options displayed' },
      { step: 5, action: 'Select \'Upload Photo\' content type', component: 'ContentTypeStep', expectedResult: 'File picker opens' },
      { step: 6, action: 'Select photo file from device', component: 'ContentCreationStep', expectedResult: 'Photo uploaded and preview displayed' },
      { step: 7, action: 'Save item', component: 'PreviewSaveStep', expectedResult: 'Item saved with photo content' },
    ],
  },
  {
    id: 'UC-HP-003',
    title: 'Create Item with URL Content',
    category: 'happy-path',
    priority: 'P1',
    description: 'User creates an item by pasting a URL (e.g., YouTube instruction video or manufacturer manual)',
    expectedOutcome: 'Item created with URL content, Open Graph preview displayed',
    steps: [
      { step: 1, action: 'Select \'Living Room\' room', component: 'RoomSelectionStep', expectedResult: 'Room selected' },
      { step: 2, action: 'Select \'Room Item\' type', component: 'ItemTypeStep', expectedResult: 'Type selected' },
      { step: 3, action: 'Choose \'TV/Entertainment Center\'', component: 'SpecificItemStep', expectedResult: 'Item name set' },
      { step: 4, action: 'Select \'I have content\'', component: 'ContentSourceStep', expectedResult: 'Upload options displayed' },
      { step: 5, action: 'Select \'Paste URL\'', component: 'ContentTypeStep', expectedResult: 'URL input displayed' },
      { step: 6, action: 'Paste YouTube setup video URL', component: 'ContentCreationStep', expectedResult: 'URL preview fetched with title and thumbnail' },
      { step: 7, action: 'Save item', component: 'PreviewSaveStep', expectedResult: 'Item saved with URL content' },
    ],
  },
  {
    id: 'UC-HP-004',
    title: 'Create Text-Only Item for General Info',
    category: 'happy-path',
    priority: 'P1',
    description: 'User creates a general information item with text instructions (e.g., WiFi password, house rules)',
    expectedOutcome: 'General info item created with text content',
    steps: [
      { step: 1, action: 'Select \'General\' room', component: 'RoomSelectionStep', expectedResult: 'General room selected, item type step may be skipped' },
      { step: 2, action: 'Select \'General Info\' type if prompted', component: 'ItemTypeStep', expectedResult: 'Type selected or auto-selected' },
      { step: 3, action: 'Enter \'WiFi Password\' as item name', component: 'SpecificItemStep', expectedResult: 'Custom item name accepted' },
      { step: 4, action: 'Select \'Create Now\'', component: 'ContentSourceStep', expectedResult: 'Create options displayed' },
      { step: 5, action: 'Select \'Write Text\'', component: 'ContentTypeStep', expectedResult: 'Text editor displayed' },
      { step: 6, action: 'Enter WiFi network name and password', component: 'ContentCreationStep', expectedResult: 'Text content captured' },
      { step: 7, action: 'Save item', component: 'PreviewSaveStep', expectedResult: 'Item saved with text content' },
    ],
  },
  {
    id: 'UC-HP-005',
    title: 'Create Multiple Items in Single Session',
    category: 'happy-path',
    priority: 'P0',
    description: 'User creates multiple items in sequence using \'Tag New Item\' option',
    expectedOutcome: 'Session summary shows all 3 created items with QR codes ready for printing',
    steps: [
      { step: 1, action: 'Complete first item creation (Kitchen - Stove)', component: 'Multiple Steps', expectedResult: 'First item saved' },
      { step: 2, action: 'At next action, select \'Tag New Item\'', component: 'NextActionStep', expectedResult: 'Returns to room selection step' },
      { step: 3, action: 'Create second item (Bathroom - Shower)', component: 'Multiple Steps', expectedResult: 'Second item saved' },
      { step: 4, action: 'At next action, select \'Tag New Item\'', component: 'NextActionStep', expectedResult: 'Returns to room selection' },
      { step: 5, action: 'Create third item (Bedroom - Thermostat)', component: 'Multiple Steps', expectedResult: 'Third item saved' },
      { step: 6, action: 'At next action, select \'I\'m Done\'', component: 'NextActionStep', expectedResult: 'Proceeds to session summary' },
      { step: 7, action: 'Review all 3 items in summary', component: 'SessionSummaryStep', expectedResult: 'All 3 items displayed with thumbnails' },
    ],
  },
  {
    id: 'UC-ERR-001',
    title: 'Handle Camera Permission Denied',
    category: 'error-handling',
    priority: 'P1',
    description: 'System gracefully handles when user denies camera permission for video recording',
    expectedOutcome: 'User can still complete item creation by uploading video instead of recording',
    steps: [
      { step: 1, action: 'Navigate to content creation with \'Record Video\' selected', component: 'ContentTypeStep', expectedResult: 'Camera permission requested' },
      { step: 2, action: 'Deny camera permission in browser prompt', component: 'ContentCreationStep', expectedResult: 'CameraPermissionFallback component displayed' },
      { step: 3, action: 'View fallback UI options', component: 'ContentCreationStep', expectedResult: 'Options to retry, upload instead, or go back shown' },
      { step: 4, action: 'Select \'Upload Video Instead\' option', component: 'ContentCreationStep', expectedResult: 'File picker opens for video upload' },
    ],
  },
  {
    id: 'UC-ERR-002',
    title: 'Handle Network Error During URL Preview',
    category: 'error-handling',
    priority: 'P1',
    description: 'System handles network failure when fetching URL metadata',
    expectedOutcome: 'User can proceed with URL content despite preview fetch failure',
    steps: [
      { step: 1, action: 'Select \'Paste URL\' content type', component: 'ContentTypeStep', expectedResult: 'URL input displayed' },
      { step: 2, action: 'Paste a valid URL', component: 'ContentCreationStep', expectedResult: 'Loading state shown while fetching preview' },
      { step: 3, action: 'Network request fails', component: 'ContentCreationStep', expectedResult: 'Error state displayed with retry option' },
      { step: 4, action: 'Click \'Retry\' button', component: 'ContentCreationStep', expectedResult: 'Preview fetch retried' },
      { step: 5, action: 'Or select \'Continue Without Preview\'', component: 'ContentCreationStep', expectedResult: 'URL saved without preview, warning displayed' },
    ],
  },
  {
    id: 'UC-ERR-003',
    title: 'Handle Empty Session Exit',
    category: 'error-handling',
    priority: 'P2',
    description: 'Confirm dialog shown when user tries to exit without creating any items',
    expectedOutcome: 'User is warned before accidentally losing an empty session',
    steps: [
      { step: 1, action: 'Start workflow and progress to any step', component: 'WorkflowHeader', expectedResult: 'Workflow in progress' },
      { step: 2, action: 'Click exit/close button in header', component: 'WorkflowHeader', expectedResult: 'ConfirmExitDialog displayed' },
      { step: 3, action: 'Dialog shows \'No items created yet\' message', component: 'ConfirmExitDialog', expectedResult: 'Warning about losing progress shown' },
      { step: 4, action: 'Click \'Continue Editing\' to stay', component: 'ConfirmExitDialog', expectedResult: 'Dialog closes, user remains in workflow' },
      { step: 5, action: 'Or click \'Exit Anyway\' to leave', component: 'ConfirmExitDialog', expectedResult: 'Session discarded, user exits workflow' },
    ],
  },
  {
    id: 'UC-ERR-004',
    title: 'Handle Duplicate Item Name',
    category: 'error-handling',
    priority: 'P2',
    description: 'System handles attempt to create item with duplicate name',
    expectedOutcome: 'Duplicate names are automatically handled with incremental suffix',
    steps: [
      { step: 1, action: 'Select Kitchen room and Appliance type', component: 'ItemTypeStep', expectedResult: 'Navigates to specific item selection' },
      { step: 2, action: 'Select \'Stove/Oven\' from suggestions', component: 'SpecificItemStep', expectedResult: 'Name \'Kitchen - Stove\' auto-generated' },
      { step: 3, action: 'Previously created item shown grayed out', component: 'SpecificItemStep', expectedResult: 'Visual indicator that item exists' },
      { step: 4, action: 'System suggests unique name \'Kitchen - Stove (2)\'', component: 'SpecificItemStep', expectedResult: 'Duplicate name handled automatically' },
      { step: 5, action: 'User can edit name manually if desired', component: 'ItemNameEditor', expectedResult: 'Custom unique name accepted' },
    ],
  },
  {
    id: 'UC-EDGE-001',
    title: 'Session Recovery After Browser Refresh',
    category: 'edge-case',
    priority: 'P0',
    description: 'Session state is preserved and recoverable after accidental browser refresh',
    expectedOutcome: 'User can continue from where they left off without data loss',
    steps: [
      { step: 1, action: 'Start workflow and complete 3 steps (room, type, item)', component: 'Multiple Steps', expectedResult: 'Session state saved to localStorage' },
      { step: 2, action: 'Refresh browser (F5 or Cmd+R)', component: 'Browser', expectedResult: 'Page reloads' },
      { step: 3, action: 'Return to workflow page', component: 'ItemCreationWorkflow', expectedResult: 'Session recovery banner displayed' },
      { step: 4, action: 'Click \'Resume Session\' in banner', component: 'SessionRecoveryBanner', expectedResult: 'Workflow restored to previous step' },
      { step: 5, action: 'Verify previous selections preserved', component: 'Multiple Steps', expectedResult: 'Room, type, and item selections intact' },
    ],
  },
  {
    id: 'UC-EDGE-002',
    title: 'Long Item Name Truncation',
    category: 'edge-case',
    priority: 'P2',
    description: 'System handles very long item names with proper truncation and tooltip',
    expectedOutcome: 'Long names are truncated consistently with full text accessible via tooltip',
    steps: [
      { step: 1, action: 'Select room and item type', component: 'Multiple Steps', expectedResult: 'Navigates to specific item' },
      { step: 2, action: 'Enter very long custom item name (100+ characters)', component: 'ItemNameEditor', expectedResult: 'Name accepted' },
      { step: 3, action: 'View item in preview step', component: 'PreviewSaveStep', expectedResult: 'Name truncated with ellipsis (...)' },
      { step: 4, action: 'Hover over truncated name', component: 'TruncatedText', expectedResult: 'Full name shown in tooltip' },
      { step: 5, action: 'Save item and view in session summary', component: 'SessionSummaryStep', expectedResult: 'Consistent truncation in SessionItemCard' },
    ],
  },
  {
    id: 'UC-EDGE-003',
    title: 'Custom \'Other\' Room Selection',
    category: 'edge-case',
    priority: 'P2',
    description: 'User selects \'Other\' room and enters custom room name',
    expectedOutcome: 'Custom room name used in item naming and categorization',
    steps: [
      { step: 1, action: 'Click \'Other\' room option in grid', component: 'RoomSelectionStep', expectedResult: 'Custom input field appears' },
      { step: 2, action: 'Enter custom room name \'Wine Cellar\'', component: 'RoomSelectionStep', expectedResult: 'Custom name validated' },
      { step: 3, action: 'Continue with item creation', component: 'ItemTypeStep', expectedResult: 'Suggestions may be generic or empty' },
      { step: 4, action: 'Enter custom item name', component: 'SpecificItemStep', expectedResult: 'Name auto-generates as \'Wine Cellar - [item]\'' },
      { step: 5, action: 'Complete item creation', component: 'PreviewSaveStep', expectedResult: 'Item saved with custom room' },
    ],
  },
  {
    id: 'UC-INT-001',
    title: 'Multi-Content Item with Video and PDF',
    category: 'integration',
    priority: 'P1',
    description: 'User creates an item with multiple content pieces using \'Add More to Item\'',
    expectedOutcome: 'Item contains both video and PDF content in user-specified order',
    steps: [
      { step: 1, action: 'Create item with video content', component: 'Multiple Steps', expectedResult: 'Video captured for item' },
      { step: 2, action: 'At next action, select \'Add More to This Item\'', component: 'NextActionStep', expectedResult: 'Returns to content source selection' },
      { step: 3, action: 'Select \'I have content\' → \'Upload PDF\'', component: 'ContentTypeStep', expectedResult: 'File picker opens' },
      { step: 4, action: 'Upload manufacturer manual PDF', component: 'ContentCreationStep', expectedResult: 'PDF added to content pieces' },
      { step: 5, action: 'View preview with both content pieces', component: 'PreviewSaveStep', expectedResult: 'Both video and PDF displayed' },
      { step: 6, action: 'Reorder content pieces via drag-and-drop', component: 'ContentPieceCard', expectedResult: 'Order updated successfully' },
      { step: 7, action: 'Save item', component: 'PreviewSaveStep', expectedResult: 'Item saved with multiple content pieces' },
    ],
  },
  {
    id: 'UC-INT-002',
    title: 'Generate and Print QR Codes PDF',
    category: 'integration',
    priority: 'P0',
    description: 'User generates a PDF with QR codes for all session items and prints',
    expectedOutcome: 'Printable PDF with QR codes for all session items, with item names as labels',
    steps: [
      { step: 1, action: 'Complete session with 3+ items created', component: 'SessionSummaryStep', expectedResult: 'Session summary displays all items' },
      { step: 2, action: 'Open Print Options panel', component: 'PrintOptionsPanel', expectedResult: 'Print scope options displayed' },
      { step: 3, action: 'Select \'All items\' print scope', component: 'PrintOptionsPanel', expectedResult: 'All items selected for printing' },
      { step: 4, action: 'Click \'Generate PDF\' button', component: 'PrintOptionsPanel', expectedResult: 'QR code generation progress shown' },
      { step: 5, action: 'QR codes generated for each item', component: 'useQRCodeGeneration', expectedResult: 'All QR codes ready' },
      { step: 6, action: 'PDF generated with QR codes and labels', component: 'PDF Generation', expectedResult: 'PDF ready for download' },
      { step: 7, action: 'Click \'Print Directly\' option', component: 'PrintOptionsPanel', expectedResult: 'Print dialog opens' },
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

export default function ItemCreationWorkflowTestPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Item Creation Workflow</h1>
          <p className="text-xs text-gray-400">Pipeline Test Harness • Generated: 2026-01-05 22:04</p>
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
