# REQ-172 Manual Test Checklist

**Document Created:** 2026-01-10
**Last Modified:** 2026-01-10
**Request ID:** REQ-172
**Phase:** 6 - Integration & Polish
**Task ID:** 6.1 - End-to-End Flow Testing

---

## Purpose

This document provides a comprehensive manual testing checklist for scenarios that are difficult to fully automate, including visual inspection, mobile interactions, accessibility, and cross-browser compatibility.

---

## Test Session Information

| Field | Value |
|-------|-------|
| **Tester Name:** | ________________ |
| **Test Date:** | ________________ |
| **Environment:** | ________________ |
| **Browser/Device:** | ________________ |
| **Build Version:** | ________________ |

---

## 1. Visual Inspection Tests

### 1.1 Content Previews

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 1.1.1 | Video thumbnails display correctly (not broken images) | [ ] | [ ] | |
| 1.1.2 | Video duration badge shows correct time format (MM:SS) | [ ] | [ ] | |
| 1.1.3 | Photo previews maintain correct aspect ratio | [ ] | [ ] | |
| 1.1.4 | PDF previews show document icon with page count | [ ] | [ ] | |
| 1.1.5 | Text content shows truncated preview with ellipsis | [ ] | [ ] | |
| 1.1.6 | URL previews show favicon and domain name | [ ] | [ ] | |
| 1.1.7 | Content preview placeholders display while loading | [ ] | [ ] | |

### 1.2 Layout and Spacing

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 1.2.1 | All cards have consistent spacing/padding | [ ] | [ ] | |
| 1.2.2 | Buttons are properly aligned in all steps | [ ] | [ ] | |
| 1.2.3 | No text overflow or clipping in card titles | [ ] | [ ] | |
| 1.2.4 | Progress indicator shows correct step count (9 steps) | [ ] | [ ] | |
| 1.2.5 | Long item names truncate properly with ellipsis | [ ] | [ ] | |
| 1.2.6 | Purpose labels display fully in preview step | [ ] | [ ] | |

### 1.3 Color and Contrast

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 1.3.1 | Selected items have clear visual distinction | [ ] | [ ] | |
| 1.3.2 | Error states use red/warning colors appropriately | [ ] | [ ] | |
| 1.3.3 | Disabled buttons have reduced contrast | [ ] | [ ] | |
| 1.3.4 | Links are visually distinguishable from text | [ ] | [ ] | |

---

## 2. Animation and Transitions

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 2.1 | Step transitions are smooth (no flicker) | [ ] | [ ] | |
| 2.2 | Loading states display correctly during save | [ ] | [ ] | |
| 2.3 | Dialog open/close animations work smoothly | [ ] | [ ] | |
| 2.4 | Content preview fade-in animation works | [ ] | [ ] | |
| 2.5 | Progress bar updates smoothly between steps | [ ] | [ ] | |
| 2.6 | Card selection animation is responsive | [ ] | [ ] | |
| 2.7 | QR code generation progress animates correctly | [ ] | [ ] | |

---

## 3. Mobile Device Tests

### 3.1 Touch Interactions

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 3.1.1 | All buttons respond to tap immediately | [ ] | [ ] | |
| 3.1.2 | Card selections register on first tap | [ ] | [ ] | |
| 3.1.3 | Scroll behavior is smooth without jumps | [ ] | [ ] | |
| 3.1.4 | No double-tap zoom issues on buttons | [ ] | [ ] | |
| 3.1.5 | Swipe gestures don't interfere with step navigation | [ ] | [ ] | |
| 3.1.6 | File upload triggers native file picker | [ ] | [ ] | |
| 3.1.7 | Camera access prompts appear correctly | [ ] | [ ] | |

### 3.2 Viewport Sizes

| # | Viewport Size | Layout Correct | Touch Targets 48px+ | Notes |
|---|---------------|----------------|---------------------|-------|
| 3.2.1 | 320px width (iPhone SE) | [ ] | [ ] | |
| 3.2.2 | 375px width (iPhone X/11/12) | [ ] | [ ] | |
| 3.2.3 | 414px width (iPhone Plus/Max) | [ ] | [ ] | |
| 3.2.4 | 768px width (iPad portrait) | [ ] | [ ] | |
| 3.2.5 | 1024px width (iPad landscape) | [ ] | [ ] | |

### 3.3 Mobile-Specific UI

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 3.3.1 | Virtual keyboard doesn't obscure input fields | [ ] | [ ] | |
| 3.3.2 | Form fields scroll into view when focused | [ ] | [ ] | |
| 3.3.3 | Bottom navigation is accessible above device notch | [ ] | [ ] | |
| 3.3.4 | Safe area insets respected on notched devices | [ ] | [ ] | |

---

## 4. Accessibility Tests

### 4.1 Screen Reader Compatibility

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 4.1.1 | Step announcements read correctly on navigation | [ ] | [ ] | |
| 4.1.2 | Form labels are announced with their inputs | [ ] | [ ] | |
| 4.1.3 | Error messages are announced when they appear | [ ] | [ ] | |
| 4.1.4 | Dialog content is announced when opened | [ ] | [ ] | |
| 4.1.5 | Selected card state is announced | [ ] | [ ] | |
| 4.1.6 | Progress (e.g., "Step 4 of 9") is announced | [ ] | [ ] | |
| 4.1.7 | Purpose selection options have descriptive labels | [ ] | [ ] | |

### 4.2 Keyboard Navigation

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 4.2.1 | Tab order is logical through all steps | [ ] | [ ] | |
| 4.2.2 | Focus ring visible on all interactive elements | [ ] | [ ] | |
| 4.2.3 | Enter/Space activates buttons | [ ] | [ ] | |
| 4.2.4 | Escape closes dialogs | [ ] | [ ] | |
| 4.2.5 | Arrow keys work in card selection grids | [ ] | [ ] | |
| 4.2.6 | Skip links available for repetitive navigation | [ ] | [ ] | |

### 4.3 Focus Management

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 4.3.1 | Focus moves to new step heading on transition | [ ] | [ ] | |
| 4.3.2 | Focus is trapped within modal dialogs | [ ] | [ ] | |
| 4.3.3 | Focus returns to trigger element after dialog close | [ ] | [ ] | |
| 4.3.4 | First focusable element receives focus on step entry | [ ] | [ ] | |

### 4.4 Color and Vision

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 4.4.1 | All text meets WCAG AA contrast ratio (4.5:1) | [ ] | [ ] | |
| 4.4.2 | Color is not the only indicator of state | [ ] | [ ] | |
| 4.4.3 | Interface is usable in high-contrast mode | [ ] | [ ] | |
| 4.4.4 | Interface is usable with color blindness simulation | [ ] | [ ] | |

---

## 5. Cross-Browser Tests

### 5.1 Desktop Browsers

| # | Browser | Version | Tests Pass | Notes |
|---|---------|---------|------------|-------|
| 5.1.1 | Chrome | latest | [ ] | |
| 5.1.2 | Firefox | latest | [ ] | |
| 5.1.3 | Safari | latest | [ ] | |
| 5.1.4 | Edge | latest | [ ] | |

### 5.2 Mobile Browsers

| # | Browser | Device | Tests Pass | Notes |
|---|---------|--------|------------|-------|
| 5.2.1 | Safari | iOS (latest) | [ ] | |
| 5.2.2 | Chrome | Android (latest) | [ ] | |
| 5.2.3 | Samsung Internet | Android | [ ] | |
| 5.2.4 | Firefox | Mobile | [ ] | |

---

## 6. New Flow-Specific Tests (Plan-094)

### 6.1 Purpose Selection Step

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 6.1.1 | All 7 purpose options displayed correctly | [ ] | [ ] | |
| 6.1.2 | Purpose descriptions are visible and readable | [ ] | [ ] | |
| 6.1.3 | Icons render correctly for each purpose | [ ] | [ ] | |
| 6.1.4 | Selected purpose highlights visually | [ ] | [ ] | |
| 6.1.5 | Purpose step appears after specific item selection | [ ] | [ ] | |
| 6.1.6 | Purpose step appears before content type selection | [ ] | [ ] | |

### 6.2 Auto-Generated Titles

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 6.2.1 | Title format: "[Purpose] - [Item]" in preview | [ ] | [ ] | |
| 6.2.2 | Title updates when purpose changes via back navigation | [ ] | [ ] | |
| 6.2.3 | Custom title edits persist through workflow | [ ] | [ ] | |
| 6.2.4 | Title displays correctly in session summary | [ ] | [ ] | |

### 6.3 Unified Content Options

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 6.3.1 | All 5 content options visible in single grid | [ ] | [ ] | |
| 6.3.2 | Record Video navigates to video capture | [ ] | [ ] | |
| 6.3.3 | Take Photo navigates to photo capture | [ ] | [ ] | |
| 6.3.4 | Write Text navigates to text editor | [ ] | [ ] | |
| 6.3.5 | Upload File opens file picker | [ ] | [ ] | |
| 6.3.6 | Add Link navigates to URL input | [ ] | [ ] | |

### 6.4 Preview/Review Screen (Redesigned)

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 6.4.1 | Room field displayed and read-only | [ ] | [ ] | |
| 6.4.2 | Item Type field displayed and read-only | [ ] | [ ] | |
| 6.4.3 | Purpose field displayed and read-only | [ ] | [ ] | |
| 6.4.4 | Title field displayed and editable | [ ] | [ ] | |
| 6.4.5 | Content preview shows actual content (not placeholder) | [ ] | [ ] | |
| 6.4.6 | Save button prominently displayed | [ ] | [ ] | |
| 6.4.7 | Add More Content button visible after content added | [ ] | [ ] | |

---

## 7. Error Handling Tests

### 7.1 Network Errors

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 7.1.1 | Save failure shows retry option | [ ] | [ ] | |
| 7.1.2 | Upload failure shows clear error message | [ ] | [ ] | |
| 7.1.3 | QR generation failure allows retry | [ ] | [ ] | |
| 7.1.4 | Offline mode shows appropriate indicator | [ ] | [ ] | |

### 7.2 Validation Errors

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 7.2.1 | Empty required fields prevent progression | [ ] | [ ] | |
| 7.2.2 | Invalid URL format shows error | [ ] | [ ] | |
| 7.2.3 | File size limit exceeded shows clear message | [ ] | [ ] | |
| 7.2.4 | Unsupported file type shows helpful error | [ ] | [ ] | |

---

## 8. Performance Tests

| # | Test Case | Pass | Fail | Notes |
|---|-----------|------|------|-------|
| 8.1 | Step transitions complete in <300ms | [ ] | [ ] | |
| 8.2 | Large file uploads don't freeze UI | [ ] | [ ] | |
| 8.3 | Session with 10+ items performs well | [ ] | [ ] | |
| 8.4 | Video thumbnail generation doesn't block UI | [ ] | [ ] | |
| 8.5 | QR code generation shows progress for many items | [ ] | [ ] | |

---

## Summary

| Section | Total Tests | Passed | Failed | Skipped |
|---------|-------------|--------|--------|---------|
| Visual Inspection | 17 | | | |
| Animations | 7 | | | |
| Mobile Device | 16 | | | |
| Accessibility | 21 | | | |
| Cross-Browser | 8 | | | |
| New Flow (Plan-094) | 17 | | | |
| Error Handling | 8 | | | |
| Performance | 5 | | | |
| **TOTAL** | **99** | | | |

---

## Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tester | | | |
| QA Lead | | | |
| Developer | | | |

---

## Notes and Observations

<!-- Add any additional notes, observations, or issues discovered during testing -->

