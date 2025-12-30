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

*Analysis continues after dependency installation...*
