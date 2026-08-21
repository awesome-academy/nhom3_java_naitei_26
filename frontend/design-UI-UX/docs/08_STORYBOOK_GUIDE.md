# 08 — Storybook Guide

## 1. Vai trò Storybook

Storybook không thay Figma.

### Figma
Source of truth cho:
- visual language
- layout
- flow
- interaction intent

### Storybook
Source of truth cho:
- coded component behavior
- variants
- states
- isolated testing
- component documentation

---

## 2. Recommended structure

```text
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Modal/
│   │   └── ...
│   ├── layout/
│   ├── data-display/
│   └── domain/
└── stories/
```

Có thể colocate `.stories.tsx` cạnh component.

---

## 3. Story categories

```text
Foundations/
UI/
Navigation/
Data Display/
Feedback/
Forms/
Expense/
Income/
Budget/
Admin/
Patterns/
```

---

## 4. Story bắt buộc cho mỗi component

Ví dụ Button:
- Default
- Hover/focus bằng interaction test nếu phù hợp
- Loading
- Disabled
- Danger
- With icon

Input:
- Default
- Filled
- Error
- Disabled
- Required

Table:
- Normal
- Loading
- Empty
- Error
- Long content
- Pagination

---

## 5. Domain stories

### ExpenseForm
- Empty
- Filled
- ValidationError
- Editing
- UploadingAttachment

### BudgetCard
- Safe
- NearLimit
- Exceeded

### ActivityLog
- Login
- Create
- Update
- Delete

---

## 6. Recommended addons/capabilities

Tùy Next.js version và Storybook version team chọn:
- Essentials
- Accessibility
- Interaction testing
- Viewport
- Docs

Không khóa version trong design docs; frontend owner xác nhận theo codebase.

---

## 7. Viewports

Tối thiểu:
- Mobile 390
- Tablet 768
- Desktop 1440

---

## 8. Accessibility review

Storybook accessibility addon nên check:
- contrast
- missing labels
- aria
- heading order
- button names

Không coi automated a11y check là đủ; vẫn cần manual keyboard review.

---

## 9. Story naming

```text
UI/Button
Forms/ExpenseForm
Data Display/DataTable
Domain/Budget/BudgetCard
Admin/ActivityLogRow
```

---

## 10. Figma ↔ Storybook mapping

Mỗi component approved nên có:

```text
Figma component:
Button / Primary

React:
<Button variant="primary" />

Storybook:
UI/Button → Primary
```

---

## 11. Visual QA workflow

```text
Figma approved
→ Component coded
→ Storybook story
→ Compare
→ Fix spacing/color/state
→ Integrate into page
→ Page design QA
```

---

## 12. Storybook Definition of Done

- [ ] Story có title chuẩn
- [ ] Controls/args hợp lý
- [ ] States chính đầy đủ
- [ ] Responsive viewport check
- [ ] Accessibility check
- [ ] Không duplicate component
- [ ] Docs mô tả khi component phức tạp
- [ ] Match Figma approved
