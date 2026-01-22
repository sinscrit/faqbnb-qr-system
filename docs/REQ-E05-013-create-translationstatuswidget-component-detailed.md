# REQ-E05-013: Create TranslationStatusWidget Component - DETAILED TASK BREAKDOWN

**Generated**: 2026-01-22 23:05
**Request**: REQ-E05-013
**Epic**: Epic 5 - Owner Translation Management
**Phase**: 3 - Dashboard Integration
**Task ID**: 3.1

**Reference Documents**:
- Requirements: `/docs/gen_requests_epic5.md` (REQ-E05-013)
- Overview: `/docs/REQ-E05-013-create-translationstatuswidget-component-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Task 1: Create Component Directory Structure

**Context**: Establish the directory structure for TranslationStatusWidget following the established pattern from SimpleDashboard components and other TranslationManagement components.

**Files to modify**:
- Create directory: `/src/components/TranslationManagement/TranslationStatusWidget/`

**Estimated effort**: 5 minutes

**Subtasks**:
- [ ] **1.1** Create new directory at `/src/components/TranslationManagement/TranslationStatusWidget/`
- [ ] **1.2** Verify parent directory `/src/components/TranslationManagement/` exists
- [ ] **1.3** Add README note in directory for future reference (optional)

---

## Task 2: Create StatusCard Subcomponent - File and Imports

**Context**: Create a reusable card component for displaying individual status counts, following the pattern from SimpleDashboard StatisticsCards.tsx (lines 50-82).

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/StatusCard.tsx` (create new file)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **2.1** Create new file at `/src/components/TranslationManagement/TranslationStatusWidget/StatusCard.tsx`
- [ ] **2.2** Add 'use client' directive at top of file
- [ ] **2.3** Import React from 'react'
- [ ] **2.4** Import `cn` utility from '@/lib/utils'
- [ ] **2.5** Add TODO comment for icon type import (will be passed as ReactNode)

---

## Task 3: Define StatusCard Props Interface

**Context**: Define the TypeScript interface for StatusCard props with proper JSDoc documentation.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/StatusCard.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **3.1** Define `StatusCardProps` interface with JSDoc comment
- [ ] **3.2** Add `status: 'complete' | 'partial' | 'pending' | 'failed'` field with comment
- [ ] **3.3** Add `count: number` field with comment "Number to display"
- [ ] **3.4** Add `label: string` field with comment "Translated label text"
- [ ] **3.5** Add `icon: React.ReactNode` field with comment "Icon component (from lucide-react)"
- [ ] **3.6** Add `compact?: boolean` field with comment "Compact mode for smaller layout (default: false)"
- [ ] **3.7** Add `className?: string` field for additional styling
- [ ] **3.8** Export interface with `export` keyword

---

## Task 4: Implement StatusCard Color Mapping Logic

**Context**: Create mapping from status type to Tailwind color classes for consistent theming.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/StatusCard.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **4.1** Define `STATUS_COLOR_MAP` constant with `as const` assertion
- [ ] **4.2** Add mapping for 'complete': text color `text-green-600`, bg color `bg-green-50`, border `border-green-200`
- [ ] **4.3** Add mapping for 'partial': text color `text-blue-600`, bg color `bg-blue-50`, border `border-blue-200`
- [ ] **4.4** Add mapping for 'pending': text color `text-orange-600`, bg color `bg-orange-50`, border `border-orange-200`
- [ ] **4.5** Add mapping for 'failed': text color `text-red-600`, bg color `bg-red-50`, border `border-red-200`
- [ ] **4.6** Add dark mode variants for each: `dark:bg-green-950`, `dark:border-green-800`, etc.
- [ ] **4.7** Add JSDoc comment explaining the color system rationale

---

## Task 5: Implement StatusCard Component Structure

**Context**: Build the card layout with responsive sizing and conditional styling based on compact mode.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/StatusCard.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **5.1** Define function: `export function StatusCard({ status, count, label, icon, compact = false, className }: StatusCardProps)`
- [ ] **5.2** Get color classes from STATUS_COLOR_MAP using status key
- [ ] **5.3** Create outer container div with base classes: `rounded-lg border transition-shadow`
- [ ] **5.4** Add conditional padding: `compact ? 'p-2' : 'p-4'`
- [ ] **5.5** Add hover effect: `hover:shadow-md`
- [ ] **5.6** Apply status-specific colors from map (text, bg, border)
- [ ] **5.7** Merge with className prop using `cn()` utility
- [ ] **5.8** Inside container, create flex layout: `flex items-center gap-3` (or `gap-2` if compact)

---

## Task 6: Implement StatusCard Icon Section

**Context**: Display the icon with proper sizing and color.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/StatusCard.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **6.1** Create icon container div with flex-shrink-0
- [ ] **6.2** Apply status text color from map
- [ ] **6.3** Conditionally size icon wrapper: `compact ? 'w-5 h-5' : 'w-6 h-6'`
- [ ] **6.4** Render icon prop inside container
- [ ] **6.5** Add ARIA hidden attribute to icon container (decorative)

---

## Task 7: Implement StatusCard Content Section

**Context**: Display count and label with responsive typography.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/StatusCard.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **7.1** Create content container div with `flex-1 min-w-0` (text truncation support)
- [ ] **7.2** Create count div with conditional sizing: `compact ? 'text-lg' : 'text-2xl'`
- [ ] **7.3** Add font weight: `font-bold`
- [ ] **7.4** Apply status text color to count
- [ ] **7.5** Render count value
- [ ] **7.6** Create label div with conditional sizing: `compact ? 'text-xs' : 'text-sm'`
- [ ] **7.7** Add text color: `text-gray-600 dark:text-gray-400`
- [ ] **7.8** Add truncation: `truncate`
- [ ] **7.9** Render label text
- [ ] **7.10** Add ARIA label to outer container describing the status card

---

## Task 8: Create Main Widget File with Imports

**Context**: Set up the main TranslationStatusWidget component file with all necessary imports.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` (create new file)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **8.1** Create new file at `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
- [ ] **8.2** Add 'use client' directive at top of file
- [ ] **8.3** Import React hooks: `useMemo` from 'react'
- [ ] **8.4** Import `useTranslations` from 'next-intl'
- [ ] **8.5** Import `cn` utility from '@/lib/utils'
- [ ] **8.6** Import `useTranslationStatus` from '@/hooks' (REQ-E05-011 dependency)
- [ ] **8.7** Import `TranslationProgressBar` from '../TranslationProgressBar' (REQ-E05-009 dependency)
- [ ] **8.8** Import `StatusCard` from './StatusCard'
- [ ] **8.9** Import `SkeletonBase` from '@/components/Skeleton'
- [ ] **8.10** Import icons from 'lucide-react': `CheckCircle2`, `AlertCircle`, `Clock`, `XCircle`, `ChevronRight`, `RefreshCw`, `Languages`
- [ ] **8.11** Import Link from 'next/link' (for View Details navigation)

---

## Task 9: Define TranslationStatusWidget Props Interface

**Context**: Define the component props interface with comprehensive JSDoc documentation.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **9.1** Define `TranslationStatusWidgetProps` interface with JSDoc comment
- [ ] **9.2** Add `propertyId?: string` field with comment "Filter to specific property (optional)"
- [ ] **9.3** Add `compact?: boolean` field with comment "Compact mode for sidebar placement (default: false)"
- [ ] **9.4** Add `onViewAll?: () => void` field with comment "Callback when View Details is clicked"
- [ ] **9.5** Add `showViewAllLink?: boolean` field with comment "Show/hide View Details link (default: true)"
- [ ] **9.6** Add `className?: string` field with comment "Additional CSS classes"
- [ ] **9.7** Export interface with `export` keyword

---

## Task 10: Implement Component Function Signature and Hooks

**Context**: Set up the main component function with useTranslations and useTranslationStatus hooks.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **10.1** Define function: `export function TranslationStatusWidget({ propertyId, compact = false, onViewAll, showViewAllLink = true, className }: TranslationStatusWidgetProps)`
- [ ] **10.2** Call `useTranslations('translationManagement.widget')` and store as `t`
- [ ] **10.3** Call `useTranslationStatus` with options object
- [ ] **10.4** Set scope to `propertyId ? 'property' : 'all'`
- [ ] **10.5** Pass `propertyId` if defined
- [ ] **10.6** Destructure return: `{ status: translationStatus, isLoading, error, refetch }`
- [ ] **10.7** Add comment about data structure expectations

---

## Task 11: Calculate Status Counts with useMemo

**Context**: Extract and compute status counts from translationStatus data with memoization for performance.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **11.1** Define `statusCounts` using `useMemo(() => { ... }, [translationStatus])`
- [ ] **11.2** Extract `completeCount` from `translationStatus?.summary?.complete ?? 0`
- [ ] **11.3** Extract `partialCount` from `translationStatus?.summary?.partial ?? 0`
- [ ] **11.4** Extract `pendingCount` from `translationStatus?.summary?.pending ?? 0`
- [ ] **11.5** Extract `failedCount` from `translationStatus?.summary?.failed ?? 0`
- [ ] **11.6** Calculate `totalEntities` as sum of all counts
- [ ] **11.7** Return object with all counts and total
- [ ] **11.8** Add JSDoc comment explaining data extraction logic
- [ ] **11.9** Add fallback handling for undefined/null translationStatus
- [ ] **11.10** Consider partial weight in completion calculation (e.g., partial entities count as 0.5 toward completion)

---

## Task 12: Calculate Completion Percentage with useMemo

**Context**: Compute overall translation completion percentage for progress bar.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **12.1** Define `completionPercentage` using `useMemo(() => { ... }, [statusCounts])`
- [ ] **12.2** Return 0 if `statusCounts.totalEntities === 0`
- [ ] **12.3** Define `partialWeight = 0.5` (partial translations count as 50% complete)
- [ ] **12.4** Calculate weighted completion: `(completeCount + (partialCount * partialWeight)) / totalEntities`
- [ ] **12.5** Multiply by 100 and round: `Math.round(weightedCompletion * 100)`
- [ ] **12.6** Clamp result between 0 and 100: `Math.max(0, Math.min(100, percentage))`
- [ ] **12.7** Return final percentage
- [ ] **12.8** Add JSDoc comment explaining partial weight rationale

---

## Task 13: Implement Loading Skeleton State

**Context**: Create accessible loading state using SkeletonBase following SimpleDashboard patterns.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **13.1** Add conditional render: `if (isLoading) { return (...) }`
- [ ] **13.2** Wrap skeleton in `<SkeletonBase label={t('loading')}>`
- [ ] **13.3** Create outer container div matching widget dimensions with className prop
- [ ] **13.4** Add skeleton header bar: height matching actual header, gradient shimmer
- [ ] **13.5** Add skeleton progress bar: 8px height, rounded, shimmer effect with `animate-pulse`
- [ ] **13.6** Create skeleton grid: `grid grid-cols-2` (compact) or `grid-cols-2 md:grid-cols-4` (standard)
- [ ] **13.7** Add gap classes: `gap-2` (compact) or `gap-4` (standard)
- [ ] **13.8** Render 4 skeleton cards with height matching StatusCard
- [ ] **13.9** Each skeleton card has rounded corners and shimmer
- [ ] **13.10** Ensure skeleton respects compact prop for sizing
- [ ] **13.11** Add ARIA busy attribute to skeleton container

---

## Task 14: Implement Error State Component

**Context**: Display user-friendly error message with retry functionality.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **14.1** Add conditional render after loading check: `if (error) { return (...) }`
- [ ] **14.2** Create outer container div matching widget dimensions with className prop
- [ ] **14.3** Use flex layout: `flex flex-col items-center justify-center`
- [ ] **14.4** Add min-height to maintain widget space: `min-h-[200px]` (compact) or `min-h-[300px]` (standard)
- [ ] **14.5** Render XCircle icon with red color: `text-red-500`
- [ ] **14.6** Add icon size: `compact ? 'w-8 h-8' : 'w-12 h-12'`
- [ ] **14.7** Display error message: `t('error')` or `error.message` if available
- [ ] **14.8** Add text styling: `text-center text-gray-600 dark:text-gray-400`
- [ ] **14.9** Create retry button with onClick handler calling `refetch()`
- [ ] **14.10** Button includes RefreshCw icon and translated "Retry" text
- [ ] **14.11** Add ARIA label to retry button
- [ ] **14.12** Style button with hover effects and proper spacing

---

## Task 15: Implement Empty State Component

**Context**: Handle case where no translation data exists for the property.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **15.1** Add conditional render after error check: `if (!translationStatus || statusCounts.totalEntities === 0) { return (...) }`
- [ ] **15.2** Create outer container div matching widget dimensions with className prop
- [ ] **15.3** Use flex layout: `flex flex-col items-center justify-center`
- [ ] **15.4** Add min-height to maintain widget space
- [ ] **15.5** Render Languages icon with gray color: `text-gray-400`
- [ ] **15.6** Add icon size: `compact ? 'w-8 h-8' : 'w-12 h-12'`
- [ ] **15.7** Display empty message: `t('empty')`
- [ ] **15.8** Add text styling: `text-center text-gray-500 dark:text-gray-400`
- [ ] **15.9** Ensure message is accessible to screen readers

---

## Task 16: Implement Widget Header Section

**Context**: Create gradient header with title and optional View Details link following SimpleDashboard PortfolioSummary pattern.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **16.1** Create header container div with flex layout: `flex items-center justify-between`
- [ ] **16.2** Add gradient background: `bg-gradient-to-r from-purple-600 to-indigo-600`
- [ ] **16.3** Add padding: `compact ? 'px-3 py-2' : 'px-4 py-3'`
- [ ] **16.4** Add rounded top corners: `rounded-t-lg`
- [ ] **16.5** Create title section with Languages icon and text
- [ ] **16.6** Title text: `compact ? 'text-sm' : 'text-base'`, `font-semibold text-white`
- [ ] **16.7** Conditionally render View Details link if `showViewAllLink === true`
- [ ] **16.8** If `onViewAll` callback exists, render as button with onClick handler
- [ ] **16.9** Otherwise render as Link component with href to translation management page
- [ ] **16.10** Link/button includes ChevronRight icon and translated text: `t('viewDetails')`
- [ ] **16.11** Style link with: `text-white/90 hover:text-white transition-colors`
- [ ] **16.12** Add text size: `compact ? 'text-xs' : 'text-sm'`
- [ ] **16.13** Ensure color contrast meets WCAG AA standards (white on purple gradient)

---

## Task 17: Implement Progress Bar Section

**Context**: Display overall translation progress using TranslationProgressBar component.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **17.1** Create progress section container with padding: `compact ? 'p-3' : 'p-4'`
- [ ] **17.2** Add border bottom: `border-b border-gray-200 dark:border-gray-700`
- [ ] **17.3** Create flex layout with space-between for percentage label and progress
- [ ] **17.4** Display completion percentage: `t('progress', { percent: completionPercentage })`
- [ ] **17.5** Style percentage text: `compact ? 'text-sm' : 'text-base'`, `font-medium text-gray-700 dark:text-gray-300`
- [ ] **17.6** Render TranslationProgressBar component below percentage
- [ ] **17.7** Pass percentage prop: `percentage={completionPercentage}`
- [ ] **17.8** Pass size prop: `size={compact ? 'sm' : 'md'}`
- [ ] **17.9** Add margin top for spacing: `mt-2`
- [ ] **17.10** Add ARIA label to progress section: "Translation progress"

---

## Task 18: Implement Status Cards Grid Section

**Context**: Display status breakdown cards in responsive grid layout.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **18.1** Create status cards section container with padding: `compact ? 'p-3' : 'p-4'`
- [ ] **18.2** Create grid container: `compact ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 md:grid-cols-4 gap-4'`
- [ ] **18.3** Render StatusCard for 'complete' status
- [ ] **18.4** Pass status='complete', count from statusCounts, label from `t('statusLabels.complete')`
- [ ] **18.5** Pass icon: `<CheckCircle2 />`, compact prop
- [ ] **18.6** Render StatusCard for 'partial' status
- [ ] **18.7** Pass status='partial', count from statusCounts, label from `t('statusLabels.partial')`
- [ ] **18.8** Pass icon: `<AlertCircle />`, compact prop
- [ ] **18.9** Render StatusCard for 'pending' status
- [ ] **18.10** Pass status='pending', count from statusCounts, label from `t('statusLabels.pending')`
- [ ] **18.11** Pass icon: `<Clock />`, compact prop
- [ ] **18.12** Render StatusCard for 'failed' status
- [ ] **18.13** Pass status='failed', count from statusCounts, label from `t('statusLabels.failed')`
- [ ] **18.14** Pass icon: `<XCircle />`, compact prop
- [ ] **18.15** Add ARIA label to grid section: "Translation status breakdown"

---

## Task 19: Apply Widget Container Styling

**Context**: Wrap all content in styled container matching dashboard patterns.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **19.1** Create outer container div wrapping all widget content
- [ ] **19.2** Add base classes: `rounded-lg shadow-md bg-white dark:bg-gray-800`
- [ ] **19.3** Add border: `border border-gray-200 dark:border-gray-700`
- [ ] **19.4** Add hover effect: `hover:shadow-lg transition-shadow duration-200`
- [ ] **19.5** Add overflow hidden for rounded corners: `overflow-hidden`
- [ ] **19.6** Merge with className prop using `cn()` utility
- [ ] **19.7** Ensure container has proper flex/block display
- [ ] **19.8** Add ARIA role: `role="region"` with `aria-label="Translation status widget"`

---

## Task 20: Create Barrel Export for Widget Directory

**Context**: Create index file for clean imports following established pattern.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusWidget/index.ts` (create new file)

**Estimated effort**: 5 minutes

**Subtasks**:
- [ ] **20.1** Create new file at `/src/components/TranslationManagement/TranslationStatusWidget/index.ts`
- [ ] **20.2** Add default export: `export { TranslationStatusWidget as default } from './TranslationStatusWidget'`
- [ ] **20.3** Add named export: `export { TranslationStatusWidget } from './TranslationStatusWidget'`
- [ ] **20.4** Add type export: `export type { TranslationStatusWidgetProps } from './TranslationStatusWidget'`
- [ ] **20.5** Add comment explaining barrel export pattern

---

## Task 21: Update Parent Barrel Export

**Context**: Add TranslationStatusWidget to TranslationManagement namespace exports.

**Files to modify**:
- `/src/components/TranslationManagement/index.ts`

**Estimated effort**: 5 minutes

**Subtasks**:
- [ ] **21.1** Open `/src/components/TranslationManagement/index.ts` file
- [ ] **21.2** Find or create comment section for "Widget Components"
- [ ] **21.3** Add export: `export { TranslationStatusWidget } from './TranslationStatusWidget'`
- [ ] **21.4** Add type export: `export type { TranslationStatusWidgetProps } from './TranslationStatusWidget'`
- [ ] **21.5** Maintain alphabetical or logical ordering of exports
- [ ] **21.6** Save file

---

## Task 22: Add English Translation Keys

**Context**: Add all required translation keys to English message file (source language).

**Files to modify**:
- `/messages/en.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **22.1** Open `/messages/en.json` file
- [ ] **22.2** Navigate to or create `translationManagement` namespace
- [ ] **22.3** Create `widget` sub-namespace
- [ ] **22.4** Add key: `"title": "Translation Status"`
- [ ] **22.5** Add key: `"viewDetails": "View Details"`
- [ ] **22.6** Create `statusLabels` sub-namespace
- [ ] **22.7** Add key: `"statusLabels.complete": "Complete"`
- [ ] **22.8** Add key: `"statusLabels.partial": "Partial"`
- [ ] **22.9** Add key: `"statusLabels.pending": "Pending"`
- [ ] **22.10** Add key: `"statusLabels.failed": "Failed"`
- [ ] **22.11** Add key: `"loading": "Loading translation status..."`
- [ ] **22.12** Add key: `"error": "Failed to load translation status"`
- [ ] **22.13** Add key: `"empty": "No translation data available"`
- [ ] **22.14** Add key: `"progress": "{percent}% Complete"`
- [ ] **22.15** Add key: `"retry": "Retry"`
- [ ] **22.16** Validate JSON syntax
- [ ] **22.17** Save file

---

## Task 23: Add French Translation Keys

**Context**: Translate all widget keys to French.

**Files to modify**:
- `/messages/fr.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **23.1** Open `/messages/fr.json` file
- [ ] **23.2** Navigate to or create `translationManagement.widget` namespace
- [ ] **23.3** Add key: `"title": "Statut des traductions"`
- [ ] **23.4** Add key: `"viewDetails": "Voir les détails"`
- [ ] **23.5** Add key: `"statusLabels.complete": "Complet"`
- [ ] **23.6** Add key: `"statusLabels.partial": "Partiel"`
- [ ] **23.7** Add key: `"statusLabels.pending": "En attente"`
- [ ] **23.8** Add key: `"statusLabels.failed": "Échoué"`
- [ ] **23.9** Add key: `"loading": "Chargement du statut des traductions..."`
- [ ] **23.10** Add key: `"error": "Impossible de charger le statut des traductions"`
- [ ] **23.11** Add key: `"empty": "Aucune donnée de traduction disponible"`
- [ ] **23.12** Add key: `"progress": "{percent}% complété"`
- [ ] **23.13** Add key: `"retry": "Réessayer"`
- [ ] **23.14** Validate JSON syntax
- [ ] **23.15** Save file

---

## Task 24: Add Spanish Translation Keys

**Context**: Translate all widget keys to Spanish.

**Files to modify**:
- `/messages/es.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **24.1** Open `/messages/es.json` file
- [ ] **24.2** Navigate to or create `translationManagement.widget` namespace
- [ ] **24.3** Add key: `"title": "Estado de traducción"`
- [ ] **24.4** Add key: `"viewDetails": "Ver detalles"`
- [ ] **24.5** Add key: `"statusLabels.complete": "Completo"`
- [ ] **24.6** Add key: `"statusLabels.partial": "Parcial"`
- [ ] **24.7** Add key: `"statusLabels.pending": "Pendiente"`
- [ ] **24.8** Add key: `"statusLabels.failed": "Fallido"`
- [ ] **24.9** Add key: `"loading": "Cargando estado de traducción..."`
- [ ] **24.10** Add key: `"error": "Error al cargar el estado de traducción"`
- [ ] **24.11** Add key: `"empty": "No hay datos de traducción disponibles"`
- [ ] **24.12** Add key: `"progress": "{percent}% completo"`
- [ ] **24.13** Add key: `"retry": "Reintentar"`
- [ ] **24.14** Validate JSON syntax
- [ ] **24.15** Save file

---

## Task 25: Add German Translation Keys

**Context**: Translate all widget keys to German.

**Files to modify**:
- `/messages/de.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **25.1** Open `/messages/de.json` file
- [ ] **25.2** Navigate to or create `translationManagement.widget` namespace
- [ ] **25.3** Add key: `"title": "Übersetzungsstatus"`
- [ ] **25.4** Add key: `"viewDetails": "Details anzeigen"`
- [ ] **25.5** Add key: `"statusLabels.complete": "Vollständig"`
- [ ] **25.6** Add key: `"statusLabels.partial": "Teilweise"`
- [ ] **25.7** Add key: `"statusLabels.pending": "Ausstehend"`
- [ ] **25.8** Add key: `"statusLabels.failed": "Fehlgeschlagen"`
- [ ] **25.9** Add key: `"loading": "Lade Übersetzungsstatus..."`
- [ ] **25.10** Add key: `"error": "Fehler beim Laden des Übersetzungsstatus"`
- [ ] **25.11** Add key: `"empty": "Keine Übersetzungsdaten verfügbar"`
- [ ] **25.12** Add key: `"progress": "{percent}% abgeschlossen"`
- [ ] **25.13** Add key: `"retry": "Wiederholen"`
- [ ] **25.14** Validate JSON syntax
- [ ] **25.15** Save file

---

## Task 26: Add Dutch Translation Keys

**Context**: Translate all widget keys to Dutch.

**Files to modify**:
- `/messages/nl.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **26.1** Open `/messages/nl.json` file
- [ ] **26.2** Navigate to or create `translationManagement.widget` namespace
- [ ] **26.3** Add key: `"title": "Vertaalstatus"`
- [ ] **26.4** Add key: `"viewDetails": "Bekijk details"`
- [ ] **26.5** Add key: `"statusLabels.complete": "Compleet"`
- [ ] **26.6** Add key: `"statusLabels.partial": "Gedeeltelijk"`
- [ ] **26.7** Add key: `"statusLabels.pending": "In behandeling"`
- [ ] **26.8** Add key: `"statusLabels.failed": "Mislukt"`
- [ ] **26.9** Add key: `"loading": "Vertaalstatus laden..."`
- [ ] **26.10** Add key: `"error": "Kan vertaalstatus niet laden"`
- [ ] **26.11** Add key: `"empty": "Geen vertaalgegevens beschikbaar"`
- [ ] **26.12** Add key: `"progress": "{percent}% voltooid"`
- [ ] **26.13** Add key: `"retry": "Opnieuw proberen"`
- [ ] **26.14** Validate JSON syntax
- [ ] **26.15** Save file

---

## Task 27: Add Italian Translation Keys

**Context**: Translate all widget keys to Italian.

**Files to modify**:
- `/messages/it.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **27.1** Open `/messages/it.json` file
- [ ] **27.2** Navigate to or create `translationManagement.widget` namespace
- [ ] **27.3** Add key: `"title": "Stato della traduzione"`
- [ ] **27.4** Add key: `"viewDetails": "Vedi dettagli"`
- [ ] **27.5** Add key: `"statusLabels.complete": "Completo"`
- [ ] **27.6** Add key: `"statusLabels.partial": "Parziale"`
- [ ] **27.7** Add key: `"statusLabels.pending": "In attesa"`
- [ ] **27.8** Add key: `"statusLabels.failed": "Non riuscito"`
- [ ] **27.9** Add key: `"loading": "Caricamento stato traduzione..."`
- [ ] **27.10** Add key: `"error": "Impossibile caricare lo stato della traduzione"`
- [ ] **27.11** Add key: `"empty": "Nessun dato di traduzione disponibile"`
- [ ] **27.12** Add key: `"progress": "{percent}% completato"`
- [ ] **27.13** Add key: `"retry": "Riprova"`
- [ ] **27.14** Validate JSON syntax
- [ ] **27.15** Save file

---

## Task 28: Verify TypeScript Compilation

**Context**: Ensure all TypeScript code compiles without errors.

**Files to modify**:
- None (verification only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **28.1** Run `npm run typecheck` from project root
- [ ] **28.2** Verify no TypeScript errors in StatusCard.tsx
- [ ] **28.3** Verify no TypeScript errors in TranslationStatusWidget.tsx
- [ ] **28.4** Verify no errors in barrel export files
- [ ] **28.5** Check that all imported types resolve correctly
- [ ] **28.6** Verify useTranslationStatus hook import works (REQ-E05-011 dependency)
- [ ] **28.7** Verify TranslationProgressBar import works (REQ-E05-009 dependency)
- [ ] **28.8** Test IDE autocomplete for component props

---

## Task 29: Manual Testing - Widget Rendering in Dashboard

**Context**: Test widget integration in actual dashboard context.

**Files to modify**:
- Create temporary test page or add to SimpleDashboard for testing

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **29.1** Import TranslationStatusWidget in a dashboard page or test page
- [ ] **29.2** Render widget with no props (all defaults)
- [ ] **29.3** Start dev server: `npm run dev`
- [ ] **29.4** Navigate to page with widget
- [ ] **29.5** Verify widget renders with correct structure
- [ ] **29.6** Check that header displays with gradient background
- [ ] **29.7** Verify progress bar shows with calculated percentage
- [ ] **29.8** Confirm all four status cards render
- [ ] **29.9** Check that View Details link appears
- [ ] **29.10** Verify widget dimensions are appropriate for dashboard

---

## Task 30: Manual Testing - Loading State

**Context**: Verify loading skeleton displays correctly during data fetch.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **30.1** Keep widget rendered in test page
- [ ] **30.2** Artificially slow down API response (add delay in useTranslationStatus or mock)
- [ ] **30.3** Reload page to trigger loading state
- [ ] **30.4** Verify SkeletonBase wrapper renders
- [ ] **30.5** Check skeleton header bar appears with shimmer
- [ ] **30.6** Verify skeleton progress bar displays
- [ ] **30.7** Confirm four skeleton cards render in grid
- [ ] **30.8** Check animate-pulse effect is active
- [ ] **30.9** Verify loading message is accessible to screen readers
- [ ] **30.10** Confirm skeleton layout matches actual widget dimensions

---

## Task 31: Manual Testing - Error State

**Context**: Verify error state displays correctly with retry functionality.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **31.1** Force error state by modifying useTranslationStatus hook or mocking error
- [ ] **31.2** Reload page to trigger error
- [ ] **31.3** Verify error state container renders
- [ ] **31.4** Check XCircle icon displays in red
- [ ] **31.5** Confirm error message displays (translated)
- [ ] **31.6** Verify retry button appears
- [ ] **31.7** Click retry button
- [ ] **31.8** Confirm refetch function is called (check console or network)
- [ ] **31.9** Verify error state maintains widget dimensions
- [ ] **31.10** Check error is announced to screen readers

---

## Task 32: Manual Testing - Empty State

**Context**: Verify empty state displays when no translation data exists.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **32.1** Force empty state by returning null/empty data from useTranslationStatus
- [ ] **32.2** Reload page
- [ ] **32.3** Verify empty state container renders
- [ ] **32.4** Check Languages icon displays in gray
- [ ] **32.5** Confirm empty message displays (translated)
- [ ] **32.6** Verify empty state maintains widget dimensions
- [ ] **32.7** Check message is accessible to screen readers

---

## Task 33: Manual Testing - Compact Mode

**Context**: Verify compact prop reduces widget size appropriately for sidebar use.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **33.1** Render widget with `compact={true}` prop
- [ ] **33.2** Verify header has reduced padding (px-3 py-2)
- [ ] **33.3** Check title text is smaller (text-sm)
- [ ] **33.4** Confirm progress section has reduced padding
- [ ] **33.5** Verify progress bar uses size="sm"
- [ ] **33.6** Check status cards grid uses gap-2 instead of gap-4
- [ ] **33.7** Verify StatusCard renders in compact mode with smaller text
- [ ] **33.8** Confirm overall widget width is appropriate for sidebar
- [ ] **33.9** Test compact mode on mobile devices
- [ ] **33.10** Verify all content remains readable in compact mode

---

## Task 34: Manual Testing - Property Filtering

**Context**: Verify propertyId prop correctly filters translation data.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **34.1** Get valid propertyId from database (check Supabase Studio)
- [ ] **34.2** Render widget with `propertyId` prop set
- [ ] **34.3** Verify useTranslationStatus receives propertyId option
- [ ] **34.4** Check network request includes property filter parameter
- [ ] **34.5** Confirm displayed counts match property-specific data
- [ ] **34.6** Test with different propertyId values
- [ ] **34.7** Verify data updates when propertyId changes
- [ ] **34.8** Test with invalid/nonexistent propertyId (should show empty state)
- [ ] **34.9** Test without propertyId (should show all properties data if user has multiple)

---

## Task 35: Manual Testing - View Details Navigation

**Context**: Verify View Details link/button navigates correctly.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **35.1** Test with default behavior (no onViewAll callback)
- [ ] **35.2** Click View Details link
- [ ] **35.3** Verify navigation to translation management page
- [ ] **35.4** Check URL is correct
- [ ] **35.5** Render widget with `onViewAll` callback prop
- [ ] **35.6** Add console.log in callback
- [ ] **35.7** Click View Details button
- [ ] **35.8** Verify callback is invoked (check console)
- [ ] **35.9** Test with `showViewAllLink={false}`
- [ ] **35.10** Verify link/button does not render
- [ ] **35.11** Confirm header layout adjusts appropriately

---

## Task 36: Manual Testing - Responsive Layout

**Context**: Verify widget adapts correctly across screen sizes.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **36.1** Render widget in standard mode
- [ ] **36.2** Open browser DevTools responsive mode
- [ ] **36.3** Test on mobile size (375px width)
- [ ] **36.4** Verify status cards grid is 2 columns
- [ ] **36.5** Check all content is readable and properly sized
- [ ] **36.6** Test on tablet size (768px width)
- [ ] **36.7** Verify status cards transition to 4 columns at md breakpoint
- [ ] **36.8** Test on desktop size (1024px+ width)
- [ ] **36.9** Confirm layout uses full width appropriately
- [ ] **36.10** Test with very narrow widths (320px)
- [ ] **36.11** Verify compact mode maintains 2-column grid on all sizes
- [ ] **36.12** Check that text doesn't overflow containers at any size

---

## Task 37: Manual Testing - Dark Mode

**Context**: Verify widget styling works correctly in dark mode.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **37.1** Render widget in light mode first
- [ ] **37.2** Toggle system/app to dark mode
- [ ] **37.3** Verify widget background changes to dark (bg-gray-800)
- [ ] **37.4** Check border color uses dark variant (border-gray-700)
- [ ] **37.5** Verify header gradient remains readable
- [ ] **37.6** Check progress bar colors work in dark mode
- [ ] **37.7** Verify StatusCard backgrounds use dark variants
- [ ] **37.8** Confirm text colors use dark mode variants (text-gray-300, etc.)
- [ ] **37.9** Check status icon colors remain visible
- [ ] **37.10** Test color contrast with contrast checker tool
- [ ] **37.11** Verify all contrasts meet WCAG AA standards (4.5:1 for text)
- [ ] **37.12** Adjust colors if needed for better contrast

---

## Task 38: Manual Testing - Internationalization

**Context**: Verify all UI text displays correctly in all supported languages.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **38.1** Test widget in English (default)
- [ ] **38.2** Verify all text displays correctly
- [ ] **38.3** Switch app language to French
- [ ] **38.4** Reload widget and verify French translations
- [ ] **38.5** Switch to Spanish and verify translations
- [ ] **38.6** Switch to German and verify translations
- [ ] **38.7** Switch to Dutch and verify translations
- [ ] **38.8** Switch to Italian and verify translations
- [ ] **38.9** Check that status labels translate correctly
- [ ] **38.10** Verify progress percentage formatting uses correct locale
- [ ] **38.11** Confirm loading, error, and empty messages translate
- [ ] **38.12** Check that text doesn't overflow containers in any language
- [ ] **38.13** Verify View Details text translates in all languages

---

## Task 39: Accessibility Testing - Screen Reader

**Context**: Verify widget provides accessible experience for screen reader users.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **39.1** Enable screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] **39.2** Navigate to widget with keyboard
- [ ] **39.3** Verify widget region is announced with aria-label
- [ ] **39.4** Check that loading state message is announced
- [ ] **39.5** Verify progress bar is announced with current value
- [ ] **39.6** Confirm each status card label and count is announced
- [ ] **39.7** Check that View Details link is announced correctly
- [ ] **39.8** Verify error state message is announced
- [ ] **39.9** Confirm retry button is announced with proper label
- [ ] **39.10** Check that empty state message is announced
- [ ] **39.11** Verify keyboard navigation works (Tab through interactive elements)
- [ ] **39.12** Confirm focus indicators are visible

---

## Task 40: Accessibility Testing - Keyboard Navigation

**Context**: Verify all interactive elements are keyboard accessible.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **40.1** Navigate to widget using only keyboard (no mouse)
- [ ] **40.2** Tab to View Details link/button
- [ ] **40.3** Verify focus indicator is visible
- [ ] **40.4** Press Enter to activate link
- [ ] **40.5** Verify navigation occurs
- [ ] **40.6** Test error state retry button with keyboard
- [ ] **40.7** Tab to retry button and press Enter
- [ ] **40.8** Verify refetch is triggered
- [ ] **40.9** Check that no interactive elements are skipped by Tab
- [ ] **40.10** Verify focus order is logical (top to bottom, left to right)

---

## Task 41: Performance Testing - Re-render Optimization

**Context**: Verify useMemo optimization prevents unnecessary re-renders.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **41.1** Open React DevTools in browser
- [ ] **41.2** Enable "Highlight updates when components render"
- [ ] **41.3** Render widget with translationStatus data
- [ ] **41.4** Trigger parent component re-render without changing data
- [ ] **41.5** Verify widget does not re-render (no highlight)
- [ ] **41.6** Update translationStatus data
- [ ] **41.7** Verify widget re-renders only once
- [ ] **41.8** Check that statusCounts and completionPercentage memoization works
- [ ] **41.9** Verify no performance warnings in console
- [ ] **41.10** Test with React Profiler to measure render time

---

## Task 42: Integration Testing - useTranslationStatus Hook

**Context**: Verify widget correctly integrates with useTranslationStatus hook.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **42.1** Verify widget calls useTranslationStatus with correct options
- [ ] **42.2** Check that scope is set based on propertyId prop
- [ ] **42.3** Confirm propertyId is passed to hook when provided
- [ ] **42.4** Test that isLoading state from hook triggers loading skeleton
- [ ] **42.5** Verify error from hook triggers error state
- [ ] **42.6** Confirm translationStatus data populates widget correctly
- [ ] **42.7** Test that refetch function from hook works on retry
- [ ] **42.8** Verify hook options update when widget props change
- [ ] **42.9** Check that widget re-fetches when propertyId changes

---

## Task 43: Integration Testing - TranslationProgressBar Component

**Context**: Verify widget correctly integrates with TranslationProgressBar component.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **43.1** Verify TranslationProgressBar renders in widget
- [ ] **43.2** Check that percentage prop is passed correctly
- [ ] **43.3** Confirm size prop changes based on compact mode
- [ ] **43.4** Verify progress bar visual matches calculated percentage
- [ ] **43.5** Test with 0% completion
- [ ] **43.6** Test with 100% completion
- [ ] **43.7** Test with partial completion (e.g., 67%)
- [ ] **43.8** Verify progress bar colors match expected scheme
- [ ] **43.9** Check that progress bar is accessible

---

## Task 44: Build Verification

**Context**: Ensure widget builds correctly for production.

**Files to modify**:
- None (verification only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **44.1** Run `npm run build` from project root
- [ ] **44.2** Verify no build errors related to TranslationStatusWidget
- [ ] **44.3** Verify no build errors related to StatusCard
- [ ] **44.4** Check that translation keys are included in build
- [ ] **44.5** Verify all dependencies resolve correctly
- [ ] **44.6** Check build output size is reasonable
- [ ] **44.7** Start production build: `npm start`
- [ ] **44.8** Navigate to widget in production mode
- [ ] **44.9** Verify widget renders correctly in production
- [ ] **44.10** Check that no console errors appear

---

## Task 45: Documentation and Cleanup

**Context**: Finalize implementation with documentation updates.

**Files to modify**:
- `/CLAUDE.md` (if project documentation exists)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **45.1** Open `/CLAUDE.md` or create component documentation
- [ ] **45.2** Add section for TranslationStatusWidget under Translation Management components
- [ ] **45.3** Document component purpose and use cases
- [ ] **45.4** Add code example showing basic usage
- [ ] **45.5** Add code example showing compact mode usage
- [ ] **45.6** Add code example showing property filtering
- [ ] **45.7** Document all props and their default values
- [ ] **45.8** Note dependencies (useTranslationStatus, TranslationProgressBar)
- [ ] **45.9** Add note about translation key requirements
- [ ] **45.10** Update "Last Modified" date in CLAUDE.md
- [ ] **45.11** Remove any temporary test files or console.logs
- [ ] **45.12** Run final lint check: `npm run lint`
- [ ] **45.13** Fix any lint warnings
- [ ] **45.14** Commit changes with message: "[REQ-E05-013] Create TranslationStatusWidget component"
- [ ] **45.15** Update pipeline state or task tracker to mark REQ-E05-013 complete

---

**END OF DETAILED TASK BREAKDOWN**

*Total Estimated Effort: ~10-12 hours*
*Total Tasks: 45*
*Total Subtasks: 412*

---

## Notes

- All subtask checkboxes are intentionally UNCHECKED (- [ ])
- Implementation agent will check off subtasks as completed
- This is a SPECIFICATION document for future work
- Component depends on REQ-E05-011 (useTranslationStatus hook) - CRITICAL DEPENDENCY
- Component depends on REQ-E05-009 (TranslationProgressBar component) - CRITICAL DEPENDENCY
- Widget is designed for dashboard placement but reusable in other contexts
- Compact mode enables sidebar integration
- Status color system should remain consistent across all translation UI
- Partial translations are weighted at 50% for completion calculation
- Consider adding React.memo if performance testing reveals excessive re-renders

---

*Document Last Modified: 2026-01-22 23:05*
