# REQ-028: Bundle Size Impact Analysis - Technical Overview

**Document Created**: 2025-12-30 14:06
**Last Modified**: 2025-12-30 14:06
**Request Reference**: REQ-028 in `/docs/gen_requests.md`
**Implementation Plan Reference**: `/docs/prd/item-capture-implementation-plan.md`

---

## Purpose

This document outlines the technical approach for conducting a bundle size impact analysis before implementing the ItemCapture component. The spike ensures that new media processing dependencies do not compromise application performance or user experience.

---

## Executive Summary

The ItemCapture component requires three new dependency categories:

| Category | Library | Estimated Size (gzipped) | Loading Strategy |
|----------|---------|-------------------------|------------------|
| PDF Processing | pdfjs-dist | ~500 KB | Lazy (on PDF upload) |
| Image Cropping | react-image-crop | ~45 KB | Lazy (on edit action) |
| Markdown Rendering | react-markdown | ~12 KB | Eager (part of wizard) |

**Total potential impact**: ~557 KB
**Target threshold**: ItemCapture bundle under 500 KB (excluding lazy-loaded PDF processing)

---

## Technical Approach

### Phase 1: Baseline Measurement (30 minutes)

**Objective**: Establish current bundle metrics before adding dependencies.

**Tasks**:

1. Install the Next.js bundle analyzer
   ```
   npm install --save-dev @next/bundle-analyzer
   ```

2. Configure bundle analyzer in next.config.js
   ```javascript
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   });
   module.exports = withBundleAnalyzer(nextConfig);
   ```

3. Run production build with analysis
   ```
   ANALYZE=true npm run build
   ```

4. Document baseline metrics:
   - Total JS bundle size
   - Main chunk size
   - Pages chunk sizes
   - Largest dependencies

**Expected Output**: Baseline report with current chunk sizes and dependency tree.

---

### Phase 2: Dependency Installation (15 minutes)

**Objective**: Add new dependencies without any component implementation.

**Dependencies to install**:

```bash
npm install react-image-crop react-markdown pdfjs-dist
npm install --save-dev @types/react-image-crop
```

**Version considerations**:

| Library | Recommended Version | Rationale |
|---------|---------------------|-----------|
| pdfjs-dist | 4.x | Latest stable with ES module support |
| react-image-crop | 11.x | React 19 compatibility |
| react-markdown | 9.x | Modern React support |

---

### Phase 3: Impact Analysis (30 minutes)

**Objective**: Measure bundle size change after dependency addition.

**Tasks**:

1. Run production build with analysis
   ```
   ANALYZE=true npm run build
   ```

2. Compare against baseline:
   - Delta in total bundle size
   - New chunks created
   - Impact on initial page load bundle

3. Identify which dependencies appear in which chunks

4. Measure First Contentful Paint impact using Lighthouse

**Key Metrics to Capture**:

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Initial JS bundle | Under 250 KB increase | Bundle analyzer |
| ItemCapture chunk | Under 500 KB | Bundle analyzer |
| PDF processing chunk | Separate from main | Bundle analyzer |
| LCP impact | Under 0.5s increase | Lighthouse |
| TTI impact | Under 1s increase | Lighthouse |

---

### Phase 4: Lazy Loading Implementation (45 minutes)

**Objective**: Implement code splitting to minimize initial load impact.

**Lazy loading strategy**:

```typescript
// PDF Processing - load only when user uploads a PDF
const PDFThumbnailGenerator = dynamic(
  () => import('./utils/pdfThumbnailGenerator'),
  { ssr: false }
);

// Image Cropper - load only when user enters edit mode
const ImageCropper = dynamic(
  () => import('./editors/ImageCropper'),
  { ssr: false }
);

// Markdown preview - can be eagerly loaded (small size)
import ReactMarkdown from 'react-markdown';
```

**PDF.js Worker Configuration**:

The pdfjs-dist library requires a web worker for optimal performance. This must be configured to load on-demand:

```typescript
// Load worker only when PDF processing is needed
async function initializePDFJS() {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  return pdfjs;
}
```

---

### Phase 5: Validation (30 minutes)

**Objective**: Confirm all performance targets are met.

**Validation Checklist**:

- [ ] Production build completes without errors
- [ ] ItemCapture chunk is under 500 KB (excluding PDF processing)
- [ ] PDF processing code is in a separate chunk
- [ ] PDF processing chunk loads only on PDF file selection
- [ ] Initial page load time remains under 2 seconds
- [ ] No new dependencies appear in the main bundle
- [ ] Lighthouse performance score remains above 90

**Test Scenarios**:

1. **Cold load without PDF**
   - Load ItemCapture page
   - Verify PDF.js is NOT in network requests
   - Complete capture flow with photo only

2. **PDF upload triggers lazy load**
   - Load ItemCapture page
   - Upload a PDF file
   - Verify PDF.js chunk appears in network requests
   - Verify thumbnail generates correctly

3. **Image crop triggers lazy load**
   - Load ItemCapture page
   - Capture a photo
   - Click edit/crop
   - Verify react-image-crop chunk loads on demand

---

## Deliverables

### 1. Bundle Analysis Report

Create `/docs/req-028-bundle-analysis-report.md` containing:

- Baseline measurements (before dependencies)
- Post-installation measurements (after dependencies)
- Delta analysis with percentage changes
- Chunk breakdown by dependency
- Lazy loading verification results
- Screenshot of bundle analyzer visualization

### 2. Configuration Changes

- Updated `next.config.js` with bundle analyzer (dev dependency)
- Any webpack configurations for code splitting
- PDF.js worker configuration

### 3. Performance Baseline Document

Create `/docs/performance-baseline.md` containing:

- Lighthouse scores (before and after)
- Core Web Vitals metrics
- Load time measurements
- Recommendations for future monitoring

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| pdfjs-dist exceeds size estimates | Low | Medium | Use CDN-hosted worker; consider lighter alternative |
| Lazy loading fails on some browsers | Low | High | Test on iOS Safari, Chrome, Firefox; implement fallback |
| Tree shaking ineffective | Medium | Medium | Use named imports; verify unused code is eliminated |
| Build time significantly increases | Low | Low | Acceptable tradeoff for production optimization |

---

## Decision Points

After completing this spike, the team should decide:

1. **Proceed as planned** if all targets are met
2. **Investigate alternatives** if PDF processing exceeds 600 KB
3. **Consider server-side PDF processing** if client-side is too heavy
4. **Defer PDF thumbnails to V2** if bundle impact is unacceptable

---

## Estimated Effort

| Phase | Duration | Notes |
|-------|----------|-------|
| Phase 1: Baseline | 30 min | Simple measurement |
| Phase 2: Installation | 15 min | npm install |
| Phase 3: Impact Analysis | 30 min | Build and compare |
| Phase 4: Lazy Loading | 45 min | Configuration work |
| Phase 5: Validation | 30 min | Testing scenarios |
| **Total** | **2.5 hours** | Within S-size estimate |

---

## Success Criteria

This spike is successful when:

1. All three dependency categories are installed
2. Bundle analyzer report documents exact chunk sizes
3. PDF processing demonstrably loads only on PDF upload
4. ItemCapture workflow bundle is verified under 500 KB (excluding lazy PDF)
5. Initial page load time is confirmed under 2 seconds
6. Documentation is complete for future reference

---

## References

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist)
- [react-image-crop](https://www.npmjs.com/package/react-image-crop)
- [react-markdown](https://www.npmjs.com/package/react-markdown)
- [Next.js Dynamic Imports](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading)

---

## Appendix A: Current Dependency Baseline

From package.json as of 2025-12-30:

**Relevant existing dependencies**:
- Next.js 15.4.2
- React 19.1.0
- Tailwind CSS 4.x
- Radix UI primitives
- Lucide React icons

**No existing PDF/image-processing dependencies** - this is a greenfield addition.

---

## Appendix B: Chunk Naming Convention

For maintainability, use consistent chunk names:

| Chunk | Naming Pattern | Contains |
|-------|---------------|----------|
| Main bundle | Automatic | Core app code |
| ItemCapture core | `item-capture-[hash]` | Wizard, steps, basic UI |
| PDF processing | `pdf-processing-[hash]` | pdfjs-dist, thumbnail generation |
| Image editing | `image-editor-[hash]` | react-image-crop, rotation utilities |
| Markdown | Included in core | react-markdown (small enough) |

---

*End of Technical Overview*
