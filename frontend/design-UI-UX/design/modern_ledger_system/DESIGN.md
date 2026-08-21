---
name: Modern Ledger System
colors:
  surface: '#FFFFFF'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#525657'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  border: '#E2E8F0'
  success: '#16A34A'
  warning: '#D97706'
  danger: '#DC2626'
  bg-subtle: '#F8FAFC'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  mono-md:
    fontFamily: Courier Prime
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  sidebar-width: 256px
  topbar-height: 64px
---

## Brand & Style

The design system is engineered for a **Professional Financial SaaS** environment, prioritizing data density, clarity, and user trust. The target audience includes both individual users managing personal finances and administrators overseeing system-wide health. 

The visual direction follows a **Corporate Modern** aesthetic. It moves away from the "landing page" feel of many fintech apps, opting instead for a structured, utilitarian interface that emphasizes information architecture over decorative elements.

### Key Principles:
- **Data-First Utility:** Layouts are optimized for readability of complex tables, charts, and financial figures.
- **Reliability:** A neutral, cool-toned palette grounded by a confident primary blue evokes stability.
- **Clarity of Action:** Functional components use distinct states and color-coding (success, warning, danger) without relying on color alone—ensuring accessibility and reducing cognitive load during financial tasks.
- **Precision:** A strict 4px grid system ensures alignment and mathematical harmony across all views.

## Colors

This design system utilizes a high-contrast, professional palette designed for long-term focus. 

- **Primary Blue:** Used for primary actions, active navigation states, and brand-identifying elements.
- **Success/Warning/Danger:** These are functional semantic colors. Use `success` for positive balances and completed states, `warning` for over-budget alerts, and `danger` for deficits or destructive actions.
- **Neutral/Surface:** The system relies heavily on `#F8FAFC` for page backgrounds and pure `#FFFFFF` for cards and surface containers to create a clear "layering" effect without excessive shadows.
- **Borders:** The `#E2E8F0` border is the primary tool for structural separation, replacing heavy shadows to maintain a clean, flat appearance.

## Typography

The typography system is built exclusively on **Inter**, chosen for its exceptional legibility in data-heavy interfaces.

- **Numerical Data:** For transaction amounts in tables or KPI cards, ensure `label-md` or `label-sm` is used with tabular figures (monospaced numbers) if the font-face supports it, to ensure decimal points align vertically.
- **Visual Hierarchy:** Use `headline-lg` for page titles and `title-lg` for section headers within cards.
- **Data Labels:** Use `label-sm` with `Text Secondary (#475569)` for input labels and table headers to provide clear context without competing with the primary data.
- **Mobile Scaling:** For screens below 768px, `display-lg` should scale down to 24px and `headline-lg` to 20px.

## Layout & Spacing

The system uses a **Fixed Grid** approach for internal content containers to ensure data remains readable at common laptop resolutions (1440px).

### Layout Model:
- **Desktop (1440px):** 12-column grid. Main content area sits to the right of a fixed 256px sidebar. Standard page gutter is 32px.
- **Tablet (768px):** 8-column grid. Sidebar transitions to a collapsed icon-only state or a hidden drawer. Gutter reduces to 24px.
- **Mobile (390px):** 4-column grid. Sidebar is hidden behind a hamburger menu in the topbar. Gutter reduces to 16px. Forms reflow to a single column.

### Spacing Rhythm:
A strict 4px base is used. Components like buttons and inputs use `sm` (8px) for internal vertical padding and `md` (16px) for horizontal. Section-to-section spacing defaults to `xl` (32px) to provide adequate breathing room between charts and tables.

## Elevation & Depth

This design system prioritizes **Tonal Layers** and **Low-contrast outlines** over physical shadows. This creates a "flat-plus" aesthetic that feels modern and lightweight.

- **Background:** Uses `bg-subtle` (#F8FAFC) to create a canvas.
- **Containers/Cards:** White (#FFFFFF) surfaces with a 1px border (#E2E8F0).
- **Shadows:** Use a single "Soft Ambient" shadow style for floating elements only (Modals, Popovers, Dropdowns). 
  - *Specs:* `0px 4px 12px rgba(15, 23, 42, 0.08)`.
- **Active States:** Elements being interacted with (like a clicked Sidebar Item) use a subtle background tint of Primary (5-10% opacity) or a 2px left-border accent rather than elevation.

## Shapes

The shape language is consistently **Rounded**, providing a soft balance to the rigid data tables.

- **Standard Radius (8px):** Applied to Buttons, Input fields, and List items.
- **Large Radius (16px / rounded-lg):** Applied to Cards, KPI containers, and Modals.
- **System Icons:** Should follow a 24px bounding box with a 2px stroke weight to match the typography's visual weight.

## Components

### Buttons
- **Primary:** Background #2563EB, Text #FFFFFF. 8px radius.
- **Secondary/Ghost:** Border #E2E8F0, Text #475569. No background unless hovered.
- **Danger:** Background #DC2626, Text #FFFFFF (for final deletions).

### Data Tables
- **Header:** Background #F8FAFC, Text #475569 (uppercase, bold, 12px).
- **Cell Padding:** 12px vertical, 16px horizontal.
- **Amounts:** Always right-aligned with tabular numbers.
- **Row Hover:** Background #F8FAFC transitions.

### KPI Cards
- Large `headline-lg` for the main figure.
- A `label-sm` indicator for percentage change or status.
- Consistent 24px internal padding.

### Forms
- Labels sit above the field in `label-md`.
- Inputs have a 1px border (#E2E8F0) and 8px radius.
- Error states use #DC2626 for both the border and the helper text below the field.

### Budgets & Progress
- **Progress Bars:** 8px height, rounded. Use #16A34A (Success) for safe zones, #D97706 (Warning) for >80% limit, and #DC2626 (Danger) for exceeded budgets.