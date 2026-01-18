# Product Requirements Document: Dashboard 2 - Simple Dashboard

## Product Vision

Provide a clean, focused dashboard for property owners with a single account to manage their rental property items. The dashboard enables users to quickly see their content statistics, create new items, view existing items, and print QR codes—all without unnecessary complexity around account management.

---

## Success Definition

### Business Outcomes

| Metric | Target | How We'll Know |
|--------|--------|----------------|
| Time to first item | < 2 minutes from login | User testing |
| Dashboard comprehension | Users understand all options without guidance | User testing |
| QR code print completion | > 90% of started prints complete successfully | Analytics |
| Property edit completion | Users can update property info in < 1 minute | User testing |

### User Outcome

> "I can log in, see exactly how many items I've created for my property, and quickly add new items or print QR codes without navigating through complicated menus."

---

## Target User

- Property owners with a **single account**
- Managing **one property** initially (can add more later)
- Wants a **simple, uncluttered interface**
- Primary goal: Create items and print QR codes for guests

---

## Design Principles

1. **No account references** - Users have one account; no need to display or manage account information
2. **Single property assumption** - Start with "My Property" as the default; interface adapts when additional properties are added
3. **Action-focused** - Primary actions (create item, view items, print QR) are immediately visible
4. **Progressive complexity** - Interface only shows multi-property options when user has multiple properties

---

## Features & Acceptance Criteria

### Feature 1: Dashboard Statistics

**User Story:** As a property owner, I want to see at a glance how much content I've created so I can track my progress.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 1.1 | Display total number of items created | Primary progress metric |
| 1.2 | Display total number of rooms defined | Organization metric |
| 1.3 | Display total number of tags used | Categorization metric |
| 1.4 | Statistics update in real-time after actions | Immediate feedback |
| 1.5 | Show "0" gracefully for new users (not empty/error state) | Onboarding friendliness |

**UI Notes:**
- Statistics should be displayed as cards or a summary bar at the top of the dashboard
- Consider icons for each metric (items, rooms, tags)
- Numbers should be prominent and easy to read

---

### Feature 2: Primary Action Buttons

**User Story:** As a property owner, I want quick access to my most common tasks so I can be efficient.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 2.1 | "Create New Item" button prominently displayed | Primary user action |
| 2.2 | "View Items" button prominently displayed | Content management |
| 2.3 | "Print QR Code" button prominently displayed | Distribution action |
| 2.4 | Buttons are large, touch-friendly (min 48x48px) | Mobile usability |
| 2.5 | Buttons have clear icons and labels | Accessibility |

**Button Behaviors:**

- **Create New Item:** Navigates to ItemCapture component
- **View Items:** Navigates to items list/grid view
- **Print QR Code:** 
  - If 1 property → Goes directly to print flow for that property
  - If 2+ properties → Shows property selector first, then print flow

---

### Feature 3: Property Section ("My Property")

**User Story:** As a property owner, I want to view and edit my property details so I can keep information accurate.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 3.1 | "My Property" displayed as clickable element on dashboard | Access to property details |
| 3.2 | Clicking opens property detail/edit view | Direct access |
| 3.3 | Property name is editable | Customization |
| 3.4 | Property address is editable | Identification |
| 3.5 | Save button commits changes | Explicit save action |
| 3.6 | Cancel button discards unsaved changes | Error recovery |
| 3.7 | Validation for required fields (name) | Data integrity |
| 3.8 | Success confirmation after save | User feedback |

**Property Edit Fields:**

| Field | Required | Type | Max Length |
|-------|----------|------|------------|
| Property Name | Yes | Text | 100 chars |
| Address Line 1 | No | Text | 200 chars |
| Address Line 2 | No | Text | 200 chars |
| City | No | Text | 100 chars |
| State/Province | No | Text | 100 chars |
| Postal Code | No | Text | 20 chars |
| Country | No | Dropdown | - |

---

### Feature 4: Add New Property

**User Story:** As a property owner with multiple rentals, I want to add additional properties so I can manage items for each separately.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 4.1 | "Add Property" option available from dashboard | Expansion capability |
| 4.2 | Add property form collects same fields as edit | Consistency |
| 4.3 | New property appears in property list after creation | Immediate visibility |
| 4.4 | Dashboard adapts to show property selector when 2+ properties exist | Progressive UI |
| 4.5 | User can switch between properties to view respective items | Multi-property management |

**Interface Changes with Multiple Properties:**

When user has 2+ properties:
- Property section becomes a dropdown or list showing all properties
- Statistics can be filtered by property or shown as totals
- "Print QR Code" requires property selection before proceeding
- Items list can be filtered by property

---

### Feature 5: Print QR Code Flow

**User Story:** As a property owner, I want to print QR codes for my items so guests can easily access instructions.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 5.1 | Single property: "Print QR Code" goes directly to print options | Streamlined flow |
| 5.2 | Multiple properties: "Print QR Code" shows property selector first | Disambiguation |
| 5.3 | User can select which items to include in print batch | Flexibility |
| 5.4 | Preview of QR codes before printing | Verification |
| 5.5 | Print format options (single page, multiple per page, labels) | Use case flexibility |
| 5.6 | Download as PDF option | Digital distribution |
| 5.7 | Each QR code includes item name/label | Identification |

**Print Flow (Single Property):**
```
[Print QR Code] → [Select Items] → [Choose Format] → [Preview] → [Print/Download]
```

**Print Flow (Multiple Properties):**
```
[Print QR Code] → [Select Property] → [Select Items] → [Choose Format] → [Preview] → [Print/Download]
```

---

### Feature 6: Welcome Message

**User Story:** As a returning user, I want to feel welcomed when I return to my dashboard.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 6.1 | Display "Welcome back" or similar greeting | User engagement |
| 6.2 | Optionally show user's first name if available | Personalization |
| 6.3 | No reference to account name or account type | Simplicity |

---

## User Interface Specifications

### Dashboard Layout (Single Property)

```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome back, [Name]                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Items     │  │   Rooms     │  │    Tags     │             │
│  │     12      │  │      4      │  │      8      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │  + Create New    │  │   View Items     │  │  Print QR Code ││
│  │      Item        │  │                  │  │                ││
│  └──────────────────┘  └──────────────────┘  └────────────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🏠 My Property                                            [>] │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  + Add New Property                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard Layout (Multiple Properties)

```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome back, [Name]                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Items     │  │   Rooms     │  │    Tags     │             │
│  │     24      │  │      8      │  │     15      │             │
│  │  (all properties)                              │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │  + Create New    │  │   View Items     │  │  Print QR Code ││
│  │      Item        │  │                  │  │                ││
│  └──────────────────┘  └──────────────────┘  └────────────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  My Properties                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🏠 Beach House                                    [>]  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  🏠 Mountain Cabin                                 [>]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  + Add New Property                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Property Edit View

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Edit Property                                                  │
│                                                                 │
│  Property Name *                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Beach House                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Address Line 1                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 123 Ocean Drive                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Address Line 2                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  City                          State/Province                   │
│  ┌────────────────────────┐   ┌────────────────────────┐       │
│  │ Miami                  │   │ FL                     │       │
│  └────────────────────────┘   └────────────────────────┘       │
│                                                                 │
│  Postal Code                   Country                          │
│  ┌────────────────────────┐   ┌────────────────────────┐       │
│  │ 33139                  │   │ United States      ▼   │       │
│  └────────────────────────┘   └────────────────────────┘       │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │    Cancel    │  │     Save     │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Requirements

### Data Models

```typescript
interface Property {
  id: string;
  name: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardStats {
  itemCount: number;
  roomCount: number;
  tagCount: number;
}

interface DashboardState {
  properties: Property[];
  stats: DashboardStats;
  selectedPropertyId?: string; // Only used when multiple properties
}
```

### Component Interface

```typescript
interface SimpleDashboardProps {
  user: {
    firstName?: string;
  };
  properties: Property[];
  stats: DashboardStats;
  onCreateItem: () => void;
  onViewItems: (propertyId?: string) => void;
  onPrintQRCode: (propertyId: string) => void;
  onEditProperty: (propertyId: string) => void;
  onAddProperty: () => void;
  onSaveProperty: (property: Property) => Promise<void>;
}
```

---

## Implementation Phases

### Phase 1: Core Dashboard (MVP)
- [ ] Dashboard layout with statistics cards
- [ ] Three primary action buttons
- [ ] "My Property" display (non-editable initially)
- [ ] Basic navigation stubs

### Phase 2: Property Management
- [ ] Property edit view
- [ ] Save/cancel functionality
- [ ] Form validation
- [ ] Success/error feedback

### Phase 3: Multi-Property Support
- [ ] Add property flow
- [ ] Property list view
- [ ] Property selector for actions
- [ ] Statistics per property vs. totals

### Phase 4: Print QR Code Flow
- [ ] Item selection interface
- [ ] Print format options
- [ ] QR code preview
- [ ] Print/download functionality

---

## Out of Scope

- Account management or switching
- User profile editing
- Billing or subscription management
- Team/collaboration features
- Advanced analytics or reporting
- Item creation (handled by ItemCapture component)
- Item viewing/editing (separate component)

---

## Open Questions

1. **Statistics scope for multi-property:** Should statistics show totals across all properties or per-selected property?
2. **Default property:** When user adds a second property, should there be a "default" property concept?
3. **Property deletion:** Should users be able to delete properties? What happens to items?
4. **Empty states:** What should dashboard show for brand new users with no items?

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-06 | — | Initial draft |
