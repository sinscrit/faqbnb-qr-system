# ItemCreationWorkflow Component

> **Last Modified:** 2026-01-05 (REQ-118 Documentation Updates)

A guided multi-step workflow for creating and tagging household items with QR codes. Property owners can select rooms, categorize items, add content (videos, photos, PDFs, text, or URLs), and generate printable QR code sheets.

## Overview

The ItemCreationWorkflow component provides a complete item creation experience including:

- **Room Selection** - Categorize items by room (kitchen, bedroom, bathroom, etc.)
- **Item Type Classification** - Classify as appliance, room item, or general info
- **Smart Suggestions** - Contextual item suggestions based on room and type
- **Multi-Content Support** - Attach videos, photos, PDFs, text instructions, or URLs
- **Session Management** - Create multiple items in a single session with persistence
- **QR Code Generation** - Batch generate QR codes for all session items
- **Print Options** - Download PDF or print directly with customizable scope

## Installation

Import the component from the ItemCreationWorkflow module:

```tsx
import { ItemCreationWorkflow } from '@/components/ItemCreationWorkflow';
```

For type-safe integration, import the types you need:

```tsx
import type {
  ItemCreationWorkflowProps,
  CompletedSession,
  PartialSession,
  SessionItem,
  PrintScope,
} from '@/components/ItemCreationWorkflow';
```

## Basic Usage

### Example 1: Minimal Integration

A basic implementation with all required callbacks:

```tsx
import { ItemCreationWorkflow } from '@/components/ItemCreationWorkflow';

function PropertyDashboard() {
  return (
    <ItemCreationWorkflow
      // Called when user completes the workflow
      onSessionComplete={(session) => {
        console.log(`Created ${session.newItems.length} items`);
        // Navigate to dashboard or show success message
      }}
      // Called when user exits mid-session
      onSessionExit={(partial) => {
        // Optionally save draft for later
        console.log('Session exited with draft:', partial);
      }}
      // Generate PDF blob for download
      onGeneratePDF={async (items, scope) => {
        return new Blob(['PDF content'], { type: 'application/pdf' });
      }}
      // Trigger browser print dialog
      onPrintDirect={async (items, scope) => {
        window.print();
      }}
      // Return existing items for the property
      onFetchExistingItems={async () => {
        return [];
      }}
      // Persist new item to backend
      onSaveItem={async (item) => {
        return { id: crypto.randomUUID(), qrCodeUrl: '/qr/item-id' };
      }}
    />
  );
}
```

## Advanced Usage

### Example 2: Handling Session Events

Comprehensive event handling with analytics and state management:

```tsx
import {
  ItemCreationWorkflow,
  CompletedSession,
  PartialSession,
  PrintScope,
} from '@/components/ItemCreationWorkflow';

function PropertyDashboard({ propertyId }: { propertyId: string }) {
  const handleSessionComplete = async (session: CompletedSession) => {
    // Log analytics for session completion
    analytics.track('workflow_completed', {
      newItemCount: session.newItems.length,
      printAction: session.printAction,
      propertyId,
    });

    // Navigate based on print action
    if (session.printAction === 'pdf') {
      // User downloaded PDF - show items with highlighting
      router.push('/items?highlight=new');
    } else if (session.printAction === 'direct') {
      // User printed directly - go to dashboard
      router.push('/dashboard');
    } else {
      // User skipped printing - show confirmation
      router.push('/dashboard?toast=items-created');
    }
  };

  const handleSessionExit = async (partial: PartialSession) => {
    // Save draft for recovery if there's meaningful progress
    if (partial.currentItem || partial.items.length > 0) {
      await draftService.save(propertyId, partial);
      toast.info('Your progress has been saved');
    }

    // Track abandonment for analytics
    analytics.track('workflow_abandoned', {
      step: partial.currentStep,
      itemsCreated: partial.items.length,
    });
  };

  return (
    <ItemCreationWorkflow
      onSessionComplete={handleSessionComplete}
      onSessionExit={handleSessionExit}
      onGeneratePDF={async (items, scope) => {
        return await pdfService.generate(items, scope);
      }}
      onPrintDirect={async (items, scope) => {
        const blob = await pdfService.generate(items, scope);
        printBlob(blob);
      }}
      onFetchExistingItems={async () => {
        return await itemService.getItems(propertyId);
      }}
      onSaveItem={async (item) => {
        return await itemService.create({ ...item, propertyId });
      }}
    />
  );
}
```

### Example 3: Backend Integration

Real-world integration with backend services:

```tsx
import {
  ItemCreationWorkflow,
  SessionItem,
  PrintScope,
} from '@/components/ItemCreationWorkflow';
import { itemService } from '@/services/itemService';
import { pdfService } from '@/services/pdfService';

function ItemCreationPage({ propertyId }: { propertyId: string }) {
  // Fetch existing items with error handling
  const handleFetchExistingItems = async (): Promise<SessionItem[]> => {
    try {
      const response = await itemService.getItemsForProperty(propertyId);
      return response.data.map((item) => ({
        id: item.id,
        name: item.name,
        room: item.room,
        itemType: item.category,
        content: item.contentPieces,
        createdAt: new Date(item.createdAt),
        qrCodeUrl: item.qrCodeUrl,
      }));
    } catch (error) {
      console.error('Failed to fetch existing items:', error);
      // Return empty array to allow workflow to proceed
      return [];
    }
  };

  // Save item with full error handling
  const handleSaveItem = async (item: SessionItem) => {
    const response = await itemService.createItem({
      name: item.name,
      room: item.room,
      itemType: item.itemType,
      content: item.content,
      propertyId,
    });

    return {
      id: response.data.id,
      qrCodeUrl: response.data.qrCodeUrl,
    };
  };

  // Generate PDF with scope handling
  const handleGeneratePDF = async (
    items: SessionItem[],
    scope: PrintScope
  ): Promise<Blob> => {
    // Determine which item IDs to include based on scope
    let itemIds: string[];
    if (scope.type === 'selected') {
      itemIds = scope.itemIds;
    } else if (scope.type === 'new-only') {
      itemIds = items.filter((i) => !i.qrCodeUrl).map((i) => i.id);
    } else {
      itemIds = items.map((i) => i.id);
    }

    return await pdfService.generateQRSheet(itemIds, {
      paperSize: 'letter',
      labelsEnabled: true,
    });
  };

  return (
    <ItemCreationWorkflow
      onFetchExistingItems={handleFetchExistingItems}
      onSaveItem={handleSaveItem}
      onGeneratePDF={handleGeneratePDF}
      onPrintDirect={async (items, scope) => {
        const blob = await handleGeneratePDF(items, scope);
        // Create object URL and open in new window for printing
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url);
        printWindow?.print();
      }}
      onSessionComplete={(session) => router.push('/dashboard')}
      onSessionExit={() => router.push('/dashboard')}
    />
  );
}
```

### Example 4: Session Resumption

Resume a previously saved draft session:

```tsx
import {
  ItemCreationWorkflow,
  WorkflowSession,
} from '@/components/ItemCreationWorkflow';

function ResumableWorkflow({ propertyId }: { propertyId: string }) {
  const [savedSession, setSavedSession] = useState<WorkflowSession | undefined>();

  useEffect(() => {
    // Load saved session on mount
    const loadDraft = async () => {
      const draft = await draftService.get(propertyId);
      if (draft) {
        setSavedSession(draft);
      }
    };
    loadDraft();
  }, [propertyId]);

  return (
    <ItemCreationWorkflow
      // Pre-populate with saved session for resumption
      initialSession={savedSession}
      onSessionComplete={async (session) => {
        // Clear draft on successful completion
        await draftService.delete(propertyId);
        router.push('/dashboard');
      }}
      onSessionExit={async (partial) => {
        // Update draft with latest progress
        await draftService.save(propertyId, partial);
      }}
      // ... other required props
    />
  );
}
```

### Example 5: Custom Configuration

Customize workflow behavior with configuration options:

```tsx
import { ItemCreationWorkflow } from '@/components/ItemCreationWorkflow';

function ConfiguredWorkflow() {
  return (
    <ItemCreationWorkflow
      // Custom configuration
      config={{
        maxItemsPerSession: 100, // Allow more items per session
        enableUrlPreview: true, // Fetch URL metadata for previews
        debug: process.env.NODE_ENV === 'development',
      }}
      // Custom styling
      className="my-custom-workflow-class"
      // ... other required props
    />
  );
}
```

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onSessionComplete` | `(session: CompletedSession) => void` | Yes | - | Called when user completes the session (with or without printing) |
| `onSessionExit` | `(session: PartialSession) => void` | Yes | - | Called when user exits mid-session |
| `onGeneratePDF` | `(items: SessionItem[], scope: PrintScope) => Promise<Blob>` | Yes | - | Generate PDF blob containing QR codes |
| `onPrintDirect` | `(items: SessionItem[], scope: PrintScope) => Promise<void>` | Yes | - | Trigger direct print action |
| `onFetchExistingItems` | `() => Promise<SessionItem[]>` | Yes | - | Fetch existing items for the property |
| `onSaveItem` | `(item: SessionItem) => Promise<{ id: string; qrCodeUrl: string }>` | Yes | - | Persist a new item to the backend |
| `initialSession` | `WorkflowSession` | No | - | Pre-populate with existing session for resumption |
| `config` | `WorkflowConfig` | No | See defaults | Configuration overrides |
| `className` | `string` | No | - | Additional CSS class for the root element |

### Configuration Options (WorkflowConfig)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxItemsPerSession` | `number` | `50` | Maximum items allowed per session |
| `enableUrlPreview` | `boolean` | `true` | Enable URL metadata fetching for previews |
| `debug` | `boolean` | `false` | Enable debug logging |

## Exported Types

### Configuration Types

- **`ItemCreationWorkflowProps`** - Main component props interface
- **`WorkflowConfig`** - Optional configuration settings

### Domain Types

- **`RoomType`** - Room type identifiers: `'kitchen'` | `'laundry'` | `'bedroom'` | `'bathroom'` | `'living-room'` | `'garage'` | `'outdoor'` | `'general'` | `'other'`
- **`ItemType`** - Item categories: `'appliance'` | `'room-item'` | `'general-info'`
- **`ContentType`** - Content type options: `'video'` | `'photo'` | `'pdf'` | `'text'` | `'url'`

### Session Types

- **`WorkflowSession`** - Complete session state including items and current step
- **`WorkflowStep`** - Step identifiers for workflow navigation
- **`CurrentItemState`** - State for the item currently being created
- **`SessionItem`** - Completed item with all data and content pieces
- **`ContentPiece`** - Individual content piece within an item
- **`ContentData`** - Type-specific content data (union type)

### Output Types

- **`CompletedSession`** - Data returned when session completes successfully
- **`PartialSession`** - Data returned when user exits mid-session
- **`PrintScope`** - Print scope selection: `'all'` | `'new-only'` | `'selected'`

## Exported Hooks

### useWorkflowState

Core state machine for managing workflow navigation and item creation.

```tsx
import { useWorkflowState } from '@/components/ItemCreationWorkflow';

const { state, dispatch, canGoBack, goBack, reset } = useWorkflowState();

// Navigate between steps
dispatch({ type: 'SELECT_ROOM', payload: 'kitchen' });
dispatch({ type: 'NEXT_STEP' });

// Go back to previous step
if (canGoBack) {
  goBack();
}
```

### useSessionPersistence

Automatic session persistence to localStorage with recovery support.

```tsx
import { useSessionPersistence } from '@/components/ItemCreationWorkflow';

const {
  isRecovering,
  hasRecoverableSession,
  recover,
  discard,
  lastSaved,
} = useSessionPersistence({
  sessionId: state.session.id,
  state,
  enabled: true,
});

// Show recovery banner if session exists
if (hasRecoverableSession) {
  return <SessionRecoveryBanner onRecover={recover} onDiscard={discard} />;
}
```

### useSuggestions

Dynamic item suggestions based on room and item type selection.

```tsx
import { useSuggestions } from '@/components/ItemCreationWorkflow';

const { suggestions, isLoading } = useSuggestions({
  room: 'kitchen',
  itemType: 'appliance',
  existingItems: sessionItems, // Exclude already-created items
});

// suggestions = ['Stove/Oven', 'Refrigerator', 'Microwave', ...]
```

### useUrlPreview

URL metadata fetching for link content previews.

```tsx
import { useUrlPreview } from '@/components/ItemCreationWorkflow';

const { status, metadata, error, retry } = useUrlPreview({
  url: 'https://example.com/manual.pdf',
  enabled: true,
});

// metadata = { title, description, thumbnailUrl, faviconUrl }
```

### useSessionQRGeneration

QR code generation for session items with progress tracking.

```tsx
import { useSessionQRGeneration } from '@/components/ItemCreationWorkflow';

const {
  status,
  stats,
  generateQRCodes,
  isGenerating,
  progress,
} = useSessionQRGeneration({
  items: session.items,
});

// stats = { total: 10, completed: 8, failed: 0 }
```

### usePDFExportSettings

PDF export configuration state management.

```tsx
import { usePDFExportSettings } from '@/components/ItemCreationWorkflow';

const { settings, updateSettings, resetSettings } = usePDFExportSettings();

// settings = { paperSize: 'letter', labelsEnabled: true, ... }
updateSettings({ paperSize: 'a4' });
```

### usePDFGeneration

PDF generation orchestration for QR code sheets.

```tsx
import { usePDFGeneration } from '@/components/ItemCreationWorkflow';

const { generate, isGenerating, progress, error } = usePDFGeneration({
  settings,
});

const blob = await generate(items, printScope);
```

## Workflow Steps

The workflow guides users through a 9-step process:

```
┌─────────────────────┐
│ 1. Room Selection   │  Select room (kitchen, bedroom, etc.)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. Item Type        │  Select category (appliance, room-item, general-info)
└──────────┬──────────┘  * Skips if "General" room selected
           ▼
┌─────────────────────┐
│ 3. Specific Item    │  Select/name specific item with suggestions
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 4. Content Source   │  Choose: "I have content" or "Create new"
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 5. Content Type     │  Select type: video, photo, PDF, text, URL
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 6. Content Creation │  Create/upload content (uses ItemCapture)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 7. Preview & Save   │  Preview item, edit name, reorder content
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 8. Next Action      │  "Add more content" | "New item" | "Done"
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 9. Session Summary  │  Review all items, generate QR codes, print
└─────────────────────┘
```

### Step Navigation

- **Back Navigation**: Available from steps 2-9 via the header back button
- **Skip Conditions**:
  - Step 2 (Item Type) skips automatically if "General" room is selected
- **Looping**: From step 8, users can loop back to add more content or create new items

## Exported Constants

```tsx
import {
  ROOM_TYPES,
  ROOM_LABELS,
  ROOM_ICONS,
  ITEM_TYPES,
  ITEM_TYPE_LABELS,
  ITEM_TYPE_DESCRIPTIONS,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  WORKFLOW_STEPS,
  WORKFLOW_CONFIG_DEFAULTS,
} from '@/components/ItemCreationWorkflow';
```

## Troubleshooting

### Session Not Persisting

**Problem**: Session data is lost when navigating away.

**Solution**: Ensure `useSessionPersistence` is enabled and localStorage is available:
```tsx
const { lastSaved } = useSessionPersistence({
  sessionId: state.session.id,
  state,
  enabled: true, // Must be true
});

// Verify saves are occurring
console.log('Last saved:', lastSaved);
```

### QR Codes Not Generating

**Problem**: QR code generation fails or shows errors.

**Solution**: Verify `onSaveItem` returns the expected shape:
```tsx
onSaveItem={async (item) => {
  const result = await api.createItem(item);
  // Must return object with id and qrCodeUrl
  return {
    id: result.id,
    qrCodeUrl: result.qrCodeUrl, // Required for QR generation
  };
}}
```

### PDF Download Fails

**Problem**: PDF generation returns empty or corrupt file.

**Solution**: Ensure `onGeneratePDF` returns a valid Blob:
```tsx
onGeneratePDF={async (items, scope) => {
  const pdfBytes = await generatePDFBytes(items, scope);
  // Must return Blob with correct MIME type
  return new Blob([pdfBytes], { type: 'application/pdf' });
}}
```

### Items Not Saving

**Problem**: Items appear to save but aren't persisted.

**Solution**: Check `onSaveItem` is async and handles errors:
```tsx
onSaveItem={async (item) => {
  try {
    const result = await itemService.create(item);
    return { id: result.id, qrCodeUrl: result.qrCodeUrl };
  } catch (error) {
    // Errors should propagate for the workflow to handle
    throw error;
  }
}}
```

## Related Documentation

- **Implementation Plan**: `docs/prd/Plan-093-Item-Creation-Workflow.md`
- **ItemCapture Component**: `src/components/ItemCapture/README.md`
- **ItemManager Component**: `src/components/ItemManager/README.md`

---

*Generated: 2026-01-05 (REQ-118 Documentation Updates)*
