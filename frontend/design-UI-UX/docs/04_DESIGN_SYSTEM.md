# 04 — Design System

## 1. Design direction

Phong cách:
- Modern financial dashboard
- Professional
- Clean
- Data-first
- Ít decoration
- Tập trung readability

Không nên:
- gradient quá nhiều
- glassmorphism nặng
- animation gây nhiễu
- card hóa mọi thứ
- dùng quá nhiều màu category trên toàn UI

---

# 2. Color System

> Giá trị dưới đây là design proposal, có thể điều chỉnh khi team chốt branding.

## Neutral
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Surface subtle: `#F1F5F9`
- Border: `#E2E8F0`
- Text primary: `#0F172A`
- Text secondary: `#475569`
- Text muted: `#64748B`

## Brand
- Primary 600: `#2563EB`
- Primary 700: `#1D4ED8`
- Primary 50: `#EFF6FF`

## Semantic
- Success: `#16A34A`
- Warning: `#D97706`
- Danger: `#DC2626`
- Info: `#0284C7`

### Rules
- Income: success semantic.
- Expense: danger hoặc neutral emphasis tùy ngữ cảnh.
- Remaining balance: primary/neutral.
- Warning budget: warning.
- Over budget: danger.

Không dùng success/danger chỉ bằng màu; luôn đi kèm icon/text.

---

# 3. Typography

Recommended font:
- `Inter`

Fallback:
```css
Inter, ui-sans-serif, system-ui, sans-serif
```

Scale:

| Token | Size | Line height | Weight | Use |
|---|---:|---:|---:|---|
| Display | 32 | 40 | 700 | Dashboard headline |
| H1 | 28 | 36 | 700 | Page title |
| H2 | 22 | 30 | 600 | Section |
| H3 | 18 | 26 | 600 | Card title |
| Body | 14 | 22 | 400 | Default |
| Body strong | 14 | 22 | 600 | Emphasis |
| Small | 12 | 18 | 400 | Metadata |
| Label | 13 | 18 | 500 | Form label |

Money values có thể dùng tabular numbers nếu font hỗ trợ.

---

# 4. Spacing

Base unit: `4px`

Tokens:
- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48
- 64

Rules:
- Input internal: 12–16
- Card padding: 20–24
- Page section gap: 24–32
- Form field gap: 16–20

---

# 5. Radius

- Small: 6
- Medium: 8
- Large: 12
- Card: 12
- Pill: 999

Tránh radius quá lớn cho table và form enterprise.

---

# 6. Shadow

Chỉ 2–3 level:
- subtle
- dropdown
- modal

Card chính ưu tiên border nhẹ thay vì shadow nặng.

---

# 7. Grid

Desktop:
- 12 columns
- gutter 24
- margins 32

Dashboard:
- KPI: 4 cards / row ở desktop
- charts: 2-column
- recent transaction: full-width hoặc 2/3

Tablet:
- KPI 2 columns

Mobile:
- 1 column

---

# 8. Iconography

Recommended:
- Lucide Icons

Quy ước:
- 16px inline
- 20px controls
- 24px navigation
- stroke nhất quán

Category icon có thể do user chọn từ whitelist.

---

# 9. Form controls

Height:
- Small: 36
- Default: 40
- Large: 44

State:
- Default
- Hover
- Focus
- Filled
- Disabled
- Error
- Success nếu thực sự cần

Focus ring rõ, không bỏ outline mà không thay thế.

---

# 10. Buttons

Variants:
- Primary
- Secondary
- Ghost
- Danger
- Link

Sizes:
- sm
- md
- lg

State:
- Default
- Hover
- Active
- Focus
- Loading
- Disabled

Rule:
- Một vùng action chỉ nên có một primary action.

---

# 11. Tables

Header:
- sticky nếu list dài
- font medium
- contrast đủ

Cell:
- amount căn phải
- date thống nhất format
- action column cố định

Recommended columns — Expense:
- Name
- Category
- Amount
- Date
- Note/indicator
- Attachment indicator
- Actions

Mobile:
- không ép table desktop xuống 390px
- chuyển thành transaction cards/list rows

---

# 12. Charts

Chart types:
- Category distribution: donut/pie hoặc bar
- Income vs Expense: grouped bar / line
- Spending trend: line chart
- Budget usage: progress/bar

Rules:
- Có legend
- Có tooltip
- Không phụ thuộc màu duy nhất
- Trục rõ
- Format tiền thống nhất
- Empty state khi không có dữ liệu

---

# 13. Financial number formatting

Display proposal:
- `12,500,000 ₫` hoặc `12.500.000 ₫`

Chọn một convention duy nhất cho toàn dự án.

Negative:
- `-500,000 ₫`

Không nên chỉ dùng màu đỏ để thể hiện số âm.

---

# 14. Date formatting

Chọn một convention:
- `08/08/2026`
hoặc
- `08 Aug 2026`

Trong table nên ngắn.
Trong detail có thể đầy đủ hơn.

---

# 15. Status vocabulary

User:
- Active / Inactive
- Within budget
- Near budget
- Over budget

Import:
- Pending
- Validating
- Ready
- Importing
- Completed
- Failed

Không tạo status nếu backend không có dữ liệu tương ứng.
