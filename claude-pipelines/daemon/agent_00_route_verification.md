# Agent 00: Route-to-Component Verification Protocol

**Version:** 1.0
**Created:** 2026-01-12
**Purpose:** Ensure Agent 00 correctly identifies target components before creating implementation plans

---

## Overview

Before creating an implementation plan, Agent 00 MUST verify that identified components match the PRD requirements. This prevents wasted effort from targeting the wrong component.

---

## Verification Protocol

### Step 1: Review Route Trace Data

The daemon provides a `route_trace.json` file with pre-traced routes. Read this first:

```json
{
  "traces": [
    {
      "route": "/dashboard2/create",
      "page_file": "src/app/dashboard2/create/page.tsx",
      "primary_component": "ItemCreationWorkflow",
      "component_directory": "src/components/ItemCreationWorkflow"
    }
  ]
}
```

### Step 2: Verify Page File Renders Expected Component

Read the page file to confirm:

```bash
# Example verification
cat src/app/dashboard2/create/page.tsx
```

Confirm the import and JSX match:
```tsx
import { ItemCreationWorkflow } from '@/components/ItemCreationWorkflow';

export default function Page() {
  return <ItemCreationWorkflow ... />;  // ✓ Matches trace
}
```

### Step 3: Semantic Verification - Match PRD to Component

**CRITICAL:** Verify the component's behavior matches what the PRD describes.

#### Verification Checklist:

| PRD Says | Verify In Component | How to Check |
|----------|---------------------|--------------|
| "Step X of 10" | Step count | Look for `WORKFLOW_STEPS.length` or similar |
| "4 stages" | Stage count | Look for `PROGRESS_STAGES` or stage array |
| "Save Item button" | Button text | Search for button labels in component |
| Screenshot shows X | UI matches | Compare UI elements mentioned |

#### Example Verification:

**PRD States:**
> "The step counter shows 'Step X of 10'"

**Component Check:**
```bash
# Search for step count in traced component directory
grep -r "length\|steps\|STEP" src/components/ItemCreationWorkflow/
```

**If Component Shows:**
- `WORKFLOW_STEPS.length` = 10 → ✓ CORRECT component
- `PROGRESS_STAGES.length` = 4 → ✗ WRONG component (different step model)

### Step 4: Handle Mismatches

If the traced component doesn't match PRD description:

1. **Search for alternative components:**
   ```bash
   # Find all components with step/workflow patterns
   grep -rl "step.*of\|Step.*10\|WORKFLOW_STEPS" src/components/
   ```

2. **Check for multiple workflow implementations:**
   - Some projects have legacy + new components
   - The PRD route determines which is "correct"

3. **Document the mismatch:**
   ```markdown
   ## Component Verification

   ⚠️ MISMATCH DETECTED

   | Source | Component | Step Count |
   |--------|-----------|------------|
   | Route Trace | ItemCapture | 4 stages |
   | PRD Description | ??? | 10 steps |

   Searching for correct component...
   ```

4. **Find the correct component:**
   - Re-read the page file for ALL imports
   - Check if there are conditional renders
   - Look for feature flags or A/B test code

### Step 5: Document Verification in Plan

Include a verification section in every implementation plan:

```markdown
## Route-to-Component Verification

### Trace Data
- **PRD Route:** /dashboard2/create
- **Page File:** src/app/dashboard2/create/page.tsx
- **Traced Component:** ItemCreationWorkflow

### Semantic Verification
- **PRD says:** "Step X of 10"
- **Component has:** WORKFLOW_STEPS with 10 entries ✓
- **Match:** CONFIRMED

### Target Files
Based on verified component:
- src/components/ItemCreationWorkflow/utils/constants.ts
- src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx
- src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts
```

---

## Red Flags - Stop and Investigate

### 🚩 Multiple Similar Components
If you find multiple components with similar names (e.g., `ItemCapture` and `ItemCreationWorkflow`), STOP and verify which one the route actually uses.

### 🚩 Step Count Mismatch
If PRD says "10 steps" but traced component shows "4 stages", you likely have the wrong component.

### 🚩 UI Elements Don't Match
If PRD screenshots show elements not present in the traced component, investigate further.

### 🚩 Route Not Found
If the page file doesn't exist, the route might be:
- Dynamic (`[id]/page.tsx`)
- In a different location
- Protected by middleware

---

## CRITICAL: Anti-Rationalization Rules

When the PRD description doesn't match the component you find, **DO NOT rationalize the mismatch away**.

### ❌ FORBIDDEN Conclusions

| Wrong Conclusion | Why It's Wrong |
|------------------|----------------|
| "The PRD must be outdated" | PRD is source of truth - plan changes to MAKE code match |
| "The screenshot is from an older version" | Screenshots document DESIRED behavior, not current |
| "The 4-stage system is what they meant by 10 steps" | Different numbers = different concepts |
| "The child component is what matters" | Stay on the TRACED component unless verified otherwise |

### ✅ REQUIRED Approach

1. **PRD is source of truth** - The code should change to match PRD, not vice versa
2. **Traced component first** - Check the component identified by route tracer before diving into children
3. **Multiple systems exist** - Parent components may have different step/stage systems than children
4. **Plan the change** - If current code has 10 steps and PRD says 8, plan to REDUCE to 8

### Example: Step Count Confusion

**Scenario:** Route tracer finds `/dashboard2/create → ItemCreationWorkflow`

**WRONG approach:**
```
1. See ItemCreationWorkflow wraps ItemCapture
2. Check ItemCapture's PROGRESS_STAGES (4 stages)
3. PRD says "Step 9 of 10" → doesn't match 4 stages
4. Conclude "PRD must be outdated, use 4-stage model" ❌
```

**CORRECT approach:**
```
1. Check ItemCreationWorkflow.tsx directly
2. Find WORKFLOW_STEPS array with 10 entries
3. PRD says "Step 8 of 8" → plan to reduce from 10 to 8
4. Identify which steps to remove or combine
5. Note: ItemCapture's PROGRESS_STAGES is a DIFFERENT concept ✓
```

### Key Files to Check First

For workflow step count issues:
- `{ComponentName}/utils/constants.ts` - Look for STEPS arrays
- `{ComponentName}/{ComponentName}.tsx` - Main component step definitions
- `{ComponentName}/types.ts` - Step type definitions

Do NOT immediately check:
- Child component constants (may be different system)
- Progress indicators (may show stages, not steps)

---

## Verification Queries

Use these to verify components:

```bash
# Find step-related code in a component directory
grep -rn "step\|Step\|STEP" src/components/ComponentName/

# Find all page files for a route pattern
find src/app -name "page.tsx" -path "*dashboard*"

# Check what a page file imports
grep -E "^import" src/app/route/page.tsx

# Find workflow/wizard state management
grep -rl "useReducer\|useState.*step\|currentStep" src/components/

# Find progress indicators
grep -rl "progress\|Progress\|stage\|Stage" src/components/
```

---

## Integration with Daemon

The daemon calls the route tracer before invoking Agent 00:

```python
# In daemon pipeline
trace_result = trace_prd_routes(prd_path, project_root)
save_trace_result(trace_result, 'route_trace.json')

# Pass to Agent 00
agent_prompt = f"""
## Route Trace Data (Pre-verified by Daemon)

{json.dumps(trace_result, indent=2)}

## Your Task
1. Read the route trace data above
2. Perform semantic verification (Step 3)
3. Confirm or correct the component identification
4. Create implementation plan for VERIFIED component
"""
```

---

## Summary

| Layer | Responsibility | Catches |
|-------|----------------|---------|
| **Daemon (Layer 1)** | Route → Page → Component trace | Wrong file paths, missing pages |
| **Agent 00 (Layer 2)** | Semantic verification | Wrong component (similar names, legacy code) |

Both layers must pass for correct component identification.
