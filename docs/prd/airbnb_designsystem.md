# Airbnb Design System Documentation

**Document Version:** 1.0
**Last Modified:** 2026-01-01
**Author:** UX Design Analysis

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Principles](#2-design-principles)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Iconography](#6-iconography)
7. [Components](#7-components)
8. [Motion & Animation](#8-motion--animation)
9. [Accessibility](#9-accessibility)
10. [Design Tokens](#10-design-tokens)
11. [Resources & References](#11-resources--references)

---

## 1. Overview

### 1.1 What is the Airbnb Design Language System (DLS)?

The Airbnb Design Language System (DLS) is a comprehensive set of guidelines, components, and patterns that guide the design and development of Airbnb's user interface across all platforms. Launched in 2016, it serves as a shared design language and toolset providing a consistent and cohesive experience for users.

### 1.2 Core Goals

- **Unified Visual Language**: Create a more beautiful and accessible design language
- **Cross-Platform Consistency**: Well-defined, reusable components that work identically across web, iOS, and Android
- **Efficiency**: Drive greater efficiency through component reuse
- **Single Source of Truth (SSOT)**: Ensure all team members use the same information when making decisions

### 1.3 Architecture

The DLS separates concerns into three layers:

| Layer | Description | Examples |
|-------|-------------|----------|
| **Design Tokens** | Primitive variables | Colors, spacing, typography scales |
| **Style Systems** | Themes and scales | Light/dark mode, responsive breakpoints |
| **Component Libraries** | Atomic to composite | Buttons, cards, modals, forms |

### 1.4 Component Philosophy

Rather than atomic design, Airbnb considers components as **"elements of a living organism"**:

- Have a **function** and **personality**
- Defined by **required** and **optional** elements
- Can **co-exist** with others
- Can **evolve** (or die) independently

---

## 2. Design Principles

### 2.1 Core Principles

1. **Unified**: Consistent experience across all touchpoints
2. **Iconic**: Distinctive and memorable visual identity
3. **Conversational**: Human, warm, and approachable tone
4. **Alive**: Dynamic and responsive to user interactions

### 2.2 Design Philosophy

- **"From button to billboard"**: Design that scales from UI elements to marketing materials
- **Platform-agnostic**: Most components look and work the same on iOS and Android
- **Respectful of conventions**: Follow platform-specific patterns for navigation, system icons, and interactions
- **Less is more**: Smallest amount of robust components that cover the most use cases

---

## 3. Color System

### 3.1 Primary Brand Colors

| Color Name | Hex Code | RGB | CMYK | Pantone | Usage |
|------------|----------|-----|------|---------|-------|
| **Rausch** | `#FF5A5F` | 255, 90, 95 | 0, 70, 58, 0 | PMS 178 C | Legacy brand color |
| **Radical Red** | `#FF385C` | 255, 56, 92 | 0, 78, 64, 0 | - | Current primary CTA |
| **Babu** | `#00A699` | 0, 166, 153 | 94, 0, 48, 0 | PMS 3272 C | Success, teal accents |
| **Arches** | `#FC642D` | 252, 100, 45 | 0, 70, 100, 0 | PMS 165 C | Warning, orange accents |

### 3.2 Neutral Colors

| Color Name | Hex Code | RGB | CMYK | Pantone | Usage |
|------------|----------|-----|------|---------|-------|
| **Hof** | `#484848` | 72, 72, 72 | 76, 69, 68, 33 | PMS 2336 C | Primary text |
| **Foggy** | `#767676` | 118, 118, 118 | 30, 22, 17, 57 | Cool Gray 9 C | Secondary text |
| **Mine Shaft** | `#222222` | 34, 34, 34 | - | - | Headings, emphasis |
| **White** | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 | - | Backgrounds |

### 3.3 Color Psychology & Application

```
Primary Actions     → Radical Red (#FF385C)
Text (Primary)      → Mine Shaft (#222222) or Hof (#484848)
Text (Secondary)    → Foggy (#767676)
Backgrounds         → White (#FFFFFF)
Success States      → Babu (#00A699)
Warning States      → Arches (#FC642D)
Error States        → Rausch (#FF5A5F)
```

### 3.4 Color Naming Convention

Colors are named after meaningful Airbnb locations:
- **Rausch**: 19 Rausch Street, San Francisco (where founders hosted first guests in 2007)
- **Babu**: Named after a location significant to the company
- **Hof**: Named after a location significant to the company

---

## 4. Typography

### 4.1 Primary Typeface: Airbnb Cereal

Launched May 15, 2018, created in partnership with **Dalton Maag** foundry.

#### Font Weights

| Weight | CSS Value | Usage |
|--------|-----------|-------|
| Light | 300 | Large display text, decorative |
| Book | 400 | Body text, UI labels |
| Medium | 500 | Emphasis, subheadings |
| Bold | 700 | Headings, CTAs |
| Extra Bold | 800 | Hero text, marketing |
| Black | 900 | Display, impact |

### 4.2 Typography Design Principles

- **Taller x-height**: Lowercase letters are proportionally taller for improved readability
- **Slanted open apertures**: Enhanced character distinction (visible in 'e', 'a', 'c')
- **Platform-specific hinting**: Optimized rendering per platform
- **Scalable design**: Stroke width and proportions adjust based on size

### 4.3 Type Scale (Design Tokens)

```css
/* Example from DLS */
--text-title-1: 32px / 40px (line-height)
--text-title-2: 28px / 36px
--text-title-3: 24px / 32px  /* letter-spacing: 2 */
--text-body-1: 16px / 24px
--text-body-2: 14px / 20px
--text-caption: 12px / 16px
```

### 4.4 Fallback Fonts

```css
font-family: 'Airbnb Cereal', 'Circular', -apple-system, BlinkMacSystemFont,
             'Roboto', 'Helvetica Neue', sans-serif;
```

### 4.5 Dynamic Type Support

For iOS, Airbnb uses `UIFontMetrics` to handle:
- Font size scaling
- Line height adjustments
- Letter spacing (tracking) modifications

---

## 5. Spacing & Layout

### 5.1 Base Unit: 8px Grid System

Airbnb uses an **8px grid system** with 4px sub-grid for fine adjustments.

#### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | Reset |
| `space-1` | 4px | Tight spacing, icons |
| `space-2` | 8px | Default small spacing |
| `space-3` | 12px | Component internal |
| `space-4` | 16px | Standard gap |
| `space-5` | 24px | Section spacing |
| `space-6` | 32px | Large gaps |
| `space-7` | 40px | Major sections |
| `space-8` | 48px | Hero spacing |
| `space-9` | 64px | Page sections |

### 5.2 Layout Grid

#### Desktop (12-column grid)

```css
.container {
  max-width: 1760px;
  margin: 0 auto;
  padding: 0 80px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 24px;
}
```

#### Responsive Breakpoints

| Breakpoint | Width | Columns | Gutter |
|------------|-------|---------|--------|
| Mobile | < 744px | 4 | 16px |
| Tablet | 744px - 1127px | 8 | 24px |
| Desktop | 1128px - 1439px | 12 | 24px |
| Large | >= 1440px | 12 | 24px |

### 5.3 Tablet Layout Concepts

- **Focus Views**: Content centered with generous margins
- **2-Column Layouts**: Side-by-side content
- **Grid Layouts**: Card grids for listings
- **Modals**: Centered overlays with backdrop

---

## 6. Iconography

### 6.1 Icon System Evolution

#### Traditional Line Icons (UI)
- Stroke width: 2px
- Size grid: 24px × 24px (touch targets: 44px × 44px)
- Rounded corners and caps
- Consistent visual weight

#### 3D "Lava" Icons (2025+)

Airbnb's May 2025 redesign introduced **"Lava"**, a proprietary micro-video format:

- **Format**: Micro-video with alpha channel (transparency)
- **Purpose**: Brings 3D icons to life with motion
- **Platforms**: Unified SDK for web, iOS, Android
- **Fallback**: Static PNG images for reduced motion settings

### 6.2 Icon Categories

| Category | Style | Examples |
|----------|-------|----------|
| Navigation | Line | Search, heart, profile, menu |
| Categories | 3D Lava | House, hot air balloon, service bell |
| Actions | Line | Share, edit, delete, close |
| Status | Filled/Line | Star ratings, checkmarks |

### 6.3 Icon Design Guidelines

```
Size:          24px × 24px (default)
Stroke:        2px
Corner radius: 2px on joins
Touch target:  Minimum 44px × 44px
Color:         Inherit from parent or #222222
```

### 6.4 Accessibility for Icons

- Provide `alt` text or `aria-label` for meaning
- Support `prefers-reduced-motion` for animated icons
- Ensure sufficient color contrast

---

## 7. Components

### 7.1 Buttons

#### Primary Button

```css
.btn-primary {
  background-color: #222222;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-family: 'Airbnb Cereal', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #000000;
  transform: scale(1.02);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

#### Secondary Button (Outline)

```css
.btn-secondary {
  background-color: transparent;
  color: #222222;
  border: 1px solid #222222;
  border-radius: 8px;
  padding: 14px 24px;
  font-weight: 500;
}
```

#### Gradient Button (Special CTAs)

```css
.btn-gradient {
  background: linear-gradient(to right, #E61E4D, #E31C5F, #D70466);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
}
```

### 7.2 Cards

#### Listing Card

```css
.listing-card {
  background: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.listing-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
}

.listing-card__image {
  aspect-ratio: 20 / 19;
  border-radius: 12px;
  object-fit: cover;
}

.listing-card__content {
  padding: 12px 0;
}

.listing-card__title {
  font-weight: 500;
  font-size: 15px;
  color: #222222;
}

.listing-card__subtitle {
  font-size: 15px;
  color: #717171;
}

.listing-card__price {
  font-weight: 600;
  font-size: 15px;
}
```

### 7.3 Search Bar

```css
.search-bar {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  border-radius: 40px;
  padding: 8px 8px 8px 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08),
              0 4px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}

.search-bar:hover,
.search-bar:focus-within {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12),
              0 8px 16px rgba(0, 0, 0, 0.08);
}

.search-bar__button {
  background: linear-gradient(to right, #E61E4D, #E31C5F, #D70466);
  border-radius: 50%;
  width: 48px;
  height: 48px;
}
```

### 7.4 Form Elements

#### Text Input

```css
.input {
  width: 100%;
  padding: 22px 12px 8px;
  border: 1px solid #B0B0B0;
  border-radius: 8px;
  font-size: 16px;
  line-height: 20px;
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #222222;
  border-width: 2px;
}

.input-label {
  position: absolute;
  top: 8px;
  left: 12px;
  font-size: 12px;
  color: #717171;
  font-weight: 500;
}
```

#### Checkbox

```css
.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #B0B0B0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox:checked {
  background-color: #222222;
  border-color: #222222;
}
```

### 7.5 Navigation

#### Bottom Tab Bar (Mobile)

```css
.tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  background: #FFFFFF;
  border-top: 1px solid #EBEBEB;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #717171;
  font-size: 10px;
  font-weight: 500;
}

.tab-item--active {
  color: #FF385C;
}
```

### 7.6 Modals & Overlays

```css
.modal-backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: #FFFFFF;
  border-radius: 12px;
  max-width: 568px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
}

.modal__header {
  padding: 16px 24px;
  border-bottom: 1px solid #EBEBEB;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}
```

### 7.7 Badges & Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge--new {
  background: #222222;
  color: #FFFFFF;
}

.badge--superhost {
  background: transparent;
  border: 1px solid #222222;
  color: #222222;
}
```

---

## 8. Motion & Animation

### 8.1 Lottie Animation System

Airbnb created **Lottie**, an open-source library for rendering After Effects animations natively.

#### Supported Platforms
- Web (lottie-web)
- iOS (lottie-ios)
- Android (lottie-android)
- React Native (lottie-react-native)

#### Benefits
- **Small file size**: JSON-based, much smaller than GIF/video
- **Vector-based**: Scales without quality loss
- **Interactive**: Responds to user input (scroll, click, hover)
- **Cross-platform**: Identical rendering everywhere

### 8.2 Animation Principles

| Principle | Description |
|-----------|-------------|
| **Easing** | Natural acceleration/deceleration |
| **Anticipation** | Small movement before main action |
| **Follow-through** | Elements settle after motion |
| **Secondary Action** | Supporting animations that enhance main action |

### 8.3 Timing Guidelines

```css
/* Micro-interactions */
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 400ms;

/* Easing curves */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 8.4 Common Animation Patterns

#### Button Press

```css
.btn:active {
  transform: scale(0.96);
  transition: transform 100ms ease-out;
}
```

#### Card Hover

```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  transition: all 200ms ease-out;
}
```

#### Page Transitions

```css
.page-enter {
  opacity: 0;
  transform: translateX(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 300ms ease-out;
}
```

### 8.5 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Accessibility

### 9.1 Standards Compliance

Airbnb strives to conform with:
- **European Accessibility Act**
- **WCAG 2.1 Level AA**

### 9.2 Key Focus Areas

| Area | Implementation |
|------|----------------|
| **Color Contrast** | Minimum 4.5:1 for text, 3:1 for large text |
| **Keyboard Navigation** | All interactive elements focusable |
| **Screen Readers** | Semantic HTML, ARIA labels |
| **Text Resizing** | Content remains functional at 200% zoom |
| **Focus Indicators** | Visible focus states on all elements |

### 9.3 Color Contrast Ratios

```
Text on white background:
- #222222 (Mine Shaft) → 16.1:1 ✓
- #484848 (Hof) → 7.6:1 ✓
- #717171 → 4.7:1 ✓ (large text only)
- #767676 (Foggy) → 4.5:1 ✓ (minimum)

Rausch (#FF5A5F) on white → 3.9:1 (use for large elements only)
```

### 9.4 Focus States

```css
:focus-visible {
  outline: 2px solid #222222;
  outline-offset: 2px;
}

/* For interactive cards */
.card:focus-visible {
  box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #222222;
}
```

### 9.5 Text Resizing (WCAG 1.4.4)

Airbnb's implementation:
- Base font size: 16px (1rem)
- All typography uses relative units (rem, em)
- Content reflows at 200% zoom
- No horizontal scrolling at standard zoom levels

### 9.6 Known Limitations

- Tablet compatibility not fully tested
- Keyboard access on native mobile apps limited
- Braille display support not tested
- Third-party vendor content may not meet standards

---

## 10. Design Tokens

### 10.1 Token Format

Tokens are stored as JSON and transformed for each platform:

```json
{
  "color": {
    "brand": {
      "primary": {
        "value": "#FF385C",
        "type": "color"
      }
    },
    "text": {
      "primary": {
        "value": "#222222",
        "type": "color"
      },
      "secondary": {
        "value": "#717171",
        "type": "color"
      }
    }
  },
  "spacing": {
    "xs": { "value": "4px", "type": "spacing" },
    "sm": { "value": "8px", "type": "spacing" },
    "md": { "value": "16px", "type": "spacing" },
    "lg": { "value": "24px", "type": "spacing" },
    "xl": { "value": "32px", "type": "spacing" }
  },
  "borderRadius": {
    "sm": { "value": "4px", "type": "borderRadius" },
    "md": { "value": "8px", "type": "borderRadius" },
    "lg": { "value": "12px", "type": "borderRadius" },
    "full": { "value": "9999px", "type": "borderRadius" }
  }
}
```

### 10.2 CSS Custom Properties

```css
:root {
  /* Colors */
  --color-brand-primary: #FF385C;
  --color-brand-secondary: #00A699;
  --color-text-primary: #222222;
  --color-text-secondary: #717171;
  --color-background: #FFFFFF;
  --color-border: #DDDDDD;

  /* Typography */
  --font-family: 'Airbnb Cereal', sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 28px rgba(0, 0, 0, 0.12);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}
```

### 10.3 Platform Transformations

| Platform | Output Format |
|----------|---------------|
| Web | CSS Custom Properties, SCSS variables |
| iOS | Swift extensions, Asset catalogs |
| Android | XML resources, Kotlin extensions |
| React Native | JavaScript constants |

---

## 11. Resources & References

### 11.1 Official Resources

| Resource | URL |
|----------|-----|
| Airbnb Design Blog | [airbnb.design](https://airbnb.design) |
| Airbnb Engineering Blog | [airbnb.io](https://airbnb.io) |
| Lottie Documentation | [airbnb.io/lottie](https://airbnb.io/lottie) |
| Airbnb Cereal Specimen | [airbnb.design/cereal](https://airbnb.design/cereal) |

### 11.2 Open Source Projects

| Project | Description | GitHub |
|---------|-------------|--------|
| Lottie | Animation library | [airbnb/lottie-web](https://github.com/airbnb/lottie-web) |
| Visx | D3 visualization library | [airbnb/visx](https://github.com/airbnb/visx) |
| CSS Style Guide | CSS/Sass conventions | [airbnb/css](https://github.com/airbnb/css) |
| JavaScript Style Guide | JS conventions | [airbnb/javascript](https://github.com/airbnb/javascript) |

### 11.3 Community Resources

| Resource | Description |
|----------|-------------|
| [Figma Community Files](https://www.figma.com/community/search?resource_type=mixed&sort_by=relevancy&query=airbnb) | Community-created Airbnb design files |
| [DLS Case Study by Karri Saarinen](https://karrisaarinen.com/dls/) | Original DLS creator's documentation |

### 11.4 Key Articles

- [Building a Visual Language](https://medium.com/airbnb-design/building-a-visual-language-behind-the-scenes-of-our-airbnb-design-system-224748775e4e) - Behind the scenes of the DLS
- [Working Type](https://medium.com/airbnb-design/working-type-81294544608b) - Introduction of Airbnb Cereal
- [Crafting the Airbnb Cereal Typeface](https://karrisaarinen.com/posts/developing-airbnb-cereal/) - Typography development process
- [Supporting Dynamic Type at Airbnb](https://medium.com/airbnb-engineering/supporting-dynamic-type-at-airbnb-b47c68b0c998) - Accessibility implementation

---

## Appendix A: Quick Reference Card

### Colors

| Purpose | Token | Value |
|---------|-------|-------|
| Primary CTA | `--color-brand-primary` | `#FF385C` |
| Text | `--color-text-primary` | `#222222` |
| Text Secondary | `--color-text-secondary` | `#717171` |
| Border | `--color-border` | `#DDDDDD` |
| Success | `--color-success` | `#00A699` |
| Error | `--color-error` | `#FF5A5F` |

### Typography

| Purpose | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 32px | Bold | 40px |
| H2 | 24px | Bold | 32px |
| Body | 16px | Book | 24px |
| Caption | 12px | Book | 16px |

### Spacing

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Badges, small elements |
| md | 8px | Buttons, inputs |
| lg | 12px | Cards, modals |
| full | 9999px | Pills, avatars |

---

## Appendix B: Implementation Checklist

When implementing Airbnb-style designs:

- [ ] Use 8px grid system for all spacing
- [ ] Apply Airbnb Cereal font (or suitable fallback)
- [ ] Maintain minimum 4.5:1 contrast ratio for text
- [ ] Add visible focus states for keyboard navigation
- [ ] Support `prefers-reduced-motion` for animations
- [ ] Use design tokens for consistent values
- [ ] Test at 200% zoom for text resizing
- [ ] Implement responsive breakpoints (744px, 1128px, 1440px)
- [ ] Add ARIA labels for icon-only buttons
- [ ] Use semantic HTML elements

---

*This documentation is based on publicly available information and analysis of Airbnb's public-facing interfaces. Airbnb's internal DLS is not publicly available.*
