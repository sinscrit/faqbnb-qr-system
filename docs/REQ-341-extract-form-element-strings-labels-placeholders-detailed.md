# REQ-341: Extract Form Element Strings for Internationalization - Detailed Task Breakdown

**Task Breakdown Document**
**Date Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-341
**Task ID:** 2H.4
**Sub-Epic:** 2H - Common & Shared Components
**Type:** ENHANCEMENT
**Size:** L (Large)
**Status:** Ready for Implementation

---

## Document Purpose

This document provides a granular, step-by-step implementation guide for extracting and internationalizing all form element strings across the FAQBNB application. Each task is designed to be approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

---

## Prerequisites Checklist

Before beginning implementation, verify the following are complete:

| Prerequisite | Source | Verification Command |
|--------------|--------|---------------------|
| next-intl v4.7.0 installed | REQ-229 | `npm list next-intl` |
| i18n config module exists | REQ-230 | `cat src/lib/i18n/config.ts` |
| next.config.ts integration | REQ-231 | `grep -l "next-intl" next.config.ts` |
| IntlProvider wrapper configured | REQ-232 | `grep -l "NextIntlClientProvider" src/app/layout.tsx` |
| Translation file structure exists | REQ-233 | `ls messages/*.json` |
| Reference implementation available | LogoutButton.tsx | `grep -l "useTranslations" src/components/LogoutButton.tsx` |

---

## Reference Implementation Pattern

All form component updates must follow this established pattern from `LogoutButton.tsx`:

```typescript
// 1. Import useTranslations hook
import { useTranslations } from 'next-intl';

// 2. Initialize hook(s) inside component
function FormComponent() {
  const t = useTranslations('forms.formName');
  const tCommon = useTranslations('forms.common');

  // 3. Replace hardcoded strings with translation calls
  return (
    <label>{t('labels.fieldName')}</label>
    <input placeholder={t('placeholders.fieldName')} />
    {error && <p>{t('validation.fieldName.errorType')}</p>}
  );
}
```

---

## Translation Key Naming Convention

```
forms.{formName}.{category}.{fieldName}.{variant?}
```

### Categories:
- `labels` - Field labels
- `placeholders` - Input placeholder text
- `hints` - Helper text and formatting guidance
- `validation` - Validation error messages
- `buttons` - Button labels specific to the form
- `passwordStrength` - Password strength indicators (registration only)
- `passwordMatch` - Password match feedback (registration only)

### Examples:
```
forms.login.labels.email          -> "Email Address"
forms.login.placeholders.email    -> "admin@faqbnb.com"
forms.login.validation.email.required -> "Email is required"
forms.login.buttons.signIn        -> "Sign In with Email"
forms.common.validation.required  -> "This field is required"
```

---

## Phase 1: Translation File Setup

### Task 1.1: Create Forms Namespace Structure in en.json

**Objective:** Add the complete `forms` namespace hierarchy to the English translation file.

**File:** `/messages/en.json`

**Action:** Add the following JSON structure (merge with existing content):

```json
{
  "forms": {
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
        "adminAccess": "Access restricted to authorized administrators only",
        "signInPrompt": "Sign in with your account"
      },
      "validation": {
        "email": {
          "required": "Email is required",
          "invalid": "Please enter a valid email address"
        },
        "password": {
          "required": "Password is required",
          "tooShort": "Password must be at least 6 characters"
        },
        "authFailed": "Authentication Failed",
        "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
        "accessDenied": "Access denied. Admin privileges are required."
      },
      "buttons": {
        "signingIn": "Signing In...",
        "signIn": "Sign In with Email",
        "continueWithEmail": "Or continue with email"
      }
    },
    "registration": {
      "labels": {
        "email": "Email Address",
        "fullName": "Full Name (optional)",
        "password": "Password",
        "confirmPassword": "Confirm Password",
        "termsAgreement": "I agree to the Terms of Service and Privacy Policy"
      },
      "placeholders": {
        "email": "email@example.com",
        "fullName": "John Doe",
        "password": "Create a strong password",
        "confirmPassword": "Confirm your password"
      },
      "hints": {
        "emailLinked": "This email is linked to your access code and cannot be changed.",
        "accessCodeLinked": "Your account will be linked to your verified access code",
        "chooseMethod": "Choose how to create your account",
        "accessCodeInfo": "Access code:"
      },
      "passwordStrength": {
        "label": "Password strength:",
        "enterPassword": "Enter password",
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
      "passwordMatch": {
        "match": "Passwords match",
        "noMatch": "Passwords do not match"
      },
      "validation": {
        "email": {
          "required": "Email is required",
          "invalid": "Please enter a valid email address"
        },
        "password": {
          "required": "Password is required",
          "minLength": "Password must be at least 8 characters",
          "lowercase": "Password must contain at least one lowercase letter",
          "uppercase": "Password must contain at least one uppercase letter",
          "number": "Password must contain at least one number"
        },
        "confirmPassword": {
          "required": "Please confirm your password",
          "mismatch": "Passwords do not match"
        },
        "name": {
          "tooShort": "Name must be at least 2 characters"
        },
        "terms": {
          "required": "You must agree to the terms and conditions"
        },
        "registrationFailed": "Registration Failed"
      },
      "buttons": {
        "connectingGoogle": "Connecting to Google...",
        "createAccount": "Create Account",
        "creatingAccount": "Creating Account...",
        "continueGoogle": "Continue with Google",
        "signUpEmail": "Sign up with email"
      }
    },
    "property": {
      "labels": {
        "owner": "Property Owner",
        "nickname": "Property Nickname",
        "type": "Property Type",
        "address": "Address (Optional)"
      },
      "placeholders": {
        "owner": "Select property owner...",
        "nickname": "e.g., Main Office, Home, Vacation House",
        "type": "Select property type...",
        "address": "e.g., 123 Main St, Anytown, State 12345"
      },
      "hints": {
        "nickname": "A friendly name to identify this property ({count}/100)",
        "address": "Physical address or location description ({count}/500)",
        "ownerLocked": "Property owner cannot be changed after creation"
      },
      "validation": {
        "nickname": {
          "required": "Property nickname is required",
          "tooLong": "Property nickname must be 100 characters or less"
        },
        "type": {
          "required": "Property type is required"
        },
        "address": {
          "tooLong": "Address must be 500 characters or less"
        }
      },
      "titles": {
        "create": "Create New Property",
        "edit": "Edit Property"
      }
    },
    "item": {
      "labels": {
        "publicId": "Public ID",
        "name": "Item Name",
        "property": "Property",
        "description": "Description",
        "qrCodeUrl": "QR Code Image URL (optional)",
        "resources": "Resources & Links",
        "linkTitle": "Title",
        "linkType": "Type",
        "linkUrl": "URL",
        "thumbnailUrl": "Custom Thumbnail URL"
      },
      "placeholders": {
        "publicId": "UUID will be generated automatically",
        "name": "e.g., Samsung Washing Machine",
        "property": "Select a property...",
        "description": "Describe the item, its location, or any important details...",
        "qrCodeUrl": "https://example.com/qr-code.png",
        "linkTitle": "e.g., User Manual",
        "linkUrl": "https://...",
        "thumbnailUrl": "https://... (optional)"
      },
      "hints": {
        "publicId": "This UUID will be used in the QR code URL. It is auto-generated but can be customized.",
        "property": "Select the property where this item is located",
        "qrCodeUrl": "URL to the QR code image for this item",
        "thumbnailUrl": "Leave empty to auto-generate thumbnails",
        "noResources": "No resources added yet",
        "addFirstResource": "Add Your First Resource",
        "noProperties": "No properties available. Please create a property first."
      },
      "validation": {
        "publicId": {
          "required": "Public ID is required",
          "invalidFormat": "Public ID must be a valid UUID format"
        },
        "name": {
          "required": "Name is required"
        },
        "property": {
          "required": "Property selection is required"
        },
        "qrCodeUrl": {
          "invalid": "Please enter a valid QR code image URL"
        },
        "linkTitle": {
          "required": "Title is required"
        },
        "linkUrl": {
          "required": "URL is required",
          "invalid": "Please enter a valid URL"
        },
        "thumbnailUrl": {
          "invalid": "Please enter a valid thumbnail URL"
        }
      },
      "titles": {
        "create": "Create New Item",
        "edit": "Edit Item"
      },
      "subtitles": {
        "create": "Add a new item with instructions and resources",
        "edit": "Update item details and resources"
      },
      "buttons": {
        "addLink": "Add Link",
        "testLink": "Test Link"
      }
    },
    "accessCode": {
      "labels": {
        "code": "Access Code",
        "email": "Email Address",
        "title": "Manual Registration Entry"
      },
      "placeholders": {
        "code": "Enter your 8+ character access code",
        "email": "Enter your email address"
      },
      "hints": {
        "instructions": "Enter your access code and email address to proceed with registration.",
        "format": "Access code should be 8+ characters long and contain only letters and numbers",
        "betaAccess": "Need an access code? Request beta access to get started",
        "requestBeta": "Request beta access here"
      },
      "validation": {
        "code": {
          "required": "Access code is required",
          "tooShort": "Access code should be 8+ characters",
          "invalidChars": "Access code should contain only letters and numbers",
          "valid": "Valid access code format"
        },
        "email": {
          "required": "Email is required",
          "invalid": "Please enter a valid email address",
          "valid": "Valid email format"
        }
      }
    },
    "search": {
      "placeholders": {
        "items": "Search items...",
        "default": "Search..."
      },
      "aria": {
        "clearSearch": "Clear search"
      }
    },
    "mediaLink": {
      "labels": {
        "title": "Title",
        "url": "URL",
        "type": "Type",
        "thumbnailUrl": "Thumbnail URL (optional)"
      },
      "placeholders": {
        "title": "e.g., Product Manual",
        "url": "https://..."
      },
      "hints": {
        "typeAutoDetect": "Type is auto-detected from URL but can be changed",
        "addThumbnail": "+ Add custom thumbnail"
      },
      "validation": {
        "url": {
          "invalid": "Please enter a valid URL"
        }
      },
      "buttons": {
        "addLink": "Add Link",
        "cancel": "Cancel"
      }
    },
    "common": {
      "labels": {
        "required": "Required"
      },
      "validation": {
        "required": "This field is required",
        "invalidEmail": "Please enter a valid email address",
        "invalidUrl": "Please enter a valid URL",
        "minLength": "Must be at least {min} characters",
        "maxLength": "Must be no more than {max} characters"
      },
      "indicators": {
        "requiredField": "*"
      }
    }
  }
}
```

**Verification:**
1. Run `npm run build` to verify JSON is valid
2. Check that existing keys are preserved
3. Verify file can be parsed: `node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8')).forms))"`

**Estimated Effort:** 1 story point

---

### Task 1.2: Propagate Forms Namespace to Non-English Language Files

**Objective:** Copy the forms namespace structure to all 5 non-English language files with English text as placeholder values.

**Files to Update:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Action:** For each file, add the complete `forms` namespace from Task 1.1 (using English text temporarily). The translation generation task (Task 4.1) will replace these with proper translations.

**Note:** This is temporary - proper translations will be generated in Phase 4.

**Verification:**
1. All 6 language files have identical key structure
2. Run: `for f in messages/*.json; do echo "$f: $(node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('$f', 'utf8')).forms || {}).length)") keys"; done`

**Estimated Effort:** 1 story point

---

## Phase 2: Component Updates

### Task 2.1: Update LoginForm.tsx

**Objective:** Replace all hardcoded strings in LoginForm with translation keys.

**File:** `/src/components/LoginForm.tsx`

**Changes Required:**

1. **Add import statement** (after existing imports):
```typescript
import { useTranslations } from 'next-intl';
```

2. **Initialize hook inside component** (at start of function body):
```typescript
const t = useTranslations('forms.login');
const tCommon = useTranslations('forms.common');
```

3. **Replace hardcoded strings:**

| Line | Current String | Replacement |
|------|----------------|-------------|
| ~51 | `'Email is required'` | `'required'` (return key only) |
| ~53 | `'Please enter a valid email address'` | `'invalid'` (return key only) |
| ~57 | `'Password is required'` | `'required'` (return key only) |
| ~58 | `'Password must be at least 6 characters'` | `'tooShort'` (return key only) |
| ~138 | `'Invalid email or password...'` | Use from error state directly |
| ~141 | `'Access denied...'` | Use from error state directly |
| ~196 | `"Authentication Failed"` | `{t('validation.authFailed')}` |
| ~206 | `"Sign in with your account"` | `{t('hints.signInPrompt')}` |
| ~222 | `"Or continue with email"` | `{t('buttons.continueWithEmail')}` |
| ~231 | `"Email Address"` | `{t('labels.email')}` |
| ~244 | `"admin@faqbnb.com"` | `{t('placeholders.email')}` |
| ~255 | `"Password"` | `{t('labels.password')}` |
| ~269 | `"Enter your password"` | `{t('placeholders.password')}` |
| ~303 | `"Remember me for 30 days"` | `{t('labels.rememberMe')}` |
| ~317 | `"Signing In..."` | `{t('buttons.signingIn')}` |
| ~322 | `"Sign In with Email"` | `{t('buttons.signIn')}` |
| ~329 | `"Access restricted to..."` | `{t('hints.adminAccess')}` |

4. **Update validation error display:**
```typescript
// Change error display from:
{errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}

// To:
{errors.email && (
  <p className="text-red-600 text-sm mt-1">
    {t(`validation.email.${errors.email}`)}
  </p>
)}
```

5. **Update validateField function to return keys instead of messages:**
```typescript
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) return 'invalid';
      return undefined;

    case 'password':
      if (!value) return 'required';
      if ((value as string).length < 6) return 'tooShort';
      return undefined;

    default:
      return undefined;
  }
};
```

**Verification:**
1. Run `npm run build` - no TypeScript errors
2. Test login form renders correctly
3. Test validation messages display in English
4. Test error states display properly
5. Verify no hardcoded English strings remain: `grep -n '"[A-Z][a-z].*"' src/components/LoginForm.tsx`

**Estimated Effort:** 2 story points

---

### Task 2.2: Update RegistrationForm.tsx

**Objective:** Replace all hardcoded strings in RegistrationForm with translation keys.

**File:** `/src/components/RegistrationForm.tsx`

**This is the largest form with ~45 strings including password strength indicators.**

**Changes Required:**

1. **Add import statement:**
```typescript
import { useTranslations } from 'next-intl';
```

2. **Initialize hook:**
```typescript
const t = useTranslations('forms.registration');
const tCommon = useTranslations('forms.common');
```

3. **Update password strength labels** (around line 198-199):
```typescript
const labels = [
  t('passwordStrength.veryWeak'),
  t('passwordStrength.weak'),
  t('passwordStrength.fair'),
  t('passwordStrength.good'),
  t('passwordStrength.strong')
];
```

4. **Update password requirement feedback** (around lines 165-195):
```typescript
// Replace hardcoded strings with translation keys
if (password.length >= 8) {
  score += 1;
} else {
  feedback.push(t('passwordStrength.minChars'));
}

if (/[a-z]/.test(password)) {
  score += 1;
} else {
  feedback.push(t('passwordStrength.lowercase'));
}

// Continue for all requirements...
```

5. **Update all form labels, placeholders, hints, and validation messages following the pattern from Task 2.1**

6. **Update button labels:**
- "Create Account" -> `{t('buttons.createAccount')}`
- "Creating Account..." -> `{t('buttons.creatingAccount')}`
- "Continue with Google" -> `{t('buttons.continueGoogle')}`
- "Sign up with email" -> `{t('buttons.signUpEmail')}`
- "Connecting to Google..." -> `{t('buttons.connectingGoogle')}`

7. **Update validation function to return keys**

**Key strings to replace (partial list):**
- Labels: "Email Address", "Full Name (optional)", "Password", "Confirm Password"
- Placeholders: "email@example.com", "John Doe", "Create a strong password", "Confirm your password"
- Password strength: "Very Weak", "Weak", "Fair", "Good", "Strong", "Requirements:", "At least 8 characters", etc.
- Password match: "Passwords match", "Passwords do not match"
- Hints: "This email is linked to your access code...", "Your account will be linked...", "Choose how to create your account"

**Verification:**
1. Run `npm run build`
2. Test registration form renders
3. Test password strength indicator displays correctly in English
4. Test password match feedback
5. Test all validation messages
6. Verify OAuth flow text is translated

**Estimated Effort:** 3 story points

---

### Task 2.3: Update PropertyForm.tsx

**Objective:** Replace all hardcoded strings in PropertyForm with translation keys.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

1. **Add import and initialize hook:**
```typescript
import { useTranslations } from 'next-intl';

// Inside component:
const t = useTranslations('forms.property');
const tCommon = useTranslations('forms.common');
```

2. **Replace strings:**

| Current String | Translation Key |
|----------------|-----------------|
| "Property Owner" | `t('labels.owner')` |
| "Property Nickname" | `t('labels.nickname')` |
| "Property Type" | `t('labels.type')` |
| "Address (Optional)" | `t('labels.address')` |
| "Select property owner..." | `t('placeholders.owner')` |
| "e.g., Main Office, Home, Vacation House" | `t('placeholders.nickname')` |
| "Select property type..." | `t('placeholders.type')` |
| "e.g., 123 Main St..." | `t('placeholders.address')` |
| "Property owner cannot be changed after creation" | `t('hints.ownerLocked')` |
| "Edit Property" / "Create New Property" | `t('titles.edit')` / `t('titles.create')` |

3. **Handle character count hints with interpolation:**
```typescript
// For nickname hint with character count
<p className="text-xs text-gray-500">
  {t('hints.nickname', { count: formData.nickname.length })}
</p>
```

4. **Update validation messages to return keys**

**Verification:**
1. Run `npm run build`
2. Test create property form
3. Test edit property form
4. Verify character count displays correctly

**Estimated Effort:** 1 story point

---

### Task 2.4: Update ItemForm.tsx

**Objective:** Replace all hardcoded strings in ItemForm with translation keys.

**File:** `/src/components/ItemForm.tsx`

**Changes Required:**

1. **Add import and initialize hook:**
```typescript
import { useTranslations } from 'next-intl';

// Inside component:
const t = useTranslations('forms.item');
const tCommon = useTranslations('forms.common');
```

2. **Replace form title section (around line 183-188):**
```typescript
<h1 className="text-2xl font-bold text-gray-900">
  {item ? t('titles.edit') : t('titles.create')}
</h1>
<p className="text-gray-600 mt-1">
  {item ? t('subtitles.edit') : t('subtitles.create')}
</p>
```

3. **Replace all labels:**
- "Public ID *" -> `{t('labels.publicId')}`
- "Item Name" -> `{t('labels.name')}`
- "Property" -> `{t('labels.property')}`
- "Description" -> `{t('labels.description')}`
- "QR Code Image URL (optional)" -> `{t('labels.qrCodeUrl')}`
- "Resources & Links" -> `{t('labels.resources')}`
- "Title" -> `{t('labels.linkTitle')}`
- "Type" -> `{t('labels.linkType')}`
- "URL" -> `{t('labels.linkUrl')}`
- "Custom Thumbnail URL" -> `{t('labels.thumbnailUrl')}`

4. **Replace all placeholders**

5. **Replace validation messages in validateForm function:**
```typescript
const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.publicId.trim()) {
    newErrors.publicId = 'required'; // Return key
  } else if (!/^[a-fA-F0-9]{8}-.../.test(formData.publicId)) {
    newErrors.publicId = 'invalidFormat'; // Return key
  }
  // ... continue for all validations
};
```

6. **Update error display to use translations:**
```typescript
{errors.publicId && (
  <p className="text-sm text-red-600">
    {t(`validation.publicId.${errors.publicId}`)}
  </p>
)}
```

**Verification:**
1. Run `npm run build`
2. Test create item form
3. Test edit item form
4. Test link section with add/remove functionality
5. Verify all validation messages

**Estimated Effort:** 2 story points

---

### Task 2.5: Update AccessCodeInput.tsx

**Objective:** Replace all hardcoded strings in AccessCodeInput with translation keys.

**File:** `/src/components/AccessCodeInput.tsx`

**Changes Required:**

1. **Add import and initialize hook:**
```typescript
import { useTranslations } from 'next-intl';

// Inside component:
const t = useTranslations('forms.accessCode');
```

2. **Replace strings:**

| Line | Current String | Replacement |
|------|----------------|-------------|
| ~69 | `'Access code is required'` | `'required'` (key) |
| ~73 | `'Access code should be 8+ characters'` | `'tooShort'` (key) |
| ~77 | `'Access code should contain only letters and numbers'` | `'invalidChars'` (key) |
| ~80 | `'Valid access code format'` | `'valid'` (key) |
| ~88 | `'Email is required'` | `'required'` (key) |
| ~93 | `'Please enter a valid email address'` | `'invalid'` (key) |
| ~96 | `'Valid email format'` | `'valid'` (key) |
| ~171 | `"Manual Registration Entry"` | `{t('labels.title')}` |
| ~173 | `"Enter your access code..."` | `{t('hints.instructions')}` |
| ~181 | `"Access Code"` | `{t('labels.code')}` |
| ~191 | `"Enter your 8+ character access code"` | `{t('placeholders.code')}` |
| ~221-222 | `"Access code should be 8+..."` | `{t('hints.format')}` |
| ~228 | `"Email Address"` | `{t('labels.email')}` |
| ~238 | `"Enter your email address"` | `{t('placeholders.email')}` |
| ~264-265 | `"Need an access code?..."` | `{t('hints.betaAccess')}` |
| ~271 | `"Request beta access here"` | `{t('hints.requestBeta')}` |

3. **Update validation message display:**
```typescript
{accessCode && validation.code.message && (
  <p className={`text-sm ${validation.code.isValid ? 'text-green-600' : 'text-red-600'}`}>
    {t(`validation.code.${validation.code.message}`)}
  </p>
)}
```

4. **Update validation functions to return keys instead of full messages**

**Verification:**
1. Run `npm run build`
2. Test access code input component
3. Test validation feedback (success and error states)
4. Verify show/hide toggle works

**Estimated Effort:** 1 story point

---

### Task 2.6: Update SearchInput.tsx

**Objective:** Replace placeholder text in SearchInput with translation key.

**File:** `/src/components/ItemManager/components/SearchInput.tsx`

**Changes Required:**

1. **Add import:**
```typescript
import { useTranslations } from 'next-intl';
```

2. **Initialize hook:**
```typescript
const t = useTranslations('forms.search');
```

3. **Update default placeholder (around line 52):**
```typescript
// Change:
placeholder = 'Search items...',

// To use translation:
// Note: Since placeholder is a prop, we need to handle this in the JSX
```

4. **Update the placeholder usage in JSX (line 172):**
```typescript
placeholder={placeholder || t('placeholders.items')}
```

5. **Update aria-label (line 196-197):**
```typescript
aria-label={placeholder || t('placeholders.items')}
```

6. **Update clear button aria-label (line 216):**
```typescript
aria-label={t('aria.clearSearch')}
```

**Verification:**
1. Run `npm run build`
2. Test search input displays correct placeholder
3. Test clear button accessibility

**Estimated Effort:** 0.5 story points

---

### Task 2.7: Update AddMediaLinkForm.tsx

**Objective:** Replace all hardcoded strings in AddMediaLinkForm with translation keys.

**File:** `/src/components/MediaManagement/AddMediaLinkForm.tsx`

**Changes Required:**

1. **Add import and initialize hook:**
```typescript
import { useTranslations } from 'next-intl';

// Inside component:
const t = useTranslations('forms.mediaLink');
const tCommon = useTranslations('common');
```

2. **Replace strings:**

| Line | Current String | Replacement |
|------|----------------|-------------|
| ~75-76 | `'Please enter a valid URL'` | Return as key |
| ~130 | `"Title"` | `{t('labels.title')}` |
| ~139 | `"e.g., Product Manual"` | `{t('placeholders.title')}` |
| ~146 | `"URL"` | `{t('labels.url')}` |
| ~158 | `"https://..."` | `{t('placeholders.url')}` |
| ~168 | `"Type"` | `{t('labels.type')}` |
| ~183-184 | `"Type is auto-detected..."` | `{t('hints.typeAutoDetect')}` |
| ~191 | `"Thumbnail URL (optional)"` | `{t('labels.thumbnailUrl')}` |
| ~209 | `"+ Add custom thumbnail"` | `{t('hints.addThumbnail')}` |
| ~220 | `"Cancel"` | `{tCommon('cancel')}` |
| ~231 | `"Add Link"` | `{t('buttons.addLink')}` |

3. **Update URL error handling:**
```typescript
// In useEffect:
setUrlError('invalid'); // Return key instead of message

// In display:
{urlError && (
  <p className="mt-1 text-xs text-red-500">
    {t(`validation.url.${urlError}`)}
  </p>
)}
```

**Verification:**
1. Run `npm run build`
2. Test add media link form
3. Test URL validation error display
4. Test type auto-detection still works

**Estimated Effort:** 1 story point

---

## Phase 3: Validation & Testing

### Task 3.1: Verify All Forms Render Correctly with Translations

**Objective:** Ensure all updated forms render without errors and display translated content.

**Test Checklist:**
- [ ] LoginForm renders with all labels in English
- [ ] RegistrationForm renders with all labels, including password strength
- [ ] PropertyForm renders in both create and edit modes
- [ ] ItemForm renders in both create and edit modes
- [ ] AccessCodeInput renders with all labels and hints
- [ ] SearchInput renders with placeholder
- [ ] AddMediaLinkForm renders when expanded

**Verification Steps:**
1. Start dev server: `npm run dev`
2. Navigate to each form
3. Verify no missing translation warnings in console
4. Take screenshots for comparison

**Estimated Effort:** 1 story point

---

### Task 3.2: Test Validation Messages Display in Correct Language

**Objective:** Verify all validation error messages display correctly.

**Test Scenarios:**

**LoginForm:**
- [ ] Submit empty form - email required error
- [ ] Enter invalid email - invalid email error
- [ ] Enter short password - password too short error
- [ ] Submit invalid credentials - auth failed error

**RegistrationForm:**
- [ ] Test all password strength levels display correctly
- [ ] Test password match/mismatch feedback
- [ ] Test terms agreement validation

**PropertyForm:**
- [ ] Submit without nickname - required error
- [ ] Exceed character limit - too long error

**ItemForm:**
- [ ] Submit without required fields
- [ ] Enter invalid URL formats
- [ ] Test link validation

**AccessCodeInput:**
- [ ] Test code too short error
- [ ] Test invalid characters error
- [ ] Test valid code feedback

**Verification:**
1. Test each scenario manually
2. Document any issues found
3. Verify error messages match translation keys

**Estimated Effort:** 1 story point

---

### Task 3.3: Test Language Switching on Forms

**Objective:** Verify forms update correctly when language is changed.

**Test Steps:**
1. Open a form (e.g., LoginForm)
2. Note current labels and placeholders
3. Switch language using LanguageSwitcher
4. Verify all text updates to new language
5. Test form submission in non-English language
6. Verify validation messages appear in correct language

**Note:** This task depends on LanguageSwitcher being functional (REQ-248).

**Verification:**
1. Test in at least 3 languages
2. No fallback to English unexpectedly
3. Form functionality preserved across languages

**Estimated Effort:** 0.5 story points

---

### Task 3.4: Verify No Hardcoded English Strings Remain

**Objective:** Audit all updated components to ensure complete translation coverage.

**Verification Commands:**

```bash
# Check LoginForm
grep -n '"[A-Z][a-z]' src/components/LoginForm.tsx | grep -v "className\|type="

# Check RegistrationForm
grep -n '"[A-Z][a-z]' src/components/RegistrationForm.tsx | grep -v "className\|type="

# Check PropertyForm
grep -n '"[A-Z][a-z]' src/components/PropertyForm.tsx | grep -v "className\|type="

# Check ItemForm
grep -n '"[A-Z][a-z]' src/components/ItemForm.tsx | grep -v "className\|type="

# Check AccessCodeInput
grep -n '"[A-Z][a-z]' src/components/AccessCodeInput.tsx | grep -v "className\|type="

# Check SearchInput
grep -n '"[A-Z][a-z]' src/components/ItemManager/components/SearchInput.tsx | grep -v "className\|type="

# Check AddMediaLinkForm
grep -n '"[A-Z][a-z]' src/components/MediaManagement/AddMediaLinkForm.tsx | grep -v "className\|type="
```

**Acceptable Exceptions:**
- Console.log debug messages
- CSS class names
- HTML attribute values (type, id, etc.)
- Variable names

**Estimated Effort:** 0.5 story points

---

## Phase 4: Translation Generation

### Task 4.1: Generate Translations for 5 Non-English Languages

**Objective:** Generate proper translations for all forms strings in French, Spanish, German, Dutch, and Italian.

**Files to Update:**
- `/messages/fr.json` - French
- `/messages/es.json` - Spanish
- `/messages/de.json` - German
- `/messages/nl.json` - Dutch
- `/messages/it.json` - Italian

**Translation Guidelines:**
1. Use formal/polite form where applicable (vous in French, Sie in German)
2. Maintain consistency with existing translations in the file
3. Keep interpolation variables unchanged: `{count}`, `{min}`, `{max}`
4. Preserve ICU message format for plurals
5. Consider text length expansion (German can be 30% longer)

**Sample Translations for forms.login.labels.email:**
- French: "Adresse e-mail"
- Spanish: "Direccion de correo electronico"
- German: "E-Mail-Adresse"
- Dutch: "E-mailadres"
- Italian: "Indirizzo email"

**Method:**
Use AI translation service (Claude/OpenAI) or professional translation service.

**Verification:**
1. Run `npm run build` to verify JSON validity
2. Test each language in the UI
3. Check for truncation or layout issues
4. Verify no English strings leaked through

**Estimated Effort:** 2 story points

---

## Acceptance Criteria Verification

Upon completion of all tasks, verify:

- [ ] All form components identified and catalogued (LoginForm, RegistrationForm, PropertyForm, ItemForm, AccessCodeInput, SearchInput, AddMediaLinkForm)
- [ ] Input field labels extracted to `forms.[formName].labels.[fieldName]` pattern
- [ ] Placeholder text extracted to `forms.[formName].placeholders.[fieldName]` pattern
- [ ] Helper text/hints extracted to `forms.[formName].hints.[fieldName]` pattern
- [ ] Validation messages extracted to `forms.[formName].validation.[fieldName].[errorType]` pattern
- [ ] Common validation messages in `forms.common.validation` namespace
- [ ] Required field indicators use translation keys
- [ ] en.json complete with all form strings
- [ ] All 5 non-English language files have complete forms namespace
- [ ] Forms display translated content when language switches
- [ ] Validation messages appear in correct language
- [ ] No hardcoded English form strings remain
- [ ] Dynamic validation messages use proper interpolation
- [ ] Forms maintain accessibility attributes
- [ ] TypeScript types updated (if needed)
- [ ] All forms function correctly with no regressions

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Validation logic regression | Test all validation scenarios after each component update |
| Missing strings discovered | Track in this document and add to translation files |
| Interpolation errors | Test character count hints and dynamic messages thoroughly |
| TypeScript errors | Run `npm run build` after each component update |
| Layout breaks with longer translations | Test German (longest) and verify no truncation |

---

## Effort Summary

| Task | Description | Effort |
|------|-------------|--------|
| 1.1 | Create forms namespace in en.json | 1 SP |
| 1.2 | Propagate to non-English files | 1 SP |
| 2.1 | Update LoginForm.tsx | 2 SP |
| 2.2 | Update RegistrationForm.tsx | 3 SP |
| 2.3 | Update PropertyForm.tsx | 1 SP |
| 2.4 | Update ItemForm.tsx | 2 SP |
| 2.5 | Update AccessCodeInput.tsx | 1 SP |
| 2.6 | Update SearchInput.tsx | 0.5 SP |
| 2.7 | Update AddMediaLinkForm.tsx | 1 SP |
| 3.1 | Verify form rendering | 1 SP |
| 3.2 | Test validation messages | 1 SP |
| 3.3 | Test language switching | 0.5 SP |
| 3.4 | Verify no hardcoded strings | 0.5 SP |
| 4.1 | Generate translations | 2 SP |
| **Total** | | **17.5 SP** |

---

## References

- [REQ-341 Overview Document](/docs/REQ-341-extract-form-element-strings-labels-placeholders-overview.md)
- [REQ-341 Request Details](/docs/gen_requests_epic2.md)
- [Plan-111: L10N Epic 2 - Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Reference Implementation: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [Existing i18n Config](/src/lib/i18n/config.ts)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2H Task 2H.4*
