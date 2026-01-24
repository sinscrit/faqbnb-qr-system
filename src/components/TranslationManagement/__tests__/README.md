# TranslationManagement Component Tests

Last Modified: 2026-01-24

This directory contains comprehensive unit tests for the Translation Management UI components.

## Test Overview

| Component | Tests | Coverage Target |
|-----------|-------|-----------------|
| TranslationPreviewPanel | 32 | 85% line, 80% branch |
| TranslationEditor | 36 | 85% line, 80% branch |
| TranslationStatusWidget | 33 | 85% line, 80% branch |
| **Total** | **101** | |

## Running Tests

```bash
# Run all TranslationManagement component tests
npm test -- --run src/components/TranslationManagement/__tests__/

# Run specific component tests
npm test -- --run src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx
npm test -- --run src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx
npm test -- --run src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx

# Run with coverage
npm test -- --coverage --run src/components/TranslationManagement/__tests__/

# Run in watch mode
npm test -- --watch src/components/TranslationManagement/__tests__/
```

## Test Structure

Each test file follows a consistent organization:

1. **Mock Setup** - Mocks for next-intl, hooks, navigation, etc.
2. **Test Data** - Default props and mock API responses
3. **Test Suites**:
   - Rendering and Display
   - Loading and Empty States
   - Error Handling
   - User Interactions
   - Accessibility
   - Edge Cases

## Mock Utilities

Centralized mock utilities are available in `./mocks/component-mocks.ts`:

```typescript
import {
  createMockTranslationFn,
  createMockTranslationStatus,
  createMockTranslationRealtime,
  createMockSupabaseClient,
  createMockRouter,
  createMockTranslationItem,
  createMockStatusSummary,
  createMockEditorProps,
  createMockRealtimePayload,
} from './mocks/component-mocks';
```

### Key Mocks

| Mock | Purpose |
|------|---------|
| `createMockTranslationFn()` | Mock for next-intl `useTranslations` |
| `createMockTranslationStatus()` | Mock for `useTranslationStatus` hook |
| `createMockTranslationRealtime()` | Mock for `useTranslationRealtime` hook |
| `createMockSupabaseClient()` | Chainable Supabase client mock |
| `createMockRouter()` | Next.js router mock |
| `createMockStatusSummary()` | Translation status summary data |

## Test Patterns

### Mocking next-intl

```typescript
vi.mock('next-intl', () => ({
  useTranslations: () => createMockTranslationFn(),
}));
```

### Mocking Hooks

```typescript
const mockUseTranslationStatus = vi.fn();
vi.mock('@/hooks', () => ({
  useTranslationStatus: (options: unknown) => mockUseTranslationStatus(options),
}));

// In test
mockUseTranslationStatus.mockReturnValue({
  summary: createMockStatusSummary({ complete: 8 }),
  isLoading: false,
  error: null,
  refetch: vi.fn(),
});
```

### Mocking fetch API

```typescript
const mockFetch = vi.fn();
global.fetch = mockFetch;

// In test
mockFetch.mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ items: [...] }),
});
```

### Async Testing

```typescript
await waitFor(() => {
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

### User Interactions

```typescript
const user = userEvent.setup();
await user.click(screen.getByRole('button', { name: /save/i }));
```

## Accessibility Testing

All components include accessibility tests for:

- ARIA roles and attributes
- Keyboard navigation
- Focus management
- Screen reader compatibility

## Related Tests

- Hook tests: `src/hooks/__tests__/useTranslationStatus.test.tsx`
- Hook tests: `src/hooks/__tests__/useTranslationRealtime.test.tsx`
- Integration: `src/hooks/__tests__/hooks.integration.test.tsx`

## Request Reference

Created for REQ-E05-034 (Task 7.6 - Write component tests for Translation UI).
