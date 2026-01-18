# Product Requirements Document: Item Creation Workflow

## Document Information

| Field | Value |
|-------|-------|
| Version | 0.1 |
| Status | Draft |
| Created | 2025-01-05 |
| Last Updated | 2025-01-05 |
| Related PRDs | PRD: Item Capture Component |

---

## Product Vision

Guide property owners through a simple, intuitive workflow to create instructional content for household items—from selecting what to tag, through content creation, to printing QR codes—all in a single session without requiring technical knowledge.

### User Outcome

> "I logged in, walked through my rental tagging each appliance, and had a sheet of QR codes printed in under 30 minutes. The app told me exactly what to do at each step."

---

## Success Definition

### Business Outcomes

| Metric | Target | How We'll Know |
|--------|--------|----------------|
| Session completion rate | > 70% of started sessions result in at least one item created | Analytics |
| Items per session | Average 3-5 items created per session | Analytics |
| Time to first item | < 5 minutes from login to first saved item | User testing |
| QR code generation rate | > 60% of sessions end with QR codes generated/printed | Analytics |
| Return rate | < 20% of users need to return to fix/redo items | Analytics |

### User Experience Goals

| Goal | Measure |
|------|---------|
| Clarity | User always knows what step they're on and what's next |
| Speed | Minimal taps/clicks between steps |
| Flexibility | Can create simple text-only items or rich media items with same flow |
| Recovery | Can go back and edit at any point before final print |

---

## Scope

### In Scope (This PRD)

- Complete user workflow from login to QR code printing
- Room and item selection interface
- Item type categorization (appliance, room item, general info)
- Smart item suggestions based on room selection
- Multi-item session management
- QR code PDF generation
- Session summary and review

### Out of Scope (Handled by Other PRDs/Components)

- Individual content capture UI (see: PRD Item Capture Component)
- User authentication and login
- Database persistence layer
- Guest-facing QR code viewing experience
- Property/rental management
- Multi-property support

### Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| ItemCapture Component | Internal | Reused for all content creation steps |
| QR Code Generation Service | Internal | Generates QR codes linking to item content |
| PDF Generation Service | Internal | Creates printable QR code sheets |

---

## User Flow

### Flow Diagram

```
                                    ┌─────────────────┐
                                    │   USER LOGS IN  │
                                    └────────┬────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              STEP 1: SELECT ROOM                                │
│                                                                                 │
│  "Which room is this item in?"                                                  │
│                                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Kitchen  │ │ Laundry  │ │ Bedroom  │ │ Bathroom │ │  Living  │ │  Other   │ │
│  │    🍳    │ │    🧺    │ │    🛏️    │ │    🚿    │ │    🛋️    │ │    📍    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                                        │
│  │  Garage  │ │ Outdoor  │ │ General  │  ← For whole-property info             │
│  │    🚗    │ │    🌳    │ │    ℹ️    │    (WiFi, rules, emergency)            │
│  └──────────┘ └──────────┘ └──────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            STEP 2: SELECT ITEM TYPE                             │
│                                                                                 │
│  "What type of item are you tagging?"                                           │
│                                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────┐│
│  │       APPLIANCE         │  │       ROOM ITEM         │  │     GENERAL      ││
│  │                         │  │                         │  │   INFORMATION    ││
│  │  Large devices with     │  │  Smaller items,         │  │                  ││
│  │  controls that need     │  │  fixtures, or           │  │  WiFi, house     ││
│  │  explanation            │  │  features               │  │  rules, contacts ││
│  │                         │  │                         │  │                  ││
│  │  Examples:              │  │  Examples:              │  │  Examples:       ││
│  │  • Washer/Dryer         │  │  • Smart blinds         │  │  • WiFi password ││
│  │  • Thermostat           │  │  • Safe/lockbox         │  │  • Check-out     ││
│  │  • Dishwasher           │  │  • Shower controls      │  │  • Emergency     ││
│  └─────────────────────────┘  └─────────────────────────┘  └──────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          STEP 3: SELECT SPECIFIC ITEM                           │
│                                                                                 │
│  "What item are you tagging?"                                                   │
│                                                                                 │
│  Shows contextual suggestions based on Room + Item Type:                        │
│                                                                                 │
│  Example: Kitchen + Appliance                                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────────┐ │
│  │   Stove    │ │   Fridge   │ │ Microwave  │ │ Dishwasher │ │ + Something   │ │
│  │     🔥     │ │     🧊     │ │     📻     │ │     🍽️     │ │     else      │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └───────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Item Name: [ Kitchen - Dishwasher                              ] ✏️    │   │
│  │             (Auto-filled, but editable)                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           STEP 4: CONTENT SOURCE                                │
│                                                                                 │
│  "Do you have existing content for this item?"                                  │
│                                                                                 │
│  ┌───────────────────────────────────┐  ┌───────────────────────────────────┐  │
│  │      YES, I HAVE CONTENT          │  │      NO, I'LL CREATE IT NOW       │  │
│  │                                   │  │                                   │  │
│  │  I have a video, photo, PDF,      │  │  I want to record, capture,       │  │
│  │  or URL ready to upload           │  │  or write something new           │  │
│  │                                   │  │                                   │  │
│  │            📁                     │  │            📱                     │  │
│  └───────────────────────────────────┘  └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           STEP 5: CONTENT TYPE                                  │
│                                                                                 │
│  "What type of content?"                                                        │
│                                                                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐        │
│  │   VIDEO   │ │   PHOTO   │ │    PDF    │ │   TEXT    │ │    URL    │        │
│  │           │ │           │ │           │ │           │ │           │        │
│  │  Record   │ │  Capture  │ │  Upload   │ │  Type or  │ │  Paste a  │        │
│  │  or       │ │  or       │ │  manual   │ │  paste    │ │  link     │        │
│  │  upload   │ │  upload   │ │  or doc   │ │  text     │ │           │        │
│  │           │ │           │ │           │ │           │ │           │        │
│  │    🎬     │ │    📷     │ │    📄     │ │    ✍️     │ │    🔗     │        │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘        │
│                                                                                 │
│  Note: Options shown depend on Step 4 selection                                 │
│  - "I have content" → Shows upload variants                                     │
│  - "Create now" → Shows capture/record/write variants                           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         STEP 6: CONTENT CREATION                                │
│                                                                                 │
│  [DELEGATES TO ItemCapture COMPONENT]                                           │
│                                                                                 │
│  Presents appropriate interface based on content type selection:                │
│                                                                                 │
│  • VIDEO  → Camera viewfinder + record, OR file picker                          │
│  • PHOTO  → Camera viewfinder + capture, OR file picker                         │
│  • PDF    → File picker with drag-and-drop                                      │
│  • TEXT   → Markdown editor with formatting toolbar                             │
│  • URL    → URL input field with preview fetch and validation                   │
│                                                                                 │
│  Optional: Light editing (crop, rotate, trim) for media content                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          STEP 7: PREVIEW & SAVE                                 │
│                                                                                 │
│  "Here's what guests will see"                                                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │                    [Content Preview]                            │   │   │
│  │   │                                                                 │   │   │
│  │   │         Video thumbnail / Photo / PDF preview / Text            │   │   │
│  │   │                                                                 │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │   Item: Kitchen - Dishwasher                                            │   │
│  │   Type: Appliance                                                       │   │
│  │   Content: 1 video (0:45)                                               │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌────────────────┐  ┌────────────────┐                                        │
│  │   Edit Name    │  │    Retake      │                                        │
│  └────────────────┘  └────────────────┘                                        │
│                                                                                 │
│                       ┌────────────────────┐                                    │
│                       │     SAVE ITEM      │                                    │
│                       └────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            STEP 8: WHAT'S NEXT?                                 │
│                                                                                 │
│  "Item saved! ✓"                                                                │
│                                                                                 │
│  "What would you like to do next?"                                              │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     ADD MORE TO THIS ITEM                               │   │
│  │                                                                         │   │
│  │  Add another video, photo, or text to "Kitchen - Dishwasher"            │   │
│  │                                                                         │   │
│  │  Example: Add a photo showing detergent compartment location            │   │
│  │                                                                         │   │
│  │                              → Returns to STEP 5                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       TAG A NEW ITEM                                    │   │
│  │                                                                         │   │
│  │  Start fresh with a different item                                      │   │
│  │                                                                         │   │
│  │  Example: Now tag the dryer                                             │   │
│  │                                                                         │   │
│  │                              → Returns to STEP 1                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          I'M DONE                                       │   │
│  │                                                                         │   │
│  │  Finish and print QR codes                                              │   │
│  │                                                                         │   │
│  │                              → Goes to STEP 9                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Session Progress: [████████░░] 4 items created                                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             │ (Loop back to Step 1 or 5)
                                             │ (Or continue to Step 9)
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       STEP 9: REVIEW & PRINT QR CODES                           │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  📋 YOUR ITEMS                                              [View All]  │   │
│  │                                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  This session (4 new items):                                            │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                         │   │
│  │  ┌──────┐                                                               │   │
│  │  │ ▶️   │  Kitchen - Dishwasher          1 video         [Edit] [×]    │   │
│  │  └──────┘                                                               │   │
│  │  ┌──────┐                                                               │   │
│  │  │ 🔥   │  Kitchen - Stove               2 photos, 1 text [Edit] [×]   │   │
│  │  └──────┘                                                               │   │
│  │  ┌──────┐                                                               │   │
│  │  │ ▶️   │  Laundry - Washer              1 video, 1 photo [Edit] [×]   │   │
│  │  └──────┘                                                               │   │
│  │  ┌──────┐                                                               │   │
│  │  │ 🔗   │  Laundry - Dryer               1 URL            [Edit] [×]   │   │
│  │  └──────┘                                                               │   │
│  │                                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  Previously created (3 items):                      [Show/Hide]         │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                         │   │
│  │  ┌──────┐                                                               │   │
│  │  │ 📶   │  General - WiFi                1 text          [Edit] [×]    │   │
│  │  └──────┘                                                               │   │
│  │  ┌──────┐                                                               │   │
│  │  │ 🌡️   │  Living Room - Thermostat      1 video         [Edit] [×]    │   │
│  │  └──────┘                                                               │   │
│  │  ┌──────┐                                                               │   │
│  │  │ 🚿   │  Bathroom - Shower             2 photos        [Edit] [×]    │   │
│  │  └──────┘                                                               │   │
│  │                                                                         │   │
│  │  Total: 7 items (4 new + 3 existing)                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  "What would you like to do?"                                                   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         PRINT QR CODES                                  │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────────────┐   │   │
│  │  │    GENERATE PDF         │  │       PRINT DIRECTLY                │   │   │
│  │  │                         │  │                                     │   │   │
│  │  │  Download a PDF with    │  │  Send to connected printer          │   │   │
│  │  │  all QR codes to print  │  │  (if available)                     │   │   │
│  │  │                         │  │                                     │   │   │
│  │  │  ⭐ Recommended         │  │                                     │   │   │
│  │  └─────────────────────────┘  └─────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  Print options: ○ All items (7)  ○ New items only (4)  ○ Select items  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      JUST REVIEW / DONE FOR NOW                         │   │
│  │                                                                         │   │
│  │  Return to dashboard without printing. You can print anytime later.     │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Features & Acceptance Criteria

### Feature 1: Room Selection

**User Story:** As a property owner, I want to specify which room I'm tagging an item in so my items are organized by location.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 1.1 | User sees a grid of room options with icons | Visual recognition |
| 1.2 | Room options include: Kitchen, Laundry, Bedroom, Bathroom, Living Room, Garage, Outdoor, General, Other | Cover common rental rooms |
| 1.3 | "General" option available for property-wide info (WiFi, rules) | Not all items belong to a room |
| 1.4 | "Other" option with free-text input for unlisted rooms | Flexibility |
| 1.5 | Selection persists if user goes back | Don't lose progress |
| 1.6 | Large touch targets (min 48x48px) for mobile | Mobile-first design |

---

### Feature 2: Item Type Selection

**User Story:** As a property owner, I want to categorize my item so the app can suggest relevant options.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 2.1 | Three item type options: Appliance, Room Item, General Information | Cover all use cases |
| 2.2 | Each option has clear description and examples | Reduce confusion |
| 2.3 | Selection determines suggestions in next step | Smart defaults |
| 2.4 | Skip this step if "General" room was selected (auto-select General Info) | Reduce friction |

**Item Type Definitions:**

| Type | Description | Examples |
|------|-------------|----------|
| **Appliance** | Large devices with controls, settings, or operating instructions that guests need to understand | Washer, Dryer, Dishwasher, Oven, Thermostat, TV |
| **Room Item** | Smaller items, fixtures, or features that may need explanation | Safe, Blinds, Shower controls, Light switches, Fireplace |
| **General Information** | Property-wide information not tied to a specific item | WiFi password, House rules, Check-out instructions, Emergency contacts |

---

### Feature 3: Specific Item Selection with Smart Suggestions

**User Story:** As a property owner, I want relevant item suggestions based on my room selection so I can quickly select common items.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 3.1 | Item suggestions based on Room + Item Type combination | Reduce typing |
| 3.2 | Suggestions displayed as selectable buttons/cards | Quick selection |
| 3.3 | "Something else" / custom option always available | Flexibility |
| 3.4 | Item name auto-generated as "Room - Item" (e.g., "Kitchen - Dishwasher") | Consistent naming |
| 3.5 | Item name is editable before proceeding | User control |
| 3.6 | Previously created items in same room shown (grayed out) to prevent duplicates | Avoid confusion |

**Suggestions Matrix:**

| Room | Appliances | Room Items | General Info |
|------|------------|------------|--------------|
| **Kitchen** | Stove/Oven, Refrigerator, Microwave, Dishwasher, Garbage Disposal, Coffee Maker, Toaster Oven | Pantry, Cabinets, Sink/Faucet, Ice Maker | Trash & Recycling |
| **Laundry** | Washer, Dryer, Washer/Dryer Combo | Ironing Board, Drying Rack, Laundry Supplies | Detergent Instructions |
| **Bedroom** | TV, AC Unit, Space Heater, Fan | Safe/Lockbox, Closet, Blinds/Curtains, Alarm Clock | — |
| **Bathroom** | — | Shower, Bathtub, Toilet, Hair Dryer, Towel Warmer | Hot Water Info |
| **Living Room** | TV, Sound System, Fireplace, AC/Thermostat, Gaming Console | Blinds/Curtains, Streaming Devices (Roku, Apple TV) | Entertainment Guide |
| **Garage** | Garage Door Opener, EV Charger | Storage, Tools, Bikes | Parking Info |
| **Outdoor** | Pool/Spa, Hot Tub, Grill/BBQ, Outdoor Heater | Gate, Lighting, Sprinklers | Pool Rules, Grill Safety |
| **General** | Security System, Smart Home Hub, Water Heater, HVAC | — | WiFi, Check-in, Check-out, House Rules, Emergency Contacts, Local Recommendations |

---

### Feature 4: Content Source Selection

**User Story:** As a property owner, I want to indicate whether I have existing content or need to create new content so the app presents the right interface.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 4.1 | Two clear options: "I have content" vs "Create now" | Binary choice simplifies flow |
| 4.2 | Each option has descriptive text explaining what it means | Reduce confusion |
| 4.3 | Selection determines which content type options appear next | Contextual UI |

**Behavior by Selection:**

| Selection | Next Step Shows |
|-----------|-----------------|
| "I have content" | Upload-focused options: Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL |
| "Create now" | Capture-focused options: Record Video, Take Photo, Write Text |

---

### Feature 5: Content Type Selection

**User Story:** As a property owner, I want to choose what type of content I'm adding so the app presents the appropriate creation/upload interface.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 5.1 | Content type options displayed as large, tappable cards with icons | Mobile-friendly |
| 5.2 | Options shown depend on content source selection (Feature 4) | Contextual UI |
| 5.3 | Each option has clear icon and label | Visual recognition |
| 5.4 | User can go back and change content source | Flexibility |

**Content Types:**

| Type | Icon | Create Now | Upload Existing | Description |
|------|------|------------|-----------------|-------------|
| **Video** | 🎬 | Record with camera | Upload MP4, MOV, WEBM | Show how something works |
| **Photo** | 📷 | Capture with camera | Upload JPG, PNG, HEIC | Show settings, labels, controls |
| **PDF** | 📄 | — | Upload PDF | Manuals, official documentation |
| **Text** | ✍️ | Type in editor | Paste text | Written instructions, notes |
| **URL** | 🔗 | — | Paste link | Link to existing resource |

---

### Feature 6: URL Content with Preview

**User Story:** As a property owner, I want to paste a URL to existing content and see a preview to confirm it works.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 6.1 | URL input field with paste button | Easy input |
| 6.2 | URL validation on input (valid URL format) | Catch errors early |
| 6.3 | Automatic preview fetch when valid URL entered | Show what guests will see |
| 6.4 | Preview shows: page title, description, thumbnail (if available) | Confirm correct link |
| 6.5 | Clear error message if URL is unreachable or invalid | Help user fix issues |
| 6.6 | Warning if URL returns error (404, 500, etc.) | Prevent broken links |
| 6.7 | User can proceed even if preview fails (with warning) | Don't block on preview |

**URL Preview States:**

| State | Display |
|-------|---------|
| Empty | Input field with placeholder "Paste URL here" |
| Loading | Spinner with "Fetching preview..." |
| Success | Title, description, thumbnail from Open Graph or meta tags |
| Partial | Title only if other metadata unavailable |
| Error | "Could not load preview. The URL may be incorrect or the site may be unavailable." |

---

### Feature 7: Content Preview & Save

**User Story:** As a property owner, I want to preview my content before saving to ensure it looks correct.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 7.1 | Full preview of content as guests will see it | Quality assurance |
| 7.2 | Item name displayed prominently | Confirm naming |
| 7.3 | "Edit Name" option to modify item name | Last-minute corrections |
| 7.4 | "Retake" / "Replace" option to redo content | Error recovery |
| 7.5 | Clear "Save Item" call-to-action button | Explicit save action |
| 7.6 | Success confirmation when saved | Feedback |
| 7.7 | Content summary: type, duration (video), count (photos) | Information clarity |

---

### Feature 8: Multi-Content Items

**User Story:** As a property owner, I want to add multiple pieces of content to a single item so I can provide comprehensive instructions.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 8.1 | "Add more to this item" option after saving content | Support rich items |
| 8.2 | Returns to content type selection (Step 5) | Consistent flow |
| 8.3 | Item card shows all content pieces with thumbnails | Visual summary |
| 8.4 | Content can be reordered within item | Control presentation |
| 8.5 | Individual content pieces can be removed | Edit flexibility |
| 8.6 | No limit on content pieces per item (reasonable max: 10) | Flexibility with guardrails |

**Example Multi-Content Item:**

```
Kitchen - Dishwasher
├── Video: "How to run a cycle" (1:23)
├── Photo: "Detergent compartment"
├── Photo: "Control panel settings"
└── Text: "Use pods only, no liquid detergent"
```

---

### Feature 9: Session Management

**User Story:** As a property owner, I want to create multiple items in one session and see my progress.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 9.1 | Session progress indicator shows items created count | Progress awareness |
| 9.2 | "Tag a new item" returns to Step 1 (room selection) | Clear restart point |
| 9.3 | All session items preserved until "I'm done" | No accidental loss |
| 9.4 | Can continue session after creating each item | Efficient workflow |
| 9.5 | "I'm done" option always visible after first item saved | Clear exit path |

---

### Feature 10: Session Summary, Item Review & QR Generation

**User Story:** As a property owner, I want to review all my items (both new and previously created) and optionally generate QR codes for printing.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 10.1 | Summary screen shows items created in current session | Session awareness |
| 10.2 | Summary screen also shows previously created items (collapsible) | Complete view |
| 10.3 | Each item shows: thumbnail, name, content summary | At-a-glance info |
| 10.4 | Each item has "Edit" option to modify | Last-minute changes |
| 10.5 | Each item has "Remove" option to delete | Cleanup |
| 10.6 | "View All" link to full item management dashboard | Access all items |
| 10.7 | Clear separation between "new this session" and "previously created" | Clarity |
| 10.8 | **Print options section** with "Generate PDF" and "Print Directly" | Primary output |
| 10.9 | Print scope selector: "All items" / "New items only" / "Select items" | Flexibility |
| 10.10 | **"Just Review / Done for Now"** option to exit without printing | No pressure to print |
| 10.11 | PDF includes item name below each QR code | Identification |
| 10.12 | PDF formatted for standard paper sizes (Letter, A4) | Printability |
| 10.13 | User can return to dashboard and print later anytime | Flexibility |

**Print Scope Options:**

| Option | Behavior |
|--------|----------|
| All items | Generate QR codes for all items (new + existing) |
| New items only | Generate QR codes only for items created this session |
| Select items | Show checkboxes, user picks which items to include |

---

## Technical Requirements

### Workflow State Interface

```typescript
interface WorkflowSession {
  id: string;                          // Session UUID
  startedAt: Date;                     // Session start time
  currentStep: WorkflowStep;           // Current position in flow
  items: SessionItem[];                // Items created this session
  currentItem: CurrentItemState | null; // Item being created
}

type WorkflowStep = 
  | 'room-selection'
  | 'item-type-selection'
  | 'specific-item-selection'
  | 'content-source-selection'
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';

interface CurrentItemState {
  room: RoomType;
  itemType: ItemType;
  specificItem: string;              // Selected or custom item name
  itemName: string;                  // Final display name
  contentSource: 'existing' | 'create-new';
  contentType: ContentType | null;
  content: ContentPiece[];           // Array for multi-content items
}

interface SessionItem {
  id: string;
  name: string;
  room: RoomType;
  itemType: ItemType;
  content: ContentPiece[];
  createdAt: Date;
  qrCodeUrl?: string;                // Generated after save
}

interface ContentPiece {
  id: string;
  type: ContentType;
  data: ContentData;
  order: number;
  thumbnail?: Blob;
}

type RoomType = 
  | 'kitchen' | 'laundry' | 'bedroom' | 'bathroom' 
  | 'living-room' | 'garage' | 'outdoor' | 'general' | 'other';

type ItemType = 'appliance' | 'room-item' | 'general-info';

type ContentType = 'video' | 'photo' | 'pdf' | 'text' | 'url';

type ContentData = 
  | { type: 'video'; file: Blob; duration: number; }
  | { type: 'photo'; file: Blob; dimensions: { width: number; height: number; }; }
  | { type: 'pdf'; file: Blob; pageCount: number; }
  | { type: 'text'; content: string; }
  | { type: 'url'; url: string; preview?: UrlPreview; };

interface UrlPreview {
  title?: string;
  description?: string;
  thumbnail?: string;
  fetchedAt: Date;
  error?: string;
}
```

### Workflow Component Interface

```typescript
interface ItemCreationWorkflowProps {
  /** Called when user completes session (with or without printing) */
  onSessionComplete: (session: CompletedSession) => void;
  
  /** Called when user exits mid-session (before completing any items) */
  onSessionExit: (session: PartialSession) => void;
  
  /** Called when user requests PDF generation */
  onGeneratePDF: (items: SessionItem[], scope: PrintScope) => Promise<Blob>;
  
  /** Called when user requests direct print */
  onPrintDirect: (items: SessionItem[], scope: PrintScope) => Promise<void>;
  
  /** Called to fetch existing items for display in summary */
  onFetchExistingItems: () => Promise<SessionItem[]>;
  
  /** Optional: Pre-populate with existing session (resume) */
  initialSession?: WorkflowSession;
  
  /** Optional: Configuration overrides */
  config?: WorkflowConfig;
}

type PrintScope = 
  | { type: 'all' }
  | { type: 'new-only' }
  | { type: 'selected'; itemIds: string[] };

interface WorkflowConfig {
  /** Available rooms (default: all standard rooms) */
  rooms?: RoomType[];
  
  /** Custom item suggestions by room/type */
  customSuggestions?: Record<RoomType, Record<ItemType, string[]>>;
  
  /** Maximum items per session (default: 50) */
  maxItemsPerSession?: number;
  
  /** Enable URL preview fetching (default: true) */
  enableUrlPreview?: boolean;
  
  /** Show existing items in summary (default: true) */
  showExistingItems?: boolean;
}

interface CompletedSession {
  id: string;
  newItems: SessionItem[];        // Items created this session
  existingItems: SessionItem[];   // Previously created items (for reference)
  completedAt: Date;
  printAction: 'pdf' | 'direct' | 'skipped';  // What user chose
  printScope?: PrintScope;        // If they printed, which items
}

interface PartialSession {
  id: string;
  items: SessionItem[];
  currentItem?: CurrentItemState;
  exitedAt: Date;
  step: WorkflowStep;
}
```

### URL Preview Service Interface

```typescript
interface UrlPreviewService {
  /** Fetch preview metadata for a URL */
  fetchPreview(url: string): Promise<UrlPreviewResult>;
}

interface UrlPreviewResult {
  success: boolean;
  preview?: UrlPreview;
  error?: {
    code: 'INVALID_URL' | 'UNREACHABLE' | 'TIMEOUT' | 'PARSE_ERROR';
    message: string;
  };
}
```

---

## UI/UX Requirements

### Mobile-First Design

| Requirement | Specification |
|-------------|---------------|
| Touch targets | Minimum 48x48px for all interactive elements |
| Font sizes | Minimum 16px for body text, 14px for secondary |
| Button sizing | Full-width buttons on mobile, comfortable padding |
| Spacing | Generous whitespace between sections |
| Scroll | Avoid horizontal scroll; vertical scroll for long content |

### Navigation

| Requirement | Specification |
|-------------|---------------|
| Back navigation | Always available (except first step) |
| Progress indication | Step indicator or progress bar |
| Cancel/Exit | Always accessible with confirmation if items unsaved |
| Skip | Not applicable (all steps required) |

### Feedback

| Event | Feedback Type |
|-------|---------------|
| Step transition | Smooth animation/transition |
| Item saved | Success toast/message |
| Error | Inline error message with recovery guidance |
| Loading | Spinner or skeleton UI |
| URL preview loading | Shimmer placeholder |

### Accessibility

| Requirement | Specification |
|-------------|---------------|
| Screen readers | All elements properly labeled |
| Keyboard navigation | Full keyboard support for desktop |
| Color contrast | WCAG AA minimum |
| Focus indicators | Visible focus states |
| Error messages | Associated with form fields |

---

## Edge Cases & Error Handling

### Edge Cases

| Scenario | Handling |
|----------|----------|
| User refreshes mid-session | Prompt to restore session (if draft auto-save enabled) |
| Network lost during URL preview | Show error, allow proceed without preview |
| Camera permission denied | Fall back to upload-only options |
| Very long item name entered | Truncate with ellipsis in UI, full name in detail view |
| Duplicate item name in session | Allow (user may have multiple similar items) |
| User creates 0 items and clicks "I'm done" | Show prompt "You haven't created any items yet" |

### Error Messages

| Error | Message | Recovery |
|-------|---------|----------|
| URL invalid | "This doesn't look like a valid URL. Please check and try again." | Auto-focus input |
| URL unreachable | "We couldn't reach this URL. It may be incorrect or the site may be down." | Allow retry or proceed anyway |
| URL preview timeout | "Preview is taking too long. You can proceed without a preview." | Allow proceed |
| No content added | "Please add at least one piece of content before saving." | Stay on content step |
| Session save failed | "We couldn't save your item. Please try again." | Retry button |

---

## Open Questions

1. **Session persistence:** Should incomplete sessions be auto-saved to localStorage for recovery if browser closes?

2. **Offline support:** Should the workflow work offline with sync when connection returns?

3. **QR code format:** What information should the QR code encode? Direct URL to content? Short code that resolves server-side?

4. **PDF template:** Should users be able to choose QR code layout (grid, list, labels only)?

5. **Duplicate item detection:** Should we warn if user creates an item with same name as existing item (from previous sessions)?

6. **Multi-property support:** Should room selection be scoped to a specific property, or is that handled elsewhere?

7. **Item limits:** Should there be a maximum number of items per property? Per session?

---

## Implementation Notes

### Relationship to ItemCapture Component

This workflow **orchestrates** the ItemCapture component. The workflow handles:

- Step navigation and flow control
- Room and item selection
- Session state management
- Multi-item session tracking
- QR code generation trigger

The ItemCapture component handles:

- Actual media capture (camera, microphone)
- File upload
- Content editing (crop, trim, rotate)
- Text/markdown editing
- Preview generation

### Integration Point

```tsx
// Step 6 (Content Creation) delegates to ItemCapture
function ContentCreationStep({ contentType, onContentReady }) {
  return (
    <ItemCapture
      // Configure based on workflow selections
      config={{
        initialMode: contentType, // 'video', 'photo', 'text', etc.
        allowModeSwitch: false,   // Lock to selected type
      }}
      onComplete={(record) => {
        // Extract content from ItemRecord
        onContentReady(record.media[0] || record.instructions);
      }}
      onCancel={() => {
        // Return to content type selection
      }}
    />
  );
}
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-05 | — | Initial draft based on user journey requirements |
