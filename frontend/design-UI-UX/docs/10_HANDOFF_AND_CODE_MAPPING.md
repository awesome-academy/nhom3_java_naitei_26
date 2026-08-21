# 10 — Design Handoff & Code Mapping

## 1. Mục tiêu

Frontend không phải “đoán” thiết kế.

---

# 2. Mapping cấu trúc

Suggested:

```text
Figma Foundations
→ Tailwind theme/tokens

Figma Components
→ src/components

Figma Patterns
→ reusable composites

Figma User Screens
→ app/(user)

Figma Admin Screens
→ app/admin
```

Route thực tế phải theo codebase được team FE chốt.

---

# 3. Design token mapping

Ví dụ:

```text
Figma variable: color/bg/page
→ Tailwind: bg-slate-50 hoặc semantic token

Figma: radius/card = 12
→ rounded-xl

Figma: spacing/24
→ p-6 / gap-6
```

Ưu tiên semantic token/class abstraction nếu brand thay đổi.

---

# 4. Component mapping table

| Figma | React suggestion |
|---|---|
| Button | `<Button />` |
| Input | `<Input />` |
| Select | `<Select />` |
| FilterBar | `<FilterBar />` |
| StatCard | `<StatCard />` |
| DataTable | `<DataTable />` |
| ConfirmDialog | `<ConfirmDialog />` |
| ExpenseForm | `<ExpenseForm />` |
| BudgetCard | `<BudgetCard />` |
| ChartCard | `<ChartCard />` |

---

# 5. API-aware UI states

Mỗi screen phải map:
- loading
- success
- empty
- validation error
- server error

Với Spring Boot response wrapper:

```json
{
  "status": 200,
  "message": "Thành công",
  "data": {}
}
```

Frontend phải hiển thị message có chọn lọc; không show raw backend technical error.

---

# 6. Form validation ownership

Frontend:
- immediate format/required validation

Backend:
- source of truth cho business validation

UI phải hỗ trợ field-level backend error nếu API format cho phép.

---

# 7. Pagination contract

Figma cần thể hiện:
- current page
- total
- page size nếu có

SRS/API docs phải định nghĩa chính xác response pagination.

---

# 8. Filter contract

Không thiết kế filter mà API không hỗ trợ production.

Expense:
- search
- date
- category
- amount

Income:
- search
- month
- type

Admin User:
- status

Admin Expense:
- user
- category
- date range

Admin Income:
- user
- date range

---

# 9. Chart data contract

Trước khi code:
- xác định endpoint
- labels
- period
- aggregation
- currency
- empty behavior

Không để frontend tự aggregate khối dữ liệu lớn nếu backend có thể cung cấp report endpoint.

---

# 10. Attachment contract

Cần team backend chốt:
- allowed mime types
- max size
- upload endpoint
- download URL
- authentication
- deletion behavior

Figma giữ state generic trước khi contract hoàn thiện.

---

# 11. Handoff package

Mỗi feature handoff gồm:
- Figma link/frame
- flow
- screen states
- component list
- responsive notes
- a11y notes
- data/API fields
- edge cases

---

# 12. Change management

Nếu code khác Figma vì technical constraint:
1. FE ghi issue.
2. Designer review.
3. Chốt quyết định.
4. Update Figma.
5. Update design decision log.

Không để production trở thành “bản khác” mà Figma vẫn cũ.
