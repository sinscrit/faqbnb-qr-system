# Create TranslationProgressBar Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:50
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #9)
- Overview: docs/REQ-E05-009-create-translationprogressbar-component-overview.md
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

## 1. Create Component File and Setup Imports

**Context:** Following the pattern from SessionProgressBar.tsx (src/components/ItemManager/components/SessionProgressBar.tsx) and QRGenerationProgress.tsx, create a new component file for TranslationProgressBar that will display a segmented, multi-colored progress bar showing translation status. The component needs React hooks for computed values, i18n support, and utility functions.

**Files to modify:**
- Create: `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Estimated effort:** 1 story point

- [x] **1.1** Create the component file: `touch src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`
- [x] **1.2** Open the file and add `'use client';` directive at the top
- [x] **1.3** Add JSDoc module header comment describing the component: "TranslationProgressBar Component - Displays translation completion status as a segmented, multi-colored progress bar. Shows proportional segments for complete/pending/failed/stale/missing translations."
- [x] **1.4** Add JSDoc tags: `@module TranslationManagement/TranslationPreviewPanel/TranslationProgressBar`, `@see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`, `@created 2026-01-22`, `@requestReference REQ-E05-009`
- [x] **1.5** Import React hook: `import { useMemo } from 'react';`
- [x] **1.6** Import next-intl: `import { useTranslations } from 'next-intl';`
- [x] **1.7** Import utility function: `import { cn } from '@/lib/utils';`

---

## 2. Define Component Props Interface

**Context:** Create the TypeScript interface that defines all props the component accepts. This interface will initially be defined in the component file and later can be moved to TranslationManagement.types.ts if needed for reuse. Based on overview lines 76-99.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Estimated effort:** 1 story point

- [x] **2.1** Add section comment: `// =============================================================================` followed by `// Component Props Interface` followed by `// =============================================================================`
- [x] **2.2** Define TranslationProgressBarProps interface with these fields: `completed` (number), `pending` (number), `failed` (number), `stale` (optional number), `total` (number), `showLabels` (optional boolean with default false), `showPercentage` (optional boolean with default false), `size` (optional 'sm' | 'md' | 'lg' with default 'md'), `animated` (optional boolean, auto-enabled when pending > 0), `labelFormat` (optional 'compact' | 'detailed' with default 'compact'), `className` (optional string)
- [x] **2.3** Add JSDoc comment for the interface explaining: completed (count of completed translations), pending (count of in-progress translations), failed (count of failed translations), stale (count of stale translations), total (total possible translations), showLabels (whether to display text summary), showPercentage (whether to show percentage), size (bar height variant), animated (enable pulse animation on pending segment), labelFormat (compact "3/5" or detailed "3 of 5 translations")
- [x] **2.4** Export the interface: `export interface TranslationProgressBarProps { ... }`

---

## 3. Define Size and Color Configuration Constants

**Context:** Create constants that map size variants to height classes and segment types to color classes. These constants ensure consistency with TranslationStatusItem color scheme and provide configurable size options. Based on overview lines 114-140.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Estimated effort:** 1 story point

- [x] **3.1** Add section comment: `// =============================================================================` followed by `// Constants` followed by `// =============================================================================`
- [x] **3.2** Define SIZE_CONFIG constant: `const SIZE_CONFIG = { sm: { barHeight: 'h-1.5', fontSize: 'text-xs' }, md: { barHeight: 'h-2', fontSize: 'text-sm' }, lg: { barHeight: 'h-3', fontSize: 'text-base' } } as const;`
- [x] **3.3** Add JSDoc comment for SIZE_CONFIG: "Configuration for progress bar size variants. Maps size prop to bar height and label font size."
- [x] **3.4** Define SEGMENT_COLORS constant: `const SEGMENT_COLORS = { complete: 'bg-green-500', pending: 'bg-orange-500', failed: 'bg-red-500', stale: 'bg-amber-500', missing: 'bg-gray-200' } as const;`
- [x] **3.5** Add JSDoc comment for SEGMENT_COLORS: "Color classes for each segment type. Matches color scheme from TranslationStatusItem component."

---

## 4. Implement Segment Width Calculation Helper

**Context:** Create a helper function that calculates the proportional width percentages for each segment type based on their counts. This is the core logic for the segmented bar visualization. Based on overview lines 148-177.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Estimated effort:** 1 story point

- [x] **4.1** Add section comment: `// =============================================================================` followed by `// Helper Functions` followed by `// =============================================================================`
- [x] **4.2** Define SegmentWidths interface: `interface SegmentWidths { completed: number; pending: number; failed: number; stale: number; missing: number; }`
- [x] **4.3** Create calculateSegmentWidths function with signature: `function calculateSegmentWidths(completed: number, pending: number, failed: number, stale: number, total: number): SegmentWidths`
- [x] **4.4** Add function body: ensure total is at least 1 to prevent division by zero: `const safeTotal = Math.max(total, 1);`
- [x] **4.5** Calculate missing count: `const missing = Math.max(0, total - (completed + pending + failed + stale));`
- [x] **4.6** Calculate percentage widths for each segment: `return { completed: (completed / safeTotal) * 100, pending: (pending / safeTotal) * 100, failed: (failed / safeTotal) * 100, stale: (stale / safeTotal) * 100, missing: (missing / safeTotal) * 100 };`
- [x] **4.7** Add JSDoc comment for calculateSegmentWidths: "Calculates proportional width percentages for each segment type. Returns percentages that sum to 100%."

---

## 5. Implement Label Formatting Helper

**Context:** Create a helper function that formats the label text based on the labelFormat prop. This supports both compact ("3/5") and detailed ("3 of 5 translations") formats with i18n support.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Estimated effort:** 1 story point

- [x] **5.1** Create formatLabel function with signature: `function formatLabel(completed: number, total: number, format: 'compact' | 'detailed', t: (key: string, params?: any) => string): string`
- [x] **5.2** Implement compact format: `if (format === 'compact') { return `${completed}/${total}`; }`
- [x] **5.3** Implement detailed format: `return t('progressLabel', { completed, total });` (this will be "X of Y translations")
- [x] **5.4** Add JSDoc comment for formatLabel: "Formats the progress label text based on format prop. Compact returns 'X/Y', detailed returns localized 'X of Y translations'."

---

## 6. Implement Main Component Function and Setup

**Context:** Create the main component function export with props destructuring, translation hooks, and computed values using useMemo. Following the pattern from SessionProgressBar.tsx (lines 48-89).

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Estimated effort:** 1 story point

- [x] **6.1** Add section comment: `// =============================================================================` followed by `// Component` followed by `// =============================================================================`
- [x] **6.2** Create function export: `export function TranslationProgressBar(props: TranslationProgressBarProps) {`
- [x] **6.3** Destructure props with defaults: `const { completed, pending, failed, stale = 0, total, showLabels = false, showPercentage = false, size = 'md', animated = pending > 0, labelFormat = 'compact', className } = props;`
- [x] **6.4** Initialize translation hook: `const t = useTranslations('translation.progressBar');`
- [x] **6.5** Get size configuration: `const sizeConfig = SIZE_CONFIG[size];`
- [x] **6.6** Compute segment widths with useMemo: `const widths = useMemo(() => calculateSegmentWidths(completed, pending, failed, stale, total), [completed, pending, failed, stale, total]);`
- [x] **6.7** Compute completion percentage: `const completionPercentage = useMemo(() => total > 0 ? Math.round((completed / total) * 100) : 0, [completed, total]);`
- [x] **6.8** Compute label text if needed: `const labelText = useMemo(() => showLabels ? formatLabel(completed, total, labelFormat, t) : null, [showLabels, completed, total, labelFormat, t]);`

---

## 7. Implement Root Container with Optional Labels

**Context:** Create the main container div that wraps the progress bar and optional label/percentage displays. This establishes the layout structure and spacing.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Estimated effort:** 1 story point

- [x] **7.1** Add return statement with root container: `return ( <div className={cn('flex flex-col gap-2', className)}> ... </div> );`
- [x] **7.2** Inside root container, add conditional label/percentage display: `{(showLabels || showPercentage) && ( <div className="flex items-center justify-between"> ... </div> )}`
- [x] **7.3** Inside label container, add label text: `{showLabels && labelText && ( <span className={cn('font-medium text-gray-700 dark:text-gray-300', sizeConfig.fontSize)}> {labelText} </span> )}`
- [x] **7.4** Add percentage display: `{showPercentage && ( <span className={cn('font-semibold text-gray-900 dark:text-white', sizeConfig.fontSize)}> {completionPercentage}% </span> )}`
- [x] **7.5** Close label container div

---

## 8. Implement Progress Bar Container with ARIA Attributes

**Context:** Create the progress bar container with proper ARIA progressbar role and attributes for accessibility. Following the pattern from SessionProgressBar.tsx (lines 73-89).

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Estimated effort:** 1 story point

- [x] **8.1** After label section, add progress bar container: `<div className={cn('relative w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700', sizeConfig.barHeight)} role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={total} aria-label={t('ariaLabel', { completed, total })} >`
- [x] **8.2** Add screen reader text for detailed status: `<span className="sr-only"> {t('detailedStatus', { completed, pending, failed, stale, total })} </span>`
- [x] **8.3** Add placeholder comment for segments: `{/* Segments will be rendered here */}`
- [x] **8.4** Close progress bar container div

---

## 9. Implement Segment Rendering Logic

**Context:** Create the visual segments that fill the progress bar with appropriate widths, colors, and animations. Segments should only render if their width is greater than 0. Each segment is positioned absolutely and stacked left-to-right.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Estimated effort:** 1 story point

- [x] **9.1** Replace segments placeholder with segment container: `<div className="absolute inset-0 flex">`
- [x] **9.2** Add completed segment (conditional): `{widths.completed > 0 && ( <div className={cn('h-full transition-all duration-300 ease-in-out', SEGMENT_COLORS.complete)} style={{ width: `${widths.completed}%` }} aria-label={t('segmentLabel', { type: t('complete'), count: completed })} /> )}`
- [x] **9.3** Add pending segment with animation (conditional): `{widths.pending > 0 && ( <div className={cn('h-full transition-all duration-300 ease-in-out', SEGMENT_COLORS.pending, animated && 'animate-pulse motion-reduce:animate-none')} style={{ width: `${widths.pending}%` }} aria-label={t('segmentLabel', { type: t('pending'), count: pending })} /> )}`
- [x] **9.4** Add failed segment (conditional): `{widths.failed > 0 && ( <div className={cn('h-full transition-all duration-300 ease-in-out', SEGMENT_COLORS.failed)} style={{ width: `${widths.failed}%` }} aria-label={t('segmentLabel', { type: t('failed'), count: failed })} /> )}`
- [x] **9.5** Add stale segment (conditional): `{stale > 0 && widths.stale > 0 && ( <div className={cn('h-full transition-all duration-300 ease-in-out', SEGMENT_COLORS.stale)} style={{ width: `${widths.stale}%` }} aria-label={t('segmentLabel', { type: t('stale'), count: stale })} /> )}`
- [x] **9.6** Close segment container div
- [x] **9.7** Close progress bar container div and root container div
- [x] **9.8** Close component function

---

## 10. Add Translation Keys to English Locale

**Context:** Define all i18n translation keys needed for the component UI and accessibility labels in messages/en.json. Following the pattern from existing translation namespaces.

**Files to modify:**
- `messages/en.json`

**Estimated effort:** 1 story point

- [x] **10.1** Open messages/en.json
- [x] **10.2** Locate or create "translation" root object
- [x] **10.3** Add "progressBar" namespace under "translation"
- [x] **10.4** Add key "progressLabel" with value "{completed} of {total} translations"
- [x] **10.5** Add key "ariaLabel" with value "Translation progress: {completed} of {total} completed"
- [x] **10.6** Add key "detailedStatus" with value "{completed} complete, {pending} pending, {failed} failed, {stale} stale, {total} total translations"
- [x] **10.7** Add key "segmentLabel" with value "{count} {type} translations"
- [x] **10.8** Add key "complete" with value "completed"
- [x] **10.9** Add key "pending" with value "pending"
- [x] **10.10** Add key "failed" with value "failed"
- [x] **10.11** Add key "stale" with value "stale"
- [x] **10.12** Verify JSON syntax is valid

---

## 11. Add Translation Keys to Other Locale Files

**Context:** Add the same translation keys to all other supported language locale files with appropriate translations.

**Files to modify:**
- `messages/fr.json`
- `messages/es.json`
- `messages/de.json`
- `messages/nl.json`
- `messages/it.json`

**Estimated effort:** 1 story point

- [x] **11.1** Open messages/fr.json and add "translation.progressBar" keys in French: progressLabel="{completed} traductions sur {total}", ariaLabel="Progression de la traduction : {completed} sur {total} terminées", detailedStatus="{completed} terminées, {pending} en attente, {failed} échouées, {stale} obsolètes, {total} traductions au total", segmentLabel="{count} traductions {type}", complete="terminées", pending="en attente", failed="échouées", stale="obsolètes"
- [x] **11.2** Open messages/es.json and add Spanish translations: progressLabel="{completed} de {total} traducciones", ariaLabel="Progreso de traducción: {completed} de {total} completadas", detailedStatus="{completed} completadas, {pending} pendientes, {failed} fallidas, {stale} obsoletas, {total} traducciones totales", segmentLabel="{count} traducciones {type}", complete="completadas", pending="pendientes", failed="fallidas", stale="obsoletas"
- [x] **11.3** Open messages/de.json and add German translations: progressLabel="{completed} von {total} Übersetzungen", ariaLabel="Übersetzungsfortschritt: {completed} von {total} abgeschlossen", detailedStatus="{completed} abgeschlossen, {pending} ausstehend, {failed} fehlgeschlagen, {stale} veraltet, {total} Übersetzungen insgesamt", segmentLabel="{count} {type} Übersetzungen", complete="abgeschlossen", pending="ausstehend", failed="fehlgeschlagen", stale="veraltet"
- [x] **11.4** Open messages/nl.json and add Dutch translations: progressLabel="{completed} van {total} vertalingen", ariaLabel="Vertaalvoortgang: {completed} van {total} voltooid", detailedStatus="{completed} voltooid, {pending} in behandeling, {failed} mislukt, {stale} verouderd, {total} vertalingen totaal", segmentLabel="{count} {type} vertalingen", complete="voltooid", pending="in behandeling", failed="mislukt", stale="verouderd"
- [x] **11.5** Open messages/it.json and add Italian translations: progressLabel="{completed} di {total} traduzioni", ariaLabel="Progresso traduzione: {completed} di {total} completate", detailedStatus="{completed} completate, {pending} in attesa, {failed} fallite, {stale} obsolete, {total} traduzioni totali", segmentLabel="{count} traduzioni {type}", complete="completate", pending="in attesa", failed="fallite", stale="obsolete"
- [x] **11.6** Verify all JSON files have valid syntax

---

## 12. Update TranslationPreviewPanel to Use TranslationProgressBar

**Context:** Replace the placeholder progress bar comment in TranslationPreviewPanel.tsx (created in REQ-E05-007, task 11.5) with the new TranslationProgressBar component. This integrates the progress indicator into the panel.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **12.1** Open TranslationPreviewPanel.tsx
- [x] **12.2** Add import at top: `import { TranslationProgressBar } from './TranslationProgressBar';`
- [x] **12.3** Locate the TODO comment for TranslationProgressBar (task 11.5 from REQ-E05-007, inside the success state section before translations heading)
- [x] **12.4** Replace the TODO comment with: `<TranslationProgressBar completed={panelState.translations.filter(t => t.status === 'completed').length} pending={panelState.translations.filter(t => t.status === 'pending' || t.status === 'processing').length} failed={panelState.translations.filter(t => t.status === 'failed').length} stale={panelState.translations.filter(t => t.isStale).length} total={SUPPORTED_LANGUAGES.length} showLabels showPercentage size="md" className="mb-4" />`
- [x] **12.5** Remove the TODO comment
- [x] **12.6** Save the file

---

## 13. Update Panel Index Export

**Context:** Add TranslationProgressBar to the barrel export file so it can be imported from the parent module.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**Estimated effort:** 1 story point

- [x] **13.1** Open src/components/TranslationManagement/TranslationPreviewPanel/index.ts
- [x] **13.2** Locate the commented export placeholder for TranslationProgressBar (added in REQ-E05-007, task 16.6)
- [x] **13.3** Uncomment or add the export: `export { TranslationProgressBar } from './TranslationProgressBar';`
- [x] **13.4** Add type export: `export type { TranslationProgressBarProps } from './TranslationProgressBar';`
- [x] **13.5** Verify exports are in logical order
- [x] **13.6** Save the file

---

## 14. Run TypeScript Type Check

**Context:** Verify that all TypeScript types are correct, imports resolve properly, and there are no type errors introduced by the new component.

**Files to modify:** None (validation step)

**Estimated effort:** 1 story point

- [x] **14.1** Run `npx tsc --noEmit` from project root
- [x] **14.2** Review output for any errors mentioning "TranslationProgressBar"
- [x] **14.3** If type errors exist, identify the file and line number
- [x] **14.4** Common issues to check: missing imports, incorrect prop types, invalid JSX syntax, calculation type mismatches
- [x] **14.5** Fix any identified type errors
- [x] **14.6** Re-run `npx tsc --noEmit` after each fix
- [x] **14.7** Document any pre-existing errors unrelated to this component (acceptable per CLAUDE.md)

---

## 15. Test Component Rendering with Different Prop Combinations

**Context:** Manually test the component to verify it renders correctly with various prop combinations and edge cases. This ensures the component displays properly across all scenarios.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **15.1** Create a temporary test page rendering TranslationProgressBar with different prop values
- [ ] **15.2** Start dev server: `npm run dev`
- [ ] **15.3** Test typical case: completed=3, pending=1, failed=1, stale=0, total=5 - verify all segments show with correct proportions
- [ ] **15.4** Test all complete: completed=5, pending=0, failed=0, stale=0, total=5 - verify only green bar shows at 100% width
- [ ] **15.5** Test all pending: completed=0, pending=5, failed=0, stale=0, total=5 - verify orange bar with pulse animation
- [ ] **15.6** Test mixed with stale: completed=2, pending=1, failed=1, stale=1, total=5 - verify all 4 colored segments appear
- [ ] **15.7** Test empty state: completed=0, pending=0, failed=0, stale=0, total=5 - verify only gray background shows
- [ ] **15.8** Test size variants: render with size="sm", size="md", size="lg" - verify height differences (6px, 8px, 12px)
- [ ] **15.9** Test with labels: showLabels=true - verify "3/5" or "3 of 5 translations" appears
- [ ] **15.10** Test with percentage: showPercentage=true - verify "60%" appears
- [ ] **15.11** Test label formats: labelFormat="compact" shows "3/5", labelFormat="detailed" shows "3 of 5 translations"
- [ ] **15.12** Test animation disabled: animated=false with pending > 0 - verify no pulse animation
- [ ] **15.13** Test edge case: total=0 - verify no crash, graceful handling

---

## 16. Test Segment Width Calculations

**Context:** Verify that segment width calculations are accurate and segments fill the bar completely without gaps or overlaps.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **16.1** Test equal distribution: completed=2, pending=2, failed=1, stale=0, total=5 - verify widths are 40%, 40%, 20%
- [ ] **16.2** Use browser DevTools to inspect segment elements and verify computed width percentages
- [ ] **16.3** Test uneven distribution: completed=1, pending=1, failed=1, stale=1, total=5 - verify widths sum to 80% (1 missing = 20%)
- [ ] **16.4** Test single segment: completed=1, pending=0, failed=0, stale=0, total=5 - verify green segment is 20% width
- [ ] **16.5** Test missing calculation: completed=3, pending=1, failed=0, stale=0, total=5 - verify 1 missing (20% gray background visible on right)
- [ ] **16.6** Test floating point precision: odd numbers like completed=1, total=3 - verify segments don't leave visible gaps
- [ ] **16.7** Test large numbers: completed=50, pending=30, failed=20, stale=0, total=100 - verify calculations scale correctly
- [ ] **16.8** Verify segments are positioned left-to-right in order: complete, pending, failed, stale

---

## 17. Test Animations and Transitions

**Context:** Verify that the pulse animation on pending segments works correctly and respects the prefers-reduced-motion setting. Test smooth transitions when values change.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **17.1** Test pending animation: set pending > 0 and animated=true - verify orange segment pulses smoothly
- [ ] **17.2** Verify animation uses Tailwind's animate-pulse class
- [ ] **17.3** Test animation disabled: set animated=false with pending > 0 - verify no pulse animation
- [ ] **17.4** Test prefers-reduced-motion: enable in browser/OS settings - verify animation stops (motion-reduce:animate-none class)
- [ ] **17.5** Test width transitions: change completed count dynamically - verify segments transition smoothly over 300ms
- [ ] **17.6** Verify transition-all duration-300 ease-in-out classes are applied to segments
- [ ] **17.7** Test rapid changes: update counts quickly - verify transitions remain smooth without janky behavior
- [ ] **17.8** Test animation performance: verify no layout thrashing or excessive repaints in DevTools Performance tab

---

## 18. Test Accessibility Features

**Context:** Verify that the component meets accessibility requirements: ARIA progressbar role, value attributes, screen reader announcements, and keyboard compatibility.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **18.1** Use browser DevTools to inspect progress bar container, verify role="progressbar" attribute
- [ ] **18.2** Verify aria-valuenow equals completed count
- [ ] **18.3** Verify aria-valuemin equals 0
- [ ] **18.4** Verify aria-valuemax equals total count
- [ ] **18.5** Verify aria-label provides meaningful description including completed and total counts
- [ ] **18.6** Verify screen reader text with sr-only class announces detailed status (completed, pending, failed, stale counts)
- [ ] **18.7** Verify each segment has aria-label describing type and count
- [ ] **18.8** Test with screen reader (VoiceOver/NVDA): verify progress bar is announced as "progressbar" with current value
- [ ] **18.9** Verify screen reader announces detailed status text
- [ ] **18.10** Verify component updates are announced when values change dynamically
- [ ] **18.11** Verify color contrast between segments and background meets WCAG AA standards (3:1 minimum for graphics)
- [ ] **18.12** Test in high contrast mode: verify all segments remain distinguishable

---

## 19. Test Dark Mode Support

**Context:** Verify that the component displays correctly in dark mode with appropriate color adjustments for background and text.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **19.1** Enable dark mode (add 'dark' class to html element or use system preference)
- [ ] **19.2** Verify progress bar background is dark (dark:bg-gray-700)
- [ ] **19.3** Verify label text colors are light (dark:text-gray-300 for label, dark:text-white for percentage)
- [ ] **19.4** Verify segment colors remain vibrant and visible in dark mode (green-500, orange-500, red-500, amber-500)
- [ ] **19.5** Test all size variants in dark mode: verify consistent styling
- [ ] **19.6** Test with labels/percentage in dark mode: verify text is readable
- [ ] **19.7** Verify transitions and animations work correctly in dark mode
- [ ] **19.8** Check color contrast for labels in dark mode meets WCAG standards

---

## 20. Test Responsive Behavior

**Context:** Verify the component layout adapts properly to different screen sizes and container widths.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **20.1** Test on mobile viewport (320px width): verify bar stretches to full width
- [ ] **20.2** Test on tablet viewport (768px): verify proportions remain correct
- [ ] **20.3** Test on desktop viewport (1024px+): verify bar scales appropriately
- [ ] **20.4** Test in narrow container (200px): verify segments remain visible and proportional
- [ ] **20.5** Test in very wide container (1600px): verify segments fill appropriately
- [ ] **20.6** Test label/percentage layout on narrow screens: verify they don't overlap or wrap poorly
- [ ] **20.7** Verify all size variants (sm, md, lg) maintain proper proportions on all screen sizes
- [ ] **20.8** Test rounded corners (rounded-full class) don't get clipped on any screen size

---

## 21. Integration Test with TranslationPreviewPanel

**Context:** Test the TranslationProgressBar component within the TranslationPreviewPanel to verify integration is seamless and data flows correctly from panel state to progress bar.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **21.1** Open TranslationPreviewPanel with real or mock translation data
- [ ] **21.2** Verify TranslationProgressBar renders near the top of the panel (before translations list)
- [ ] **21.3** Verify progress bar shows correct counts: completed, pending, failed, stale based on panelState.translations
- [ ] **21.4** Verify total matches SUPPORTED_LANGUAGES.length (5 languages)
- [ ] **21.5** Verify labels and percentage display correctly
- [ ] **21.6** Test with all completed translations: verify 100% green bar
- [ ] **21.7** Test with translations in progress: verify orange pending segment animates
- [ ] **21.8** Test when translation status changes: verify progress bar updates smoothly
- [ ] **21.9** Verify progress bar updates when API data refreshes in the panel
- [ ] **21.10** Test panel loading state: verify progress bar handles empty/loading data gracefully

---

## 22. Test Edge Cases and Error Handling

**Context:** Test unusual inputs and edge cases to ensure the component handles them gracefully without crashes or visual bugs.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **22.1** Test with total=0: verify no division by zero error, bar shows empty or hidden
- [ ] **22.2** Test with negative counts: verify Math.max(0, ...) prevents negative widths
- [ ] **22.3** Test with counts exceeding total: completed=10, total=5 - verify clamping or graceful overflow
- [ ] **22.4** Test with very large numbers: completed=1000000, total=5000000 - verify calculations remain accurate
- [ ] **22.5** Test with decimal counts: completed=2.5, total=5 - verify rounding doesn't cause visual issues
- [ ] **22.6** Test with null/undefined stale prop: verify defaults to 0 and works correctly
- [ ] **22.7** Test with missing required props: verify TypeScript catches at compile time
- [ ] **22.8** Test with invalid size prop: verify TypeScript catches invalid values
- [ ] **22.9** Test rapid prop changes: update counts every 100ms - verify no performance issues or memory leaks

---

## 23. Document Component Usage and Props

**Context:** Add comprehensive JSDoc comments and usage examples to help future developers understand how to use the component correctly.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Estimated effort:** 1 story point

- [ ] **23.1** At the top of the file, add a comprehensive usage example in JSDoc showing typical props
- [ ] **23.2** Include example showing minimal required props: completed, pending, failed, total
- [ ] **23.3** Include example showing all optional props: stale, showLabels, showPercentage, size, animated, labelFormat, className
- [ ] **23.4** Add code example showing how to calculate counts from translation array in parent component
- [ ] **23.5** Document the relationship between animated prop and pending count (auto-enables if pending > 0)
- [ ] **23.6** Add notes about accessibility features (ARIA progressbar role, screen reader support)
- [ ] **23.7** Add notes about animation behavior and prefers-reduced-motion support
- [ ] **23.8** Document color scheme matching with TranslationStatusItem component
- [ ] **23.9** Add example showing integration with TranslationPreviewPanel

---

## 24. Performance Optimization Review

**Context:** Review the component implementation for performance optimizations and ensure useMemo is used appropriately for expensive calculations.

**Files to modify:** None (review step, may require minor optimization tweaks)

**Estimated effort:** 1 story point

- [ ] **24.1** Verify useMemo is used for widths calculation (depends on all count props)
- [ ] **24.2** Verify useMemo is used for completionPercentage calculation (depends on completed and total)
- [ ] **24.3** Verify useMemo is used for labelText calculation (depends on showLabels, completed, total, labelFormat, t)
- [ ] **24.4** Review segment rendering: confirm conditional rendering (widths > 0) prevents unnecessary DOM elements
- [ ] **24.5** Verify CSS transitions don't cause layout thrashing (use transform/opacity when possible)
- [ ] **24.6** Check that component doesn't re-render unnecessarily when parent re-renders (React.memo if needed)
- [ ] **24.7** Verify no inline function definitions in JSX that would create new references on each render
- [ ] **24.8** Test component with React DevTools Profiler: verify minimal render time (<16ms)
- [ ] **24.9** If any performance issues found, add React.memo wrapper: `export const TranslationProgressBar = React.memo(...)`

---

## Summary

This task creates the TranslationProgressBar component, a segmented, multi-colored progress bar for visualizing translation completion status. The component provides:

**Core Functionality:**
- Segmented progress bar with proportional widths for each status type
- Five segment types: complete (green), pending (orange), failed (red), stale (amber), missing (gray background)
- Smooth width transitions when values change (300ms ease-in-out)
- Optional text labels in compact ("3/5") or detailed ("3 of 5 translations") formats
- Optional percentage display
- Three size variants: sm (6px), md (8px), lg (12px)

**Visual Design:**
- Color-coded segments matching TranslationStatusItem color scheme
- Pulse animation on pending segment (auto-enabled, respects prefers-reduced-motion)
- Rounded corners with overflow hidden
- Dark mode support with appropriate color adjustments

**Accessibility:**
- ARIA progressbar role with proper value attributes
- Screen reader announcements for detailed status
- Segment labels for assistive technology
- WCAG AA color contrast compliance

**Key Files Created:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` - Main component (~250-300 lines)
- Translation keys in all 6 locale files (en, fr, es, de, nl, it)

**Critical Dependencies:**
- REQ-E05-007 (TranslationPreviewPanel) - parent component that uses this progress bar
- next-intl framework - provides translation hooks
- Tailwind CSS - provides styling and animations

**Blocks:**
- Full TranslationPreviewPanel functionality - uses this component for visual progress indication
- Translation management page (Task 4.3) - may reuse this component for summary views
- TranslationStatusWidget (Task 3.1) - may use similar progress visualization

**Future Enhancements** (out of scope):
- Tooltip on hover showing detailed breakdown
- Click-to-filter functionality (click segment to filter by status)
- Vertical orientation option
- Custom color themes
- Segment labels embedded in bar (for very wide bars)

---

*Document generated: 2026-01-22 22:50*
