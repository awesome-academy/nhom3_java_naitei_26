# MASTER DESIGN SPECIFICATION — FINTRACK PRO

## 1. Objectives & Scope
- Comprehensive multi-screen UI/UX design architecture for **FinTrack Pro (Modern Financial SaaS)**.
- Strictly UI/UX focused — clean design system tokens, responsive viewports, accessible interactions, with zero backend logic alterations.
- Isolated namespaces: **User Workspace** and **Admin Administration**.
- Optimized for seamless frontend translation into **Next.js + TypeScript**, **Tailwind CSS**, and **Java Spring Boot REST APIs**.
- **100% English Localization** across all screens, modals, components, and documentation.

---

## 2. Visual Direction & Design Tokens
- **Design Philosophy**: Modern financial SaaS, clean hierarchy, data-first typography, micro-interactions, and accessible contrast.
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
- **Typography**:
  - Headings & Interface: `Inter`
  - Currency Numerals & Financial Figures: `JetBrains Mono`
- **Icons**: Google Material Symbols Outlined (`<span class="material-symbols-outlined">...</span>`).

---

## 3. Modular Architecture: Layouts & Components

### Layout Templates (`layouts/`)
- `UserLayout.html`: Left vertical sidebar + direct canvas without horizontal top navbar.
- `AdminLayout.html`: Left vertical sidebar with pink `ADMIN` badge, admin navigation, and direct canvas.
- `AuthLayout.html`: Centered branded authentication layout.

### Reusable Components (`components/`)
- `navigation/`: Breadcrumbs, pagination, sidebar links.
- `footer/`: Standardized metadata footer.
- `search/`: Search bar with `⌘K` badge and filter toolbar.
- `button/`: Primary, Secondary, Danger, Outline, Icon, and Loading button states.
- `table/`: Data table with badge pill, currency formatting, action buttons, pagination.
- `form/`: Text input, currency input, select, textarea, dropzone upload.
- `modal/`: Accessible delete confirmation dialogs.
- `card/`: KPI metric summary cards with trend indicators.
- `chart/`: Interactive SVG category spending pie chart (monetary hover display, side `%` legend).
- `feedback/`: Success/error toast notifications and warning banners.

---

## 4. User Workspace Specification

### Navigation:
1. **Dashboard** (`u02_user_dashboard`)
2. **Expenses** (`u03_expense_list`)
3. **Incomes** (`u07_income_list`)
4. **Categories** (`u09_category_list`)
5. **Budgets** (`u11_budget_list`)
6. **Reports & Analytics** (`u13_reports_analytics`)

### User Screen Rules:
- **No Top Horizontal Navbar**: All navigation is anchored in the left vertical sidebar.
- **U01 User Login**: Removed "Forgot password?", "Contact support", and "Remember me".
- **U02 User Dashboard**:
  - Prominent Current Month Total Spending ($2,240.00).
  - KPI Row (Total Recorded Income, Total Recorded Expense, Net Remaining Balance).
  - Interactive **Category Spending Pie Chart**:
    - Hovering any slice reveals the monetary amount (e.g., `$680.00 USD`).
    - Side legend displays the exact percentage share (e.g., `30.4%`, `23.2%`).
  - CTA: `Add New Expense`.
  - Removed Budget Status section.
- **U03–U13**: Expense CRUD, Income CRUD, Category CRUD, Budget tracking, and Period Reports.

---

## 5. Admin Administration Specification

### Navigation:
1. **User Management** (`a03_admin_user_list`) — *Default Admin landing*
2. **Global Categories** (`a06_admin_category_list`)
3. **Budget Templates** (`a08_budget_template_list`)
4. **System Expenses** (`a10_system_expense_list`)
5. **System Incomes** (`a12_system_income_list`)
6. **Activity Logs** (`a14_activity_logs`)
7. **Import CSV Data** (`a15_admin_import_data`)
8. **Export CSV Data** (`a16_admin_export_data`)

### Admin Screen Rules:
- **Admin Dashboard Removed**: Removed `a02_admin_dashboard`; default landing points directly to `a03_admin_user_list`.
- **A01 Admin Login**: Removed "Forgot password?" and "Remember this device".
- **A03–A05 & A05_DEL**: User CRUD with dedicated Delete Confirmation Modal.
- **A06–A07**: Global Categories (Expense / Income type selector, icon picker, description).
- **A08–A09**: Budget Templates (dynamic repeatable category rows, default amounts, add/remove row triggers, total sum preview).
- **A10–A11**: System-wide Expenses across all users (User, Category, Date range filters, ownership context, detail view & edit).
- **A12–A13**: System-wide Incomes across all users (User and Date range filters, ownership context, edit interface).
- **A14**: Activity Logs (audits Login/Logout, CRUD on 5 entities + Delete log action and purge modal).
- **A15**: Bulk CSV Import (User, Expense, Income, Category, Budget).
- **A16**: Bulk CSV Export (User overview/expenses/incomes, System Expenses, Incomes, Categories & Budgets).

---

## 6. Complete Screen Inventory (27 Screens)

| ID | Title | Domain | Path |
|---|---|---|---|
| **U01** | User Login | User | `design/u01_user_login/code.html` |
| **U02** | User Dashboard | User | `design/u02_user_dashboard/code.html` |
| **U03** | Expense List | User | `design/u03_expense_list/code.html` |
| **U04** | Expense Detail | User | `design/u04_expense_detail/code.html` |
| **U04_DEL** | Delete Expense Modal | User | `design/u04_delete_confirmation/code.html` |
| **U05** | Add New Expense | User | `design/u05_create_expense/code.html` |
| **U06** | Edit Expense | User | `design/u06_edit_expense/code.html` |
| **U07** | Income List | User | `design/u07_income_list/code.html` |
| **U07_DEL** | Delete Income Modal | User | `design/u07_delete_income_confirmation/code.html` |
| **U08** | Create / Edit Income | User | `design/u08_create_edit_income/code.html` |
| **U09** | Category List | User | `design/u09_category_list/code.html` |
| **U10** | Create / Edit Category | User | `design/u10_create_edit_category/code.html` |
| **U11** | Budget List | User | `design/u11_budget_list/code.html` |
| **U12** | Create / Edit Budget | User | `design/u12_create_edit_budget/code.html` |
| **U13** | Reports & Analytics | User | `design/u13_reports_analytics/code.html` |
| **A01** | Admin Login | Admin | `design/a01_admin_login/code.html` |
| **A03** | User Accounts List | Admin | `design/a03_admin_user_list/code.html` |
| **A04** | User Account Detail | Admin | `design/a04_admin_user_detail/code.html` |
| **A05** | Create / Edit User | Admin | `design/a05_create_edit_user/code.html` |
| **A05_DEL** | Delete User Modal | Admin | `design/a05_delete_user_confirmation/code.html` |
| **A06** | Global Categories List | Admin | `design/a06_admin_category_list/code.html` |
| **A07** | Create / Edit Category | Admin | `design/a07_create_edit_category/code.html` |
| **A08** | Budget Templates List | Admin | `design/a08_budget_template_list/code.html` |
| **A09** | Create / Edit Budget Template | Admin | `design/a09_create_edit_budget_template/code.html` |
| **A10** | System Expenses List | Admin | `design/a10_system_expense_list/code.html` |
| **A11** | System Expense Detail / Edit | Admin | `design/a11_system_expense_detail/code.html` |
| **A12** | System Incomes List | Admin | `design/a12_system_income_list/code.html` |
| **A13** | System Income Edit | Admin | `design/a13_system_income_edit/code.html` |
| **A14** | System Activity Logs | Admin | `design/a14_activity_logs/code.html` |
| **A15** | Bulk CSV Import | Admin | `design/a15_admin_import_data/code.html` |
| **A16** | Bulk CSV Export | Admin | `design/a16_admin_export_data/code.html` |
