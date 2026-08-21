# 01 — Information Architecture

## 1. Objectives

Structure all system capabilities into clean, distinct navigation pathways across two isolated domains:

- **User Application Workspace** (Focused on personal finance tracking, category breakdown, and analytics)
- **Admin Administration Workspace** (System oversight, global categories, budget templates, audits, and bulk data operations)

User and Admin namespaces are strictly separated with zero navigation bleed.

---

## 2. Sitemap — User Workspace

```text
/
├── /login                                (U01: User Login — no forgot password/support/remember me)
└── /app
    ├── /dashboard                        (U02: Current month spending, Category Pie Chart hover/%, KPIs, + Add Expense)
    ├── /expenses
    │   ├── /                             (U03: Expense List with filters & pagination)
    │   ├── /new                          (U05: Add New Expense Form)
    │   ├── /[expenseId]                  (U04: Expense Detail View)
    │   ├── /[expenseId]/edit             (U06: Edit Expense Form)
    │   └── /[expenseId]/delete-confirm   (U04_DEL: Delete Expense Confirmation Modal)
    ├── /incomes
    │   ├── /                             (U07: Income List with filters & pagination)
    │   ├── /new                          (U08: Add New Income Form)
    │   ├── /[incomeId]/edit              (U08: Edit Income Form)
    │   └── /[incomeId]/delete-confirm    (U07_DEL: Delete Income Confirmation Modal)
    ├── /categories
    │   ├── /                             (U09: Category List Grid)
    │   ├── /new                          (U10: Add New Category Form)
    │   └── /[categoryId]/edit            (U10: Edit Category Form)
    ├── /budgets
    │   ├── /                             (U11: Monthly Budget Tracking Cards)
    │   ├── /new                          (U12: Create Budget Limit Form)
    │   └── /[budgetId]/edit              (U12: Edit Budget Limit Form)
    └── /reports                          (U13: Reports & Analytics — Monthly/Quarterly/Yearly)
```

> **Architecture Note**: The top horizontal navbar is completely removed across all User pages. Navigation is managed exclusively via the left vertical sidebar. Import/Export data tools are consolidated in the Admin domain.

---

## 3. Sitemap — Admin Administration

```text
/admin
├── /login                                (A01: Admin Sign In — no forgot password/remember device)
├── /users                                (A03: User Management List — default Admin landing page)
│   ├── /new                              (A05: Create User Account Form)
│   ├── /[userId]                         (A04: User Account Detail View)
│   ├── /[userId]/edit                    (A05: Edit User Account Form)
│   └── /[userId]/delete-confirm          (A05_DEL: Delete User Confirmation Modal)
├── /categories
│   ├── /                                 (A06: Global System Categories List)
│   └── /new | /[categoryId]/edit         (A07: Create / Edit Category Form)
├── /budget-templates
│   ├── /                                 (A08: Budget Templates List)
│   └── /new | /[templateId]/edit         (A09: Create / Edit Budget Template with Repeatable Rows)
├── /expenses
│   ├── /                                 (A10: System-Wide Expenses List with User/Category/Date Filters)
│   └── /[expenseId]                      (A11: System Expense Detail / Edit Interface)
├── /incomes
│   ├── /                                 (A12: System-Wide Incomes List with User/Date Filters)
│   └── /[incomeId]                       (A13: System Income Edit Interface)
├── /activity-logs                        (A14: Audit Trail for Login/Logout & CRUD + Delete Log Modal)
└── /data
    ├── /import                           (A15: Bulk CSV Import for Users, Expenses, Incomes, Categories, Budgets)
    └── /export                           (A16: Bulk CSV Export for Users, Expenses, Incomes, Categories, Budgets)
```

---

## 4. Navigation Structure

### User Sidebar Navigation
1. **Dashboard** (`/app/dashboard`)
2. **Expenses** (`/app/expenses`)
3. **Incomes** (`/app/incomes`)
4. **Categories** (`/app/categories`)
5. **Budgets** (`/app/budgets`)
6. **Reports & Analytics** (`/app/reports`)

### Admin Sidebar Navigation
1. **User Management** (`/admin/users`)
2. **Global Categories** (`/admin/categories`)
3. **Budget Templates** (`/admin/budget-templates`)
4. **System Expenses** (`/admin/expenses`)
5. **System Incomes** (`/admin/incomes`)
6. **Activity Logs** (`/admin/activity-logs`)
7. **Import CSV Data** (`/admin/data/import`)
8. **Export CSV Data** (`/admin/data/export`)

---

## 5. UI/UX Principles
- **Aesthetic Excellence**: Vibrant Tailwind palette (`#004ac6` primary, `#2563eb` interactive, `#F8FAFC` background), JetBrains Mono for monetary numerals, Material Symbols Outlined.
- **English Localization**: 100% of labels, tooltips, validation messages, and actions are localized into English.
- **Direct Layout Flow**: Vertical sidebar + direct content canvas without redundant top headers.
