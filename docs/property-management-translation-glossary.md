# Property Management Translation Glossary

**Created:** 2026-01-22 20:30:00
**Last Modified:** 2026-01-22 20:30:00
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Purpose:** Terminology and translation guidelines for properties namespace

---

## Core Terminology

Consistent translations for fundamental property management concepts:

| English | French (fr) | Spanish (es) | German (de) | Dutch (nl) | Italian (it) |
|---------|-------------|--------------|-------------|------------|--------------|
| Property | Propriété | Propiedad | Immobilie | Eigendom | Proprietà |
| Properties | Propriétés | Propiedades | Immobilien | Eigendommen | Proprietà |
| Item | Article | Artículo | Artikel | Artikel | Articolo |
| Items | Articles | Artículos | Artikel | Artikelen | Articoli |
| Owner | Propriétaire | Propietario | Eigentümer | Eigenaar | Proprietario |
| Address | Adresse | Dirección | Adresse | Adres | Indirizzo |
| Name | Nom | Nombre | Name | Naam | Nome |
| Description | Description | Descripción | Beschreibung | Beschrijving | Descrizione |

---

## Property Types

Real estate terminology for property classifications:

| English | French (fr) | Spanish (es) | German (de) | Dutch (nl) | Italian (it) |
|---------|-------------|--------------|-------------|------------|--------------|
| Apartment | Appartement | Apartamento | Wohnung | Appartement | Appartamento |
| House | Maison | Casa | Haus | Huis | Casa |
| Condo | Copropriété | Condominio | Eigentumswohnung | Condominium | Condominio |
| Townhouse | Maison de ville | Casa adosada | Reihenhaus | Rijtjeshuis | Casa a schiera |
| Cabin | Chalet | Cabaña | Hütte | Huisje | Cabina |
| Villa | Villa | Villa | Villa | Villa | Villa |
| Other | Autre | Otro | Andere | Andere | Altro |

---

## Action Verbs

Consistent action button terminology:

| English | French (fr) | Spanish (es) | German (de) | Dutch (nl) | Italian (it) |
|---------|-------------|--------------|-------------|------------|--------------|
| Add | Ajouter | Añadir | Hinzufügen | Toevoegen | Aggiungi |
| Edit | Modifier | Editar | Bearbeiten | Bewerken | Modifica |
| Save | Enregistrer | Guardar | Speichern | Opslaan | Salva |
| Saving | Enregistrement | Guardando | Speichern | Opslaan | Salvataggio |
| Delete | Supprimer | Eliminar | Löschen | Verwijderen | Elimina |
| Cancel | Annuler | Cancelar | Abbrechen | Annuleren | Annulla |
| View | Voir | Ver | Ansehen | Bekijken | Visualizza |
| Create | Créer | Crear | Erstellen | Creëren | Crea |
| Creating | Création | Creando | Erstellen | Creëren | Creazione |

---

## Technical Terms

UI and system terminology:

| English | French (fr) | Spanish (es) | German (de) | Dutch (nl) | Italian (it) |
|---------|-------------|--------------|-------------|------------|--------------|
| Filter | Filtre | Filtro | Filter | Filter | Filtro |
| Select | Sélectionner | Seleccionar | Auswählen | Selecteren | Seleziona |
| Loading | Chargement | Cargando | Laden | Laden | Caricamento |
| Optional | Optionnel | Opcional | Optional | Optioneel | Facoltativo |
| Required | Requis | Obligatorio | Erforderlich | Verplicht | Obbligatorio |
| Validation | Validation | Validación | Validierung | Validatie | Convalida |
| Error | Erreur | Error | Fehler | Fout | Errore |
| Success | Succès | Éxito | Erfolg | Succes | Successo |
| Failed | Échec | Falló | Fehlgeschlagen | Mislukt | Fallito |
| Nickname | Surnom | Apodo | Spitzname | Bijnaam | Soprannome |
| Street | Rue | Calle | Straße | Straat | Via |
| City | Ville | Ciudad | Stadt | Stad | Città |
| State/Province | État/Province | Estado/Provincia | Bundesland/Provinz | Staat/Provincie | Stato/Provincia |
| Postal Code | Code postal | Código postal | Postleitzahl | Postcode | Codice postale |
| Country | Pays | País | Land | Land | Paese |

---

## Tone Guidelines

### Formal Address Forms

This application uses **formal address** consistently across all languages for a professional tone:

- **French**: Use "vous" (not "tu")
  - Example: "Gérez vos propriétés" (Manage your properties)

- **Spanish**: Use "usted" form (not "tú")
  - Example: "Gestione sus propiedades" (Manage your properties)
  - Use opening inverted punctuation: ¿ and ¡

- **German**: Use "Sie" (capitalized, not "du")
  - Example: "Verwalten Sie Ihre Immobilien" (Manage your properties)
  - **CRITICAL**: Capitalize ALL nouns per German grammar rules

- **Dutch**: Use "u" (not "je" or "jij")
  - Example: "Beheer uw eigendommen" (Manage your properties)

- **Italian**: Use "Lei" form (not "tu")
  - Example: "Gestisci le tue proprietà" (Manage your properties)

### Style Guidelines

- **Imperative forms**: Use for buttons and actions (e.g., "Add Property" → "Ajouter une Propriété")
- **Descriptive text**: Use complete sentences for descriptions
- **Error messages**: Be clear and helpful, not accusatory
- **Success messages**: Be concise and positive

---

## ICU MessageFormat Examples

### Variable Interpolation

Variables like `{count}`, `{max}`, and `{name}` must **never** be translated - only the surrounding text:

**Character Counter Format:**
```json
English: "{count}/{max} characters"
French: "{count}/{max} caractères"
Spanish: "{count}/{max} caracteres"
German: "{count}/{max} Zeichen"
Dutch: "{count}/{max} tekens"
Italian: "{count}/{max} caratteri"
```

**Delete Confirmation with Name Variable:**
```json
English: "Are you sure you want to delete \"{name}\"?"
French: "Êtes-vous sûr de vouloir supprimer \"{name}\" ?"
Spanish: "¿Está seguro de que desea eliminar \"{name}\"?"
German: "Sind Sie sicher, dass Sie \"{name}\" löschen möchten?"
Dutch: "Weet u zeker dat u \"{name}\" wilt verwijderen?"
Italian: "Sei sicuro di voler eliminare \"{name}\"?"
```

### Pluralization Rules

ICU MessageFormat uses `{count, plural, one {...} other {...}}` syntax. The structure must be preserved exactly:

**Property Count Example:**
```json
English: "{count, plural, one {# property} other {# properties}}"
French: "{count, plural, one {# propriété} other {# propriétés}}"
Spanish: "{count, plural, one {# propiedad} other {# propiedades}}"
German: "{count, plural, one {# Immobilie} other {# Immobilien}}"
Dutch: "{count, plural, one {# eigendom} other {# eigendommen}}"
Italian: "{count, plural, one {# proprietà} other {# proprietà}}"
```

**Note**: Italian "proprietà" is the same in singular and plural, but the ICU structure still requires both forms.

---

## CLDR Plural Rules Reference

### Rule Summary by Language

**English (en)**: 2 forms
- `one`: n = 1 (1 property)
- `other`: n = 0 or n > 1 (0 properties, 2 properties, 5 properties)

**French (fr)**: 2 forms
- `one`: n = 0 or n = 1 (0 propriété, 1 propriété)
- `other`: n > 1 (2 propriétés, 5 propriétés)

**Spanish (es)**: 2 forms
- `one`: n = 1 (1 propiedad)
- `other`: n = 0 or n > 1 (0 propiedades, 2 propiedades)

**German (de)**: 2 forms
- `one`: n = 1 (1 Immobilie)
- `other`: n = 0 or n > 1 (0 Immobilien, 2 Immobilien)

**Dutch (nl)**: 2 forms
- `one`: n = 1 (1 eigendom)
- `other`: n = 0 or n > 1 (0 eigendommen, 2 eigendommen)

**Italian (it)**: 2 forms
- `one`: n = 1 (1 proprietà)
- `other`: n = 0 or n > 1 (0 proprietà, 2 proprietà)

### Testing Pluralization

Always test with these counts to ensure correct plural forms:
- 0 items (usually "other" form)
- 1 item (always "one" form)
- 2 items (always "other" form)
- 5 items (always "other" form)
- 10 items (always "other" form)

---

## Special Characters by Language

### French (fr)
- Accents: é, è, ê, à, â, î, ô, û
- Cedilla: ç
- Example: "Propriété créée avec succès"
- Spacing: Add space before ? and ! (French typography rule)
  - Example: "Êtes-vous sûr ?" not "Êtes-vous sûr?"

### Spanish (es)
- Accents: á, é, í, ó, ú
- Tilde: ñ
- Diaeresis: ü (rare, in words like "pingüino")
- Opening punctuation: ¡ and ¿
- Example: "¿Está seguro de que desea continuar?"

### German (de)
- Umlauts: ä, ö, ü
- Eszett: ß (or ss in Switzerland)
- Example: "Straße", "Größe"
- **CRITICAL**: Capitalize all nouns

### Dutch (nl)
- Diaeresis: ë, ï, ö (used in compound words)
- Accents: é, è (in loanwords)
- Example: "coöperatie", "reëel"

### Italian (it)
- Accents: à, è, é, ì, ò, ù
- Example: "Proprietà eliminata con successo"
- Apostrophes common: "l'indirizzo", "un'altra"

---

## Translation Quality Checklist

Before submitting any translation:

- [ ] All variable placeholders unchanged (`{name}`, `{count}`, `{max}`)
- [ ] ICU MessageFormat syntax preserved exactly
- [ ] Formal address form used consistently
- [ ] Special characters correct for the language
- [ ] Nouns capitalized in German
- [ ] No JSON syntax errors (commas, quotes, escaping)
- [ ] UTF-8 encoding maintained
- [ ] Terminology consistent with this glossary
- [ ] Grammar and spelling verified
- [ ] Cultural appropriateness considered

---

## Common Mistakes to Avoid

1. **DO NOT translate variable names**: `{name}` stays as `{name}`, not `{nom}` or `{nombre}`
2. **DO NOT change ICU syntax**: `{count, plural, ...}` structure must be exact
3. **DO NOT translate JSON keys**: Only translate the values, not the keys
4. **DO NOT forget German noun capitalization**: "Immobilie" not "immobilie"
5. **DO NOT mix informal/formal**: Stick to formal address consistently
6. **DO NOT break JSON structure**: Maintain proper commas, quotes, and nesting

---

## Maintenance Guidelines

### Adding New Strings

When adding new strings to the properties namespace:

1. Add English text to `/messages/en.json` first
2. Use this glossary for terminology consistency
3. Apply formal address forms
4. Preserve ICU MessageFormat syntax
5. Test with all plural counts (0, 1, 2+)
6. Validate JSON syntax
7. Request native speaker review if possible

### Updating Existing Strings

When modifying existing translations:

1. Update English first in en.json
2. Update all 5 languages consistently
3. Verify variable placeholders unchanged
4. Re-test ICU pluralization if affected
5. Re-validate JSON syntax
6. Document changes in commit message

---

## References

- **CLDR Plural Rules**: https://cldr.unicode.org/index/cldr-spec/plural-rules
- **ICU MessageFormat**: https://formatjs.io/docs/core-concepts/icu-syntax/
- **next-intl Documentation**: https://next-intl-docs.vercel.app/
- **Properties Namespace Spec**: `/docs/REQ-E02-085-create-properties-namespace-structure-detailed.md`

---

**Document Status**: COMPLETE
**Last Updated**: 2026-01-22 20:30:00
