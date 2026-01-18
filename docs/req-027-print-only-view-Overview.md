# Print-Only View Implementation Overview
*Generated: 2025-09-14 02:57:36*

## Reference
- **Request**: REQ-027 (Browser Print Including UI Elements)
- **Source**: docs/gen_requests.md
- **Type**: Bug Fix
- **Points**: 5

## Goals
1. Create dedicated print route for QR codes
2. Eliminate UI elements from print output
3. Implement automatic print triggering
4. Ensure clean window management
5. Maintain cross-browser compatibility

## Implementation Order

### Phase 1: Print Route Setup
1. Create new print route structure
2. Implement basic page component
3. Set up data passing mechanism
4. Add print-specific layout

### Phase 2: Print Component Development
1. Create minimal QR code display component
2. Implement print-optimized grid layout
3. Add label positioning
4. Configure page margins and breaks

### Phase 3: Window Management
1. Implement window opening logic
2. Add print auto-trigger mechanism
3. Handle window closing
4. Manage state preservation

### Phase 4: Integration
1. Modify existing print button behavior
2. Update navigation handling
3. Implement data transfer between windows
4. Add error handling

### Phase 5: Testing & Validation
1. Cross-browser testing
2. Print output verification
3. Window management validation
4. State preservation testing

## Authorized Files and Functions for Modification

### Print Route Files
- `src/app/print/qr-codes/[propertyId]/page.tsx` (New)
  - Main print route component
  - `PrintOnlyQRCodes` component
  - `useAutoPrint` hook

- `src/app/print/qr-codes/[propertyId]/layout.tsx` (New)
  - Print-specific layout
  - No header/footer components

### Print Components
- `src/components/PrintableQRGrid.tsx` (New)
  - `PrintableQRGrid` component
  - `QRCodeItem` subcomponent
  - Print-optimized layout logic

### Window Management
- `src/components/QRCodePrintManager.tsx`
  - `handlePrint` function
  - `openPrintWindow` function
  - Window state management

- `src/hooks/usePrintWindow.ts` (New)
  - Window management logic
  - Print auto-trigger
  - Window cleanup

### Data Management
- `src/lib/print-state.ts` (New)
  - Print data serialization
  - State transfer between windows
  - Print configuration management

### Style Files
- `src/styles/print.css`
  - Print-specific styles
  - Page layout configuration
  - Media query updates

### Integration Points
- `src/components/QRCodePrintPreview.tsx`
  - Update print button handler
  - Remove direct print calls
  - Add window management integration

## Success Validation Checklist
1. Print output contains:
   - [ ] Only QR codes
   - [ ] Correct labels
   - [ ] Proper spacing
   - [ ] No UI elements

2. Window Management:
   - [ ] Opens cleanly
   - [ ] Auto-triggers print
   - [ ] Closes after printing
   - [ ] Handles errors gracefully

3. Cross-browser Support:
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge

4. Print Layout:
   - [ ] Correct margins
   - [ ] Proper page breaks
   - [ ] Grid alignment
   - [ ] Label positioning

## Notes
- All new files must follow existing project structure
- Print route must handle authentication
- Window management must be robust across browsers
- State preservation is critical for print data
- Error handling must be comprehensive

## Dependencies
- Next.js routing
- React state management
- Browser print APIs
- Window management APIs

## Security Considerations
- Validate propertyId in print route
- Ensure proper authentication
- Sanitize data transfer between windows
- Handle window references safely
