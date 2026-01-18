'use client';

/**
 * Simple Dashboard - Pipeline Test Harness
 *
 * Auto-generated LLM-friendly test harness for the simple-dashboard pipeline.
 * Features:
 * - LLM Testing Instructions with workflow guidance
 * - Sequential test navigation with Previous/Next buttons
 * - Component tests displayed inline via iframe (no page navigation)
 * - Use case tests with step-by-step instructions
 * - Pipeline reference for context (informational only)
 *
 * @generated 2026-01-06 12:51
 * @pipeline simple-dashboard
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
    { id: '1.1', request: 'REQ-119', title: 'Remove Account References from Layout', status: '✅', hasTest: '' },
    { id: '1.2', request: 'REQ-120', title: 'Remove Account References from Dashboard Page', status: '✅', hasTest: '' },
    { id: '1.3', request: 'REQ-121', title: 'Apply Airbnb Design System Colors', status: '✅', hasTest: '' },
    { id: '2.1', request: 'REQ-122', title: 'Create Dashboard Stats API', status: '✅', hasTest: '' },
    { id: '2.2', request: 'REQ-123', title: 'Create useDashboardStats Hook', status: '✅', hasTest: '' },
    { id: '2.3', request: 'REQ-124', title: 'Create StatisticsCards Component', status: '✅', hasTest: '' },
    { id: '2.4', request: 'REQ-125', title: 'Integrate into Dashboard Page', status: '✅', hasTest: '' },
    { id: '3.1', request: 'REQ-126', title: 'Create ActionButtons Component', status: '✅', hasTest: '' },
    { id: '3.2', request: 'REQ-127', title: 'Implement Print QR Code Navigation Logic', status: '✅', hasTest: '' },
    { id: '3.3', request: 'REQ-128', title: 'Create Print Flow Route', status: '✅', hasTest: '' },
    { id: '3.4', request: 'REQ-129', title: 'Replace Existing Action Cards', status: '✅', hasTest: '' },
    { id: '4.1', request: 'REQ-130', title: 'Create PropertySection Component', status: '✅', hasTest: '' },
    { id: '4.2', request: 'REQ-131', title: 'Create Property Edit Modal', status: '✅', hasTest: '' },
    { id: '4.3', request: 'REQ-132', title: 'Create Add Property Modal', status: '✅', hasTest: '' },
    { id: '4.4', request: 'REQ-133', title: 'Integrate Property Section', status: '✅', hasTest: '' },
    { id: '5.1', request: 'REQ-134', title: 'Statistics Per Property', status: '✅', hasTest: '' },
    { id: '5.2', request: 'REQ-135', title: 'Print Flow Property Selector', status: '✅', hasTest: '' },
    { id: '5.3', request: 'REQ-136', title: 'Dashboard Progressive UI', status: '✅', hasTest: '' },
    { id: '6.1', request: 'REQ-137', title: 'Empty States', status: '✅', hasTest: '' },
    { id: '6.2', request: 'REQ-138', title: 'Loading States', status: '✅', hasTest: '' },
    { id: '6.3', request: 'REQ-139', title: 'Accessibility', status: '✅', hasTest: '' },
    { id: '6.4', request: 'REQ-140', title: 'Mobile Responsive', status: '✅', hasTest: '' },
];

const useCases: UseCase[] = [
  {
    id: 'UC-HP-001',
    title: 'View Dashboard with Statistics',
    category: 'happy-path',
    priority: 'P0',
    description: 'User navigates to dashboard and sees statistics cards displaying Items, Rooms, and Tags counts',
    expectedOutcome: 'Dashboard displays accurate statistics for user\'s items, rooms, and tags',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Dashboard loads with welcome header' },
      { step: 2, action: 'Observe Statistics Cards section', component: 'StatisticsCards', expectedResult: 'Three cards display: Items count, Rooms count, Tags count' },
      { step: 3, action: 'Verify counts are accurate', component: 'useDashboardStats', expectedResult: 'Counts match actual data in database' },
    ],
  },
  {
    id: 'UC-HP-002',
    title: 'Create New Item via Dashboard Action Button',
    category: 'happy-path',
    priority: 'P0',
    description: 'User clicks \'Create New Item\' button and is navigated to item creation workflow',
    expectedOutcome: 'User successfully navigates from dashboard to item creation workflow',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Dashboard loads with action buttons' },
      { step: 2, action: 'Click \'Create New Item\' button', component: 'ActionButtons', expectedResult: 'Button has Airbnb gradient styling and hover effect' },
      { step: 3, action: 'Verify navigation', component: 'Router', expectedResult: 'User is navigated to /dashboard2/create' },
      { step: 4, action: 'Confirm item creation workflow loads', component: 'ItemCreationWorkflow', expectedResult: 'Item creation form is displayed' },
    ],
  },
  {
    id: 'UC-HP-003',
    title: 'View Items via Dashboard Action Button',
    category: 'happy-path',
    priority: 'P0',
    description: 'User clicks \'View Items\' button and is navigated to item management page',
    expectedOutcome: 'User successfully navigates from dashboard to items management',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Dashboard loads with action buttons' },
      { step: 2, action: 'Click \'View Items\' button', component: 'ActionButtons', expectedResult: 'Button has secondary styling (white bg, dark border)' },
      { step: 3, action: 'Verify navigation', component: 'Router', expectedResult: 'User is navigated to /dashboard2/items' },
      { step: 4, action: 'Confirm items list loads', component: 'ItemManager', expectedResult: 'Items management page is displayed' },
    ],
  },
  {
    id: 'UC-HP-004',
    title: 'Print QR Codes - Single Property Flow',
    category: 'happy-path',
    priority: 'P0',
    description: 'User with single property clicks \'Print QR Code\' and goes directly to print flow',
    expectedOutcome: 'Single-property user bypasses property selector and goes directly to print flow',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Dashboard loads with action buttons' },
      { step: 2, action: 'Click \'Print QR Code\' button', component: 'ActionButtons', expectedResult: 'Button has secondary styling' },
      { step: 3, action: 'Verify direct navigation to print flow', component: 'Router', expectedResult: 'User is navigated to /dashboard2/print/[propertyId]' },
      { step: 4, action: 'Confirm QR print manager loads', component: 'QRCodePrintManager', expectedResult: 'QR code selection and print interface displayed' },
    ],
  },
  {
    id: 'UC-HP-005',
    title: 'Edit Property Details',
    category: 'happy-path',
    priority: 'P1',
    description: 'User edits their property name and address through the property section',
    expectedOutcome: 'Property details are updated and persisted to database',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Dashboard loads with property section' },
      { step: 2, action: 'Click on property name in \'My Property\' section', component: 'PropertySection', expectedResult: 'Property row has chevron icon, is clickable' },
      { step: 3, action: 'Observe edit modal opens', component: 'PropertyEditModal', expectedResult: 'Modal dialog appears with property form pre-populated' },
      { step: 4, action: 'Modify property name', component: 'PropertyForm', expectedResult: 'Input field accepts new text' },
      { step: 5, action: 'Click Save button', component: 'PropertyEditModal', expectedResult: 'Modal closes, property list refreshes with new name' },
    ],
  },
  {
    id: 'UC-HP-006',
    title: 'Add New Property',
    category: 'happy-path',
    priority: 'P1',
    description: 'User adds a new property through the \'Add New Property\' button',
    expectedOutcome: 'New property is created and appears in property section',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Dashboard loads with property section' },
      { step: 2, action: 'Click \'Add New Property\' button', component: 'PropertySection', expectedResult: 'Button is visible below property list' },
      { step: 3, action: 'Observe add modal opens', component: 'AddPropertyModal', expectedResult: 'Modal dialog appears with empty property form' },
      { step: 4, action: 'Enter property name (required)', component: 'PropertyForm', expectedResult: 'Input field accepts text' },
      { step: 5, action: 'Enter optional address fields', component: 'PropertyForm', expectedResult: 'Address fields accept input' },
      { step: 6, action: 'Click Save button', component: 'AddPropertyModal', expectedResult: 'Modal closes, property added to list' },
    ],
  },
  {
    id: 'UC-ERR-001',
    title: 'Property Form Validation - Empty Name',
    category: 'error-handling',
    priority: 'P1',
    description: 'User attempts to save property without entering required name field',
    expectedOutcome: 'Form validation prevents saving and shows clear error message',
    steps: [
      { step: 1, action: 'Open property edit modal', component: 'PropertyEditModal', expectedResult: 'Modal opens with form' },
      { step: 2, action: 'Clear the property name field', component: 'PropertyForm', expectedResult: 'Name field is empty' },
      { step: 3, action: 'Click Save button', component: 'PropertyEditModal', expectedResult: 'Save is prevented, error message displayed' },
      { step: 4, action: 'Verify error message', component: 'PropertyForm', expectedResult: 'Error indicates \'Property name is required\'' },
    ],
  },
  {
    id: 'UC-ERR-002',
    title: 'Dashboard Loading Error State',
    category: 'error-handling',
    priority: 'P1',
    description: 'Dashboard handles API errors gracefully when fetching statistics',
    expectedOutcome: 'Dashboard displays graceful error state instead of crashing',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2 when API fails', component: 'Dashboard2Page', expectedResult: 'Dashboard loads shell structure' },
      { step: 2, action: 'Observe statistics cards section', component: 'StatisticsCards', expectedResult: 'Error state or retry option displayed' },
      { step: 3, action: 'Click retry if available', component: 'useDashboardStats', expectedResult: 'Refresh is attempted' },
    ],
  },
  {
    id: 'UC-ERR-003',
    title: 'Modal Cancel Discards Changes',
    category: 'error-handling',
    priority: 'P2',
    description: 'User can cancel property edit and discard unsaved changes',
    expectedOutcome: 'Cancel action properly discards unsaved changes',
    steps: [
      { step: 1, action: 'Open property edit modal', component: 'PropertyEditModal', expectedResult: 'Modal opens with current property data' },
      { step: 2, action: 'Modify property name', component: 'PropertyForm', expectedResult: 'Input field shows new text' },
      { step: 3, action: 'Click Cancel button', component: 'PropertyEditModal', expectedResult: 'Modal closes without saving' },
      { step: 4, action: 'Re-open same property', component: 'PropertySection', expectedResult: 'Original name is displayed (changes were discarded)' },
    ],
  },
  {
    id: 'UC-EDGE-001',
    title: 'New User Empty State - No Items',
    category: 'edge-case',
    priority: 'P0',
    description: 'New user with no items sees appropriate empty state with CTA',
    expectedOutcome: 'New users see encouraging empty state with clear call-to-action',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Dashboard loads successfully' },
      { step: 2, action: 'Observe statistics cards', component: 'StatisticsCards', expectedResult: 'Shows \'0\' for Items, Rooms, Tags (not \'No data\')' },
      { step: 3, action: 'Observe empty state guidance', component: 'EmptyStateGuidance', expectedResult: '\'Create your first item\' CTA is prominently displayed' },
      { step: 4, action: 'Click CTA button', component: 'EmptyStateGuidance', expectedResult: 'Navigates to item creation workflow' },
    ],
  },
  {
    id: 'UC-EDGE-002',
    title: 'No Properties State',
    category: 'edge-case',
    priority: 'P1',
    description: 'User with no properties sees prompt to add one',
    expectedOutcome: 'Users without properties are guided to create one',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Dashboard loads successfully' },
      { step: 2, action: 'Observe property section', component: 'PropertySection', expectedResult: 'Empty state message prompting to add property' },
      { step: 3, action: 'Click \'Add Property\' prompt', component: 'PropertySection', expectedResult: 'Add property modal opens' },
    ],
  },
  {
    id: 'UC-EDGE-003',
    title: 'Mobile Responsive Layout',
    category: 'edge-case',
    priority: 'P2',
    description: 'Dashboard layout adapts properly on mobile devices',
    expectedOutcome: 'Dashboard is fully usable on mobile devices',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2 on mobile', component: 'Dashboard2Page', expectedResult: 'Dashboard loads with mobile layout' },
      { step: 2, action: 'Observe statistics cards', component: 'StatisticsCards', expectedResult: 'Cards stack vertically (1 per row)' },
      { step: 3, action: 'Observe action buttons', component: 'ActionButtons', expectedResult: 'Buttons stack vertically with full width' },
      { step: 4, action: 'Test button tap targets', component: 'ActionButtons', expectedResult: 'Touch targets are at least 48px' },
    ],
  },
  {
    id: 'UC-INT-001',
    title: 'Multi-Property Print Flow with Property Selector',
    category: 'integration',
    priority: 'P0',
    description: 'User with multiple properties uses property selector before print flow',
    expectedOutcome: 'Multi-property users can select which property to print QR codes for',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Dashboard loads, property section shows \'My Properties\' (plural)' },
      { step: 2, action: 'Click \'Print QR Code\' button', component: 'ActionButtons', expectedResult: 'Button navigates to property selector' },
      { step: 3, action: 'Observe property selector page', component: 'PrintPropertySelector', expectedResult: 'Property cards displayed with names and item counts' },
      { step: 4, action: 'Select a property', component: 'PrintPropertySelector', expectedResult: 'Navigates to /dashboard2/print/[selectedPropertyId]' },
      { step: 5, action: 'Confirm print manager loads', component: 'QRCodePrintManager', expectedResult: 'QR print interface shows items for selected property only' },
    ],
  },
  {
    id: 'UC-INT-002',
    title: 'Statistics Update After Item Creation',
    category: 'integration',
    priority: 'P1',
    description: 'Statistics cards update automatically after user creates a new item',
    expectedOutcome: 'Dashboard statistics reflect real-time data after item operations',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Note current item count in statistics' },
      { step: 2, action: 'Navigate to /dashboard2/create', component: 'ActionButtons', expectedResult: 'Item creation workflow loads' },
      { step: 3, action: 'Complete item creation flow', component: 'ItemCreationWorkflow', expectedResult: 'New item is saved successfully' },
      { step: 4, action: 'Navigate back to /dashboard2', component: 'Router', expectedResult: 'Dashboard loads' },
      { step: 5, action: 'Verify statistics updated', component: 'StatisticsCards', expectedResult: 'Item count has increased by 1' },
    ],
  },
  {
    id: 'UC-INT-003',
    title: 'Full Dashboard Workflow - Login to QR Print',
    category: 'integration',
    priority: 'P0',
    description: 'Complete end-to-end flow: view dashboard, create item, print QR code',
    expectedOutcome: 'User completes full workflow from dashboard view to QR code printing',
    steps: [
      { step: 1, action: 'Navigate to /dashboard2', component: 'Dashboard2Page', expectedResult: 'Dashboard loads with all sections visible' },
      { step: 2, action: 'View statistics cards', component: 'StatisticsCards', expectedResult: 'Item, Room, Tag counts displayed' },
      { step: 3, action: 'Click \'Create New Item\'', component: 'ActionButtons', expectedResult: 'Navigate to item creation' },
      { step: 4, action: 'Create and save new item', component: 'ItemCreationWorkflow', expectedResult: 'Item saved successfully' },
      { step: 5, action: 'Return to dashboard', component: 'Router', expectedResult: 'Dashboard loads with updated stats' },
      { step: 6, action: 'Click \'Print QR Code\'', component: 'ActionButtons', expectedResult: 'Print flow initiated' },
      { step: 7, action: 'Select items and generate PDF', component: 'QRCodePrintManager', expectedResult: 'PDF with QR codes generated' },
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

export default function SimpleDashboardTestPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Simple Dashboard</h1>
          <p className="text-xs text-gray-400">Pipeline Test Harness • Generated: 2026-01-06 12:51</p>
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
