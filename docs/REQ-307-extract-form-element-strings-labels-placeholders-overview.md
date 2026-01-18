# REQ-307: Extract Form Element Strings for Internationalization - Implementation Overview

**Generated:** 2026-01-18 18:15:00 UTC
**Last Modified:** 2026-01-18 18:15:00 UTC
**Request Reference:** REQ-307 - Extract Form Element Strings for Internationalization
**Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md (Sub-Epic 2H, Task 2H.4)
**Status:** Ready for Implementation

---

## 1. Request Summary

Extract all form-related text including labels, placeholders, hints, validation messages, and helper text from hardcoded strings and replace them with translation keys using the `next-intl` translation function `t()`, enabling users to interact with forms in their preferred language.

**Scope:**
- Identify all form components containing hardcoded labels, placeholders, hints, and validation messages
- Extract approximately 150+ unique form-related strings across 30+ components
- Replace hardcoded strings with translation function calls
- Organize form translation keys within appropriate namespaces (`common.form`, `common.validation`, and feature-specific form namespaces)
- Ensure dynamic content within forms supports translation parameters
- Maintain form accessibility attributes with translated content

**Out of Scope:**
- Translating content to other languages (handled by Task 2H.10)
- Creating the `common` namespace structure (completed in Task 2H.1 / REQ-304)
- Extracting button labels (Task 2H.2 / REQ-305)
- Extracting modal/dialog strings (Task 2H.3 / REQ-306)
- Creating new form components

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Tailwind CSS | ^4 | `package.json` |
| Zod | (validation) | Various components |
| next-intl | (from Epic 1) | i18n framework |

### Form Components Inventory

Based on codebase analysis, the following components contain form elements with hardcoded strings:

| Component | Location | Estimated Strings | Priority |
|-----------|----------|-------------------|----------|
| LoginForm | `/src/components/LoginForm.tsx` | ~15 | High |
| RegistrationForm | `/src/components/RegistrationForm.tsx` | ~35 | High |
| AccessCodeInput | `/src/components/AccessCodeInput.tsx` | ~18 | High |
| PropertyForm | `/src/components/PropertyForm.tsx` | ~18 | High |
| ItemForm | `/src/components/ItemForm.tsx` | ~20 | High |
| MetadataStep | `/src/components/ItemCapture/components/steps/MetadataStep.tsx` | ~15 | High |
| UrlInputStep | `/src/components/ItemCapture/components/steps/UrlInputStep.tsx` | ~12 | Medium |
| AddMediaLinkForm | `/src/components/MediaManagement/AddMediaLinkForm.tsx` | ~12 | Medium |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ~20 | High |
| AddPropertyModal | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | ~18 | High |
| MailingListSignup | `/src/components/MailingListSignup.tsx` | ~10 | Medium |
| EmailPopup | `/src/components/EmailPopup.tsx` | ~12 | Medium |
| TimeRangeSelector | `/src/components/TimeRangeSelector.tsx` | ~10 | Low |
| BulkTagDialog | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | ~8 | Medium |
| BulkMoveDialog | `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | ~8 | Medium |
| FilterPanel | `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | ~10 | Medium |
| validation.ts | `/src/components/ItemCapture/utils/validation.ts` | ~20 | High |

**Total Estimated Strings:** ~150+

### Current Form Patterns

The codebase uses several form implementation patterns:

1. **Direct Label/Input Pattern** (most common):
   ```tsx
   <label htmlFor="email" className="...">Email Address</label>
   <input
     type="email"
     id="email"
     placeholder="admin@faqbnb.com"
     ...
   />
   ```

2. **Label with Required Indicator:**
   ```tsx
   <label>
     Property Nickname <span className="text-red-500">*</span>
   </label>
   ```

3. **Input with Helper Text:**
   ```tsx
   <input placeholder="e.g., Main Office" />
   <p className="text-xs text-gray-500">
     A friendly name to identify this property ({count}/100)
   </p>
   ```

4. **Inline Validation Errors:**
   ```tsx
   {errors.email && (
     <p className="text-red-600 text-sm">{errors.email}</p>
   )}
   ```

5. **Zod Schema Validation:**
   ```tsx
   const schema = z.object({
     email: z.string().email('Please enter a valid email'),
   });
   ```

### String Categories in Forms

| Category | Examples | Count (Est.) |
|----------|----------|--------------|
| Field Labels | "Email Address", "Password", "Property Name" | ~35 |
| Placeholders | "Enter your email", "e.g., Beach House" | ~30 |
| Helper Text | "A friendly name to identify...", "({count}/{max})" | ~25 |
| Validation Errors | "Email is required", "Password must be at least 6 characters" | ~40 |
| Optional Indicators | "(Optional)", "(optional)" | ~5 |
| Required Indicators | "*" (usually combined with label) | ~10 |
| Character Counters | "{count} / 5000 characters", "({count}/100)" | ~8 |
| Accessibility Labels | "Show password", "Hide password", "Close dialog" | ~10 |

---

## 3. Technical Approach

### Translation Key Organization

Form strings will be organized into the following namespace structure:

```
common
├── form                    # Shared form UI patterns
│   ├── optional
│   ├── required
│   ├── charCount
│   └── charCountWithMax
├── validation             # Shared validation messages (from REQ-304)
│   ├── required
│   ├── invalidEmail
│   ├── tooShort
│   ├── tooLong
│   └── ...

auth                       # Authentication form strings
├── login
│   ├── labels
│   ├── placeholders
│   ├── hints
│   └── errors
├── register
│   ├── labels
│   ├── placeholders
│   ├── hints
│   ├── errors
│   └── passwordStrength

properties                 # Property form strings
├── form
│   ├── labels
│   ├── placeholders
│   ├── hints
│   └── validation

items                      # Item form strings
├── form
│   ├── labels
│   ├── placeholders
│   ├── hints
│   └── validation

workflow                   # Workflow step form strings
├── metadata
│   ├── labels
│   ├── placeholders
│   └── hints
```

### Translation Pattern - Form Labels

```typescript
// Before (hardcoded)
<label htmlFor="email">
  Email Address
</label>

// After (translated)
import { useTranslations } from 'next-intl';

function LoginForm() {
  const t = useTranslations('auth.login');

  return (
    <label htmlFor="email">
      {t('labels.email')}
    </label>
  );
}
```

### Translation Pattern - Required Field Labels

```typescript
// Before
<label>
  Property Name <span className="text-red-500">*</span>
</label>

// After
const tCommon = useTranslations('common.form');

<label>
  {t('labels.propertyName')} <span className="text-red-500">{tCommon('required')}</span>
</label>
```

### Translation Pattern - Placeholders

```typescript
// Before
<input placeholder="admin@faqbnb.com" />

// After
<input placeholder={t('placeholders.email')} />
```

### Translation Pattern - Helper Text with Count

```typescript
// Before
<p className="text-xs">
  A friendly name to identify this property ({formData.nickname.length}/100)
</p>

// After
<p className="text-xs">
  {t('hints.friendlyName', { current: formData.nickname.length, max: 100 })}
</p>

// Translation key (ICU format):
{
  "hints": {
    "friendlyName": "A friendly name to identify this property ({current}/{max})"
  }
}
```

### Translation Pattern - Validation Errors

```typescript
// Before
const validateField = (name: string, value: string) => {
  if (!value) return 'Email is required';
  if (!emailRegex.test(value)) return 'Please enter a valid email address';
};

// After
const validateField = (name: string, value: string, t: ReturnType<typeof useTranslations>) => {
  if (!value) return t('validation.emailRequired');
  if (!emailRegex.test(value)) return t('validation.invalidEmail');
};

// Or using translation key references:
const validateField = (name: string, value: string) => {
  if (!value) return 'auth.login.validation.emailRequired'; // Return key
};

// Then translate at render:
{errors.email && <p>{t(errors.email)}</p>}
```

### Translation Pattern - Password Strength Indicators

```typescript
// Before
const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

// After
const t = useTranslations('auth.register.passwordStrength');
const strengthLabels = [
  t('veryWeak'),
  t('weak'),
  t('fair'),
  t('good'),
  t('strong')
];
```

### Translation Pattern - Dynamic Character Counter

```typescript
// Before
<p>{formData.address.length}/500</p>

// After
<p>{tCommon('charCountWithMax', { current: formData.address.length, max: 500 })}</p>

// Translation key:
{
  "common": {
    "form": {
      "charCountWithMax": "({current}/{max})"
    }
  }
}
```

### Translation Pattern - Accessibility Labels

```typescript
// Before
<button aria-label="Show password">

// After
<button aria-label={t('a11y.showPassword')}>
```

---

## 4. Implementation Tasks

### Task 2H.4.1: Create `common.form` and extend `common.validation` namespaces

**Purpose:** Establish shared form UI patterns and validation messages

**Keys to add:**
```json
{
  "common": {
    "form": {
      "optional": "(Optional)",
      "required": "*",
      "charCount": "{current} characters",
      "charCountWithMax": "({current}/{max})",
      "maxChars": "Maximum {max} characters",
      "minChars": "Minimum {min} characters",
      "showPassword": "Show password",
      "hidePassword": "Hide password",
      "selectPlaceholder": "Select...",
      "searchPlaceholder": "Search...",
      "typePlaceholder": "Type here...",
      "enterPlaceholder": "Enter {field}..."
    },
    "validation": {
      "required": "This field is required",
      "fieldRequired": "{field} is required",
      "invalidEmail": "Please enter a valid email address",
      "invalidUrl": "Please enter a valid URL",
      "invalidPhone": "Please enter a valid phone number",
      "tooShort": "Must be at least {min} characters",
      "tooLong": "Must be {max} characters or less",
      "currentLength": " (current: {current})",
      "passwordMismatch": "Passwords do not match",
      "passwordsMatch": "Passwords match",
      "invalidFormat": "Invalid format",
      "maxItems": "Maximum {max} items allowed",
      "minItems": "At least {min} item required"
    }
  }
}
```

**File:** `/messages/en.json`
**Estimated Time:** 20 minutes

### Task 2H.4.2: Extract LoginForm strings

**File:** `/src/components/LoginForm.tsx`
**Complexity:** Medium

**Strings to extract:**
- Labels: "Email Address", "Password"
- Placeholders: "admin@faqbnb.com", "Enter your password"
- Checkbox: "Remember me for 30 days"
- Helper: "Access restricted to authorized administrators only"
- Divider: "Or continue with email", "Sign in with your account"
- Validation: "Email is required", "Please enter a valid email address", "Password is required", "Password must be at least 6 characters"
- Errors: "Authentication Failed", "Invalid email or password...", "Access denied..."
- Accessibility: button aria-labels for show/hide password

**Estimated Time:** 25 minutes

### Task 2H.4.3: Extract RegistrationForm strings

**File:** `/src/components/RegistrationForm.tsx`
**Complexity:** High (largest form component)

**Strings to extract:**
- Labels: "Email Address", "Full Name (optional)", "Password", "Confirm Password"
- Placeholders: "John Doe", "Create a strong password", "Confirm your password"
- Helper: "This email is linked to your access code and cannot be changed.", "Your account will be linked to your verified access code"
- Info badge: "Access code verified: {code}..."
- Terms: "I agree to the", "Terms of Service", "and", "Privacy Policy"
- Registration methods: "Continue with Google", "Quick sign-up using your Google account", "Sign up with email", "Create a password for your account", "Choose how to create your account"
- Password strength: "Password strength:", "Very Weak", "Weak", "Fair", "Good", "Strong", "Requirements:", "At least 8 characters", "One lowercase letter", "One uppercase letter", "One number", "One special character"
- Password match: "Passwords match", "Passwords do not match"
- Validation: All password validation messages, terms checkbox validation
- Loading: "Connecting to Google...", "Creating Account..."

**Estimated Time:** 45 minutes

### Task 2H.4.4: Extract AccessCodeInput strings

**File:** `/src/components/AccessCodeInput.tsx`
**Complexity:** Medium

**Strings to extract:**
- Labels: "Access Code *", "Email Address *"
- Placeholders: "Enter your 8+ character access code", "Enter your email address"
- Validation: "Access code is required", "Access code should be 8+ characters", "Access code should contain only letters and numbers", "Valid access code format", "Email is required", "Please enter a valid email address", "Valid email format"
- Helper: "Access code should be 8+ characters long and contain only letters and numbers"
- Info: "Manual Registration Entry", "Enter your access code and email address to proceed with registration."
- Link: "Request beta access here"
- Toggle: "Show access code", "Hide access code"

**Estimated Time:** 25 minutes

### Task 2H.4.5: Extract PropertyForm strings

**File:** `/src/components/PropertyForm.tsx`
**Complexity:** Medium

**Strings to extract:**
- Title: "Edit Property", "Create New Property"
- Labels: "Property Owner *", "Property Nickname *", "Property Type *", "Address (Optional)"
- Placeholders: "Select property owner...", "e.g., Main Office, Home, Vacation House", "Select property type...", "e.g., 123 Main St, Anytown, State 12345"
- Helper: "Property owner cannot be changed after creation", "A friendly name to identify this property ({current}/100)", "Physical address or location description ({current}/500)"
- Validation: "Property nickname is required", "Property nickname must be 100 characters or less", "Property type is required", "Address must be 500 characters or less"
- Loading: "Updating...", "Creating..."

**Estimated Time:** 25 minutes

### Task 2H.4.6: Extract ItemForm strings

**File:** `/src/components/ItemForm.tsx`
**Complexity:** Medium

**Strings to extract:**
- Labels: "Public ID *", "Item Name *", "Property *", "Description", "QR Code Image URL (optional)"
- Placeholders: "UUID will be generated automatically", "e.g., Samsung Washing Machine", "Select a property...", "Describe the item, its location, or any important details...", "https://example.com/qr-code.png"
- Helper: "This UUID will be used in the QR code URL", "Select the property where this item is located. Items must belong to a property.", "URL to the QR code image for this item. Leave empty if no QR code is available."
- Warning: "No properties available. Please create a property first before adding items."
- Section: "Resources & Links", "Add Link", "Add Your First Resource", "No resources added yet"
- Validation: "Public ID is required", "Public ID must be a valid UUID format", "Name is required", "Property selection is required", "Please enter a valid QR code image URL"
- Button title: "Generate new UUID"

**Estimated Time:** 30 minutes

### Task 2H.4.7: Extract MetadataStep strings

**File:** `/src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Complexity:** Medium

**Strings to extract:**
- Labels: "Item Name *", "Content Purpose (optional)", "Room (optional)", "Item Type (optional)", "Tags (optional)"
- Placeholders: "e.g., Coffee Machine", "Select or type a room...", "Add tags..."
- Helper: "What is this item? (e.g., appliance, furniture, equipment)", "Where is this item located?", "Categorize your item"
- Validation: "Item name is required", "Item name must be {max} characters or less", "Location must be {max} characters or less", "Maximum {max} tags allowed", "Each tag must be {max} characters or less"

**Estimated Time:** 20 minutes

### Task 2H.4.8: Extract UrlInputStep strings

**File:** `/src/components/ItemCapture/components/steps/UrlInputStep.tsx`
**Complexity:** Low

**Strings to extract:**
- Labels: "Add Link"
- Placeholders: "Paste URL here... (https://...)"
- Helper: "Paste a link to include in your item"
- Validation: "Invalid URL", "Please enter a valid URL"
- Error: "Failed to fetch URL metadata", "Network error - retrying..."

**Estimated Time:** 15 minutes

### Task 2H.4.9: Extract AddMediaLinkForm strings

**File:** `/src/components/MediaManagement/AddMediaLinkForm.tsx`
**Complexity:** Low

**Strings to extract:**
- Labels: "Title *", "URL *", "Type", "Thumbnail URL (optional)"
- Placeholders: "e.g., Product Manual", "https://...", "https://... (optional)"
- Helper: "Type is auto-detected from URL but can be changed", "Leave empty to auto-generate thumbnails"
- Validation: "Title is required", "Please enter a valid URL"
- Button: "+ Add custom thumbnail"

**Estimated Time:** 15 minutes

### Task 2H.4.10: Extract PropertyEditModal form strings

**File:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
**Complexity:** Medium

**Strings to extract:**
- Labels: "Property Name", "Address Line 1", "Address Line 2", "City", "State/Province", "Postal Code", "Country"
- Placeholders: "e.g., Beach House", "Street address", "Apt, suite, unit, etc. (optional)", "City", "State or Province", "ZIP / Postal code", "Select country..."
- Validation: "Property name is required", "must be X characters or less", validation for each field
- Accessibility: "Close modal"

**Note:** Many strings may overlap with Task 2H.3 (modal task) - coordinate to avoid duplication.

**Estimated Time:** 25 minutes

### Task 2H.4.11: Extract AddPropertyModal form strings

**File:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
**Complexity:** Medium

**Strings to extract:**
- Same form labels/placeholders as PropertyEditModal
- Additional: form creation-specific messages

**Estimated Time:** 20 minutes

### Task 2H.4.12: Extract MailingListSignup strings

**File:** `/src/components/MailingListSignup.tsx`
**Complexity:** Low

**Strings to extract:**
- Title: "Stay Updated"
- Description: "Be the first to know when FAQBNB opens to the public."
- Placeholder: "Enter your email address"
- Validation: "Please enter your email address.", "Please enter a valid email address."
- Success: "Successfully Subscribed!", "Thank you for subscribing!"
- Helper: "We respect your privacy. Unsubscribe at any time.", "Confirmation sent to: {email}"
- Loading: "Subscribing..."

**Estimated Time:** 15 minutes

### Task 2H.4.13: Extract EmailPopup form strings

**File:** `/src/components/EmailPopup.tsx`
**Complexity:** Low

**Strings to extract:**
- Labels: "Subject", "Message Body"
- Placeholders: "Enter email subject...", "Enter email message..."
- Helper: "{count} / 10,000 characters", "Available Variables:", "Access code is automatically included", "Requester name and account info are pre-filled", "Registration links are automatically generated"
- Error: "Please fix the following errors:"

**Estimated Time:** 15 minutes

### Task 2H.4.14: Extract TimeRangeSelector strings

**File:** `/src/components/TimeRangeSelector.tsx`
**Complexity:** Low

**Strings to extract:**
- Heading: "Time Range"
- Helper: "Select the time period for analytics data", "Selected: {description}"
- Options: "24 Hours" / "Last 24 hours", "7 Days" / "Last 7 days", "30 Days" / "Last 30 days", "1 Year" / "Last 12 months"
- Accessibility: "{label} - {description}", "Use arrow keys to navigate between time range options. Press Enter or Space to select."

**Estimated Time:** 15 minutes

### Task 2H.4.15: Extract BulkTagDialog form strings

**File:** `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
**Complexity:** Low

**Strings to extract:**
- Labels: "Enter tags to add:", "Select tags to remove:"
- Placeholder: "Type a tag and press Enter...", "Max {count} tags"
- Helper: "Suggested tags:"
- Accessibility: "Remove {tag} tag"

**Estimated Time:** 10 minutes

### Task 2H.4.16: Extract BulkMoveDialog form strings

**File:** `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
**Complexity:** Low

**Strings to extract:**
- Labels: "Destination property"
- Placeholder: "Select destination property..."
- Empty: "No properties available", "No other properties available"
- Accessibility: "Select destination property", "Available properties"

**Estimated Time:** 10 minutes

### Task 2H.4.17: Extract FilterPanel form strings

**File:** `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
**Complexity:** Low

**Strings to extract:**
- Sections: "Content Type", "Tags", "Location", "Property"
- Placeholder: "Search..."
- Empty: "No results found"
- Helper: "Filter items to find what you're looking for"

**Estimated Time:** 10 minutes

### Task 2H.4.18: Extract validation.ts utility strings

**File:** `/src/components/ItemCapture/utils/validation.ts`
**Complexity:** Medium

**Strings to extract:**
- All validation error messages used across ItemCapture components
- File validation: "File exceeds {limit} limit (current: {size})", "Total upload size ({size}) exceeds {limit} limit", "File type '{type}' is not supported for {category}"
- Text validation: "Instructions exceed {max} character limit (current: {count})", "Title is required", "Title must be {max} characters or less (current: {count})"
- URL validation: "URL is required", "Invalid URL format", "Only http and https URLs are allowed", "URL exceeds {max} character limit"
- Count limits: "Maximum {max} links allowed (current: {count})", "Maximum {max} photos allowed (current: {count})"
- Content validation: "At least one media item, link, or text instructions must be provided"
- Helper: "Remaining size: {size}", "Current size: {size}"

**Estimated Time:** 25 minutes

### Task 2H.4.19: Update translation files with all form keys

**Files:** `/messages/en.json`
**Complexity:** Medium

**Actions:**
- Add all form-specific keys organized by namespace
- Ensure ICU format for dynamic strings (counts, sizes)
- Validate JSON syntax
- Verify no duplicate keys

**Estimated Time:** 30 minutes

### Task 2H.4.20: Verification and Testing

**Actions:**
- TypeScript compilation check (`npm run build`)
- Verify all forms render correctly
- Test validation messages display properly
- Check character counters work with translations
- Verify accessibility labels are translated
- Spot-check key form flows (login, registration, property creation)

**Estimated Time:** 45 minutes

---

## 5. Authorized Files and Functions for Modification

### Files to MODIFY - Translation File

| File Path | Description | Modification |
|-----------|-------------|--------------|
| `/messages/en.json` | English translation file | Add `common.form`, extend `common.validation`, add feature-specific form keys |

### Files to MODIFY - Authentication Components

| File Path | Strings (Est.) | Functions to Modify |
|-----------|----------------|---------------------|
| `/src/components/LoginForm.tsx` | ~15 | `validateField()`, JSX return |
| `/src/components/RegistrationForm.tsx` | ~35 | All validation functions, password strength logic, JSX return |
| `/src/components/AccessCodeInput.tsx` | ~18 | Validation functions, JSX return |

### Files to MODIFY - Property Components

| File Path | Strings (Est.) | Functions to Modify |
|-----------|----------------|---------------------|
| `/src/components/PropertyForm.tsx` | ~18 | `validateForm()`, JSX return |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ~20 | Form validation, JSX return |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | ~18 | Form validation, JSX return |

### Files to MODIFY - Item Components

| File Path | Strings (Est.) | Functions to Modify |
|-----------|----------------|---------------------|
| `/src/components/ItemForm.tsx` | ~20 | Validation functions, JSX return |
| `/src/components/ItemCapture/components/steps/MetadataStep.tsx` | ~15 | Validation, JSX return |
| `/src/components/ItemCapture/components/steps/UrlInputStep.tsx` | ~12 | Validation, JSX return |
| `/src/components/MediaManagement/AddMediaLinkForm.tsx` | ~12 | Validation, JSX return |

### Files to MODIFY - Dashboard/Analytics Components

| File Path | Strings (Est.) | Functions to Modify |
|-----------|----------------|---------------------|
| `/src/components/MailingListSignup.tsx` | ~10 | Validation, JSX return |
| `/src/components/EmailPopup.tsx` | ~12 | JSX return |
| `/src/components/TimeRangeSelector.tsx` | ~10 | JSX return |

### Files to MODIFY - Bulk Action Components

| File Path | Strings (Est.) | Functions to Modify |
|-----------|----------------|---------------------|
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | ~8 | JSX return |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | ~8 | JSX return |
| `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | ~10 | JSX return |

### Files to MODIFY - Utility Files

| File Path | Strings (Est.) | Functions to Modify |
|-----------|----------------|---------------------|
| `/src/components/ItemCapture/utils/validation.ts` | ~20 | All validation functions that return error messages |

### Files NOT to Modify

- `/messages/fr.json`, `/messages/es.json`, etc. (handled by Task 2H.10)
- Test files (`*.test.tsx`) - will be updated separately
- Button-only modifications (covered by Task 2H.2)
- Modal-only strings without form elements (covered by Task 2H.3)
- Type definition files unless necessary for translation params

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Description | Status |
|------|-------------|--------|
| Epic 1 - Foundation | i18n Framework Integration | Must be completed first |
| REQ-229 | Install and configure next-intl | Must be completed |
| REQ-304 / Task 2H.1 | Create common namespace structure | Must be completed |
| REQ-305 / Task 2H.2 | Extract button labels | Should be completed (button strings in forms) |
| REQ-306 / Task 2H.3 | Extract modal/dialog strings | Should be completed (modal forms overlap) |

**Note:** This task uses `common.actions` and `common.validation` keys from REQ-304. Verify these keys exist before implementation. Some form strings in modals may already be extracted in Task 2H.3.

### Downstream Dependencies (Tasks blocked by this)

| Task | Description | Dependency |
|------|-------------|------------|
| Task 2H.10 | Generate translations for 5 non-English languages | Form keys must be in en.json |
| Sub-Epic 2A | Authentication component translations | Auth forms must be updated |
| Sub-Epic 2F | Property management translations | Property forms must be updated |

---

## 7. Acceptance Criteria

From REQ-307 in gen_requests_epic2.md:

- [ ] All form components across the application have been identified and their text elements catalogued
- [ ] Form field labels are extracted to translation keys and replaced with translation function calls
- [ ] Placeholder text for all input fields uses translation keys instead of hardcoded strings
- [ ] Hint text and helper text associated with form fields are internationalized
- [ ] Validation error messages for all form inputs are extracted to translation keys
- [ ] Success messages and confirmation text related to form submission are internationalized
- [ ] Common form fields share consistent translation keys across different forms where appropriate
- [ ] Translation files include organized sections for form-related strings with clear naming conventions
- [ ] Field-specific validation messages can accept dynamic parameters when needed
- [ ] All form functionality including validation behavior remains unchanged after string extraction
- [ ] Form accessibility attributes that reference text content are properly maintained
- [ ] Required field indicators and optional field markers use translation keys

### Additional Verification Criteria

- [ ] All ~150+ form strings extracted and replaced with translation keys
- [ ] ICU format used correctly for dynamic strings (counts, sizes, limits)
- [ ] Character counters work correctly with translated format strings
- [ ] Password strength indicators use translated labels
- [ ] Accessibility labels (aria-label, sr-only) are translated
- [ ] JSON translation file remains valid after additions
- [ ] Build succeeds without errors
- [ ] All forms render correctly in development
- [ ] Validation messages display correctly on form submission errors

---

## 8. Testing Strategy

### Pre-Implementation Verification

```bash
# Verify Epic 1 is complete
npm list next-intl

# Verify common namespace exists with validation keys
cat messages/en.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
if 'common' not in d:
    print('ERROR: common namespace missing')
    sys.exit(1)
if 'validation' not in d.get('common', {}):
    print('WARNING: common.validation namespace missing - will be created')
print('Prerequisites verified')
"
```

### Post-Implementation Verification

```bash
# Validate JSON syntax
cat messages/en.json | python3 -m json.tool > /dev/null && echo "Valid JSON"

# Build verification
npm run build

# Start dev server and manually test forms
npm run dev
```

### Manual Testing Checklist

For each form component, verify:

- [ ] All labels display correctly
- [ ] All placeholders display correctly
- [ ] All helper/hint text displays correctly
- [ ] Character counters update correctly with proper format
- [ ] Validation errors display correctly
- [ ] Required indicators (*) display correctly
- [ ] Optional indicators display correctly
- [ ] Dynamic content (counts, names) interpolates correctly
- [ ] Password show/hide toggle accessibility labels work
- [ ] Form submission still works correctly
- [ ] Tab order and keyboard navigation still works
- [ ] Screen reader announces correct content

### Component-Specific Test Cases

| Component | Test Cases |
|-----------|------------|
| LoginForm | Test all validation errors, remember me checkbox, password visibility toggle |
| RegistrationForm | Test password strength meter, password match indicator, all validation states |
| AccessCodeInput | Test access code format validation, email validation |
| PropertyForm | Test character counter updates, required field validation |
| ItemForm | Test UUID generation, property dropdown, resource links section |
| MetadataStep | Test tag input, room selector, character limits |
| UrlInputStep | Test URL validation, error states |

---

## 9. Translation Keys Reference

### New Keys to Add to `/messages/en.json`

```json
{
  "common": {
    "form": {
      "optional": "(Optional)",
      "required": "*",
      "charCount": "{current} characters",
      "charCountWithMax": "({current}/{max})",
      "maxChars": "Maximum {max} characters",
      "minChars": "Minimum {min} characters",
      "showPassword": "Show password",
      "hidePassword": "Hide password",
      "selectPlaceholder": "Select...",
      "searchPlaceholder": "Search...",
      "noResults": "No results found",
      "or": "or",
      "and": "and"
    },
    "validation": {
      "required": "This field is required",
      "fieldRequired": "{field} is required",
      "invalidEmail": "Please enter a valid email address",
      "validEmailFormat": "Valid email format",
      "invalidUrl": "Please enter a valid URL",
      "invalidUrlFormat": "Invalid URL format",
      "urlRequired": "URL is required",
      "onlyHttpHttps": "Only http and https URLs are allowed",
      "tooShort": "Must be at least {min} characters",
      "tooLong": "Must be {max} characters or less",
      "currentLength": " (current: {current})",
      "passwordMismatch": "Passwords do not match",
      "passwordsMatch": "Passwords match",
      "invalidFormat": "Invalid format",
      "maxItems": "Maximum {max} items allowed (current: {current})",
      "minItems": "At least {min} item required",
      "fileTooLarge": "File exceeds {limit} limit (current: {size})",
      "totalSizeExceeded": "Total upload size ({size}) exceeds {limit} limit",
      "invalidFileType": "File type '{type}' is not supported for {category}",
      "contentRequired": "At least one media item, link, or text instructions must be provided"
    }
  },
  "auth": {
    "login": {
      "labels": {
        "email": "Email Address",
        "password": "Password",
        "rememberMe": "Remember me for 30 days"
      },
      "placeholders": {
        "email": "admin@faqbnb.com",
        "password": "Enter your password"
      },
      "hints": {
        "signInWith": "Sign in with your account",
        "orContinueWith": "Or continue with email",
        "accessRestricted": "Access restricted to authorized administrators only"
      },
      "validation": {
        "emailRequired": "Email is required",
        "invalidEmail": "Please enter a valid email address",
        "passwordRequired": "Password is required",
        "passwordTooShort": "Password must be at least 6 characters"
      },
      "errors": {
        "authFailed": "Authentication Failed",
        "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
        "accessDenied": "Access denied. Admin privileges are required."
      }
    },
    "register": {
      "labels": {
        "email": "Email Address",
        "fullName": "Full Name",
        "fullNameOptional": "Full Name (optional)",
        "password": "Password",
        "confirmPassword": "Confirm Password",
        "termsAgree": "I agree to the",
        "termsOfService": "Terms of Service",
        "privacyPolicy": "Privacy Policy"
      },
      "placeholders": {
        "fullName": "John Doe",
        "password": "Create a strong password",
        "confirmPassword": "Confirm your password"
      },
      "hints": {
        "emailLinked": "This email is linked to your access code and cannot be changed.",
        "accountLinked": "Your account will be linked to your verified access code",
        "accessCodeVerified": "Access code verified: {code}...",
        "chooseMethod": "Choose how to create your account"
      },
      "methods": {
        "google": "Continue with Google",
        "googleDescription": "Quick sign-up using your Google account",
        "email": "Sign up with email",
        "emailDescription": "Create a password for your account"
      },
      "passwordStrength": {
        "label": "Password strength:",
        "veryWeak": "Very Weak",
        "weak": "Weak",
        "fair": "Fair",
        "good": "Good",
        "strong": "Strong",
        "requirements": "Requirements:",
        "minChars": "At least 8 characters",
        "lowercase": "One lowercase letter",
        "uppercase": "One uppercase letter",
        "number": "One number",
        "special": "One special character"
      },
      "validation": {
        "passwordRequired": "Password is required",
        "passwordMinLength": "Password must be at least 8 characters",
        "passwordLowercase": "Password must contain at least one lowercase letter",
        "passwordUppercase": "Password must contain at least one uppercase letter",
        "passwordNumber": "Password must contain at least one number",
        "confirmRequired": "Please confirm your password",
        "passwordMismatch": "Passwords do not match",
        "nameTooShort": "Name must be at least 2 characters",
        "termsRequired": "You must agree to the terms and conditions"
      },
      "loading": {
        "connectingGoogle": "Connecting to Google...",
        "creatingAccount": "Creating Account..."
      }
    },
    "accessCode": {
      "labels": {
        "accessCode": "Access Code",
        "email": "Email Address"
      },
      "placeholders": {
        "accessCode": "Enter your 8+ character access code",
        "email": "Enter your email address"
      },
      "hints": {
        "format": "Access code should be 8+ characters long and contain only letters and numbers",
        "manualEntry": "Manual Registration Entry",
        "instructions": "Enter your access code and email address to proceed with registration.",
        "requestAccess": "Request beta access here"
      },
      "validation": {
        "required": "Access code is required",
        "tooShort": "Access code should be 8+ characters",
        "invalidFormat": "Access code should contain only letters and numbers",
        "validFormat": "Valid access code format",
        "emailRequired": "Email is required",
        "invalidEmail": "Please enter a valid email address",
        "validEmail": "Valid email format"
      },
      "toggle": {
        "show": "Show access code",
        "hide": "Hide access code"
      }
    }
  },
  "properties": {
    "form": {
      "titles": {
        "create": "Create New Property",
        "edit": "Edit Property"
      },
      "labels": {
        "owner": "Property Owner",
        "nickname": "Property Nickname",
        "type": "Property Type",
        "address": "Address"
      },
      "placeholders": {
        "selectOwner": "Select property owner...",
        "nickname": "e.g., Main Office, Home, Vacation House",
        "selectType": "Select property type...",
        "address": "e.g., 123 Main St, Anytown, State 12345",
        "addressLine1": "Street address",
        "addressLine2": "Apt, suite, unit, etc. (optional)",
        "city": "City",
        "state": "State or Province",
        "postalCode": "ZIP / Postal code",
        "selectCountry": "Select country..."
      },
      "hints": {
        "ownerLocked": "Property owner cannot be changed after creation",
        "friendlyName": "A friendly name to identify this property ({current}/{max})",
        "addressDescription": "Physical address or location description ({current}/{max})"
      },
      "validation": {
        "nicknameRequired": "Property nickname is required",
        "nicknameTooLong": "Property nickname must be {max} characters or less",
        "typeRequired": "Property type is required",
        "addressTooLong": "Address must be {max} characters or less"
      },
      "loading": {
        "creating": "Creating...",
        "updating": "Updating..."
      }
    }
  },
  "items": {
    "form": {
      "labels": {
        "publicId": "Public ID",
        "name": "Item Name",
        "property": "Property",
        "description": "Description",
        "qrCodeUrl": "QR Code Image URL"
      },
      "placeholders": {
        "publicId": "UUID will be generated automatically",
        "name": "e.g., Samsung Washing Machine",
        "selectProperty": "Select a property...",
        "description": "Describe the item, its location, or any important details...",
        "qrCodeUrl": "https://example.com/qr-code.png"
      },
      "hints": {
        "uuidUsage": "This UUID will be used in the QR code URL",
        "propertyRequired": "Select the property where this item is located. Items must belong to a property.",
        "qrCodeOptional": "URL to the QR code image for this item. Leave empty if no QR code is available."
      },
      "warnings": {
        "noProperties": "No properties available. Please create a property first before adding items."
      },
      "sections": {
        "resources": "Resources & Links",
        "addLink": "Add Link",
        "addFirstResource": "Add Your First Resource",
        "noResources": "No resources added yet"
      },
      "validation": {
        "publicIdRequired": "Public ID is required",
        "invalidUuid": "Public ID must be a valid UUID format",
        "nameRequired": "Name is required",
        "propertyRequired": "Property selection is required",
        "invalidQrUrl": "Please enter a valid QR code image URL"
      },
      "actions": {
        "generateUuid": "Generate new UUID"
      }
    }
  },
  "workflow": {
    "metadata": {
      "labels": {
        "itemName": "Item Name",
        "purpose": "Content Purpose",
        "room": "Room",
        "itemType": "Item Type",
        "tags": "Tags"
      },
      "placeholders": {
        "itemName": "e.g., Coffee Machine",
        "selectRoom": "Select or type a room...",
        "addTags": "Add tags..."
      },
      "hints": {
        "whatIsItem": "What is this item? (e.g., appliance, furniture, equipment)",
        "whereLocated": "Where is this item located?",
        "categorize": "Categorize your item"
      },
      "validation": {
        "nameRequired": "Item name is required",
        "nameTooLong": "Item name must be {max} characters or less",
        "locationTooLong": "Location must be {max} characters or less",
        "maxTags": "Maximum {max} tags allowed",
        "tagTooLong": "Each tag must be {max} characters or less"
      }
    },
    "urlInput": {
      "labels": {
        "addLink": "Add Link"
      },
      "placeholders": {
        "pasteUrl": "Paste URL here... (https://...)"
      },
      "hints": {
        "pasteLink": "Paste a link to include in your item"
      },
      "validation": {
        "invalidUrl": "Invalid URL",
        "enterValidUrl": "Please enter a valid URL"
      },
      "errors": {
        "fetchFailed": "Failed to fetch URL metadata",
        "networkRetry": "Network error - retrying..."
      }
    }
  },
  "media": {
    "linkForm": {
      "labels": {
        "title": "Title",
        "url": "URL",
        "type": "Type",
        "thumbnail": "Thumbnail URL"
      },
      "placeholders": {
        "title": "e.g., Product Manual",
        "url": "https://...",
        "thumbnail": "https://... (optional)"
      },
      "hints": {
        "autoDetect": "Type is auto-detected from URL but can be changed",
        "thumbnailAuto": "Leave empty to auto-generate thumbnails"
      },
      "validation": {
        "titleRequired": "Title is required",
        "invalidUrl": "Please enter a valid URL"
      },
      "actions": {
        "addThumbnail": "+ Add custom thumbnail"
      }
    }
  },
  "mailing": {
    "signup": {
      "title": "Stay Updated",
      "description": "Be the first to know when FAQBNB opens to the public.",
      "placeholder": "Enter your email address",
      "validation": {
        "required": "Please enter your email address.",
        "invalid": "Please enter a valid email address."
      },
      "success": {
        "title": "Successfully Subscribed!",
        "message": "Thank you for subscribing!",
        "confirmation": "Confirmation sent to: {email}"
      },
      "hints": {
        "privacy": "We respect your privacy. Unsubscribe at any time."
      },
      "loading": "Subscribing..."
    }
  },
  "email": {
    "popup": {
      "labels": {
        "subject": "Subject",
        "body": "Message Body"
      },
      "placeholders": {
        "subject": "Enter email subject...",
        "body": "Enter email message..."
      },
      "hints": {
        "charCount": "{count} / {max} characters",
        "variables": "Available Variables:",
        "accessCodeAuto": "Access code is automatically included",
        "requesterAuto": "Requester name and account info are pre-filled",
        "linksAuto": "Registration links are automatically generated"
      },
      "errors": {
        "fixErrors": "Please fix the following errors:"
      }
    }
  },
  "analytics": {
    "timeRange": {
      "heading": "Time Range",
      "hint": "Select the time period for analytics data",
      "selected": "Selected: {description}",
      "options": {
        "24h": "24 Hours",
        "24hDesc": "Last 24 hours",
        "7d": "7 Days",
        "7dDesc": "Last 7 days",
        "30d": "30 Days",
        "30dDesc": "Last 30 days",
        "1y": "1 Year",
        "1yDesc": "Last 12 months"
      },
      "a11y": {
        "optionLabel": "{label} - {description}",
        "instructions": "Use arrow keys to navigate between time range options. Press Enter or Space to select."
      }
    }
  },
  "filters": {
    "panel": {
      "sections": {
        "contentType": "Content Type",
        "tags": "Tags",
        "location": "Location",
        "property": "Property"
      },
      "placeholders": {
        "search": "Search..."
      },
      "empty": {
        "noResults": "No results found"
      },
      "hints": {
        "findItems": "Filter items to find what you're looking for"
      }
    }
  },
  "bulk": {
    "tagDialog": {
      "labels": {
        "enterTags": "Enter tags to add:",
        "selectTags": "Select tags to remove:"
      },
      "placeholders": {
        "typeTag": "Type a tag and press Enter...",
        "maxTags": "Max {count} tags"
      },
      "hints": {
        "suggested": "Suggested tags:"
      },
      "a11y": {
        "removeTag": "Remove {tag} tag"
      }
    },
    "moveDialog": {
      "labels": {
        "destination": "Destination property"
      },
      "placeholders": {
        "select": "Select destination property..."
      },
      "empty": {
        "noProperties": "No properties available",
        "noOther": "No other properties available"
      },
      "a11y": {
        "selectLabel": "Select destination property",
        "available": "Available properties"
      }
    }
  }
}
```

### Keys to Reuse from `common` Namespace

The following keys from `common` namespace (REQ-304) should be reused:

- `common.actions.cancel`
- `common.actions.save`
- `common.actions.submit`
- `common.actions.create`
- `common.actions.update`
- `common.validation.required` (extend with form-specific versions)

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys at runtime | Medium | High | Verify all keys exist before build; use fallback to English |
| ICU format syntax errors | Medium | High | Validate ICU syntax; test dynamic strings thoroughly |
| Breaking form validation | Low | High | Test each form validation flow after changes |
| Accessibility regressions | Low | Medium | Verify aria-labels are translated; test with screen reader |
| Character counter display issues | Medium | Low | Test counter format strings with various values |
| Password strength indicator issues | Low | Medium | Test all strength levels display correctly |
| Zod schema translation complexity | Medium | Medium | May need helper function to return translation keys from schemas |
| Overlapping strings with Tasks 2H.2/2H.3 | Medium | Low | Coordinate with modal and button task implementations |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Task 2H.4.1: Create common.form namespace | 20 min |
| Task 2H.4.2: LoginForm | 25 min |
| Task 2H.4.3: RegistrationForm | 45 min |
| Task 2H.4.4: AccessCodeInput | 25 min |
| Task 2H.4.5: PropertyForm | 25 min |
| Task 2H.4.6: ItemForm | 30 min |
| Task 2H.4.7: MetadataStep | 20 min |
| Task 2H.4.8: UrlInputStep | 15 min |
| Task 2H.4.9: AddMediaLinkForm | 15 min |
| Task 2H.4.10: PropertyEditModal | 25 min |
| Task 2H.4.11: AddPropertyModal | 20 min |
| Task 2H.4.12: MailingListSignup | 15 min |
| Task 2H.4.13: EmailPopup | 15 min |
| Task 2H.4.14: TimeRangeSelector | 15 min |
| Task 2H.4.15: BulkTagDialog | 10 min |
| Task 2H.4.16: BulkMoveDialog | 10 min |
| Task 2H.4.17: FilterPanel | 10 min |
| Task 2H.4.18: validation.ts utility | 25 min |
| Task 2H.4.19: Update translation files | 30 min |
| Task 2H.4.20: Verification and testing | 45 min |
| **Total** | **~8.5 hours** |

---

## 12. Implementation Order

Recommended order to minimize breaking changes:

1. **Create common.form namespace** (Task 2H.4.1)
   - Establishes shared form patterns

2. **Update validation utility** (Task 2H.4.18)
   - Cross-cutting concern used by multiple components

3. **Update authentication forms** (Tasks 2H.4.2-2H.4.4)
   - Entry point, high visibility
   - LoginForm, RegistrationForm, AccessCodeInput

4. **Update property forms** (Tasks 2H.4.5, 2H.4.10, 2H.4.11)
   - PropertyForm, PropertyEditModal, AddPropertyModal

5. **Update item forms** (Tasks 2H.4.6-2H.4.9)
   - ItemForm, MetadataStep, UrlInputStep, AddMediaLinkForm

6. **Update remaining components** (Tasks 2H.4.12-2H.4.17)
   - MailingListSignup, EmailPopup, TimeRangeSelector
   - BulkTagDialog, BulkMoveDialog, FilterPanel

7. **Update translation files** (Task 2H.4.19)
   - Consolidate all keys

8. **Verification and testing** (Task 2H.4.20)

---

## 13. Code Examples

### Form Label with Required Indicator

```typescript
// /src/components/PropertyForm.tsx
'use client';

import { useTranslations } from 'next-intl';

export default function PropertyForm() {
  const t = useTranslations('properties.form');
  const tCommon = useTranslations('common.form');

  return (
    <div>
      <label htmlFor="nickname">
        {t('labels.nickname')} <span className="text-red-500">{tCommon('required')}</span>
      </label>
      <input
        id="nickname"
        placeholder={t('placeholders.nickname')}
      />
      <p className="text-xs text-gray-500">
        {t('hints.friendlyName', { current: formData.nickname.length, max: 100 })}
      </p>
    </div>
  );
}
```

### Validation Error Display

```typescript
// /src/components/LoginForm.tsx
'use client';

import { useTranslations } from 'next-intl';

export default function LoginForm() {
  const t = useTranslations('auth.login');

  const validateField = (name: string, value: string): string | undefined => {
    if (name === 'email') {
      if (!value) return t('validation.emailRequired');
      if (!emailRegex.test(value)) return t('validation.invalidEmail');
    }
    if (name === 'password') {
      if (!value) return t('validation.passwordRequired');
      if (value.length < 6) return t('validation.passwordTooShort');
    }
  };

  return (
    <form>
      <label htmlFor="email">{t('labels.email')}</label>
      <input
        type="email"
        id="email"
        placeholder={t('placeholders.email')}
      />
      {errors.email && (
        <p className="text-red-600 text-sm">{errors.email}</p>
      )}
    </form>
  );
}
```

### Password Strength Indicator

```typescript
// /src/components/RegistrationForm.tsx
import { useTranslations } from 'next-intl';

function PasswordStrengthIndicator({ strength }: { strength: number }) {
  const t = useTranslations('auth.register.passwordStrength');

  const strengthLabels = [
    t('veryWeak'),
    t('weak'),
    t('fair'),
    t('good'),
    t('strong')
  ];

  return (
    <div>
      <span>{t('label')} {strengthLabels[strength]}</span>
      <div>
        <span>{t('requirements')}</span>
        <ul>
          <li>{t('minChars')}</li>
          <li>{t('lowercase')}</li>
          <li>{t('uppercase')}</li>
          <li>{t('number')}</li>
          <li>{t('special')}</li>
        </ul>
      </div>
    </div>
  );
}
```

### Character Counter with Translation

```typescript
// Helper text with dynamic count
<p className="text-xs text-gray-500">
  {t('hints.friendlyName', {
    current: formData.nickname.length,
    max: 100
  })}
</p>

// Translation key (ICU format):
{
  "hints": {
    "friendlyName": "A friendly name to identify this property ({current}/{max})"
  }
}
```

### Accessibility Label Translation

```typescript
// Password visibility toggle
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  aria-label={showPassword ? t('a11y.hidePassword') : t('a11y.showPassword')}
>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

---

## 14. Implementation Commands Summary

```bash
# Step 1: Verify prerequisites
npm list next-intl
cat messages/en.json | python3 -c "import json,sys; print(json.load(sys.stdin).keys())"

# Step 2: Backup existing en.json
cp messages/en.json messages/en.json.backup

# Step 3: For each component, follow this pattern:
# a) Add import: import { useTranslations } from 'next-intl';
# b) Add hooks:
#    const t = useTranslations('feature.form');
#    const tCommon = useTranslations('common');
# c) Replace labels: {t('labels.fieldName')}
# d) Replace placeholders: placeholder={t('placeholders.fieldName')}
# e) Replace hints: {t('hints.description', { param: value })}
# f) Replace validation: return t('validation.errorType');

# Step 4: Update translation file with new keys
# (Use Edit tool to add keys to messages/en.json)

# Step 5: Validate JSON
cat messages/en.json | python3 -m json.tool > /dev/null && echo "Valid JSON"

# Step 6: Build verification
npm run build

# Step 7: Manual testing
npm run dev
# Test each form in browser
```

---

## 15. Next Steps After Implementation

After completing Task 2H.4 (this task):

1. **Task 2H.5:** Extract toast notification messages
2. **Task 2H.6:** Extract empty state messages
3. **Task 2H.7:** Extract loading state messages
4. **Task 2H.10:** Generate translations for all 5 non-English languages
5. **Update tests:** Ensure form tests pass with mocked translations

---

## 16. Coordination Notes

### With Task 2H.2 (Button Labels)

Some form components contain buttons (Submit, Cancel, etc.) that may have been updated in Task 2H.2. Verify:
- Button labels use `common.actions` namespace
- No duplicate extraction of button text

### With Task 2H.3 (Modal/Dialog Strings)

PropertyEditModal and AddPropertyModal contain both modal structure and form elements. Coordinate:
- Modal titles, descriptions use modal namespace
- Form labels, placeholders, validation use form namespace
- Avoid duplicating validation messages

### With Sub-Epic 2J (Error Messages)

Some validation errors overlap with general error messages. Consider:
- Form-specific validation goes in feature namespace
- Generic validation (required, email format) goes in `common.validation`

---

## 17. References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [PRD: L10N Epic 2 - Static UI Translation](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-304: Create Common Namespace Structure](/docs/REQ-304-create-common-namespace-structure-in-overview.md)
- [REQ-305: Extract Button Labels](/docs/REQ-305-extract-button-labels-across-all-components-overview.md)
- [REQ-306: Extract Modal/Dialog Strings](/docs/REQ-306-extract-modaldialog-strings-overview.md)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation, Sub-Epic 2H, Task 2H.4*
