# PRD: Localization Epic 4 - Guest Experience

**Document ID:** PRD_L10N_Epic4
**Created:** 2026-01-17
**Last Modified:** 2026-01-17
**Status:** Draft
**Epic Size:** M (Medium)
**Priority:** P1 - High
**Depends On:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## 1. Executive Summary

This epic focuses on the guest-facing experience when viewing QR code content. Guests should see content in their preferred language automatically, with the option to view the original content if translations seem incorrect. The experience must be seamless, fast, and require no account or login.

### Key User Flow
```
Guest scans QR code
    │
    ▼
Browser language detected (e.g., Spanish)
    │
    ▼
Content displayed in Spanish (if available)
    │
    ├── Translation available ──► Show translated content
    │                              + "View original" option
    │
    └── Translation not available ──► Show original content
                                       + language indicator
```

---

## 2. Goals & Objectives

### Primary Goals
1. Automatically detect guest's preferred language
2. Display translated content when available
3. Provide clear option to view original language content
4. Handle missing translations gracefully
5. Allow guests to switch languages manually

### Success Criteria
- Language detection works for 95%+ of guests
- Translated content loads within 200ms (same as untranslated)
- "View original" toggle works instantly
- No broken layouts in any language
- Language preference persists across QR scans

---

## 3. User Stories

### US-1: Automatic Language Detection
**As a** guest scanning a QR code,
**I want** the content to appear in my phone's language,
**So that** I can understand the instructions without changing settings.

**Acceptance Criteria:**
- Browser's Accept-Language header is detected
- Content displays in detected language if translation exists
- Falls back to original content if no translation

### US-2: View Original Language
**As a** guest viewing translated content,
**I want** to see the original language version,
**So that** I can verify the translation if something seems wrong.

**Acceptance Criteria:**
- "View in original" button/link is visible
- Clicking shows original content immediately
- Can toggle back to translation
- Original language is labeled (e.g., "Original: French")

### US-3: Manual Language Selection
**As a** guest who prefers a different language than my browser,
**I want** to choose my preferred language,
**So that** I can view content in my native language.

**Acceptance Criteria:**
- Language selector is accessible but not intrusive
- Shows all 6 supported languages
- Selection is remembered for future scans
- Page updates without full reload

### US-4: Missing Translation Handling
**As a** guest viewing content not yet translated to my language,
**I want** to understand what I'm seeing,
**So that** I'm not confused by foreign language content.

**Acceptance Criteria:**
- Clear indicator that content is in original language
- Message explaining translation is unavailable
- Option to request translation (future feature)

---

## 4. Functional Requirements

### 4.1 Language Detection

#### FR-1.1: Detection Priority
Detect guest language in this order:
1. **Cookie** - `FAQBNB_GUEST_LANG` (if previously set)
2. **URL Parameter** - `?lang=fr` (for sharing links)
3. **Accept-Language Header** - Browser preference
4. **Default** - Original content language (no translation)

#### FR-1.2: Language Mapping
Map Accept-Language values to supported languages:
```typescript
const languageMapping = {
  'en': 'en', 'en-US': 'en', 'en-GB': 'en',
  'fr': 'fr', 'fr-FR': 'fr', 'fr-CA': 'fr',
  'es': 'es', 'es-ES': 'es', 'es-MX': 'es',
  'de': 'de', 'de-DE': 'de', 'de-AT': 'de',
  'nl': 'nl', 'nl-NL': 'nl', 'nl-BE': 'nl',
  'it': 'it', 'it-IT': 'it'
};

function detectLanguage(acceptLanguage: string): string {
  // Parse Accept-Language header
  // Return first matching supported language
  // Default to 'en' if no match
}
```

#### FR-1.3: Detection in Middleware
Detect language in Next.js middleware and pass to page:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const lang = detectGuestLanguage(request);
  // Set header or cookie for downstream use
}
```

### 4.2 Content Retrieval

#### FR-2.1: Translation Lookup
When fetching content for guest view:
```sql
-- Get item with translation
SELECT
  i.id,
  i.public_id,
  i.source_language,
  COALESCE(it.name, i.name) as name,
  COALESCE(it.description, i.description) as description,
  CASE WHEN it.id IS NOT NULL THEN true ELSE false END as is_translated
FROM items i
LEFT JOIN item_translations it
  ON it.item_id = i.id
  AND it.language = :guestLanguage
  AND it.translation_status = 'completed'
WHERE i.public_id = :publicId;
```

#### FR-2.2: Fallback Strategy
```
1. Try guest's preferred language
   └── Found ──► Use translation
   └── Not found ──► Try English
                     └── Found ──► Use English translation
                     └── Not found ──► Use original content
```

#### FR-2.3: API Response Format
```typescript
interface GuestContentResponse {
  item: {
    id: string;
    name: string;
    description: string;
    displayLanguage: string;      // Language being shown
    sourceLanguage: string;       // Original content language
    isTranslated: boolean;        // Whether showing translation
    translationAvailable: boolean;// Whether translation exists
  };
  articles: Array<{
    id: string;
    title: string;
    description: string;
    displayLanguage: string;
    sourceLanguage: string;
    isTranslated: boolean;
  }>;
  links: Array<{
    id: string;
    title: string;
    url: string;
    displayLanguage: string;
    isTranslated: boolean;
  }>;
  tags: Array<{
    key: string;
    displayValue: string;
    isTranslated: boolean;
  }>;
}
```

### 4.3 Guest UI Components

#### FR-3.1: Language Indicator
Show current display language:
```tsx
<LanguageIndicator
  currentLanguage="fr"
  isTranslated={true}
  sourceLanguage="en"
/>

// Renders:
// 🇫🇷 Francais (translated from English)
```

#### FR-3.2: Language Switcher (Guest)
Compact language selector for guests:
```tsx
<GuestLanguageSwitcher
  currentLanguage="fr"
  supportedLanguages={['en', 'fr', 'es', 'de', 'nl', 'it']}
  availableTranslations={['en', 'fr', 'es']} // Which are actually translated
  onLanguageChange={(lang) => setLanguage(lang)}
/>
```

Visual design:
- Dropdown or horizontal pill selector
- Show which languages have translations
- Gray out languages without translations (but still selectable)
- Current language highlighted

#### FR-3.3: View Original Toggle
Toggle to switch between translation and original:
```tsx
<ViewOriginalToggle
  isShowingOriginal={false}
  sourceLanguage="en"
  onToggle={() => setShowOriginal(!showOriginal)}
/>

// When showing translation:
// [View in original (English)]

// When showing original:
// [View translation]
```

#### FR-3.4: Translation Notice Banner
When showing translated content:
```tsx
<TranslationBanner
  sourceLanguage="en"
  displayLanguage="fr"
  onViewOriginal={() => setShowOriginal(true)}
/>

// Renders:
// ┌─────────────────────────────────────────────────────┐
// │ 🌐 Translated from English · View original         │
// └─────────────────────────────────────────────────────┘
```

When translation is missing:
```tsx
<MissingTranslationBanner
  sourceLanguage="en"
  requestedLanguage="fr"
/>

// Renders:
// ┌─────────────────────────────────────────────────────┐
// │ ℹ️ French translation not available.               │
// │    Showing content in English.                     │
// └─────────────────────────────────────────────────────┘
```

### 4.4 URL Handling

#### FR-4.1: Shareable Language URLs
Support language parameter in URLs:
```
/items/abc-123?lang=fr
```

When shared, recipient sees content in that language.

#### FR-4.2: No Language in Path
Do NOT use language in URL path (e.g., `/fr/items/abc-123`).
Reason: QR codes are already printed; changing URLs would break them.

#### FR-4.3: Canonical URLs
Canonical URL should not include language parameter:
```html
<link rel="canonical" href="https://faqbnb.com/items/abc-123" />
```

### 4.5 Language Persistence

#### FR-5.1: Cookie Storage
Store guest language preference:
```typescript
// Set cookie on language selection
document.cookie = `FAQBNB_GUEST_LANG=${lang}; max-age=31536000; path=/`;

// Cookie: FAQBNB_GUEST_LANG=fr
// Expires: 1 year
```

#### FR-5.2: Preference Application
On subsequent visits:
1. Read cookie
2. Apply language preference
3. Can be overridden by URL parameter

### 4.6 Translation Availability Indicators

#### FR-6.1: Per-Language Status
Show which languages have translations:
```typescript
interface TranslationAvailability {
  [language: string]: {
    available: boolean;
    complete: boolean; // All fields translated
    partial: boolean;  // Some fields translated
  };
}
```

#### FR-6.2: Visual Indicator
In language selector:
```
🇬🇧 English (Original)
🇫🇷 Francais ✓
🇪🇸 Espanol ✓
🇩🇪 Deutsch ○ (not available)
🇳🇱 Nederlands ✓
🇮🇹 Italiano ○ (not available)
```

---

## 5. Page Components

### 5.1 Guest Item Page
**Route:** `/items/[publicId]`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [🌐 FR ▼]                              [Company Logo]   │
├─────────────────────────────────────────────────────────┤
│ 🌐 Translated from English · View original             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Item Image/Icon]                                      │
│                                                         │
│  Machine a laver Samsung                                │
│  ─────────────────────────                              │
│  Description du produit...                              │
│                                                         │
│  Tags: #Cuisine · Appareil                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Guides                                                 │
│  ───────                                                │
│  📖 Comment utiliser                                    │
│  🧹 Nettoyage et entretien                             │
│  ⚠️ Depannage                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Guest Article Page
**Route:** `/items/[publicId]/articles/[articleId]`

Same language controls, showing translated article content.

---

## 6. API Endpoints

### 6.1 Get Item for Guest
**Endpoint:** `GET /api/public/items/[publicId]`

**Query Parameters:**
- `lang` (optional): Preferred language code

**Response:** See FR-2.3 for format

### 6.2 Get Available Languages
**Endpoint:** `GET /api/public/items/[publicId]/languages`

**Response:**
```json
{
  "sourceLanguage": "en",
  "availableTranslations": ["fr", "es", "nl"],
  "pendingTranslations": ["de"],
  "unavailableTranslations": ["it"]
}
```

---

## 7. Non-Functional Requirements

### NFR-1: Performance
- Language detection: < 10ms
- Content with translation lookup: < 200ms total response
- Language switch: < 100ms (client-side data already loaded)

### NFR-2: Accessibility
- Language indicator readable by screen readers
- Language names in their native form + English
- Toggle buttons have clear focus states

### NFR-3: Mobile Experience
- Language selector works on small screens
- Translation banner doesn't obscure content
- Touch-friendly toggle buttons

### NFR-4: Offline Support
- If translation is cached, show even offline
- Clear messaging when content unavailable offline

---

## 8. Design Specifications

### 8.1 Translation Banner
- Background: Light blue (#E3F2FD)
- Icon: 🌐 or globe icon
- Text: 14px, gray (#666)
- Link: Blue, underlined
- Height: 40px
- Dismissible: No (always show context)

### 8.2 Language Selector
- Dropdown style for space efficiency
- Flag emoji + native language name
- Current language has checkmark
- Unavailable languages are grayed

### 8.3 View Original Toggle
- Secondary button style
- Icon: swap/translate icon
- Clear label indicating action

---

## 9. Acceptance Criteria

### AC-1: Language Detection
- [ ] Browser language detected correctly
- [ ] Cookie preference overrides browser
- [ ] URL parameter overrides cookie
- [ ] Fallback to original works

### AC-2: Content Display
- [ ] Translated content shows in detected language
- [ ] Original content shows when no translation
- [ ] All content types translated (item, articles, links, tags)

### AC-3: View Original
- [ ] Toggle visible on translated content
- [ ] Toggle switches content instantly
- [ ] Original language is labeled
- [ ] Can toggle back to translation

### AC-4: Language Switcher
- [ ] Shows all 6 languages
- [ ] Indicates available translations
- [ ] Selection updates content
- [ ] Selection persists in cookie

### AC-5: Missing Translation Handling
- [ ] Banner shows when translation unavailable
- [ ] Clear messaging about content language
- [ ] Graceful degradation

### AC-6: Performance
- [ ] No additional latency for translated content
- [ ] Language switch is instant
- [ ] Works well on mobile networks

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation quality confuses guests | Medium | Medium | "View original" always available |
| Browser detection fails | Low | Low | Fallback to original, manual selection |
| Performance impact | Low | Medium | Pre-fetched translations, efficient queries |
| Cookie blocked | Low | Low | Re-detect on each visit |

---

## 11. Dependencies

### Upstream
- Epic 1: Foundation (i18n framework, database)
- Epic 3: Dynamic Content Translation (translations must exist)

### Downstream
- None (this is guest-facing final output)

---

## 12. Out of Scope

- Guest accounts or preferences beyond cookie
- Translation requests by guests
- Translation voting/feedback
- RTL language display
- Audio/voice translation
- Automatic QR code language routing

---

## 13. Future Considerations

### Phase 2 Features (Not in this epic)
- Guest can request missing translation
- Translation quality rating
- Preferred language in QR code URL
- Location-based language detection

---

## 14. Appendix

### A. Language Display Names
| Code | Native Name | English Name |
|------|-------------|--------------|
| en | English | English |
| fr | Francais | French |
| es | Espanol | Spanish |
| de | Deutsch | German |
| nl | Nederlands | Dutch |
| it | Italiano | Italian |

### B. Sample Cookie
```
Name: FAQBNB_GUEST_LANG
Value: fr
Domain: .faqbnb.com
Path: /
Expires: (1 year from now)
Secure: true
SameSite: Lax
```

### C. Accept-Language Header Examples
```
Accept-Language: fr-FR,fr;q=0.9,en;q=0.8
Accept-Language: de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7
Accept-Language: es-MX,es;q=0.9,en;q=0.8
Accept-Language: en-US,en;q=0.9
```
