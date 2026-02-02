'use client';
/* eslint-disable react/no-unescaped-entities */

/**
 * L10N Epic2 Static Ui - Pipeline Test Harness
 *
 * Auto-generated LLM-friendly test harness for the l10n-epic2-static-ui pipeline.
 * Features:
 * - LLM Testing Instructions with workflow guidance
 * - Sequential test navigation with Previous/Next buttons
 * - Component tests displayed inline via iframe (no page navigation)
 * - Use case tests with step-by-step instructions
 * - Pipeline reference for context (informational only)
 *
 * @generated 2026-01-31 00:56
 * @pipeline l10n-epic2-static-ui
 */

import Link from 'next/link';
import { useState } from 'react';

type TabId = 'instructions' | 'components' | 'usecases' | 'evidence' | 'reference';

// LLM Testing Instructions - PRD Context
const llmInstructions = {
  vision: '',
  userOutcome: '',
  successMetrics: [],
  scopeIn: [],
  scopeOut: [],
  workflow: [
    'STEP 1: Read the Instructions tab first to understand the product context and testing workflow.',
    'STEP 2: Complete Component Tests - These verify individual UI components work correctly in isolation.',
    'STEP 3: Complete Use Case Tests - These verify end-to-end user workflows function properly.',
    'STEP 4: Review Verification Evidence - See actual command outputs proving each task was completed correctly.',
    'STEP 5: SKIP Pipeline Reference - This tab is informational only, not for testing.',
  ],
  componentTestGuidance: 'For each component test: (1) Click to load the test page in the iframe below, (2) Interact with the component to verify it renders and responds correctly, (3) Use Previous/Next to move sequentially through all component tests.',
  useCaseTestGuidance: 'For each use case: (1) Select the use case from the list, (2) Follow each numbered step in order, (3) Check off steps as you complete them, (4) Verify the expected outcome matches what you observe.',
  evidenceGuidance: 'For each task: (1) Select the task from the list, (2) Click on each verification check to expand and see the command output, (3) Green checks passed, red checks failed.',
  importantNotes: [
    'Component Tests should be completed BEFORE Use Case Tests',
    'Verification Evidence shows actual terminal output from verification commands',
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

interface EvidenceCheck {
  description: string;
  command: string;
  output: string;
  passed: boolean;
}

interface TaskEvidence {
  taskId: string;
  requestId: string;
  title: string;
  checks: EvidenceCheck[];
}

const componentTests: TestLink[] = [
  {
    href: '/test/basic-shared-components',
    title: 'REQ-E02-066: Update all shared components (25+ files)',
    description: 'Update all shared components (25+ files)',
  },
];

const allTasks = [
    { id: '2H.1', request: 'REQ-E02-001', title: 'Create `common` namespace structure in `/messages/', status: '✅', hasTest: '' },
    { id: '2H.2', request: 'REQ-E02-002', title: 'Extract button labels across all components', status: '✅', hasTest: '' },
    { id: '2H.3', request: 'REQ-E02-003', title: 'Extract modal/dialog strings', status: '✅', hasTest: '' },
    { id: '2H.4', request: 'REQ-E02-004', title: 'Extract form element strings (labels, placeholders', status: '✅', hasTest: '' },
    { id: '2H.5', request: 'REQ-E02-005', title: 'Extract toast notification messages', status: '✅', hasTest: '' },
    { id: '2H.6', request: 'REQ-E02-006', title: 'Extract empty state messages', status: '✅', hasTest: '' },
    { id: '2H.7', request: 'REQ-E02-027', title: 'Extract loading state messages', status: '✅', hasTest: '' },
    { id: '2H.8', request: 'REQ-E02-028', title: 'Extract confirmation dialog messages', status: '✅', hasTest: '' },
    { id: '2H.9', request: 'REQ-E02-029', title: 'Create date/time formatting translations', status: '✅', hasTest: '' },
    { id: '2H.10', request: 'REQ-E02-030', title: 'Generate translations for all 5 non-English langua', status: '✅', hasTest: '' },
    { id: '2H.11', request: 'REQ-E02-031', title: 'Create `useCommonTranslations` convenience hook (o', status: '✅', hasTest: '' },
    { id: '2J.1', request: 'REQ-E02-032', title: 'Create `errors` namespace structure', status: '✅', hasTest: '' },
    { id: '2J.2', request: 'REQ-E02-033', title: 'Audit all form validation messages across componen', status: '✅', hasTest: '' },
    { id: '2J.3', request: 'REQ-E02-034', title: 'Audit all API error handling and messages', status: '✅', hasTest: '' },
    { id: '2J.4', request: 'REQ-E02-035', title: 'Create centralized error message utility', status: '✅', hasTest: '' },
    { id: '2J.5', request: 'REQ-E02-036', title: 'Update Zod schemas to use translated messages', status: '⏳', hasTest: '' },
    { id: '2J.6', request: 'REQ-E02-037', title: 'Update error boundaries with translations', status: '⏳', hasTest: '' },
    { id: '2J.7', request: 'REQ-E02-038', title: 'Generate translations for 5 non-English languages', status: '⏳', hasTest: '' },
    { id: '2A.1', request: 'REQ-E02-039', title: 'Create `auth` namespace structure', status: '⏳', hasTest: '' },
    { id: '2A.2', request: 'REQ-E02-040', title: 'Update `/src/app/login/LoginPageContent.tsx`', status: '⏳', hasTest: '' },
    { id: '2A.3', request: 'REQ-E02-041', title: 'Update `/src/components/LoginForm.tsx`', status: '⏳', hasTest: '' },
    { id: '2A.4', request: 'REQ-E02-042', title: 'Update `/src/components/RegistrationForm.tsx` (lar', status: '✅', hasTest: '' },
    { id: '2A.5', request: 'REQ-E02-043', title: 'Update `/src/components/GoogleOAuthButton.tsx`', status: '⏳', hasTest: '' },
    { id: '2A.6', request: 'REQ-E02-044', title: 'Update `/src/app/register/page.tsx`', status: '⏳', hasTest: '' },
    { id: '2A.7', request: 'REQ-E02-045', title: 'Update `/src/app/register/success/page.tsx`', status: '⏳', hasTest: '' },
    { id: '2A.8', request: 'REQ-E02-046', title: 'Update `/src/app/register/complete/page.tsx`', status: '⏳', hasTest: '' },
    { id: '2A.9', request: 'REQ-E02-047', title: 'Generate translations for 5 non-English languages', status: '⏳', hasTest: '' },
    { id: '2A.10', request: 'REQ-E02-048', title: 'Test all auth flows in each language', status: '⏳', hasTest: '' },
    { id: '2B.1', request: 'REQ-E02-049', title: 'Create `dashboard` namespace structure', status: '⏳', hasTest: '' },
    { id: '2B.2', request: 'REQ-E02-050', title: 'Update `/src/app/dashboard2/page.tsx`', status: '⏳', hasTest: '' },
    { id: '2B.3', request: 'REQ-E02-051', title: 'Update `/src/app/dashboard2/layout.tsx`', status: '⏳', hasTest: '' },
    { id: '2B.4', request: 'REQ-E02-052', title: 'Update all SimpleDashboard components', status: '✅', hasTest: '' },
    { id: '2B.5', request: 'REQ-E02-053', title: 'Update navigation/sidebar components', status: '⏳', hasTest: '' },
    { id: '2B.6', request: 'REQ-E02-054', title: 'Update page metadata with translations', status: '⏳', hasTest: '' },
    { id: '2B.7', request: 'REQ-E02-055', title: 'Generate translations for 5 non-English languages', status: '⏳', hasTest: '' },
    { id: '2C.1', request: 'REQ-E02-056', title: 'Create `workflow` namespace structure', status: '⏳', hasTest: '' },
    { id: '2C.2', request: 'REQ-E02-057', title: 'Update main ItemCreationWorkflow component', status: '⏳', hasTest: '' },
    { id: '2C.3', request: 'REQ-E02-058', title: 'Update RoomSelectionStep', status: '⏳', hasTest: '' },
    { id: '2C.4', request: 'REQ-E02-059', title: 'Update ItemTypeStep', status: '⏳', hasTest: '' },
    { id: '2C.5', request: 'REQ-E02-060', title: 'Update SpecificItemStep', status: '⏳', hasTest: '' },
    { id: '2C.6', request: 'REQ-E02-061', title: 'Update PurposeStep', status: '✅', hasTest: '' },
    { id: '2C.7', request: 'REQ-E02-062', title: 'Update ContentTypeStep', status: '⏳', hasTest: '' },
    { id: '2C.8', request: 'REQ-E02-063', title: 'Update MediaCaptureStep and adapters', status: '⏳', hasTest: '' },
    { id: '2C.9', request: 'REQ-E02-064', title: 'Update PreviewSaveStep', status: '⏳', hasTest: '' },
    { id: '2C.10', request: 'REQ-E02-065', title: 'Update SessionSummaryStep', status: '⏳', hasTest: '' },
    { id: '2C.11', request: 'REQ-E02-066', title: 'Update all shared components (25+ files)', status: '⏳', hasTest: '🧪' },
    { id: '2C.12', request: 'REQ-E02-067', title: 'Update all dialog components', status: '⏳', hasTest: '' },
    { id: '2C.13', request: 'REQ-E02-068', title: 'Generate translations for 5 non-English languages', status: '⏳', hasTest: '' },
    { id: '2C.14', request: 'REQ-E02-077', title: 'Test complete workflow in each language', status: '⏳', hasTest: '' },
    { id: '2D.1', request: 'REQ-E02-078', title: 'Create `items` namespace structure', status: '⏳', hasTest: '' },
    { id: '2D.2', request: 'REQ-E02-079', title: 'Update ItemManager component family', status: '✅', hasTest: '' },
    { id: '2D.3', request: 'REQ-E02-080', title: 'Update ItemGrid and ItemCard', status: '⏳', hasTest: '' },
    { id: '2D.4', request: 'REQ-E02-081', title: 'Update filter and sort components', status: '⏳', hasTest: '' },
    { id: '2D.5', request: 'REQ-E02-082', title: 'Update bulk action dialogs', status: '⏳', hasTest: '' },
    { id: '2D.6', request: 'REQ-E02-083', title: 'Update item detail/edit pages', status: '⏳', hasTest: '' },
    { id: '2D.7', request: 'REQ-E02-084', title: 'Generate translations for 5 non-English languages', status: '⏳', hasTest: '' },
    { id: '2E.1', request: 'REQ-E02-070', title: 'Create `articles` namespace structure', status: '⏳', hasTest: '' },
    { id: '2E.2', request: 'REQ-E02-071', title: 'Update editor components', status: '⏳', hasTest: '' },
    { id: '2E.3', request: 'REQ-E02-072', title: 'Update media handling components', status: '⏳', hasTest: '' },
    { id: '2E.4', request: 'REQ-E02-073', title: 'Update crop/trim utilities', status: '⏳', hasTest: '' },
    { id: '2E.5', request: 'REQ-E02-074', title: 'Update instructions pages', status: '⏳', hasTest: '' },
    { id: '2E.6', request: 'REQ-E02-075', title: 'Generate translations for 5 non-English languages', status: '⏳', hasTest: '' },
    { id: '2F.1', request: 'REQ-E02-085', title: 'Create `properties` namespace structure', status: '⏳', hasTest: '' },
    { id: '2F.2', request: 'REQ-E02-008', title: 'Update PropertyForm', status: '⏳', hasTest: '' },
    { id: '2F.3', request: 'REQ-E02-009', title: 'Update property modals', status: '⏳', hasTest: '' },
    { id: '2F.4', request: 'REQ-E02-010', title: 'Update property pages', status: '⏳', hasTest: '' },
    { id: '2F.5', request: 'REQ-E02-011', title: 'Update PropertySelector', status: '⏳', hasTest: '' },
    { id: '2F.6', request: 'REQ-E02-012', title: 'Generate translations for 5 non-English languages', status: '✅', hasTest: '' },
    { id: '2G.1', request: 'REQ-E02-013', title: 'Create `settings` namespace structure', status: '⏳', hasTest: '' },
    { id: '2G.2', request: 'REQ-E02-014', title: 'Update account settings components', status: '⏳', hasTest: '' },
    { id: '2G.3', request: 'REQ-E02-015', title: 'Update profile components', status: '⏳', hasTest: '' },
    { id: '2G.4', request: 'REQ-E02-016', title: 'Update preferences components', status: '⏳', hasTest: '' },
    { id: '2G.5', request: 'REQ-E02-017', title: 'Update help page', status: '✅', hasTest: '' },
    { id: '2G.6', request: 'REQ-E02-018', title: 'Generate translations for 5 non-English languages', status: '✅', hasTest: '' },
    { id: '2I.1', request: 'REQ-E02-019', title: 'Create `emails` namespace and translation structur', status: '✅', hasTest: '' },
    { id: '2I.2', request: 'REQ-E02-020', title: 'Create `getEmailTranslation` utility function', status: '✅', hasTest: '' },
    { id: '2I.3', request: 'REQ-E02-021', title: 'Update `generateAccessApprovalEmail` function', status: '✅', hasTest: '' },
    { id: '2I.4', request: 'REQ-E02-022', title: 'Update `generateAccessDenialEmail` function', status: '✅', hasTest: '' },
    { id: '2I.5', request: 'REQ-E02-023', title: 'Update `generateBetaAccessApprovalEmail` function', status: '✅', hasTest: '' },
    { id: '2I.6', request: 'REQ-E02-024', title: 'Update `generateRegistrationReminderEmail` functio', status: '✅', hasTest: '' },
    { id: '2I.7', request: 'REQ-E02-025', title: 'Add language parameter to all email generation fun', status: '✅', hasTest: '' },
    { id: '2I.8', request: 'REQ-E02-026', title: 'Generate translations for 5 non-English languages', status: '✅', hasTest: '' },
    { id: '2I.9', request: 'REQ-E02-027', title: 'Test email generation in each language', status: '✅', hasTest: '' },
];

const useCases: UseCase[] = [
  // No use cases generated yet
];

const verificationEvidence: TaskEvidence[] = [
  // No verification evidence captured yet
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

export default function L10NEpic2StaticUiTestPage() {
  const [activeTab, setActiveTab] = useState<TabId>('instructions');
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [selectedUseCaseIndex, setSelectedUseCaseIndex] = useState<number | null>(null);
  const [selectedEvidenceIndex, setSelectedEvidenceIndex] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({}); // Track completed steps per use case
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set()); // Track expanded evidence checks

  const tabs = [
    { id: 'instructions' as TabId, label: '📖 LLM Instructions', count: null },
    { id: 'components' as TabId, label: '🧪 Component Tests', count: componentTests.length },
    { id: 'usecases' as TabId, label: '📝 Use Case Tests', count: useCases.length },
    { id: 'evidence' as TabId, label: '🔍 Verification Evidence', count: verificationEvidence.length },
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
          <h1 className="text-2xl font-bold text-gray-900">L10N Epic2 Static Ui</h1>
          <p className="text-xs text-gray-400">Pipeline Test Harness • Generated: 2026-01-31 00:56</p>
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
                  setSelectedEvidenceIndex(null);
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

        {/* Verification Evidence Tab */}
        {activeTab === 'evidence' && (
          <div>
            {/* Task Evidence List */}
            <div className="bg-white rounded-lg border border-gray-200 mb-4">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800">Verification Evidence</h2>
                <p className="text-xs text-gray-500 mt-1">Visual proof of what was verified for each task. Click to see command outputs.</p>
              </div>
              {verificationEvidence.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {verificationEvidence.map((task, idx) => (
                    <button
                      key={task.taskId}
                      onClick={() => setSelectedEvidenceIndex(idx)}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                        selectedEvidenceIndex === idx ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        task.checks.every(c => c.passed) ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                      }`}>
                        {task.checks.every(c => c.passed) ? '✓' : '!'}
                      </span>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs bg-gray-200 px-1.5 py-0.5 rounded">{task.taskId}</span>
                          <span className="font-mono text-xs text-blue-600">{task.requestId}</span>
                        </div>
                        <p className="font-medium text-gray-800 truncate">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.checks.length} checks • {task.checks.filter(c => c.passed).length} passed</p>
                      </div>
                      {selectedEvidenceIndex === idx && (
                        <span className="text-blue-600">▶</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No verification evidence captured yet.</p>
                  <p className="text-xs text-gray-400 mt-2">Run the testcheck stage to generate verification evidence.</p>
                </div>
              )}
            </div>

            {/* Evidence Details */}
            {selectedEvidenceIndex !== null && verificationEvidence[selectedEvidenceIndex] && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {verificationEvidence[selectedEvidenceIndex].taskId}
                      </span>
                      <span className="ml-2 font-medium text-gray-800">
                        {verificationEvidence[selectedEvidenceIndex].title}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedEvidenceIndex(Math.max(0, selectedEvidenceIndex - 1))}
                        disabled={selectedEvidenceIndex === 0}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setSelectedEvidenceIndex(Math.min(verificationEvidence.length - 1, selectedEvidenceIndex + 1))}
                        disabled={selectedEvidenceIndex === verificationEvidence.length - 1}
                        className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checks List */}
                <div className="p-4 space-y-3">
                  {verificationEvidence[selectedEvidenceIndex].checks.map((check, checkIdx) => {
                    const checkKey = `${selectedEvidenceIndex}-${checkIdx}`;
                    const isExpanded = expandedChecks.has(checkKey);
                    return (
                      <div
                        key={checkIdx}
                        className={`border rounded-lg overflow-hidden ${
                          check.passed ? 'border-green-200' : 'border-red-200'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setExpandedChecks(prev => {
                              const next = new Set(prev);
                              if (next.has(checkKey)) {
                                next.delete(checkKey);
                              } else {
                                next.add(checkKey);
                              }
                              return next;
                            });
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                            check.passed ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                            check.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {check.passed ? '✓' : '✗'}
                          </span>
                          <div className="flex-grow">
                            <p className={`font-medium ${check.passed ? 'text-green-800' : 'text-red-800'}`}>
                              {check.description}
                            </p>
                            <p className="font-mono text-xs text-gray-500 mt-1">$ {check.command}</p>
                          </div>
                          <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                        </button>

                        {isExpanded && (
                          <div className="px-4 py-3 bg-gray-900 border-t">
                            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap overflow-x-auto">
                              {check.output || '(no output)'}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
