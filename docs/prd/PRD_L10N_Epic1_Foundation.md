# PRD: Localization Epic 1 - Foundation

**Document ID:** PRD_L10N_Epic1
**Created:** 2026-01-17
**Last Modified:** 2026-01-17
**Status:** Draft
**Epic Size:** M (Medium)
**Priority:** P0 - Critical Path (Blocks all other L10N epics)

---

## 1. Executive Summary

This epic establishes the foundational infrastructure required for multi-language support across the FAQBNB application. It includes database schema changes, i18n framework integration, translation service setup, and the core language switching mechanism.

### Supported Languages
- English (en) - Default
- French (fr)
- Spanish (es)
- German (de)
- Dutch (nl)
- Italian (it)

---

## 2. Goals & Objectives

### Primary Goals
1. Create database schema to store translations for user-generated content
2. Integrate an i18n framework (next-intl) for static UI string management
3. Set up AI-powered translation service (Claude/OpenAI) for automated translations
4. Implement background processing mechanism for asynchronous translation jobs
5. Create language detection and switching infrastructure

### Success Criteria
- All translation tables created with proper RLS policies
- i18n framework functional with sample translations
- Translation API successfully translates test content to all 6 languages
- Background job processes translations without blocking user actions
- Language switcher component functional and persists preference

---

## 3. Functional Requirements

### 3.1 Database Schema

#### FR-1.1: Translation Tables
Create the following tables to store translated content:

**article_translations**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| article_id | UUID | FK to item_articles.id (CASCADE DELETE) |
| language | VARCHAR(5) | Language code: en, fr, es, de, nl, it |
| title | VARCHAR(255) | Translated title |
| description | TEXT | Translated description |
| translation_status | VARCHAR(20) | pending, processing, completed, failed, manual |
| translated_at | TIMESTAMPTZ | When translation was completed |
| reviewed_by | UUID | FK to users.id (if manually reviewed) |
| created_at | TIMESTAMPTZ | Record creation time |
| updated_at | TIMESTAMPTZ | Last update time |

**Constraints:** UNIQUE(article_id, language)

**item_translations**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| item_id | UUID | FK to items.id (CASCADE DELETE) |
| language | VARCHAR(5) | Language code |
| name | VARCHAR(255) | Translated item name |
| description | TEXT | Translated description |
| translation_status | VARCHAR(20) | Status enum |
| translated_at | TIMESTAMPTZ | Completion timestamp |
| created_at | TIMESTAMPTZ | Record creation time |
| updated_at | TIMESTAMPTZ | Last update time |

**Constraints:** UNIQUE(item_id, language)

**link_translations**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| link_id | UUID | FK to item_links.id (CASCADE DELETE) |
| language | VARCHAR(5) | Language code |
| title | VARCHAR(255) | Translated link title |
| translation_status | VARCHAR(20) | Status enum |
| translated_at | TIMESTAMPTZ | Completion timestamp |
| created_at | TIMESTAMPTZ | Record creation time |
| updated_at | TIMESTAMPTZ | Last update time |

**Constraints:** UNIQUE(link_id, language)

**tag_translations**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tag_key | VARCHAR(100) | Original tag value (e.g., "#room.kitchen") |
| language | VARCHAR(5) | Language code |
| translated_value | VARCHAR(255) | Translated tag display text |
| is_system_tag | BOOLEAN | TRUE for system-defined tags |
| created_at | TIMESTAMPTZ | Record creation time |

**Constraints:** UNIQUE(tag_key, language)

#### FR-1.2: Source Language Tracking
Add `source_language` column to existing tables:

```sql
ALTER TABLE items ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE item_articles ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE item_links ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';
```

#### FR-1.3: User/Account Language Preference
```sql
ALTER TABLE accounts ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
```

#### FR-1.4: Translation Job Queue
**translation_jobs**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| entity_type | VARCHAR(50) | 'article', 'item', 'link', 'tag' |
| entity_id | UUID | ID of the entity to translate |
| source_language | VARCHAR(5) | Source language code |
| target_language | VARCHAR(5) | Target language code |
| status | VARCHAR(20) | queued, processing, completed, failed |
| attempts | INTEGER | Number of retry attempts |
| error_message | TEXT | Error details if failed |
| created_at | TIMESTAMPTZ | When job was queued |
| started_at | TIMESTAMPTZ | When processing began |
| completed_at | TIMESTAMPTZ | When processing finished |

#### FR-1.5: Row Level Security (RLS)
All translation tables must have RLS policies that:
- Allow read access to translations for content the user can access
- Allow write access only for content owned by the user's account
- Allow service role full access for background translation jobs

---

### 3.2 i18n Framework Integration

#### FR-2.1: Framework Selection
Use `next-intl` for Next.js 15 compatibility with App Router.

#### FR-2.2: Locale Configuration
Configure supported locales in `next.config.ts`:
```typescript
const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'];
const defaultLocale = 'en';
```

#### FR-2.3: Translation File Structure
```
/messages
  /en.json      # English (default)
  /fr.json      # French
  /es.json      # Spanish
  /de.json      # German
  /nl.json      # Dutch
  /it.json      # Italian
```

#### FR-2.4: Namespace Organization
Translation keys should be organized by feature area:
```json
{
  "common": { "save": "Save", "cancel": "Cancel", ... },
  "auth": { "signIn": "Sign In", "signOut": "Sign Out", ... },
  "dashboard": { "title": "Dashboard", ... },
  "items": { "createNew": "New QR Code Item", ... },
  "errors": { "required": "This field is required", ... }
}
```

#### FR-2.5: Provider Setup
Create `IntlProvider` wrapper in app layout that:
- Detects user's language preference from:
  1. User account setting (if logged in)
  2. Cookie/localStorage (for persistence)
  3. Browser Accept-Language header
  4. Default to English
- Provides translation functions to all components

---

### 3.3 Translation Service Integration

#### FR-3.1: Translation API Wrapper
Create a service module `/src/lib/translation-service.ts` that:
- Abstracts the AI translation provider (Claude or OpenAI)
- Handles API authentication
- Manages rate limiting
- Provides consistent interface for translation requests

#### FR-3.2: Translation Function Signature
```typescript
interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string; // Optional context for better translation
}

interface TranslationResponse {
  translatedText: string;
  confidence?: number;
  provider: 'claude' | 'openai';
}

async function translateText(request: TranslationRequest): Promise<TranslationResponse>
```

#### FR-3.3: Batch Translation Support
Support translating to multiple languages in a single call:
```typescript
async function translateToAllLanguages(
  text: string,
  sourceLanguage: string,
  excludeLanguages?: string[]
): Promise<Record<string, string>>
```

#### FR-3.4: Translation Context
When translating, include context about:
- Content type (item name, article title, description, tag)
- Domain context (property rental, appliance instructions)
- Character limits if applicable

#### FR-3.5: Error Handling
- Retry failed translations up to 3 times with exponential backoff
- Log all translation failures for monitoring
- Fall back to original text if all retries fail

---

### 3.4 Background Job Processing

#### FR-4.1: Job Queue Mechanism
Implement a database-backed job queue using the `translation_jobs` table:
- Jobs are inserted when content is saved
- A polling mechanism or Supabase realtime subscription processes jobs
- Jobs are processed asynchronously without blocking user actions

#### FR-4.2: Job Processing Options
Evaluate and implement ONE of these approaches:
1. **Supabase Edge Function with pg_cron** - Scheduled polling
2. **API Route with Vercel Cron** - Scheduled HTTP calls
3. **Supabase Realtime + Edge Function** - Event-driven

#### FR-4.3: Job Lifecycle
```
Content Saved → Jobs Queued (5 jobs, one per target language)
                     ↓
              Job Picked Up → Status: 'processing'
                     ↓
         Translation API Called
                     ↓
    Success: Store translation, Status: 'completed'
    Failure: Increment attempts, Status: 'failed' or retry
```

#### FR-4.4: Concurrency Control
- Limit concurrent translation jobs to prevent rate limiting
- Process jobs in FIFO order
- Prevent duplicate processing of same job

---

### 3.5 Language Switching Infrastructure

#### FR-5.1: Language Switcher Component
Create a reusable `LanguageSwitcher` component that:
- Displays current language with flag/icon
- Provides dropdown to select from 6 languages
- Shows language names in their native form (e.g., "Deutsch" not "German")
- Updates user preference in database (if logged in)
- Stores preference in cookie (for guests)
- Triggers page re-render with new language

#### FR-5.2: Language Detection Utility
Create `/src/lib/language-detection.ts`:
```typescript
function detectUserLanguage(
  request: NextRequest,
  user?: User
): string {
  // Priority order:
  // 1. User preference from database
  // 2. Cookie preference
  // 3. Accept-Language header
  // 4. Default 'en'
}
```

#### FR-5.3: Middleware Integration
Update `middleware.ts` to:
- Detect language for incoming requests
- Set language context for the request
- Handle locale-based routing if needed

#### FR-5.4: Language Persistence
- Logged-in users: Store in `users.preferred_language`
- Guests: Store in cookie `FAQBNB_LANG` with 1-year expiry

---

## 4. Non-Functional Requirements

### NFR-1: Performance
- Translation API calls must complete within 10 seconds
- Language switching must feel instant (< 100ms perceived)
- Database queries for translations must be indexed and fast (< 50ms)

### NFR-2: Reliability
- Translation job queue must be durable (survive server restarts)
- Failed translations must not break content display (fallback to original)
- System must handle translation API downtime gracefully

### NFR-3: Scalability
- Support 100+ concurrent translation jobs
- Handle accounts with 1000+ items efficiently
- Translation tables must scale to millions of rows

### NFR-4: Security
- API keys for translation services stored securely in environment variables
- RLS policies prevent unauthorized access to translations
- No PII transmitted to translation APIs

---

## 5. Technical Considerations

### 5.1 Dependencies
- `next-intl` package for i18n framework
- OpenAI or Anthropic SDK for translation API
- Supabase for database and potentially Edge Functions

### 5.2 Environment Variables Required
```
TRANSLATION_PROVIDER=claude|openai
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 5.3 Database Indexes
```sql
CREATE INDEX idx_article_translations_article_lang ON article_translations(article_id, language);
CREATE INDEX idx_item_translations_item_lang ON item_translations(item_id, language);
CREATE INDEX idx_link_translations_link_lang ON link_translations(link_id, language);
CREATE INDEX idx_tag_translations_tag_lang ON tag_translations(tag_key, language);
CREATE INDEX idx_translation_jobs_status ON translation_jobs(status, created_at);
```

### 5.4 Migration Strategy
1. Deploy schema changes first
2. Deploy code changes with feature flag
3. Enable i18n framework
4. Seed system tag translations
5. Enable translation jobs

---

## 6. Out of Scope

- Actual translation of existing UI strings (Epic 2)
- User content translation triggers (Epic 3)
- Guest-facing language experience (Epic 4)
- Owner translation review UI (Epic 5)
- Right-to-left (RTL) language support
- Voice/audio translation

---

## 7. Dependencies

### Upstream Dependencies
- None (this is the first epic)

### Downstream Dependencies (Blocked by this epic)
- Epic 2: Static UI Translation
- Epic 3: Dynamic Content Translation
- Epic 4: Guest Experience
- Epic 5: Owner Translation Management

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation API rate limits | Medium | Medium | Implement queuing with rate limiting |
| Translation API costs | Medium | Low | Monitor usage, set budget alerts |
| Schema migration issues | Low | High | Test migrations in staging first |
| i18n framework complexity | Medium | Medium | Start with minimal config, iterate |

---

## 9. Acceptance Criteria

### AC-1: Database Schema
- [ ] All 4 translation tables exist with correct columns
- [ ] RLS policies applied and tested
- [ ] Indexes created for performance
- [ ] Source language columns added to existing tables
- [ ] User/account language preference columns exist

### AC-2: i18n Framework
- [ ] next-intl installed and configured
- [ ] Translation files structure created (can be mostly empty)
- [ ] IntlProvider wraps application
- [ ] Sample component using `t()` function works
- [ ] All 6 locales configured

### AC-3: Translation Service
- [ ] Translation API wrapper module exists
- [ ] Successfully translates test text to all 6 languages
- [ ] Error handling and retries implemented
- [ ] API keys properly secured

### AC-4: Background Jobs
- [ ] Translation jobs table exists
- [ ] Job processing mechanism implemented
- [ ] Jobs process asynchronously
- [ ] Failed jobs are retried
- [ ] Job status is trackable

### AC-5: Language Switching
- [ ] LanguageSwitcher component exists
- [ ] Language detection utility works
- [ ] User preference persisted (cookie for guests, DB for users)
- [ ] Page re-renders with new language

---

## 10. Open Questions

1. **Translation Provider:** Should we default to Claude or OpenAI? Or make it configurable?
2. **Job Processing:** Which background job approach (cron vs. realtime)?
3. **URL Strategy:** Should we use `/fr/dashboard` URL prefixes or keep URLs language-agnostic?
4. **Existing Content:** Should we auto-translate all existing content on deploy, or on-demand?

---

## 11. Appendix

### A. Language Codes Reference
| Language | Code | Native Name |
|----------|------|-------------|
| English | en | English |
| French | fr | Francais |
| Spanish | es | Espanol |
| German | de | Deutsch |
| Dutch | nl | Nederlands |
| Italian | it | Italiano |

### B. System Tags to Pre-Seed
```json
{
  "#room.kitchen": { "fr": "Cuisine", "es": "Cocina", "de": "Kuche", "nl": "Keuken", "it": "Cucina" },
  "#room.bathroom": { "fr": "Salle de bain", "es": "Bano", "de": "Badezimmer", "nl": "Badkamer", "it": "Bagno" },
  "#room.bedroom": { "fr": "Chambre", "es": "Dormitorio", "de": "Schlafzimmer", "nl": "Slaapkamer", "it": "Camera da letto" },
  "#room.laundry": { "fr": "Buanderie", "es": "Lavanderia", "de": "Waschkuche", "nl": "Wasruimte", "it": "Lavanderia" },
  "appliance": { "fr": "Appareil", "es": "Electrodomestico", "de": "Gerat", "nl": "Apparaat", "it": "Elettrodomestico" }
}
```
