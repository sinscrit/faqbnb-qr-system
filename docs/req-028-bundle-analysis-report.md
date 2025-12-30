# REQ-028: Bundle Analysis Report

**Generated:** 2025-12-30 13:21 (System Time)
**Last Modified:** 2025-12-30 13:21

## Baseline Measurements (Before New Dependencies)

### Build Output Summary
- Total build time: ~60 seconds
- Total client JS size (shared by all): 99.7 KB
- Total server JS size: Not directly measured (server components)
- Middleware size: 69.8 KB

### Client Bundle Breakdown

Based on Next.js build output, the shared chunks consumed by all routes:

| Chunk Name | Size (raw) | Notes |
|------------|------------|-------|
| chunks/4bd1b696-223acfa09453497a.js | 54.1 KB | Main React/Next.js runtime |
| chunks/5964-09b8b2df13d0f34c.js | 43.6 KB | Shared application code |
| other shared chunks | 2 KB | Misc shared utilities |
| **Total Shared (First Load JS)** | **99.7 KB** | Baseline for all pages |

### Route-Specific Bundle Sizes (Sample)

| Route | Page Size | First Load JS | Notes |
|-------|-----------|---------------|-------|
| / (homepage) | 2.3 kB | 111 kB | Landing page |
| /dashboard | 5.2 kB | 162 kB | Main dashboard |
| /dashboard/items | 6.45 kB | 176 kB | Items management |
| /dashboard/properties | 5.72 kB | 168 kB | Properties management |
| /item/[publicId] | 7.64 kB | 169 kB | Public item view |
| /register | 14.1 kB | 176 kB | Registration page (heaviest route-specific) |
| /admin | 1.98 kB | 155 kB | Admin dashboard |

### Largest Dependencies (Current)

Based on the shared chunks analysis, current major dependencies include:
| Package | Estimated Size | Notes |
|---------|----------------|-------|
| react-dom | ~35-40 KB (estimated) | Core React dependency |
| @supabase/supabase-js | ~20-25 KB (estimated) | Database client |
| recharts | Included in route bundles | Analytics charts (used in analytics pages) |
| Next.js runtime | ~30 KB (estimated) | Framework overhead |

### Screenshots
Bundle analyzer generated three reports:
- Client bundle: `.next/analyze/client.html`
- Server (Node.js) bundle: `.next/analyze/nodejs.html`
- Edge runtime bundle: `.next/analyze/edge.html`

**Note:** Screenshots will be captured manually after opening the HTML reports in browser.
Path: `/docs/images/bundle-baseline.png`

### Key Findings - Baseline
1. The shared JavaScript bundle consumed by all pages is 99.7 KB
2. Individual route bundles range from 556 bytes to 14.1 KB
3. First Load JS (shared + route-specific) ranges from 100 KB to 176 KB
4. The heaviest route is `/register` at 176 KB total
5. No PDF processing or image manipulation libraries are currently included
6. All routes share common chunks, indicating good code splitting by Next.js

### Current Dependencies (from package.json)
Notable runtime dependencies before adding new libraries:
- next: 15.4.2
- react: 19.1.0
- react-dom: 19.1.0
- @supabase/supabase-js: (current version)
- recharts: (analytics charts)
- qrcode: (QR code generation)
- pdfkit: (server-side PDF generation - not in client bundle)

---

## Post-Installation Measurements (Eager Loading)

**Last Modified:** 2025-12-30 13:28

### Build Output Summary
- Total build time: ~65 seconds (+5s from baseline)
- Total client JS size (shared by all): 99.7 KB (unchanged - good!)
- Total server JS size: Not directly measured (server components)
- Test page bundle: **/test/bundle-test - 134 KB page, 241 KB First Load JS**

### Bundle Impact Analysis

Created test page `/test/bundle-test` with eager imports of all three dependencies:
- pdfjs-dist: Imported as `import * as pdfjsLib from 'pdfjs-dist'`
- react-image-crop: Imported as `import ReactCrop from 'react-image-crop'` + CSS
- react-markdown: Imported as `import ReactMarkdown from 'react-markdown'`

#### Test Page Results:
| Metric | Value | Comparison to Baseline |
|--------|-------|------------------------|
| Page-specific JS | 134 KB | Largest individual page (prev: 14.1 KB /register) |
| First Load JS | 241 KB | +141.3 KB from shared baseline (99.7 KB) |
| **Total Bundle Increase** | **+141.3 KB** | **+142% increase** |

### Eager Loading Impact Breakdown

Based on bundle analyzer visualization (see `.next/analyze/client.html`):

| Dependency | Estimated Contribution | Notes |
|------------|------------------------|-------|
| pdfjs-dist | ~120 KB | Largest contributor - PDF.js core + worker bootstrap |
| react-image-crop | ~10-12 KB | Cropping library + CSS styles |
| react-markdown | ~8-10 KB | Markdown parsing and rendering |
| **Total Estimated** | **~138-142 KB** | Matches observed 141.3 KB delta |

### Key Findings - Eager Loading

1. **Critical Finding**: Loading all three dependencies eagerly adds 141.3 KB to the test page bundle
2. **PDF.js Dominates**: Approximately 85% of the bundle increase comes from pdfjs-dist
3. **Exceeds Target**: The 241 KB First Load JS far exceeds the 500 KB target mentioned in requirements, BUT this is worst-case (eager loading everything)
4. **Shared Bundle Unchanged**: The core shared bundle remains at 99.7 KB - dependencies are properly chunked by Next.js
5. **Need for Lazy Loading Validated**: The 141 KB increase confirms lazy loading is essential

### Comparison to Baseline Routes

| Route | First Load JS | Delta from Baseline Shared |
|-------|---------------|----------------------------|
| Baseline shared | 99.7 KB | - |
| /register (heaviest before) | 176 KB | +76.3 KB |
| **/test/bundle-test (eager)** | **241 KB** | **+141.3 KB** |
| **Potential with lazy loading** | **~100-110 KB** | **~+0-10 KB** (if properly deferred) |

### Recommendation
**PROCEED WITH LAZY LOADING IMPLEMENTATION** - The eager loading results confirm that:
1. All dependencies can be code-split into separate chunks
2. The total size (141 KB) is manageable if loaded on-demand
3. Lazy loading strategy will reduce initial page load to near-baseline levels

---

*Analysis continues with lazy loading implementation...*
