# 07 — Admin Administration Screen Specification

## 1. Global Admin Administration Standards
- **Layout**: Left vertical sidebar + direct content canvas (`layouts/AdminLayout.html`). The top horizontal navbar is completely removed across all Admin screens.
- **Admin Indicators**: Pink `ADMIN` badge, dark theme accents, and strict administrative audit notice.
- **Default Landing**: Admin Dashboard has been removed; upon authentication, administrators land on **A03: User Management List**.
- **Localization**: 100% English across all UI labels, form controls, table headers, and modal dialogs.

---

## 2. Screen Specifications

### A01: Admin Sign In (`design/a01_admin_login/code.html`)
- **Theme**: Dark administrative aesthetic (`slate-900` to `indigo-950`).
- **Form Controls**: Admin Email and Master Password.
- **Modifications**: Removed "Forgot password?" and "Remember this device" per specifications.
- **CTA**: "Authorize & Sign In" button with loading indicator redirecting to `../a03_admin_user_list/code.html`.

### A03: User Management List (`design/a03_admin_user_list/code.html`)
- **Toolbar**: User search bar, Status filter (Active / Suspended), Role filter (Standard User / Financial Manager / Administrator).
- **Data Table**: Member profile with avatar, Role badge, Status pill, Joined Date, Actions (View Detail, Edit, Delete).
- **Pagination**: Showing 1 to 3 of 86 registered users.

### A04: User Account Detail (`design/a04_admin_user_detail/code.html`)
- **Profile Header**: User avatar, full name, email, active badge, Edit and Delete action triggers.
- **Metadata Grid**: System Role, Registration Date, Last Login Timestamp & IP.
- **Financial Overview**: Recorded Total Spending ($2,240.00) and Recorded Total Income ($4,500.00).

### A05: Create / Edit User Account (`design/a05_create_edit_user/code.html`)
- **Fields**: Full Name, Email Address, Role selection (User, Manager, Admin), Account Status (Active, Suspended).

### A05_DEL: Delete User Confirmation Modal (`design/a05_delete_user_confirmation/code.html`)
- **Modal Dialog**: Danger header, target user identification, data cascade warning, Cancel and Delete triggers.

### A06: Global Categories List (`design/a06_admin_category_list/code.html`)
- **Toolbar**: Category search input and Classification Type filter (All, Expense Only, Income Only).
- **Data Table**: Category title with icon, Classification badge (Expense / Income), Description, System Usage count, Actions.

### A06_DEL: Delete Global Category Confirmation (`design/a06_delete_category_confirmation/code.html`)
- **Modal Dialog**: Danger alert warning that 1,420+ linked user transactions will be flagged as Uncategorized across the platform.

### A07: Create / Edit Global Category (`design/a07_create_edit_category/code.html`)
- **Fields**: Category Name, Classification Type (Radio cards for Expense vs Income), System Icon selector, Description textarea.

### A08: Budget Templates List (`design/a08_budget_template_list/code.html`)
- **Cards Grid**: Template title, target month, default category allocation breakdown (Food, Housing, Transport, Shopping), total calculated budget sum, Edit & Delete actions.

### A08_DEL: Delete Budget Template Confirmation (`design/a08_delete_budget_template_confirmation/code.html`)
- **Modal Dialog**: Confirmation dialog to permanently delete a system budget template.

### A09: Create / Edit Budget Template (`design/a09_create_edit_budget_template/code.html`)
- **Header**: Template Name and Default Target Month.
- **Dynamic Repeatable Rows**:
  - Category selector dropdown.
  - Default allocated amount ($).
  - Add Category Row button (+).
  - Remove Row button (x).
- **Calculated Total**: Real-time sum calculation preview banner.

### A10: System Expenses List (`design/a10_system_expense_list/code.html`)
- **Advanced Toolbar**: Search bar, User account filter dropdown, Category filter, Date range filter.
- **Data Table**: User ownership avatar & ID (`USR-1042`), Expense Title, Category badge, Amount (`-$145.50`), Date, Actions.

### A10_DEL: Delete System Expense Confirmation (`design/a10_delete_system_expense_confirmation/code.html`)
- **Modal Dialog**: Administrative confirmation dialog for deleting an expense record from user ledger.

### A11: System Expense Detail / Edit (`design/a11_system_expense_detail/code.html`)
- **Owner Banner**: Prominent user ownership card with user ID and email.
- **Fields**: Expense title, Amount, Date, Category, User notes, Receipt attachment preview & download, Delete modal trigger.

### A12: System Incomes List (`design/a12_system_income_list/code.html`)
- **Toolbar**: Search bar, User account filter, Date range filter.
- **Data Table**: User ownership avatar & ID, Income Source Title, Type badge, Amount (`+$3,500.00`), Date, Actions.

### A12_DEL: Delete System Income Confirmation (`design/a12_delete_system_income_confirmation/code.html`)
- **Modal Dialog**: Administrative confirmation dialog for deleting an income record from user balance.

### A13: System Income Edit (`design/a13_system_income_edit/code.html`)
- **Owner Banner**: User ownership details.
- **Fields**: Source title, Amount, Date, Classification type, Transaction notes, Delete modal trigger.

### A14: System Activity Logs (`design/a14_activity_logs/code.html`)
- **Automated Audit Tracking**:
  - Authentication events: `LOGIN`, `LOGOUT` (User & Admin).
  - CRUD operations: `CREATE`, `UPDATE`, `DELETE` across `Expense`, `Income`, `Category`, `Budget`, and `User`.
- **Data Table**: Timestamp, Action badge, Actor profile (Admin / User), Event description, Clear Old Logs trigger.

### A14_DEL: Clear Activity Logs Confirmation (`design/a14_clear_activity_logs_confirmation/code.html`)
- **Modal Dialog**: Confirmation dialog to purge historical system audit activity logs older than 90 days.

### A15: Bulk CSV Import (`design/a15_admin_import_data/code.html`)
- **Entity Selector**: Radio cards for User, Expense, Income, Category, and Budget.
- **CSV Dropzone**: Drag-and-drop file upload with CSV template download link.
- **Validation Table**: Real-time parsed rows preview table with column validation indicators.

### A16: Bulk CSV Export (`design/a16_admin_export_data/code.html`)
- **Dataset Selector**:
  - `User Accounts Dataset` (overview, spending, income totals)
  - `System Expenses Dataset` (category, amount, date, notes)
  - `System Incomes Dataset` (source, type, amount, date)
  - `Categories & Budgets Dataset` (thresholds, targets, templates)
- **Filters**: Date range scope and CSV format trigger.

---

## 3. Admin Screen Inventory

| ID | Screen Name | Layout | Path |
|---|---|---|---|
| **A01** | Admin Login | `AuthLayout` | `design/a01_admin_login/code.html` |
| **A03** | User Management List | `AdminLayout` | `design/a03_admin_user_list/code.html` |
| **A04** | User Account Detail | `AdminLayout` | `design/a04_admin_user_detail/code.html` |
| **A05** | Create / Edit User | `AdminLayout` | `design/a05_create_edit_user/code.html` |
| **A05_DEL** | Delete User Modal | Modal Overlay | `design/a05_delete_user_confirmation/code.html` |
| **A06** | Global Categories (CRUD) | `AdminLayout` | `design/a06_admin_category_list/code.html` |
| **A06_DEL** | Delete Global Category | Modal Overlay | `design/a06_delete_category_confirmation/code.html` |
| **A07** | Create / Edit Category | `AdminLayout` | `design/a07_create_edit_category/code.html` |
| **A08** | Budget Templates | `AdminLayout` | `design/a08_budget_template_list/code.html` |
| **A08_DEL** | Delete Budget Template | Modal Overlay | `design/a08_delete_budget_template_confirmation/code.html` |
| **A09** | Create / Edit Template | `AdminLayout` | `design/a09_create_edit_budget_template/code.html` |
| **A10** | System Expenses | `AdminLayout` | `design/a10_system_expense_list/code.html` |
| **A10_DEL** | Delete System Expense | Modal Overlay | `design/a10_delete_system_expense_confirmation/code.html` |
| **A11** | System Expense Detail / Edit | `AdminLayout` | `design/a11_system_expense_detail/code.html` |
| **A12** | System Incomes | `AdminLayout` | `design/a12_system_income_list/code.html` |
| **A12_DEL** | Delete System Income | Modal Overlay | `design/a12_delete_system_income_confirmation/code.html` |
| **A13** | System Income Edit | `AdminLayout` | `design/a13_system_income_edit/code.html` |
| **A14** | System Activity Logs | `AdminLayout` | `design/a14_activity_logs/code.html` |
| **A14_DEL** | Clear Activity Logs | Modal Overlay | `design/a14_clear_activity_logs_confirmation/code.html` |
| **A15** | Bulk CSV Import | `AdminLayout` | `design/a15_admin_import_data/code.html` |
| **A16** | Bulk CSV Export | `AdminLayout` | `design/a16_admin_export_data/code.html` |
