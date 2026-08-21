# 11 — Design QA Checklist

## A. Requirement Coverage

- [ ] Login/logout User
- [ ] User Dashboard
- [ ] Expense list/detail/CRUD
- [ ] Expense pagination
- [ ] Expense search
- [ ] Expense filters
- [ ] Attachment UI
- [ ] Income list/CRUD
- [ ] Income pagination/search/filter
- [ ] Category CRUD
- [ ] Budget CRUD
- [ ] Budget warning
- [ ] Reports month/quarter/year
- [ ] Category distribution
- [ ] Income vs expense
- [ ] Spending trend
- [ ] Admin login/logout
- [ ] Admin user CRUD
- [ ] Admin category CRUD
- [ ] Budget template CRUD
- [ ] Admin expense CRUD
- [ ] Admin income CRUD
- [ ] Activity log
- [ ] CSV import
- [ ] CSV export

---

## B. Layout

- [ ] Spacing theo token
- [ ] Không alignment lệch
- [ ] Header consistent
- [ ] Sidebar consistent
- [ ] Max width hợp lý
- [ ] Không overflow ngoài ý muốn

---

## C. Typography

- [ ] H1/H2/H3 đúng hierarchy
- [ ] Money readable
- [ ] Text muted không quá nhạt
- [ ] Không dùng quá nhiều font weight

---

## D. Components

- [ ] Không duplicate button
- [ ] Input dùng cùng component
- [ ] Filter consistent
- [ ] Table consistent
- [ ] Modal consistent
- [ ] Toast consistent
- [ ] Icon set consistent

---

## E. States

Mỗi màn phù hợp phải kiểm tra:
- [ ] Default
- [ ] Hover
- [ ] Focus
- [ ] Loading
- [ ] Empty
- [ ] Error
- [ ] Success
- [ ] Disabled
- [ ] Destructive confirmation

---

## F. Responsive

- [ ] 1440
- [ ] 768
- [ ] 390
- [ ] Sidebar mobile
- [ ] Table mobile
- [ ] Form mobile
- [ ] Chart mobile
- [ ] Modal mobile

---

## G. Accessibility

- [ ] Contrast
- [ ] Focus
- [ ] Label
- [ ] Keyboard
- [ ] Error message
- [ ] Icon label
- [ ] Color not sole signal

---

## H. Data realism

- [ ] Có tên dài
- [ ] Có note dài
- [ ] Có amount lớn
- [ ] Có empty value
- [ ] Có nhiều categories
- [ ] Có pagination > 1 page
- [ ] Có long email
- [ ] Có failed state

Không chỉ mock data “đẹp”.

---

## I. Design vs Code QA

Sau khi FE implement:
- [ ] page padding
- [ ] typography
- [ ] colors
- [ ] border/radius
- [ ] component heights
- [ ] table spacing
- [ ] modal
- [ ] mobile
- [ ] loading
- [ ] empty
- [ ] validation
- [ ] chart
- [ ] browser basic check

---

## J. Release Gate

Không sign-off nếu:
- critical flow bị thiếu
- delete không confirm
- form không có error state
- mobile unusable
- table overflow vỡ layout
- component không nhất quán
- Figma và code khác lớn
