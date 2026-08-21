# 05 — Reusable UI Components & Layouts Specification

## 1. Overview & Directory Structure

To ensure seamless frontend implementation, the design system provides modular, reusable components and layout templates organized under `/components/` and `/layouts/`.

```text
├── layouts/
│   ├── UserLayout.html          (Standard user layout: Left vertical sidebar + main canvas)
│   ├── AdminLayout.html         (Admin layout: Admin badge, Admin navigation sidebar + main canvas)
│   └── AuthLayout.html          (Centered authentication wrapper for sign-in screens)
│
└── components/
    ├── navigation/              (Breadcrumb, pagination, and navigation links)
    ├── footer/                  (Standardized bottom metadata footer)
    ├── search/                  (Search bar with ⌘K badge and multi-filter toolbar)
    ├── button/                  (Primary, Secondary, Outline, Danger, Icon, and Loading states)
    ├── table/                   (Data table with status badge pills, currency formatting, actions)
    ├── form/                    (Input, currency input, select dropdown, textarea, dropzone)
    ├── modal/                   (Accessible delete confirmation dialogs)
    ├── card/                    (KPI metric summary cards with trend indicators)
    ├── chart/                   (Category Spending Pie Chart with hover amounts & side % legend)
    └── feedback/                (Success/error toast notifications and warning banners)
```

---

## 2. Layout Specifications

### `UserLayout.html`
- **Sidebar**: Vertical left sidebar with FinTrack logo, navigation links (Dashboard, Expenses, Incomes, Categories, Budgets, Reports), and user account profile.
- **Header**: No top horizontal navbar; clean page header directly in the main canvas.
- **Canvas**: Responsive padded container (`max-w-7xl`).

### `AdminLayout.html`
- **Sidebar**: Vertical left sidebar with dark admin badge, navigation links (Users, Categories, Budget Templates, Expenses, Incomes, Activity Logs, Import CSV, Export CSV), and admin account profile.
- **Canvas**: Responsive padded container with breadcrumbs and action buttons.

### `AuthLayout.html`
- **Container**: Centered card layout with branded logo, subtitle, form fields, and subtle footer.

---

## 3. Core Component Specs

### 1. Button (`components/button/Buttons.html`)
- **Variants**: `Primary` (`bg-primary`), `Secondary` (`bg-slate-100`), `Outline` (`border-border`), `Danger` (`bg-danger`), `Icon` (`p-2 rounded-lg`), `Loading` (animated spinner).
- **Sizes**: Small (`py-1.5 px-3`), Medium (`py-2.5 px-4`), Large (`py-3 px-6`).

### 2. Search & Filter Bar (`components/search/SearchBar.html`)
- **Search**: Input with search icon and keyboard shortcut badge (`⌘K`).
- **Filters**: Role, Category, Status, Date range selects with instant reset trigger.

### 3. Data Table (`components/table/DataTable.html`)
- **Columns**: Entity name, classification badge, currency figure (JetBrains Mono), date, action menu.
- **States**: Default, hover row, loading skeleton, empty state.

### 4. Form Controls (`components/form/FormControls.html`)
- **Currency Input**: Prefixed with `$`, monospace font, right-aligned currency ISO indicator (`USD`).
- **Select**: Tailwind styled select with chevron icon.
- **Dropzone**: Drag-and-drop file upload with format guidance.

### 5. Category Pie Chart (`components/chart/PieChart.html`)
- **SVG Pie**: Interactive slices with distinct hex colors (`#004ac6`, `#0284c7`, `#10b981`, `#f59e0b`, `#8b5cf6`).
- **Hover Action**: Hovering slice reveals exact monetary currency expenditure (e.g., `$680.00 USD`).
- **Side Legend**: Clean percentage shares (e.g., `30.4%`, `23.2%`) displayed alongside category title and color swatch.

### 6. Modal Dialog (`components/modal/DeleteConfirmModal.html`)
- **Elements**: Danger icon, entity title, permanent deletion warning banner, Cancel and Confirm Delete buttons.
