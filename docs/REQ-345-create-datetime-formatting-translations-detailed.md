# REQ-345: Create Date/Time Formatting Translations - Detailed Task Breakdown

*Generated: 2026-01-19 20:15:00 UTC*
*Last Modified: 2026-01-19 20:15:00 UTC*

## Document Reference

| Field | Value |
|-------|-------|
| **Request ID** | REQ-345 |
| **Overview Document** | docs/REQ-345-create-datetime-formatting-translations-overview.md |
| **Requirements Source** | docs/gen_requests_epic2.md |
| **Implementation Plan** | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| **Epic** | 2 - Static UI Translation |
| **Sub-Epic** | 2H - Common & Shared Components |
| **Task ID** | 2H.9 |
| **Size** | L (Large) |
| **Priority** | Foundation for all date/time displays |

---

## Executive Summary

This task creates comprehensive date and time formatting translations for all 6 supported languages (English, French, Spanish, German, Dutch, Italian). The implementation adds a `datetime` namespace to translation files, creates utility functions for locale-aware formatting, and provides a React hook (`useDateTimeFormat`) that integrates with next-intl's formatting capabilities. This foundational work enables consistent, culturally-appropriate date/time display across 15+ components that currently use fragmented or hardcoded formatting.

---

## Prerequisites

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl package installed | Complete | `package.json` |
| i18n configuration | Complete | `/src/lib/i18n/config.ts` |
| Base translation files exist | Complete | `/messages/*.json` |
| Common namespace structure (Task 2H.1) | Required | `/messages/en.json` |
| `useFormatter` hook availability | Complete | next-intl built-in |

---

## Current State Analysis

### Existing Date/Time Formatting in Codebase

| Location | Function/Pattern | Issue |
|----------|-----------------|-------|
| `/src/lib/utils.ts:72-78` | `formatDate()` | Returns `YYYY-MM-DD`, not locale-aware |
| `/src/lib/utils.ts:110-129` | `formatPrintableDate()` | Hardcoded to `'en-US'` locale |
| Multiple components | Local `formatDate` functions | Duplicated ~10 times |
| Various components | `toLocaleDateString('en-US', ...)` | Hardcoded English locale |

### Existing Translation File Structure

Current `/messages/en.json` has ~133 keys but **no `datetime` namespace**.

---

## Task Breakdown

### Task 2H.9.1: Add `datetime` Namespace to English Translation File

**File**: `/messages/en.json`

**Objective**: Create the complete `datetime` namespace with all required sub-namespaces.

**Changes**:
Add the following JSON structure to `/messages/en.json`:

```json
{
  "datetime": {
    "relative": {
      "justNow": "Just now",
      "secondsAgo": "{count, plural, one {# second} other {# seconds}} ago",
      "minutesAgo": "{count, plural, one {# minute} other {# minutes}} ago",
      "hoursAgo": "{count, plural, one {# hour} other {# hours}} ago",
      "daysAgo": "{count, plural, one {# day} other {# days}} ago",
      "weeksAgo": "{count, plural, one {# week} other {# weeks}} ago",
      "monthsAgo": "{count, plural, one {# month} other {# months}} ago",
      "yearsAgo": "{count, plural, one {# year} other {# years}} ago",
      "inSeconds": "in {count, plural, one {# second} other {# seconds}}",
      "inMinutes": "in {count, plural, one {# minute} other {# minutes}}",
      "inHours": "in {count, plural, one {# hour} other {# hours}}",
      "inDays": "in {count, plural, one {# day} other {# days}}",
      "inWeeks": "in {count, plural, one {# week} other {# weeks}}",
      "inMonths": "in {count, plural, one {# month} other {# months}}",
      "inYears": "in {count, plural, one {# year} other {# years}}",
      "today": "Today",
      "yesterday": "Yesterday",
      "tomorrow": "Tomorrow",
      "thisWeek": "This week",
      "lastWeek": "Last week",
      "nextWeek": "Next week",
      "thisMonth": "This month",
      "lastMonth": "Last month",
      "nextMonth": "Next month"
    },
    "months": {
      "january": "January",
      "february": "February",
      "march": "March",
      "april": "April",
      "may": "May",
      "june": "June",
      "july": "July",
      "august": "August",
      "september": "September",
      "october": "October",
      "november": "November",
      "december": "December"
    },
    "monthsShort": {
      "jan": "Jan",
      "feb": "Feb",
      "mar": "Mar",
      "apr": "Apr",
      "may": "May",
      "jun": "Jun",
      "jul": "Jul",
      "aug": "Aug",
      "sep": "Sep",
      "oct": "Oct",
      "nov": "Nov",
      "dec": "Dec"
    },
    "weekdays": {
      "sunday": "Sunday",
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday"
    },
    "weekdaysShort": {
      "sun": "Sun",
      "mon": "Mon",
      "tue": "Tue",
      "wed": "Wed",
      "thu": "Thu",
      "fri": "Fri",
      "sat": "Sat"
    },
    "formats": {
      "dateShort": "Short date",
      "dateLong": "Long date",
      "dateWithTime": "Date with time",
      "timeOnly": "Time only",
      "time12h": "12-hour time",
      "time24h": "24-hour time"
    },
    "labels": {
      "date": "Date",
      "time": "Time",
      "dateTime": "Date & Time",
      "duration": "Duration",
      "startDate": "Start date",
      "endDate": "End date",
      "created": "Created",
      "updated": "Updated",
      "lastModified": "Last modified",
      "lastActive": "Last active",
      "lastSeen": "Last seen"
    },
    "duration": {
      "hours": "{count, plural, one {# hour} other {# hours}}",
      "minutes": "{count, plural, one {# minute} other {# minutes}}",
      "seconds": "{count, plural, one {# second} other {# seconds}}",
      "days": "{count, plural, one {# day} other {# days}}",
      "weeks": "{count, plural, one {# week} other {# weeks}}",
      "months": "{count, plural, one {# month} other {# months}}",
      "hoursMinutes": "{hours, plural, one {# hour} other {# hours}} {minutes, plural, one {# minute} other {# minutes}}",
      "daysHours": "{days, plural, one {# day} other {# days}} {hours, plural, one {# hour} other {# hours}}"
    },
    "range": {
      "to": "to",
      "from": "from",
      "until": "until",
      "separator": " - "
    }
  }
}
```

**Verification**:
- [ ] JSON is syntactically valid
- [ ] All ICU pluralization syntax is correct
- [ ] All 12 months present in both full and abbreviated forms
- [ ] All 7 weekdays present in both full and abbreviated forms
- [ ] ~85 translation keys total in namespace

---

### Task 2H.9.2: Add `datetime` Namespace to French Translation File

**File**: `/messages/fr.json`

**Objective**: Add French translations for all `datetime` keys.

**Key Translations**:

```json
{
  "datetime": {
    "relative": {
      "justNow": "A l'instant",
      "secondsAgo": "il y a {count, plural, one {# seconde} other {# secondes}}",
      "minutesAgo": "il y a {count, plural, one {# minute} other {# minutes}}",
      "hoursAgo": "il y a {count, plural, one {# heure} other {# heures}}",
      "daysAgo": "il y a {count, plural, one {# jour} other {# jours}}",
      "weeksAgo": "il y a {count, plural, one {# semaine} other {# semaines}}",
      "monthsAgo": "il y a {count, plural, one {# mois} other {# mois}}",
      "yearsAgo": "il y a {count, plural, one {# an} other {# ans}}",
      "inSeconds": "dans {count, plural, one {# seconde} other {# secondes}}",
      "inMinutes": "dans {count, plural, one {# minute} other {# minutes}}",
      "inHours": "dans {count, plural, one {# heure} other {# heures}}",
      "inDays": "dans {count, plural, one {# jour} other {# jours}}",
      "inWeeks": "dans {count, plural, one {# semaine} other {# semaines}}",
      "inMonths": "dans {count, plural, one {# mois} other {# mois}}",
      "inYears": "dans {count, plural, one {# an} other {# ans}}",
      "today": "Aujourd'hui",
      "yesterday": "Hier",
      "tomorrow": "Demain",
      "thisWeek": "Cette semaine",
      "lastWeek": "La semaine derniere",
      "nextWeek": "La semaine prochaine",
      "thisMonth": "Ce mois-ci",
      "lastMonth": "Le mois dernier",
      "nextMonth": "Le mois prochain"
    },
    "months": {
      "january": "janvier",
      "february": "fevrier",
      "march": "mars",
      "april": "avril",
      "may": "mai",
      "june": "juin",
      "july": "juillet",
      "august": "aout",
      "september": "septembre",
      "october": "octobre",
      "november": "novembre",
      "december": "decembre"
    },
    "monthsShort": {
      "jan": "janv.",
      "feb": "fevr.",
      "mar": "mars",
      "apr": "avr.",
      "may": "mai",
      "jun": "juin",
      "jul": "juil.",
      "aug": "aout",
      "sep": "sept.",
      "oct": "oct.",
      "nov": "nov.",
      "dec": "dec."
    },
    "weekdays": {
      "sunday": "dimanche",
      "monday": "lundi",
      "tuesday": "mardi",
      "wednesday": "mercredi",
      "thursday": "jeudi",
      "friday": "vendredi",
      "saturday": "samedi"
    },
    "weekdaysShort": {
      "sun": "dim.",
      "mon": "lun.",
      "tue": "mar.",
      "wed": "mer.",
      "thu": "jeu.",
      "fri": "ven.",
      "sat": "sam."
    },
    "formats": {
      "dateShort": "Date courte",
      "dateLong": "Date longue",
      "dateWithTime": "Date et heure",
      "timeOnly": "Heure uniquement",
      "time12h": "Format 12h",
      "time24h": "Format 24h"
    },
    "labels": {
      "date": "Date",
      "time": "Heure",
      "dateTime": "Date et heure",
      "duration": "Duree",
      "startDate": "Date de debut",
      "endDate": "Date de fin",
      "created": "Cree",
      "updated": "Mis a jour",
      "lastModified": "Derniere modification",
      "lastActive": "Derniere activite",
      "lastSeen": "Vu pour la derniere fois"
    },
    "duration": {
      "hours": "{count, plural, one {# heure} other {# heures}}",
      "minutes": "{count, plural, one {# minute} other {# minutes}}",
      "seconds": "{count, plural, one {# seconde} other {# secondes}}",
      "days": "{count, plural, one {# jour} other {# jours}}",
      "weeks": "{count, plural, one {# semaine} other {# semaines}}",
      "months": "{count, plural, one {# mois} other {# mois}}",
      "hoursMinutes": "{hours, plural, one {# heure} other {# heures}} {minutes, plural, one {# minute} other {# minutes}}",
      "daysHours": "{days, plural, one {# jour} other {# jours}} {hours, plural, one {# heure} other {# heures}}"
    },
    "range": {
      "to": "au",
      "from": "du",
      "until": "jusqu'au",
      "separator": " - "
    }
  }
}
```

**Notes**:
- French month names are lowercase (janvier, not Janvier)
- French weekday names are lowercase (lundi, not Lundi)
- French uses "il y a" for "ago" (placed before the time unit)
- French uses "dans" for future expressions

**Verification**:
- [ ] JSON is syntactically valid
- [ ] Key structure matches en.json exactly
- [ ] French pluralization rules are correct (note: "mois" is same in singular/plural)

---

### Task 2H.9.3: Add `datetime` Namespace to Spanish Translation File

**File**: `/messages/es.json`

**Objective**: Add Spanish translations for all `datetime` keys.

**Key Translations**:

```json
{
  "datetime": {
    "relative": {
      "justNow": "Ahora mismo",
      "secondsAgo": "hace {count, plural, one {# segundo} other {# segundos}}",
      "minutesAgo": "hace {count, plural, one {# minuto} other {# minutos}}",
      "hoursAgo": "hace {count, plural, one {# hora} other {# horas}}",
      "daysAgo": "hace {count, plural, one {# dia} other {# dias}}",
      "weeksAgo": "hace {count, plural, one {# semana} other {# semanas}}",
      "monthsAgo": "hace {count, plural, one {# mes} other {# meses}}",
      "yearsAgo": "hace {count, plural, one {# ano} other {# anos}}",
      "inSeconds": "en {count, plural, one {# segundo} other {# segundos}}",
      "inMinutes": "en {count, plural, one {# minuto} other {# minutos}}",
      "inHours": "en {count, plural, one {# hora} other {# horas}}",
      "inDays": "en {count, plural, one {# dia} other {# dias}}",
      "inWeeks": "en {count, plural, one {# semana} other {# semanas}}",
      "inMonths": "en {count, plural, one {# mes} other {# meses}}",
      "inYears": "en {count, plural, one {# ano} other {# anos}}",
      "today": "Hoy",
      "yesterday": "Ayer",
      "tomorrow": "Manana",
      "thisWeek": "Esta semana",
      "lastWeek": "La semana pasada",
      "nextWeek": "La proxima semana",
      "thisMonth": "Este mes",
      "lastMonth": "El mes pasado",
      "nextMonth": "El proximo mes"
    },
    "months": {
      "january": "enero",
      "february": "febrero",
      "march": "marzo",
      "april": "abril",
      "may": "mayo",
      "june": "junio",
      "july": "julio",
      "august": "agosto",
      "september": "septiembre",
      "october": "octubre",
      "november": "noviembre",
      "december": "diciembre"
    },
    "monthsShort": {
      "jan": "ene.",
      "feb": "feb.",
      "mar": "mar.",
      "apr": "abr.",
      "may": "may.",
      "jun": "jun.",
      "jul": "jul.",
      "aug": "ago.",
      "sep": "sept.",
      "oct": "oct.",
      "nov": "nov.",
      "dec": "dic."
    },
    "weekdays": {
      "sunday": "domingo",
      "monday": "lunes",
      "tuesday": "martes",
      "wednesday": "miercoles",
      "thursday": "jueves",
      "friday": "viernes",
      "saturday": "sabado"
    },
    "weekdaysShort": {
      "sun": "dom.",
      "mon": "lun.",
      "tue": "mar.",
      "wed": "mie.",
      "thu": "jue.",
      "fri": "vie.",
      "sat": "sab."
    },
    "formats": {
      "dateShort": "Fecha corta",
      "dateLong": "Fecha larga",
      "dateWithTime": "Fecha con hora",
      "timeOnly": "Solo hora",
      "time12h": "Formato 12h",
      "time24h": "Formato 24h"
    },
    "labels": {
      "date": "Fecha",
      "time": "Hora",
      "dateTime": "Fecha y hora",
      "duration": "Duracion",
      "startDate": "Fecha de inicio",
      "endDate": "Fecha de fin",
      "created": "Creado",
      "updated": "Actualizado",
      "lastModified": "Ultima modificacion",
      "lastActive": "Ultima actividad",
      "lastSeen": "Visto por ultima vez"
    },
    "duration": {
      "hours": "{count, plural, one {# hora} other {# horas}}",
      "minutes": "{count, plural, one {# minuto} other {# minutos}}",
      "seconds": "{count, plural, one {# segundo} other {# segundos}}",
      "days": "{count, plural, one {# dia} other {# dias}}",
      "weeks": "{count, plural, one {# semana} other {# semanas}}",
      "months": "{count, plural, one {# mes} other {# meses}}",
      "hoursMinutes": "{hours, plural, one {# hora} other {# horas}} {minutes, plural, one {# minuto} other {# minutos}}",
      "daysHours": "{days, plural, one {# dia} other {# dias}} {hours, plural, one {# hora} other {# horas}}"
    },
    "range": {
      "to": "al",
      "from": "del",
      "until": "hasta",
      "separator": " - "
    }
  }
}
```

**Notes**:
- Spanish uses "hace" for "ago" (placed before the time unit)
- Spanish month/weekday names are lowercase
- Spanish uses 24-hour time format by convention

**Verification**:
- [ ] JSON is syntactically valid
- [ ] Key structure matches en.json exactly

---

### Task 2H.9.4: Add `datetime` Namespace to German Translation File

**File**: `/messages/de.json`

**Objective**: Add German translations for all `datetime` keys.

**Key Translations**:

```json
{
  "datetime": {
    "relative": {
      "justNow": "Gerade eben",
      "secondsAgo": "vor {count, plural, one {# Sekunde} other {# Sekunden}}",
      "minutesAgo": "vor {count, plural, one {# Minute} other {# Minuten}}",
      "hoursAgo": "vor {count, plural, one {# Stunde} other {# Stunden}}",
      "daysAgo": "vor {count, plural, one {# Tag} other {# Tagen}}",
      "weeksAgo": "vor {count, plural, one {# Woche} other {# Wochen}}",
      "monthsAgo": "vor {count, plural, one {# Monat} other {# Monaten}}",
      "yearsAgo": "vor {count, plural, one {# Jahr} other {# Jahren}}",
      "inSeconds": "in {count, plural, one {# Sekunde} other {# Sekunden}}",
      "inMinutes": "in {count, plural, one {# Minute} other {# Minuten}}",
      "inHours": "in {count, plural, one {# Stunde} other {# Stunden}}",
      "inDays": "in {count, plural, one {# Tag} other {# Tagen}}",
      "inWeeks": "in {count, plural, one {# Woche} other {# Wochen}}",
      "inMonths": "in {count, plural, one {# Monat} other {# Monaten}}",
      "inYears": "in {count, plural, one {# Jahr} other {# Jahren}}",
      "today": "Heute",
      "yesterday": "Gestern",
      "tomorrow": "Morgen",
      "thisWeek": "Diese Woche",
      "lastWeek": "Letzte Woche",
      "nextWeek": "Nachste Woche",
      "thisMonth": "Dieser Monat",
      "lastMonth": "Letzter Monat",
      "nextMonth": "Nachster Monat"
    },
    "months": {
      "january": "Januar",
      "february": "Februar",
      "march": "Marz",
      "april": "April",
      "may": "Mai",
      "june": "Juni",
      "july": "Juli",
      "august": "August",
      "september": "September",
      "october": "Oktober",
      "november": "November",
      "december": "Dezember"
    },
    "monthsShort": {
      "jan": "Jan.",
      "feb": "Feb.",
      "mar": "Marz",
      "apr": "Apr.",
      "may": "Mai",
      "jun": "Juni",
      "jul": "Juli",
      "aug": "Aug.",
      "sep": "Sept.",
      "oct": "Okt.",
      "nov": "Nov.",
      "dec": "Dez."
    },
    "weekdays": {
      "sunday": "Sonntag",
      "monday": "Montag",
      "tuesday": "Dienstag",
      "wednesday": "Mittwoch",
      "thursday": "Donnerstag",
      "friday": "Freitag",
      "saturday": "Samstag"
    },
    "weekdaysShort": {
      "sun": "So.",
      "mon": "Mo.",
      "tue": "Di.",
      "wed": "Mi.",
      "thu": "Do.",
      "fri": "Fr.",
      "sat": "Sa."
    },
    "formats": {
      "dateShort": "Kurzes Datum",
      "dateLong": "Langes Datum",
      "dateWithTime": "Datum mit Uhrzeit",
      "timeOnly": "Nur Uhrzeit",
      "time12h": "12-Stunden-Format",
      "time24h": "24-Stunden-Format"
    },
    "labels": {
      "date": "Datum",
      "time": "Uhrzeit",
      "dateTime": "Datum und Uhrzeit",
      "duration": "Dauer",
      "startDate": "Startdatum",
      "endDate": "Enddatum",
      "created": "Erstellt",
      "updated": "Aktualisiert",
      "lastModified": "Zuletzt geandert",
      "lastActive": "Zuletzt aktiv",
      "lastSeen": "Zuletzt gesehen"
    },
    "duration": {
      "hours": "{count, plural, one {# Stunde} other {# Stunden}}",
      "minutes": "{count, plural, one {# Minute} other {# Minuten}}",
      "seconds": "{count, plural, one {# Sekunde} other {# Sekunden}}",
      "days": "{count, plural, one {# Tag} other {# Tage}}",
      "weeks": "{count, plural, one {# Woche} other {# Wochen}}",
      "months": "{count, plural, one {# Monat} other {# Monate}}",
      "hoursMinutes": "{hours, plural, one {# Stunde} other {# Stunden}} {minutes, plural, one {# Minute} other {# Minuten}}",
      "daysHours": "{days, plural, one {# Tag} other {# Tage}} {hours, plural, one {# Stunde} other {# Stunden}}"
    },
    "range": {
      "to": "bis",
      "from": "vom",
      "until": "bis zum",
      "separator": " - "
    }
  }
}
```

**Notes**:
- German capitalizes nouns (Monat, Tag, Stunde)
- German uses "vor" for "ago" (placed before the time unit)
- German uses dative case in some plurals (Tagen, Monaten, Jahren)
- German date format is DD.MM.YYYY

**Verification**:
- [ ] JSON is syntactically valid
- [ ] Key structure matches en.json exactly
- [ ] German grammar rules are followed (capitalization, cases)

---

### Task 2H.9.5: Add `datetime` Namespace to Dutch Translation File

**File**: `/messages/nl.json`

**Objective**: Add Dutch translations for all `datetime` keys.

**Key Translations**:

```json
{
  "datetime": {
    "relative": {
      "justNow": "Zojuist",
      "secondsAgo": "{count, plural, one {# seconde} other {# seconden}} geleden",
      "minutesAgo": "{count, plural, one {# minuut} other {# minuten}} geleden",
      "hoursAgo": "{count, plural, one {# uur} other {# uur}} geleden",
      "daysAgo": "{count, plural, one {# dag} other {# dagen}} geleden",
      "weeksAgo": "{count, plural, one {# week} other {# weken}} geleden",
      "monthsAgo": "{count, plural, one {# maand} other {# maanden}} geleden",
      "yearsAgo": "{count, plural, one {# jaar} other {# jaar}} geleden",
      "inSeconds": "over {count, plural, one {# seconde} other {# seconden}}",
      "inMinutes": "over {count, plural, one {# minuut} other {# minuten}}",
      "inHours": "over {count, plural, one {# uur} other {# uur}}",
      "inDays": "over {count, plural, one {# dag} other {# dagen}}",
      "inWeeks": "over {count, plural, one {# week} other {# weken}}",
      "inMonths": "over {count, plural, one {# maand} other {# maanden}}",
      "inYears": "over {count, plural, one {# jaar} other {# jaar}}",
      "today": "Vandaag",
      "yesterday": "Gisteren",
      "tomorrow": "Morgen",
      "thisWeek": "Deze week",
      "lastWeek": "Vorige week",
      "nextWeek": "Volgende week",
      "thisMonth": "Deze maand",
      "lastMonth": "Vorige maand",
      "nextMonth": "Volgende maand"
    },
    "months": {
      "january": "januari",
      "february": "februari",
      "march": "maart",
      "april": "april",
      "may": "mei",
      "june": "juni",
      "july": "juli",
      "august": "augustus",
      "september": "september",
      "october": "oktober",
      "november": "november",
      "december": "december"
    },
    "monthsShort": {
      "jan": "jan.",
      "feb": "feb.",
      "mar": "mrt.",
      "apr": "apr.",
      "may": "mei",
      "jun": "jun.",
      "jul": "jul.",
      "aug": "aug.",
      "sep": "sep.",
      "oct": "okt.",
      "nov": "nov.",
      "dec": "dec."
    },
    "weekdays": {
      "sunday": "zondag",
      "monday": "maandag",
      "tuesday": "dinsdag",
      "wednesday": "woensdag",
      "thursday": "donderdag",
      "friday": "vrijdag",
      "saturday": "zaterdag"
    },
    "weekdaysShort": {
      "sun": "zo",
      "mon": "ma",
      "tue": "di",
      "wed": "wo",
      "thu": "do",
      "fri": "vr",
      "sat": "za"
    },
    "formats": {
      "dateShort": "Korte datum",
      "dateLong": "Lange datum",
      "dateWithTime": "Datum met tijd",
      "timeOnly": "Alleen tijd",
      "time12h": "12-uurs formaat",
      "time24h": "24-uurs formaat"
    },
    "labels": {
      "date": "Datum",
      "time": "Tijd",
      "dateTime": "Datum en tijd",
      "duration": "Duur",
      "startDate": "Startdatum",
      "endDate": "Einddatum",
      "created": "Aangemaakt",
      "updated": "Bijgewerkt",
      "lastModified": "Laatst gewijzigd",
      "lastActive": "Laatst actief",
      "lastSeen": "Laatst gezien"
    },
    "duration": {
      "hours": "{count, plural, one {# uur} other {# uur}}",
      "minutes": "{count, plural, one {# minuut} other {# minuten}}",
      "seconds": "{count, plural, one {# seconde} other {# seconden}}",
      "days": "{count, plural, one {# dag} other {# dagen}}",
      "weeks": "{count, plural, one {# week} other {# weken}}",
      "months": "{count, plural, one {# maand} other {# maanden}}",
      "hoursMinutes": "{hours, plural, one {# uur} other {# uur}} {minutes, plural, one {# minuut} other {# minuten}}",
      "daysHours": "{days, plural, one {# dag} other {# dagen}} {hours, plural, one {# uur} other {# uur}}"
    },
    "range": {
      "to": "tot",
      "from": "van",
      "until": "tot en met",
      "separator": " - "
    }
  }
}
```

**Notes**:
- Dutch uses "geleden" for "ago" (placed AFTER the time unit)
- Dutch uses "over" for future expressions
- Dutch "uur" and "jaar" are same in singular and plural
- Dutch date format is DD-MM-YYYY

**Verification**:
- [ ] JSON is syntactically valid
- [ ] Key structure matches en.json exactly
- [ ] Dutch word order for "ago" is correct (time + geleden)

---

### Task 2H.9.6: Add `datetime` Namespace to Italian Translation File

**File**: `/messages/it.json`

**Objective**: Add Italian translations for all `datetime` keys.

**Key Translations**:

```json
{
  "datetime": {
    "relative": {
      "justNow": "Adesso",
      "secondsAgo": "{count, plural, one {# secondo} other {# secondi}} fa",
      "minutesAgo": "{count, plural, one {# minuto} other {# minuti}} fa",
      "hoursAgo": "{count, plural, one {# ora} other {# ore}} fa",
      "daysAgo": "{count, plural, one {# giorno} other {# giorni}} fa",
      "weeksAgo": "{count, plural, one {# settimana} other {# settimane}} fa",
      "monthsAgo": "{count, plural, one {# mese} other {# mesi}} fa",
      "yearsAgo": "{count, plural, one {# anno} other {# anni}} fa",
      "inSeconds": "tra {count, plural, one {# secondo} other {# secondi}}",
      "inMinutes": "tra {count, plural, one {# minuto} other {# minuti}}",
      "inHours": "tra {count, plural, one {# ora} other {# ore}}",
      "inDays": "tra {count, plural, one {# giorno} other {# giorni}}",
      "inWeeks": "tra {count, plural, one {# settimana} other {# settimane}}",
      "inMonths": "tra {count, plural, one {# mese} other {# mesi}}",
      "inYears": "tra {count, plural, one {# anno} other {# anni}}",
      "today": "Oggi",
      "yesterday": "Ieri",
      "tomorrow": "Domani",
      "thisWeek": "Questa settimana",
      "lastWeek": "La settimana scorsa",
      "nextWeek": "La prossima settimana",
      "thisMonth": "Questo mese",
      "lastMonth": "Il mese scorso",
      "nextMonth": "Il prossimo mese"
    },
    "months": {
      "january": "gennaio",
      "february": "febbraio",
      "march": "marzo",
      "april": "aprile",
      "may": "maggio",
      "june": "giugno",
      "july": "luglio",
      "august": "agosto",
      "september": "settembre",
      "october": "ottobre",
      "november": "novembre",
      "december": "dicembre"
    },
    "monthsShort": {
      "jan": "gen.",
      "feb": "feb.",
      "mar": "mar.",
      "apr": "apr.",
      "may": "mag.",
      "jun": "giu.",
      "jul": "lug.",
      "aug": "ago.",
      "sep": "set.",
      "oct": "ott.",
      "nov": "nov.",
      "dec": "dic."
    },
    "weekdays": {
      "sunday": "domenica",
      "monday": "lunedi",
      "tuesday": "martedi",
      "wednesday": "mercoledi",
      "thursday": "giovedi",
      "friday": "venerdi",
      "saturday": "sabato"
    },
    "weekdaysShort": {
      "sun": "dom",
      "mon": "lun",
      "tue": "mar",
      "wed": "mer",
      "thu": "gio",
      "fri": "ven",
      "sat": "sab"
    },
    "formats": {
      "dateShort": "Data breve",
      "dateLong": "Data estesa",
      "dateWithTime": "Data e ora",
      "timeOnly": "Solo ora",
      "time12h": "Formato 12h",
      "time24h": "Formato 24h"
    },
    "labels": {
      "date": "Data",
      "time": "Ora",
      "dateTime": "Data e ora",
      "duration": "Durata",
      "startDate": "Data di inizio",
      "endDate": "Data di fine",
      "created": "Creato",
      "updated": "Aggiornato",
      "lastModified": "Ultima modifica",
      "lastActive": "Ultima attivita",
      "lastSeen": "Ultimo accesso"
    },
    "duration": {
      "hours": "{count, plural, one {# ora} other {# ore}}",
      "minutes": "{count, plural, one {# minuto} other {# minuti}}",
      "seconds": "{count, plural, one {# secondo} other {# secondi}}",
      "days": "{count, plural, one {# giorno} other {# giorni}}",
      "weeks": "{count, plural, one {# settimana} other {# settimane}}",
      "months": "{count, plural, one {# mese} other {# mesi}}",
      "hoursMinutes": "{hours, plural, one {# ora} other {# ore}} {minutes, plural, one {# minuto} other {# minuti}}",
      "daysHours": "{days, plural, one {# giorno} other {# giorni}} {hours, plural, one {# ora} other {# ore}}"
    },
    "range": {
      "to": "al",
      "from": "dal",
      "until": "fino al",
      "separator": " - "
    }
  }
}
```

**Notes**:
- Italian uses "fa" for "ago" (placed AFTER the time unit)
- Italian uses "tra" for future expressions
- Italian month/weekday names are lowercase
- Italian date format is DD/MM/YYYY

**Verification**:
- [ ] JSON is syntactically valid
- [ ] Key structure matches en.json exactly
- [ ] Italian word order for "ago" is correct (time + fa)

---

### Task 2H.9.7: Create Date/Time Utility Module

**File**: `/src/lib/i18n/datetime-utils.ts` (NEW FILE)

**Objective**: Create utility functions for locale-aware date/time operations.

**Implementation**:

```typescript
/**
 * Date/Time Formatting Utilities for Internationalization
 *
 * Provides helper functions for locale-aware date/time operations.
 * Designed to work with next-intl's formatting capabilities.
 *
 * REQ-345: Create Date and Time Formatting Translations
 * Plan-111: L10N Epic 2, Sub-Epic 2H, Task 2H.9
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import type { SupportedLocale } from './config';

/**
 * Date format style options
 */
export type DateFormatStyle = 'short' | 'medium' | 'long' | 'full';

/**
 * Time format style options
 */
export type TimeFormatStyle = '12h' | '24h' | 'auto';

/**
 * Relative time unit
 */
export type RelativeTimeUnit =
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'years';

/**
 * Result of calculating relative time
 */
export interface RelativeTimeResult {
  unit: RelativeTimeUnit;
  value: number;
  isFuture: boolean;
  translationKey: string;
}

/**
 * Locale-specific date format options
 * Maps locale codes to Intl.DateTimeFormat options
 */
export const LOCALE_DATE_FORMAT_OPTIONS: Record<
  SupportedLocale,
  Intl.DateTimeFormatOptions
> = {
  en: { year: 'numeric', month: '2-digit', day: '2-digit' }, // MM/DD/YYYY
  fr: { year: 'numeric', month: '2-digit', day: '2-digit' }, // DD/MM/YYYY
  es: { year: 'numeric', month: '2-digit', day: '2-digit' }, // DD/MM/YYYY
  de: { year: 'numeric', month: '2-digit', day: '2-digit' }, // DD.MM.YYYY
  nl: { year: 'numeric', month: '2-digit', day: '2-digit' }, // DD-MM-YYYY
  it: { year: 'numeric', month: '2-digit', day: '2-digit' }, // DD/MM/YYYY
};

/**
 * Locales that use 24-hour time format by default
 */
export const LOCALES_USING_24H: SupportedLocale[] = ['fr', 'es', 'de', 'nl', 'it'];

/**
 * Determine if a locale uses 24-hour time format by default
 * @param locale - The locale code
 * @returns True if the locale uses 24-hour time
 */
export function uses24HourTime(locale: SupportedLocale): boolean {
  return LOCALES_USING_24H.includes(locale);
}

/**
 * Get the appropriate time format options for a locale
 * @param locale - The locale code
 * @param style - Time format style preference ('12h', '24h', or 'auto')
 * @returns Intl.DateTimeFormat options for time
 */
export function getTimeFormatOptions(
  locale: SupportedLocale,
  style: TimeFormatStyle = 'auto'
): Intl.DateTimeFormatOptions {
  const use24h = style === '24h' || (style === 'auto' && uses24HourTime(locale));

  return {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24h,
  };
}

/**
 * Get date format options based on style
 * @param style - Date format style
 * @returns Intl.DateTimeFormat options
 */
export function getDateFormatOptions(
  style: DateFormatStyle = 'medium'
): Intl.DateTimeFormatOptions {
  switch (style) {
    case 'short':
      return { year: '2-digit', month: 'numeric', day: 'numeric' };
    case 'medium':
      return { year: 'numeric', month: 'short', day: 'numeric' };
    case 'long':
      return { year: 'numeric', month: 'long', day: 'numeric' };
    case 'full':
      return { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    default:
      return { year: 'numeric', month: 'short', day: 'numeric' };
  }
}

/**
 * Calculate the relative time between a date and now
 * @param date - The date to compare (Date object or ISO string)
 * @returns RelativeTimeResult with unit, value, and translation key
 */
export function calculateRelativeTime(date: Date | string): RelativeTimeResult {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const isFuture = diffMs > 0;
  const absDiffMs = Math.abs(diffMs);

  // Convert to seconds
  const diffSeconds = Math.floor(absDiffMs / 1000);

  // Define thresholds
  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;

  let unit: RelativeTimeUnit;
  let value: number;

  if (diffSeconds < MINUTE) {
    unit = 'seconds';
    value = diffSeconds;
  } else if (diffSeconds < HOUR) {
    unit = 'minutes';
    value = Math.floor(diffSeconds / MINUTE);
  } else if (diffSeconds < DAY) {
    unit = 'hours';
    value = Math.floor(diffSeconds / HOUR);
  } else if (diffSeconds < WEEK) {
    unit = 'days';
    value = Math.floor(diffSeconds / DAY);
  } else if (diffSeconds < MONTH) {
    unit = 'weeks';
    value = Math.floor(diffSeconds / WEEK);
  } else if (diffSeconds < YEAR) {
    unit = 'months';
    value = Math.floor(diffSeconds / MONTH);
  } else {
    unit = 'years';
    value = Math.floor(diffSeconds / YEAR);
  }

  // Determine translation key
  const keyPrefix = isFuture ? 'in' : '';
  const keySuffix = isFuture ? '' : 'Ago';
  const unitCapitalized = unit.charAt(0).toUpperCase() + unit.slice(1);
  const translationKey = `relative.${keyPrefix}${isFuture ? unitCapitalized : unit}${keySuffix}`;

  return {
    unit,
    value,
    isFuture,
    translationKey,
  };
}

/**
 * Get the translation key for "just now" threshold
 * @param date - The date to check
 * @param thresholdSeconds - Threshold in seconds (default: 30)
 * @returns 'justNow' key if within threshold, null otherwise
 */
export function getJustNowKey(
  date: Date | string,
  thresholdSeconds: number = 30
): string | null {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = Math.abs(dateObj.getTime() - now.getTime());
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < thresholdSeconds) {
    return 'relative.justNow';
  }
  return null;
}

/**
 * Get the translation key for today/yesterday/tomorrow
 * @param date - The date to check
 * @returns Translation key or null if not applicable
 */
export function getDayRelativeKey(date: Date | string): string | null {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  // Normalize to start of day for comparison
  const dateDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round(
    (dateDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  switch (diffDays) {
    case 0:
      return 'relative.today';
    case -1:
      return 'relative.yesterday';
    case 1:
      return 'relative.tomorrow';
    default:
      return null;
  }
}

/**
 * Get month translation key from a date
 * @param date - The date
 * @param abbreviated - Whether to use abbreviated month names
 * @returns Translation key for the month
 */
export function getMonthKey(date: Date | string, abbreviated: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const monthIndex = dateObj.getMonth();
  const monthKeys = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const shortKeys = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  const namespace = abbreviated ? 'monthsShort' : 'months';
  const key = abbreviated ? shortKeys[monthIndex] : monthKeys[monthIndex];
  return `${namespace}.${key}`;
}

/**
 * Get weekday translation key from a date
 * @param date - The date
 * @param abbreviated - Whether to use abbreviated weekday names
 * @returns Translation key for the weekday
 */
export function getWeekdayKey(date: Date | string, abbreviated: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayIndex = dateObj.getDay();
  const dayKeys = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday'
  ];
  const shortKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const namespace = abbreviated ? 'weekdaysShort' : 'weekdays';
  const key = abbreviated ? shortKeys[dayIndex] : dayKeys[dayIndex];
  return `${namespace}.${key}`;
}

/**
 * Convert a Date to ISO string safely
 * @param date - Date object or string
 * @returns ISO date string
 */
export function toISODateString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Check if a date is valid
 * @param date - Date to validate
 * @returns True if the date is valid
 */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
}
```

**Verification**:
- [ ] File created at correct location
- [ ] All exports are typed correctly
- [ ] No runtime dependencies on React (pure utility functions)
- [ ] TypeScript compiles without errors

---

### Task 2H.9.8: Create `useDateTimeFormat` React Hook

**File**: `/src/hooks/useDateTimeFormat.ts` (NEW FILE)

**Objective**: Create a React hook that provides locale-aware date/time formatting.

**Implementation**:

```typescript
/**
 * useDateTimeFormat Hook
 *
 * Provides locale-aware date and time formatting functions using next-intl.
 * Integrates with the datetime translation namespace for consistent formatting.
 *
 * REQ-345: Create Date and Time Formatting Translations
 * Plan-111: L10N Epic 2, Sub-Epic 2H, Task 2H.9
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { useFormatter, useTranslations, useLocale } from 'next-intl';
import {
  getDateFormatOptions,
  getTimeFormatOptions,
  calculateRelativeTime,
  getJustNowKey,
  getDayRelativeKey,
  getMonthKey,
  getWeekdayKey,
  isValidDate,
  type DateFormatStyle,
  type TimeFormatStyle,
} from '@/lib/i18n/datetime-utils';
import type { SupportedLocale } from '@/lib/i18n/config';

/**
 * Return type for the useDateTimeFormat hook
 */
export interface UseDateTimeFormatReturn {
  /**
   * Format a date according to locale conventions
   * @param date - Date object or ISO string
   * @param style - Format style: 'short', 'medium', 'long', or 'full'
   * @returns Formatted date string
   */
  formatDate: (date: Date | string, style?: DateFormatStyle) => string;

  /**
   * Format a time according to locale conventions
   * @param date - Date object or ISO string
   * @param style - Format style: '12h', '24h', or 'auto'
   * @returns Formatted time string
   */
  formatTime: (date: Date | string, style?: TimeFormatStyle) => string;

  /**
   * Format both date and time
   * @param date - Date object or ISO string
   * @param dateStyle - Date format style
   * @param timeStyle - Time format style
   * @returns Formatted date and time string
   */
  formatDateTime: (
    date: Date | string,
    dateStyle?: DateFormatStyle,
    timeStyle?: TimeFormatStyle
  ) => string;

  /**
   * Format a relative time expression
   * @param date - Date object or ISO string
   * @returns Translated relative time string (e.g., "2 days ago", "in 3 hours")
   */
  formatRelativeTime: (date: Date | string) => string;

  /**
   * Get a translated month name
   * @param monthOrDate - Month index (0-11) or Date object
   * @param style - 'full' or 'short'
   * @returns Translated month name
   */
  getMonthName: (monthOrDate: number | Date, style?: 'full' | 'short') => string;

  /**
   * Get a translated day name
   * @param dayOrDate - Day index (0-6, 0=Sunday) or Date object
   * @param style - 'full' or 'short'
   * @returns Translated day name
   */
  getDayName: (dayOrDate: number | Date, style?: 'full' | 'short') => string;

  /**
   * Format a duration
   * @param seconds - Total duration in seconds
   * @returns Formatted duration string
   */
  formatDuration: (seconds: number) => string;

  /**
   * Format a date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param style - Format style
   * @returns Formatted date range string
   */
  formatDateRange: (
    startDate: Date | string,
    endDate: Date | string,
    style?: DateFormatStyle
  ) => string;

  /**
   * Current locale code
   */
  locale: SupportedLocale;
}

/**
 * Hook for locale-aware date and time formatting
 *
 * @returns Object with formatting functions and current locale
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { formatDate, formatRelativeTime, locale } = useDateTimeFormat();
 *
 *   return (
 *     <div>
 *       <p>Created: {formatDate(item.createdAt)}</p>
 *       <p>Last updated: {formatRelativeTime(item.updatedAt)}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDateTimeFormat(): UseDateTimeFormatReturn {
  const format = useFormatter();
  const t = useTranslations('datetime');
  const locale = useLocale() as SupportedLocale;

  /**
   * Format a date according to locale conventions
   */
  const formatDate = (
    date: Date | string,
    style: DateFormatStyle = 'medium'
  ): string => {
    if (!isValidDate(date)) {
      return '';
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format.dateTime(dateObj, getDateFormatOptions(style));
  };

  /**
   * Format a time according to locale conventions
   */
  const formatTime = (
    date: Date | string,
    style: TimeFormatStyle = 'auto'
  ): string => {
    if (!isValidDate(date)) {
      return '';
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format.dateTime(dateObj, getTimeFormatOptions(locale, style));
  };

  /**
   * Format both date and time
   */
  const formatDateTime = (
    date: Date | string,
    dateStyle: DateFormatStyle = 'medium',
    timeStyle: TimeFormatStyle = 'auto'
  ): string => {
    if (!isValidDate(date)) {
      return '';
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options = {
      ...getDateFormatOptions(dateStyle),
      ...getTimeFormatOptions(locale, timeStyle),
    };
    return format.dateTime(dateObj, options);
  };

  /**
   * Format a relative time expression
   */
  const formatRelativeTime = (date: Date | string): string => {
    if (!isValidDate(date)) {
      return '';
    }

    // Check for "just now"
    const justNowKey = getJustNowKey(date);
    if (justNowKey) {
      return t('relative.justNow');
    }

    // Check for today/yesterday/tomorrow
    const dayKey = getDayRelativeKey(date);
    if (dayKey) {
      return t(dayKey);
    }

    // Calculate relative time
    const result = calculateRelativeTime(date);

    // Build translation key and params
    if (result.isFuture) {
      // Future: "in X units"
      const keyMap: Record<string, string> = {
        seconds: 'inSeconds',
        minutes: 'inMinutes',
        hours: 'inHours',
        days: 'inDays',
        weeks: 'inWeeks',
        months: 'inMonths',
        years: 'inYears',
      };
      return t(`relative.${keyMap[result.unit]}`, { count: result.value });
    } else {
      // Past: "X units ago"
      const keyMap: Record<string, string> = {
        seconds: 'secondsAgo',
        minutes: 'minutesAgo',
        hours: 'hoursAgo',
        days: 'daysAgo',
        weeks: 'weeksAgo',
        months: 'monthsAgo',
        years: 'yearsAgo',
      };
      return t(`relative.${keyMap[result.unit]}`, { count: result.value });
    }
  };

  /**
   * Get a translated month name
   */
  const getMonthName = (
    monthOrDate: number | Date,
    style: 'full' | 'short' = 'full'
  ): string => {
    let monthIndex: number;
    if (typeof monthOrDate === 'number') {
      monthIndex = monthOrDate;
    } else {
      monthIndex = monthOrDate.getMonth();
    }

    const monthKeys = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const shortKeys = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];

    const namespace = style === 'short' ? 'monthsShort' : 'months';
    const key = style === 'short' ? shortKeys[monthIndex] : monthKeys[monthIndex];
    return t(`${namespace}.${key}`);
  };

  /**
   * Get a translated day name
   */
  const getDayName = (
    dayOrDate: number | Date,
    style: 'full' | 'short' = 'full'
  ): string => {
    let dayIndex: number;
    if (typeof dayOrDate === 'number') {
      dayIndex = dayOrDate;
    } else {
      dayIndex = dayOrDate.getDay();
    }

    const dayKeys = [
      'sunday', 'monday', 'tuesday', 'wednesday',
      'thursday', 'friday', 'saturday'
    ];
    const shortKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    const namespace = style === 'short' ? 'weekdaysShort' : 'weekdays';
    const key = style === 'short' ? shortKeys[dayIndex] : dayKeys[dayIndex];
    return t(`${namespace}.${key}`);
  };

  /**
   * Format a duration
   */
  const formatDuration = (seconds: number): string => {
    if (seconds < 0) {
      return '';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0 && minutes > 0) {
      return t('duration.hoursMinutes', { hours, minutes });
    } else if (hours > 0) {
      return t('duration.hours', { count: hours });
    } else if (minutes > 0) {
      return t('duration.minutes', { count: minutes });
    } else {
      return t('duration.seconds', { count: remainingSeconds });
    }
  };

  /**
   * Format a date range
   */
  const formatDateRange = (
    startDate: Date | string,
    endDate: Date | string,
    style: DateFormatStyle = 'short'
  ): string => {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return '';
    }

    const startObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const endObj = typeof endDate === 'string' ? new Date(endDate) : endDate;

    try {
      return format.dateTimeRange(startObj, endObj, getDateFormatOptions(style));
    } catch {
      // Fallback if dateTimeRange is not supported
      const separator = t('range.separator');
      return `${formatDate(startObj, style)}${separator}${formatDate(endObj, style)}`;
    }
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    getMonthName,
    getDayName,
    formatDuration,
    formatDateRange,
    locale,
  };
}

export default useDateTimeFormat;
```

**Verification**:
- [ ] File created at correct location
- [ ] Hook uses next-intl correctly (`useFormatter`, `useTranslations`, `useLocale`)
- [ ] All functions handle invalid dates gracefully
- [ ] TypeScript compiles without errors
- [ ] Exports are properly defined

---

### Task 2H.9.9: Verify JSON Validity and Key Consistency

**Objective**: Ensure all translation files are valid JSON with identical key structures.

**Steps**:

1. **JSON Validation Script** (run manually or create):
```bash
# Validate JSON syntax for all translation files
for file in messages/*.json; do
  echo "Validating $file..."
  node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" && echo "Valid!" || echo "INVALID!"
done
```

2. **Key Structure Comparison**:
- Extract keys from en.json
- Verify all other files have identical keys
- Check for missing translations

3. **ICU Syntax Validation**:
- Verify all `{count, plural, ...}` patterns are valid
- Ensure variable names match between files

**Verification Checklist**:
- [ ] All 6 JSON files pass validation
- [ ] `datetime` namespace exists in all files
- [ ] Key count matches across all files (~85 datetime keys)
- [ ] No typos in translation keys
- [ ] ICU pluralization syntax is valid in all files

---

### Task 2H.9.10: Build and Integration Verification

**Objective**: Verify the implementation works in the application.

**Steps**:

1. **Build Verification**:
```bash
npm run build
```
Expected: Build completes without TypeScript or other errors.

2. **Import Verification**:
Create a test import in any component to verify:
```typescript
import { useDateTimeFormat } from '@/hooks/useDateTimeFormat';
import {
  calculateRelativeTime,
  getDateFormatOptions,
} from '@/lib/i18n/datetime-utils';
```

3. **Runtime Verification** (optional test component):
```tsx
function DateTimeTest() {
  const { formatDate, formatRelativeTime, getMonthName, locale } = useDateTimeFormat();

  return (
    <div>
      <p>Locale: {locale}</p>
      <p>Today: {formatDate(new Date())}</p>
      <p>Relative: {formatRelativeTime(new Date(Date.now() - 86400000))}</p>
      <p>Month: {getMonthName(0)}</p>
    </div>
  );
}
```

**Verification Checklist**:
- [ ] `npm run build` succeeds without errors
- [ ] No TypeScript errors in new files
- [ ] Imports resolve correctly
- [ ] Hook can be used in components
- [ ] Date formatting respects locale

---

## File Summary

### New Files to Create

| File Path | Purpose | Task |
|-----------|---------|------|
| `/src/lib/i18n/datetime-utils.ts` | Date/time utility functions | 2H.9.7 |
| `/src/hooks/useDateTimeFormat.ts` | React hook for formatting | 2H.9.8 |

### Files to Modify

| File Path | Change | Task |
|-----------|--------|------|
| `/messages/en.json` | Add `datetime` namespace (~85 keys) | 2H.9.1 |
| `/messages/fr.json` | Add `datetime` namespace (French) | 2H.9.2 |
| `/messages/es.json` | Add `datetime` namespace (Spanish) | 2H.9.3 |
| `/messages/de.json` | Add `datetime` namespace (German) | 2H.9.4 |
| `/messages/nl.json` | Add `datetime` namespace (Dutch) | 2H.9.5 |
| `/messages/it.json` | Add `datetime` namespace (Italian) | 2H.9.6 |

### Files Referenced (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/config.ts` | Locale configuration and types |
| `/src/lib/utils.ts` | Existing formatDate functions (for context) |

---

## Success Criteria

### Translation Structure
- [ ] `/messages/en.json` contains complete `datetime` namespace
- [ ] `datetime.relative` has all 24 relative time keys with ICU pluralization
- [ ] `datetime.months` has all 12 month names
- [ ] `datetime.monthsShort` has all 12 abbreviated month names
- [ ] `datetime.weekdays` has all 7 day names
- [ ] `datetime.weekdaysShort` has all 7 abbreviated day names
- [ ] `datetime.formats` has format labels
- [ ] `datetime.labels` has common datetime labels
- [ ] `datetime.duration` has duration format strings
- [ ] `datetime.range` has range-related strings

### JSON Validity
- [ ] All 6 translation files are valid JSON
- [ ] All 6 files have identical `datetime` key structures
- [ ] ICU pluralization syntax is correct in all files

### Utility Module
- [ ] `/src/lib/i18n/datetime-utils.ts` created with all helper functions
- [ ] All exports are properly typed
- [ ] No React dependencies in utility module

### React Hook
- [ ] `/src/hooks/useDateTimeFormat.ts` created
- [ ] Hook integrates with next-intl's `useFormatter`
- [ ] All formatting functions work correctly
- [ ] TypeScript types are properly defined

### Build Verification
- [ ] Application builds without errors
- [ ] No TypeScript compilation errors
- [ ] Imports resolve correctly

### Language Support
- [ ] English translations complete (~85 keys)
- [ ] French translations complete (~85 keys)
- [ ] Spanish translations complete (~85 keys)
- [ ] German translations complete (~85 keys)
- [ ] Dutch translations complete (~85 keys)
- [ ] Italian translations complete (~85 keys)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JSON syntax errors | Low | High | Validate JSON before committing |
| ICU format errors | Medium | Medium | Test pluralization with different counts |
| Missing translation keys | Low | Medium | Compare key structures programmatically |
| Hook doesn't work with SSR | Low | High | Test in both client and server contexts |
| TypeScript type mismatches | Low | Medium | Run TypeScript strict mode checks |

---

## Notes

### Pattern Alignment
- Follow ICU message format for pluralization (next-intl standard)
- Use camelCase for translation keys (matching existing codebase convention)
- Maintain alphabetical ordering within each sub-category

### Next-intl Best Practices
- Prefer `useFormatter` for date/time formatting over manual implementations
- Use built-in `format.relativeTime()` where applicable
- Leverage `format.dateTimeRange()` for date ranges

### Regional Considerations
- European locales (fr, es, de, nl, it) prefer 24-hour time format
- Date order varies: MM/DD/YYYY (US) vs DD/MM/YYYY (Europe)
- Month/weekday capitalization varies: English capitalizes, most European languages don't

### Future Integration Points
- Components displaying dates will import and use `useDateTimeFormat` hook
- Calendar components will use translated month/day names
- Analytics pages will use locale-aware date ranges

---

## Dependencies

- next-intl package (already installed via Epic 1)
- Valid `/messages/*.json` files (already exist via Epic 1)
- No new npm packages required

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2H, Task 2H.9*
*Implementation agent should execute tasks 2H.9.1 through 2H.9.10 in order*
