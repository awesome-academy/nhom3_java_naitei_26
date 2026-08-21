# FinTrack Pro — UI/UX Design System & Screen Gallery

> **Live Demo Gallery**: [https://nguyentrungnghia1802.github.io/Sun_Mock_Project_UI_UX_Design/](https://nguyentrungnghia1802.github.io/Sun_Mock_Project_UI_UX_Design/)  
> Complete enterprise UI/UX design architecture and interactive prototype gallery for the **Expense Management System (FinTrack Pro)**. Designed for direct frontend development in **Next.js + TypeScript + Tailwind CSS** backed by **Java Spring Boot REST APIs**.

---

## 1. Project Overview & Architectural Highlights

- **100% English Localization**: Fully standardized English terminology across all User screens, Admin consoles, component libraries, and documentation.
- **Modular Component & Layout System**:
  - `layouts/`: `UserLayout`, `AdminLayout`, `AuthLayout`.
  - `components/`: `navigation`, `footer`, `search`, `button`, `table`, `form`, `modal`, `card`, `chart`, `feedback`.
- **User Side Architecture**:
  - Top horizontal navigation bar removed across all pages (left vertical sidebar navigation).
  - User Login without "Forgot password?", "Contact support", or "Remember me".
  - User Dashboard featuring **Current Month Total Spending**, **Key Performance Indicators** (Income, Expense, Balance), and an interactive **Category Spending Pie Chart** with monetary hover reveal and side percentage legend.
  - CRUD modules for Expenses, Incomes, Categories, Budgets, and Reports.
- **Admin Side Architecture**:
  - Dedicated administrative portal with dark accents and pink `ADMIN` badge.
  - Admin Dashboard removed (default landing points directly to **User Management**).
  - Admin Login without "Forgot password?" or "Remember this device".
  - Dedicated **Delete User Confirmation Modal**.
  - New Admin Modules: **Global Categories (CRUD)**, **Budget Templates (CRUD with dynamic repeatable rows)**, **System Expenses (Master audit & filter)**, **System Incomes (Master audit & filter)**, **Activity Logs (Authentication & CRUD audit trail with delete log purge)**, **Bulk CSV Import**, and **Bulk CSV Export**.

---

## 2. Directory Structure

```text
├── index.html                           (Interactive Design Gallery & Device Simulator)
├── layouts/                             (Reusable Workspace Layout Templates)
│   ├── UserLayout.html
│   ├── AdminLayout.html
│   └── AuthLayout.html
├── components/                          (Modular Frontend Component Library)
│   ├── button/                          (Buttons, icon buttons, loading spinners)
│   ├── search/                          (Search bar with ⌘K badge and filter toolbars)
│   ├── table/                           (Data tables with badges and pagination)
│   ├── form/                            (Currency inputs, select, dropzone upload)
│   ├── modal/                           (Accessible delete confirmation dialogs)
│   ├── card/                            (KPI summary cards with trend badges)
│   ├── chart/                           (Interactive Category Spending Pie Chart)
│   ├── feedback/                        (Toasts and alert banners)
│   ├── navigation/                      (Breadcrumbs and pagination)
│   ├── footer/                          (Standardized footer)
│   └── README.md                        (Frontend developer integration guide)
├── design/                              (27 Live Screen Implementations)
│   ├── u01_user_login/
│   ├── u02_user_dashboard/
│   ├── u03_expense_list/
│   ├── u04_expense_detail/
│   ├── u04_delete_confirmation/
│   ├── u05_create_expense/
│   ├── u06_edit_expense/
│   ├── u07_income_list/
│   ├── u07_delete_income_confirmation/
│   ├── u08_create_edit_income/
│   ├── u09_category_list/
│   ├── u10_create_edit_category/
│   ├── u11_budget_list/
│   ├── u12_create_edit_budget/
│   ├── u13_reports_analytics/
│   ├── a01_admin_login/
│   ├── a03_admin_user_list/
│   ├── a04_admin_user_detail/
│   ├── a05_create_edit_user/
│   ├── a05_delete_user_confirmation/
│   ├── a06_admin_category_list/
│   ├── a07_create_edit_category/
│   ├── a08_budget_template_list/
│   ├── a09_create_edit_budget_template/
│   ├── a10_system_expense_list/
│   ├── a11_system_expense_detail/
│   ├── a12_system_income_list/
│   ├── a13_system_income_edit/
│   ├── a14_activity_logs/
│   ├── a15_admin_import_data/
│   └── a16_admin_export_data/
└── docs/                                (Specifications & Architecture Documentation)
    ├── 01_INFORMATION_ARCHITECTURE.md
    ├── 04_DESIGN_SYSTEM.md
    ├── 05_COMPONENT_SPEC.md
    ├── 06_USER_SCREEN_SPEC.md
    └── 07_ADMIN_SCREEN_SPEC.md
```

---

## 3. Screen Inventory (27 Screens)

| ID | Title | Domain | Path |
|---|---|---|---|
| **U01** | User Login | User | [`design/u01_user_login/code.html`](file:///design/u01_user_login/code.html) |
| **U02** | User Dashboard | User | [`design/u02_user_dashboard/code.html`](file:///design/u02_user_dashboard/code.html) |
| **U03** | Expense List | User | [`design/u03_expense_list/code.html`](file:///design/u03_expense_list/code.html) |
| **U04** | Expense Detail | User | [`design/u04_expense_detail/code.html`](file:///design/u04_expense_detail/code.html) |
| **U04_DEL** | Delete Expense Confirmation | User | [`design/u04_delete_confirmation/code.html`](file:///design/u04_delete_confirmation/code.html) |
| **U05** | Add New Expense | User | [`design/u05_create_expense/code.html`](file:///design/u05_create_expense/code.html) |
| **U06** | Edit Expense | User | [`design/u06_edit_expense/code.html`](file:///design/u06_edit_expense/code.html) |
| **U07** | Income List | User | [`design/u07_income_list/code.html`](file:///design/u07_income_list/code.html) |
| **U07_DEL** | Delete Income Confirmation | User | [`design/u07_delete_income_confirmation/code.html`](file:///design/u07_delete_income_confirmation/code.html) |
| **U08** | Create / Edit Income | User | [`design/u08_create_edit_income/code.html`](file:///design/u08_create_edit_income/code.html) |
| **U09** | Category List | User | [`design/u09_category_list/code.html`](file:///design/u09_category_list/code.html) |
| **U10** | Create / Edit Category | User | [`design/u10_create_edit_category/code.html`](file:///design/u10_create_edit_category/code.html) |
| **U11** | Budget List | User | [`design/u11_budget_list/code.html`](file:///design/u11_budget_list/code.html) |
| **U12** | Create / Edit Budget | User | [`design/u12_create_edit_budget/code.html`](file:///design/u12_create_edit_budget/code.html) |
| **U13** | Reports & Analytics | User | [`design/u13_reports_analytics/code.html`](file:///design/u13_reports_analytics/code.html) |
| **A01** | Admin Login | Admin | [`design/a01_admin_login/code.html`](file:///design/a01_admin_login/code.html) |
| **A03** | User Management List | Admin | [`design/a03_admin_user_list/code.html`](file:///design/a03_admin_user_list/code.html) |
| **A04** | User Account Detail | Admin | [`design/a04_admin_user_detail/code.html`](file:///design/a04_admin_user_detail/code.html) |
| **A05** | Create / Edit User | Admin | [`design/a05_create_edit_user/code.html`](file:///design/a05_create_edit_user/code.html) |
| **A05_DEL** | Delete User Confirmation | Admin | [`design/a05_delete_user_confirmation/code.html`](file:///design/a05_delete_user_confirmation/code.html) |
| **A06** | Global Categories List | Admin | [`design/a06_admin_category_list/code.html`](file:///design/a06_admin_category_list/code.html) |
| **A07** | Create / Edit Global Category | Admin | [`design/a07_create_edit_category/code.html`](file:///design/a07_create_edit_category/code.html) |
| **A08** | Budget Templates List | Admin | [`design/a08_budget_template_list/code.html`](file:///design/a08_budget_template_list/code.html) |
| **A09** | Create / Edit Budget Template | Admin | [`design/a09_create_edit_budget_template/code.html`](file:///design/a09_create_edit_budget_template/code.html) |
| **A10** | System Expenses List | Admin | [`design/a10_system_expense_list/code.html`](file:///design/a10_system_expense_list/code.html) |
| **A11** | System Expense Detail / Edit | Admin | [`design/a11_system_expense_detail/code.html`](file:///design/a11_system_expense_detail/code.html) |
| **A12** | System Incomes List | Admin | [`design/a12_system_income_list/code.html`](file:///design/a12_system_income_list/code.html) |
| **A13** | System Income Edit | Admin | [`design/a13_system_income_edit/code.html`](file:///design/a13_system_income_edit/code.html) |
| **A14** | System Activity Logs | Admin | [`design/a14_activity_logs/code.html`](file:///design/a14_activity_logs/code.html) |
| **A15** | Bulk CSV Import | Admin | [`design/a15_admin_import_data/code.html`](file:///design/a15_admin_import_data/code.html) |
| **A16** | Bulk CSV Export | Admin | [`design/a16_admin_export_data/code.html`](file:///design/a16_admin_export_data/code.html) |

---

## 4. Design System Tokens & Tech Stack

- **Framework Compatibility**: Next.js 14+ (App Router), Tailwind CSS v3.4+, Java Spring Boot REST API
- **Color Palette**:
  - `primary`: `#004ac6`
  - `primary-container`: `#2563eb`
  - `primary-light`: `#eff4ff`
  - `secondary`: `#515f74`
  - `background`: `#faf8ff`
  - `bg-subtle`: `#F8FAFC`
  - `surface`: `#FFFFFF`
  - `border`: `#E2E8F0`
  - `danger`: `#DC2626`
  - `success`: `#16A34A`
  - `warning`: `#D97706`
- **Typography**: `Inter` (sans-serif) & `JetBrains Mono` (monospace figures)
- **Icons**: Google Material Symbols Outlined

---

**Author**: Nguyen Trung Nghia  
**License**: MIT / Proprietary for Mock Project