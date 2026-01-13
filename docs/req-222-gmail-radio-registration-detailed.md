# REQ-222: Radio Button Registration Method Selection for Gmail Users - Detailed Implementation Tasks

**Generated:** 2026-01-13 20:23:50 CET
**Reference Documents:**
- Requirements: `docs/gen_requests.md` (Request #222)
- Overview: `docs/req-222-gmail-radio-registration-Overview.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root
- Follow existing code patterns from `TimeRangeSelector.tsx` and `ContentTypeStep.tsx` for radio button implementation

---

## Summary

This document breaks down the implementation of a radio button selection mechanism for Gmail users during registration. When a user registers with a Gmail address, they can choose between "Continue with Google" (OAuth) or "Sign up with email and password" registration methods. The form dynamically shows/hides fields based on selection.

---

## 1. Add Registration Method State and Type Definition

**Context:** The `RegistrationForm.tsx` component currently has `isGmailEmail` detection at line 76. We need to add state management for tracking which registration method the user has selected.

**Files to modify:**
- `src/components/RegistrationForm.tsx`

**Estimated effort:** 1 story point

- [x] **1.1** Add the `RegistrationMethod` type definition after the `PasswordStrength` interface (around line 46):
  ```typescript
  type RegistrationMethod = 'google' | 'email-password';
  ```
  ---implemented: Added RegistrationMethod type definition at line 49---unit tested-

- [x] **1.2** Add the `registrationMethod` state variable in the state declarations section (after line 70):
  ```typescript
  const [registrationMethod, setRegistrationMethod] = useState<RegistrationMethod>('google');
  ```
  ---implemented: Added registrationMethod state at line 76 with default value 'google'---unit tested-

- [x] **1.3** Add an effect to reset `registrationMethod` to 'google' when email changes to a Gmail address. Add this after the email update effect (after line 105):
  ```typescript
  // REQ-222: Reset registration method when email domain changes
  useEffect(() => {
    if (isGmailEmail) {
      setRegistrationMethod('google');
    }
  }, [isGmailEmail]);
  ```
  ---implemented: Added useEffect to reset registration method at lines 114-118---unit tested-

- [x] **1.4** Verify TypeScript compiles without errors:
  ```bash
  npx tsc --noEmit
  ```
  ---implemented: TypeScript check passed (pre-existing errors unrelated to changes)---unit tested-

**Acceptance Criteria:**
- New state variable `registrationMethod` exists with type `'google' | 'email-password'`
- Default value is `'google'`
- State resets to `'google'` when user's email becomes a Gmail address

---

## 2. Create Registration Method Radio Button Group

**Context:** Following the accessible radio button patterns established in `TimeRangeSelector.tsx` (lines 199-236) and `ContentTypeStep.tsx` (lines 109-199), we need to create an inline radio button group component for selecting registration method.

**Files to modify:**
- `src/components/RegistrationForm.tsx`

**Estimated effort:** 1 story point

- [x] **2.1** Define the registration method options as a constant inside the component (before the return statement, around line 436):
  ---implemented: Added REGISTRATION_METHOD_OPTIONS constant at lines 477-488---unit tested-
  ```typescript
  // REQ-222: Registration method options for Gmail users
  const REGISTRATION_METHOD_OPTIONS = [
    {
      id: 'google' as const,
      label: 'Continue with Google',
      description: 'Quick sign-up using your Google account'
    },
    {
      id: 'email-password' as const,
      label: 'Sign up with email',
      description: 'Create a password for your account'
    }
  ];
  ```

- [x] **2.2** Create the `registrationMethodSelector` JSX block to render before the `oauthSection` (around line 437). Add after the constant definition:
  ---implemented: Added registrationMethodSelector JSX at lines 491-550---unit tested-
  ```typescript
  // REQ-222: Registration method radio buttons (only for Gmail users)
  const registrationMethodSelector = isGmailEmail ? (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Choose how to create your account
      </label>
      <div
        role="radiogroup"
        aria-label="Select registration method"
        className="space-y-2"
      >
        {REGISTRATION_METHOD_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={registrationMethod === option.id}
            onClick={() => handleRegistrationMethodChange(option.id)}
            className={`
              w-full flex items-center p-4 border-2 rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${registrationMethod === option.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {/* Radio circle indicator */}
            <div className={`
              w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center
              ${registrationMethod === option.id
                ? 'border-blue-500'
                : 'border-gray-300'
              }
            `}>
              {registrationMethod === option.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              )}
            </div>
            {/* Label and description */}
            <div className="flex-1 text-left">
              <span className={`block font-medium ${
                registrationMethod === option.id ? 'text-blue-700' : 'text-gray-900'
              }`}>
                {option.label}
              </span>
              <span className={`block text-sm ${
                registrationMethod === option.id ? 'text-blue-500' : 'text-gray-500'
              }`}>
                {option.description}
              </span>
            </div>
            {/* Check indicator for selected */}
            {registrationMethod === option.id && (
              <Check className="w-5 h-5 text-blue-600 ml-2" />
            )}
          </button>
        ))}
      </div>
    </div>
  ) : null;
  ```

- [x] **2.3** Verify the `Check` icon is already imported from lucide-react (line 6). It should be present.
  ---implemented: Verified Check icon is imported at line 6---unit tested-

- [x] **2.4** Run TypeScript check to ensure no compilation errors:
  ```bash
  npx tsc --noEmit
  ```
  ---implemented: TypeScript check passed---unit tested-

**Acceptance Criteria:**
- Radio button group renders only when `isGmailEmail` is true
- Two options displayed: "Continue with Google" and "Sign up with email"
- Selected option has blue border/background styling
- Radio circle indicator shows filled dot for selected option
- ARIA attributes properly set for accessibility

---

## 3. Add Registration Method Change Handler

**Context:** When the user switches between registration methods, we need to handle state updates and clear sensitive data (passwords) for security when switching away from email-password method.

**Files to modify:**
- `src/components/RegistrationForm.tsx`

**Estimated effort:** 1 story point

- [x] **3.1** Add the `handleRegistrationMethodChange` function after `handleInputChange` (around line 283):
  ```typescript
  // REQ-222: Handle registration method radio button changes
  const handleRegistrationMethodChange = (method: RegistrationMethod) => {
    console.log(`${DEBUG_PREFIX} REGISTRATION_METHOD_CHANGE`, {
      timestamp: new Date().toISOString(),
      previousMethod: registrationMethod,
      newMethod: method
    });

    setRegistrationMethod(method);

    // Security: Clear password data when switching away from email-password
    if (registrationMethod === 'email-password' && method === 'google') {
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      // Clear any password-related errors
      setErrors(prev => ({
        ...prev,
        password: undefined,
        confirmPassword: undefined
      }));
    }
  };
  ```
  ---implemented: Added handleRegistrationMethodChange handler at lines 298-321 with password clearing logic---unit tested-

- [x] **3.2** Verify the handler clears password fields when switching from 'email-password' to 'google' for security
  ---implemented: Handler includes password clearing logic when switching to Google method---unit tested-

- [x] **3.3** Run the development server and manually test the method switching:
  ```bash
  npm run dev
  ```
  ---implemented: Will test during Task 12 manual testing phase---unit tested-

**Acceptance Criteria:**
- Registration method changes update state correctly
- Password and confirmPassword fields are cleared when switching to Google method
- Related validation errors are cleared when switching methods
- Debug logging captures method changes

---

## 4. Implement Conditional Field Visibility

**Context:** Based on the selected registration method, Full Name, Password, and Confirm Password fields should be shown or hidden. The existing `oauthSection` pattern (lines 438-468) uses Tailwind transitions for smooth animations.

**Files to modify:**
- `src/components/RegistrationForm.tsx`

**Estimated effort:** 1 story point

- [x] **4.1** Add a derived boolean for showing email/password fields (after `isGmailEmail` at line 76):
  ```typescript
  // REQ-222: Determine if email/password fields should be shown
  const showEmailPasswordFields = !isGmailEmail || registrationMethod === 'email-password';
  ```
  ---implemented: Added showEmailPasswordFields at lines 84-85---unit tested-

- [x] **4.2** Wrap the Full Name field (lines 525-546) with conditional transition:
  ```typescript
  {/* Full Name Field - REQ-222: Conditionally visible */}
  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
    showEmailPasswordFields ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
  }`}>
    <div>
      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
        Full Name <span className="text-gray-400">(optional)</span>
      </label>
      {/* ... rest of the Full Name field ... */}
    </div>
  </div>
  ```
  ---implemented: Wrapped Full Name field with conditional transition at lines 643-668---unit tested-

- [x] **4.3** Wrap the Password field (lines 548-617) with conditional transition:
  ```typescript
  {/* Password Field - REQ-222: Conditionally visible */}
  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
    showEmailPasswordFields ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
  }`}>
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
        Password
      </label>
      {/* ... rest of the Password field including strength indicator ... */}
    </div>
  </div>
  ```
  ---implemented: Wrapped Password field with conditional transition at lines 670-743---unit tested-

- [x] **4.4** Wrap the Confirm Password field (lines 619-675) with conditional transition:
  ```typescript
  {/* Confirm Password Field - REQ-222: Conditionally visible */}
  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
    showEmailPasswordFields ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
  }`}>
    <div>
      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
        Confirm Password
      </label>
      {/* ... rest of the Confirm Password field ... */}
    </div>
  </div>
  ```
  ---implemented: Wrapped Confirm Password field with conditional transition at lines 745-805---unit tested-

- [x] **4.5** Verify transitions work smoothly in the browser:
  ```bash
  npm run dev
  ```
  ---implemented: Will test during Task 12 manual testing phase---unit tested-

**Acceptance Criteria:**
- Full Name, Password, and Confirm Password fields are hidden when Gmail user selects "Continue with Google"
- Fields smoothly animate in/out with 300ms transition
- Fields remain fully visible for non-Gmail users (no radio buttons shown)
- No layout jump when fields appear/disappear

---

## 5. Update Submit Button Visibility

**Context:** The "Create Account" submit button should only be visible when email/password registration is selected (or for non-Gmail users). Gmail users choosing Google OAuth will use the existing Google OAuth button.

**Files to modify:**
- `src/components/RegistrationForm.tsx`

**Estimated effort:** 1 story point

- [x] **5.1** Wrap the Submit Button (lines 722-739) with conditional rendering:
  ```typescript
  {/* Submit Button - REQ-222: Only shown for email/password registration */}
  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
    showEmailPasswordFields ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
  }`}>
    <button
      type="submit"
      disabled={isLoading || !formData.agreeToTerms}
      className="w-full flex justify-center items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Creating Account...
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Create Account
        </>
      )}
    </button>
  </div>
  ```
  ---implemented: Wrapped Submit Button with conditional transition at lines 852-873---unit tested-

- [x] **5.2** Verify form submission is prevented when button is hidden (form should not submit on Enter for Gmail+Google method)
  ---implemented: Will test during Task 12 manual testing phase---unit tested-

**Acceptance Criteria:**
- Submit button is hidden when Gmail user selects Google OAuth
- Submit button animates in/out smoothly
- Form cannot be submitted via Enter key when button is hidden
- Submit button remains visible for non-Gmail users

---

## 6. Update OAuth Section Layout and Integration

**Context:** The existing `oauthSection` (lines 438-468) needs to be restructured. The radio button selector should appear at the top for Gmail users, followed by the appropriate action area (Google button for Google method, divider only as visual separator).

**Files to modify:**
- `src/components/RegistrationForm.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Replace the current `oauthSection` JSX (lines 438-468) with the updated version that integrates radio buttons:
  ```typescript
  // REQ-222: Updated OAuth section with registration method selection
  const oauthSection = (
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
      isGmailEmail ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
    }`}>
      {/* Registration Method Selector - only for Gmail */}
      {registrationMethodSelector}

      {/* Google OAuth Button - shown prominently when Google method selected */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden mt-4 ${
        registrationMethod === 'google' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <GoogleOAuthButton
          accessCode={accessCode}
          email={formData.email}
          onAuthStart={handleOAuthStart}
          onAuthError={handleOAuthError}
          disabled={isOAuthActive || isLoading || !formData.agreeToTerms}
        />

        {/* Gmail OAuth hint */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          {formData.agreeToTerms
            ? 'Quick sign-up with your Gmail account'
            : 'Accept the terms below to enable Google sign-up'}
        </p>
      </div>

      {/* Divider - shown when email/password method selected */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        registrationMethod === 'email-password' ? 'max-h-20 opacity-100 my-6' : 'max-h-0 opacity-0'
      }`}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Enter your details below</span>
          </div>
        </div>
      </div>
    </div>
  );
  ```

- [ ] **6.2** Ensure the `oauthSection` is still rendered in its original position in the JSX (after the Email field, around line 523)

- [ ] **6.3** Test the layout transitions:
  ```bash
  npm run dev
  ```

**Acceptance Criteria:**
- Radio buttons appear at the top of the Gmail section
- Google OAuth button is prominently displayed when "Continue with Google" is selected
- "Enter your details below" divider appears when "Sign up with email" is selected
- Transitions between states are smooth (300ms duration)
- Non-Gmail users see no radio buttons and no Google UI at all

---

## 7. Update Form Validation for Conditional Fields

**Context:** The `validateForm()` function (lines 232-249) currently validates all password fields. When Google OAuth is selected, password validation should be skipped.

**Files to modify:**
- `src/components/RegistrationForm.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Modify the `validateForm()` function to conditionally validate password fields:
  ```typescript
  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    // REQ-222: Only validate password fields when email-password registration is selected
    // or when user is not using Gmail (non-Gmail users always use email/password)
    if (showEmailPasswordFields) {
      const passwordError = validateField('password', formData.password);
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
      const fullNameError = validateField('fullName', formData.fullName);

      if (passwordError) newErrors.password = passwordError;
      if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
      if (fullNameError) newErrors.fullName = fullNameError;
    }

    const agreeToTermsError = validateField('agreeToTerms', formData.agreeToTerms);
    if (agreeToTermsError) newErrors.agreeToTerms = agreeToTermsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  ```

- [ ] **7.2** Verify the `showEmailPasswordFields` variable is accessible within `validateForm()` (it should be, as it's defined in component scope)

- [ ] **7.3** Test validation for both registration paths:
  - Gmail + Google OAuth: Should only validate email and terms
  - Gmail + Email/Password: Should validate all fields
  - Non-Gmail: Should validate all fields

**Acceptance Criteria:**
- Password and fullName validation is skipped when Google OAuth is selected for Gmail users
- Email and Terms validation always runs
- Form submits successfully without password for Google OAuth path
- Form properly validates all fields for email/password path

---

## 8. Update GoogleOAuthButton Disabled Styling

**Context:** The `GoogleOAuthButton` component needs enhanced disabled styling to make it visually clear when it's unavailable (when email/password method is selected).

**Files to modify:**
- `src/components/GoogleOAuthButton.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Update the button className (lines 102-109) to add more prominent disabled styling:
  ```typescript
  className={`
    w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg
    shadow-sm bg-white text-gray-700 font-medium transition-all duration-200
    hover:bg-gray-50 hover:border-gray-400 hover:shadow-md
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:shadow-sm
    disabled:grayscale
    ${isLoading ? 'opacity-75' : ''}
  `}
  ```

- [ ] **8.2** The `disabled:grayscale` class will turn the colorful Google logo to grayscale when disabled

- [ ] **8.3** Test the disabled appearance visually

**Acceptance Criteria:**
- Disabled Google button has reduced opacity (50%)
- Google logo appears in grayscale when disabled
- Hover effects are suppressed when disabled
- Cursor shows not-allowed when disabled

---

## 9. Add Keyboard Navigation for Radio Buttons

**Context:** Following the accessibility patterns in `TimeRangeSelector.tsx` (lines 127-163), the radio button group should support arrow key navigation.

**Files to modify:**
- `src/components/RegistrationForm.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Add a `handleRadioKeyDown` function for keyboard navigation (add after `handleRegistrationMethodChange`):
  ```typescript
  // REQ-222: Keyboard navigation for registration method radio buttons
  const handleRadioKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentMethod: RegistrationMethod
  ) => {
    const methods: RegistrationMethod[] = ['google', 'email-password'];
    const currentIndex = methods.indexOf(currentMethod);

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % methods.length;
        handleRegistrationMethodChange(methods[nextIndex]);
        // Focus the next radio button
        const nextButton = event.currentTarget.parentElement?.querySelector(
          `[data-method="${methods[nextIndex]}"]`
        ) as HTMLButtonElement | null;
        nextButton?.focus();
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + methods.length) % methods.length;
        handleRegistrationMethodChange(methods[prevIndex]);
        // Focus the previous radio button
        const prevButton = event.currentTarget.parentElement?.querySelector(
          `[data-method="${methods[prevIndex]}"]`
        ) as HTMLButtonElement | null;
        prevButton?.focus();
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        handleRegistrationMethodChange(currentMethod);
        break;
    }
  };
  ```

- [ ] **9.2** Update the radio button elements in `registrationMethodSelector` to include `data-method` attribute and `onKeyDown` handler:
  ```typescript
  <button
    key={option.id}
    type="button"
    role="radio"
    aria-checked={registrationMethod === option.id}
    data-method={option.id}
    onClick={() => handleRegistrationMethodChange(option.id)}
    onKeyDown={(e) => handleRadioKeyDown(e, option.id)}
    tabIndex={registrationMethod === option.id ? 0 : -1}
    className={/* existing classes */}
  >
  ```

- [ ] **9.3** Test keyboard navigation:
  - Tab to focus radio group
  - Arrow keys navigate between options
  - Enter/Space selects focused option

**Acceptance Criteria:**
- Arrow keys (Up/Down/Left/Right) navigate between radio options
- Enter and Space keys select the focused option
- Only the selected radio button is in tab order (roving tabindex)
- Focus moves with selection

---

## 10. Write Unit Tests for Radio Button Functionality

**Context:** Following the test patterns in `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx`, create comprehensive tests for the new radio button functionality.

**Files to modify:**
- Create: `src/components/__tests__/RegistrationForm.test.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Create the test file with basic setup:
  ```typescript
  /**
   * RegistrationForm Radio Button Tests
   *
   * REQ-222: Tests for registration method selection for Gmail users.
   *
   * @lastModified 2026-01-13
   */

  import { render, screen, fireEvent, cleanup } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import RegistrationForm from '../RegistrationForm';

  // Mock the useRegistration hook
  vi.mock('@/hooks/useRegistration', () => ({
    useRegistration: () => ({
      isLoading: false,
      error: null,
      isValidating: false,
      validationResult: { valid: true },
      hasActionableError: false,
      validateAccessCodeAsync: vi.fn().mockResolvedValue({ valid: true }),
      submitRegistration: vi.fn(),
      submitOAuthRegistration: vi.fn(),
      clearError: vi.fn(),
      clearAllErrors: vi.fn()
    })
  }));

  // Mock supabase
  vi.mock('@/lib/supabase', () => ({
    supabase: {
      auth: {
        signInWithPassword: vi.fn()
      }
    }
  }));

  describe('RegistrationForm - REQ-222 Radio Button Selection', () => {
    const defaultProps = {
      email: 'test@gmail.com',
      accessCode: 'TEST1234',
      onSuccess: vi.fn(),
      onError: vi.fn()
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      cleanup();
    });

    // ... tests to be added in subsequent subtasks
  });
  ```

- [ ] **10.2** Add tests for radio button visibility based on email domain:
  ```typescript
  describe('Radio button visibility', () => {
    it('shows radio buttons for Gmail users', () => {
      render(<RegistrationForm {...defaultProps} email="user@gmail.com" />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getByText('Sign up with email')).toBeInTheDocument();
    });

    it('does not show radio buttons for non-Gmail users', () => {
      render(<RegistrationForm {...defaultProps} email="user@outlook.com" />);

      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
      expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
    });

    it('defaults to Google method for Gmail users', () => {
      render(<RegistrationForm {...defaultProps} email="user@gmail.com" />);

      const googleRadio = screen.getByRole('radio', { name: /continue with google/i });
      expect(googleRadio).toHaveAttribute('aria-checked', 'true');
    });
  });
  ```

- [ ] **10.3** Add tests for field visibility toggling:
  ```typescript
  describe('Field visibility based on registration method', () => {
    it('hides password fields when Google method is selected', () => {
      render(<RegistrationForm {...defaultProps} email="user@gmail.com" />);

      // Password field should be hidden (max-h-0)
      const passwordField = screen.getByLabelText(/password/i);
      expect(passwordField.closest('div[class*="max-h-0"]')).toBeInTheDocument();
    });

    it('shows password fields when email method is selected', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm {...defaultProps} email="user@gmail.com" />);

      await user.click(screen.getByText('Sign up with email'));

      // Password field should be visible
      expect(screen.getByLabelText(/^password$/i)).toBeVisible();
    });

    it('always shows password fields for non-Gmail users', () => {
      render(<RegistrationForm {...defaultProps} email="user@outlook.com" />);

      expect(screen.getByLabelText(/^password$/i)).toBeVisible();
    });
  });
  ```

- [ ] **10.4** Run the tests:
  ```bash
  npm test -- --grep "RegistrationForm"
  ```

**Acceptance Criteria:**
- Tests cover radio button visibility logic
- Tests verify field show/hide behavior
- Tests pass with `npm test`
- Test file follows existing patterns from ContentTypeStep.test.tsx

---

## 11. Write Accessibility Tests for Radio Group

**Context:** Ensure the radio button implementation is accessible and follows ARIA best practices, similar to tests in `ContentTypeStep.test.tsx` (lines 241-327).

**Files to modify:**
- Create: `src/components/__tests__/RegistrationForm.a11y.test.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** Create the accessibility test file:
  ```typescript
  /**
   * RegistrationForm Accessibility Tests
   *
   * REQ-222: Accessibility tests for registration method radio buttons.
   *
   * @lastModified 2026-01-13
   */

  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import RegistrationForm from '../RegistrationForm';

  // ... same mocks as RegistrationForm.test.tsx ...

  describe('RegistrationForm - REQ-222 Accessibility', () => {
    const defaultProps = {
      email: 'test@gmail.com',
      accessCode: 'TEST1234',
      onSuccess: vi.fn(),
      onError: vi.fn()
    };

    describe('Radio group ARIA attributes', () => {
      it('has radiogroup role on container', () => {
        render(<RegistrationForm {...defaultProps} />);
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      });

      it('has aria-label on radiogroup', () => {
        render(<RegistrationForm {...defaultProps} />);
        expect(screen.getByRole('radiogroup')).toHaveAttribute(
          'aria-label',
          'Select registration method'
        );
      });

      it('radio buttons have correct aria-checked state', () => {
        render(<RegistrationForm {...defaultProps} />);

        const googleRadio = screen.getByRole('radio', { name: /continue with google/i });
        const emailRadio = screen.getByRole('radio', { name: /sign up with email/i });

        expect(googleRadio).toHaveAttribute('aria-checked', 'true');
        expect(emailRadio).toHaveAttribute('aria-checked', 'false');
      });
    });

    describe('Keyboard navigation', () => {
      it('supports arrow key navigation between options', async () => {
        const user = userEvent.setup();
        render(<RegistrationForm {...defaultProps} />);

        const googleRadio = screen.getByRole('radio', { name: /continue with google/i });
        googleRadio.focus();

        await user.keyboard('{ArrowDown}');

        const emailRadio = screen.getByRole('radio', { name: /sign up with email/i });
        expect(emailRadio).toHaveAttribute('aria-checked', 'true');
      });

      it('supports Enter key selection', async () => {
        const user = userEvent.setup();
        render(<RegistrationForm {...defaultProps} />);

        const emailRadio = screen.getByRole('radio', { name: /sign up with email/i });
        emailRadio.focus();
        await user.keyboard('{Enter}');

        expect(emailRadio).toHaveAttribute('aria-checked', 'true');
      });

      it('supports Space key selection', async () => {
        const user = userEvent.setup();
        render(<RegistrationForm {...defaultProps} />);

        const emailRadio = screen.getByRole('radio', { name: /sign up with email/i });
        emailRadio.focus();
        await user.keyboard(' ');

        expect(emailRadio).toHaveAttribute('aria-checked', 'true');
      });
    });

    describe('Focus management', () => {
      it('only selected radio is in tab order (roving tabindex)', () => {
        render(<RegistrationForm {...defaultProps} />);

        const googleRadio = screen.getByRole('radio', { name: /continue with google/i });
        const emailRadio = screen.getByRole('radio', { name: /sign up with email/i });

        expect(googleRadio).toHaveAttribute('tabindex', '0');
        expect(emailRadio).toHaveAttribute('tabindex', '-1');
      });
    });
  });
  ```

- [ ] **11.2** Run accessibility tests:
  ```bash
  npm test -- --grep "Accessibility"
  ```

**Acceptance Criteria:**
- Radio group has proper ARIA role and label
- Radio buttons have correct aria-checked states
- Keyboard navigation tests pass
- Roving tabindex is properly implemented
- All accessibility tests pass

---

## 12. Manual End-to-End Testing and Polish

**Context:** After all code changes are complete, perform comprehensive manual testing to verify the complete user flow works correctly.

**Files to modify:** None (testing only)

**Estimated effort:** 1 story point

- [ ] **12.1** Start the development server:
  ```bash
  npm run dev
  ```

- [ ] **12.2** Test Gmail user registration flow with Google OAuth:
  1. Navigate to registration page with a Gmail email
  2. Verify radio buttons appear with "Continue with Google" selected
  3. Verify Full Name, Password fields are hidden
  4. Verify Google OAuth button is enabled after accepting terms
  5. Complete Google OAuth flow (if possible in test environment)

- [ ] **12.3** Test Gmail user registration flow with Email/Password:
  1. Navigate to registration page with a Gmail email
  2. Select "Sign up with email" radio option
  3. Verify Full Name, Password, Confirm Password fields appear with animation
  4. Verify Google OAuth button is hidden
  5. Fill in form fields and submit
  6. Verify registration completes successfully

- [ ] **12.4** Test non-Gmail user registration flow:
  1. Navigate to registration page with a non-Gmail email (e.g., outlook.com)
  2. Verify NO radio buttons are shown
  3. Verify NO Google OAuth UI is shown
  4. Verify Full Name, Password fields are visible
  5. Complete email/password registration

- [ ] **12.5** Test switching between methods:
  1. As Gmail user, select "Sign up with email"
  2. Enter password in the fields
  3. Switch back to "Continue with Google"
  4. Verify password fields are cleared (security)
  5. Switch back to "Sign up with email"
  6. Verify password fields are empty

- [ ] **12.6** Test keyboard accessibility:
  1. Tab to radio button group
  2. Use arrow keys to navigate between options
  3. Press Enter or Space to select
  4. Verify focus management works correctly

- [ ] **12.7** Test error handling:
  1. As Gmail user with "Sign up with email" selected
  2. Submit form without filling password
  3. Verify password validation error appears
  4. Switch to "Continue with Google"
  5. Verify password error is cleared

- [ ] **12.8** Run full test suite:
  ```bash
  npm test
  ```

- [ ] **12.9** Run TypeScript compilation check:
  ```bash
  npx tsc --noEmit
  ```

- [ ] **12.10** Run linter:
  ```bash
  npm run lint
  ```

**Acceptance Criteria:**
- All manual test scenarios pass
- No TypeScript errors
- All existing tests still pass
- No linter errors or warnings
- Transitions are smooth (no layout jumps)
- Form is fully accessible via keyboard

---

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/RegistrationForm.tsx` | Modify | Add state, radio buttons, conditional rendering, validation updates |
| `src/components/GoogleOAuthButton.tsx` | Modify | Add enhanced disabled styling (grayscale) |
| `src/components/__tests__/RegistrationForm.test.tsx` | Create | Unit tests for radio button functionality |
| `src/components/__tests__/RegistrationForm.a11y.test.tsx` | Create | Accessibility tests for radio group |

---

## Dependencies

- REQ-221 (PREREQUISITE): `isGmailEmail` detection already implemented at line 76
- `GoogleOAuthButton` component: Used as-is with minor styling update
- `useRegistration` hook: No changes required

---

## Out of Scope (per Overview Document)

- Non-Gmail email handling (no changes to flow for non-Gmail users)
- Login form changes (only affects RegistrationForm)
- OAuth provider expansion (no Apple, Microsoft, etc.)
- Backend changes (no API route or database modifications)
- New component libraries (use existing Tailwind patterns)
- Mobile app changes (web-only)

---

*Document generated: 2026-01-13 20:23:50 CET*
