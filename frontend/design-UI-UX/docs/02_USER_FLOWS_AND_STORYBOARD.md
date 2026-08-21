# 02 — User Flows & Storyboard

## 1. Mục tiêu

Tài liệu này mô tả:
- flow nghiệp vụ
- điểm quyết định
- trạng thái UI
- storyboard cho các hành trình chính

Storyboard ở đây dùng cho **UX planning**. Storybook dùng cho **component development** và được mô tả riêng.

---

# A. USER FLOWS

## 2. Login

```text
Open Login
→ Enter credentials
→ Submit
→ Loading
→ [Valid] Dashboard
→ [Invalid] Error message
```

State cần thiết:
- Default
- Field validation
- Submitting
- Invalid credential
- Server error

---

## 3. Add Expense

```text
Dashboard / Expenses
→ Add new expense
→ Fill fields
   - name
   - amount
   - date
   - category
   - note
   - attachment
→ Validate
→ Submit
→ Success
→ Expense Detail hoặc Expense List
```

### Decision points
- Category đã tồn tại?
- File attachment hợp lệ?
- Amount > 0?
- Date hợp lệ?

### UX requirement
Sau khi lưu thành công phải có feedback rõ:
- toast
- redirect
- dữ liệu mới hiển thị ngay

---

## 4. Search / Filter Expense

```text
Expenses
→ Enter keyword
→ Select date range/category/amount
→ Apply
→ Update results
→ Pagination
→ Open detail
```

Filter state phải nhìn thấy và có `Clear filters`.

---

## 5. Edit / Delete Expense

```text
Expense Detail
→ Edit
→ Modify data
→ Save
→ Success

Expense Detail
→ Delete
→ Confirmation dialog
→ Confirm
→ Delete
→ Back to list
```

Không xóa trực tiếp bằng một click.

---

## 6. Manage Income

```text
Income List
→ Search/filter
→ Add/Edit/Delete
→ Success feedback
```

Filter theo requirement:
- month
- income type

---

## 7. Manage Category

```text
Category List
→ Add Category
→ Input:
   - name
   - description
   - icon
→ Save
```

Delete cần confirmation và phải dự trù trường hợp category đang được tham chiếu.

> Hành vi backend khi category đang được sử dụng chưa được tài liệu gốc định nghĩa; UI chỉ cần có error state cho trường hợp không thể xóa.

---

## 8. Budget

```text
Budget List
→ Add Budget
→ Select month/category
→ Enter amount
→ Save
→ Track usage
→ [Exceeded] Warning
```

Các trạng thái budget:
- Safe
- Near limit
- Exceeded

Ngưỡng “near limit” là quyết định product, chưa có trong requirement.

---

## 9. Reports & Analytics

```text
Reports
→ Select period:
   Month / Quarter / Year
→ Apply
→ Show:
   - category distribution
   - income vs expense
   - spending trend
→ Export nếu chức năng report export được team mở rộng
```

Không mặc định thêm report export ngoài scope CSV đã định nghĩa.

---

## 10. Import CSV

```text
Import
→ Select entity
→ Upload CSV
→ Validate file
→ Preview / validation result
→ Confirm import
→ Importing
→ Summary
```

Recommended UX:
- total rows
- valid rows
- invalid rows
- downloadable error report nếu backend hỗ trợ

Requirement gốc chỉ yêu cầu import CSV, chưa xác định preview/error report.

---

## 11. Export CSV

```text
Export
→ Select entity
→ Select filter/range nếu có
→ Generate
→ Download CSV
```

---

# B. ADMIN FLOWS

## 12. User Management

```text
Admin Users
→ Search/filter status
→ Open user profile
→ Create/Edit/Delete
```

Create fields theo requirement:
- Name
- Email
- Role
- Active status

Delete phải confirmation.

---

## 13. Global Category Management

```text
Admin Categories
→ Add
→ Name
→ Description
→ Type: expense/income
→ Save
```

---

## 14. Budget Template

```text
Budget Templates
→ Create template
→ Name
→ Month
→ Add default category + amount rows
→ Save
```

Nên dùng repeatable rows trong form.

---

## 15. System Expense / Income

Admin có quyền:
- list toàn hệ thống
- filter theo requirement
- detail
- edit
- delete

UI phải làm rõ “Owner/User” của record.

---

## 16. Activity Log

```text
Activity Logs
→ View logs
→ Filter/search nếu team cho phép
→ Open detail nếu cần
→ Delete log
```

Fields:
- Time
- Action
- Actor
- Description

---

# C. STORYBOARD

## 17. Storyboard 01 — User ghi lại một khoản chi

| Step | Scene | User action | UI response |
|---|---|---|---|
| 1 | Dashboard | Nhận thấy cần ghi khoản chi mới | Nút Add new expense nổi bật |
| 2 | Add Expense | Nhập thông tin | Validation realtime ở mức hợp lý |
| 3 | Attachment | Thêm ảnh hóa đơn | Hiển thị file preview/name |
| 4 | Submit | Bấm Save | Button loading, chống double submit |
| 5 | Success | Chờ phản hồi | Toast success |
| 6 | Detail | Kiểm tra dữ liệu | Record vừa tạo hiển thị đầy đủ |

---

## 18. Storyboard 02 — User kiểm tra ngân sách

| Step | Scene | User action | UI response |
|---|---|---|---|
| 1 | Dashboard | Xem tình hình tháng | KPI + budget warning |
| 2 | Budgets | Mở danh sách | Progress theo từng budget |
| 3 | Budget Detail/Edit | Kiểm tra limit | Amount spent/remaining |
| 4 | Over budget | Vượt mức | Warning rõ + trạng thái màu/icon/text |

---

## 19. Storyboard 03 — User phân tích chi tiêu

| Step | Scene | User action | UI response |
|---|---|---|---|
| 1 | Reports | Mở analytics | Default period |
| 2 | Period Filter | Chọn quý/năm | Chart refresh |
| 3 | Category Distribution | Quan sát category | Legend + tooltip |
| 4 | Income vs Expense | So sánh | Chart + totals |
| 5 | Trend | Xem xu hướng | Time-series chart |

---

## 20. Storyboard 04 — Admin xử lý user

| Step | Scene | Admin action | UI response |
|---|---|---|---|
| 1 | Users | Lọc theo status | Table update |
| 2 | User Detail | Mở hồ sơ | Show role/status |
| 3 | Edit | Đổi role/status | Form validation |
| 4 | Save | Xác nhận | Success state |
| 5 | Audit | Mở Activity Logs | Có log thay đổi nếu backend ghi đúng requirement |

---

# D. FLOW CHECKLIST

Mỗi flow phải có:

- [ ] Entry point
- [ ] Main path
- [ ] Alternative path
- [ ] Validation
- [ ] Error state
- [ ] Success feedback
- [ ] Back/cancel behavior
- [ ] Permission consideration
- [ ] Responsive behavior
