# UI/UX Design Documentation — Expense Management System

> Bộ tài liệu thiết kế giao diện cho **Hệ thống Quản lý Chi tiêu**.  
> Mục tiêu: biến yêu cầu nghiệp vụ thành một hệ thống thiết kế có thể triển khai trực tiếp bằng **Next.js + TypeScript + Tailwind CSS**, đồng thời quản lý component bằng **Storybook** và bàn giao rõ ràng cho Frontend.

---

## 1. Phạm vi

Bộ tài liệu bao phủ:

- Information Architecture / Sitemap.
- User flows và storyboard theo các luồng nghiệp vụ chính.
- Figma file architecture.
- Design System.
- Component specification.
- User screens.
- Admin screens.
- Responsive behavior.
- Accessibility.
- Storybook strategy.
- Design → Code handoff.
- Design QA.
- Design roadmap và Definition of Done.

## 2. Nguồn yêu cầu

Thiết kế được xây dựng từ tài liệu yêu cầu dự án hiện tại, bao gồm:

### User
- Authentication.
- Dashboard.
- Expense Management.
- Income Management.
- Category Management.
- Budget Management.
- Report & Analytics.
- Import / Export CSV.

### Admin
- Authentication.
- User Management.
- Global Category Management.
- Budget Template Management.
- System Expense Management.
- System Income Management.
- Activity Log.
- Import / Export CSV.

### Technical context
- Web application.
- Frontend: Next.js + Tailwind CSS.
- Backend: Java Spring Boot.
- RESTful API.
- MySQL.
- Docker.
- Client và Admin có layout/namespace riêng.

## 3. Cấu trúc tài liệu

| File | Mục đích |
|---|---|
| `01_INFORMATION_ARCHITECTURE.md` | Sitemap, navigation, route map |
| `02_USER_FLOWS_AND_STORYBOARD.md` | User flow + storyboard nghiệp vụ |
| `03_FIGMA_FILE_STRUCTURE.md` | Cấu trúc file Figma, page/frame/component |
| `04_DESIGN_SYSTEM.md` | Token, typography, color, spacing, layout |
| `05_COMPONENT_SPEC.md` | Spec component dùng lại |
| `06_USER_SCREEN_SPEC.md` | Spec toàn bộ màn User |
| `07_ADMIN_SCREEN_SPEC.md` | Spec toàn bộ màn Admin |
| `08_STORYBOOK_GUIDE.md` | Cách tổ chức và kiểm thử component bằng Storybook |
| `09_RESPONSIVE_AND_ACCESSIBILITY.md` | Responsive + WCAG/accessibility |
| `10_HANDOFF_AND_CODE_MAPPING.md` | Mapping Figma → Next.js/Tailwind |
| `11_DESIGN_QA_CHECKLIST.md` | Checklist kiểm tra trước handoff |
| `12_DESIGN_ROADMAP.md` | Thứ tự thực hiện thiết kế |
| `13_DESIGN_DECISION_LOG.md` | Ghi lại quyết định thiết kế |

## 4. Nguyên tắc quan trọng

1. **Requirement trước, thẩm mỹ sau.**
2. Không thêm chức năng nghiệp vụ không có trong requirement nếu chưa được team thống nhất.
3. Mọi màn CRUD phải thiết kế đủ:
   - default
   - loading
   - empty
   - error
   - success
   - permission/disabled state nếu có.
4. Figma component phải có đối ứng rõ với React component.
5. Không hard-code style tùy tiện nếu style đó có thể trở thành design token.
6. Các thay đổi UI đã merge vào code phải phản ánh ngược lại tài liệu/Figma nếu làm thay đổi contract giao diện.
7. Storybook là nơi kiểm tra component độc lập; Figma là source of truth về visual design.
8. Mọi màn hình phải kiểm tra tối thiểu desktop và mobile.
9. Table phức tạp ưu tiên desktop-first; mobile cần alternate presentation hợp lý.
10. Không dùng màu là tín hiệu duy nhất để truyền tải trạng thái.

## 5. Definition of Done cho UI/UX

Một feature chỉ được coi là hoàn tất về thiết kế khi:

- [ ] Có screen/frame trong Figma.
- [ ] Có user flow liên quan.
- [ ] Dùng đúng component/design token.
- [ ] Có state loading/empty/error/success khi phù hợp.
- [ ] Có responsive behavior.
- [ ] Có accessibility note.
- [ ] Component mới đã được định nghĩa trong component spec.
- [ ] Component reusable đã có Storybook story tương ứng.
- [ ] Đã kiểm tra consistency với API/data requirement.
- [ ] Đã handoff cho Frontend.
- [ ] Sau khi Frontend code xong, đã chạy Design QA.
