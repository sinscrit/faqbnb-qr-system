# REQ-329: Generate Translations for 5 Non-English Languages (Auth & Registration) - Implementation Overview

**Created:** 2026-01-18 16:30:00 UTC
**Last Modified:** 2026-01-18 16:30:00 UTC
**Request Reference:** gen_requests_epic2.md - Request #329
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.9
**Priority:** High (Final task in Sub-Epic 2A sequence)

---

## Executive Summary

This document provides the implementation breakdown for generating translations of all Authentication and Registration UI strings into the five supported non-English languages: French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it). This task assumes that Tasks 2A.1 through 2A.8 have been completed, meaning all auth-related components have been internationalized with translation keys and the English (`en.json`) auth namespace is fully populated.

The scope includes translating approximately **35-40 authentication-related translation keys** across the `auth` namespace (covering login, signup, OAuth, registration success, and registration complete flows) plus any supporting keys in the `common` namespace used by auth components.

---

## Dependencies

### Prerequisites (Must Be Completed First)

| Dependency | Status | Description |
|------------|--------|-------------|
| **Epic 1: L10N Foundation** | Required | `next-intl` package installation, i18n configuration, IntlProvider setup |
| **Task 2A.1: Auth Namespace** | Required | `auth` namespace structure in `/messages/en.json` |
| **Task 2A.2: LoginPageContent** | Required | All login page strings extracted to translation keys |
| **Task 2A.3: LoginForm** | Required | All login form strings extracted to translation keys |
| **Task 2A.4: RegistrationForm** | Required | All registration form strings extracted to translation keys |
| **Task 2A.5: GoogleOAuthButton** | Required | All OAuth button strings extracted to translation keys |
| **Task 2A.6: Register Page** | Required | Register page loading fallback translated |
| **Task 2A.7: Registration Success** | Required | All success page strings extracted to translation keys |
| **Task 2A.8: Complete Registration** | Required | All complete registration strings extracted to translation keys |

### Source of Truth

The English translation file (`/messages/en.json`) serves as the source of truth. All non-English translation files must mirror its structure exactly.

---

## Current State Analysis

### Translation File Locations

| Language | File Path | Code |
|----------|-----------|------|
| English | `/messages/en.json` | en |
| French | `/messages/fr.json` | fr |
| Spanish | `/messages/es.json` | es |
| German | `/messages/de.json` | de |
| Dutch | `/messages/nl.json` | nl |
| Italian | `/messages/it.json` | it |

### Current Auth Namespace Structure in en.json (Basic)

The current `en.json` has a basic auth namespace:

```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "continueWithGoogle": "Continue with Google",
    "rememberMe": "Remember me",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?"
  }
}
```

### Expected Auth Namespace Structure After Tasks 2A.1-2A.8

Based on the implementation plan and previous task overviews (REQ-328, REQ-329), the complete auth namespace should include:

```json
{
  "auth": {
    "login": {
      "title": "Sign in to your account",
      "subtitle": "Access the FAQBNB administration panel",
      "brand": "FAQBNB",
      "adminAccess": "Admin Access",
      "backToHome": "Back to Home",
      "clearSession": "Clear Session",
      "secureAccess": "Secure Access",
      "secureAccessDescription": "This area is restricted to authorized administrators only. All access attempts are logged and monitored.",
      "loading": {
        "authenticating": "Completing authentication...",
        "loading": "Loading authentication..."
      },
      "messages": {
        "success": "Login successful! Redirecting...",
        "completingGoogle": "Completing Google sign-in..."
      },
      "form": {
        "header": "Sign in with your account",
        "divider": "Or continue with email",
        "emailLabel": "Email Address",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Enter your password",
        "rememberMe": "Remember me for 30 days",
        "submitButton": "Sign In with Email",
        "submitting": "Signing In...",
        "restrictedAccess": "Access restricted to authorized administrators only"
      },
      "validation": {
        "emailRequired": "Email is required",
        "emailInvalid": "Please enter a valid email address",
        "passwordRequired": "Password is required",
        "passwordTooShort": "Password must be at least 6 characters"
      },
      "errors": {
        "authenticationFailed": "Authentication Failed",
        "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
        "accessDenied": "Access denied. Admin privileges are required.",
        "noUserReturned": "Login failed: No user returned"
      }
    },
    "signup": {
      "title": "Create your account",
      "subtitle": "Join FAQBNB and start managing your properties",
      "loading": {
        "page": "Loading registration page..."
      },
      "form": {
        "fullNameLabel": "Full Name",
        "fullNamePlaceholder": "John Doe",
        "fullNameOptional": "(optional)",
        "emailLabel": "Email Address",
        "emailLinked": "This email is linked to your access code and cannot be changed.",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Create a strong password",
        "confirmPasswordLabel": "Confirm Password",
        "confirmPasswordPlaceholder": "Confirm your password",
        "submitButton": "Create Account",
        "submitting": "Creating Account..."
      },
      "terms": {
        "label": "I agree to the",
        "termsOfService": "Terms of Service",
        "and": "and",
        "privacyPolicy": "Privacy Policy"
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
      "passwordMatch": {
        "match": "Passwords match",
        "noMatch": "Passwords do not match"
      },
      "methods": {
        "googleOption": "Continue with Google",
        "googleDescription": "Quick sign-up using your Google account",
        "emailOption": "Sign up with email",
        "emailDescription": "Create a password for your account",
        "chooseMethod": "Choose how to create your account"
      },
      "accessCode": {
        "info": "Access code:",
        "accountLinked": "Your account will be linked to your verified access code"
      },
      "errors": {
        "connectingGoogle": "Connecting to Google...",
        "failed": "Registration Failed"
      }
    },
    "oauth": {
      "continueWithGoogle": "Continue with Google",
      "connecting": "Connecting to Google...",
      "rateLimitError": "Too many authentication attempts. Please try again in {minutes} minutes."
    },
    "success": {
      "subtitle": "Registration Complete",
      "heading": "Registration Successful!",
      "autoLogin": {
        "loading": "Logging you in automatically...",
        "error": "Automatic login failed. Please use the manual login button.",
        "errorMessage": "Automatic login failed. Please use the manual login button."
      },
      "messages": {
        "oauthSuccess": "Your account has been created successfully with Google OAuth. You will be redirected to the dashboard shortly.",
        "emailSuccess": "Your account has been created successfully. You can now log in to access all FAQBNB features."
      },
      "setup": {
        "heading": "Account Setup Complete:",
        "userCreated": "User account created",
        "accountEstablished": "Default account established",
        "adminConfigured": "Admin privileges configured",
        "accessValidated": "Access code validated"
      },
      "buttons": {
        "dashboard": "Go to Dashboard",
        "login": "Continue to Login",
        "home": "Back to Home"
      },
      "redirectNotice": {
        "loggingIn": "Automatic login in progress...",
        "manualFallback": "Automatic login failed. Please use the manual buttons above.",
        "dashboardRedirect": "You will be automatically redirected to the dashboard in 2 seconds.",
        "loginRedirect": "You will be automatically redirected to the login page in 5 seconds."
      }
    },
    "completeRegistration": {
      "brand": "FAQBNB",
      "subtitle": "Complete Registration",
      "heading": "Almost there!",
      "description": "Your Google sign-in was successful, but we need an access code to complete your registration.",
      "signedInAs": "Signed in as:",
      "instruction": "Enter your access code to complete account setup.",
      "form": {
        "accessCodeLabel": "Access Code",
        "accessCodePlaceholder": "Enter your access code",
        "accessCodeHelp": "Check your email for the access code from your invitation.",
        "submitButton": "Complete Registration",
        "submitting": "Completing Registration..."
      },
      "success": {
        "heading": "Registration Complete!",
        "message": "Your account has been set up successfully.",
        "redirecting": "Redirecting to dashboard..."
      },
      "signOut": {
        "prompt": "Wrong account? Sign out and try again.",
        "button": "Sign Out"
      },
      "loading": {
        "checkingAuth": "Checking authentication...",
        "page": "Loading..."
      },
      "footer": {
        "backToHome": "Back to Home",
        "requestAccess": "Request Access Code"
      },
      "errors": {
        "noSession": "No valid session found. Please try logging in again."
      }
    },
    "logout": {
      "button": "Sign Out",
      "loggingOut": "Signing out..."
    }
  }
}
```

---

## Implementation Tasks

### Task 2A.9.1: Verify English Source Translations Are Complete
**Effort:** 15 minutes

Before generating translations, verify that `/messages/en.json` contains all required auth namespace keys from Tasks 2A.1-2A.8:

1. Read the current `/messages/en.json` file
2. Verify all keys from the expected structure above are present
3. Document any missing keys that need to be added first

### Task 2A.9.2: Generate French (fr.json) Auth Translations
**Effort:** 20 minutes

Add/update the `auth` namespace in `/messages/fr.json` with French translations:

```json
{
  "auth": {
    "login": {
      "title": "Connectez-vous a votre compte",
      "subtitle": "Accedez au panneau d'administration FAQBNB",
      "brand": "FAQBNB",
      "adminAccess": "Acces Administrateur",
      "backToHome": "Retour a l'accueil",
      "clearSession": "Effacer la session",
      "secureAccess": "Acces Securise",
      "secureAccessDescription": "Cette zone est reservee aux administrateurs autorises uniquement. Toutes les tentatives d'acces sont enregistrees et surveillees.",
      "loading": {
        "authenticating": "Authentification en cours...",
        "loading": "Chargement de l'authentification..."
      },
      "messages": {
        "success": "Connexion reussie! Redirection...",
        "completingGoogle": "Finalisation de la connexion Google..."
      },
      "form": {
        "header": "Connectez-vous avec votre compte",
        "divider": "Ou continuez avec votre email",
        "emailLabel": "Adresse e-mail",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Mot de passe",
        "passwordPlaceholder": "Entrez votre mot de passe",
        "rememberMe": "Se souvenir de moi pendant 30 jours",
        "submitButton": "Se connecter avec l'email",
        "submitting": "Connexion en cours...",
        "restrictedAccess": "Acces reserve aux administrateurs autorises uniquement"
      },
      "validation": {
        "emailRequired": "L'email est requis",
        "emailInvalid": "Veuillez entrer une adresse e-mail valide",
        "passwordRequired": "Le mot de passe est requis",
        "passwordTooShort": "Le mot de passe doit contenir au moins 6 caracteres"
      },
      "errors": {
        "authenticationFailed": "Echec de l'authentification",
        "invalidCredentials": "Email ou mot de passe invalide. Veuillez verifier vos identifiants et reessayer.",
        "accessDenied": "Acces refuse. Des privileges administrateur sont requis.",
        "noUserReturned": "Echec de la connexion: Aucun utilisateur retourne"
      }
    },
    "signup": {
      "title": "Creez votre compte",
      "subtitle": "Rejoignez FAQBNB et commencez a gerer vos proprietes",
      "loading": {
        "page": "Chargement de la page d'inscription..."
      },
      "form": {
        "fullNameLabel": "Nom complet",
        "fullNamePlaceholder": "Jean Dupont",
        "fullNameOptional": "(optionnel)",
        "emailLabel": "Adresse e-mail",
        "emailLinked": "Cet email est lie a votre code d'acces et ne peut pas etre modifie.",
        "passwordLabel": "Mot de passe",
        "passwordPlaceholder": "Creez un mot de passe fort",
        "confirmPasswordLabel": "Confirmer le mot de passe",
        "confirmPasswordPlaceholder": "Confirmez votre mot de passe",
        "submitButton": "Creer un compte",
        "submitting": "Creation du compte..."
      },
      "terms": {
        "label": "J'accepte les",
        "termsOfService": "Conditions d'utilisation",
        "and": "et",
        "privacyPolicy": "Politique de confidentialite"
      },
      "passwordStrength": {
        "label": "Force du mot de passe:",
        "veryWeak": "Tres faible",
        "weak": "Faible",
        "fair": "Moyen",
        "good": "Bon",
        "strong": "Fort",
        "requirements": "Exigences:",
        "minChars": "Au moins 8 caracteres",
        "lowercase": "Une lettre minuscule",
        "uppercase": "Une lettre majuscule",
        "number": "Un chiffre",
        "special": "Un caractere special"
      },
      "passwordMatch": {
        "match": "Les mots de passe correspondent",
        "noMatch": "Les mots de passe ne correspondent pas"
      },
      "methods": {
        "googleOption": "Continuer avec Google",
        "googleDescription": "Inscription rapide avec votre compte Google",
        "emailOption": "S'inscrire avec l'email",
        "emailDescription": "Creez un mot de passe pour votre compte",
        "chooseMethod": "Choisissez comment creer votre compte"
      },
      "accessCode": {
        "info": "Code d'acces:",
        "accountLinked": "Votre compte sera lie a votre code d'acces verifie"
      },
      "errors": {
        "connectingGoogle": "Connexion a Google...",
        "failed": "Echec de l'inscription"
      }
    },
    "oauth": {
      "continueWithGoogle": "Continuer avec Google",
      "connecting": "Connexion a Google...",
      "rateLimitError": "Trop de tentatives d'authentification. Veuillez reessayer dans {minutes} minutes."
    },
    "success": {
      "subtitle": "Inscription terminee",
      "heading": "Inscription reussie!",
      "autoLogin": {
        "loading": "Connexion automatique en cours...",
        "error": "Echec de la connexion automatique. Veuillez utiliser le bouton de connexion manuel.",
        "errorMessage": "Echec de la connexion automatique. Veuillez utiliser le bouton de connexion manuel."
      },
      "messages": {
        "oauthSuccess": "Votre compte a ete cree avec succes via Google OAuth. Vous serez redirige vers le tableau de bord sous peu.",
        "emailSuccess": "Votre compte a ete cree avec succes. Vous pouvez maintenant vous connecter pour acceder a toutes les fonctionnalites de FAQBNB."
      },
      "setup": {
        "heading": "Configuration du compte terminee:",
        "userCreated": "Compte utilisateur cree",
        "accountEstablished": "Compte par defaut etabli",
        "adminConfigured": "Privileges administrateur configures",
        "accessValidated": "Code d'acces valide"
      },
      "buttons": {
        "dashboard": "Aller au tableau de bord",
        "login": "Continuer vers la connexion",
        "home": "Retour a l'accueil"
      },
      "redirectNotice": {
        "loggingIn": "Connexion automatique en cours...",
        "manualFallback": "Echec de la connexion automatique. Veuillez utiliser les boutons ci-dessus.",
        "dashboardRedirect": "Vous serez automatiquement redirige vers le tableau de bord dans 2 secondes.",
        "loginRedirect": "Vous serez automatiquement redirige vers la page de connexion dans 5 secondes."
      }
    },
    "completeRegistration": {
      "brand": "FAQBNB",
      "subtitle": "Terminer l'inscription",
      "heading": "Presque termine!",
      "description": "Votre connexion Google a reussi, mais nous avons besoin d'un code d'acces pour finaliser votre inscription.",
      "signedInAs": "Connecte en tant que:",
      "instruction": "Entrez votre code d'acces pour terminer la configuration du compte.",
      "form": {
        "accessCodeLabel": "Code d'acces",
        "accessCodePlaceholder": "Entrez votre code d'acces",
        "accessCodeHelp": "Verifiez votre email pour le code d'acces de votre invitation.",
        "submitButton": "Terminer l'inscription",
        "submitting": "Finalisation de l'inscription..."
      },
      "success": {
        "heading": "Inscription terminee!",
        "message": "Votre compte a ete configure avec succes.",
        "redirecting": "Redirection vers le tableau de bord..."
      },
      "signOut": {
        "prompt": "Mauvais compte? Deconnectez-vous et reessayez.",
        "button": "Se deconnecter"
      },
      "loading": {
        "checkingAuth": "Verification de l'authentification...",
        "page": "Chargement..."
      },
      "footer": {
        "backToHome": "Retour a l'accueil",
        "requestAccess": "Demander un code d'acces"
      },
      "errors": {
        "noSession": "Aucune session valide trouvee. Veuillez vous reconnecter."
      }
    },
    "logout": {
      "button": "Se deconnecter",
      "loggingOut": "Deconnexion en cours..."
    }
  }
}
```

### Task 2A.9.3: Generate Spanish (es.json) Auth Translations
**Effort:** 20 minutes

Add/update the `auth` namespace in `/messages/es.json` with Spanish translations:

```json
{
  "auth": {
    "login": {
      "title": "Inicia sesion en tu cuenta",
      "subtitle": "Accede al panel de administracion de FAQBNB",
      "brand": "FAQBNB",
      "adminAccess": "Acceso de Administrador",
      "backToHome": "Volver al inicio",
      "clearSession": "Limpiar sesion",
      "secureAccess": "Acceso Seguro",
      "secureAccessDescription": "Esta area esta restringida solo a administradores autorizados. Todos los intentos de acceso se registran y monitorean.",
      "loading": {
        "authenticating": "Completando autenticacion...",
        "loading": "Cargando autenticacion..."
      },
      "messages": {
        "success": "Inicio de sesion exitoso! Redirigiendo...",
        "completingGoogle": "Completando inicio de sesion con Google..."
      },
      "form": {
        "header": "Inicia sesion con tu cuenta",
        "divider": "O continua con email",
        "emailLabel": "Direccion de correo electronico",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Contrasena",
        "passwordPlaceholder": "Ingresa tu contrasena",
        "rememberMe": "Recordarme por 30 dias",
        "submitButton": "Iniciar sesion con email",
        "submitting": "Iniciando sesion...",
        "restrictedAccess": "Acceso restringido solo a administradores autorizados"
      },
      "validation": {
        "emailRequired": "El correo electronico es obligatorio",
        "emailInvalid": "Por favor ingresa un correo electronico valido",
        "passwordRequired": "La contrasena es obligatoria",
        "passwordTooShort": "La contrasena debe tener al menos 6 caracteres"
      },
      "errors": {
        "authenticationFailed": "Autenticacion fallida",
        "invalidCredentials": "Correo electronico o contrasena invalidos. Por favor verifica tus credenciales e intenta de nuevo.",
        "accessDenied": "Acceso denegado. Se requieren privilegios de administrador.",
        "noUserReturned": "Inicio de sesion fallido: No se devolvio ningun usuario"
      }
    },
    "signup": {
      "title": "Crea tu cuenta",
      "subtitle": "Unete a FAQBNB y comienza a gestionar tus propiedades",
      "loading": {
        "page": "Cargando pagina de registro..."
      },
      "form": {
        "fullNameLabel": "Nombre completo",
        "fullNamePlaceholder": "Juan Perez",
        "fullNameOptional": "(opcional)",
        "emailLabel": "Direccion de correo electronico",
        "emailLinked": "Este correo electronico esta vinculado a tu codigo de acceso y no puede ser modificado.",
        "passwordLabel": "Contrasena",
        "passwordPlaceholder": "Crea una contrasena segura",
        "confirmPasswordLabel": "Confirmar contrasena",
        "confirmPasswordPlaceholder": "Confirma tu contrasena",
        "submitButton": "Crear cuenta",
        "submitting": "Creando cuenta..."
      },
      "terms": {
        "label": "Acepto los",
        "termsOfService": "Terminos de servicio",
        "and": "y",
        "privacyPolicy": "Politica de privacidad"
      },
      "passwordStrength": {
        "label": "Fortaleza de la contrasena:",
        "veryWeak": "Muy debil",
        "weak": "Debil",
        "fair": "Regular",
        "good": "Buena",
        "strong": "Fuerte",
        "requirements": "Requisitos:",
        "minChars": "Al menos 8 caracteres",
        "lowercase": "Una letra minuscula",
        "uppercase": "Una letra mayuscula",
        "number": "Un numero",
        "special": "Un caracter especial"
      },
      "passwordMatch": {
        "match": "Las contrasenas coinciden",
        "noMatch": "Las contrasenas no coinciden"
      },
      "methods": {
        "googleOption": "Continuar con Google",
        "googleDescription": "Registro rapido usando tu cuenta de Google",
        "emailOption": "Registrarse con email",
        "emailDescription": "Crea una contrasena para tu cuenta",
        "chooseMethod": "Elige como crear tu cuenta"
      },
      "accessCode": {
        "info": "Codigo de acceso:",
        "accountLinked": "Tu cuenta se vinculara a tu codigo de acceso verificado"
      },
      "errors": {
        "connectingGoogle": "Conectando con Google...",
        "failed": "Registro fallido"
      }
    },
    "oauth": {
      "continueWithGoogle": "Continuar con Google",
      "connecting": "Conectando con Google...",
      "rateLimitError": "Demasiados intentos de autenticacion. Por favor intenta de nuevo en {minutes} minutos."
    },
    "success": {
      "subtitle": "Registro completado",
      "heading": "Registro exitoso!",
      "autoLogin": {
        "loading": "Iniciando sesion automaticamente...",
        "error": "El inicio de sesion automatico fallo. Por favor usa el boton de inicio de sesion manual.",
        "errorMessage": "El inicio de sesion automatico fallo. Por favor usa el boton de inicio de sesion manual."
      },
      "messages": {
        "oauthSuccess": "Tu cuenta ha sido creada exitosamente con Google OAuth. Seras redirigido al panel de control en breve.",
        "emailSuccess": "Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesion para acceder a todas las funciones de FAQBNB."
      },
      "setup": {
        "heading": "Configuracion de cuenta completada:",
        "userCreated": "Cuenta de usuario creada",
        "accountEstablished": "Cuenta predeterminada establecida",
        "adminConfigured": "Privilegios de administrador configurados",
        "accessValidated": "Codigo de acceso validado"
      },
      "buttons": {
        "dashboard": "Ir al panel de control",
        "login": "Continuar al inicio de sesion",
        "home": "Volver al inicio"
      },
      "redirectNotice": {
        "loggingIn": "Inicio de sesion automatico en progreso...",
        "manualFallback": "El inicio de sesion automatico fallo. Por favor usa los botones de arriba.",
        "dashboardRedirect": "Seras redirigido automaticamente al panel de control en 2 segundos.",
        "loginRedirect": "Seras redirigido automaticamente a la pagina de inicio de sesion en 5 segundos."
      }
    },
    "completeRegistration": {
      "brand": "FAQBNB",
      "subtitle": "Completar registro",
      "heading": "Casi terminamos!",
      "description": "Tu inicio de sesion con Google fue exitoso, pero necesitamos un codigo de acceso para completar tu registro.",
      "signedInAs": "Conectado como:",
      "instruction": "Ingresa tu codigo de acceso para completar la configuracion de la cuenta.",
      "form": {
        "accessCodeLabel": "Codigo de acceso",
        "accessCodePlaceholder": "Ingresa tu codigo de acceso",
        "accessCodeHelp": "Revisa tu correo electronico para el codigo de acceso de tu invitacion.",
        "submitButton": "Completar registro",
        "submitting": "Completando registro..."
      },
      "success": {
        "heading": "Registro completado!",
        "message": "Tu cuenta ha sido configurada exitosamente.",
        "redirecting": "Redirigiendo al panel de control..."
      },
      "signOut": {
        "prompt": "Cuenta equivocada? Cierra sesion e intenta de nuevo.",
        "button": "Cerrar sesion"
      },
      "loading": {
        "checkingAuth": "Verificando autenticacion...",
        "page": "Cargando..."
      },
      "footer": {
        "backToHome": "Volver al inicio",
        "requestAccess": "Solicitar codigo de acceso"
      },
      "errors": {
        "noSession": "No se encontro una sesion valida. Por favor intenta iniciar sesion de nuevo."
      }
    },
    "logout": {
      "button": "Cerrar sesion",
      "loggingOut": "Cerrando sesion..."
    }
  }
}
```

### Task 2A.9.4: Generate German (de.json) Auth Translations
**Effort:** 20 minutes

Add/update the `auth` namespace in `/messages/de.json` with German translations:

```json
{
  "auth": {
    "login": {
      "title": "Melden Sie sich bei Ihrem Konto an",
      "subtitle": "Greifen Sie auf das FAQBNB-Administrationspanel zu",
      "brand": "FAQBNB",
      "adminAccess": "Admin-Zugang",
      "backToHome": "Zuruck zur Startseite",
      "clearSession": "Sitzung loschen",
      "secureAccess": "Sicherer Zugang",
      "secureAccessDescription": "Dieser Bereich ist nur fur autorisierte Administratoren zuganglich. Alle Zugriffsversuche werden protokolliert und uberwacht.",
      "loading": {
        "authenticating": "Authentifizierung wird abgeschlossen...",
        "loading": "Authentifizierung wird geladen..."
      },
      "messages": {
        "success": "Anmeldung erfolgreich! Weiterleitung...",
        "completingGoogle": "Google-Anmeldung wird abgeschlossen..."
      },
      "form": {
        "header": "Melden Sie sich mit Ihrem Konto an",
        "divider": "Oder fahren Sie mit E-Mail fort",
        "emailLabel": "E-Mail-Adresse",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Passwort",
        "passwordPlaceholder": "Geben Sie Ihr Passwort ein",
        "rememberMe": "30 Tage angemeldet bleiben",
        "submitButton": "Mit E-Mail anmelden",
        "submitting": "Anmeldung lauft...",
        "restrictedAccess": "Zugang nur fur autorisierte Administratoren"
      },
      "validation": {
        "emailRequired": "E-Mail ist erforderlich",
        "emailInvalid": "Bitte geben Sie eine gultige E-Mail-Adresse ein",
        "passwordRequired": "Passwort ist erforderlich",
        "passwordTooShort": "Das Passwort muss mindestens 6 Zeichen lang sein"
      },
      "errors": {
        "authenticationFailed": "Authentifizierung fehlgeschlagen",
        "invalidCredentials": "Ungultige E-Mail oder Passwort. Bitte uberprufen Sie Ihre Anmeldedaten und versuchen Sie es erneut.",
        "accessDenied": "Zugriff verweigert. Admin-Berechtigungen sind erforderlich.",
        "noUserReturned": "Anmeldung fehlgeschlagen: Kein Benutzer zuruckgegeben"
      }
    },
    "signup": {
      "title": "Erstellen Sie Ihr Konto",
      "subtitle": "Treten Sie FAQBNB bei und beginnen Sie mit der Verwaltung Ihrer Immobilien",
      "loading": {
        "page": "Registrierungsseite wird geladen..."
      },
      "form": {
        "fullNameLabel": "Vollstandiger Name",
        "fullNamePlaceholder": "Max Mustermann",
        "fullNameOptional": "(optional)",
        "emailLabel": "E-Mail-Adresse",
        "emailLinked": "Diese E-Mail ist mit Ihrem Zugangscode verknupft und kann nicht geandert werden.",
        "passwordLabel": "Passwort",
        "passwordPlaceholder": "Erstellen Sie ein sicheres Passwort",
        "confirmPasswordLabel": "Passwort bestatigen",
        "confirmPasswordPlaceholder": "Bestatigen Sie Ihr Passwort",
        "submitButton": "Konto erstellen",
        "submitting": "Konto wird erstellt..."
      },
      "terms": {
        "label": "Ich akzeptiere die",
        "termsOfService": "Nutzungsbedingungen",
        "and": "und",
        "privacyPolicy": "Datenschutzrichtlinie"
      },
      "passwordStrength": {
        "label": "Passwortsicherheit:",
        "veryWeak": "Sehr schwach",
        "weak": "Schwach",
        "fair": "Ausreichend",
        "good": "Gut",
        "strong": "Stark",
        "requirements": "Anforderungen:",
        "minChars": "Mindestens 8 Zeichen",
        "lowercase": "Ein Kleinbuchstabe",
        "uppercase": "Ein Grossbuchstabe",
        "number": "Eine Zahl",
        "special": "Ein Sonderzeichen"
      },
      "passwordMatch": {
        "match": "Passworter stimmen uberein",
        "noMatch": "Passworter stimmen nicht uberein"
      },
      "methods": {
        "googleOption": "Mit Google fortfahren",
        "googleDescription": "Schnelle Registrierung mit Ihrem Google-Konto",
        "emailOption": "Mit E-Mail registrieren",
        "emailDescription": "Erstellen Sie ein Passwort fur Ihr Konto",
        "chooseMethod": "Wahlen Sie, wie Sie Ihr Konto erstellen mochten"
      },
      "accessCode": {
        "info": "Zugangscode:",
        "accountLinked": "Ihr Konto wird mit Ihrem verifizierten Zugangscode verknupft"
      },
      "errors": {
        "connectingGoogle": "Verbindung zu Google wird hergestellt...",
        "failed": "Registrierung fehlgeschlagen"
      }
    },
    "oauth": {
      "continueWithGoogle": "Mit Google fortfahren",
      "connecting": "Verbindung zu Google wird hergestellt...",
      "rateLimitError": "Zu viele Authentifizierungsversuche. Bitte versuchen Sie es in {minutes} Minuten erneut."
    },
    "success": {
      "subtitle": "Registrierung abgeschlossen",
      "heading": "Registrierung erfolgreich!",
      "autoLogin": {
        "loading": "Automatische Anmeldung lauft...",
        "error": "Automatische Anmeldung fehlgeschlagen. Bitte verwenden Sie die manuelle Anmeldeschaltflache.",
        "errorMessage": "Automatische Anmeldung fehlgeschlagen. Bitte verwenden Sie die manuelle Anmeldeschaltflache."
      },
      "messages": {
        "oauthSuccess": "Ihr Konto wurde erfolgreich mit Google OAuth erstellt. Sie werden in Kurze zum Dashboard weitergeleitet.",
        "emailSuccess": "Ihr Konto wurde erfolgreich erstellt. Sie konnen sich jetzt anmelden, um auf alle FAQBNB-Funktionen zuzugreifen."
      },
      "setup": {
        "heading": "Kontoeinrichtung abgeschlossen:",
        "userCreated": "Benutzerkonto erstellt",
        "accountEstablished": "Standardkonto eingerichtet",
        "adminConfigured": "Admin-Berechtigungen konfiguriert",
        "accessValidated": "Zugangscode validiert"
      },
      "buttons": {
        "dashboard": "Zum Dashboard",
        "login": "Zur Anmeldung",
        "home": "Zuruck zur Startseite"
      },
      "redirectNotice": {
        "loggingIn": "Automatische Anmeldung lauft...",
        "manualFallback": "Automatische Anmeldung fehlgeschlagen. Bitte verwenden Sie die Schaltflachen oben.",
        "dashboardRedirect": "Sie werden in 2 Sekunden automatisch zum Dashboard weitergeleitet.",
        "loginRedirect": "Sie werden in 5 Sekunden automatisch zur Anmeldeseite weitergeleitet."
      }
    },
    "completeRegistration": {
      "brand": "FAQBNB",
      "subtitle": "Registrierung abschliessen",
      "heading": "Fast geschafft!",
      "description": "Ihre Google-Anmeldung war erfolgreich, aber wir benotigen einen Zugangscode, um Ihre Registrierung abzuschliessen.",
      "signedInAs": "Angemeldet als:",
      "instruction": "Geben Sie Ihren Zugangscode ein, um die Kontoeinrichtung abzuschliessen.",
      "form": {
        "accessCodeLabel": "Zugangscode",
        "accessCodePlaceholder": "Geben Sie Ihren Zugangscode ein",
        "accessCodeHelp": "Uberprufen Sie Ihre E-Mail auf den Zugangscode aus Ihrer Einladung.",
        "submitButton": "Registrierung abschliessen",
        "submitting": "Registrierung wird abgeschlossen..."
      },
      "success": {
        "heading": "Registrierung abgeschlossen!",
        "message": "Ihr Konto wurde erfolgreich eingerichtet.",
        "redirecting": "Weiterleitung zum Dashboard..."
      },
      "signOut": {
        "prompt": "Falsches Konto? Abmelden und erneut versuchen.",
        "button": "Abmelden"
      },
      "loading": {
        "checkingAuth": "Authentifizierung wird uberpruft...",
        "page": "Laden..."
      },
      "footer": {
        "backToHome": "Zuruck zur Startseite",
        "requestAccess": "Zugangscode anfordern"
      },
      "errors": {
        "noSession": "Keine gultige Sitzung gefunden. Bitte versuchen Sie, sich erneut anzumelden."
      }
    },
    "logout": {
      "button": "Abmelden",
      "loggingOut": "Abmeldung lauft..."
    }
  }
}
```

### Task 2A.9.5: Generate Dutch (nl.json) Auth Translations
**Effort:** 20 minutes

Add/update the `auth` namespace in `/messages/nl.json` with Dutch translations:

```json
{
  "auth": {
    "login": {
      "title": "Log in op uw account",
      "subtitle": "Toegang tot het FAQBNB-beheerpaneel",
      "brand": "FAQBNB",
      "adminAccess": "Beheerderstoegang",
      "backToHome": "Terug naar startpagina",
      "clearSession": "Sessie wissen",
      "secureAccess": "Beveiligde toegang",
      "secureAccessDescription": "Dit gebied is alleen toegankelijk voor geautoriseerde beheerders. Alle toegangspogingen worden geregistreerd en gemonitord.",
      "loading": {
        "authenticating": "Authenticatie wordt voltooid...",
        "loading": "Authenticatie wordt geladen..."
      },
      "messages": {
        "success": "Succesvol ingelogd! Doorsturen...",
        "completingGoogle": "Google-aanmelding wordt voltooid..."
      },
      "form": {
        "header": "Log in met uw account",
        "divider": "Of ga verder met e-mail",
        "emailLabel": "E-mailadres",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Wachtwoord",
        "passwordPlaceholder": "Voer uw wachtwoord in",
        "rememberMe": "30 dagen onthouden",
        "submitButton": "Inloggen met e-mail",
        "submitting": "Bezig met inloggen...",
        "restrictedAccess": "Toegang beperkt tot geautoriseerde beheerders"
      },
      "validation": {
        "emailRequired": "E-mail is verplicht",
        "emailInvalid": "Voer een geldig e-mailadres in",
        "passwordRequired": "Wachtwoord is verplicht",
        "passwordTooShort": "Wachtwoord moet minimaal 6 tekens bevatten"
      },
      "errors": {
        "authenticationFailed": "Authenticatie mislukt",
        "invalidCredentials": "Ongeldige e-mail of wachtwoord. Controleer uw gegevens en probeer het opnieuw.",
        "accessDenied": "Toegang geweigerd. Beheerdersrechten zijn vereist.",
        "noUserReturned": "Inloggen mislukt: Geen gebruiker geretourneerd"
      }
    },
    "signup": {
      "title": "Maak uw account aan",
      "subtitle": "Word lid van FAQBNB en begin met het beheren van uw eigendommen",
      "loading": {
        "page": "Registratiepagina wordt geladen..."
      },
      "form": {
        "fullNameLabel": "Volledige naam",
        "fullNamePlaceholder": "Jan Jansen",
        "fullNameOptional": "(optioneel)",
        "emailLabel": "E-mailadres",
        "emailLinked": "Dit e-mailadres is gekoppeld aan uw toegangscode en kan niet worden gewijzigd.",
        "passwordLabel": "Wachtwoord",
        "passwordPlaceholder": "Maak een sterk wachtwoord",
        "confirmPasswordLabel": "Wachtwoord bevestigen",
        "confirmPasswordPlaceholder": "Bevestig uw wachtwoord",
        "submitButton": "Account aanmaken",
        "submitting": "Account wordt aangemaakt..."
      },
      "terms": {
        "label": "Ik ga akkoord met de",
        "termsOfService": "Servicevoorwaarden",
        "and": "en",
        "privacyPolicy": "Privacybeleid"
      },
      "passwordStrength": {
        "label": "Wachtwoordsterkte:",
        "veryWeak": "Zeer zwak",
        "weak": "Zwak",
        "fair": "Redelijk",
        "good": "Goed",
        "strong": "Sterk",
        "requirements": "Vereisten:",
        "minChars": "Minimaal 8 tekens",
        "lowercase": "Een kleine letter",
        "uppercase": "Een hoofdletter",
        "number": "Een cijfer",
        "special": "Een speciaal teken"
      },
      "passwordMatch": {
        "match": "Wachtwoorden komen overeen",
        "noMatch": "Wachtwoorden komen niet overeen"
      },
      "methods": {
        "googleOption": "Doorgaan met Google",
        "googleDescription": "Snelle registratie met uw Google-account",
        "emailOption": "Registreren met e-mail",
        "emailDescription": "Maak een wachtwoord voor uw account",
        "chooseMethod": "Kies hoe u uw account wilt aanmaken"
      },
      "accessCode": {
        "info": "Toegangscode:",
        "accountLinked": "Uw account wordt gekoppeld aan uw geverifieerde toegangscode"
      },
      "errors": {
        "connectingGoogle": "Verbinden met Google...",
        "failed": "Registratie mislukt"
      }
    },
    "oauth": {
      "continueWithGoogle": "Doorgaan met Google",
      "connecting": "Verbinden met Google...",
      "rateLimitError": "Te veel authenticatiepogingen. Probeer het over {minutes} minuten opnieuw."
    },
    "success": {
      "subtitle": "Registratie voltooid",
      "heading": "Registratie geslaagd!",
      "autoLogin": {
        "loading": "Automatisch inloggen...",
        "error": "Automatisch inloggen mislukt. Gebruik de handmatige inlogknop.",
        "errorMessage": "Automatisch inloggen mislukt. Gebruik de handmatige inlogknop."
      },
      "messages": {
        "oauthSuccess": "Uw account is succesvol aangemaakt met Google OAuth. U wordt binnenkort doorgestuurd naar het dashboard.",
        "emailSuccess": "Uw account is succesvol aangemaakt. U kunt nu inloggen om toegang te krijgen tot alle FAQBNB-functies."
      },
      "setup": {
        "heading": "Accountinstelling voltooid:",
        "userCreated": "Gebruikersaccount aangemaakt",
        "accountEstablished": "Standaardaccount ingesteld",
        "adminConfigured": "Beheerdersrechten geconfigureerd",
        "accessValidated": "Toegangscode gevalideerd"
      },
      "buttons": {
        "dashboard": "Naar dashboard",
        "login": "Naar inloggen",
        "home": "Terug naar startpagina"
      },
      "redirectNotice": {
        "loggingIn": "Automatisch inloggen bezig...",
        "manualFallback": "Automatisch inloggen mislukt. Gebruik de knoppen hierboven.",
        "dashboardRedirect": "U wordt automatisch doorgestuurd naar het dashboard over 2 seconden.",
        "loginRedirect": "U wordt automatisch doorgestuurd naar de inlogpagina over 5 seconden."
      }
    },
    "completeRegistration": {
      "brand": "FAQBNB",
      "subtitle": "Registratie voltooien",
      "heading": "Bijna klaar!",
      "description": "Uw Google-aanmelding is geslaagd, maar we hebben een toegangscode nodig om uw registratie te voltooien.",
      "signedInAs": "Ingelogd als:",
      "instruction": "Voer uw toegangscode in om de accountinstelling te voltooien.",
      "form": {
        "accessCodeLabel": "Toegangscode",
        "accessCodePlaceholder": "Voer uw toegangscode in",
        "accessCodeHelp": "Controleer uw e-mail voor de toegangscode uit uw uitnodiging.",
        "submitButton": "Registratie voltooien",
        "submitting": "Registratie wordt voltooid..."
      },
      "success": {
        "heading": "Registratie voltooid!",
        "message": "Uw account is succesvol ingesteld.",
        "redirecting": "Doorsturen naar dashboard..."
      },
      "signOut": {
        "prompt": "Verkeerd account? Log uit en probeer opnieuw.",
        "button": "Uitloggen"
      },
      "loading": {
        "checkingAuth": "Authenticatie wordt gecontroleerd...",
        "page": "Laden..."
      },
      "footer": {
        "backToHome": "Terug naar startpagina",
        "requestAccess": "Toegangscode aanvragen"
      },
      "errors": {
        "noSession": "Geen geldige sessie gevonden. Probeer opnieuw in te loggen."
      }
    },
    "logout": {
      "button": "Uitloggen",
      "loggingOut": "Uitloggen bezig..."
    }
  }
}
```

### Task 2A.9.6: Generate Italian (it.json) Auth Translations
**Effort:** 20 minutes

Add/update the `auth` namespace in `/messages/it.json` with Italian translations:

```json
{
  "auth": {
    "login": {
      "title": "Accedi al tuo account",
      "subtitle": "Accedi al pannello di amministrazione FAQBNB",
      "brand": "FAQBNB",
      "adminAccess": "Accesso Amministratore",
      "backToHome": "Torna alla home",
      "clearSession": "Cancella sessione",
      "secureAccess": "Accesso Sicuro",
      "secureAccessDescription": "Quest'area e riservata solo agli amministratori autorizzati. Tutti i tentativi di accesso vengono registrati e monitorati.",
      "loading": {
        "authenticating": "Completamento autenticazione...",
        "loading": "Caricamento autenticazione..."
      },
      "messages": {
        "success": "Accesso riuscito! Reindirizzamento...",
        "completingGoogle": "Completamento accesso Google..."
      },
      "form": {
        "header": "Accedi con il tuo account",
        "divider": "Oppure continua con email",
        "emailLabel": "Indirizzo email",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Inserisci la tua password",
        "rememberMe": "Ricordami per 30 giorni",
        "submitButton": "Accedi con email",
        "submitting": "Accesso in corso...",
        "restrictedAccess": "Accesso riservato solo agli amministratori autorizzati"
      },
      "validation": {
        "emailRequired": "L'email e obbligatoria",
        "emailInvalid": "Inserisci un indirizzo email valido",
        "passwordRequired": "La password e obbligatoria",
        "passwordTooShort": "La password deve contenere almeno 6 caratteri"
      },
      "errors": {
        "authenticationFailed": "Autenticazione fallita",
        "invalidCredentials": "Email o password non validi. Verifica le tue credenziali e riprova.",
        "accessDenied": "Accesso negato. Sono richiesti privilegi di amministratore.",
        "noUserReturned": "Accesso fallito: Nessun utente restituito"
      }
    },
    "signup": {
      "title": "Crea il tuo account",
      "subtitle": "Unisciti a FAQBNB e inizia a gestire le tue proprieta",
      "loading": {
        "page": "Caricamento pagina di registrazione..."
      },
      "form": {
        "fullNameLabel": "Nome completo",
        "fullNamePlaceholder": "Mario Rossi",
        "fullNameOptional": "(opzionale)",
        "emailLabel": "Indirizzo email",
        "emailLinked": "Questa email e collegata al tuo codice di accesso e non puo essere modificata.",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Crea una password sicura",
        "confirmPasswordLabel": "Conferma password",
        "confirmPasswordPlaceholder": "Conferma la tua password",
        "submitButton": "Crea account",
        "submitting": "Creazione account..."
      },
      "terms": {
        "label": "Accetto i",
        "termsOfService": "Termini di servizio",
        "and": "e",
        "privacyPolicy": "Informativa sulla privacy"
      },
      "passwordStrength": {
        "label": "Forza della password:",
        "veryWeak": "Molto debole",
        "weak": "Debole",
        "fair": "Discreta",
        "good": "Buona",
        "strong": "Forte",
        "requirements": "Requisiti:",
        "minChars": "Almeno 8 caratteri",
        "lowercase": "Una lettera minuscola",
        "uppercase": "Una lettera maiuscola",
        "number": "Un numero",
        "special": "Un carattere speciale"
      },
      "passwordMatch": {
        "match": "Le password corrispondono",
        "noMatch": "Le password non corrispondono"
      },
      "methods": {
        "googleOption": "Continua con Google",
        "googleDescription": "Registrazione rapida con il tuo account Google",
        "emailOption": "Registrati con email",
        "emailDescription": "Crea una password per il tuo account",
        "chooseMethod": "Scegli come creare il tuo account"
      },
      "accessCode": {
        "info": "Codice di accesso:",
        "accountLinked": "Il tuo account sara collegato al tuo codice di accesso verificato"
      },
      "errors": {
        "connectingGoogle": "Connessione a Google...",
        "failed": "Registrazione fallita"
      }
    },
    "oauth": {
      "continueWithGoogle": "Continua con Google",
      "connecting": "Connessione a Google...",
      "rateLimitError": "Troppi tentativi di autenticazione. Riprova tra {minutes} minuti."
    },
    "success": {
      "subtitle": "Registrazione completata",
      "heading": "Registrazione riuscita!",
      "autoLogin": {
        "loading": "Accesso automatico in corso...",
        "error": "Accesso automatico fallito. Usa il pulsante di accesso manuale.",
        "errorMessage": "Accesso automatico fallito. Usa il pulsante di accesso manuale."
      },
      "messages": {
        "oauthSuccess": "Il tuo account e stato creato con successo tramite Google OAuth. Sarai reindirizzato alla dashboard a breve.",
        "emailSuccess": "Il tuo account e stato creato con successo. Ora puoi accedere per utilizzare tutte le funzionalita di FAQBNB."
      },
      "setup": {
        "heading": "Configurazione account completata:",
        "userCreated": "Account utente creato",
        "accountEstablished": "Account predefinito stabilito",
        "adminConfigured": "Privilegi amministratore configurati",
        "accessValidated": "Codice di accesso convalidato"
      },
      "buttons": {
        "dashboard": "Vai alla dashboard",
        "login": "Continua all'accesso",
        "home": "Torna alla home"
      },
      "redirectNotice": {
        "loggingIn": "Accesso automatico in corso...",
        "manualFallback": "Accesso automatico fallito. Usa i pulsanti sopra.",
        "dashboardRedirect": "Sarai reindirizzato automaticamente alla dashboard tra 2 secondi.",
        "loginRedirect": "Sarai reindirizzato automaticamente alla pagina di accesso tra 5 secondi."
      }
    },
    "completeRegistration": {
      "brand": "FAQBNB",
      "subtitle": "Completa registrazione",
      "heading": "Quasi fatto!",
      "description": "Il tuo accesso Google e riuscito, ma abbiamo bisogno di un codice di accesso per completare la tua registrazione.",
      "signedInAs": "Connesso come:",
      "instruction": "Inserisci il tuo codice di accesso per completare la configurazione dell'account.",
      "form": {
        "accessCodeLabel": "Codice di accesso",
        "accessCodePlaceholder": "Inserisci il tuo codice di accesso",
        "accessCodeHelp": "Controlla la tua email per il codice di accesso dal tuo invito.",
        "submitButton": "Completa registrazione",
        "submitting": "Completamento registrazione..."
      },
      "success": {
        "heading": "Registrazione completata!",
        "message": "Il tuo account e stato configurato con successo.",
        "redirecting": "Reindirizzamento alla dashboard..."
      },
      "signOut": {
        "prompt": "Account sbagliato? Esci e riprova.",
        "button": "Esci"
      },
      "loading": {
        "checkingAuth": "Verifica autenticazione...",
        "page": "Caricamento..."
      },
      "footer": {
        "backToHome": "Torna alla home",
        "requestAccess": "Richiedi codice di accesso"
      },
      "errors": {
        "noSession": "Nessuna sessione valida trovata. Prova ad accedere di nuovo."
      }
    },
    "logout": {
      "button": "Esci",
      "loggingOut": "Disconnessione in corso..."
    }
  }
}
```

### Task 2A.9.7: Update Common Namespace Translations (All Languages)
**Effort:** 15 minutes

Ensure the `common` namespace keys used by auth components are translated in all language files:

**English (en.json) - Add if missing:**
```json
{
  "common": {
    "brand": "FAQBNB",
    "logoAlt": "FAQBNB Logo",
    "backToHome": "Back to Home",
    "footer": {
      "copyright": "2024 FAQBNB. All rights reserved."
    }
  }
}
```

**French (fr.json):**
```json
{
  "common": {
    "brand": "FAQBNB",
    "logoAlt": "Logo FAQBNB",
    "backToHome": "Retour a l'accueil",
    "footer": {
      "copyright": "2024 FAQBNB. Tous droits reserves."
    }
  }
}
```

**Spanish (es.json):**
```json
{
  "common": {
    "brand": "FAQBNB",
    "logoAlt": "Logo FAQBNB",
    "backToHome": "Volver al inicio",
    "footer": {
      "copyright": "2024 FAQBNB. Todos los derechos reservados."
    }
  }
}
```

**German (de.json):**
```json
{
  "common": {
    "brand": "FAQBNB",
    "logoAlt": "FAQBNB Logo",
    "backToHome": "Zuruck zur Startseite",
    "footer": {
      "copyright": "2024 FAQBNB. Alle Rechte vorbehalten."
    }
  }
}
```

**Dutch (nl.json):**
```json
{
  "common": {
    "brand": "FAQBNB",
    "logoAlt": "FAQBNB Logo",
    "backToHome": "Terug naar startpagina",
    "footer": {
      "copyright": "2024 FAQBNB. Alle rechten voorbehouden."
    }
  }
}
```

**Italian (it.json):**
```json
{
  "common": {
    "brand": "FAQBNB",
    "logoAlt": "Logo FAQBNB",
    "backToHome": "Torna alla home",
    "footer": {
      "copyright": "2024 FAQBNB. Tutti i diritti riservati."
    }
  }
}
```

### Task 2A.9.8: Validation and Quality Assurance
**Effort:** 30 minutes

1. **JSON Syntax Validation:** Run JSON validation on all 6 language files
2. **Key Parity Check:** Verify all non-English files have the exact same key structure as en.json
3. **Character Encoding Check:** Verify special characters (accents, umlauts) are properly encoded
4. **Placeholder Preservation:** Verify all `{variable}` placeholders are preserved correctly
5. **Translation Quality Review:** Spot-check translations for accuracy and natural phrasing

### Task 2A.9.9: Test Authentication Flows in All Languages
**Effort:** 45 minutes

1. Switch application locale to each language
2. Test login page displays correctly
3. Test registration page displays correctly
4. Test OAuth button and flow
5. Test registration success page (both OAuth and email flows)
6. Test complete registration page (OAuth completion flow)
7. Verify no text overflow or layout issues

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Type | Scope |
|-----------|-------------------|-------|
| `/messages/en.json` | Edit | Verify/add auth namespace keys if missing |
| `/messages/fr.json` | Edit | Add complete auth namespace translations |
| `/messages/es.json` | Edit | Add complete auth namespace translations |
| `/messages/de.json` | Edit | Add complete auth namespace translations |
| `/messages/nl.json` | Edit | Add complete auth namespace translations |
| `/messages/it.json` | Edit | Add complete auth namespace translations |

### Namespaces to Modify

| Namespace | Purpose | Key Count (Est.) |
|-----------|---------|------------------|
| `auth.login` | Login page and form translations | ~35 |
| `auth.signup` | Registration page and form translations | ~40 |
| `auth.oauth` | OAuth button and flow translations | ~5 |
| `auth.success` | Registration success page translations | ~20 |
| `auth.completeRegistration` | OAuth completion page translations | ~20 |
| `auth.logout` | Sign out translations | ~3 |
| `common` (subset) | Brand, logo, footer shared across auth | ~5 |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/app/login/LoginPageContent.tsx` | Component file - handled in Task 2A.2 |
| `/src/components/LoginForm.tsx` | Component file - handled in Task 2A.3 |
| `/src/components/RegistrationForm.tsx` | Component file - handled in Task 2A.4 |
| `/src/components/GoogleOAuthButton.tsx` | Component file - handled in Task 2A.5 |
| `/src/app/register/page.tsx` | Component file - handled in Task 2A.6 |
| `/src/app/register/success/page.tsx` | Component file - handled in Task 2A.7 |
| `/src/app/register/complete/page.tsx` | Component file - handled in Task 2A.8 |
| `/src/lib/i18n/*` | i18n configuration - handled in Epic 1 |

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Translation generation method | Manual translation with AI assistance | Ensures accuracy and cultural appropriateness |
| Brand name "FAQBNB" | Not translated | Brand names typically remain unchanged |
| Placeholder format | `{variableName}` | Matches ICU message format used by next-intl |
| Accent handling | Use UTF-8 encoded characters | JSON files support full Unicode |
| Time references | Hardcoded in text | Simpler implementation, can parameterize later |
| Terms/Privacy links | Localized text, same URLs | URLs typically don't change per locale |

---

## Translation Guidelines

### General Principles

1. **Natural Phrasing:** Translations should sound natural to native speakers, not literal word-for-word translations
2. **Consistent Terminology:** Use the same term for the same concept throughout (e.g., always "compte" for "account" in French)
3. **Formal vs Informal:** Use formal register (vous/Sie/Lei/usted/u) for professional application context
4. **Cultural Adaptation:** Adapt examples (e.g., placeholder names) to be culturally appropriate
5. **Preserve Placeholders:** All `{variable}` placeholders must be preserved exactly as in English
6. **Button Text:** Keep button text concise - may need to be shorter than English in some languages
7. **Error Messages:** Maintain helpful, non-technical tone across all languages

### Language-Specific Notes

| Language | Notes |
|----------|-------|
| **French (fr)** | Use formal "vous", avoid anglicisms where French equivalents exist |
| **Spanish (es)** | Use neutral Spanish (not region-specific), formal "usted" where applicable |
| **German (de)** | Use formal "Sie", compound words may be long - check UI fit |
| **Dutch (nl)** | Use formal "u", shorter than German but check UI fit |
| **Italian (it)** | Use formal "Lei", verify accented characters render correctly |

---

## Quality Checklist

### Pre-Implementation
- [ ] Verify Tasks 2A.1-2A.8 are completed
- [ ] Verify `/messages/en.json` has complete auth namespace
- [ ] Document exact key structure to replicate

### Implementation (Per Language)
- [ ] Add all `auth.login` keys
- [ ] Add all `auth.signup` keys
- [ ] Add all `auth.oauth` keys
- [ ] Add all `auth.success` keys
- [ ] Add all `auth.completeRegistration` keys
- [ ] Add all `auth.logout` keys
- [ ] Update `common` namespace keys used by auth
- [ ] Validate JSON syntax
- [ ] Verify character encoding
- [ ] Verify placeholder preservation

### Post-Implementation
- [ ] All 6 language files have identical key structures
- [ ] JSON validation passes for all files
- [ ] No missing keys when comparing to en.json
- [ ] Application loads without translation errors
- [ ] Login page renders correctly in all languages
- [ ] Registration page renders correctly in all languages
- [ ] OAuth flow works in all languages
- [ ] Success pages display correctly in all languages
- [ ] Complete registration page works in all languages
- [ ] No layout breaks or text overflow in any language

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Verify English source is complete | 15 min |
| French translations | 20 min |
| Spanish translations | 20 min |
| German translations | 20 min |
| Dutch translations | 20 min |
| Italian translations | 20 min |
| Common namespace updates | 15 min |
| Validation and QA | 30 min |
| Testing in all languages | 45 min |
| **Total** | **~3.5 hours** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tasks 2A.1-2A.8 incomplete | Medium | Critical | Verify all prerequisite tasks before starting |
| Translation quality issues | Medium | Medium | Use AI assistance, professional review for critical text |
| Special character encoding issues | Low | Medium | Use UTF-8, validate JSON files |
| Missing placeholders in translations | Low | High | Automated diff checking between files |
| Layout breaks due to text length | Medium | Low | Test UI in all languages, especially German |
| Inconsistent terminology | Medium | Low | Maintain translation glossary, review consistency |

---

## Notes

1. **Translation Memory:** Consider creating a translation glossary document (`/docs/i18n/glossary.md`) to ensure consistent terminology across all translation tasks in Epic 2.

2. **Character Encoding:** All JSON files should be saved with UTF-8 encoding to properly handle accented characters in French, German, Spanish, and Italian.

3. **Brand Consistency:** The brand name "FAQBNB" should remain unchanged in all languages as it is a proper noun/brand name.

4. **Placeholder Example Names:** The example names in placeholders (e.g., "John Doe", "admin@faqbnb.com") have been localized to culturally appropriate names (e.g., "Jean Dupont" for French, "Max Mustermann" for German).

5. **Dynamic Parameters:** All translations with `{variable}` placeholders must preserve the exact placeholder names as they are used by the next-intl interpolation system.

6. **This task completes Sub-Epic 2A** (Authentication & Registration) and enables international users to complete the entire authentication and registration journey in their preferred language.

---

## References

- [REQ-329 Request Details](../gen_requests_epic2.md#req-329-internationalize-registration-complete-page-component)
- [Implementation Plan: L10N Epic 2](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Implementation Plan: L10N Epic 1](../prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Sub-Epic 2A: Authentication & Registration](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md#sub-epic-2a-authentication--registration)
- [REQ-328 Overview (Registration Success Page)](./REQ-328-update-srcappregistersuccesspagetsx-overview.md)
