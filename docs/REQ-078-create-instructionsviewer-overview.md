# REQ-078: Create InstructionsViewer Component - Technical Overview

**Document Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Request Reference:** REQ-078 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 4 - Item Preview/Detail
**Task ID:** 4.5
**Estimated Effort:** 1 story point (S)

---

## Summary

Create the `InstructionsViewer` component to render markdown-formatted instruction content in a readable, scrollable interface within the ItemPreviewModal. This component provides a read-only view of item instructions, supporting headings, lists, emphasis, links, and other markdown formatting.

The component leverages the existing `react-markdown` dependency (v9.1.0) already used by `MarkdownEditor` and `ReviewStep` components, ensuring consistency across the codebase and avoiding additional bundle size.

---

## Technical Context

### Existing Stack

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 15.5.9 | With Turbopack |
| React | 19.1.0 | |
| TypeScript | 5.x | Strict mode enabled |
| Tailwind CSS | 4.x | Utility-first styling |
| react-markdown | 9.1.0 | **Already installed** - XSS-safe markdown rendering |
| Lucide React | 0.525.0 | Icon library |

### Existing Patterns to Follow

| Pattern | Source File | Notes |
|---------|-------------|-------|
| Markdown rendering with styling | `src/components/ItemCapture/editors/MarkdownEditor.tsx` | Uses ReactMarkdown with prose classes |
| Lazy-loaded ReactMarkdown | `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Dynamic import with SSR disabled |
| Instructions preview | `src/components/ItemCapture/components/steps/ReviewStep.tsx:541-556` | Simple prose wrapper for markdown |
| Utility function | `src/lib/utils.ts` | `cn()` for class merging |
| Type definitions | `src/components/ItemCapture/ItemCapture.types.ts` | Comprehensive interface patterns |

### Target Architecture (from Implementation Plan)

```
src/components/ItemManager/
├── components/
│   ├── ItemPreview/
│   │   ├── ItemPreviewModal.tsx    (Task 4.1 - prerequisite)
│   │   ├── MediaGallery.tsx        (Task 4.2)
│   │   └── InstructionsViewer.tsx  <-- THIS TASK
```

### Existing react-markdown Usage Reference

From `MarkdownEditor.tsx` (lines 419-441):
```tsx
<div
  className={cn(
    'flex-1 p-4 bg-gray-50 rounded-lg overflow-auto',
    'prose prose-sm max-w-none',
    'prose-headings:text-gray-800',
    'prose-p:text-gray-600',
    'prose-a:text-blue-600 prose-a:underline',
    'prose-strong:text-gray-800',
    'prose-ul:text-gray-600',
    'prose-ol:text-gray-600',
    'prose-code:text-gray-800 prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded'
  )}
>
  {value ? (
    <ReactMarkdown>{value}</ReactMarkdown>
  ) : (
    <p className="text-gray-400 italic">Empty placeholder text...</p>
  )}
</div>
```

---

## Dependencies

### Phase Dependencies
- **Requires:** Task 4.1 (ItemPreviewModal) - provides the container for InstructionsViewer
- **Parallel with:** Tasks 4.3 (video playback), 4.4 (photo/PDF viewer)
- **Blocks:** Task 4.6 (Preview Actions) - which integrates all preview components

### Task Dependencies
```
4.1 ItemPreviewModal Component (prerequisite)
         │
    ┌────┴────────────────┐
    ▼                     ▼
4.2 MediaGallery     4.5 InstructionsViewer  <-- THIS TASK
    │                     │
    └─────────┬───────────┘
              ▼
4.6 Preview Actions (integration)
```

---

## Implementation Requirements

### Core Functionality

1. **Markdown Rendering**
   - Render markdown content using `react-markdown`
   - Support common markdown elements: headings, paragraphs, bold, italic, lists (ordered/unordered), links, code blocks
   - Consistent typography using Tailwind CSS prose classes

2. **Scrollable Container**
   - Scrollable text area when content exceeds visible height
   - Smooth scrolling behavior
   - Maximum height constraint to prevent overflow outside modal
   - Visible scrollbar when content is scrollable

3. **Empty State**
   - Graceful handling when no instructions are provided
   - Display appropriate empty state message
   - Consistent styling with other empty states in the app

4. **Responsive Layout**
   - Adapts to available width within modal container
   - Appropriate text sizing for mobile and desktop
   - Touch-friendly scrolling on mobile devices

### Props Interface

```typescript
// src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx

interface InstructionsViewerProps {
  /** Markdown-formatted instructions content */
  instructions: string;

  /** Maximum height for scrollable area (CSS value, e.g., '400px', '50vh') */
  maxHeight?: string;

  /** Minimum height for the container */
  minHeight?: string;

  /** Optional CSS class for customization */
  className?: string;

  /** Optional accessible label */
  ariaLabel?: string;

  /** Show section header (default: false) */
  showHeader?: boolean;

  /** Header text when showHeader is true */
  headerText?: string;
}
```

### Visual Specifications

**Container**
- Background: `bg-gray-50` or `bg-white` depending on context
- Border radius: `rounded-lg`
- Padding: `p-4`
- Overflow: `overflow-y-auto`
- Default max-height: `400px` (configurable via prop)

**Typography (Prose Classes)**
- Headings: `prose-headings:text-gray-800 prose-headings:font-semibold`
- Paragraphs: `prose-p:text-gray-600 prose-p:leading-relaxed`
- Links: `prose-a:text-blue-600 prose-a:underline prose-a:hover:text-blue-700`
- Bold: `prose-strong:text-gray-800`
- Lists: `prose-ul:text-gray-600 prose-ol:text-gray-600`
- Code: `prose-code:text-gray-800 prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded prose-code:text-sm`

**Empty State**
- Text: `text-gray-400 italic`
- Message: "No instructions provided."

---

## Implementation Approach

### Recommended Approach: Lazy-Loaded Component

Follow the pattern from `ReviewStep.tsx` for optimal bundle performance:

```tsx
'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

// Lazy load ReactMarkdown to reduce initial bundle
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-20 bg-gray-100 rounded" />,
});

interface InstructionsViewerProps {
  instructions: string;
  maxHeight?: string;
  minHeight?: string;
  className?: string;
  ariaLabel?: string;
  showHeader?: boolean;
  headerText?: string;
}

export function InstructionsViewer({
  instructions,
  maxHeight = '400px',
  minHeight = '100px',
  className,
  ariaLabel = 'Item instructions',
  showHeader = false,
  headerText = 'Instructions',
}: InstructionsViewerProps) {
  const hasContent = instructions?.trim().length > 0;

  return (
    <section
      className={cn('flex flex-col', className)}
      aria-label={ariaLabel}
    >
      {showHeader && (
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-gray-500" aria-hidden="true" />
          <h4 className="text-sm font-medium text-gray-700">{headerText}</h4>
        </div>
      )}

      <div
        className={cn(
          'bg-gray-50 rounded-lg p-4 overflow-y-auto',
          'prose prose-sm max-w-none',
          'prose-headings:text-gray-800 prose-headings:font-semibold',
          'prose-p:text-gray-600 prose-p:leading-relaxed',
          'prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700',
          'prose-strong:text-gray-800',
          'prose-ul:text-gray-600 prose-ol:text-gray-600',
          'prose-code:text-gray-800 prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded prose-code:text-sm'
        )}
        style={{ maxHeight, minHeight }}
      >
        {hasContent ? (
          <ReactMarkdown>{instructions}</ReactMarkdown>
        ) : (
          <p className="text-gray-400 italic">No instructions provided.</p>
        )}
      </div>
    </section>
  );
}

export default InstructionsViewer;
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx` | Main InstructionsViewer component |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/ItemPreview/index.ts` | Add export for InstructionsViewer |
| `src/components/ItemManager/index.ts` | Re-export InstructionsViewer if needed for external use |
| `src/components/ItemManager/ItemManager.types.ts` | Add `InstructionsViewerProps` interface (optional - can be inline) |

### Functions/Components to Create

| Name | Location | Purpose |
|------|----------|---------|
| `InstructionsViewer` | `ItemPreview/InstructionsViewer.tsx` | Main component for rendering markdown instructions |

### Barrel Export Update

```typescript
// src/components/ItemManager/components/ItemPreview/index.ts
export { ItemPreviewModal } from './ItemPreviewModal';
export { MediaGallery } from './MediaGallery';
export { InstructionsViewer } from './InstructionsViewer';  // ADD THIS
```

---

## Acceptance Criteria

From REQ-078:

- [ ] Instructions are rendered with markdown formatting preserved (headings, bold, italic, lists, etc.)
- [ ] Content area is scrollable when instructions exceed the visible area
- [ ] The viewer integrates seamlessly within the item preview/detail interface
- [ ] Long instruction content does not break the layout or become unreadable
- [ ] The component uses the existing markdown rendering dependency already present in the project

### Additional Technical Criteria

- [ ] Component uses TypeScript with strict types
- [ ] Component follows `'use client'` directive pattern
- [ ] Styling uses Tailwind CSS with `cn()` utility
- [ ] ReactMarkdown is dynamically imported (lazy-loaded) for bundle optimization
- [ ] Empty state is handled gracefully with appropriate message
- [ ] Component has appropriate ARIA labeling for accessibility
- [ ] No console errors or warnings during use
- [ ] Component exports are added to barrel files

---

## Testing Approach

### Manual Testing
- [ ] Verify markdown headings (h1-h6) render correctly
- [ ] Verify bold and italic text render correctly
- [ ] Verify ordered and unordered lists render correctly
- [ ] Verify links render and are clickable
- [ ] Verify code blocks render with proper styling
- [ ] Verify scrolling works when content exceeds maxHeight
- [ ] Verify empty state displays when no instructions
- [ ] Verify component renders on mobile viewports
- [ ] Verify component renders on desktop viewports
- [ ] Test with very long instruction content
- [ ] Test with content containing special characters

### Test Content Examples

```markdown
# Main Title

This is a paragraph with **bold text** and *italic text*.

## Features
- First item
- Second item with `inline code`
- Third item

### Steps
1. Open the appliance
2. Press the start button
3. Wait for completion

Here's a [link to documentation](https://example.com).

> A blockquote for important notes

\`\`\`
Code block example
\`\`\`
```

### Test Harness Integration

Add to `/src/app/test/item-manager/page.tsx`:
```tsx
<InstructionsViewer
  instructions={testMarkdownContent}
  maxHeight="300px"
  showHeader={true}
/>
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| XSS from malicious markdown | Low | High | react-markdown sanitizes HTML by default |
| Layout overflow with very long content | Medium | Low | Use overflow-y-auto with max-height constraint |
| Performance with very large documents | Low | Medium | Lazy load ReactMarkdown, consider virtualization only if issues arise |
| Inconsistent styling across markdown elements | Medium | Low | Use comprehensive prose classes matching MarkdownEditor |

---

## References

- [react-markdown Documentation](https://github.com/remarkjs/react-markdown)
- [Tailwind Typography (Prose) Plugin](https://tailwindcss.com/docs/typography-plugin)
- [Existing MarkdownEditor](/src/components/ItemCapture/editors/MarkdownEditor.tsx)
- [Existing ReviewStep](/src/components/ItemCapture/components/steps/ReviewStep.tsx)
- [Implementation Plan Phase 4](/docs/prd/item-capture-manager-implementation-plan.md)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
