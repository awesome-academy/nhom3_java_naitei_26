# FinTrack Pro — Frontend Component & Layout Directory

This directory provides production-ready component blueprints and structural layouts designed for rapid conversion into **Next.js + TypeScript + Tailwind CSS** components or Storybook stories.

---

## 1. Directory Structure

```text
├── layouts/
│   ├── UserLayout.html       # User workspace shell (Sidebar + main canvas, no top horizontal navbar)
│   ├── AdminLayout.html      # Admin workspace shell (Admin sidebar + canvas, no top horizontal navbar)
│   └── AuthLayout.html       # Minimalist centered authentication layout
│
├── components/
│   ├── button/
│   │   └── Buttons.html      # Primary, Secondary, Danger, Outline, Loading, Icon buttons
│   ├── search/
│   │   └── SearchBar.html    # Standalone SearchBar and Filter Toolbar Bar
│   ├── table/
│   │   └── DataTable.html    # Responsive Data Table with headers, badges, action menus, pagination
│   ├── form/
│   │   └── FormControls.html # Text, Currency input, Select, Textarea, File upload
│   ├── modal/
│   │   └── DeleteConfirmModal.html # Accessible Delete confirmation dialog with warning context
│   ├── card/
│   │   └── StatCard.html     # KPI summary cards with upward/downward delta indicators
│   ├── chart/
│   │   └── PieChart.html     # Interactive Category Spending Pie Chart (monetary hover & side %)
│   ├── navigation/
│   │   └── BreadcrumbAndPagination.html # Breadcrumb trails and pagination controls
│   ├── feedback/
│   │   └── ToastAndAlerts.html # Toasts (success/error), warning banners, status badges
│   └── footer/
│       └── Footer.html       # Global bottom footer
```

---

## 2. Design Tokens & Color Palette

| Token Name | Hex Code | Tailwind Class / CSS Variable | Usage |
|---|---|---|---|
| **Primary** | `#004ac6` | `bg-primary`, `text-primary` | Brand accents, primary CTA, active navigation |
| **Primary Container** | `#2563eb` | `bg-primary-container` | Buttons, highlighted containers |
| **Primary Light** | `#eff4ff` | `bg-primary-light` | Active background pills, soft highlights |
| **Surface** | `#ffffff` | `bg-surface`, `bg-white` | Cards, table containers, modals |
| **Background Subtle** | `#f8fafc` | `bg-bg-subtle` | Page canvas background |
| **Border** | `#e2e8f0` | `border-border` | Subtle division borders, input outlines |
| **Danger / Destructive** | `#dc2626` | `bg-danger`, `text-danger` | Delete actions, error toasts, expense values |
| **Success** | `#16a34a` | `bg-success`, `text-success` | Income values, confirmed states |
| **Warning** | `#d97706` | `bg-warning`, `text-warning` | Over-budget alerts, pending items |
| **Text Main** | `#131b2e` | `text-on-background` | Headings, titles, monetary values |
| **Text Secondary** | `#515f74` | `text-secondary` | Labels, subtitles, table headers |

---

## 3. Typography & Icons
- **Font**: Inter (`400`, `500`, `600`, `700`)
- **Monospace**: JetBrains Mono (`font-mono`) for monetary amounts and currency figures.
- **Icons**: Google Material Symbols Outlined (`<span class="material-symbols-outlined">icon_name</span>`).
