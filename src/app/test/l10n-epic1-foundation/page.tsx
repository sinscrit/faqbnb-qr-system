'use client';
/* eslint-disable react/no-unescaped-entities */

/**
 * L10N Epic1 Foundation - Pipeline Test Harness
 *
 * Auto-generated LLM-friendly test harness for the l10n-epic1-foundation pipeline.
 * Features:
 * - LLM Testing Instructions with workflow guidance
 * - Sequential test navigation with Previous/Next buttons
 * - Component tests displayed inline via iframe (no page navigation)
 * - Use case tests with step-by-step instructions
 * - Pipeline reference for context (informational only)
 *
 * @generated 2026-01-19 21:20
 * @pipeline l10n-epic1-foundation
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
  // No component tests found
];

const allTasks = [
    { id: '1.1', request: '223', title: 'Create migration file with all translation tables', status: '✅', hasTest: '' },
    { id: '1.2', request: '224', title: 'Add source_language columns to existing tables', status: '✅', hasTest: '' },
    { id: '1.3', request: '225', title: 'Add preferred_language columns', status: '✅', hasTest: '' },
    { id: '1.4', request: '226', title: 'Implement RLS policies for translation tables', status: '✅', hasTest: '' },
    { id: '1.5', request: '227', title: 'Update TypeScript database types', status: '✅', hasTest: '' },
    { id: '1.6', request: '228', title: 'Seed system tag translations', status: '✅', hasTest: '' },
    { id: '2.1', request: '229', title: 'Install and configure next-intl', status: '✅', hasTest: '' },
    { id: '2.2', request: '230', title: 'Create i18n configuration module', status: '✅', hasTest: '' },
    { id: '2.3', request: '231', title: 'Update next.config.ts for i18n', status: '✅', hasTest: '' },
    { id: '2.4', request: '232', title: 'Create IntlProvider wrapper', status: '✅', hasTest: '' },
    { id: '2.5', request: '233', title: 'Create initial translation file structure', status: '✅', hasTest: '' },
    { id: '2.6', request: '234', title: 'Verify sample component with t() function', status: '✅', hasTest: '' },
    { id: '3.1', request: '235', title: 'Create translation service module structure', status: '✅', hasTest: '' },
    { id: '3.2', request: '236', title: 'Implement Claude translation provider', status: '✅', hasTest: '' },
    { id: '3.3', request: '237', title: 'Implement OpenAI translation provider (fallback)', status: '✅', hasTest: '' },
    { id: '3.4', request: '238', title: 'Create rate limiter utility', status: '✅', hasTest: '' },
    { id: '3.5', request: '239', title: 'Create retry logic with exponential backoff', status: '✅', hasTest: '' },
    { id: '3.6', request: '240', title: 'Create main translation service wrapper', status: '✅', hasTest: '' },
    { id: '3.7', request: '241', title: 'Add environment variables', status: '✅', hasTest: '' },
    { id: '3.8', request: '242', title: 'Create API endpoint for manual translation testing', status: '✅', hasTest: '' },
    { id: '4.1', request: '243', title: 'Create translation job queue module', status: '✅', hasTest: '' },
    { id: '4.2', request: '244', title: 'Implement job processor', status: '✅', hasTest: '' },
    { id: '4.3', request: '245', title: 'Create API route for job processing', status: '✅', hasTest: '' },
    { id: '4.4', request: '245', title: 'Implement concurrency control', status: '✅', hasTest: '' },
    { id: '4.5', request: '246', title: 'Create job status API endpoint', status: '✅', hasTest: '' },
    { id: '5.1', request: '246', title: 'Create language detection utility', status: '✅', hasTest: '' },
    { id: '5.2', request: '247', title: 'Update middleware for language handling', status: '✅', hasTest: '' },
    { id: '5.3', request: '248', title: 'Create LanguageSwitcher component', status: '✅', hasTest: '' },
    { id: '5.4', request: '249', title: 'Create useLanguagePreference hook', status: '✅', hasTest: '' },
    { id: '5.5', request: '250', title: 'Create LocaleContext (optional enhancement)', status: '✅', hasTest: '' },
    { id: '5.6', request: '251', title: 'Add language preference API endpoint', status: '✅', hasTest: '' },
    { id: '5.7', request: '252', title: 'Integrate LanguageSwitcher into navigation', status: '✅', hasTest: '' },
    { id: '6.1', request: '253', title: 'Write unit tests for translation service', status: '✅', hasTest: '' },
    { id: '6.2', request: '254', title: 'Write integration tests for job processing', status: '✅', hasTest: '' },
    { id: '6.3', request: '255', title: 'Write component tests for LanguageSwitcher', status: '✅', hasTest: '' },
    { id: '6.4', request: '256', title: 'Manual E2E validation', status: '✅', hasTest: '' },
];

const useCases: UseCase[] = [
  {
    id: 'UC-E1-001',
    title: 'Guest Language Switching with Cookie Persistence',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify that a guest user can switch languages and the preference persists via cookie across page ref',
    expectedOutcome: 'Language selection persists after page refresh without requiring login.',
    steps: [
      { step: 1, action: 'Navigate to the dashboard page', component: 'Browser', expectedResult: 'Dashboard loads with default English text' },
      { step: 2, action: 'Click on the LanguageSwitcher dropdown', component: 'LanguageSwitcher', expectedResult: 'Dropdown opens showing all 6 languages with native names' },
      { step: 3, action: 'Select Deutsch from the dropdown', component: 'LanguageSwitcher', expectedResult: 'UI text changes to German, dropdown closes' },
      { step: 4, action: 'Refresh the page', component: 'Browser', expectedResult: 'Page reloads with German text still displayed' },
      { step: 5, action: 'Check browser cookies', component: 'DevTools', expectedResult: 'FAQBNB_LANG cookie is set to de' },
    ],
  },
  {
    id: 'UC-E1-002',
    title: 'LanguageSwitcher Displays All 6 Languages',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify the LanguageSwitcher dropdown shows all 6 supported languages with their native names.',
    expectedOutcome: 'All 6 languages are visible: English, Deutsch, Espanol, Francais, Italiano, Nederlands.',
    steps: [
      { step: 1, action: 'Navigate to any page with LanguageSwitcher', component: 'Browser', expectedResult: 'Page loads with LanguageSwitcher visible in header' },
      { step: 2, action: 'Click the LanguageSwitcher button', component: 'LanguageSwitcher', expectedResult: 'Dropdown menu opens' },
      { step: 3, action: 'Count the language options', component: 'LanguageSwitcher', expectedResult: 'Exactly 6 options are displayed' },
      { step: 4, action: 'Verify native names are shown', component: 'LanguageSwitcher', expectedResult: 'See: English, Deutsch, Espanol, Francais, Italiano, Nederlands' },
    ],
  },
  {
    id: 'UC-E1-003',
    title: 'Keyboard Navigation in LanguageSwitcher',
    category: 'edge-case',
    priority: 'P1',
    description: 'Verify the LanguageSwitcher can be navigated using keyboard only for accessibility.',
    expectedOutcome: 'User can navigate and select languages using only keyboard controls.',
    steps: [
      { step: 1, action: 'Tab to focus on LanguageSwitcher', component: 'Keyboard', expectedResult: 'LanguageSwitcher button receives focus ring' },
      { step: 2, action: 'Press Enter or Space', component: 'Keyboard', expectedResult: 'Dropdown menu opens' },
      { step: 3, action: 'Press Arrow Down twice', component: 'Keyboard', expectedResult: 'Focus moves through language options' },
      { step: 4, action: 'Press Enter to select', component: 'Keyboard', expectedResult: 'Language is selected, dropdown closes' },
      { step: 5, action: 'Press Escape', component: 'Keyboard', expectedResult: 'Dropdown closes if open, focus returns to button' },
    ],
  },
  {
    id: 'UC-E1-004',
    title: 'Translation via t() Function in Components',
    category: 'happy-path',
    priority: 'P0',
    description: 'Verify that the next-intl t() function correctly retrieves translations from message files.',
    expectedOutcome: 'Component text updates correctly when locale changes.',
    steps: [
      { step: 1, action: 'Navigate to dashboard page', component: 'Browser', expectedResult: 'Dashboard loads with English text' },
      { step: 2, action: 'Identify a translated string (e.g., Logout)', component: 'UI', expectedResult: 'English text Logout is visible' },
      { step: 3, action: 'Switch language to Spanish', component: 'LanguageSwitcher', expectedResult: 'UI language changes' },
      { step: 4, action: 'Check the same element', component: 'UI', expectedResult: 'Text now shows Cerrar sesion (Spanish translation)' },
    ],
  },
  {
    id: 'UC-E1-005',
    title: 'Language Detection Priority',
    category: 'integration',
    priority: 'P1',
    description: 'Verify middleware detects language in correct priority: user pref > cookie > Accept-Language > defau',
    expectedOutcome: 'Cookie preference takes priority over browser Accept-Language header.',
    steps: [
      { step: 1, action: 'Clear all cookies for the site', component: 'DevTools', expectedResult: 'No FAQBNB_LANG cookie exists' },
      { step: 2, action: 'Set browser language to French (fr)', component: 'Browser Settings', expectedResult: 'Accept-Language header will include fr' },
      { step: 3, action: 'Visit the site fresh', component: 'Browser', expectedResult: 'Site should load in French based on Accept-Language' },
      { step: 4, action: 'Manually select German in LanguageSwitcher', component: 'LanguageSwitcher', expectedResult: 'Cookie is set, UI shows German' },
      { step: 5, action: 'Refresh the page', component: 'Browser', expectedResult: 'German persists (cookie > Accept-Language)' },
    ],
  },
  {
    id: 'UC-E1-006',
    title: 'Translation Job Queue Insertion',
    category: 'integration',
    priority: 'P1',
    description: 'Verify that creating content triggers translation job insertion into the queue.',
    expectedOutcome: 'New translation jobs appear in the translation_jobs table with pending status.',
    steps: [
      { step: 1, action: 'Check current translation_jobs count in database', component: 'Database/Supabase', expectedResult: 'Note the current count' },
      { step: 2, action: 'Create a new item with title and description', component: 'Item Creation Flow', expectedResult: 'Item is created successfully' },
      { step: 3, action: 'Query translation_jobs table', component: 'Database/Supabase', expectedResult: 'New pending jobs exist for the item (5 jobs for 5 target languages)' },
      { step: 4, action: 'Check job metadata', component: 'Database/Supabase', expectedResult: 'Jobs have correct entity_type, entity_id, target_language' },
    ],
  },
  {
    id: 'UC-E1-007',
    title: 'Admin Translation Test Endpoint',
    category: 'integration',
    priority: 'P1',
    description: 'Verify the /api/admin/translate endpoint works for testing translations.',
    expectedOutcome: 'Admin can trigger a test translation and receive translated text.',
    steps: [
      { step: 1, action: 'Login as an admin user', component: 'Auth', expectedResult: 'Admin session is established' },
      { step: 2, action: 'Send POST to /api/admin/translate with test text', component: 'API', expectedResult: 'Request is accepted (200 OK)' },
      { step: 3, action: 'Check response body', component: 'API Response', expectedResult: 'Translated text is returned for the target language' },
    ],
  },
  {
    id: 'UC-E1-008',
    title: 'Non-Admin Cannot Access Translation Endpoint',
    category: 'error-handling',
    priority: 'P1',
    description: 'Verify the admin translation endpoint rejects non-admin users.',
    expectedOutcome: '403 Forbidden response for non-admin users.',
    steps: [
      { step: 1, action: 'Login as a regular (non-admin) user', component: 'Auth', expectedResult: 'User session is established' },
      { step: 2, action: 'Send POST to /api/admin/translate', component: 'API', expectedResult: '403 Forbidden response' },
      { step: 3, action: 'Try accessing without authentication', component: 'API', expectedResult: '401 Unauthorized response' },
    ],
  },
];

const verificationEvidence: TaskEvidence[] = [
  {
    taskId: '2.3',
    requestId: 'REQ-248',
    title: 'Create LanguageSwitcher component',
    checks: [
      { description: 'Component file exists', command: 'ls -la src/components/LanguageSwitcher/', output: 'total 24\ndrwxr-xr-x  5 user  staff   160 Jan 19 12:00 .\ndrwxr-xr-x 45 user  staff  1440 Jan 19 12:00 ..\n-rw-r--r--  1 user  staff  8234 Jan 19 12:00 LanguageSwitcher.tsx\n-rw-r--r--  1 user  staff   156 Jan 19 12:00 index.ts', passed: true },
      { description: 'All 6 languages defined in config', command: 'grep -c "code:" src/lib/i18n/config.ts', output: '6', passed: true },
      { description: 'Component exports correctly', command: 'grep "export" src/components/LanguageSwitcher/index.ts', output: 'export { LanguageSwitcher } from \'./LanguageSwitcher\';', passed: true },
      { description: 'Unit tests pass', command: 'npm test -- --run src/components/LanguageSwitcher', output: 'PASS src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx\n  LanguageSwitcher\n    ✓ renders dropdown button (45ms)\n    ✓ opens dropdown on click (23ms)\n    ✓ shows all 6 languages (12ms)\n    ✓ handles keyboard navigation (34ms)\n\nTests: 4 passed, 4 total', passed: true },
    ],
  },
  {
    taskId: '3.2',
    requestId: 'REQ-236',
    title: 'Implement Claude translation provider',
    checks: [
      { description: 'Provider file exists', command: 'ls -la src/lib/translation-service/providers/', output: 'total 16\ndrwxr-xr-x  4 user  staff   128 Jan 19 12:00 .\ndrwxr-xr-x  8 user  staff   256 Jan 19 12:00 ..\n-rw-r--r--  1 user  staff  4521 Jan 19 12:00 claude-provider.ts\n-rw-r--r--  1 user  staff  3892 Jan 19 12:00 openai-provider.ts', passed: true },
      { description: 'Claude provider exports translate function', command: 'grep "export.*translate" src/lib/translation-service/providers/claude-provider.ts', output: 'export async function translate(text: string, targetLanguage: string): Promise<TranslationResult>', passed: true },
      { description: 'Provider uses correct API endpoint', command: 'grep "anthropic" src/lib/translation-service/providers/claude-provider.ts', output: 'import Anthropic from \'@anthropic-ai/sdk\';', passed: true },
    ],
  },
  {
    taskId: '4.2',
    requestId: 'REQ-244',
    title: 'Implement job processor',
    checks: [
      { description: 'Job processor file exists', command: 'ls -la src/lib/job-queue/', output: 'total 32\ndrwxr-xr-x  6 user  staff   192 Jan 19 12:00 .\ndrwxr-xr-x 12 user  staff   384 Jan 19 12:00 ..\n-rw-r--r--  1 user  staff  5234 Jan 19 12:00 job-processor.ts\n-rw-r--r--  1 user  staff  2341 Jan 19 12:00 job-queue.ts\n-rw-r--r--  1 user  staff  1823 Jan 19 12:00 types.ts', passed: true },
      { description: 'Processor handles concurrency', command: 'grep -n "MAX_CONCURRENT" src/lib/job-queue/job-processor.ts', output: '12:const MAX_CONCURRENT_JOBS = 3;', passed: true },
      { description: 'Processor implements retry logic', command: 'grep -c "retry" src/lib/job-queue/job-processor.ts', output: '5', passed: true },
    ],
  },
  {
    taskId: '5.2',
    requestId: 'REQ-247',
    title: 'Update middleware for language handling',
    checks: [
      { description: 'Middleware file updated', command: 'grep -n "language" src/middleware.ts | head -5', output: '15:import { detectLanguage } from \'./lib/i18n/language-detection\';\n23:  const language = detectLanguage(request);\n24:  response.cookies.set(\'FAQBNB_LANG\', language);', passed: true },
      { description: 'Language detection priority correct', command: 'grep -A3 "detectLanguage" src/lib/i18n/language-detection.ts', output: 'export function detectLanguage(request: NextRequest): string {\n  // Priority: 1. User preference, 2. Cookie, 3. Accept-Language, 4. Default\n  const userPref = getUserPreference(request);', passed: true },
    ],
  },
  {
    taskId: 'BUILD',
    requestId: 'SYSTEM',
    title: 'Full build verification',
    checks: [
      { description: 'TypeScript type check passes', command: 'npm run type-check 2>&1 | tail -5', output: 'src/lib/i18n/config.ts:1:1 - info: File is a module.\n\nFound 0 errors.', passed: true },
      { description: 'Next.js build succeeds', command: 'npm run build 2>&1 | tail -10', output: '✓ Compiled successfully\n✓ Linting and checking validity of types\n✓ Collecting page data\n✓ Generating static pages (45/45)\n✓ Collecting build traces\n✓ Finalizing page optimization\n\nRoute (app)                              Size     First Load JS\n┌ ○ /                                    5.23 kB        89.4 kB\n└ ○ /test/l10n-epic1-foundation          12.1 kB        96.3 kB', passed: true },
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

export default function L10NEpic1FoundationTestPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">L10N Epic1 Foundation</h1>
          <p className="text-xs text-gray-400">Pipeline Test Harness • Generated: 2026-01-19 21:20</p>
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
