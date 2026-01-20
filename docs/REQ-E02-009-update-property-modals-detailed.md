# Detailed Task Breakdown: REQ-E02-009 - Update Property Modal Components with Localized Strings

**Document Created:** 2026-01-20 20:45:00 UTC
**Last Modified:** 2026-01-20 20:45:00 UTC

**Request ID:** REQ-E02-009
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.3
**Size:** M (Medium)
**Priority:** P2

**Overview Document:** [REQ-E02-009-update-property-modals-overview.md](./REQ-E02-009-update-property-modals-overview.md)
**Implementation Plan:** [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)

---

## Executive Summary

This document provides granular, step-by-step implementation tasks for updating three property modal components to use localized strings via the next-intl translation system. The components contain approximately 75 unique hardcoded strings including modal titles, field labels, placeholders, validation messages, button labels, and country names. Each task is sized to approximately 1 story point and can be executed independently where possible.

---

## Pre-Implementation Checklist

Before starting implementation, verify the following prerequisites:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] `useTranslations` hook is functional in client components
- [ ] All 6 language message files exist in `/messages/` directory
- [ ] IntlProvider is properly wrapping the application in `layout.tsx`
- [ ] Task 2F.1 (Create properties namespace structure) is complete or will be done as part of Task 1

---

## Task Breakdown

### Task 1: Add Properties Namespace and Country Translations to Messages Files

**Estimated Effort:** 1 story point
**Dependencies:** None
**Files to Modify:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

#### 1.1 Add Properties Namespace to English Messages File

**File:** `/messages/en.json`

Add the following JSON structure under the root object (merge with existing content):

```json
{
  "properties": {
    "form": {
      "labels": {
        "name": "Property Name",
        "addressLine1": "Address Line 1",
        "addressLine2": "Address Line 2",
        "city": "City",
        "stateProvince": "State/Province",
        "postalCode": "Postal Code",
        "country": "Country"
      },
      "placeholders": {
        "name": "e.g., Beach House",
        "addressLine1": "Street address",
        "addressLine2": "Apt, suite, unit, etc. (optional)",
        "city": "City",
        "stateProvince": "State or Province",
        "postalCode": "ZIP / Postal code",
        "selectCountry": "Select country..."
      },
      "validation": {
        "nameRequired": "Property name is required",
        "nameTooLong": "Property name must be 100 characters or less",
        "addressTooLong": "Address must be 200 characters or less",
        "cityTooLong": "City must be 100 characters or less",
        "stateTooLong": "State/Province must be 100 characters or less",
        "postalCodeTooLong": "Postal code must be 20 characters or less",
        "invalidCountry": "Please select a valid country"
      }
    },
    "modals": {
      "add": {
        "title": "Add New Property",
        "description": "Create a new property by entering the name and address information.",
        "status": {
          "creating": "Creating property...",
          "creatingLabel": "Creating property"
        },
        "actions": {
          "create": "Create Property",
          "creating": "Creating..."
        },
        "errors": {
          "createFailed": "Failed to create property"
        }
      },
      "edit": {
        "title": "Edit Property",
        "description": "Edit the details of your property including name and address information.",
        "status": {
          "saving": "Saving property changes...",
          "savingLabel": "Saving property"
        },
        "actions": {
          "save": "Save Changes",
          "saving": "Saving..."
        },
        "errors": {
          "updateFailed": "Failed to update property"
        }
      },
      "delete": {
        "title": "Delete Property",
        "confirmation": "Are you sure you want to delete the property \"{name}\"? This action cannot be undone.",
        "actions": {
          "delete": "Delete",
          "deleting": "Deleting..."
        }
      }
    }
  },
  "countries": {
    "US": "United States",
    "CA": "Canada",
    "GB": "United Kingdom",
    "AU": "Australia",
    "DE": "Germany",
    "FR": "France",
    "ES": "Spain",
    "IT": "Italy",
    "JP": "Japan",
    "MX": "Mexico",
    "BR": "Brazil",
    "NL": "Netherlands",
    "BE": "Belgium",
    "CH": "Switzerland",
    "AT": "Austria",
    "SE": "Sweden",
    "NO": "Norway",
    "DK": "Denmark",
    "FI": "Finland",
    "IE": "Ireland",
    "PT": "Portugal",
    "NZ": "New Zealand",
    "SG": "Singapore",
    "HK": "Hong Kong"
  }
}
```

**Note:** Also add `"closeModal": "Close modal"` to the existing `common` namespace if not already present.

#### 1.2 Add Translations to Other Language Files

Copy the structure from 1.1 to all other language files with translated values.

**File:** `/messages/fr.json` (French)

```json
{
  "properties": {
    "form": {
      "labels": {
        "name": "Nom de la propriete",
        "addressLine1": "Adresse ligne 1",
        "addressLine2": "Adresse ligne 2",
        "city": "Ville",
        "stateProvince": "Etat/Province",
        "postalCode": "Code postal",
        "country": "Pays"
      },
      "placeholders": {
        "name": "ex., Maison de plage",
        "addressLine1": "Adresse de rue",
        "addressLine2": "Apt, suite, unite, etc. (facultatif)",
        "city": "Ville",
        "stateProvince": "Etat ou Province",
        "postalCode": "Code postal",
        "selectCountry": "Selectionnez un pays..."
      },
      "validation": {
        "nameRequired": "Le nom de la propriete est requis",
        "nameTooLong": "Le nom de la propriete doit comporter 100 caracteres ou moins",
        "addressTooLong": "L'adresse doit comporter 200 caracteres ou moins",
        "cityTooLong": "La ville doit comporter 100 caracteres ou moins",
        "stateTooLong": "L'etat/province doit comporter 100 caracteres ou moins",
        "postalCodeTooLong": "Le code postal doit comporter 20 caracteres ou moins",
        "invalidCountry": "Veuillez selectionner un pays valide"
      }
    },
    "modals": {
      "add": {
        "title": "Ajouter une nouvelle propriete",
        "description": "Creez une nouvelle propriete en entrant le nom et les informations d'adresse.",
        "status": {
          "creating": "Creation de la propriete...",
          "creatingLabel": "Creation de la propriete"
        },
        "actions": {
          "create": "Creer la propriete",
          "creating": "Creation..."
        },
        "errors": {
          "createFailed": "Echec de la creation de la propriete"
        }
      },
      "edit": {
        "title": "Modifier la propriete",
        "description": "Modifiez les details de votre propriete, y compris le nom et les informations d'adresse.",
        "status": {
          "saving": "Enregistrement des modifications...",
          "savingLabel": "Enregistrement de la propriete"
        },
        "actions": {
          "save": "Enregistrer les modifications",
          "saving": "Enregistrement..."
        },
        "errors": {
          "updateFailed": "Echec de la mise a jour de la propriete"
        }
      },
      "delete": {
        "title": "Supprimer la propriete",
        "confirmation": "Etes-vous sur de vouloir supprimer la propriete \"{name}\" ? Cette action ne peut pas etre annulee.",
        "actions": {
          "delete": "Supprimer",
          "deleting": "Suppression..."
        }
      }
    }
  },
  "countries": {
    "US": "Etats-Unis",
    "CA": "Canada",
    "GB": "Royaume-Uni",
    "AU": "Australie",
    "DE": "Allemagne",
    "FR": "France",
    "ES": "Espagne",
    "IT": "Italie",
    "JP": "Japon",
    "MX": "Mexique",
    "BR": "Bresil",
    "NL": "Pays-Bas",
    "BE": "Belgique",
    "CH": "Suisse",
    "AT": "Autriche",
    "SE": "Suede",
    "NO": "Norvege",
    "DK": "Danemark",
    "FI": "Finlande",
    "IE": "Irlande",
    "PT": "Portugal",
    "NZ": "Nouvelle-Zelande",
    "SG": "Singapour",
    "HK": "Hong Kong"
  }
}
```

**File:** `/messages/es.json` (Spanish)

```json
{
  "properties": {
    "form": {
      "labels": {
        "name": "Nombre de la propiedad",
        "addressLine1": "Direccion linea 1",
        "addressLine2": "Direccion linea 2",
        "city": "Ciudad",
        "stateProvince": "Estado/Provincia",
        "postalCode": "Codigo postal",
        "country": "Pais"
      },
      "placeholders": {
        "name": "ej., Casa de playa",
        "addressLine1": "Direccion de calle",
        "addressLine2": "Apt, suite, unidad, etc. (opcional)",
        "city": "Ciudad",
        "stateProvince": "Estado o Provincia",
        "postalCode": "Codigo postal",
        "selectCountry": "Seleccionar pais..."
      },
      "validation": {
        "nameRequired": "El nombre de la propiedad es requerido",
        "nameTooLong": "El nombre de la propiedad debe tener 100 caracteres o menos",
        "addressTooLong": "La direccion debe tener 200 caracteres o menos",
        "cityTooLong": "La ciudad debe tener 100 caracteres o menos",
        "stateTooLong": "El estado/provincia debe tener 100 caracteres o menos",
        "postalCodeTooLong": "El codigo postal debe tener 20 caracteres o menos",
        "invalidCountry": "Por favor seleccione un pais valido"
      }
    },
    "modals": {
      "add": {
        "title": "Agregar nueva propiedad",
        "description": "Cree una nueva propiedad ingresando el nombre y la informacion de direccion.",
        "status": {
          "creating": "Creando propiedad...",
          "creatingLabel": "Creando propiedad"
        },
        "actions": {
          "create": "Crear propiedad",
          "creating": "Creando..."
        },
        "errors": {
          "createFailed": "Error al crear la propiedad"
        }
      },
      "edit": {
        "title": "Editar propiedad",
        "description": "Edite los detalles de su propiedad incluyendo nombre e informacion de direccion.",
        "status": {
          "saving": "Guardando cambios de propiedad...",
          "savingLabel": "Guardando propiedad"
        },
        "actions": {
          "save": "Guardar cambios",
          "saving": "Guardando..."
        },
        "errors": {
          "updateFailed": "Error al actualizar la propiedad"
        }
      },
      "delete": {
        "title": "Eliminar propiedad",
        "confirmation": "Esta seguro de que desea eliminar la propiedad \"{name}\"? Esta accion no se puede deshacer.",
        "actions": {
          "delete": "Eliminar",
          "deleting": "Eliminando..."
        }
      }
    }
  },
  "countries": {
    "US": "Estados Unidos",
    "CA": "Canada",
    "GB": "Reino Unido",
    "AU": "Australia",
    "DE": "Alemania",
    "FR": "Francia",
    "ES": "Espana",
    "IT": "Italia",
    "JP": "Japon",
    "MX": "Mexico",
    "BR": "Brasil",
    "NL": "Paises Bajos",
    "BE": "Belgica",
    "CH": "Suiza",
    "AT": "Austria",
    "SE": "Suecia",
    "NO": "Noruega",
    "DK": "Dinamarca",
    "FI": "Finlandia",
    "IE": "Irlanda",
    "PT": "Portugal",
    "NZ": "Nueva Zelanda",
    "SG": "Singapur",
    "HK": "Hong Kong"
  }
}
```

**File:** `/messages/de.json` (German)

```json
{
  "properties": {
    "form": {
      "labels": {
        "name": "Objektname",
        "addressLine1": "Adresszeile 1",
        "addressLine2": "Adresszeile 2",
        "city": "Stadt",
        "stateProvince": "Bundesland/Provinz",
        "postalCode": "Postleitzahl",
        "country": "Land"
      },
      "placeholders": {
        "name": "z.B., Strandhaus",
        "addressLine1": "Strasse",
        "addressLine2": "Wohnung, Suite, Einheit, etc. (optional)",
        "city": "Stadt",
        "stateProvince": "Bundesland oder Provinz",
        "postalCode": "PLZ",
        "selectCountry": "Land auswahlen..."
      },
      "validation": {
        "nameRequired": "Objektname ist erforderlich",
        "nameTooLong": "Objektname muss 100 Zeichen oder weniger haben",
        "addressTooLong": "Adresse muss 200 Zeichen oder weniger haben",
        "cityTooLong": "Stadt muss 100 Zeichen oder weniger haben",
        "stateTooLong": "Bundesland/Provinz muss 100 Zeichen oder weniger haben",
        "postalCodeTooLong": "Postleitzahl muss 20 Zeichen oder weniger haben",
        "invalidCountry": "Bitte wahlen Sie ein gultiges Land"
      }
    },
    "modals": {
      "add": {
        "title": "Neues Objekt hinzufugen",
        "description": "Erstellen Sie ein neues Objekt, indem Sie den Namen und die Adressinformationen eingeben.",
        "status": {
          "creating": "Objekt wird erstellt...",
          "creatingLabel": "Objekt erstellen"
        },
        "actions": {
          "create": "Objekt erstellen",
          "creating": "Erstellen..."
        },
        "errors": {
          "createFailed": "Objekt konnte nicht erstellt werden"
        }
      },
      "edit": {
        "title": "Objekt bearbeiten",
        "description": "Bearbeiten Sie die Details Ihres Objekts einschliesslich Name und Adressinformationen.",
        "status": {
          "saving": "Anderungen werden gespeichert...",
          "savingLabel": "Objekt speichern"
        },
        "actions": {
          "save": "Anderungen speichern",
          "saving": "Speichern..."
        },
        "errors": {
          "updateFailed": "Objekt konnte nicht aktualisiert werden"
        }
      },
      "delete": {
        "title": "Objekt loschen",
        "confirmation": "Sind Sie sicher, dass Sie das Objekt \"{name}\" loschen mochten? Diese Aktion kann nicht ruckgangig gemacht werden.",
        "actions": {
          "delete": "Loschen",
          "deleting": "Loschen..."
        }
      }
    }
  },
  "countries": {
    "US": "Vereinigte Staaten",
    "CA": "Kanada",
    "GB": "Vereinigtes Konigreich",
    "AU": "Australien",
    "DE": "Deutschland",
    "FR": "Frankreich",
    "ES": "Spanien",
    "IT": "Italien",
    "JP": "Japan",
    "MX": "Mexiko",
    "BR": "Brasilien",
    "NL": "Niederlande",
    "BE": "Belgien",
    "CH": "Schweiz",
    "AT": "Osterreich",
    "SE": "Schweden",
    "NO": "Norwegen",
    "DK": "Danemark",
    "FI": "Finnland",
    "IE": "Irland",
    "PT": "Portugal",
    "NZ": "Neuseeland",
    "SG": "Singapur",
    "HK": "Hongkong"
  }
}
```

**File:** `/messages/nl.json` (Dutch)

```json
{
  "properties": {
    "form": {
      "labels": {
        "name": "Eigenschapnaam",
        "addressLine1": "Adresregel 1",
        "addressLine2": "Adresregel 2",
        "city": "Stad",
        "stateProvince": "Staat/Provincie",
        "postalCode": "Postcode",
        "country": "Land"
      },
      "placeholders": {
        "name": "bijv., Strandhuis",
        "addressLine1": "Straat",
        "addressLine2": "Apt, suite, unit, etc. (optioneel)",
        "city": "Stad",
        "stateProvince": "Staat of Provincie",
        "postalCode": "Postcode",
        "selectCountry": "Selecteer land..."
      },
      "validation": {
        "nameRequired": "Eigenschapnaam is vereist",
        "nameTooLong": "Eigenschapnaam moet 100 tekens of minder zijn",
        "addressTooLong": "Adres moet 200 tekens of minder zijn",
        "cityTooLong": "Stad moet 100 tekens of minder zijn",
        "stateTooLong": "Staat/Provincie moet 100 tekens of minder zijn",
        "postalCodeTooLong": "Postcode moet 20 tekens of minder zijn",
        "invalidCountry": "Selecteer een geldig land"
      }
    },
    "modals": {
      "add": {
        "title": "Nieuwe eigenschap toevoegen",
        "description": "Maak een nieuwe eigenschap aan door de naam en adresgegevens in te voeren.",
        "status": {
          "creating": "Eigenschap wordt aangemaakt...",
          "creatingLabel": "Eigenschap aanmaken"
        },
        "actions": {
          "create": "Eigenschap aanmaken",
          "creating": "Aanmaken..."
        },
        "errors": {
          "createFailed": "Eigenschap kon niet worden aangemaakt"
        }
      },
      "edit": {
        "title": "Eigenschap bewerken",
        "description": "Bewerk de gegevens van uw eigenschap inclusief naam en adresgegevens.",
        "status": {
          "saving": "Wijzigingen worden opgeslagen...",
          "savingLabel": "Eigenschap opslaan"
        },
        "actions": {
          "save": "Wijzigingen opslaan",
          "saving": "Opslaan..."
        },
        "errors": {
          "updateFailed": "Eigenschap kon niet worden bijgewerkt"
        }
      },
      "delete": {
        "title": "Eigenschap verwijderen",
        "confirmation": "Weet u zeker dat u de eigenschap \"{name}\" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
        "actions": {
          "delete": "Verwijderen",
          "deleting": "Verwijderen..."
        }
      }
    }
  },
  "countries": {
    "US": "Verenigde Staten",
    "CA": "Canada",
    "GB": "Verenigd Koninkrijk",
    "AU": "Australie",
    "DE": "Duitsland",
    "FR": "Frankrijk",
    "ES": "Spanje",
    "IT": "Italie",
    "JP": "Japan",
    "MX": "Mexico",
    "BR": "Brazilie",
    "NL": "Nederland",
    "BE": "Belgie",
    "CH": "Zwitserland",
    "AT": "Oostenrijk",
    "SE": "Zweden",
    "NO": "Noorwegen",
    "DK": "Denemarken",
    "FI": "Finland",
    "IE": "Ierland",
    "PT": "Portugal",
    "NZ": "Nieuw-Zeeland",
    "SG": "Singapore",
    "HK": "Hongkong"
  }
}
```

**File:** `/messages/it.json` (Italian)

```json
{
  "properties": {
    "form": {
      "labels": {
        "name": "Nome proprieta",
        "addressLine1": "Indirizzo riga 1",
        "addressLine2": "Indirizzo riga 2",
        "city": "Citta",
        "stateProvince": "Stato/Provincia",
        "postalCode": "Codice postale",
        "country": "Paese"
      },
      "placeholders": {
        "name": "es., Casa al mare",
        "addressLine1": "Indirizzo stradale",
        "addressLine2": "App., suite, unita, ecc. (opzionale)",
        "city": "Citta",
        "stateProvince": "Stato o Provincia",
        "postalCode": "CAP",
        "selectCountry": "Seleziona paese..."
      },
      "validation": {
        "nameRequired": "Il nome della proprieta e obbligatorio",
        "nameTooLong": "Il nome della proprieta deve essere di 100 caratteri o meno",
        "addressTooLong": "L'indirizzo deve essere di 200 caratteri o meno",
        "cityTooLong": "La citta deve essere di 100 caratteri o meno",
        "stateTooLong": "Lo stato/provincia deve essere di 100 caratteri o meno",
        "postalCodeTooLong": "Il codice postale deve essere di 20 caratteri o meno",
        "invalidCountry": "Seleziona un paese valido"
      }
    },
    "modals": {
      "add": {
        "title": "Aggiungi nuova proprieta",
        "description": "Crea una nuova proprieta inserendo il nome e le informazioni sull'indirizzo.",
        "status": {
          "creating": "Creazione proprieta...",
          "creatingLabel": "Creazione proprieta"
        },
        "actions": {
          "create": "Crea proprieta",
          "creating": "Creazione..."
        },
        "errors": {
          "createFailed": "Impossibile creare la proprieta"
        }
      },
      "edit": {
        "title": "Modifica proprieta",
        "description": "Modifica i dettagli della tua proprieta inclusi nome e informazioni sull'indirizzo.",
        "status": {
          "saving": "Salvataggio modifiche...",
          "savingLabel": "Salvataggio proprieta"
        },
        "actions": {
          "save": "Salva modifiche",
          "saving": "Salvataggio..."
        },
        "errors": {
          "updateFailed": "Impossibile aggiornare la proprieta"
        }
      },
      "delete": {
        "title": "Elimina proprieta",
        "confirmation": "Sei sicuro di voler eliminare la proprieta \"{name}\"? Questa azione non puo essere annullata.",
        "actions": {
          "delete": "Elimina",
          "deleting": "Eliminazione..."
        }
      }
    }
  },
  "countries": {
    "US": "Stati Uniti",
    "CA": "Canada",
    "GB": "Regno Unito",
    "AU": "Australia",
    "DE": "Germania",
    "FR": "Francia",
    "ES": "Spagna",
    "IT": "Italia",
    "JP": "Giappone",
    "MX": "Messico",
    "BR": "Brasile",
    "NL": "Paesi Bassi",
    "BE": "Belgio",
    "CH": "Svizzera",
    "AT": "Austria",
    "SE": "Svezia",
    "NO": "Norvegia",
    "DK": "Danimarca",
    "FI": "Finlandia",
    "IE": "Irlanda",
    "PT": "Portogallo",
    "NZ": "Nuova Zelanda",
    "SG": "Singapore",
    "HK": "Hong Kong"
  }
}
```

#### 1.3 Verification Checklist

- [ ] English translations added to `/messages/en.json`
- [ ] French translations added to `/messages/fr.json`
- [ ] Spanish translations added to `/messages/es.json`
- [ ] German translations added to `/messages/de.json`
- [ ] Dutch translations added to `/messages/nl.json`
- [ ] Italian translations added to `/messages/it.json`
- [ ] All files have valid JSON syntax (run `npx json5 --validate` or use IDE)
- [ ] All keys are identical across all 6 language files

---

### Task 2: Update AddPropertyModal Component - Imports and Hook Initialization

**Estimated Effort:** 0.5 story point
**Dependencies:** Task 1
**File to Modify:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`

#### 2.1 Add Import Statement

**Location:** Lines 1-14 (import section)

Add the following import after line 11 (after the last existing import):

```typescript
import { useTranslations } from 'next-intl';
```

#### 2.2 Replace COUNTRIES Array with COUNTRY_CODES Constant

**Location:** Lines 19-45

Replace the entire COUNTRIES array with:

```typescript
/**
 * Task 2.2: Country codes - labels retrieved from translations
 * Common countries prioritized at the top of the list
 */
const COUNTRY_CODES = [
  '', 'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'JP', 'MX',
  'BR', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT',
  'NZ', 'SG', 'HK'
] as const;
```

#### 2.3 Initialize Translation Hooks

**Location:** Inside the `AddPropertyModal` function, after line 156 (after the props destructuring)

Add the following hooks:

```typescript
// i18n translation hooks
const t = useTranslations('properties');
const tCommon = useTranslations('common');
const tCountries = useTranslations('countries');

// Helper function to get country label from translation
const getCountryLabel = (code: string): string => {
  if (!code) return t('form.placeholders.selectCountry');
  return tCountries(code);
};
```

#### 2.4 Verification Checklist

- [ ] `useTranslations` import added
- [ ] COUNTRIES array replaced with COUNTRY_CODES constant
- [ ] Translation hooks initialized (`t`, `tCommon`, `tCountries`)
- [ ] `getCountryLabel` helper function added
- [ ] No TypeScript errors after changes

---

### Task 3: Update AddPropertyModal Component - Validation Messages

**Estimated Effort:** 0.5 story point
**Dependencies:** Task 2
**File to Modify:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`

#### 3.1 Update validateForm Function to Accept Translation Function

**Location:** Lines 91-133

The `validateForm` function needs to be refactored to work with translations. Since it's defined outside the component, we need to pass the translation function as a parameter or move validation inline.

**Option A (Recommended):** Pass translation function as parameter

Replace the validateForm function with:

```typescript
/**
 * Task 2.2: Form validation function
 */
const validateForm = (
  data: AddPropertyFormData,
  t: (key: string) => string
): AddPropertyValidationErrors => {
  const errors: AddPropertyValidationErrors = {};

  // Property Name - required, max 100
  const trimmedName = data.name.trim();
  if (!trimmedName) {
    errors.name = t('form.validation.nameRequired');
  } else if (trimmedName.length > 100) {
    errors.name = t('form.validation.nameTooLong');
  }

  // Address Line 1 - max 200
  if (data.addressLine1.length > 200) {
    errors.addressLine1 = t('form.validation.addressTooLong');
  }

  // Address Line 2 - max 200
  if (data.addressLine2.length > 200) {
    errors.addressLine2 = t('form.validation.addressTooLong');
  }

  // City - max 100
  if (data.city.length > 100) {
    errors.city = t('form.validation.cityTooLong');
  }

  // State - max 100
  if (data.state.length > 100) {
    errors.state = t('form.validation.stateTooLong');
  }

  // Postal Code - max 20
  if (data.postalCode.length > 20) {
    errors.postalCode = t('form.validation.postalCodeTooLong');
  }

  // Country - validate is valid code or empty
  if (data.country && !COUNTRY_CODES.includes(data.country as typeof COUNTRY_CODES[number])) {
    errors.country = t('form.validation.invalidCountry');
  }

  return errors;
};
```

#### 3.2 Update validateForm Call in handleSave

**Location:** Inside handleSave function (around line 206)

Change from:
```typescript
const validationErrors = validateForm(formData);
```

To:
```typescript
const validationErrors = validateForm(formData, t);
```

#### 3.3 Verification Checklist

- [ ] `validateForm` function updated to accept translation function
- [ ] All validation messages use translation keys
- [ ] `handleSave` passes `t` to `validateForm`
- [ ] Country validation uses COUNTRY_CODES constant

---

### Task 4: Update AddPropertyModal Component - Modal Header and Description

**Estimated Effort:** 0.5 story point
**Dependencies:** Task 2
**File to Modify:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`

#### 4.1 Update Modal Title

**Location:** Lines 368-373

Change from:
```tsx
<Dialog.Title
  id="add-property-modal-title"
  className="text-xl font-semibold text-[#222222]"
>
  Add New Property
</Dialog.Title>
```

To:
```tsx
<Dialog.Title
  id="add-property-modal-title"
  className="text-xl font-semibold text-[#222222]"
>
  {t('modals.add.title')}
</Dialog.Title>
```

#### 4.2 Update Modal Description

**Location:** Lines 374-376

Change from:
```tsx
<Dialog.Description id="add-property-modal-description" className="sr-only">
  Create a new property by entering the name and address information.
</Dialog.Description>
```

To:
```tsx
<Dialog.Description id="add-property-modal-description" className="sr-only">
  {t('modals.add.description')}
</Dialog.Description>
```

#### 4.3 Update Close Button Accessibility Label

**Location:** Line 389

Change from:
```tsx
aria-label="Close modal"
```

To:
```tsx
aria-label={tCommon('close')}
```

#### 4.4 Verification Checklist

- [ ] Modal title uses translation
- [ ] Modal description uses translation
- [ ] Close button aria-label uses translation

---

### Task 5: Update AddPropertyModal Component - Screen Reader Announcements and Error Display

**Estimated Effort:** 0.5 story point
**Dependencies:** Task 2
**File to Modify:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`

#### 5.1 Update Screen Reader Announcement

**Location:** Lines 399-402

Change from:
```tsx
<div aria-live="polite" className="sr-only">
  {isSubmitting && 'Creating property...'}
  {errors.general && `Error: ${errors.general}`}
</div>
```

To:
```tsx
<div aria-live="polite" className="sr-only">
  {isSubmitting && t('modals.add.status.creating')}
  {errors.general && `${tCommon('error')}: ${errors.general}`}
</div>
```

#### 5.2 Update Error Handling in handleSave

**Location:** Lines 246-249

Change from:
```typescript
} catch (error) {
  setErrors({
    general: error instanceof Error ? error.message : 'Failed to create property',
  });
```

To:
```typescript
} catch (error) {
  setErrors({
    general: error instanceof Error ? error.message : t('modals.add.errors.createFailed'),
  });
```

#### 5.3 Verification Checklist

- [ ] Screen reader announcement uses translation
- [ ] Error message fallback uses translation

---

### Task 6: Update AddPropertyModal Component - Form Fields

**Estimated Effort:** 1 story point
**Dependencies:** Task 2
**File to Modify:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`

#### 6.1 Update renderTextField Calls

**Location:** Lines 416-451

Replace each renderTextField call with translated labels and placeholders:

**Property Name (Lines 417-421):**
```tsx
{renderTextField('name', t('form.labels.name'), formData.name, {
  required: true,
  maxLength: 100,
  placeholder: t('form.placeholders.name'),
})}
```

**Address Line 1 (Lines 424-427):**
```tsx
{renderTextField('addressLine1', t('form.labels.addressLine1'), formData.addressLine1, {
  maxLength: 200,
  placeholder: t('form.placeholders.addressLine1'),
})}
```

**Address Line 2 (Lines 430-433):**
```tsx
{renderTextField('addressLine2', t('form.labels.addressLine2'), formData.addressLine2, {
  maxLength: 200,
  placeholder: t('form.placeholders.addressLine2'),
})}
```

**City (Lines 437-440):**
```tsx
{renderTextField('city', t('form.labels.city'), formData.city, {
  maxLength: 100,
  placeholder: t('form.placeholders.city'),
})}
```

**State/Province (Lines 441-444):**
```tsx
{renderTextField('state', t('form.labels.stateProvince'), formData.state, {
  maxLength: 100,
  placeholder: t('form.placeholders.stateProvince'),
})}
```

**Postal Code (Lines 449-452):**
```tsx
{renderTextField('postalCode', t('form.labels.postalCode'), formData.postalCode, {
  maxLength: 20,
  placeholder: t('form.placeholders.postalCode'),
})}
```

#### 6.2 Update Country Dropdown Label

**Location:** Lines 455-457

Change from:
```tsx
<label htmlFor="country" className="block text-sm font-medium text-[#222222]">
  Country
</label>
```

To:
```tsx
<label htmlFor="country" className="block text-sm font-medium text-[#222222]">
  {t('form.labels.country')}
</label>
```

#### 6.3 Update Country Dropdown Options

**Location:** Lines 472-478

Change from:
```tsx
{COUNTRIES.map((country) => (
  <option key={country.code} value={country.code}>
    {country.label}
  </option>
))}
```

To:
```tsx
{COUNTRY_CODES.map((code) => (
  <option key={code} value={code}>
    {getCountryLabel(code)}
  </option>
))}
```

#### 6.4 Verification Checklist

- [ ] All field labels use translations
- [ ] All placeholders use translations
- [ ] Country dropdown uses `getCountryLabel` helper
- [ ] Country dropdown iterates over COUNTRY_CODES

---

### Task 7: Update AddPropertyModal Component - Footer Buttons

**Estimated Effort:** 0.5 story point
**Dependencies:** Task 2
**File to Modify:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`

#### 7.1 Update Cancel Button

**Location:** Line 505

Change from:
```tsx
Cancel
```

To:
```tsx
{tCommon('cancel')}
```

#### 7.2 Update Create Property Button

**Location:** Lines 523-530

Change from:
```tsx
{isSubmitting ? (
  <>
    <LoadingIndicator size="sm" color="white" label="Creating property" />
    <span>Creating...</span>
  </>
) : (
  <span>Create Property</span>
)}
```

To:
```tsx
{isSubmitting ? (
  <>
    <LoadingIndicator size="sm" color="white" label={t('modals.add.status.creatingLabel')} />
    <span>{t('modals.add.actions.creating')}</span>
  </>
) : (
  <span>{t('modals.add.actions.create')}</span>
)}
```

#### 7.3 Verification Checklist

- [ ] Cancel button uses common translation
- [ ] Create button uses translation
- [ ] Creating state uses translation
- [ ] LoadingIndicator label uses translation

---

### Task 8: Update PropertyEditModal Component - Imports and Hook Initialization

**Estimated Effort:** 0.5 story point
**Dependencies:** Task 1
**File to Modify:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`

#### 8.1 Add Import Statement

**Location:** Lines 1-14 (import section)

Add the following import after line 11:

```typescript
import { useTranslations } from 'next-intl';
```

#### 8.2 Replace COUNTRIES Array with COUNTRY_CODES Constant

**Location:** Lines 19-45

Replace with the same COUNTRY_CODES constant as in AddPropertyModal:

```typescript
/**
 * Task 2: Country codes - labels retrieved from translations
 */
const COUNTRY_CODES = [
  '', 'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'JP', 'MX',
  'BR', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT',
  'NZ', 'SG', 'HK'
] as const;
```

#### 8.3 Initialize Translation Hooks

**Location:** Inside the `PropertyEditModal` function, after line 182 (after props destructuring)

Add the following hooks:

```typescript
// i18n translation hooks
const t = useTranslations('properties');
const tCommon = useTranslations('common');
const tCountries = useTranslations('countries');

// Helper function to get country label from translation
const getCountryLabel = (code: string): string => {
  if (!code) return t('form.placeholders.selectCountry');
  return tCountries(code);
};
```

#### 8.4 Verification Checklist

- [ ] `useTranslations` import added
- [ ] COUNTRIES array replaced with COUNTRY_CODES constant
- [ ] Translation hooks initialized
- [ ] `getCountryLabel` helper function added

---

### Task 9: Update PropertyEditModal Component - Validation and Error Messages

**Estimated Effort:** 0.5 story point
**Dependencies:** Task 8
**File to Modify:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`

#### 9.1 Update validateForm Function

**Location:** Lines 115-157

Apply the same changes as Task 3.1 - update to accept translation function parameter.

```typescript
/**
 * Task 5: Form validation function
 */
const validateForm = (
  data: PropertyEditFormData,
  t: (key: string) => string
): PropertyEditValidationErrors => {
  const errors: PropertyEditValidationErrors = {};

  // Property Name - required, max 100
  const trimmedName = data.name.trim();
  if (!trimmedName) {
    errors.name = t('form.validation.nameRequired');
  } else if (trimmedName.length > 100) {
    errors.name = t('form.validation.nameTooLong');
  }

  // Address Line 1 - max 200
  if (data.addressLine1.length > 200) {
    errors.addressLine1 = t('form.validation.addressTooLong');
  }

  // Address Line 2 - max 200
  if (data.addressLine2.length > 200) {
    errors.addressLine2 = t('form.validation.addressTooLong');
  }

  // City - max 100
  if (data.city.length > 100) {
    errors.city = t('form.validation.cityTooLong');
  }

  // State - max 100
  if (data.state.length > 100) {
    errors.state = t('form.validation.stateTooLong');
  }

  // Postal Code - max 20
  if (data.postalCode.length > 20) {
    errors.postalCode = t('form.validation.postalCodeTooLong');
  }

  // Country - validate is valid code or empty
  if (data.country && !COUNTRY_CODES.includes(data.country as typeof COUNTRY_CODES[number])) {
    errors.country = t('form.validation.invalidCountry');
  }

  return errors;
};
```

#### 9.2 Update validateForm Call in handleSave

**Location:** Inside handleSave function (around line 233)

Change from:
```typescript
const validationErrors = validateForm(formData);
```

To:
```typescript
const validationErrors = validateForm(formData, t);
```

#### 9.3 Update Error Handling in handleSave

**Location:** Lines 270-273

Change from:
```typescript
} catch (error) {
  setErrors({
    general: error instanceof Error ? error.message : 'Failed to update property',
  });
```

To:
```typescript
} catch (error) {
  setErrors({
    general: error instanceof Error ? error.message : t('modals.edit.errors.updateFailed'),
  });
```

#### 9.4 Verification Checklist

- [ ] `validateForm` function updated
- [ ] `handleSave` passes `t` to `validateForm`
- [ ] Error message fallback uses translation

---

### Task 10: Update PropertyEditModal Component - Modal Header and UI Elements

**Estimated Effort:** 0.5 story point
**Dependencies:** Task 8
**File to Modify:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`

#### 10.1 Update Modal Title

**Location:** Lines 392-396

Change from:
```tsx
<Dialog.Title
  id="property-edit-modal-title"
  className="text-xl font-semibold text-[#222222]"
>
  Edit Property
</Dialog.Title>
```

To:
```tsx
<Dialog.Title
  id="property-edit-modal-title"
  className="text-xl font-semibold text-[#222222]"
>
  {t('modals.edit.title')}
</Dialog.Title>
```

#### 10.2 Update Modal Description

**Location:** Lines 398-400

Change from:
```tsx
<Dialog.Description id="property-edit-modal-description" className="sr-only">
  Edit the details of your property including name and address information.
</Dialog.Description>
```

To:
```tsx
<Dialog.Description id="property-edit-modal-description" className="sr-only">
  {t('modals.edit.description')}
</Dialog.Description>
```

#### 10.3 Update Close Button Accessibility Label

**Location:** Line 413

Change from:
```tsx
aria-label="Close modal"
```

To:
```tsx
aria-label={tCommon('close')}
```

#### 10.4 Update Screen Reader Announcement

**Location:** Lines 423-426

Change from:
```tsx
<div aria-live="polite" className="sr-only">
  {isSubmitting && 'Saving property changes...'}
  {errors.general && `Error: ${errors.general}`}
</div>
```

To:
```tsx
<div aria-live="polite" className="sr-only">
  {isSubmitting && t('modals.edit.status.saving')}
  {errors.general && `${tCommon('error')}: ${errors.general}`}
</div>
```

#### 10.5 Verification Checklist

- [ ] Modal title uses translation
- [ ] Modal description uses translation
- [ ] Close button aria-label uses translation
- [ ] Screen reader announcement uses translation

---

### Task 11: Update PropertyEditModal Component - Form Fields and Buttons

**Estimated Effort:** 1 story point
**Dependencies:** Task 8
**File to Modify:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`

#### 11.1 Update All renderTextField Calls

Apply the same pattern as Task 6.1:

**Property Name (Lines 441-445):**
```tsx
{renderTextField('name', t('form.labels.name'), formData.name, {
  required: true,
  maxLength: 100,
  placeholder: t('form.placeholders.name'),
})}
```

**Address Line 1 (Lines 448-451):**
```tsx
{renderTextField('addressLine1', t('form.labels.addressLine1'), formData.addressLine1, {
  maxLength: 200,
  placeholder: t('form.placeholders.addressLine1'),
})}
```

**Address Line 2 (Lines 454-457):**
```tsx
{renderTextField('addressLine2', t('form.labels.addressLine2'), formData.addressLine2, {
  maxLength: 200,
  placeholder: t('form.placeholders.addressLine2'),
})}
```

**City (Lines 461-464):**
```tsx
{renderTextField('city', t('form.labels.city'), formData.city, {
  maxLength: 100,
  placeholder: t('form.placeholders.city'),
})}
```

**State/Province (Lines 465-468):**
```tsx
{renderTextField('state', t('form.labels.stateProvince'), formData.state, {
  maxLength: 100,
  placeholder: t('form.placeholders.stateProvince'),
})}
```

**Postal Code (Lines 473-476):**
```tsx
{renderTextField('postalCode', t('form.labels.postalCode'), formData.postalCode, {
  maxLength: 20,
  placeholder: t('form.placeholders.postalCode'),
})}
```

#### 11.2 Update Country Dropdown

**Label (Lines 480-482):**
```tsx
<label htmlFor="country" className="block text-sm font-medium text-[#222222]">
  {t('form.labels.country')}
</label>
```

**Options (Lines 497-501):**
```tsx
{COUNTRY_CODES.map((code) => (
  <option key={code} value={code}>
    {getCountryLabel(code)}
  </option>
))}
```

#### 11.3 Update Cancel Button

**Location:** Line 529

Change from:
```tsx
Cancel
```

To:
```tsx
{tCommon('cancel')}
```

#### 11.4 Update Save Button

**Location:** Lines 547-554

Change from:
```tsx
{isSubmitting ? (
  <>
    <LoadingIndicator size="sm" color="white" label="Saving property" />
    <span>Saving...</span>
  </>
) : (
  <span>Save Changes</span>
)}
```

To:
```tsx
{isSubmitting ? (
  <>
    <LoadingIndicator size="sm" color="white" label={t('modals.edit.status.savingLabel')} />
    <span>{t('modals.edit.actions.saving')}</span>
  </>
) : (
  <span>{t('modals.edit.actions.save')}</span>
)}
```

#### 11.5 Verification Checklist

- [ ] All field labels use translations
- [ ] All placeholders use translations
- [ ] Country dropdown uses translations
- [ ] Cancel button uses common translation
- [ ] Save button uses translation
- [ ] Loading state uses translation

---

### Task 12: Update PropertiesManagement Component - Imports and Hook Initialization

**Estimated Effort:** 0.5 story point
**Dependencies:** Task 1
**File to Modify:** `/src/components/PropertiesManagement.tsx`

#### 12.1 Add Import Statement

**Location:** Lines 1-5 (import section)

Add the following import after line 4:

```typescript
import { useTranslations } from 'next-intl';
```

#### 12.2 Initialize Translation Hooks

**Location:** Inside the `PropertiesManagement` function, after line 63 (after props destructuring and before state declarations)

Add the following hooks:

```typescript
// i18n translation hooks
const t = useTranslations('properties');
const tCommon = useTranslations('common');
```

#### 12.3 Verification Checklist

- [ ] `useTranslations` import added
- [ ] Translation hooks initialized inside component

---

### Task 13: Update PropertiesManagement Component - Delete Modal

**Estimated Effort:** 0.5 story point
**Dependencies:** Task 12
**File to Modify:** `/src/components/PropertiesManagement.tsx`

#### 13.1 Update Delete Modal Title

**Location:** Line 544

Change from:
```tsx
<h3 className="text-lg font-medium text-gray-900 mb-2">Delete Property</h3>
```

To:
```tsx
<h3 className="text-lg font-medium text-gray-900 mb-2">{t('modals.delete.title')}</h3>
```

#### 13.2 Update Delete Modal Confirmation Message

**Location:** Lines 545-548

Change from:
```tsx
<p className="text-sm text-gray-600 mb-4">
  Are you sure you want to delete the property "{propertyToDelete.nickname}"?
  This action cannot be undone.
</p>
```

To:
```tsx
<p className="text-sm text-gray-600 mb-4">
  {t('modals.delete.confirmation', { name: propertyToDelete.nickname })}
</p>
```

#### 13.3 Update Cancel Button

**Location:** Lines 550-555

Change from:
```tsx
<button
  onClick={handleCancelDelete}
  disabled={deletingProperty}
  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
>
  Cancel
</button>
```

To:
```tsx
<button
  onClick={handleCancelDelete}
  disabled={deletingProperty}
  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
>
  {tCommon('cancel')}
</button>
```

#### 13.4 Update Delete Button

**Location:** Lines 557-563

Change from:
```tsx
<button
  onClick={handleConfirmDelete}
  disabled={deletingProperty}
  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
>
  {deletingProperty ? 'Deleting...' : 'Delete'}
</button>
```

To:
```tsx
<button
  onClick={handleConfirmDelete}
  disabled={deletingProperty}
  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
>
  {deletingProperty ? t('modals.delete.actions.deleting') : t('modals.delete.actions.delete')}
</button>
```

#### 13.5 Verification Checklist

- [ ] Delete modal title uses translation
- [ ] Confirmation message uses translation with interpolation
- [ ] Cancel button uses common translation
- [ ] Delete button uses translations for both states

---

### Task 14: Build Verification and Testing

**Estimated Effort:** 1 story point
**Dependencies:** Tasks 1-13
**Files:** All modified files

#### 14.1 TypeScript Compilation Check

Run the following command to verify no TypeScript errors:

```bash
npm run type-check
# or
npx tsc --noEmit
```

**Expected Result:** No errors

#### 14.2 Build Verification

Run the following command to verify the build completes successfully:

```bash
npm run build
```

**Expected Result:** Build completes without errors

#### 14.3 Translation Key Verification

Verify all translation keys exist by checking for missing key warnings in development mode:

```bash
npm run dev
```

Navigate to pages using these components and check browser console for missing translation warnings.

#### 14.4 Manual Testing Checklist

Test AddPropertyModal:
- [ ] Open modal in English - all text displays correctly
- [ ] Modal title shows "Add New Property"
- [ ] All field labels display correctly
- [ ] All placeholders display correctly
- [ ] Country dropdown shows "Select country..." as default
- [ ] Country dropdown shows translated country names
- [ ] Validation errors display correctly when triggered
- [ ] Create button shows "Creating..." during submission
- [ ] Cancel button works correctly

Test PropertyEditModal:
- [ ] Open modal in English - all text displays correctly
- [ ] Modal title shows "Edit Property"
- [ ] Pre-populated data displays correctly
- [ ] All field labels display correctly
- [ ] Save button shows "Saving..." during submission
- [ ] Cancel button works correctly

Test Delete Modal (in PropertiesManagement):
- [ ] Modal title shows "Delete Property"
- [ ] Confirmation message includes property name
- [ ] Delete button shows "Deleting..." during deletion
- [ ] Cancel button works correctly

#### 14.5 Language Testing

Test all three modals in each language:
- [ ] English (en)
- [ ] French (fr)
- [ ] Spanish (es)
- [ ] German (de)
- [ ] Dutch (nl)
- [ ] Italian (it)

For each language, verify:
- [ ] Modal titles display correctly
- [ ] Field labels display correctly
- [ ] Placeholders display correctly
- [ ] Country names display correctly
- [ ] Validation messages display correctly
- [ ] Button labels display correctly
- [ ] No text overflow or layout issues

---

## Implementation Order Summary

1. **Task 1:** Add translation keys to all 6 message files
2. **Tasks 2-7:** Update AddPropertyModal (can be done in sequence)
3. **Tasks 8-11:** Update PropertyEditModal (can be done in sequence)
4. **Tasks 12-13:** Update PropertiesManagement delete modal
5. **Task 14:** Build verification and testing

**Note:** Tasks 2-7 and Tasks 8-11 can be done in parallel by different developers if needed.

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `/messages/en.json` | Add properties namespace, countries namespace |
| `/messages/fr.json` | Add properties namespace, countries namespace |
| `/messages/es.json` | Add properties namespace, countries namespace |
| `/messages/de.json` | Add properties namespace, countries namespace |
| `/messages/nl.json` | Add properties namespace, countries namespace |
| `/messages/it.json` | Add properties namespace, countries namespace |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Add imports, update all hardcoded strings |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Add imports, update all hardcoded strings |
| `/src/components/PropertiesManagement.tsx` | Add imports, update delete modal strings |

---

## Rollback Plan

If issues are discovered after implementation:

1. **For translation file issues:** Revert the specific language file changes
2. **For component issues:** Revert component changes and retain translation files for future use
3. **Complete rollback:** Use git to revert all changes from this task

```bash
# View changes
git diff --name-only

# Revert specific file
git checkout HEAD -- path/to/file

# Revert all changes (if not committed)
git checkout -- .
```

---

## Acceptance Criteria Checklist

- [ ] All hardcoded strings in AddPropertyModal.tsx are replaced with translation function calls
- [ ] All hardcoded strings in PropertyEditModal.tsx are replaced with translation function calls
- [ ] Delete modal in PropertiesManagement.tsx uses translation function calls
- [ ] Translation keys are added to all 6 language files (en, fr, es, de, nl, it)
- [ ] Modal titles display correctly in all languages
- [ ] All field labels display translated text
- [ ] All placeholder text displays translated text
- [ ] All validation messages display translated text
- [ ] Country dropdown displays translated country names
- [ ] Delete confirmation interpolates property name correctly
- [ ] Error messages display translated text
- [ ] Button labels display translated text (including loading states)
- [ ] Screen reader announcements are translated
- [ ] Close modal accessibility label is translated
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully
- [ ] No hardcoded English text remains in any property modal component

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2F - Property Management*
*Task ID: 2F.3 - Update Property Modals*
