# 06 — User Workspace Screen Specification

## 1. Global User Workspace Standards
- **Layout**: Left vertical sidebar + direct content canvas (`layouts/UserLayout.html`). The top horizontal navbar is completely removed.
- **Localization**: 100% English across all UI labels, form validations, buttons, and status badges.
- **Typography & Formatting**: Inter for headings/body; JetBrains Mono for monetary figures and currency codes (`USD`).

---

## 2. Screen Specifications

### U01: User Login (`design/u01_user_login/code.html`)
- **Header**: Branded FinTrack Pro logo with "Personal Finance Portal" subtitle.
- **Form Controls**: Email Address and Password input.
- **Modifications**: Removed "Forgot password?", "Contact support", and "Remember me" per specifications.
- **CTA**: "Sign In" button with loading transition redirecting to User Dashboard.

### U02: User Dashboard (`design/u02_user_dashboard/code.html`)
- **Key Metric Hero**: Prominent Current Month Total Spending card (`$2,240.00`).
- **Primary Action CTA**: Prominent `Add New Expense` button.
- **KPI Row**: 3 key metric cards:
  1. `Total Recorded Income` ($4,500.00)
  2. `Total Recorded Expense` ($2,240.00)
  3. `Net Remaining Balance` ($2,260.00)
- **Category Spending Pie Chart**:
  - Interactive SVG Pie slices.
  - Hovering any slice dynamically reveals the **monetary amount** in a centered hover display (e.g., `$680.00 USD`).
  - Side legend clearly lists each category with its corresponding **percentage share** (e.g., `Food & Dining: 30.4%`, `Housing & Utilities: 35.7%`).
- **Sections Removed**: Budget Status section and horizontal top navbar removed.

### U03: Expense Management List (`design/u03_expense_list/code.html`)
- **Toolbar**: Search input (`⌘K`), Category filter, Date range selector, Amount sort.
- **Data Table**: Name, Category badge, Currency amount (`-$145.50`), Date, Receipt download icon, Action buttons (View, Edit, Delete).
- **Pagination**: Showing 1 to 5 of 32 transactions.

### U04: Expense Detail (`design/u04_expense_detail/code.html`)
- **Header**: Expense title, status tag, Edit & Delete action buttons.
- **Metadata**: Category, transaction date, amount ($145.50), detailed description notes.
- **Attachments**: PDF/Image receipt preview with download action.

### U04_DEL: Delete Expense Confirmation Modal (`design/u04_delete_confirmation/code.html`)
- **Modal Dialog**: Danger badge, warning banner, Cancel and permanent Delete Confirmation triggers.

### U05: Add New Expense (`design/u05_create_expense/code.html`)
- **Fields**: Expense title, Amount with currency prefix, Date picker, Category select dropdown, Notes textarea, Drag-and-drop receipt file dropzone.

### U06: Edit Expense (`design/u06_edit_expense/code.html`)
- **Fields**: Pre-filled expense form with attachment replacement options and save trigger.

### U07: Income Management List (`design/u07_income_list/code.html`)
- **Toolbar**: Search bar, Income type filter, Date range selector.
- **Data Table**: Source title, Type badge (Salary, Freelance, Dividend), Amount (`+$3,500.00`), Date, Actions.

### U07_DEL: Delete Income Confirmation (`design/u07_delete_income_confirmation/code.html`)
- **Modal Dialog**: Danger alert notice, item summary, and permanent deletion trigger.

### U08: Create / Edit Income (`design/u08_create_edit_income/code.html`)
- **Fields**: Source title, Amount, Date, Income Classification Type (Salary, Freelance, Investment, Bonus), Remarks.

### U09: Category Management List (`design/u09_category_list/code.html`)
- **Grid Layout**: Visual category cards displaying category icon, title, description, and action menus.

### U09_DEL: Delete Category Confirmation (`design/u09_delete_category_confirmation/code.html`)
- **Modal Dialog**: Danger notice warning that existing transactions will be flagged as Uncategorized upon deletion.

### U10: Create / Edit Category (`design/u10_create_edit_category/code.html`)
- **Fields**: Category Name, Icon picker grid, Description textarea.

### U11: Budget Management List (`design/u11_budget_list/code.html`)
- **Cards**: Monthly budget limits per category, progress bar percentage, spent vs limit figures, threshold warning badge for limits > 80%.

### U11_DEL: Delete Budget Confirmation (`design/u11_delete_budget_confirmation/code.html`)
- **Modal Dialog**: Warning notice that category spending threshold and progress tracking will be removed for the cycle.

### U12: Create / Edit Budget (`design/u12_create_edit_budget/code.html`)
- **Fields**: Month selector (`YYYY-MM`), Category dropdown, Monthly Budget Limit ($).

### U13: Reports & Analytics (`design/u13_reports_analytics/code.html`)
- **Period Filter**: Month, Quarter, Year selector pills.
- **Visuals**: Income vs Expense cashflow comparison bars, and Category spending distribution progress breakdown.

---

## 3. User Screen Inventory

| ID | Screen Name | Layout | Path |
|---|---|---|---|
| **U01** | User Login | `AuthLayout` | `design/u01_user_login/code.html` |
| **U02** | User Dashboard | `UserLayout` | `design/u02_user_dashboard/code.html` |
| **U03** | Expense List | `UserLayout` | `design/u03_expense_list/code.html` |
| **U04** | Expense Detail | `UserLayout` | `design/u04_expense_detail/code.html` |
| **U04_DEL** | Delete Expense Modal | Modal Overlay | `design/u04_delete_confirmation/code.html` |
| **U05** | Add New Expense | `UserLayout` | `design/u05_create_expense/code.html` |
| **U06** | Edit Expense | `UserLayout` | `design/u06_edit_expense/code.html` |
| **U07** | Income List | `UserLayout` | `design/u07_income_list/code.html` |
| **U07_DEL** | Delete Income Modal | Modal Overlay | `design/u07_delete_income_confirmation/code.html` |
| **U08** | Create / Edit Income | `UserLayout` | `design/u08_create_edit_income/code.html` |
| **U09** | Category List | `UserLayout` | `design/u09_category_list/code.html` |
| **U10** | Create / Edit Category | `UserLayout` | `design/u10_create_edit_category/code.html` |
| **U11** | Budget List | `UserLayout` | `design/u11_budget_list/code.html` |
| **U12** | Create / Edit Budget | `UserLayout` | `design/u12_create_edit_budget/code.html` |
| **U13** | Reports & Analytics | `UserLayout` | `design/u13_reports_analytics/code.html` |
