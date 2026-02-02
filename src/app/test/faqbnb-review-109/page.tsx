'use client';
/* eslint-disable react/no-unescaped-entities */

/**
 * Faqbnb Review 109 - Pipeline Test Harness
 *
 * Auto-generated LLM-friendly test harness for the faqbnb-review-109 pipeline.
 * Features:
 * - LLM Testing Instructions with workflow guidance
 * - Sequential test navigation with Previous/Next buttons
 * - Component tests displayed inline via iframe (no page navigation)
 * - Use case tests with step-by-step instructions
 * - Pipeline reference for context (informational only)
 *
 * @generated 2026-01-12 18:33
 * @modified 2026-01-12 19:45
 * @pipeline faqbnb-review-109
 * @usecases 11 use cases across 4 categories
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
  // Direct page navigation tests - accessible via iframe
  {
    href: '/dashboard2',
    title: 'Dashboard with Clickable Cards',
    description: 'ITEM-01: Verify Items/Rooms/Tags cards are clickable with navigation',
  },
  {
    href: '/dashboard2/create',
    title: 'Item Creation Workflow (Step Count)',
    description: 'ITEM-05: Verify workflow shows "Step X of 8" format correctly',
  },
  {
    href: '/dashboard2/items',
    title: 'Items List Page',
    description: 'ITEM-01: Target of Items card navigation',
  },
  {
    href: '/dashboard2/rooms',
    title: 'Rooms Placeholder Page',
    description: 'ITEM-01: Target of Rooms card navigation',
  },
  {
    href: '/dashboard2/tags',
    title: 'Tags Placeholder Page',
    description: 'ITEM-01: Target of Tags card navigation',
  },
  {
    href: '/dashboard2/instructions',
    title: 'Instructions Page',
    description: 'ITEM-04: New Instructions page from navigation menu',
  },
];

const allTasks = [
    { id: '1.1', request: 'REQ-196', title: 'Update WORKFLOW_STEPS constant', status: '✅', hasTest: '' },
    { id: '1.2', request: 'REQ-197', title: 'Update PROGRESS_WEIGHTS', status: '✅', hasTest: '' },
    { id: '1.3', request: 'REQ-198', title: 'Update WorkflowHeader to hide on post-workflow scr', status: '✅', hasTest: '' },
    { id: '1.4', request: 'REQ-199', title: 'Update ItemCreationWorkflow to use USER_VISIBLE_ST', status: '✅', hasTest: '' },
    { id: '1.5', request: 'REQ-200', title: 'Update useWorkflowState hook', status: '✅', hasTest: '' },
    { id: '2.1', request: 'REQ-201', title: 'Update NextActionStep component', status: '✅', hasTest: '' },
    { id: '2.2', request: 'REQ-202', title: 'Remove back arrow from post-workflow header', status: '✅', hasTest: '' },
    { id: '3.1', request: 'REQ-203', title: 'Update StatisticsCards component', status: '✅', hasTest: '' },
    { id: '3.2', request: 'REQ-204', title: 'Create placeholder routes for Rooms and Tags', status: '✅', hasTest: '' },
    { id: '4.1', request: 'REQ-205', title: 'Update navigationItems in layout', status: '✅', hasTest: '' },
    { id: '4.2', request: 'REQ-206', title: 'Add mobile label display logic', status: '✅', hasTest: '' },
    { id: '4.3', request: 'REQ-207', title: 'Create Instructions page', status: '✅', hasTest: '' },
    { id: '5.1', request: 'REQ-208', title: 'Update type definitions', status: '✅', hasTest: '' },
    { id: '5.2', request: 'REQ-209', title: 'Update CurrentItemState', status: '✅', hasTest: '' },
    { id: '5.3', request: 'REQ-210', title: 'Update PreviewSaveStep display', status: '✅', hasTest: '' },
    { id: '5.4', request: 'REQ-211', title: 'Update QR code generation', status: '✅', hasTest: '' },
];

const useCases: UseCase[] = [
  // ==========================================================================
  // HAPPY PATH USE CASES (P0 - Critical)
  // ==========================================================================
  {
    id: 'UC-HP-001',
    title: 'Complete Item Creation Workflow with Correct Step Count',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify the workflow displays "Step X of 8" correctly through all numbered steps, and post-workflow screens have no step counter.',
    expectedOutcome: 'Steps 1-8 show correct numbering, Save Item is Step 8 of 8, and What\'s Next screen has no step counter.',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2/create', component: 'ItemCreationWorkflow', expectedResult: 'Workflow starts at Step 1 of 8 (Room Selection)' },
      { step: 2, action: 'Select a room (e.g., Kitchen)', component: 'RoomSelectionStep', expectedResult: 'Advances to Step 2 of 8 (Item Type)' },
      { step: 3, action: 'Select an item type (e.g., Appliance)', component: 'ItemTypeStep', expectedResult: 'Advances to Step 3 of 8 (Specific Item)' },
      { step: 4, action: 'Choose a specific item (e.g., Coffee Machine)', component: 'SpecificItemStep', expectedResult: 'Advances to Step 4 of 8 (Purpose)' },
      { step: 5, action: 'Select a purpose (e.g., How to Use)', component: 'PurposeStep', expectedResult: 'Advances to Step 5 of 8 (Content Type)' },
      { step: 6, action: 'Select content type (e.g., Photo)', component: 'ContentTypeStep', expectedResult: 'Advances to Step 6 of 8 (Media Capture)' },
      { step: 7, action: 'Capture or upload content', component: 'MediaCaptureStep', expectedResult: 'Advances to Step 7 of 8 or Step 8 of 8 (Preview/Save)' },
      { step: 8, action: 'Verify Step 8 of 8 displays on Save Item', component: 'PreviewSaveStep', expectedResult: 'Header shows "Step 8 of 8" - this is the FINAL numbered step' },
      { step: 9, action: 'Click Save Item', component: 'PreviewSaveStep', expectedResult: 'Advances to What\'s Next screen' },
      { step: 10, action: 'Verify What\'s Next has NO step counter', component: 'NextActionStep', expectedResult: 'No "Step X of Y" visible, only exit button in header' },
    ],
  },
  {
    id: 'UC-HP-002',
    title: 'Post-Workflow Menu with 4 Action Options',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify the What\'s Next screen displays exactly 4 action options: Edit Instructions, Add New Instructions, Create New Item, Done.',
    expectedOutcome: 'Four action cards visible with correct labels, no Cancel button, no back arrow in header.',
    steps: [
      { step: 1, action: 'Complete workflow to reach What\'s Next screen', component: 'ItemCreationWorkflow', expectedResult: 'Reaches post-workflow NextActionStep' },
      { step: 2, action: 'Verify "Edit Instructions" option exists', component: 'NextActionStep', expectedResult: 'Edit Instructions card/button visible' },
      { step: 3, action: 'Verify "Add New Instructions" option exists', component: 'NextActionStep', expectedResult: 'Add New Instructions card/button visible (primary action)' },
      { step: 4, action: 'Verify "Create New Item" option exists', component: 'NextActionStep', expectedResult: 'Create New Item card/button visible' },
      { step: 5, action: 'Verify "Done" option exists', component: 'NextActionStep', expectedResult: 'Done card/button visible' },
      { step: 6, action: 'Verify NO Cancel button exists', component: 'NextActionStep', expectedResult: 'No Cancel button - item already saved' },
      { step: 7, action: 'Verify NO back arrow in header', component: 'WorkflowHeader', expectedResult: 'No back arrow visible on post-workflow screen' },
    ],
  },
  {
    id: 'UC-HP-003',
    title: 'Dashboard Cards Navigate to List Views',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify clicking Items, Rooms, and Tags cards on the dashboard navigates to their respective list views.',
    expectedOutcome: 'Each card click navigates to the correct route with appropriate content.',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'SimpleDashboard', expectedResult: 'Dashboard displays with Items, Rooms, Tags cards' },
      { step: 2, action: 'Hover over Items card', component: 'StatisticsCards', expectedResult: 'Card shows hover state (shadow, bg-gray-50)' },
      { step: 3, action: 'Click Items card', component: 'StatisticsCards', expectedResult: 'Navigates to /dashboard2/items' },
      { step: 4, action: 'Go back to dashboard', component: 'Navigation', expectedResult: 'Returns to /dashboard2' },
      { step: 5, action: 'Click Rooms card', component: 'StatisticsCards', expectedResult: 'Navigates to /dashboard2/rooms' },
      { step: 6, action: 'Go back to dashboard', component: 'Navigation', expectedResult: 'Returns to /dashboard2' },
      { step: 7, action: 'Click Tags card', component: 'StatisticsCards', expectedResult: 'Navigates to /dashboard2/tags' },
      { step: 8, action: 'Verify chevron indicators on all cards', component: 'StatisticsCards', expectedResult: 'All cards show chevron (>) indicating clickability' },
    ],
  },
  {
    id: 'UC-HP-004',
    title: 'Navigation Menu with Instructions Link',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify the navigation menu includes Dashboard, Items, Instructions, and Properties links.',
    expectedOutcome: 'All 4 navigation items visible with correct icons, Instructions page accessible.',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Layout', expectedResult: 'Navigation sidebar/header visible' },
      { step: 2, action: 'Verify Dashboard nav item exists', component: 'NavigationItems', expectedResult: 'Dashboard with LayoutDashboard icon (not Home icon)' },
      { step: 3, action: 'Verify Items nav item exists', component: 'NavigationItems', expectedResult: 'Items with Package icon' },
      { step: 4, action: 'Verify Instructions nav item exists', component: 'NavigationItems', expectedResult: 'Instructions with FileText icon' },
      { step: 5, action: 'Verify Properties nav item exists', component: 'NavigationItems', expectedResult: 'Properties with Building2 icon' },
      { step: 6, action: 'Click Instructions nav item', component: 'NavigationItems', expectedResult: 'Navigates to /dashboard2/instructions' },
      { step: 7, action: 'Verify Instructions page loads', component: 'InstructionsPage', expectedResult: 'Instructions page displays with header' },
    ],
  },
  {
    id: 'UC-HP-005',
    title: 'QR Code Displays Item Name Only',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify the QR code label shows only the physical item name (e.g., "Cabinets"), not the article title.',
    expectedOutcome: 'QR code preview shows item name, not combined item+purpose title.',
    steps: [
      { step: 1, action: 'Start item creation workflow', component: 'ItemCreationWorkflow', expectedResult: 'Workflow starts' },
      { step: 2, action: 'Select room, type, and specific item (e.g., Kitchen > Appliance > Coffee Machine)', component: 'SpecificItemStep', expectedResult: 'Item name captured as "Coffee Machine"' },
      { step: 3, action: 'Select purpose (e.g., How to Clean)', component: 'PurposeStep', expectedResult: 'Purpose selected, article title would be "How to Clean"' },
      { step: 4, action: 'Complete content capture and reach Preview/Save', component: 'PreviewSaveStep', expectedResult: 'Preview screen displays' },
      { step: 5, action: 'Verify "Item Name" field shows only item name', component: 'PreviewSaveStep', expectedResult: 'Shows "Coffee Machine" (not "How to Clean - Coffee Machine")' },
      { step: 6, action: 'Verify "Article Title" shows purpose-derived title', component: 'PreviewSaveStep', expectedResult: 'Shows "How to Clean" separately from item name' },
      { step: 7, action: 'Verify QR code preview label shows item name only', component: 'PreviewSaveStep', expectedResult: 'QR code label shows "Coffee Machine" only' },
    ],
  },

  // ==========================================================================
  // INTEGRATION USE CASES (P0/P1)
  // ==========================================================================
  {
    id: 'UC-INT-001',
    title: 'Complete Workflow Integration: Steps to Save to What\'s Next',
    category: 'integration',
    priority: 'P0',
    description: 'Verify seamless transition from numbered workflow steps through save to post-workflow menu (combines ITEM-05 and ITEM-03).',
    expectedOutcome: 'User completes workflow seeing correct step count, saves item, and sees all 4 post-workflow options.',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2/create', component: 'ItemCreationWorkflow', expectedResult: 'Step 1 of 8 displays' },
      { step: 2, action: 'Progress through Steps 1-7', component: 'Various Steps', expectedResult: 'Each step shows correct "Step N of 8" format' },
      { step: 3, action: 'Reach Save Item (Step 8 of 8)', component: 'PreviewSaveStep', expectedResult: 'Shows "Step 8 of 8" - final numbered step' },
      { step: 4, action: 'Click Save Item', component: 'PreviewSaveStep', expectedResult: 'Item saved successfully' },
      { step: 5, action: 'Observe transition to What\'s Next', component: 'NextActionStep', expectedResult: 'No step counter, no back arrow visible' },
      { step: 6, action: 'Verify all 4 action options available', component: 'NextActionStep', expectedResult: 'Edit, Add New, Create New, Done all visible' },
      { step: 7, action: 'Click "Done"', component: 'NextActionStep', expectedResult: 'Exits workflow, returns to dashboard or items list' },
    ],
  },
  {
    id: 'UC-INT-002',
    title: 'Mobile Navigation Labels Display Correctly',
    category: 'integration',
    priority: 'P1',
    description: 'Verify navigation items display abbreviated labels on mobile (D/B, Items, Instr., Prop.) and full labels on desktop.',
    expectedOutcome: 'Mobile shows abbreviated labels, desktop shows full labels.',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2 on mobile viewport (< 768px)', component: 'Dashboard2Layout', expectedResult: 'Navigation visible' },
      { step: 2, action: 'Verify Dashboard shows "D/B" on mobile', component: 'NavigationItems', expectedResult: 'Abbreviated label visible' },
      { step: 3, action: 'Verify Items shows "Items" on mobile', component: 'NavigationItems', expectedResult: 'Same label (no abbreviation needed)' },
      { step: 4, action: 'Verify Instructions shows "Instr." on mobile', component: 'NavigationItems', expectedResult: 'Abbreviated label visible' },
      { step: 5, action: 'Verify Properties shows "Prop." on mobile', component: 'NavigationItems', expectedResult: 'Abbreviated label visible' },
      { step: 6, action: 'Resize to desktop viewport (>= 768px)', component: 'Dashboard2Layout', expectedResult: 'Navigation updates' },
      { step: 7, action: 'Verify full labels display on desktop', component: 'NavigationItems', expectedResult: 'Dashboard, Items, Instructions, Properties - full names' },
    ],
  },

  // ==========================================================================
  // ERROR HANDLING USE CASES (P1)
  // ==========================================================================
  {
    id: 'UC-ERR-001',
    title: 'Post-Workflow No Back Navigation',
    category: 'error-handling',
    priority: 'P1',
    description: 'Verify users cannot accidentally navigate back from What\'s Next screen (item already saved, nothing to undo).',
    expectedOutcome: 'No back arrow visible, browser back does not return to edit mode.',
    steps: [
      { step: 1, action: 'Complete workflow and reach What\'s Next', component: 'NextActionStep', expectedResult: 'Post-workflow screen displays' },
      { step: 2, action: 'Look for back arrow in header', component: 'WorkflowHeader', expectedResult: 'No back arrow visible' },
      { step: 3, action: 'Press browser back button', component: 'Browser', expectedResult: 'Does not return to editing mode (may go to dashboard)' },
      { step: 4, action: 'Verify item remains saved', component: 'Database', expectedResult: 'Item not lost or duplicated' },
    ],
  },
  {
    id: 'UC-ERR-002',
    title: 'Dashboard Card Focus States for Accessibility',
    category: 'error-handling',
    priority: 'P1',
    description: 'Verify dashboard cards have proper keyboard focus indicators for accessibility compliance.',
    expectedOutcome: 'Cards show visible focus ring when tabbed to, supporting keyboard-only navigation.',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'SimpleDashboard', expectedResult: 'Dashboard displays' },
      { step: 2, action: 'Press Tab to focus first card', component: 'StatisticsCards', expectedResult: 'Items card receives focus' },
      { step: 3, action: 'Verify focus ring visible (Airbnb red ring)', component: 'StatisticsCards', expectedResult: 'Focus ring with focus:ring-2 focus:ring-[#FF385C]' },
      { step: 4, action: 'Press Enter to activate', component: 'StatisticsCards', expectedResult: 'Navigates same as click' },
      { step: 5, action: 'Tab through remaining cards', component: 'StatisticsCards', expectedResult: 'Each card receives visible focus' },
    ],
  },

  // ==========================================================================
  // EDGE CASE USE CASES (P2)
  // ==========================================================================
  {
    id: 'UC-EDGE-001',
    title: 'Rapid Step Navigation Does Not Break Counter',
    category: 'edge-case',
    priority: 'P2',
    description: 'Verify rapid forward/back navigation through steps maintains correct step counter display.',
    expectedOutcome: 'Step counter accurately reflects current step regardless of navigation speed.',
    steps: [
      { step: 1, action: 'Start workflow at Step 1', component: 'ItemCreationWorkflow', expectedResult: 'Step 1 of 8 displays' },
      { step: 2, action: 'Rapidly click Next through steps 1-5', component: 'WorkflowNavigation', expectedResult: 'Each step counter updates correctly' },
      { step: 3, action: 'Rapidly click Back through steps 5-1', component: 'WorkflowNavigation', expectedResult: 'Each step counter updates correctly (never shows 0 or negative)' },
      { step: 4, action: 'Navigate to Step 8 (Save)', component: 'PreviewSaveStep', expectedResult: 'Shows "Step 8 of 8" correctly' },
    ],
  },
  {
    id: 'UC-EDGE-002',
    title: 'Empty Dashboard Cards Still Navigate',
    category: 'edge-case',
    priority: 'P2',
    description: 'Verify dashboard cards with zero count still navigate correctly to their list views.',
    expectedOutcome: 'Cards with 0 items/rooms/tags are still clickable and navigate to empty list views.',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2 with no data', component: 'SimpleDashboard', expectedResult: 'Cards show 0 for counts' },
      { step: 2, action: 'Click Items card (showing 0)', component: 'StatisticsCards', expectedResult: 'Navigates to /dashboard2/items with empty state' },
      { step: 3, action: 'Return and click Rooms card (showing 0)', component: 'StatisticsCards', expectedResult: 'Navigates to /dashboard2/rooms' },
      { step: 4, action: 'Return and click Tags card (showing 0)', component: 'StatisticsCards', expectedResult: 'Navigates to /dashboard2/tags' },
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

export default function FaqbnbReview109TestPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Faqbnb Review 109</h1>
          <p className="text-xs text-gray-400">Pipeline Test Harness • Generated: 2026-01-12 18:33</p>
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
