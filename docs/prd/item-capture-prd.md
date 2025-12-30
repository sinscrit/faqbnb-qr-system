# Product Requirements Document: Item Capture Component

## Product Vision

Enable property owners to quickly create instructional content for household items/appliances, reducing guest confusion and support requests through scannable QR codes linked to rich media instructions.

---

## Success Definition

### Business Outcomes

| Metric | Target | How We'll Know |
|--------|--------|----------------|
| Time to create one item | < 3 minutes | User testing |
| Completion rate | > 80% of started items get published | Analytics |
| Content quality | Usable on first attempt (no re-records needed) | User feedback |
| Technical accessibility | Works on 90%+ of modern mobile browsers | Device testing |

### User Outcome

> "I can walk up to any appliance in my rental, record a quick video or snap a photo, add some notes, and have a QR-ready instruction page in under 3 minutes—without installing an app."

---

## Implementation Context: LLM Builder Instructions

### What You Are Building

A **standalone, self-contained UI component** called `ItemCapture`. This component will later be integrated into an existing application that already has authentication, authorization, and persistence layers.

### Critical Constraints for Implementation

| Constraint | Instruction |
|------------|-------------|
| **No backend calls** | Do NOT implement Supabase, API calls, or any network requests |
| **No auth logic** | Do NOT implement login, tokens, user context, or permission checks |
| **No routing** | Do NOT implement navigation, URL handling, or page transitions |
| **No global state** | Do NOT use Redux, Zustand, or app-level context providers |
| **Props in, callback out** | Component receives config via props, emits result via `onComplete()` |

### What TO Build

- Media capture UI (camera, microphone access)
- File upload UI (file picker, drag-drop)
- Editing UI (crop, trim, rotate)
- Text/markdown editor UI
- Review/preview UI
- Local component state management
- The structured `ItemRecord` output

### What NOT TO Build

- User authentication or login screens
- Database schemas or migrations
- File upload to cloud storage
- API endpoints
- Error reporting to external services
- Analytics tracking
- Multi-user or permissions logic

### Integration-Ready Architecture

The component must be structured so a developer can later wrap it like this:

```tsx
// FUTURE integration (do not implement this wrapper—just the inner component)
function CreateItemPage() {
  const { user } = useAuth();           // Existing app auth
  const { uploadFile } = useStorage();  // Existing app storage
  const { createItem } = useDatabase(); // Existing app database
  
  const handleComplete = async (record: ItemRecord) => {
    // Upload files, save to DB, generate QR, etc.
    // THIS LOGIC LIVES OUTSIDE THE COMPONENT
  };

  return (
    <AuthGuard>
      <ItemCapture 
        onComplete={handleComplete}
        onCancel={() => router.back()}
      />
    </AuthGuard>
  );
}
```

### Component Interface (Implement This)

```tsx
interface ItemCaptureProps {
  onComplete: (record: ItemRecord) => void;  // Called with final data
  onCancel: () => void;                       // Called if user abandons
  config?: ItemCaptureConfig;                 // Optional customization
}

// The component signature
export function ItemCapture({ onComplete, onCancel, config }: ItemCaptureProps): JSX.Element
```

### Test Harness (For Validation)

Build the component so it works in this minimal harness:

```tsx
function TestHarness() {
  return (
    <ItemCapture 
      onComplete={(record) => console.log('OUTPUT:', JSON.stringify(record, null, 2))}
      onCancel={() => console.log('CANCELLED')}
    />
  );
}
```

**If the component works in this harness with no errors and no network calls, it is correctly implemented.**

### Done Checklist

- [ ] Renders without any app context, providers, or wrappers
- [ ] All UI flows functional (capture, upload, edit, review)
- [ ] `onComplete(record)` emits valid `ItemRecord` with all captured data
- [ ] `onCancel()` fires when user abandons
- [ ] Zero network requests (check browser DevTools)
- [ ] Zero auth dependencies
- [ ] Works on mobile browsers (iOS Safari 15+, Chrome Android 90+)

---

### In Scope (This Component)

- Media capture (video, photo)
- File upload (PDF, existing images/videos)
- Text-only content creation (markdown/rich text descriptions)
- Light editing (crop, reframe, trim)
- Structured record output
- Mobile-first responsive design

### Out of Scope (Handled Elsewhere)

- Authentication/authorization
- Supabase persistence
- QR code generation
- Item organization/management
- Guest-facing viewing experience

---

## Features & Acceptance Criteria

### Feature 1: Video Recording

**User Story:** As a property owner, I want to record a video of myself demonstrating how to use an appliance so guests can watch and learn.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 1.1 | User can start/stop video recording from mobile browser | Core functionality |
| 1.2 | Live preview shows what camera sees before recording | Reduces failed attempts |
| 1.3 | Countdown timer shows remaining time (max 2 min) | Prevents oversized files |
| 1.4 | Recording auto-stops at 2 minute limit | Enforces size constraint |
| 1.5 | User can switch between front/back camera | Flexibility for demos |
| 1.6 | User can review recording before accepting | Quality control |
| 1.7 | User can discard and re-record | Error recovery |
| 1.8 | Works on iOS Safari 15+ and Chrome Android 90+ | Target device coverage |

**Constraints:**
- Max duration: 2 minutes
- Max resolution: 1080p
- Target file size: ≤ 100 MB

---

### Feature 2: Photo Capture

**User Story:** As a property owner, I want to take photos of control panels, settings, or labels so guests have visual reference.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 2.1 | User can take photo from mobile browser | Core functionality |
| 2.2 | Live preview shows camera view | Framing assistance |
| 2.3 | User can switch front/back camera | Flexibility |
| 2.4 | User can review photo before accepting | Quality control |
| 2.5 | User can retake if not satisfied | Error recovery |
| 2.6 | Multiple photos can be added to one item | Complete documentation |

**Constraints:**
- Max resolution: 4K (will be compressed)
- Max photos per item: 10

---

### Feature 3: File Upload

**User Story:** As a property owner, I want to upload existing files—videos, photos, or PDF manuals—so I can reuse content I've already created or access official documentation.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 3.1 | User can upload from device storage | Access existing content |
| 3.2 | Supported image formats: JPG, PNG, WEBP, HEIC | Common photo formats |
| 3.3 | Supported video formats: MP4, MOV, WEBM | Common video formats |
| 3.4 | Supported document formats: PDF | Manuals, official docs |
| 3.5 | Uploaded videos go through same editing flow as recorded | Consistent experience |
| 3.6 | Uploaded photos go through same editing flow as captured | Consistent experience |
| 3.7 | PDF preview/thumbnail generated from first page | Visual identification |
| 3.8 | File size limit clearly displayed before upload | Set expectations |
| 3.9 | Progress indicator shown during selection | Feedback |
| 3.10 | Invalid file types rejected with clear message | Error prevention |
| 3.11 | Multiple files can be selected at once | Efficiency |
| 3.12 | Any uploaded content can be standalone (no capture required) | Flexibility |

**Format-Specific Behaviors:**
- **Video:** Show duration, allow trimming, generate thumbnail
- **Image:** Show dimensions, allow crop/rotate
- **PDF:** Show page count, generate thumbnail from first page

**Constraints:**
- Max file size: 100 MB per file
- Max total size per item: 200 MB
- Max PDF pages: 50 (to prevent full manual dumps)

---

### Feature 4: Light Editing

**User Story:** As a property owner, I want to crop/reframe my photos and trim my videos so the content is focused and professional.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 4.1 | Photos can be cropped (free-form and preset ratios) | Focus on relevant area |
| 4.2 | Photos can be rotated 90° increments | Fix orientation |
| 4.3 | Videos can be trimmed (start/end points) | Remove fumbling at start/end |
| 4.4 | Edit preview shows result before applying | Confidence in changes |
| 4.5 | Edits are non-destructive until confirmed | Safe experimentation |
| 4.6 | User can skip editing entirely | Speed for confident users |

**Nice to Have (V2):**
- Basic filters/brightness adjustment
- Text/arrow annotations on photos
- Video thumbnail selection

---

### Feature 5: Text/Markup Content

**User Story:** As a property owner, I want to create written instructions—either as supplementary notes or as the primary content—so I can provide clear guidance without needing to record media.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 5.1 | Rich text editor available with markdown support | Flexible formatting |
| 5.2 | Supports headings, bold, italic, bullets, numbered lists | Structure for complex instructions |
| 5.3 | Supports inline links | Reference manuals, warranty info |
| 5.4 | Live preview of formatted output | See what guests will see |
| 5.5 | Can be used as standalone content (no media required) | Text-only items are valid |
| 5.6 | Can be combined with media as supplementary notes | Hybrid content |
| 5.7 | Character count displayed | Guidance on length |
| 5.8 | Works well on mobile keyboard | Primary input device |
| 5.9 | Auto-save as user types | Prevent data loss |

**Use Cases:**
- **Standalone:** Simple items like "WiFi password is on the fridge" or step-by-step text instructions
- **Supplementary:** Detailed notes alongside a video demo
- **Reference:** Troubleshooting FAQs, do's and don'ts

**Constraints:**
- Max length: 5,000 characters
- Supported markdown: CommonMark subset (no HTML injection)

---

### Feature 6: Item Metadata

**User Story:** As a property owner, I want to name and tag my items so I can organize them later.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 6.1 | Item name/title field (required) | Identification |
| 6.2 | Location field (optional) | Organization |
| 6.3 | Tags field (optional, multi-select or free-form) | Categorization |
| 6.4 | Appliance type selector (optional) | Structured data |
| 6.5 | All metadata editable before final submission | Corrections |

---

### Feature 7: Review & Submit

**User Story:** As a property owner, I want to review everything before submitting so I can catch mistakes.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 7.1 | Summary view shows all media, text, and metadata | Final check |
| 7.2 | User can go back and edit any section | Corrections |
| 7.3 | User can reorder media items | Control presentation |
| 7.4 | User can remove individual media items | Cleanup |
| 7.5 | Clear "Submit" / "Save" action | Explicit completion |
| 7.6 | Confirmation shown after successful submission | Feedback |
| 7.7 | User can cancel entire item creation | Escape hatch |

---

## Technical Requirements

### Component Interface

```typescript
interface ItemCaptureProps {
  onComplete: (record: ItemRecord) => void;
  onCancel: () => void;
  config?: {
    maxVideoDuration?: number;  // seconds, default 120
    maxFileSize?: number;       // bytes, default 100MB
    allowedMediaTypes?: string[];
  };
}

interface ItemRecord {
  id: string;                   // local UUID
  title: string;
  location?: string;
  tags?: string[];
  applianceType?: string;
  contentType: 'media' | 'text-only' | 'pdf-only' | 'mixed';
  media: MediaItem[];
  instructions?: string;        // markdown/rich text
  createdAt: Date;
}

interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;
  thumbnail?: Blob;
  order: number;
  metadata?: {
    duration?: number;          // video only
    dimensions?: { width: number; height: number };
    originalFilename?: string;
    pageCount?: number;         // PDF only
    mimeType?: string;
  };
}
```

### Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| iOS Safari | 15+ |
| Chrome (Android) | 90+ |
| Chrome (Desktop) | 90+ |
| Firefox | 90+ |
| Edge | 90+ |

### Performance Targets

| Metric | Target |
|--------|--------|
| Initial load | < 2 seconds |
| Camera activation | < 1 second |
| Photo capture to preview | < 500ms |
| Video stop to preview | < 2 seconds |

---

## User Flow

```
┌─────────────┐
│  Start New  │
│    Item     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Enter Title │ (required)
│ + Metadata  │ (optional)
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Choose Content Type                      │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │      VIDEO      │  │      PHOTO      │  │    TEXT     │ │
│  │  ┌───┐  ┌────┐  │  │  ┌───┐  ┌────┐  │  │   ONLY      │ │
│  │  │REC│  │UPLD│  │  │  │CAP│  │UPLD│  │  │  (Markdown) │ │
│  │  └───┘  └────┘  │  │  └───┘  └────┘  │  └─────────────┘ │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │           FILE UPLOAD               │                   │
│  │  Existing video, photo, or PDF      │                   │
│  └─────────────────────────────────────┘                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────┐
                  │ Light Edit  │ (optional, not for PDF)
                  │ crop/trim   │
                  └─────────────┘
                           │
                           ▼
                  ┌─────────────┐
                  │ Add Another │◄───┐
                  │   or Done   │    │
                  └──────┬──────┘    │
                         │───────────┘
                         │
                         ▼
          ┌────────────────────────┐
          │ Add/Edit Text Notes    │ (optional if media exists,
          │ (Markdown supported)   │  required if text-only)
          └───────────┬────────────┘
                      │
                      ▼
          ┌─────────────────┐
          │  Review & Edit  │
          │    All Items    │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │     Submit      │──────► onComplete(record)
          └─────────────────┘
```

### Content Input Methods

| Content | Capture/Record | Upload Existing |
|---------|----------------|-----------------|
| Video | ✓ | ✓ |
| Photo | ✓ | ✓ |
| PDF | — | ✓ |
| Text | ✓ (compose) | — |

### Valid Content Combinations

| Content Type | Media | Text | Valid? |
|--------------|-------|------|--------|
| Video + notes | ✓ | ✓ | ✓ |
| Photo(s) only | ✓ | ✗ | ✓ |
| PDF only | ✓ | ✗ | ✓ |
| PDF + notes | ✓ | ✓ | ✓ |
| Text only | ✗ | ✓ | ✓ |
| Mixed media + notes | ✓ | ✓ | ✓ |
| Empty | ✗ | ✗ | ✗ |

---

## Open Questions

1. **Offline support?** Should users be able to capture content offline and sync later?
2. **Draft auto-save?** If user closes browser mid-creation, should we restore state?
3. **Duplicate detection?** Warn if uploading same file twice?
4. **Accessibility?** What level of WCAG compliance is required?
5. **Localization?** Multi-language support needed?

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-XX | — | Initial draft |
