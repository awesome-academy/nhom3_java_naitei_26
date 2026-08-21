---
name: Pro Ledger System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e1e7ff'
  surface-container-highest: '#dae2fc'
  on-surface: '#131b2e'
  on-surface-variant: '#434654'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#1b55d0'
  primary: '#003594'
  on-primary: '#ffffff'
  primary-container: '#004ac6'
  on-primary-container: '#b8c8ff'
  inverse-primary: '#b4c5ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d2e1fa'
  on-secondary-container: '#556379'
  tertiary: '#3a3e3f'
  on-tertiary: '#ffffff'
  tertiary-container: '#515556'
  on-tertiary-container: '#c6caca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#e0e3e4'
  tertiary-fixed-dim: '#c4c7c8'
  on-tertiary-fixed: '#181c1d'
  on-tertiary-fixed-variant: '#434748'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fc'
  success: '#16A34A'
  warning: '#D97706'
  danger: '#DC2626'
  border: '#E2E8F0'
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
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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

This design system is engineered for **Professional Financial SaaS** environments, where data density and precision are paramount. The brand personality is grounded, authoritative, and clinical, designed to evoke a sense of absolute reliability and clarity. It targets financial controllers, administrators, and power users who require efficient workflows over decorative flourishes.

The visual direction follows a **Corporate Modern** aesthetic. It utilizes a structured, utilitarian interface that prioritizes information architecture through a "flat-plus" lens—relying on crisp borders and intentional whitespace rather than heavy shadows or gradients. The system is designed to handle complex tables and multi-step financial processes without overwhelming the user.

## Colors

The palette is anchored by a high-contrast, professional range of cool tones. 

- **Primary Blue:** Reserved for primary actions, critical interactive states, and brand identifiers.
- **Functional/Semantic:** `success`, `warning`, and `danger` are used strictly for financial status and system feedback (e.g., `success` for positive balances, `danger` for deficits or destructive actions).
- **Surface Strategy:** The system uses `bg-subtle` (#F8FAFC) for the canvas and pure `#FFFFFF` for content containers to create clear structural separation.
- **Borders:** The primary method for defining space is the `#E2E8F0` border, maintaining a lightweight and modern appearance.

## Typography

The typography system is built exclusively on **Inter** to ensure maximum legibility across data-heavy dashboards.

- **VND Formatting:** All currency values must be formatted as VND (e.g., 1.000.000 ₫). Numerical data in tables and KPI cards should utilize `tnum` (tabular figures) to ensure vertical decimal alignment.
- **Visual Hierarchy:** Use `headline-lg` for primary page headers and `title-lg` for card-level headers. 
- **Data Labels:** Use `label-sm` with a secondary text color for input labels and table headers to ensure the primary data remains the focal point.

## Layout & Spacing

This design system uses a **Fixed Grid** approach for internal content containers to optimize for 1440px laptop displays.

- **Desktop (1440px+):** 12-column grid with a fixed 256px sidebar and 32px page gutters.
- **Tablet (768px - 1024px):** 8-column grid with a collapsed icon-only sidebar and 24px gutters.
- **Mobile (<768px):** 4-column grid with a hidden sidebar accessible via hamburger menu. Gutters are reduced to 16px.

Spacing follows a strict 4px rhythm. Horizontal internal padding for major components (inputs, buttons) defaults to `md` (16px), while vertical spacing between distinct layout sections defaults to `xl` (32px).

## Elevation & Depth

The system conveys hierarchy through **Tonal Layers** and **Low-contrast outlines** rather than traditional elevation.

- **Z-Axis Strategy:** Page backgrounds use `bg-subtle`, while interactive containers (Cards, Modals) use pure White with a 1px `border`.
- **Active Navigation:** Selected states in the sidebar or tabs are indicated by a 2px vertical Primary accent or a subtle background tint (5-10% Primary) rather than a shadow.
- **Floating Elements:** Modals and dropdowns use a single soft ambient shadow: `0px 4px 12px rgba(15, 23, 42, 0.08)`.

## Shapes

The shape language uses a **Rounded** (8px) base to balance the clinical nature of the data. 

- **Standard (8px):** Applied to buttons, inputs, and list items.
- **Large (16px):** Reserved for primary content containers, KPI cards, and modals.
- **Icons:** Use a 24px bounding box with a 2px stroke weight to maintain visual parity with Inter's medium weight.

## Components

### Sidebar & Admin Footer
The sidebar must include a fixed **Admin User Footer**. This footer should be separated by a 1px border-top, featuring the user's avatar, name, and role in `label-sm`, with a logout/settings action. It remains visible regardless of sidebar scroll depth.

### Buttons
- **Primary:** Background `#2563EB`, Text `#FFFFFF`. 8px radius. Used for the main call to action.
- **Danger:** Background `#DC2626`, Text `#FFFFFF`. Reserved strictly for destructive, irreversible actions (e.g., Delete Account, Void Transaction).
- **Secondary:** Border `#E2E8F0`, Text `#475569`. Used for neutral or cancel actions.

### Data Tables
- **Alignment:** Financial figures must be right-aligned. Text-based data is left-aligned.
- **Formatting:** All currency cells must use VND formatting with tabular numbers.
- **Styling:** Header background `#F8FAFC`, 12px padding, with 1px bottom border.

### Forms & Inputs
- **Inputs:** 1px border `#E2E8F0`, 8px radius. Focused state uses a 1px Primary border.
- **Labels:** Positioned above the field using `label-md` for maximum clarity.

### KPI Cards
- Feature a `headline-lg` figure for the primary metric and a `label-sm` indicator for trend or status. All monetary figures follow the VND formatting rule.