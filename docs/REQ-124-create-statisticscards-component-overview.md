# REQ-124: Create StatisticsCards Component - Implementation Overview

**Document Version:** 1.0
**Created:** 2026-01-06 16:30:00 UTC
**Last Modified:** 2026-01-06 16:30:00 UTC
**Request Reference:** docs/gen_requests.md - REQ-124
**Implementation Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 2, Task 2.3)

---

## 1. Summary

Create the StatisticsCards component that displays three statistics cards (Items, Rooms, Tags) in a horizontal row on the Dashboard 2 home page. The component must follow Airbnb Design Language System (DLS) specifications and integrate with the existing `useDashboardStats` hook.

---

## 2. Current State Assessment

### 2.1 Completed Dependencies (REQ-122, REQ-123)

| Component | Status | Location |
|-----------|--------|----------|
| Dashboard Stats API | **COMPLETE** | `/src/app/api/user/dashboard/stats/route.ts` |
| useDashboardStats Hook | **COMPLETE** | `/src/hooks/useDashboardStats.ts` |
| Dashboard 2 Layout | **COMPLETE** | `/src/app/dashboard2/layout.tsx` (Airbnb colors applied) |
| Dashboard 2 Page | **EXISTS** | `/src/app/dashboard2/page.tsx` (needs StatisticsCards integration) |

### 2.2 API Response Shape (from REQ-122)

```typescript
interface DashboardStats {
  itemCount: number;
  roomCount: number;
  tagCount: number;
}
```

### 2.3 Hook Return Interface (from REQ-123)

```typescript
interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}
```

---

## 3. Requirements Analysis

### 3.1 PRD Requirements (Feature 1)

From `Plan-001-Simple-Dashboard-Implementation-REVISED.md`, Task 2.3:

- [ ] Three cards in a row: Items, Rooms, Tags
- [ ] Card styling per Airbnb DLS:
  - White background (`bg-white`)
  - 12px border-radius (`rounded-xl`)
  - Subtle shadow (`shadow-sm`)
  - Large number prominent (32px, bold)
  - Label below (14px, `text-[#717171]`)
- [ ] Icons from Lucide: `Package`, `Home`, `Tag`
- [ ] Loading skeleton state (shimmer)
- [ ] Zero state: Display "0" (not "No data")

### 3.2 Design System Tokens Required

| Token | Tailwind Class | Purpose |
|-------|----------------|---------|
| Background | `bg-white` | Card background |
| Border Radius | `rounded-xl` | 12px corners per DLS |
| Shadow | `shadow-sm` | Subtle elevation |
| Primary Text | `text-[#222222]` | Large numbers (Mine Shaft) |
| Secondary Text | `text-[#717171]` | Labels |
| Icon Container | `bg-gray-100` or contextual | Icon background |

### 3.3 Icon Mapping

| Statistic | Lucide Icon | Semantic Meaning |
|-----------|-------------|------------------|
| Items | `Package` | Physical items with QR codes |
| Rooms | `Home` | Locations/rooms within property |
| Tags | `Tag` | Categorization labels |

---

## 4. Technical Design

### 4.1 Component Architecture

```
/src/components/SimpleDashboard/
├── StatisticsCards.tsx        # Main component (NEW)
├── index.ts                   # Barrel export (NEW)
└── (future components...)     # ActionButtons, PropertySection
```

### 4.2 Component Interface

```typescript
// StatisticsCards.tsx

interface StatisticsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

interface StatCardConfig {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}
```

### 4.3 Component Structure

```typescript
// Pseudo-structure
function StatisticsCards({ stats, isLoading, error, className }: StatisticsCardsProps) {
  const cardConfigs: StatCardConfig[] = [
    { key: 'itemCount', label: 'Items', icon: Package, iconColor: 'text-[#FF385C]', iconBgColor: 'bg-[#FFEEEF]' },
    { key: 'roomCount', label: 'Rooms', icon: Home, iconColor: 'text-[#00A699]', iconBgColor: 'bg-[#E6F7F6]' },
    { key: 'tagCount', label: 'Tags', icon: Tag, iconColor: 'text-[#484848]', iconBgColor: 'bg-gray-100' },
  ];

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cardConfigs.map(config => (
        <StatCard key={config.key} config={config} value={stats?.[config.key] ?? 0} />
      ))}
    </div>
  );
}
```

### 4.4 StatCard Sub-component

```typescript
interface StatCardProps {
  config: StatCardConfig;
  value: number;
}

function StatCard({ config, value }: StatCardProps) {
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${config.iconBgColor}`}>
        <Icon className={`w-6 h-6 ${config.iconColor}`} />
      </div>
      <div>
        <p className="text-[32px] font-bold text-[#222222] leading-tight">{value}</p>
        <p className="text-sm text-[#717171]">{config.label}</p>
      </div>
    </div>
  );
}
```

### 4.5 Loading Skeleton

```typescript
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div className="flex-1">
            <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 5. Integration with Dashboard Page

### 5.1 Page.tsx Modifications

File: `/src/app/dashboard2/page.tsx`

**Current structure:**
```
Welcome Section (gradient banner)
Quick Actions (2-card grid)
Feature Highlights
```

**Required structure:**
```
Welcome Section (gradient banner)
Statistics Cards (NEW - 3 cards) ← Insert here
Quick Actions (2-card grid)
Feature Highlights
```

### 5.2 Integration Code

```typescript
// In /src/app/dashboard2/page.tsx
import { StatisticsCards } from '@/components/SimpleDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function Dashboard2Page() {
  const { stats, isLoading, error } = useDashboardStats();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] ...">
        ...
      </div>

      {/* Statistics Cards - NEW */}
      <StatisticsCards stats={stats} isLoading={isLoading} error={error} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        ...
      </div>

      {/* Feature Highlights */}
      ...
    </div>
  );
}
```

---

## 6. Existing Patterns to Follow

### 6.1 Component Patterns from Codebase

Reference: `/src/components/KPIDashboardOverview.tsx` (lines 7-55)
- Uses interface for card props
- Loading skeleton with `animate-pulse`
- Card structure with icon, value, subtitle

Reference: `/src/components/AnalyticsOverviewCards.tsx` (lines 40-128)
- Grid layout for cards
- Error state handling
- Color system application

### 6.2 Styling Patterns

From dashboard2/layout.tsx and page.tsx:
- Airbnb color tokens inline: `text-[#FF385C]`, `bg-[#E61E4D]`
- Card styling: `bg-white rounded-xl shadow-sm`
- Spacing: `gap-4`, `gap-6`, `space-y-8`

### 6.3 Hook Integration Pattern

From existing page.tsx:
- useAuth for user context
- Destructure hook return: `const { stats, isLoading, error } = useDashboardStats()`

---

## 7. Authorized Files and Functions for Modification

### 7.1 Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | Main StatisticsCards component |
| `/src/components/SimpleDashboard/index.ts` | Barrel export for SimpleDashboard components |

### 7.2 Files to MODIFY

| File Path | Lines | Modification |
|-----------|-------|--------------|
| `/src/app/dashboard2/page.tsx` | 1-14 | Add imports for StatisticsCards, useDashboardStats |
| `/src/app/dashboard2/page.tsx` | 17-22 | Add useDashboardStats hook call |
| `/src/app/dashboard2/page.tsx` | 29-30 | Insert StatisticsCards component between welcome and quick actions |

### 7.3 Functions/Components to ADD

| Component | File | Description |
|-----------|------|-------------|
| `StatisticsCards` | StatisticsCards.tsx | Main export, renders 3-card grid |
| `StatCard` | StatisticsCards.tsx | Individual card sub-component |
| `LoadingSkeleton` | StatisticsCards.tsx | Loading state with shimmer animation |

### 7.4 NO CHANGES Required

| File | Reason |
|------|--------|
| `/src/app/api/user/dashboard/stats/route.ts` | Already complete (REQ-122) |
| `/src/hooks/useDashboardStats.ts` | Already complete (REQ-123) |
| `/src/app/dashboard2/layout.tsx` | Already has Airbnb colors applied (REQ-121) |
| `/src/app/dashboard2/create/page.tsx` | Out of scope |
| `/src/app/dashboard2/items/page.tsx` | Out of scope |

---

## 8. Acceptance Criteria

### 8.1 Visual Requirements

- [ ] Three statistics cards displayed in a horizontal row on desktop
- [ ] Cards stack to single column on mobile (responsive)
- [ ] Each card shows: icon (left), large number (32px bold), label (14px gray)
- [ ] White background, 12px border radius, subtle shadow per DLS
- [ ] Icons: Package for Items, Home for Rooms, Tag for Tags
- [ ] Icon backgrounds use Airbnb color palette accents

### 8.2 Functional Requirements

- [ ] Stats automatically fetch on component mount via useDashboardStats
- [ ] Loading skeleton displays while data is being fetched
- [ ] Zero values display as "0" (not empty or "No data")
- [ ] Error state displays gracefully with error message
- [ ] Component updates when hook data changes

### 8.3 Code Quality Requirements

- [ ] Component follows existing codebase patterns
- [ ] TypeScript interfaces properly defined
- [ ] Props interface documented
- [ ] Component is exported via barrel file
- [ ] No unused imports or variables

---

## 9. Implementation Checklist

### Phase 1: Create Component Files

- [ ] Create `/src/components/SimpleDashboard/` directory
- [ ] Create `StatisticsCards.tsx` with:
  - [ ] StatisticsCardsProps interface
  - [ ] StatCardConfig interface
  - [ ] StatCard sub-component
  - [ ] LoadingSkeleton sub-component
  - [ ] Main StatisticsCards component
- [ ] Create `index.ts` barrel export

### Phase 2: Integrate with Dashboard

- [ ] Import StatisticsCards in page.tsx
- [ ] Import useDashboardStats hook
- [ ] Add hook call in component body
- [ ] Insert StatisticsCards between welcome section and quick actions

### Phase 3: Verify

- [ ] Run dev server and verify visual output
- [ ] Test loading state (network throttle)
- [ ] Test with zero data (new user scenario)
- [ ] Test responsive layout (mobile)
- [ ] Verify TypeScript compiles without errors
- [ ] Verify build succeeds

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hook data shape mismatch | Low | Medium | Use existing DashboardStats interface from hook |
| Styling inconsistency | Low | Low | Follow existing patterns in dashboard2/page.tsx |
| Mobile responsive issues | Low | Medium | Test early with browser dev tools |
| Directory creation issues | Low | Low | Verify SimpleDashboard doesn't exist before creating |

---

## 11. Dependencies

### 11.1 External Dependencies (Already Installed)

- `lucide-react` - For Package, Home, Tag icons
- `tailwindcss` - For styling

### 11.2 Internal Dependencies

- `/src/hooks/useDashboardStats.ts` - Data fetching (COMPLETE)
- `/src/app/api/user/dashboard/stats/route.ts` - API endpoint (COMPLETE)

---

## 12. Estimated Effort

| Task | Estimate |
|------|----------|
| Create SimpleDashboard directory and files | 5 min |
| Implement StatisticsCards component | 30 min |
| Implement loading skeleton | 10 min |
| Integrate with page.tsx | 10 min |
| Testing and verification | 15 min |
| **Total** | **~1 hour** |

---

## 13. References

- [Implementation Plan](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md) - Task 2.3
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md) - Color tokens, spacing
- [Existing Pattern: KPIDashboardOverview](/src/components/KPIDashboardOverview.tsx) - Card component pattern
- [Existing Pattern: AnalyticsOverviewCards](/src/components/AnalyticsOverviewCards.tsx) - Grid layout, loading states
- [useDashboardStats Hook](/src/hooks/useDashboardStats.ts) - Hook interface
- [Dashboard Stats API](/src/app/api/user/dashboard/stats/route.ts) - Response shape
