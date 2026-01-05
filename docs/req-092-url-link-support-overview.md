# Implementation Overview: Support for URL/Link Items with Metadata Preview

## Header

| Field | Value |
|-------|-------|
| Request Reference | #092 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-05 14:30 |
| Breakdown Created | 2026-01-05 01:59:29 CET |
| T-shirt Size | M |
| Estimated Effort | 3-4 days (24-32 hours) |

## Goals

1. Extend the ItemCapture component to support URL/Link as a fifth content type alongside video, image, PDF, and text
2. Implement server-side URL metadata extraction (og:title, og:image, favicon, domain)
3. Add special handling for YouTube URLs to extract video thumbnails without API authentication
4. Create visual preview components for URL items in the capture wizard and item displays
5. Integrate URL items into existing ItemCard and ItemRow display components
6. Persist URL items to the existing `item_links` database table

### Assumptions & Clarifications

- The `item_links` table already exists in Supabase with the required schema (`id`, `item_id`, `link_type`, `url`, `title`, `thumbnail_url`, `display_order`)
- URL items will be stored separately from MediaItem (which uses Blob data), using the `item_links` table
- A single item can have multiple URL links (similar to multiple media items)
- The link_type field will categorize URLs: 'youtube', 'pdf', 'image', 'text', 'generic'
- URL metadata fetching must happen server-side to avoid CORS issues
- YouTube thumbnails are publicly accessible at predictable URLs and don't require API keys
- Invalid or inaccessible URLs should gracefully degrade with domain-only fallback display

## Implementation Plan

### Step 1: Extend Type System

- **Description**: Add 'url' type to MediaItem, create URL-specific metadata interfaces, add 'add-url' wizard step, and extend content type options
- **Rationale**: Types form the foundation - all subsequent work depends on having correct type definitions
- **Estimated Effort**: S (2-3 hours)

### Step 2: Create URL Metadata API Route

- **Description**: Implement `/api/url-metadata` endpoint that fetches a URL, parses Open Graph tags, extracts favicons, and returns structured metadata
- **Rationale**: Server-side fetching is required to avoid CORS restrictions; this enables the preview functionality
- **Estimated Effort**: M (4-5 hours)

### Step 3: Create URL Input Step Component

- **Description**: Build `UrlInputStep.tsx` wizard component with URL input field, validation, loading state, and preview display
- **Rationale**: This is the primary user interaction point for adding URLs - follows existing step component patterns
- **Estimated Effort**: M (4-5 hours)

### Step 4: Create URL Preview Component

- **Description**: Build reusable `UrlPreview.tsx` component for displaying URL items with thumbnail, title, domain, and external link indicator
- **Rationale**: Shared component used in both wizard flow and item display views
- **Estimated Effort**: S (2-3 hours)

### Step 5: Implement YouTube Special Handling

- **Description**: Create utility functions to detect YouTube URLs, extract video IDs, and generate thumbnail URLs
- **Rationale**: YouTube is the most common video link platform; public thumbnail access eliminates API complexity
- **Estimated Effort**: S (2 hours)

### Step 6: Update State Machine

- **Description**: Add 'add-url' step to wizard transitions in `useItemCaptureState.ts`, integrate URL data storage
- **Rationale**: State machine changes enable navigation to the new URL input step
- **Estimated Effort**: S (2-3 hours)

### Step 7: Integrate with ContentTypeStep

- **Description**: Add "Add Link" button option to the content type selection grid
- **Rationale**: Entry point for users to add URL content type
- **Estimated Effort**: S (1-2 hours)

### Step 8: Update ReviewStep

- **Description**: Display URL items in the review step with ability to edit/remove
- **Rationale**: Users need to review all content types before submission
- **Estimated Effort**: S (2 hours)

### Step 9: Update ItemCard Display

- **Description**: Extend ItemCard to display URL items with thumbnail, title, domain badge, and external link indicator
- **Rationale**: Grid view display of URL items in ItemManager
- **Estimated Effort**: S (2-3 hours)

### Step 10: Update ItemRow Display

- **Description**: Extend ItemRow to display URL items with appropriate formatting for list view
- **Rationale**: List view display of URL items in ItemManager
- **Estimated Effort**: S (2 hours)

### Step 11: Integration Testing & Polish

- **Description**: End-to-end testing of URL capture flow, error handling edge cases, accessibility review
- **Rationale**: Ensures feature works correctly in production scenarios
- **Estimated Effort**: M (3-4 hours)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Type Definitions (Step 1)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/ItemCapture.types.ts` | `MediaItem.type` union | Modify - add 'url' |
| `src/components/ItemCapture/ItemCapture.types.ts` | `MediaMetadata` interface | Modify - add URL fields |
| `src/components/ItemCapture/ItemCapture.types.ts` | `WizardStep` type | Modify - add 'add-url' |
| `src/components/ItemCapture/ItemCapture.types.ts` | `ItemRecord.contentType` | Modify - add 'url-only' |
| `src/components/ItemCapture/ItemCapture.types.ts` | `UrlMetadata` interface | Create |
| `src/components/ItemCapture/ItemCapture.types.ts` | `UrlItem` interface | Create |

### API Route (Step 2)

| File | Target | Type |
|------|--------|------|
| `src/app/api/url-metadata/route.ts` | `POST` handler | Create |
| `src/app/api/url-metadata/route.ts` | `parseOpenGraphTags()` | Create |
| `src/app/api/url-metadata/route.ts` | `extractFavicon()` | Create |
| `src/app/api/url-metadata/route.ts` | `validateUrl()` | Create |

### URL Input Step (Step 3)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/components/steps/UrlInputStep.tsx` | `UrlInputStep` component | Create |
| `src/components/ItemCapture/components/steps/UrlInputStep.tsx` | `UrlInputStepProps` interface | Create |

### URL Preview Component (Step 4)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/components/shared/UrlPreview.tsx` | `UrlPreview` component | Create |
| `src/components/ItemCapture/components/shared/UrlPreview.tsx` | `UrlPreviewProps` interface | Create |

### YouTube Utilities (Step 5)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/utils/urlHelpers.ts` | `isYouTubeUrl()` | Create |
| `src/components/ItemCapture/utils/urlHelpers.ts` | `extractYouTubeVideoId()` | Create |
| `src/components/ItemCapture/utils/urlHelpers.ts` | `getYouTubeThumbnailUrl()` | Create |
| `src/components/ItemCapture/utils/urlHelpers.ts` | `extractDomain()` | Create |
| `src/components/ItemCapture/utils/urlHelpers.ts` | `validateUrlFormat()` | Create |

### State Machine (Step 6)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | `STEP_TRANSITIONS` | Modify - add 'add-url' transitions |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | `ItemCaptureState` | Modify - add urlItems array |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | `ItemCaptureAction` | Modify - add URL actions |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | `itemCaptureReducer()` | Modify - handle URL actions |

### ContentTypeStep Integration (Step 7)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/components/steps/ContentTypeStep.tsx` | `ContentType` type | Modify - add 'url' |
| `src/components/ItemCapture/components/steps/ContentTypeStep.tsx` | `CONTENT_OPTIONS` array | Modify - add URL option |

### Main Orchestrator (Step 7)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/ItemCapture.tsx` | `handleContentTypeSelect()` | Modify - add 'url' case |
| `src/components/ItemCapture/ItemCapture.tsx` | `renderStep()` | Modify - add 'add-url' case |
| `src/components/ItemCapture/ItemCapture.tsx` | imports | Modify - add UrlInputStep |

### ReviewStep Integration (Step 8)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | `ReviewStepProps` | Modify - add urlItems prop |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | `ReviewStep` component | Modify - render URL section |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | `UrlItemCard` sub-component | Create |

### ItemCard Display (Step 9)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/ItemCard.tsx` | `getContentTypeBadge()` | Modify - add 'url' case |
| `src/components/ItemManager/components/ItemCard.tsx` | `getFallbackIcon()` | Modify - add URL icon |
| `src/components/ItemManager/components/ItemCard.tsx` | thumbnail rendering | Modify - handle URL thumbnails |

### ItemRow Display (Step 10)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/ItemRow.tsx` | `getContentTypeBadge()` | Modify - add 'url' case |
| `src/components/ItemManager/components/ItemRow.tsx` | `getFallbackIcon()` | Modify - add URL icon |
| `src/components/ItemManager/components/ItemRow.tsx` | thumbnail rendering | Modify - handle URL thumbnails |

### Constants (Supporting)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/utils/constants.ts` | `URL_CONSTRAINTS` | Create |
| `src/components/ItemCapture/utils/constants.ts` | `YOUTUBE_PATTERNS` | Create |

### Validation (Supporting)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/utils/validation.ts` | `validateUrl()` | Create |
| `src/components/ItemCapture/utils/validation.ts` | `validateItemCapture()` | Modify - include URL validation |

### Assembly (Supporting)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/utils/assembleItemRecord.ts` | `assembleItemRecord()` | Modify - include URL items |

## Dependencies

### Internal Dependencies

- None - this is a standalone feature enhancement

### External Dependencies

| Dependency | Purpose | Notes |
|------------|---------|-------|
| Native `fetch` API | Server-side URL fetching | Built-in to Node.js/Next.js |
| `cheerio` or DOM parser | HTML parsing for OG tags | May need to add package |
| `lucide-react` | Link/Globe icons | Already installed |
| Supabase | `item_links` table storage | Already configured |

## Risks and Considerations

### Potential Side Effects

1. **ItemRecord structure change**: Adding URL items may affect downstream consumers of ItemRecord
2. **Content type determination**: Logic for determining `contentType` ('url-only', 'mixed') needs careful handling
3. **ReviewStep complexity**: Adding a fourth content section increases component complexity

### Security Considerations

1. **SSRF Prevention**: Server-side URL fetching must validate/sanitize URLs to prevent Server-Side Request Forgery
2. **URL Validation**: Must validate URL format and protocol (https preferred, block file://, javascript:, etc.)
3. **Content-Type Validation**: API should only fetch HTML content, reject large files
4. **Timeout Handling**: Fetching external URLs must have strict timeouts to prevent DoS

### Performance Considerations

1. **Metadata Fetch Latency**: External URL fetching adds latency to the user flow
2. **Caching Strategy**: Consider caching URL metadata to avoid repeated fetches
3. **Thumbnail Loading**: External thumbnail URLs may be slow to load
4. **Rate Limiting**: API endpoint should be rate-limited to prevent abuse

### Testing Requirements

1. **URL validation edge cases**: Malformed URLs, special characters, international domains
2. **YouTube ID extraction**: Various YouTube URL formats (youtube.com, youtu.be, shorts, playlists)
3. **OG tag parsing**: Sites with missing/malformed OG tags, different encodings
4. **Error handling**: Network failures, timeouts, invalid responses
5. **Accessibility**: Keyboard navigation, screen reader announcements for URL items
6. **Mobile responsiveness**: Touch targets, URL input on mobile keyboards

### Open Questions

- [ ] Should URL items support editing after creation (updating URL or metadata)?
- [ ] Should we support bulk URL import (paste multiple URLs at once)?
- [ ] How should we handle URLs that become unavailable after initial capture?
- [ ] Should metadata be refreshed periodically for saved URLs?
- [ ] Do we need to store a snapshot/screenshot of the linked page for offline viewing?
- [ ] Should URL items be included in QR code PDF exports, and if so, how?

## Out of Scope

Per the original request, the following are explicitly out of scope:

1. **URL embedding/iframe preview**: Only link cards with thumbnails, not embedded content
2. **Video playback**: YouTube links open in new tab, not inline playback
3. **URL shortening**: URLs stored as-is
4. **Link health monitoring**: No automated checking for broken links
5. **Private/authenticated URLs**: Only publicly accessible URLs supported
6. **Deep metadata extraction**: Only standard OG tags and favicon, not full page analysis
7. **URL analytics**: Click tracking for outbound links
8. **Bulk URL operations**: Single URL addition at a time

---
*Document generated: 2026-01-05 01:59:29 CET*
