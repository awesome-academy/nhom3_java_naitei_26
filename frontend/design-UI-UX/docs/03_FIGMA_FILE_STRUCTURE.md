# 03 — Figma File Structure

## 1. Mục tiêu

Figma phải đủ sạch để:
- designer tìm nhanh
- developer inspect dễ
- review không lạc
- component không bị duplicate

---

## 2. Pages đề xuất

```text
00 — Cover
01 — Foundations
02 — Components
03 — Patterns
04 — User Flows
05 — User Screens
06 — Admin Flows
07 — Admin Screens
08 — Responsive
09 — Prototype
10 — Archive
```

---

## 3. Cover page

Bao gồm:
- Project name
- Version
- Owner
- Status
- Last updated
- Links:
  - requirement
  - repo
  - Storybook
  - API docs
  - Jira/Redmine nếu có

---

## 4. Foundations page

Sections:
1. Color
2. Typography
3. Spacing
4. Radius
5. Shadow
6. Grid
7. Iconography
8. Data visualization tokens

---

## 5. Components page

Nhóm component:

### Primitives
- Button
- IconButton
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Badge
- Avatar
- Tooltip

### Navigation
- SidebarItem
- Sidebar
- Topbar
- Breadcrumb
- Pagination
- Tabs

### Data Display
- StatCard
- DataTable
- TableRow
- EmptyState
- KeyValue
- FileAttachment
- ProgressBar
- ChartLegend

### Feedback
- Toast
- Alert
- Modal
- ConfirmDialog
- Skeleton
- Spinner
- ErrorState

### Domain
- ExpenseCard
- IncomeCard
- BudgetCard
- CategoryChip
- TransactionRow
- ActivityLogRow
- FilterBar

---

## 6. Naming convention

### Components

```text
Button / Primary / Default
Button / Primary / Hover
Button / Secondary / Default
Input / Text / Default
Input / Text / Error
Badge / Status / Active
```

Ưu tiên Variant thay vì tạo hàng chục component rời.

### Frames

```text
USER / Dashboard / Desktop
USER / Expenses / List / Desktop
USER / Expenses / Create / Desktop
ADMIN / Users / List / Desktop
ADMIN / Users / Detail / Desktop
```

---

## 7. Figma variables

Tạo collections:

### `Core`
- spacing
- radius
- sizing

### `Semantic`
- bg
- surface
- text
- border
- primary
- success
- warning
- danger
- info

### `Theme`
Nếu chưa có Dark Mode requirement:
- chỉ tạo Light Theme
- không thiết kế Dark Mode chỉ để “trông xịn”

---

## 8. Auto Layout rules

Bắt buộc:
- Component dùng Auto Layout.
- Page content dùng vertical Auto Layout.
- Toolbar có wrap strategy.
- Card grid dùng responsive layout logic.
- Không dùng absolute positioning cho layout chính.

Absolute chỉ dùng hợp lý cho:
- badge overlay
- decorative element
- icon inside control

---

## 9. Desktop frame

Khuyến nghị:
- Base desktop: `1440 × 1024`
- Sidebar: `240–256px`
- Topbar: `64–72px`
- Main content max width: tùy page, khoảng `1180–1280px`
- Page gutter: `24–32px`

---

## 10. Mobile frame

Khuyến nghị:
- `390 × 844`

Tablet:
- `768 × 1024`

---

## 11. Prototype organization

Prototype chỉ nối các flow chính:
- Login
- Add Expense
- Edit/Delete Expense
- Add Income
- Budget warning
- Report filtering
- Admin User CRUD
- Import CSV

Không cần prototype mọi pagination button.

---

## 12. Archive

Khi frame cũ không còn dùng:
- chuyển sang `10 — Archive`
- ghi version/date
- không xóa ngay nếu đang trong review

---

## 13. Review labels

Dùng status label trên section:
- Draft
- In Review
- Approved
- Implemented
- Deprecated

---

## 14. Handoff rule

Chỉ frame `Approved` mới dùng để code production.
