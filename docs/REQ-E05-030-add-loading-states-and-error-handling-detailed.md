# Add Loading States and Error Handling - Detailed Implementation Tasks

**Generated:** 2026-01-23 12:45
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #30)
- Overview: docs/REQ-E05-030-add-loading-states-and-error-handling-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Create Toast Component with Radix UI

**Context:** Implement the base toast notification component using @radix-ui/react-toast primitives. This component will provide success, error, and info variants with consistent styling.

**Files to create:**
- `/src/components/ui/toast.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **1.1** Create new file `/src/components/ui/toast.tsx`
- [ ] **1.2** Add imports: `@radix-ui/react-toast`, `lucide-react` (X icon), `@/lib/utils` (cn function)
- [ ] **1.3** Define ToastProps interface with fields: `title?: string`, `description?: string`, `action?: { label: string; onClick: () => void }`, `variant?: 'default' | 'success' | 'error' | 'info'`
- [ ] **1.4** Create Toast component using ToastPrimitive.Root as wrapper
- [ ] **1.5** Add variant-based styling: success (green), error (red), info (blue), default (gray)
- [ ] **1.6** Implement ToastTitle using ToastPrimitive.Title with font-semibold styling
- [ ] **1.7** Implement ToastDescription using ToastPrimitive.Description with text-sm muted color
- [ ] **1.8** Implement ToastAction button using ToastPrimitive.Action if action prop provided
- [ ] **1.9** Implement ToastClose button with X icon using ToastPrimitive.Close
- [ ] **1.10** Add ToastViewport component with fixed positioning (bottom-right corner)
- [ ] **1.11** Export all components: Toast, ToastTitle, ToastDescription, ToastAction, ToastClose, ToastViewport
- [ ] **1.12** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 2. Create Toaster Provider Component

**Context:** Create the Toaster component that renders active toasts and manages the toast queue using the useToast hook.

**Files to create:**
- `/src/components/ui/toaster.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **2.1** Create new file `/src/components/ui/toaster.tsx`
- [ ] **2.2** Import ToastProvider from @radix-ui/react-toast
- [ ] **2.3** Import Toast and ToastViewport components from ./toast
- [ ] **2.4** Import useToast hook from @/hooks/useToast
- [ ] **2.5** Create Toaster function component
- [ ] **2.6** Call useToast to get toasts array and removeToast function
- [ ] **2.7** Wrap content in ToastProvider from Radix UI
- [ ] **2.8** Map over toasts array, rendering Toast component for each with unique key
- [ ] **2.9** Pass toast props (title, description, variant, action) to each Toast component
- [ ] **2.10** Implement onClose handler that calls removeToast with toast.id
- [ ] **2.11** Add ToastViewport at end of ToastProvider
- [ ] **2.12** Export Toaster component
- [ ] **2.13** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 3. Create useToast Hook with Toast State Management

**Context:** Implement the useToast hook that provides a programmatic API for showing toasts with module-level state management.

**Files to create:**
- `/src/hooks/useToast.ts` (NEW)

**Estimated effort:** 1 story point

- [ ] **3.1** Create new file `/src/hooks/useToast.ts`
- [ ] **3.2** Import useState, useEffect from React
- [ ] **3.3** Define Toast type with fields: `id: string`, `title: string`, `description?: string`, `variant: 'default' | 'success' | 'error' | 'info'`, `action?: { label: string; onClick: () => void }`
- [ ] **3.4** Create module-level toasts array state and listeners set for pub/sub pattern
- [ ] **3.5** Implement toast function that generates unique ID, creates toast object, adds to array, and auto-dismisses after timeout (5s for success, no timeout for errors)
- [ ] **3.6** Implement removeToast function that filters toast by ID from array
- [ ] **3.7** Implement useToast hook that subscribes to toast updates using useEffect
- [ ] **3.8** Return object with toast function and convenience methods: `success(title, description?)`, `error(title, description?, action?)`, `info(title, description?)`
- [ ] **3.9** Add MAX_TOASTS constant (3) and implement queue overflow logic (remove oldest when max reached)
- [ ] **3.10** Implement notifyListeners function to trigger re-renders in consuming components
- [ ] **3.11** Export useToast hook and Toast type
- [ ] **3.12** Run `npx tsc --noEmit` to verify no TypeScript errors
- [ ] **3.13** Verify toast IDs are truly unique (use crypto.randomUUID() or Date.now() + Math.random())

---

## 4. Create TranslationTableSkeleton Component

**Context:** Create a skeleton loader for the translation status table that shows animated placeholder rows during data loading.

**Files to create:**
- `/src/components/TranslationManagement/skeletons/TranslationTableSkeleton.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **4.1** Create directory `/src/components/TranslationManagement/skeletons/` if it doesn't exist
- [ ] **4.2** Create new file `TranslationTableSkeleton.tsx` in skeletons directory
- [ ] **4.3** Import SkeletonBase from `@/components/SimpleDashboard/skeletons/SkeletonBase`
- [ ] **4.4** Check if SkeletonBase exists, if not, create basic skeleton div with pulse animation
- [ ] **4.5** Create TranslationTableSkeleton component
- [ ] **4.6** Wrap skeleton content in SkeletonBase with label prop: "Loading translation status"
- [ ] **4.7** Create 5 skeleton rows using Array(5).fill(0).map()
- [ ] **4.8** Each row contains 4 skeleton elements: language (w-20), name (w-32), status badge (w-24), action button (w-16)
- [ ] **4.9** Use Tailwind classes: `h-4` for text, `h-6` for badges, `h-8` for buttons, `bg-gray-200 rounded` for skeleton blocks
- [ ] **4.10** Add pulse animation class: `animate-pulse` to skeleton container
- [ ] **4.11** Export TranslationTableSkeleton component
- [ ] **4.12** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 5. Create TranslationFormSkeleton Component

**Context:** Create a skeleton loader for the translation edit form that shows animated placeholder fields during form data loading.

**Files to create:**
- `/src/components/TranslationManagement/skeletons/TranslationFormSkeleton.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **5.1** Create new file `TranslationFormSkeleton.tsx` in skeletons directory
- [ ] **5.2** Import SkeletonBase from `@/components/SimpleDashboard/skeletons/SkeletonBase`
- [ ] **5.3** Create TranslationFormSkeleton component
- [ ] **5.4** Wrap skeleton content in SkeletonBase with label prop: "Loading translation form"
- [ ] **5.5** Create skeleton for title input field: `h-10 w-full bg-gray-200 rounded`
- [ ] **5.6** Create skeleton for textarea field: `h-32 w-full bg-gray-200 rounded`
- [ ] **5.7** Create skeleton for description field: `h-24 w-full bg-gray-200 rounded`
- [ ] **5.8** Create skeleton for submit button: `h-10 w-1/3 bg-gray-200 rounded`
- [ ] **5.9** Add space-y-4 to container for vertical spacing between fields
- [ ] **5.10** Add pulse animation: `animate-pulse` class to skeleton blocks
- [ ] **5.11** Export TranslationFormSkeleton component
- [ ] **5.12** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 6. Create TranslationPanelSkeleton Component

**Context:** Create a skeleton loader for the translation preview panel that shows animated placeholders during status loading.

**Files to create:**
- `/src/components/TranslationManagement/skeletons/TranslationPanelSkeleton.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **6.1** Create new file `TranslationPanelSkeleton.tsx` in skeletons directory
- [ ] **6.2** Import SkeletonBase from `@/components/SimpleDashboard/skeletons/SkeletonBase`
- [ ] **6.3** Create TranslationPanelSkeleton component
- [ ] **6.4** Wrap skeleton content in SkeletonBase with label prop: "Loading translations"
- [ ] **6.5** Create 6 skeleton language rows (one for each supported language)
- [ ] **6.6** Each row contains: language flag/code (w-16), translation status (w-24), progress indicator (w-32), action buttons (w-20)
- [ ] **6.7** Add skeleton header: `h-6 w-48 bg-gray-200 rounded mb-4`
- [ ] **6.8** Use flex layout for rows with gap-4 between elements
- [ ] **6.9** Add pulse animation: `animate-pulse` to skeleton blocks
- [ ] **6.10** Export TranslationPanelSkeleton component
- [ ] **6.11** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 7. Update useTranslationStatus Hook with Error Handling

**Context:** Enhance the useTranslationStatus hook to properly expose error state, loading state, and retry functionality to consuming components.

**Files to modify:**
- `/src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **7.1** Read current `/src/hooks/useTranslationStatus.ts` implementation
- [ ] **7.2** Add import for useToast hook: `import { useToast } from '@/hooks/useToast';`
- [ ] **7.3** Add error state: `const [error, setError] = useState<Error | null>(null);`
- [ ] **7.4** Add isLoading state if not already present: `const [isLoading, setIsLoading] = useState(false);`
- [ ] **7.5** Get error toast function: `const { error: showError } = useToast();`
- [ ] **7.6** Wrap fetch call in try-catch block
- [ ] **7.7** Set isLoading to true at start of fetch, false in finally block
- [ ] **7.8** Set error to null at start of fetch (clear previous errors)
- [ ] **7.9** In catch block, set error state with Error object
- [ ] **7.10** In catch block, call showError toast with user-friendly message and error.message as description
- [ ] **7.11** Create retry function that calls fetchStatus again
- [ ] **7.12** Update return type to include: `error: Error | null`, `retry: () => Promise<void>`
- [ ] **7.13** Check response.ok before parsing JSON, throw error if not ok
- [ ] **7.14** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 8. Create useTranslationMutations Hook

**Context:** Create a new hook that centralizes all translation mutation operations (save, retranslate, retry) with loading states, error handling, and toast notifications.

**Files to create:**
- `/src/hooks/useTranslationMutations.ts` (NEW)

**Estimated effort:** 1 story point

- [ ] **8.1** Create new file `/src/hooks/useTranslationMutations.ts`
- [ ] **8.2** Import useState from React
- [ ] **8.3** Import useToast and useTranslations hooks
- [ ] **8.4** Define TranslationUpdateData interface with: `entityType: string`, `entityId: string`, `language: string`, `content: Record<string, string>`
- [ ] **8.5** Define return type with: `saveTranslation`, `retranslate`, `retryFailed`, `isSaving`, `isRetranslating`, `isRetrying`, `error`
- [ ] **8.6** Create hook function with separate loading states for each operation
- [ ] **8.7** Implement saveTranslation function: set isSaving true, fetch POST /api/translations/update, show success toast on success, show error toast with retry action on failure
- [ ] **8.8** Implement retranslate function: set isRetranslating true, fetch POST /api/translations/retry with languages array, show success/error toasts
- [ ] **8.9** Implement retryFailed function: set isRetrying true, fetch POST /api/translations/retry with single language, show success/error toasts
- [ ] **8.10** Add error state management: setError(null) at start of each operation, set error in catch blocks
- [ ] **8.11** Use try-catch-finally pattern with loading state set to false in finally blocks
- [ ] **8.12** Get translation keys from `useTranslations('translationManagement')` for toast messages
- [ ] **8.13** Export hook and types
- [ ] **8.14** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 9. Update TranslationPreviewPanel with Loading and Error States

**Context:** Add skeleton loader during initial fetch, error state with retry button, and loading indicators on action buttons in the TranslationPreviewPanel component.

**Files to modify:**
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Read current TranslationPreviewPanel implementation
- [ ] **9.2** Add imports: `Loader2`, `AlertCircle`, `RefreshCw` from lucide-react
- [ ] **9.3** Import TranslationPanelSkeleton from `../skeletons/TranslationPanelSkeleton`
- [ ] **9.4** Import useTranslationMutations hook
- [ ] **9.5** Update useTranslationStatus call to destructure error and retry: `const { status, isLoading, error, retry } = useTranslationStatus(...)`
- [ ] **9.6** Get mutation functions: `const { retranslate, retryFailed, isRetranslating, isRetrying } = useTranslationMutations()`
- [ ] **9.7** Add loading state condition: if isLoading is true, return TranslationPanelSkeleton
- [ ] **9.8** Add error state condition: if error exists and status is null, return error UI with AlertCircle icon, error message, and retry button
- [ ] **9.9** Update onRetranslate handler to use retranslate from hook and call retry() after success
- [ ] **9.10** Update onRetry handler to use retryFailed from hook and call retry() after success
- [ ] **9.11** Add disabled prop to action buttons: `disabled={isRetranslating || isRetrying}`
- [ ] **9.12** Add loading spinner to buttons when operation is in progress: `{isRetranslating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}`
- [ ] **9.13** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 10. Update TranslationEditForm with Loading and Error States

**Context:** Add skeleton loader during form data fetch, disabled form fields during save, loading spinner on save button, and error state with retry for the TranslationEditForm component.

**Files to modify:**
- `/src/components/TranslationManagement/TranslationEditForm/TranslationEditForm.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Read current TranslationEditForm implementation
- [ ] **10.2** Add imports: `Loader2`, `AlertCircle`, `RefreshCw` from lucide-react
- [ ] **10.3** Import TranslationFormSkeleton from `../skeletons/TranslationFormSkeleton`
- [ ] **10.4** Import useTranslationMutations hook
- [ ] **10.5** Add state for form data loading: `const [isLoadingData, setIsLoadingData] = useState(true)`
- [ ] **10.6** Add state for fetch error: `const [fetchError, setFetchError] = useState<Error | null>(null)`
- [ ] **10.7** Get saveTranslation and isSaving from useTranslationMutations: `const { saveTranslation, isSaving } = useTranslationMutations()`
- [ ] **10.8** Implement useEffect to fetch translation data on mount with loading and error handling
- [ ] **10.9** Add loading state condition: if isLoadingData is true, return TranslationFormSkeleton
- [ ] **10.10** Add error state condition: if fetchError exists, return error UI with AlertCircle icon, error message, and retry button that reloads page
- [ ] **10.11** Update handleSave to use saveTranslation from hook instead of direct fetch
- [ ] **10.12** Add disabled prop to all form inputs: `disabled={isSaving}`
- [ ] **10.13** Update save button to show loading spinner when isSaving: `{isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}`
- [ ] **10.14** Update save button text to show "Saving..." when isSaving, "Save" otherwise
- [ ] **10.15** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 11. Update TranslationStatusTable with Loading and Error States

**Context:** Add skeleton loader for table rows during data fetch, error state with retry, and loading indicators on action buttons in the TranslationStatusTable component.

**Files to modify:**
- `/src/components/TranslationManagement/TranslationStatusTable/TranslationStatusTable.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** Read current TranslationStatusTable implementation
- [ ] **11.2** Add imports: `Loader2`, `AlertCircle`, `RefreshCw` from lucide-react
- [ ] **11.3** Import TranslationTableSkeleton from `../skeletons/TranslationTableSkeleton`
- [ ] **11.4** Import useTranslationMutations hook
- [ ] **11.5** Add loading state: `const [isLoading, setIsLoading] = useState(true)`
- [ ] **11.6** Add error state: `const [error, setError] = useState<Error | null>(null)`
- [ ] **11.7** Get mutation functions: `const { retranslate, isRetranslating } = useTranslationMutations()`
- [ ] **11.8** Implement data fetching in useEffect with try-catch-finally for error and loading management
- [ ] **11.9** Add loading state condition: if isLoading is true, return TranslationTableSkeleton
- [ ] **11.10** Add error state condition: if error exists, return error UI with AlertCircle icon, error message, and retry button that reloads page
- [ ] **11.11** Update action button onClick handlers to use retranslate from hook
- [ ] **11.12** Add disabled prop to action buttons: `disabled={isRetranslating}`
- [ ] **11.13** Add loading spinner to buttons when isRetranslating: `{isRetranslating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}`
- [ ] **11.14** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 12. Update TranslationLanguageSelector with Loading States

**Context:** Add loading state during translation status check and disabled states for unavailable languages in the TranslationLanguageSelector component.

**Files to modify:**
- `/src/components/TranslationManagement/TranslationLanguageSelector/TranslationLanguageSelector.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** Read current TranslationLanguageSelector implementation
- [ ] **12.2** Add import for Loader2 icon from lucide-react
- [ ] **12.3** Import useTranslationStatus hook if not already imported
- [ ] **12.4** Call useTranslationStatus hook: `const { status, isLoading } = useTranslationStatus({ entityType, entityId })`
- [ ] **12.5** Map over available languages array to render language buttons
- [ ] **12.6** For each language, determine if available based on status: `const isAvailable = status?.languages?.find(l => l.code === lang)?.status`
- [ ] **12.7** Add disabled prop to buttons: `disabled={isLoading || !isAvailable}`
- [ ] **12.8** Add loading state classes: `isLoading && 'opacity-50 cursor-wait'`
- [ ] **12.9** Add unavailable state classes: `!isAvailable && !isLoading && 'opacity-30 cursor-not-allowed'`
- [ ] **12.10** Show Loader2 spinner inside button when isLoading: `{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{lang.toUpperCase()}</span>}`
- [ ] **12.11** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 13. Add Translation Keys for English Locale

**Context:** Add comprehensive error messages, loading text, and action labels to the English locale file for translation management.

**Files to modify:**
- `/messages/en.json`

**Estimated effort:** 1 story point

- [ ] **13.1** Open `/messages/en.json` file
- [ ] **13.2** Create or locate `translationManagement` namespace object
- [ ] **13.3** Add loading keys: `"loading": "Loading translations..."`, `"loadingStatus": "Loading translation status..."`, `"saving": "Saving..."`, `"retranslating": "Re-translating..."`, `"retrying": "Retrying..."`
- [ ] **13.4** Add action key: `"retry": "Retry"`
- [ ] **13.5** Create `errors` sub-object with keys: `title`, `generic`, `loadFailed`, `statusFetchFailed`, `saveFailed`, `retranslateFailed`, `retryFailed`, `networkError`, `unauthorized`, `notFound`, `validationError`
- [ ] **13.6** Add English error messages for each key with user-friendly, non-technical language
- [ ] **13.7** Create `success` sub-object with keys: `saved`, `retranslateStarted`, `retryStarted`
- [ ] **13.8** Add English success messages for each key
- [ ] **13.9** Verify JSON syntax is valid (proper commas, no trailing commas)
- [ ] **13.10** Run `npm run build` to verify translations load correctly

---

## 14. Add Translation Keys for Spanish Locale

**Context:** Add comprehensive error messages, loading text, and action labels to the Spanish locale file.

**Files to modify:**
- `/messages/es.json`

**Estimated effort:** 1 story point

- [ ] **14.1** Open `/messages/es.json` file
- [ ] **14.2** Create or locate `translationManagement` namespace object
- [ ] **14.3** Add loading keys in Spanish: `"loading": "Cargando traducciones..."`, `"loadingStatus": "Cargando estado de traducción..."`, etc.
- [ ] **14.4** Add action key: `"retry": "Reintentar"`
- [ ] **14.5** Create `errors` sub-object with Spanish translations for all error keys
- [ ] **14.6** Create `success` sub-object with Spanish translations for all success keys
- [ ] **14.7** Verify Spanish translations are grammatically correct and culturally appropriate
- [ ] **14.8** Verify JSON syntax is valid
- [ ] **14.9** Run `npm run build` to verify Spanish translations load correctly

---

## 15. Add Translation Keys for French Locale

**Context:** Add comprehensive error messages, loading text, and action labels to the French locale file.

**Files to modify:**
- `/messages/fr.json`

**Estimated effort:** 1 story point

- [ ] **15.1** Open `/messages/fr.json` file
- [ ] **15.2** Create or locate `translationManagement` namespace object
- [ ] **15.3** Add loading keys in French: `"loading": "Chargement des traductions..."`, `"loadingStatus": "Chargement du statut de traduction..."`, etc.
- [ ] **15.4** Add action key: `"retry": "Réessayer"`
- [ ] **15.5** Create `errors` sub-object with French translations for all error keys
- [ ] **15.6** Create `success` sub-object with French translations for all success keys
- [ ] **15.7** Verify French translations are grammatically correct and use appropriate formal/informal language
- [ ] **15.8** Verify JSON syntax is valid
- [ ] **15.9** Run `npm run build` to verify French translations load correctly

---

## 16. Add Translation Keys for German Locale

**Context:** Add comprehensive error messages, loading text, and action labels to the German locale file.

**Files to modify:**
- `/messages/de.json`

**Estimated effort:** 1 story point

- [ ] **16.1** Open `/messages/de.json` file
- [ ] **16.2** Create or locate `translationManagement` namespace object
- [ ] **16.3** Add loading keys in German: `"loading": "Übersetzungen werden geladen..."`, `"loadingStatus": "Übersetzungsstatus wird geladen..."`, etc.
- [ ] **16.4** Add action key: `"retry": "Wiederholen"`
- [ ] **16.5** Create `errors` sub-object with German translations for all error keys
- [ ] **16.6** Create `success` sub-object with German translations for all success keys
- [ ] **16.7** Verify German translations use appropriate compound nouns and formal language
- [ ] **16.8** Verify JSON syntax is valid
- [ ] **16.9** Run `npm run build` to verify German translations load correctly

---

## 17. Add Translation Keys for Italian Locale

**Context:** Add comprehensive error messages, loading text, and action labels to the Italian locale file.

**Files to modify:**
- `/messages/it.json`

**Estimated effort:** 1 story point

- [ ] **17.1** Open `/messages/it.json` file
- [ ] **17.2** Create or locate `translationManagement` namespace object
- [ ] **17.3** Add loading keys in Italian: `"loading": "Caricamento traduzioni..."`, `"loadingStatus": "Caricamento stato traduzione..."`, etc.
- [ ] **17.4** Add action key: `"retry": "Riprova"`
- [ ] **17.5** Create `errors` sub-object with Italian translations for all error keys
- [ ] **17.6** Create `success` sub-object with Italian translations for all success keys
- [ ] **17.7** Verify Italian translations are grammatically correct and culturally appropriate
- [ ] **17.8** Verify JSON syntax is valid
- [ ] **17.9** Run `npm run build` to verify Italian translations load correctly

---

## 18. Add Translation Keys for Dutch Locale

**Context:** Add comprehensive error messages, loading text, and action labels to the Dutch locale file.

**Files to modify:**
- `/messages/nl.json`

**Estimated effort:** 1 story point

- [ ] **18.1** Open `/messages/nl.json` file
- [ ] **18.2** Create or locate `translationManagement` namespace object
- [ ] **18.3** Add loading keys in Dutch: `"loading": "Vertalingen laden..."`, `"loadingStatus": "Vertaalstatus laden..."`, etc.
- [ ] **18.4** Add action key: `"retry": "Opnieuw proberen"`
- [ ] **18.5** Create `errors` sub-object with Dutch translations for all error keys
- [ ] **18.6** Create `success` sub-object with Dutch translations for all success keys
- [ ] **18.7** Verify Dutch translations are grammatically correct and use appropriate language
- [ ] **18.8** Verify JSON syntax is valid
- [ ] **18.9** Run `npm run build` to verify Dutch translations load correctly

---

## 19. Integrate Toaster into Dashboard Layout

**Context:** Add the Toaster component to the dashboard layout so toast notifications can be displayed from any page within the dashboard.

**Files to modify:**
- `/src/app/dashboard2/layout.tsx`

**Estimated effort:** 1 story point

- [ ] **19.1** Read current `/src/app/dashboard2/layout.tsx` file
- [ ] **19.2** Add import for Toaster: `import { Toaster } from '@/components/ui/toaster';`
- [ ] **19.3** Locate the return statement of the layout component
- [ ] **19.4** Add Toaster component after the children element: `{children}<Toaster />`
- [ ] **19.5** Verify Toaster is outside any conditional rendering or modal overlays
- [ ] **19.6** Ensure Toaster is rendered at the end of the layout so it appears above all content
- [ ] **19.7** Run `npx tsc --noEmit` to verify no TypeScript errors
- [ ] **19.8** Run `npm run build` to verify layout compiles correctly

---

## 20. Write Unit Tests for useToast Hook

**Context:** Create comprehensive unit tests for the useToast hook to verify toast creation, removal, auto-dismiss, and queue management.

**Files to create:**
- `/src/hooks/__tests__/useToast.test.ts` (NEW)

**Estimated effort:** 1 story point

- [ ] **20.1** Create `__tests__` directory in `/src/hooks/` if it doesn't exist
- [ ] **20.2** Create new file `useToast.test.ts` in __tests__ directory
- [ ] **20.3** Import necessary testing utilities from vitest and @testing-library/react-hooks
- [ ] **20.4** Import useToast hook
- [ ] **20.5** Add test case: "should add toast to queue"
- [ ] **20.6** Add test case: "should remove toast by ID"
- [ ] **20.7** Add test case: "should auto-dismiss success toasts after 5 seconds"
- [ ] **20.8** Add test case: "should NOT auto-dismiss error toasts"
- [ ] **20.9** Add test case: "should limit queue to MAX_TOASTS (3)"
- [ ] **20.10** Add test case: "success() convenience method creates success toast"
- [ ] **20.11** Add test case: "error() convenience method creates error toast with action"
- [ ] **20.12** Add test case: "info() convenience method creates info toast"
- [ ] **20.13** Run `npm test useToast.test` to verify all tests pass

---

## 21. Write Unit Tests for useTranslationStatus Hook

**Context:** Create unit tests for the enhanced useTranslationStatus hook to verify error handling, loading states, and retry functionality.

**Files to create or modify:**
- `/src/hooks/__tests__/useTranslationStatus.test.ts` (NEW or modify existing)

**Estimated effort:** 1 story point

- [ ] **21.1** Create or open `useTranslationStatus.test.ts` file in hooks __tests__ directory
- [ ] **21.2** Import necessary testing utilities and useTranslationStatus hook
- [ ] **21.3** Mock fetch API globally for tests
- [ ] **21.4** Mock useToast hook to spy on error toast calls
- [ ] **21.5** Add test case: "should set loading state during fetch"
- [ ] **21.6** Add test case: "should set error state when fetch fails"
- [ ] **21.7** Add test case: "should show error toast when fetch fails"
- [ ] **21.8** Add test case: "should clear error on retry"
- [ ] **21.9** Add test case: "should expose retry function"
- [ ] **21.10** Add test case: "should handle network errors gracefully"
- [ ] **21.11** Add test case: "should handle HTTP error responses (404, 500)"
- [ ] **21.12** Run `npm test useTranslationStatus.test` to verify all tests pass

---

## 22. Write Unit Tests for useTranslationMutations Hook

**Context:** Create unit tests for the useTranslationMutations hook to verify save, retranslate, and retry operations with loading states and error handling.

**Files to create:**
- `/src/hooks/__tests__/useTranslationMutations.test.ts` (NEW)

**Estimated effort:** 1 story point

- [ ] **22.1** Create new file `useTranslationMutations.test.ts` in hooks __tests__ directory
- [ ] **22.2** Import necessary testing utilities and useTranslationMutations hook
- [ ] **22.3** Mock fetch API and useToast hook
- [ ] **22.4** Add test case: "saveTranslation should set isSaving state"
- [ ] **22.5** Add test case: "saveTranslation should show success toast on success"
- [ ] **22.6** Add test case: "saveTranslation should show error toast with retry action on failure"
- [ ] **22.7** Add test case: "retranslate should set isRetranslating state"
- [ ] **22.8** Add test case: "retranslate should call API with correct payload"
- [ ] **22.9** Add test case: "retryFailed should set isRetrying state"
- [ ] **22.10** Add test case: "retryFailed should call API with single language"
- [ ] **22.11** Add test case: "should handle API errors and set error state"
- [ ] **22.12** Run `npm test useTranslationMutations.test` to verify all tests pass

---

## 23. Write Integration Tests for TranslationPreviewPanel

**Context:** Create integration tests to verify that TranslationPreviewPanel displays loading skeleton, error states, and handles user interactions correctly.

**Files to create:**
- `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationPreviewPanel.integration.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **23.1** Create `__tests__` directory in TranslationPreviewPanel component folder if not exists
- [ ] **23.2** Create new file `TranslationPreviewPanel.integration.test.tsx`
- [ ] **23.3** Import React Testing Library utilities and TranslationPreviewPanel
- [ ] **23.4** Mock useTranslationStatus and useTranslationMutations hooks
- [ ] **23.5** Add test case: "should show skeleton loader when isLoading is true"
- [ ] **23.6** Add test case: "should show error state with retry button when error exists"
- [ ] **23.7** Add test case: "should call retry when retry button is clicked"
- [ ] **23.8** Add test case: "should disable action buttons when operation is in progress"
- [ ] **23.9** Add test case: "should show loading spinner on action buttons during operations"
- [ ] **23.10** Add test case: "should display translation status when data is loaded"
- [ ] **23.11** Run `npm test TranslationPreviewPanel.integration.test` to verify all tests pass

---

## 24. Manual Test: Toast Notifications

**Context:** Manually verify that toast notifications appear correctly for all scenarios (success, error, info) and auto-dismiss properly.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **24.1** Start development server: `npm run dev`
- [ ] **24.2** Navigate to translation management page
- [ ] **24.3** Trigger a successful save operation
- [ ] **24.4** Verify success toast appears in bottom-right corner with green styling
- [ ] **24.5** Verify success toast auto-dismisses after 5 seconds
- [ ] **24.6** Trigger a failed operation (network error or validation error)
- [ ] **24.7** Verify error toast appears with red styling
- [ ] **24.8** Verify error toast does NOT auto-dismiss (requires manual close)
- [ ] **24.9** Verify error toast shows retry button if action is provided
- [ ] **24.10** Click retry button and verify operation is retried
- [ ] **24.11** Trigger multiple toasts simultaneously (max 3)
- [ ] **24.12** Verify oldest toast is removed when 4th toast is added

---

## 25. Manual Test: Loading States

**Context:** Manually verify that all loading states (skeleton loaders, button spinners, disabled states) display correctly during async operations.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **25.1** Navigate to translation preview panel
- [ ] **25.2** Verify skeleton loader appears while translation status is loading
- [ ] **25.3** Verify skeleton has pulse animation
- [ ] **25.4** Click re-translate button on a language
- [ ] **25.5** Verify button shows loading spinner (Loader2 icon)
- [ ] **25.6** Verify button is disabled during operation
- [ ] **25.7** Navigate to translation edit form
- [ ] **25.8** Verify form skeleton appears while data is loading
- [ ] **25.9** Edit translation and click Save
- [ ] **25.10** Verify save button shows "Saving..." text with spinner
- [ ] **25.11** Verify form fields are disabled during save
- [ ] **25.12** Navigate to translation status table
- [ ] **25.13** Verify table skeleton appears with 5 placeholder rows during load

---

## 26. Manual Test: Error Handling

**Context:** Manually verify that error states display correctly and retry functionality works as expected.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **26.1** Simulate network error by going offline or blocking API in DevTools
- [ ] **26.2** Navigate to translation preview panel
- [ ] **26.3** Verify error state appears with AlertCircle icon and error message
- [ ] **26.4** Verify retry button is displayed
- [ ] **26.5** Click retry button and verify it attempts to refetch data
- [ ] **26.6** Go back online and verify data loads successfully after retry
- [ ] **26.7** Navigate to translation edit form
- [ ] **26.8** Trigger save error (simulate 500 error from API)
- [ ] **26.9** Verify error toast appears with error message
- [ ] **26.10** Verify retry action button in toast works correctly
- [ ] **26.11** Test error handling for 404 (not found) and 401 (unauthorized) responses
- [ ] **26.12** Verify user-friendly error messages are shown (no technical jargon)

---

## 27. Manual Test: i18n Verification

**Context:** Manually verify that all error messages, loading text, and action labels translate correctly in all 6 supported locales.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **27.1** Set UI language to English and trigger various errors
- [ ] **27.2** Verify all error messages display in English
- [ ] **27.3** Switch to Spanish and trigger errors
- [ ] **27.4** Verify error messages translate to Spanish correctly
- [ ] **27.5** Verify loading text displays in Spanish
- [ ] **27.6** Verify retry button text is "Reintentar"
- [ ] **27.7** Repeat for French: verify translations, loading text, "Réessayer" button
- [ ] **27.8** Repeat for German: verify translations, loading text, "Wiederholen" button
- [ ] **27.9** Repeat for Italian: verify translations, loading text, "Riprova" button
- [ ] **27.10** Repeat for Dutch: verify translations, loading text, "Opnieuw proberen" button
- [ ] **27.11** Verify no missing translation key warnings in console
- [ ] **27.12** Verify all locale JSON files have no syntax errors

---

## 28. Run Full Type Check

**Context:** Verify that all TypeScript types are correct across all modified files and no compilation errors exist.

**Files to verify:** All modified TypeScript files

**Estimated effort:** 1 story point

- [ ] **28.1** Run `npx tsc --noEmit` from project root
- [ ] **28.2** Verify no errors in toast-related files (toast.tsx, toaster.tsx, useToast.ts)
- [ ] **28.3** Verify no errors in skeleton components
- [ ] **28.4** Verify no errors in useTranslationStatus.ts
- [ ] **28.5** Verify no errors in useTranslationMutations.ts
- [ ] **28.6** Verify no errors in updated TranslationManagement components
- [ ] **28.7** Fix any type mismatches related to Error types
- [ ] **28.8** Fix any type mismatches related to async/await patterns
- [ ] **28.9** Verify toast variant types match expected values
- [ ] **28.10** Run `npx tsc --noEmit` again and verify 0 errors

---

## 29. Run ESLint and Fix Warnings

**Context:** Verify that code follows project linting standards and fix any ESLint warnings related to error handling and async operations.

**Files to verify:** All modified files

**Estimated effort:** 1 story point

- [ ] **29.1** Run `npm run lint` from project root
- [ ] **29.2** Review warnings in toast-related files
- [ ] **29.3** Fix unused variable warnings
- [ ] **29.4** Fix missing dependency warnings in useEffect hooks (add error/retry to deps if needed)
- [ ] **29.5** Fix any async/await warnings (missing await, unhandled promises)
- [ ] **29.6** Fix accessibility warnings (missing ARIA labels on retry buttons)
- [ ] **29.7** Review warnings in TranslationManagement components
- [ ] **29.8** Run `npm run lint` again and verify all warnings are resolved
- [ ] **29.9** Commit lint fixes separately if needed

---

## 30. Run All Tests and Build

**Context:** Run the full test suite and production build to ensure no regressions and all new code works correctly.

**Files to verify:** Build output and test results

**Estimated effort:** 1 story point

- [ ] **30.1** Run `npm test` to execute all tests
- [ ] **30.2** Verify all existing tests continue to pass (no regressions)
- [ ] **30.3** Verify all new unit tests pass (useToast, useTranslationStatus, useTranslationMutations)
- [ ] **30.4** Verify all new integration tests pass (TranslationPreviewPanel)
- [ ] **30.5** Check test coverage: `npm run test:coverage` (if available)
- [ ] **30.6** Verify coverage is above 80% for new code
- [ ] **30.7** Run `npm run build` to create production build
- [ ] **30.8** Verify build completes without errors
- [ ] **30.9** Check for build warnings related to toast or translation components
- [ ] **30.10** Run `npm start` to test production build locally
- [ ] **30.11** Navigate to translation pages and verify loading/error states work in production
- [ ] **30.12** Stop production server after verification

---

## Status: PENDING

**Last Modified:** 2026-01-23 12:45

---

## Dependencies

### Required (Must Be Complete First)
- **REQ-E05-007**: TranslationPreviewPanel Component (must exist before adding loading/error states)
- **REQ-E05-008**: TranslationEditForm Component (must exist before adding loading/error states)
- **REQ-E05-009**: TranslationStatusTable Component (must exist before adding loading/error states)
- **REQ-E05-010**: TranslationLanguageSelector Component (must exist before adding loading/error states)
- **REQ-E05-011**: useTranslationStatus Hook (must exist before enhancing)
- **REQ-E05-001**: Translation Status API (must exist to test error scenarios)

### Blocks (Requires This First)
- None (this is a polish/enhancement task that doesn't block other features)

### Parallel Safety
- **Files modified**: Toast system (new), skeleton loaders (new), translation hooks, all 4 TranslationManagement components, dashboard layout, 6 locale files
- **Conflicts with**: Any task modifying the same TranslationManagement components (REQ-E05-007 through REQ-E05-012)
- **Safe to parallelize with**: REQ-E05-028, REQ-E05-029 (modify different pages), API/backend tasks

---

## Authorized Files for Modification

### New Files to Create
1. `/src/components/ui/toast.tsx` - Toast component
2. `/src/components/ui/toaster.tsx` - Toaster provider
3. `/src/hooks/useToast.ts` - Toast hook
4. `/src/components/TranslationManagement/skeletons/TranslationTableSkeleton.tsx` - Table skeleton
5. `/src/components/TranslationManagement/skeletons/TranslationFormSkeleton.tsx` - Form skeleton
6. `/src/components/TranslationManagement/skeletons/TranslationPanelSkeleton.tsx` - Panel skeleton
7. `/src/hooks/useTranslationMutations.ts` - Mutations hook

### Existing Files to Modify
1. `/src/hooks/useTranslationStatus.ts` - Add error handling
2. `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` - Add loading/error states
3. `/src/components/TranslationManagement/TranslationEditForm/TranslationEditForm.tsx` - Add loading/error states
4. `/src/components/TranslationManagement/TranslationStatusTable/TranslationStatusTable.tsx` - Add loading/error states
5. `/src/components/TranslationManagement/TranslationLanguageSelector/TranslationLanguageSelector.tsx` - Add loading states
6. `/src/app/dashboard2/layout.tsx` - Add Toaster component
7. `/messages/en.json` - Add translationManagement namespace
8. `/messages/es.json` - Add translationManagement namespace
9. `/messages/fr.json` - Add translationManagement namespace
10. `/messages/de.json` - Add translationManagement namespace
11. `/messages/it.json` - Add translationManagement namespace
12. `/messages/nl.json` - Add translationManagement namespace

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ Toast system implemented with Radix UI primitives
2. ✅ Toast notifications support success, error, and info variants
3. ✅ Success toasts auto-dismiss after 5 seconds
4. ✅ Error toasts remain visible until manually dismissed
5. ✅ Toast queue limited to 3 notifications
6. ✅ Skeleton loaders created for table, form, and panel
7. ✅ Skeleton loaders use pulse animation
8. ✅ useTranslationStatus hook exposes error and retry
9. ✅ useTranslationMutations hook handles save, retranslate, retry
10. ✅ All mutations show loading states (isSaving, isRetranslating, isRetrying)
11. ✅ All mutations show toast notifications on success/error
12. ✅ TranslationPreviewPanel shows skeleton during load
13. ✅ TranslationPreviewPanel shows error state with retry button
14. ✅ TranslationEditForm shows skeleton during data fetch
15. ✅ TranslationEditForm disables fields during save
16. ✅ TranslationStatusTable shows skeleton during load
17. ✅ TranslationLanguageSelector shows loading state during status check
18. ✅ All components show loading spinners on action buttons
19. ✅ All components disable buttons during operations
20. ✅ Translation keys added for all 6 locales
21. ✅ Error messages are user-friendly and non-technical
22. ✅ Toaster integrated into dashboard layout
23. ✅ All unit tests pass (useToast, useTranslationStatus, useTranslationMutations)
24. ✅ All integration tests pass (TranslationPreviewPanel)
25. ✅ No TypeScript compilation errors
26. ✅ No ESLint warnings
27. ✅ Production build succeeds
28. ✅ Manual testing confirms all loading/error states work
29. ✅ i18n verification confirms all locales work correctly
30. ✅ Retry functionality works for all failed operations

---

**Document Status**: PENDING
**Last Modified**: 2026-01-23 12:45
