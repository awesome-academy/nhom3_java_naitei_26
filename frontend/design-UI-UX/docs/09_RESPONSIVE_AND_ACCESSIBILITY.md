# 09 — Responsive & Accessibility

# 1. Breakpoints

Đề xuất tương thích Tailwind:

- `sm`: 640
- `md`: 768
- `lg`: 1024
- `xl`: 1280
- `2xl`: 1536

Design frames chính:
- 390 mobile
- 768 tablet
- 1440 desktop

---

# 2. Sidebar behavior

Desktop:
- fixed left sidebar

Tablet:
- collapsed hoặc drawer

Mobile:
- hidden
- open bằng menu button
- overlay drawer

Focus phải được trap đúng trong drawer nếu component behavior cần.

---

# 3. Dashboard responsive

Desktop:
- KPI 4 columns
- charts 2 columns

Tablet:
- KPI 2 columns
- charts 1–2 columns

Mobile:
- KPI stack
- chart full width
- legend wrap

---

# 4. Table responsive

Không horizontal-scroll vô hạn nếu có thể tránh.

Mobile strategies:
- transaction list card
- show 3–4 data points chính
- action menu
- filter drawer

Admin table có thể cần controlled horizontal scroll vì dữ liệu nhiều.

---

# 5. Form responsive

Desktop:
- 2 columns cho related fields
- full width cho note/file

Mobile:
- 1 column

Actions:
- desktop right aligned
- mobile sticky footer nếu form dài

---

# 6. Touch targets

Minimum recommended:
- 44×44px cho touch interaction

Icon button phải có accessible label.

---

# 7. Keyboard

Phải dùng được:
- Tab
- Shift+Tab
- Enter/Space
- Escape cho modal/dropdown

Không tạo custom control không hỗ trợ keyboard.

---

# 8. Focus state

Focus ring visible.

Không dùng:
```css
outline: none;
```
nếu không có replacement tương đương.

---

# 9. Forms

Mỗi input:
- visible label
- error association
- required indicator
- helper text khi cần

Placeholder không thay label.

---

# 10. Contrast

Target:
- WCAG AA

Text nhỏ:
- contrast tối thiểu 4.5:1

Large text:
- 3:1

---

# 11. Charts accessibility

Chart phải có:
- title
- legend
- accessible summary hoặc data alternative nếu có thể
- không phụ thuộc duy nhất màu

---

# 12. Motion

Animation:
- 150–250ms cho microinteraction
- không dùng motion lớn không cần thiết

Respect reduced motion khi frontend triển khai.

---

# 13. Error language

Tốt:
- “Amount must be greater than 0.”

Không tốt:
- “Invalid input.”

---

# 14. Destructive actions

Delete:
- confirmation
- entity context
- danger styling
- cancel dễ thấy

---

# 15. Accessibility checklist

- [ ] Heading hierarchy
- [ ] Form labels
- [ ] Focus visible
- [ ] Keyboard navigation
- [ ] Contrast
- [ ] Touch target
- [ ] Modal focus
- [ ] Alt/file descriptions
- [ ] Chart alternative
- [ ] Error linked to field
