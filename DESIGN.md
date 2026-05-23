---
name: Precision Logic Automotive
colors:
  surface: '#fbf8fd'
  surface-dim: '#dbd9de'
  surface-bright: '#fbf8fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f7'
  surface-container: '#efedf2'
  surface-container-high: '#eae7ec'
  surface-container-highest: '#e4e1e6'
  on-surface: '#1b1b1f'
  on-surface-variant: '#45464f'
  inverse-surface: '#303034'
  inverse-on-surface: '#f2f0f5'
  outline: '#767680'
  outline-variant: '#c6c5d0'
  surface-tint: '#4f5c8e'
  primary: '#000f3f'
  on-primary: '#ffffff'
  primary-container: '#172554'
  on-primary-container: '#808dc2'
  inverse-primary: '#b7c4fd'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#250e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#431f00'
  on-tertiary-container: '#bb835a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4fd'
  on-primary-fixed: '#071747'
  on-primary-fixed-variant: '#374475'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#f9b98b'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#673c18'
  background: '#fbf8fd'
  on-background: '#1b1b1f'
  surface-variant: '#e4e1e6'
typography:
  display:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  gutter: 16px
---

## Brand & Style
The design system is engineered for the high-intensity environment of automotive service centers. It prioritizes utility, clarity, and reliability. The aesthetic is **Enterprise Minimalism**: a focus on high information density without visual clutter. 

The system evokes a sense of technical competence and structural integrity. It utilizes a restrained color palette and generous white space to ensure that critical data—such as vehicle diagnostics, technician schedules, and inventory levels—remains the focal point. The interface is intentionally "quiet" to reduce cognitive load during complex multitasking.

## Colors
The palette is anchored by **Deep Navy (#172554)**, signaling authority and institutional stability. This is complemented by a range of Slates for secondary UI elements and borders.

**Semantic Status Tones:**
- **Finished/Ready:** Soft Mint background with Forest Green text.
- **In Progress:** Pale Amber background with Ochre text.
- **Urgent/Blocked:** Soft Rose background with Crimson text.

All text-on-background combinations must meet or exceed WCAG AA (4.5:1) contrast ratios. The background uses a subtle Slate-50 tint to reduce screen glare during long shifts.

## Typography
This design system utilizes **Inter** exclusively to leverage its exceptional legibility in data-heavy environments. 

**Hierarchical Strategy:**
- Use **Semibold (600)** for page titles and primary card headings to create a clear visual anchor.
- Use **Medium (500)** for form labels and table headers to distinguish them from input data.
- Use **13px (body-sm)** for dense data tables and sidebars to maximize vertical space without sacrificing readability.
- Monospaced numerals (tabular figures) should be used for VIN numbers, part IDs, and currency to ensure vertical alignment in lists.

## Layout & Spacing
The layout follows a **structured 12-column fixed grid** for desktop, centering the content at a maximum width of 1440px. 

**Spacing Principles:**
- **Density:** Use a 4px baseline grid. Padding within data tables should be tight (8px vertical) to allow more rows to be visible above the fold.
- **Sidebars:** A fixed 240px left-hand navigation is standard for enterprise-level module switching.
- **Grouping:** Use 24px (lg) margins between distinct functional sections (e.g., Vehicle Info vs. Service History).
- **Mobile:** On small screens, the layout reflows to a single column with 16px horizontal safe-area margins.

## Elevation & Depth
Depth is communicated through **Low-contrast Outlines** rather than aggressive shadows. This maintains the "clean" minimalist aesthetic.

- **Level 0 (Background):** Slate-50 (#f8fafc). Used for the main application canvas.
- **Level 1 (Surfaces):** White (#ffffff) with a 1px border of Slate-200. Used for cards and primary content containers.
- **Level 2 (Interactive):** White (#ffffff) with a 1px border of Slate-300 and a `shadow-sm` (subtle 2px blur, 5% opacity black). Used for buttons and dropdowns on hover.
- **Level 3 (Overlay):** Used for modals. Employs a 20% opacity Slate-900 backdrop blur to focus the user's attention.

## Shapes
The shape language is professional and controlled. 

- **Primary Radius:** 0.375rem (6px) for standard components like buttons, input fields, and small cards. This offers a "softened" professional look that is modern but not overly casual.
- **Large Radius:** 0.5rem (8px) for primary layout containers and modal windows.
- **Pill Radius:** Used exclusively for status badges (chips) to distinguish them from clickable buttons.

## Components

### Buttons
- **Primary:** Deep Navy background, white text. No gradient. 
- **Secondary:** White background, Slate-200 border, Deep Navy text.
- **Tertiary/Ghost:** No background or border, Slate-600 text. Use for less frequent actions like "Cancel."

### Input Fields
- Labels must be placed above the input field using `label-md` styling.
- Default state: 1px Slate-200 border. 
- Focus state: 1px Deep Navy border with a subtle 2px outer glow (Primary color at 10% opacity).

### Data Tables
- Header row: Slate-50 background, `label-md` text styling, bottom border 2px Slate-200.
- Rows: 1px Slate-100 bottom border. Hover state: Slate-50 background transition.

### Chips (Status Badges)
- Use the semantic color palette defined in the Colors section.
- Text should be `label-sm` and centered. 
- Padding: 2px top/bottom, 8px left/right.

### KPI Cards
- White surface, `shadow-sm`, 1px Slate-200 border. 
- Large numeric value (H2) paired with a `label-md` descriptor.

### Accessibility Note
All interactive elements must have a visible `:focus-visible` state. Ensure all icons have associated `aria-label` attributes for screen readers.
