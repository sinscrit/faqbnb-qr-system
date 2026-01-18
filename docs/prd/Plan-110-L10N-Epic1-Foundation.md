# Implementation Plan: Localization Epic 1 - Foundation

**Generated:** 2026-01-17 23:30:00 UTC
**Last Modified:** 2026-01-17 23:30:00 UTC
**PRD Reference:** PRD_L10N_Epic1_Foundation.md
**Epic Size:** M (Medium)
**Priority:** P0 - Critical Path

---

## Overview

This implementation plan establishes the foundational infrastructure for multi-language support across the FAQBNB application. It includes database schema changes for translation storage, next-intl framework integration for static UI strings, AI-powered translation service setup (Claude/OpenAI), background job processing for async translations, and language detection/switching infrastructure. This epic blocks all subsequent L10N epics.

**Supported Languages:** English (en), French (fr), Spanish (es), German (de), Dutch (nl), Italian (it)

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **State Management** | React Context + useReducer (AuthContext, PropertyContext patterns) |
| **UI Components** | Radix UI primitives, Heroicons, Lucide React |
| **Authentication** | Supabase Auth with AuthContext |
| **Build Tool** | Next.js with Turbopack |
| **Backend** | Supabase (PostgreSQL with RLS) |
| **Deployment** | Railway |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Context Provider | `/src/contexts/AuthContext.tsx` | Global state management pattern |
| Database Types | `/src/lib/supabase.ts` | TypeScript database type definitions |
| Middleware | `/src/middleware.ts` | Request interception for auth |
| API Routes | `/src/app/api/admin/` | Server-side API patterns |
| Custom Hooks | `/src/hooks/` | Reusable logic patterns |
| Type Definitions | `/src/types/index.ts` | Centralized type exports |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| `next-intl` | i18n framework for Next.js 15 App Router | ~25KB gzipped | `react-i18next` (less Next.js integration) |
| `@anthropic-ai/sdk` | Claude API for translations | ~50KB | Already using for features (if applicable) |
| `openai` | OpenAI API for translations (backup) | ~45KB | N/A (provider fallback) |

**Note:** The Anthropic SDK may already be present if Claude is used elsewhere in the application. Verify and reuse existing installation.

---

## Architecture

### Component Structure

```
/messages                            # i18n translation files (root level)
├── en.json                          # English (default/source)
├── fr.json                          # French
├── es.json                          # Spanish
├── de.json                          # German
├── nl.json                          # Dutch
└── it.json                          # Italian

/src/lib/
├── i18n/
│   ├── index.ts                     # i18n exports barrel
│   ├── config.ts                    # Locale configuration
│   ├── request.ts                   # Server-side locale detection
│   └── navigation.ts                # Localized navigation utilities
├── translation-service/
│   ├── index.ts                     # Translation service exports
│   ├── translation-service.ts       # AI translation wrapper
│   ├── translation-service.types.ts # TypeScript interfaces
│   ├── providers/
│   │   ├── claude-provider.ts       # Anthropic Claude implementation
│   │   └── openai-provider.ts       # OpenAI implementation (fallback)
│   └── utils/
│       ├── rate-limiter.ts          # API rate limiting
│       └── retry.ts                 # Exponential backoff retry logic
└── job-queue/
    ├── index.ts                     # Job queue exports
    ├── translation-jobs.ts          # Job processing logic
    └── translation-jobs.types.ts    # Job type definitions

/src/components/
└── LanguageSwitcher/
    ├── index.ts                     # Component exports
    ├── LanguageSwitcher.tsx         # Main switcher component
    └── LanguageSwitcher.types.ts    # Component types

/src/hooks/
└── useLanguagePreference.ts         # Language preference hook

/src/contexts/
└── LocaleContext.tsx                # Locale context (wraps next-intl)

/src/app/
├── [locale]/                        # Localized route group (optional)
│   └── layout.tsx                   # Locale-aware layout
└── layout.tsx                       # Root layout with IntlProvider

/database/
└── migrations/
    └── 20260117_l10n_foundation.sql # Translation tables migration
```

### Database Schema

#### New Tables

**article_translations**
```sql
CREATE TABLE article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES item_articles(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),
  translated_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, language)
);
```

**item_translations**
```sql
CREATE TABLE item_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, language)
);
```

**link_translations**
```sql
CREATE TABLE link_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES item_links(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  title VARCHAR(255) NOT NULL,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(link_id, language)
);
```

**tag_translations**
```sql
CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_key VARCHAR(100) NOT NULL,
  language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  translated_value VARCHAR(255) NOT NULL,
  is_system_tag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tag_key, language)
);
```

**translation_jobs**
```sql
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('article', 'item', 'link', 'tag')),
  entity_id UUID NOT NULL,
  source_language VARCHAR(5) NOT NULL DEFAULT 'en',
  target_language VARCHAR(5) NOT NULL CHECK (target_language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  status VARCHAR(20) NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(entity_type, entity_id, target_language)
);
```

#### Column Additions

```sql
-- Source language tracking
ALTER TABLE items ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE item_articles ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE item_links ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';

-- User/Account language preferences
ALTER TABLE accounts ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
```

### State Management

```typescript
// Language preference flows through:
// 1. User database setting (logged-in users)
// 2. Cookie (FAQBNB_LANG) for persistence
// 3. Accept-Language header fallback
// 4. Default 'en'

interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  supportedLocales: string[];
  isLoading: boolean;
}
```

### Data Flow

```
User Request
    │
    ▼
Middleware (language detection)
    │
    ├── Check user preference (if authenticated)
    ├── Check FAQBNB_LANG cookie
    ├── Check Accept-Language header
    └── Default to 'en'
    │
    ▼
IntlProvider (wraps app)
    │
    ▼
Components use t() function
```

---

## Integration Contract

### Translation Service Interface

```typescript
// /src/lib/translation-service/translation-service.types.ts

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
export type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
export type TranslationProvider = 'claude' | 'openai';
export type EntityType = 'article' | 'item' | 'link' | 'tag';

export interface TranslationRequest {
  text: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  context?: TranslationContext;
}

export interface TranslationContext {
  contentType: 'item_name' | 'item_description' | 'article_title' | 'article_description' | 'link_title' | 'tag';
  domainContext?: string; // e.g., "property rental, appliance instructions"
  maxLength?: number;
}

export interface TranslationResponse {
  translatedText: string;
  confidence?: number;
  provider: TranslationProvider;
  tokensUsed?: number;
}

export interface BatchTranslationRequest {
  text: string;
  sourceLanguage: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  context?: TranslationContext;
}

export interface BatchTranslationResponse {
  translations: Record<SupportedLanguage, string>;
  provider: TranslationProvider;
  totalTokensUsed?: number;
}

export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  attempts: number;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}
```

### Language Switcher Props

```typescript
// /src/components/LanguageSwitcher/LanguageSwitcher.types.ts

export interface LanguageSwitcherProps {
  /** Current locale code */
  currentLocale?: string;
  /** Callback when locale changes */
  onLocaleChange?: (locale: string) => void;
  /** Display variant */
  variant?: 'dropdown' | 'inline' | 'compact';
  /** Show flag icons */
  showFlags?: boolean;
  /** Show native language names */
  showNativeNames?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface LocaleOption {
  code: SupportedLanguage;
  name: string;           // English name
  nativeName: string;     // Native name (e.g., "Deutsch")
  flag?: string;          // Optional flag emoji or icon
}
```

### Usage Examples

```tsx
// Using translations in components
import { useTranslations } from 'next-intl';

function DashboardHeader() {
  const t = useTranslations('dashboard');

  return (
    <header>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </header>
  );
}

// Using LanguageSwitcher
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

function NavBar() {
  return (
    <nav>
      <LanguageSwitcher
        variant="dropdown"
        showNativeNames={true}
      />
    </nav>
  );
}

// Using translation service (server-side)
import { translateText, translateToAllLanguages } from '@/lib/translation-service';

async function translateItemName(name: string) {
  const translations = await translateToAllLanguages(name, 'en', {
    contentType: 'item_name',
    domainContext: 'household appliance in property rental context'
  });
  return translations;
}
```

---

## Implementation Approach

### Phase 1: Database Foundation (2-3 days)

- [ ] **Task 1.1:** Create migration file with all translation tables
  - File: `/database/migrations/20260117_l10n_foundation.sql`
  - Include all 5 tables: article_translations, item_translations, link_translations, tag_translations, translation_jobs
  - Add all indexes for performance

- [ ] **Task 1.2:** Add source_language columns to existing tables
  - ALTER items, item_articles, item_links tables
  - Default to 'en' for existing records

- [ ] **Task 1.3:** Add preferred_language columns
  - ALTER users and accounts tables
  - Default to 'en'

- [ ] **Task 1.4:** Implement RLS policies for translation tables
  - Read access: Match content access permissions
  - Write access: Content owner or service role
  - Service role: Full access for background jobs

- [ ] **Task 1.5:** Update TypeScript database types
  - File: `/src/lib/supabase.ts`
  - Add all new table type definitions

- [ ] **Task 1.6:** Seed system tag translations
  - Pre-populate tag_translations with standard room/appliance tags

### Phase 2: i18n Framework Integration (2-3 days)

- [ ] **Task 2.1:** Install and configure next-intl
  - `npm install next-intl`
  - Create `/messages/` directory with all 6 locale files

- [ ] **Task 2.2:** Create i18n configuration module
  - File: `/src/lib/i18n/config.ts`
  - Define supported locales, default locale
  - File: `/src/lib/i18n/request.ts`
  - Server-side locale detection

- [ ] **Task 2.3:** Update next.config.ts for i18n
  - Add next-intl plugin configuration
  - Configure locale detection settings

- [ ] **Task 2.4:** Create IntlProvider wrapper
  - File: `/src/app/layout.tsx` (modify)
  - Wrap application with NextIntlClientProvider

- [ ] **Task 2.5:** Create initial translation file structure
  - File: `/messages/en.json`
  - Organize by namespace: common, auth, dashboard, items, errors
  - Create stub files for other locales

- [ ] **Task 2.6:** Verify sample component with t() function
  - Update one existing component to use translations
  - Verify hot reload works correctly

### Phase 3: Translation Service (3-4 days)

- [ ] **Task 3.1:** Create translation service module structure
  - Create `/src/lib/translation-service/` directory
  - Create all type definition files

- [ ] **Task 3.2:** Implement Claude translation provider
  - File: `/src/lib/translation-service/providers/claude-provider.ts`
  - Handle API authentication, rate limiting
  - Include domain context in prompts

- [ ] **Task 3.3:** Implement OpenAI translation provider (fallback)
  - File: `/src/lib/translation-service/providers/openai-provider.ts`
  - Mirror Claude provider interface

- [ ] **Task 3.4:** Create rate limiter utility
  - File: `/src/lib/translation-service/utils/rate-limiter.ts`
  - Token bucket or sliding window implementation
  - Configurable per-provider limits

- [ ] **Task 3.5:** Create retry logic with exponential backoff
  - File: `/src/lib/translation-service/utils/retry.ts`
  - Max 3 retries, exponential delay
  - Jitter to prevent thundering herd

- [ ] **Task 3.6:** Create main translation service wrapper
  - File: `/src/lib/translation-service/translation-service.ts`
  - `translateText()` function
  - `translateToAllLanguages()` batch function
  - Provider selection based on env config

- [ ] **Task 3.7:** Add environment variables
  - Update `.env.example` with new vars
  - `TRANSLATION_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`

- [ ] **Task 3.8:** Create API endpoint for manual translation testing
  - File: `/src/app/api/admin/translate/route.ts`
  - Admin-only endpoint for testing translations

### Phase 4: Background Job Processing (2-3 days)

- [ ] **Task 4.1:** Create translation job queue module
  - File: `/src/lib/job-queue/translation-jobs.ts`
  - Job insertion, status updates
  - Job fetching with locking

- [ ] **Task 4.2:** Implement job processor
  - Poll for queued jobs (configurable interval)
  - Process one job at a time
  - Update translation tables on completion

- [ ] **Task 4.3:** Create API route for job processing
  - File: `/src/app/api/admin/process-translations/route.ts`
  - Trigger job processing (can be called by cron)
  - Return processing stats

- [ ] **Task 4.4:** Implement concurrency control
  - Prevent duplicate job processing
  - Handle stale "processing" jobs (timeout after 5 min)

- [ ] **Task 4.5:** Create job status API endpoint
  - File: `/src/app/api/admin/translation-jobs/route.ts`
  - List jobs by status, entity type
  - For monitoring and debugging

### Phase 5: Language Switching Infrastructure (2-3 days)

- [ ] **Task 5.1:** Create language detection utility
  - File: `/src/lib/i18n/language-detection.ts`
  - `detectUserLanguage(request, user?): string`
  - Priority: user preference > cookie > Accept-Language > default

- [ ] **Task 5.2:** Update middleware for language handling
  - File: `/src/middleware.ts` (modify)
  - Set language context on requests
  - Handle locale cookie read/write

- [ ] **Task 5.3:** Create LanguageSwitcher component
  - File: `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
  - Dropdown with all 6 languages
  - Native language names (Deutsch, Francais, etc.)
  - Persist preference (DB for users, cookie for guests)

- [ ] **Task 5.4:** Create useLanguagePreference hook
  - File: `/src/hooks/useLanguagePreference.ts`
  - Get/set language preference
  - Handle persistence logic

- [ ] **Task 5.5:** Create LocaleContext (optional enhancement)
  - File: `/src/contexts/LocaleContext.tsx`
  - Wrap next-intl with additional app-specific logic

- [ ] **Task 5.6:** Add language preference API endpoint
  - File: `/src/app/api/user/language/route.ts`
  - PUT endpoint to update user's preferred_language

- [ ] **Task 5.7:** Integrate LanguageSwitcher into navigation
  - Add to DashboardLayout header
  - Add to public-facing pages (optional in this epic)

### Phase 6: Testing & Validation (1-2 days)

- [ ] **Task 6.1:** Write unit tests for translation service
  - Test translateText function
  - Test retry logic
  - Test rate limiter

- [ ] **Task 6.2:** Write integration tests for job processing
  - Test job lifecycle
  - Test concurrent processing

- [ ] **Task 6.3:** Write component tests for LanguageSwitcher
  - Test dropdown behavior
  - Test persistence

- [ ] **Task 6.4:** Manual E2E validation
  - Verify language switching works
  - Verify translations render correctly
  - Verify job processing completes

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| i18n Framework | next-intl | Best Next.js 15 App Router integration, active maintenance, good DX |
| Translation Provider | Claude (primary) | Better context understanding for domain-specific content |
| URL Strategy | Language-agnostic URLs | Simpler implementation, preference stored in cookie/DB instead of URL path |
| Job Processing | API route with external cron | Simple, no infrastructure changes, Railway supports cron |
| Language Persistence | Cookie + DB hybrid | Guests use cookie, logged-in users use DB preference |
| Translation Trigger | Manual/on-demand | Controlled costs, Epic 3 will add automatic triggers |

---

## File Changes Summary

### New Files

| File Path | Purpose |
|-----------|---------|
| `/messages/en.json` | English translations (source) |
| `/messages/fr.json` | French translations |
| `/messages/es.json` | Spanish translations |
| `/messages/de.json` | German translations |
| `/messages/nl.json` | Dutch translations |
| `/messages/it.json` | Italian translations |
| `/database/migrations/20260117_l10n_foundation.sql` | Database migration |
| `/src/lib/i18n/index.ts` | i18n module exports |
| `/src/lib/i18n/config.ts` | Locale configuration |
| `/src/lib/i18n/request.ts` | Server-side locale |
| `/src/lib/i18n/language-detection.ts` | Language detection utility |
| `/src/lib/translation-service/index.ts` | Translation service exports |
| `/src/lib/translation-service/translation-service.ts` | Main service |
| `/src/lib/translation-service/translation-service.types.ts` | TypeScript types |
| `/src/lib/translation-service/providers/claude-provider.ts` | Claude implementation |
| `/src/lib/translation-service/providers/openai-provider.ts` | OpenAI implementation |
| `/src/lib/translation-service/utils/rate-limiter.ts` | Rate limiting |
| `/src/lib/translation-service/utils/retry.ts` | Retry logic |
| `/src/lib/job-queue/index.ts` | Job queue exports |
| `/src/lib/job-queue/translation-jobs.ts` | Job processing |
| `/src/lib/job-queue/translation-jobs.types.ts` | Job types |
| `/src/components/LanguageSwitcher/index.ts` | Component exports |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Switcher component |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | Component types |
| `/src/hooks/useLanguagePreference.ts` | Language preference hook |
| `/src/app/api/admin/translate/route.ts` | Translation test API |
| `/src/app/api/admin/process-translations/route.ts` | Job processing API |
| `/src/app/api/admin/translation-jobs/route.ts` | Job status API |
| `/src/app/api/user/language/route.ts` | User language preference API |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `/package.json` | Add next-intl, @anthropic-ai/sdk dependencies |
| `/next.config.ts` | Add next-intl plugin configuration |
| `/src/middleware.ts` | Add language detection logic |
| `/src/app/layout.tsx` | Wrap with IntlProvider |
| `/src/lib/supabase.ts` | Add translation table types |
| `/src/types/index.ts` | Export new L10N types |
| `/.env.example` | Add translation env vars |
| `/src/components/DashboardLayout.tsx` | Add LanguageSwitcher to header |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation API rate limits | Medium | Medium | Implement robust rate limiting and queue backpressure |
| Translation API costs | Medium | Low | Monitor usage, set budget alerts, use batch translations |
| Schema migration conflicts | Low | High | Test migrations in staging first, backup before deploy |
| i18n framework complexity | Medium | Medium | Start with minimal config, use documented patterns |
| Job processing reliability | Medium | Medium | Implement job timeout handling, retry logic, monitoring |
| Translation quality | Medium | Low | Include context in prompts, allow manual review later |

---

## Effort Estimate

| Phase | Estimate | Confidence |
|-------|----------|------------|
| Phase 1: Database Foundation | 2-3 days | High |
| Phase 2: i18n Framework Integration | 2-3 days | High |
| Phase 3: Translation Service | 3-4 days | Medium |
| Phase 4: Background Job Processing | 2-3 days | Medium |
| Phase 5: Language Switching | 2-3 days | High |
| Phase 6: Testing & Validation | 1-2 days | High |
| **Total** | **12-18 days** | Medium-High |

**Notes:**
- Estimates assume single developer
- Parallel work possible between phases 2-4 and phase 5
- Buffer included for unforeseen integration issues

---

## Environment Variables Required

```bash
# Translation Service Configuration
TRANSLATION_PROVIDER=claude  # Options: claude, openai
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx        # Fallback provider

# Optional: Translation Service Tuning
TRANSLATION_RATE_LIMIT_PER_MINUTE=60
TRANSLATION_MAX_RETRIES=3
TRANSLATION_JOB_BATCH_SIZE=10
```

---

## Open Questions

1. **Translation Provider Default:** Should we default to Claude or OpenAI, or make it user-configurable per account?
   - *Recommendation:* Default to Claude, configurable via env var

2. **URL Strategy Confirmation:** Confirm language-agnostic URLs (no `/fr/dashboard`) is acceptable?
   - *Recommendation:* Start without URL prefixes, can add later if needed

3. **Existing Content Migration:** Should we auto-translate all existing content on deploy, or leave for Epic 3?
   - *Recommendation:* Leave for Epic 3, this epic focuses on infrastructure only

4. **Cron Job Platform:** Confirm Railway cron or consider Supabase pg_cron for job processing?
   - *Recommendation:* Start with Railway cron (simpler), migrate to pg_cron if needed

---

## Acceptance Criteria Mapping

| PRD Criteria | Implementation Task |
|--------------|---------------------|
| AC-1: All 4 translation tables exist | Tasks 1.1-1.4 |
| AC-1: RLS policies applied | Task 1.4 |
| AC-1: Indexes created | Task 1.1 |
| AC-1: Source language columns added | Task 1.2 |
| AC-1: User/account preference columns | Task 1.3 |
| AC-2: next-intl installed and configured | Tasks 2.1-2.2 |
| AC-2: Translation files structure created | Task 2.5 |
| AC-2: IntlProvider wraps application | Task 2.4 |
| AC-2: Sample component using t() works | Task 2.6 |
| AC-2: All 6 locales configured | Task 2.1 |
| AC-3: Translation API wrapper exists | Tasks 3.1-3.6 |
| AC-3: Successfully translates to all 6 languages | Task 3.6 |
| AC-3: Error handling and retries | Tasks 3.4-3.5 |
| AC-3: API keys secured | Task 3.7 |
| AC-4: Translation jobs table exists | Task 1.1 |
| AC-4: Job processing mechanism implemented | Tasks 4.1-4.3 |
| AC-4: Jobs process asynchronously | Task 4.2 |
| AC-4: Failed jobs are retried | Task 4.2 |
| AC-4: Job status is trackable | Task 4.5 |
| AC-5: LanguageSwitcher component exists | Task 5.3 |
| AC-5: Language detection utility works | Task 5.1 |
| AC-5: User preference persisted | Tasks 5.4, 5.6 |
| AC-5: Page re-renders with new language | Task 5.3 |

---

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/messages_post)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Railway Cron Jobs](https://docs.railway.app/reference/cron-jobs)
- PRD: `/docs/prd/PRD_L10N_Epic1_Foundation.md`

---

## System Tag Seed Data

```sql
-- Pre-seed system tags for all languages
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag) VALUES
-- Room tags
('#room.kitchen', 'en', 'Kitchen', true),
('#room.kitchen', 'fr', 'Cuisine', true),
('#room.kitchen', 'es', 'Cocina', true),
('#room.kitchen', 'de', 'Kuche', true),
('#room.kitchen', 'nl', 'Keuken', true),
('#room.kitchen', 'it', 'Cucina', true),

('#room.bathroom', 'en', 'Bathroom', true),
('#room.bathroom', 'fr', 'Salle de bain', true),
('#room.bathroom', 'es', 'Bano', true),
('#room.bathroom', 'de', 'Badezimmer', true),
('#room.bathroom', 'nl', 'Badkamer', true),
('#room.bathroom', 'it', 'Bagno', true),

('#room.bedroom', 'en', 'Bedroom', true),
('#room.bedroom', 'fr', 'Chambre', true),
('#room.bedroom', 'es', 'Dormitorio', true),
('#room.bedroom', 'de', 'Schlafzimmer', true),
('#room.bedroom', 'nl', 'Slaapkamer', true),
('#room.bedroom', 'it', 'Camera da letto', true),

('#room.laundry', 'en', 'Laundry', true),
('#room.laundry', 'fr', 'Buanderie', true),
('#room.laundry', 'es', 'Lavanderia', true),
('#room.laundry', 'de', 'Waschkuche', true),
('#room.laundry', 'nl', 'Wasruimte', true),
('#room.laundry', 'it', 'Lavanderia', true),

-- Category tags
('appliance', 'en', 'Appliance', true),
('appliance', 'fr', 'Appareil', true),
('appliance', 'es', 'Electrodomestico', true),
('appliance', 'de', 'Gerat', true),
('appliance', 'nl', 'Apparaat', true),
('appliance', 'it', 'Elettrodomestico', true);
```

---

## Translation File Structure Template

```json
// /messages/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next",
    "close": "Close"
  },
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "continueWithGoogle": "Continue with Google"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back",
    "properties": "Properties",
    "items": "Items",
    "analytics": "Analytics",
    "settings": "Settings"
  },
  "items": {
    "createNew": "New QR Code Item",
    "noItems": "No items yet",
    "name": "Item Name",
    "description": "Description",
    "property": "Property",
    "qrCode": "QR Code"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Invalid email address",
    "networkError": "Network error. Please try again.",
    "unauthorized": "You are not authorized to perform this action"
  },
  "language": {
    "select": "Select Language",
    "current": "Current Language"
  }
}
```

---

*Plan generated for FAQBNB Localization Epic 1 - Foundation*
