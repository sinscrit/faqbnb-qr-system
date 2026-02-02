'use client';
/* eslint-disable react/no-unescaped-entities */

/**
 * Faqbnb Review 105 - Pipeline Test Harness
 *
 * Auto-generated LLM-friendly test harness for the faqbnb-review-105 pipeline.
 * Features:
 * - LLM Testing Instructions with workflow guidance
 * - Sequential test navigation with Previous/Next buttons
 * - Component tests displayed inline via iframe (no page navigation)
 * - Use case tests with step-by-step instructions
 * - Pipeline reference for context (informational only)
 *
 * @generated 2026-01-12 05:02
 * @pipeline faqbnb-review-105
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
    { id: '0.1', request: 'REQ-181', title: 'Update MetadataStep Labels and Help Text', status: '🔄', hasTest: '' },
    { id: '0.2', request: 'REQ-182', title: 'Update ReviewStep to Show Correct Labels', status: '✅', hasTest: '' },
    { id: '0.3', request: 'REQ-183', title: 'Add Article Purpose Field (Future Enhancement)', status: '✅', hasTest: '' },
    { id: '0.4', request: 'REQ-184', title: 'Update QR Code Label Display', status: '✅', hasTest: '' },
    { id: '1.1', request: 'REQ-185', title: 'Update Progress Stages Constant', status: '✅', hasTest: '' },
    { id: '1.2', request: 'REQ-186', title: 'Ensure Save Is Final Step', status: '✅', hasTest: '' },
    { id: '1.3', request: 'REQ-187', title: 'Update Step Count in Mobile View', status: '✅', hasTest: '' },
    { id: '2.1', request: 'REQ-187', title: 'Create WhatsNextStep Component', status: '✅', hasTest: '' },
    { id: '2.2', request: 'REQ-188', title: 'Add WhatsNextStep to Wizard Types', status: '✅', hasTest: '' },
    { id: '2.3', request: 'REQ-189', title: 'Integrate WhatsNextStep into ItemCapture Flow', status: '✅', hasTest: '' },
    { id: '2.4', request: 'REQ-190', title: 'Ensure No Navigation Controls on WhatsNextStep', status: '✅', hasTest: '' },
    { id: '3.1', request: 'REQ-190', title: 'Update KPIDashboardOverview Cards', status: '✅', hasTest: '' },
    { id: '3.2', request: 'REQ-191', title: 'Wire Up Navigation Links', status: '✅', hasTest: '' },
    { id: '3.3', request: 'REQ-192', title: 'Update UserDashboard Cards', status: '✅', hasTest: '' },
    { id: '3.4', request: 'REQ-193', title: 'Add Visual Feedback for Clickable Cards', status: '✅', hasTest: '' },
    { id: '4.1', request: 'REQ-193', title: 'Update Navigation Items Configuration', status: '✅', hasTest: '' },
    { id: '4.2', request: 'REQ-194', title: 'Add Mobile Label Support', status: '✅', hasTest: '' },
    { id: '4.3', request: 'REQ-195', title: 'Update Dashboard Layout Navigation', status: '✅', hasTest: '' },
    { id: '4.4', request: 'REQ-195', title: 'Create Instructions Page (Placeholder)', status: '✅', hasTest: '' },
];

const useCases: UseCase[] = [
  {
    id: 'UC-HP-001',
    title: 'Complete Item Creation with Correct Terminology',
    category: 'happy-path',
    priority: 'P0',
    description: 'User creates a new item through the full wizard workflow, verifying that \'Item Name\' terminology i',
    expectedOutcome: 'Item saved with correct terminology displayed throughout workflow. \'Item Name\' used consistently, not \'Title\' or \'Article Title\'',
    steps: [
      { step: 1, action: 'Navigate to Items page and click \'Add Item\'', component: 'ItemCapture', expectedResult: 'Item capture wizard opens at MetadataStep' },
      { step: 2, action: 'Verify \'Item Name\' label is displayed (not \'Title\' or \'Article Title\')', component: 'MetadataStep', expectedResult: 'Label shows \'Item Name\' with helper text explaining physical item concept' },
      { step: 3, action: 'Enter \'Coffee Maker\' as Item Name', component: 'MetadataStep', expectedResult: 'Item name accepted, field validated' },
      { step: 4, action: 'Complete content capture steps (photo/video/text)', component: 'ContentCapture', expectedResult: 'Content captured successfully' },
      { step: 5, action: 'Proceed to ReviewStep', component: 'ReviewStep', expectedResult: 'Review screen shows \'Item Name: Coffee Maker\' (not \'Title\')' },
      { step: 6, action: 'Click Save to complete workflow', component: 'ReviewStep', expectedResult: 'Item saved, transitions to WhatsNextStep' },
    ],
  },
  {
    id: 'UC-HP-002',
    title: 'Workflow Step Counter Shows 4 Stages',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify the progress indicator shows correct step count as user progresses through wizard, with Save ',
    expectedOutcome: 'Progress shows 4 stages total (Details, Content, Edit, Review). Save action is part of Review stage. WhatsNextStep has no progress indicator',
    steps: [
      { step: 1, action: 'Start item capture workflow', component: 'ItemCapture', expectedResult: 'Progress indicator shows \'Step 1 of 4\' on mobile or stage 1 highlighted' },
      { step: 2, action: 'Progress through Details stage', component: 'ProgressIndicator', expectedResult: 'Stage 1 (Details) shows as current/completed' },
      { step: 3, action: 'Move to Content stage', component: 'ProgressIndicator', expectedResult: 'Stage 2 (Content) shows as current' },
      { step: 4, action: 'Complete content and move to Edit stage', component: 'ProgressIndicator', expectedResult: 'Stage 3 (Edit) shows as current' },
      { step: 5, action: 'Move to Review stage', component: 'ProgressIndicator', expectedResult: 'Stage 4 (Review) shows as current - this is final numbered stage' },
      { step: 6, action: 'Click Save to submit', component: 'ReviewStep', expectedResult: 'Transitions to WhatsNextStep with NO step number visible' },
    ],
  },
  {
    id: 'UC-HP-003',
    title: 'Post-Save WhatsNextStep Menu Options',
    category: 'happy-path',
    priority: 'P0',
    description: 'After saving an item, user sees the WhatsNextStep menu with 4 action options and no navigation contr',
    expectedOutcome: 'WhatsNextStep shows 4 menu options with correct icons. No Cancel/Back buttons. Progress indicator hidden. \'Add New Instructions\' is primary action',
    steps: [
      { step: 1, action: 'Complete item save from ReviewStep', component: 'ReviewStep', expectedResult: 'WhatsNextStep screen displays with success header' },
      { step: 2, action: 'Verify success message shows saved item name', component: 'WhatsNextStep', expectedResult: '\'Item Saved!\' header with item name displayed' },
      { step: 3, action: 'Verify \'Edit Instructions\' button is present', component: 'WhatsNextStep', expectedResult: 'Edit Instructions button with Edit icon visible' },
      { step: 4, action: 'Verify \'Add New Instructions\' button with primary styling', component: 'WhatsNextStep', expectedResult: 'Add New Instructions button highlighted as primary action (blue)' },
      { step: 5, action: 'Verify \'Create New Item\' button is present', component: 'WhatsNextStep', expectedResult: 'Create New Item button with Package icon visible' },
      { step: 6, action: 'Verify \'Done\' text button is present', component: 'WhatsNextStep', expectedResult: 'Done button at bottom to return to dashboard' },
      { step: 7, action: 'Verify NO back arrow or Cancel button exists', component: 'WhatsNextStep', expectedResult: 'No navigation controls present (can\'t undo a save)' },
    ],
  },
  {
    id: 'UC-HP-004',
    title: 'Dashboard Cards Navigate to List Views',
    category: 'happy-path',
    priority: 'P0',
    description: 'Dashboard KPI cards (Properties, Items) are clickable and navigate to their respective list views wh',
    expectedOutcome: 'All dashboard KPI cards are clickable with hover/focus states. Clicking navigates to correct list view. Works on both UserDashboard and KPIDashboardOverview',
    steps: [
      { step: 1, action: 'Navigate to main Dashboard', component: 'Dashboard', expectedResult: 'Dashboard displays with KPI cards' },
      { step: 2, action: 'Hover over \'Properties\' card', component: 'UserDashboard', expectedResult: 'Card shows hover state (shadow increase, cursor pointer)' },
      { step: 3, action: 'Click \'Properties\' card', component: 'UserDashboard', expectedResult: 'Navigates to /dashboard/properties' },
      { step: 4, action: 'Return to Dashboard', component: 'Navigation', expectedResult: 'Back on dashboard' },
      { step: 5, action: 'Click \'Items\' card', component: 'UserDashboard', expectedResult: 'Navigates to /dashboard/items' },
      { step: 6, action: 'Verify keyboard focus works on cards', component: 'UserDashboard', expectedResult: 'Cards show visible focus ring when tabbed to' },
    ],
  },
  {
    id: 'UC-HP-005',
    title: 'Navigation Menu Shows Instructions with Mobile Labels',
    category: 'happy-path',
    priority: 'P0',
    description: 'Navigation menu displays correctly with Instructions item and abbreviated labels on mobile viewport',
    expectedOutcome: 'Navigation menu shows 4 items with correct icons. Mobile shows abbreviated labels (D/B, Instr., Prop.). Instructions page accessible',
    steps: [
      { step: 1, action: 'View navigation menu on desktop', component: 'RoleBasedNavigation', expectedResult: 'Shows: Dashboard, Items, Instructions, Properties with full labels' },
      { step: 2, action: 'Verify Dashboard uses grid icon (LayoutDashboard)', component: 'RoleBasedNavigation', expectedResult: 'Dashboard icon is grid/layout pattern, NOT house' },
      { step: 3, action: 'Verify Instructions menu item exists with FileText icon', component: 'RoleBasedNavigation', expectedResult: 'Instructions menu item present with document icon' },
      { step: 4, action: 'Click Instructions menu item', component: 'RoleBasedNavigation', expectedResult: 'Navigates to /dashboard/instructions' },
      { step: 5, action: 'Resize to mobile viewport (< 768px)', component: 'Navigation', expectedResult: 'Mobile navigation visible' },
      { step: 6, action: 'Verify mobile labels: D/B, Items, Instr., Prop.', component: 'RoleBasedNavigation', expectedResult: 'Abbreviated labels displayed on mobile' },
    ],
  },
  {
    id: 'UC-ERR-001',
    title: 'Item Name Validation Error Message',
    category: 'error-handling',
    priority: 'P1',
    description: 'When Item Name field is empty or invalid, error message correctly references \'Item name\' not \'Tit',
    expectedOutcome: 'Validation error uses \'Item name\' terminology consistently',
    steps: [
      { step: 1, action: 'Leave Item Name field empty', component: 'MetadataStep', expectedResult: 'Field shows empty state' },
      { step: 2, action: 'Try to proceed to next step', component: 'MetadataStep', expectedResult: 'Validation error appears' },
      { step: 3, action: 'Verify error message text', component: 'MetadataStep', expectedResult: 'Error says \'Item name is required\' NOT \'Title is required\'' },
    ],
  },
  {
    id: 'UC-ERR-002',
    title: 'Dashboard Card Click with Loading State',
    category: 'error-handling',
    priority: 'P1',
    description: 'Dashboard cards remain clickable and functional even when showing loading state',
    expectedOutcome: 'Card navigation works regardless of loading state. Users are not blocked by loading spinners',
    steps: [
      { step: 1, action: 'Observe dashboard during data load', component: 'UserDashboard', expectedResult: 'Cards may show loading skeleton or spinner' },
      { step: 2, action: 'Click on a card during loading state', component: 'UserDashboard', expectedResult: 'Navigation still works, goes to list view' },
      { step: 3, action: 'Wait for data to load on list view', component: 'ItemsList', expectedResult: 'List view loads with data' },
    ],
  },
  {
    id: 'UC-EDGE-001',
    title: 'QR Code Label Shows Item Name Only',
    category: 'edge-case',
    priority: 'P1',
    description: 'When QR code is generated, the label displays only the Item Name, not a combination of \'Purpose - I',
    expectedOutcome: 'QR code label displays Item Name only. Article purpose/title not included in QR label',
    steps: [
      { step: 1, action: 'Create item named \'Steamer\'', component: 'ItemCapture', expectedResult: 'Item saved with name \'Steamer\'' },
      { step: 2, action: 'View generated QR code', component: 'QRCodeDisplay', expectedResult: 'QR code visible' },
      { step: 3, action: 'Check QR code label text', component: 'QRCodeDisplay', expectedResult: 'Label shows \'Steamer\' NOT \'How to Clean - Steamer\'' },
    ],
  },
  {
    id: 'UC-EDGE-002',
    title: 'WhatsNextStep Action Handlers All Functional',
    category: 'edge-case',
    priority: 'P1',
    description: 'All four action buttons on WhatsNextStep trigger their respective handlers correctly',
    expectedOutcome: 'All 4 action buttons work correctly. Each triggers appropriate navigation or state change',
    steps: [
      { step: 1, action: 'Click \'Edit Instructions\'', component: 'WhatsNextStep', expectedResult: 'onEditInstructions handler called, navigates to edit view' },
      { step: 2, action: 'Return to WhatsNextStep, click \'Add New Instructions\'', component: 'WhatsNextStep', expectedResult: 'onAddNewInstructions handler called, starts new instruction for same item' },
      { step: 3, action: 'Return to WhatsNextStep, click \'Create New Item\'', component: 'WhatsNextStep', expectedResult: 'onCreateNewItem handler called, resets wizard for new item' },
      { step: 4, action: 'Return to WhatsNextStep, click \'Done\'', component: 'WhatsNextStep', expectedResult: 'onDone handler called, returns to dashboard' },
    ],
  },
  {
    id: 'UC-INT-001',
    title: 'Complete Item Creation to Dashboard Navigation Flow',
    category: 'integration',
    priority: 'P0',
    description: 'Full end-to-end flow: Create item → Save → WhatsNextStep → Done → Dashboard → Click Items card → See',
    expectedOutcome: 'Complete user journey works. Terminology consistent. Dashboard cards navigate correctly. New item appears in list',
    steps: [
      { step: 1, action: 'Start item creation from Dashboard', component: 'Dashboard', expectedResult: 'ItemCapture wizard opens' },
      { step: 2, action: 'Enter \'Test Appliance\' as Item Name', component: 'MetadataStep', expectedResult: 'Name field shows \'Item Name\' label' },
      { step: 3, action: 'Complete workflow through to Review (Stage 4 of 4)', component: 'ItemCapture', expectedResult: 'ReviewStep shows \'Item Name: Test Appliance\'' },
      { step: 4, action: 'Click Save', component: 'ReviewStep', expectedResult: 'Item saved, WhatsNextStep appears' },
      { step: 5, action: 'Click \'Done - Return to Dashboard\'', component: 'WhatsNextStep', expectedResult: 'Returns to Dashboard' },
      { step: 6, action: 'Click Items card on Dashboard', component: 'UserDashboard', expectedResult: 'Navigates to /dashboard/items' },
      { step: 7, action: 'Verify \'Test Appliance\' appears in list', component: 'ItemsList', expectedResult: 'New item visible in list' },
    ],
  },
  {
    id: 'UC-INT-002',
    title: 'Mobile Responsive Navigation Integration',
    category: 'integration',
    priority: 'P1',
    description: 'Navigation and dashboard work correctly on mobile viewport with abbreviated labels',
    expectedOutcome: 'Mobile experience works end-to-end. Abbreviated labels display. Touch interactions work. Progress indicator mobile-friendly',
    steps: [
      { step: 1, action: 'Load dashboard on mobile', component: 'Dashboard', expectedResult: 'Mobile layout displays correctly' },
      { step: 2, action: 'Verify navigation shows abbreviated labels', component: 'RoleBasedNavigation', expectedResult: 'Shows D/B, Items, Instr., Prop.' },
      { step: 3, action: 'Tap Items card', component: 'UserDashboard', expectedResult: 'Card responds to tap, navigates to items' },
      { step: 4, action: 'Tap \'Instr.\' in navigation', component: 'RoleBasedNavigation', expectedResult: 'Navigates to Instructions page' },
      { step: 5, action: 'Start item creation', component: 'ItemCapture', expectedResult: 'Mobile progress shows \'Step X of 4\'' },
    ],
  },
  {
    id: 'UC-INT-003',
    title: 'Admin Dashboard Cards Integration',
    category: 'integration',
    priority: 'P1',
    description: 'Admin/KPI dashboard cards are also clickable and navigate correctly (KPIDashboardOverview)',
    expectedOutcome: 'KPIDashboardOverview cards work same as UserDashboard cards. Consistent UX across dashboard types',
    steps: [
      { step: 1, action: 'View admin KPI dashboard', component: 'KPIDashboardOverview', expectedResult: 'KPI cards displayed with analytics data' },
      { step: 2, action: 'Click \'Total Properties\' card', component: 'KPIDashboardOverview', expectedResult: 'Navigates to /dashboard/properties' },
      { step: 3, action: 'Return and click \'Total Items\' card', component: 'KPIDashboardOverview', expectedResult: 'Navigates to /dashboard/items' },
      { step: 4, action: 'Verify hover states on cards', component: 'KPIDashboardOverview', expectedResult: 'Cards show shadow/border changes on hover' },
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

export default function FaqbnbReview105TestPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Faqbnb Review 105</h1>
          <p className="text-xs text-gray-400">Pipeline Test Harness • Generated: 2026-01-12 05:02</p>
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
