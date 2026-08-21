# 13 — Design Decision Log

> Ghi lại các quyết định để tránh “mỗi người nhớ một kiểu”.

## Template

```md
### DDL-XXX — Decision title

**Date:** YYYY-MM-DD  
**Status:** Proposed / Approved / Rejected / Superseded  
**Owner:**  
**Related:** Figma / Ticket / PR

#### Context
...

#### Decision
...

#### Why
...

#### Impact
...

#### Follow-up
...
```

---

## DDL-001 — Separate User and Admin navigation

**Status:** Approved by requirement

### Context
Hệ thống yêu cầu Client layout và Admin namespace/layout riêng.

### Decision
Thiết kế hai navigation configuration riêng, dùng chung design language.

### Impact
- Figma có User Screens/Admin Screens riêng.
- Frontend có layout riêng.
- Component primitives vẫn dùng chung.

---

## DDL-002 — Data-first dashboard style

**Status:** Proposed

### Decision
Dùng visual language clean, professional, ưu tiên KPI, table và chart; hạn chế decoration.

### Why
Sản phẩm là hệ thống quản lý tài chính/chi tiêu và CRUD-heavy.

---

## DDL-003 — Storybook for reusable coded components

**Status:** Proposed

### Decision
Component reusable phải được thể hiện trong Storybook khi frontend implement.

### Why
Giảm divergence giữa Figma và code, hỗ trợ review state độc lập.

---

## DDL-004 — Mobile table becomes list where practical

**Status:** Proposed

### Decision
Các table User như Expenses/Incomes chuyển thành transaction list/card trên mobile.

Admin table có thể horizontal scroll khi số cột không thể giản lược.

### Why
Tăng usability trên 390px.
