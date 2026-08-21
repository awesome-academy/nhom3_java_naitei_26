# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS & API Documentation)

## HỆ THỐNG QUẢN LÝ CHI TIÊU — Expense Management System

**Mock Project — NAITEI 26 — Java — Nhóm 3**

- **Người biên soạn:** Lê Thị Tú Phương — *Vai trò: SRS & API Documentation*
- **Stack:** Next.js · Spring Boot · MySQL · RESTful · Docker
- **Phiên bản:** 2.3.1 FINAL (vá 3 điểm review bảo mật/consistency trên nền v2.3)

> 📝 **Changelog 2.0 → 2.1:** Chốt lại mô hình Income dùng `categoryId` thay vì `type` tự do (mục 3, 4.6, 4.7, 6, 7.4); thêm `password` khi Admin tạo User (mục 5.4, 8.1); làm rõ cơ chế JWT logout (mục 7.1); thêm ràng buộc UNIQUE cho Budget (mục 3, 6); bổ sung contract upload file đính kèm + API xoá từng attachment (mục 4.5, 7.3); thêm API "Apply" cho Budget Template (mục 4.9, 7.6); bổ sung BR-12 → BR-19; thêm mục 6.1 Ghi chú thiết kế CSDL & Migration; thêm mục 13 Yêu cầu phi chức năng (NFR); bỏ trạng thái "nếu có" của Quên mật khẩu (loại khỏi scope); thêm cột export User; thêm `from/to` cho báo cáo tổng hợp; thêm `GET /api/admin/incomes/{id}`.
>
> 📝 **Changelog 2.1 → 2.2:** Sửa `DELETE /api/admin/users/{id}` từ soft-delete (`active=false`, trùng nghĩa với khoá tài khoản) sang **hard delete + RESTRICT** nếu User đã có dữ liệu nghiệp vụ (mục 5.3, BR-16); thêm API riêng `PUT /api/admin/users/{id}/password` để giải quyết mâu thuẫn giữa "Admin đặt lại mật khẩu qua User Form" và "form sửa ẩn field password" (mục 4.1, 5.3, 5.4, 8.1, BR-20); tách rõ **CSV Export schema** và **CSV Import schema** cho từng entity — không dùng chung cột nữa (mục 9); sửa giới hạn attachment từ "5 file/request" thành đúng **5 file/Expense** cộng dồn (mục 4.5, BR-10); bổ sung Income và BudgetTemplateItem vào danh sách tham chiếu chặn xoá Category (BR-09).
>
> 📝 **Changelog 2.2 → 2.3:** Bổ sung lại tính năng **"Quên mật khẩu" tự phục vụ qua email** (đảo ngược quyết định "bỏ" ở v2.1) — thêm màn 4.1b/4.1c, API `forgot-password`/`reset-password`, entity `PasswordResetToken`, BR-23/BR-24 (mục 3, 4.1, 7.1, 13); giải quyết xung đột **ActivityLog vs hard-delete User** — `activity_logs.userId` chuyển NULLABLE với `ON DELETE SET NULL` kèm snapshot `actorName`/`actorEmail` để không mất audit trail khi User bị xoá cứng (mục 3, 3.1, BR-16, BR-22); chốt rule ưu tiên **PRIVATE trước COMMON** khi resolve Category lúc import CSV (mục 9, BR-25); thêm ràng buộc **BudgetTemplateItem chỉ dùng Category chung + EXPENSE** và `UNIQUE(templateId, categoryId)` (mục 3, 3.1, 5.6, BR-21); đồng bộ text mục 4.8/5.5 về danh sách entity chặn xoá Category theo đúng BR-09; bổ sung `categoryId` filter và xem chi tiết cho Admin Income (mục 5.8, 8.5), thêm `page/size/sort` vào tham số Admin Expense/Income (mục 8.4, 8.5).

> 📝 **Changelog 2.3 → 2.3.1:** (1) `PasswordResetToken.token` đổi thành `tokenHash` (SHA-256 của token gốc), không lưu token dạng plaintext trong DB (mục 3, 3.1, 7.1); (2) sửa logic reset-password: `usedAt` chỉ set khi cập nhật mật khẩu **thành công**, validation fail/lỗi hệ thống không consume token (mục 7.1, BR-24); (3) sửa response mẫu `GET /api/admin/activity-logs` để khớp model — dùng `userId` + `actorName` + `actorEmail` thay cho field `user` cũ (mục 8.6).

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Tổng quan hệ thống](#2-tổng-quan-hệ-thống)
3. [Mô hình dữ liệu tóm tắt](#3-mô-hình-dữ-liệu-tóm-tắt)
4. [Đặc tả màn hình — Client](#4-đặc-tả-màn-hình--phía-người-dùng-client)
5. [Đặc tả màn hình — Admin](#5-đặc-tả-màn-hình--phía-quản-trị-admin)
6. [Tổng hợp quy tắc nghiệp vụ](#6-tổng-hợp-quy-tắc-nghiệp-vụ-business-rules)
7. [Tài liệu API — Client](#7-tài-liệu-api--client-api)
8. [Tài liệu API — Admin](#8-tài-liệu-api--admin-api)
9. [Import / Export API](#9-import--export-api)
10. [Bảng tổng hợp endpoint](#10-bảng-tổng-hợp-endpoint)
11. [Phân công công việc](#11-phân-công-công-việc)
12. [Quy trình làm việc (Git & Redmine)](#12-quy-trình-làm-việc-git--redmine)
13. [Yêu cầu phi chức năng (NFR)](#13-yêu-cầu-phi-chức-năng-nfr)

---

## 1. Giới thiệu

### 1.1. Mục đích tài liệu

Tài liệu mô tả chi tiết từng màn hình, luồng thao tác, quy tắc nghiệp vụ và toàn bộ API (endpoint, request, response) của Hệ thống Quản lý Chi tiêu, làm cơ sở để FE/BE triển khai thống nhất và để kiểm thử/nghiệm thu sau này.

### 1.2. Phạm vi & đối tượng sử dụng

- BE (Huy) dùng để thiết kế Entity/Controller đúng theo hợp đồng API.
- FE (Toàn, Nghĩa) dùng để dựng đúng luồng màn hình và gọi đúng endpoint.
- Cả nhóm dùng làm căn cứ chia ticket Redmine theo từng màn hình/API.

### 1.3. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Front-end | Next.js (App Router) + TailwindCSS + TypeScript |
| Back-end | Java Spring Boot (Spring Web, Spring Data JPA, Validation, Lombok, Springdoc OpenAPI) |
| Cơ sở dữ liệu | MySQL (MySQL Connector/J) |
| API | RESTful API, response chuẩn hoá qua `ApiResponse<T>` |
| Triển khai | Docker, Docker Compose, Nginx Reverse Proxy |

> ⚠️ **Lưu ý thống nhất công nghệ:** Database chốt dùng **MySQL** theo đề bài gốc. Mọi cấu hình (`application.yml`, driver, Docker Compose) phải dùng MySQL — **không** dùng PostgreSQL.

### 1.4. Chuẩn response API

Mọi endpoint trả về theo cấu trúc thống nhất:

```json
{ "status": 200, "message": "Thành công", "data": { } }
```

Lỗi được Global Exception Handler (`@RestControllerAdvice`) bắt tập trung, trả cùng format với status lỗi tương ứng (400/401/403/404/409/500) và message mô tả lỗi, không trả HTML.

Danh sách có phân trang trả thêm các trường trong `data`:

```json
{
  "status": 200,
  "message": "Thành công",
  "data": {
    "items": [],
    "page": 0,
    "size": 10,
    "totalItems": 42,
    "totalPages": 5
  }
}
```

> ℹ️ **Quy ước phân trang (0-based):** Tham số `page` bắt đầu từ **0** (theo mặc định của Spring Data JPA). FE gửi `page=0` cho trang đầu tiên. Thống nhất toàn hệ thống để FE/BE không lệch nhau.

### 1.5. Định dạng lỗi validate (dùng chung cho FE)

Khi dữ liệu không hợp lệ, backend trả 400 với `data` là map từ tên field sang thông báo lỗi, để FE hiển thị dưới đúng ô nhập:

```json
{
  "status": 400,
  "message": "Dữ liệu không hợp lệ",
  "data": {
    "amount": "Số tiền phải lớn hơn 0",
    "categoryId": "Không được để trống"
  }
}
```

| HTTP | Ý nghĩa | Khi nào |
|---|---|---|
| 200 | OK | Truy vấn/cập nhật thành công |
| 201 | Created | Tạo mới tài nguyên thành công |
| 400 | Bad Request | Dữ liệu không hợp lệ (validate) |
| 401 | Unauthorized | Chưa đăng nhập / token hết hạn/không hợp lệ |
| 403 | Forbidden | Token hợp lệ nhưng không đủ quyền (role) |
| 404 | Not Found | Không tìm thấy tài nguyên / không thuộc sở hữu |
| 409 | Conflict | Xung đột (email trùng, xoá danh mục đang dùng) |
| 500 | Server Error | Lỗi hệ thống (vẫn bọc JSON chuẩn) |

---

## 2. Tổng quan hệ thống

### 2.1. Đối tượng người dùng

| Vai trò | Mô tả |
|---|---|
| User | Quản lý thu nhập/chi tiêu/danh mục/ngân sách của riêng mình. |
| Admin | Quản trị toàn hệ thống: user, danh mục chung, budget template, toàn bộ expense/income, activity log, import/export. |

### 2.2. Kiến trúc namespace

- **Client API:** tiền tố `/api/...` — chỉ thao tác trên dữ liệu của chính user đang đăng nhập.
- **Admin API:** tiền tố `/api/admin/...` — yêu cầu role = ADMIN, thao tác trên toàn hệ thống.
- FE route group tương ứng: `app/(user)/`, `app/(admin)/`, `app/(auth)/`.

### 2.3. Quy tắc xác thực chung cho API

- Toàn bộ endpoint (trừ `/api/auth/**`) yêu cầu header `Authorization: Bearer <token>`.
- Endpoint `/api/admin/**` trả **403 Forbidden** nếu token hợp lệ nhưng role khác ADMIN.
- Token hết hạn/không hợp lệ → **401 Unauthorized**.
- BE luôn lấy `userId` từ token, **không** nhận `userId` từ FE (chống truy cập chéo dữ liệu).

---

## 3. Mô hình dữ liệu tóm tắt

Bảng dưới tổng hợp các trường chính của từng entity để đối chiếu khi đọc phần đặc tả màn hình và API. ERD chi tiết (khoá ngoại, quan hệ, index) do Duy thiết kế và là tài liệu tham chiếu chính thức.

### User

| Trường | Kiểu | Ghi chú |
|---|---|---|
| id | Long | Khoá chính |
| name | String | Họ tên |
| email | String | Duy nhất, dùng để đăng nhập |
| password | String | Mã hoá (hash) |
| role | Enum (USER, ADMIN) | Phân quyền |
| active | Boolean | Trạng thái kích hoạt |
| createdAt | DateTime | Ngày tạo |

### Category

| Trường | Kiểu | Ghi chú |
|---|---|---|
| id | Long | Khoá chính |
| name | String | Tên danh mục |
| description | String | Mô tả |
| icon | String | Icon/biểu tượng |
| type | Enum (EXPENSE, INCOME) | Loại danh mục |
| userId | FK → User (nullable) | NULL = danh mục chung (admin tạo); có giá trị = danh mục riêng của user đó |

> 📌 **Mô hình danh mục (chốt: Mô hình B).** Hệ thống dùng đồng thời hai loại danh mục:
> - **Danh mục chung:** do admin tạo, `userId = NULL`, mọi user đều thấy.
> - **Danh mục riêng:** do user tự tạo, `userId = id` của user đó, chỉ user đó thấy.
>
> API `/api/categories` của user trả về: danh mục chung + danh mục riêng của chính user. User chỉ được sửa/xoá danh mục riêng của mình, không đụng tới danh mục chung.

### Expense

| Trường | Kiểu | Ghi chú |
|---|---|---|
| id | Long | Khoá chính |
| userId | FK → User | Chủ sở hữu |
| categoryId | FK → Category | Danh mục (type = EXPENSE) |
| title | String | Tên khoản chi |
| amount | BigDecimal | Số tiền (> 0) |
| date | Date | Ngày chi |
| note | String | Ghi chú |

### Attachment

Một khoản chi tiêu có thể có nhiều file đính kèm (hoá đơn, biên lai, ảnh). Tách bảng riêng thay vì lưu một URL đơn để hỗ trợ nhiều file.

| Trường | Kiểu | Ghi chú |
|---|---|---|
| id | Long | Khoá chính |
| expenseId | FK → Expense | Khoản chi chứa file |
| fileName | String | Tên file gốc |
| fileUrl | String | Đường dẫn lưu file |
| uploadedAt | DateTime | Thời điểm tải lên |

### Income

| Trường | Kiểu | Ghi chú |
|---|---|---|
| id | Long | Khoá chính |
| userId | FK → User | Chủ sở hữu |
| categoryId | FK → Category | Danh mục (type = INCOME) |
| source | String | Nguồn thu nhập (ví dụ: "Lương tháng 8", "Freelance dự án X") |
| amount | BigDecimal | Số tiền (> 0) |
| date | Date | Ngày nhận |
| note | String | Ghi chú |

> ⚙️ **Chốt (v2.1): bỏ trường `Income.type: String`, thay bằng `categoryId` (FK → Category, type = INCOME).**
> Bản v2.0 có cả `Income.type` tự do lẫn `Category.type = INCOME` cùng lúc — hai cơ chế phân loại thu nhập chồng chéo và không liên kết với nhau, khiến BR-05 (category phải khớp loại) vô nghĩa với Income. Từ nay Income phân loại **hoàn toàn qua Category** giống Expense, đảm bảo nhất quán và cho phép dashboard/report group thu nhập theo danh mục (VD: Lương, Thưởng, Freelance).

### Budget

| Trường | Kiểu | Ghi chú |
|---|---|---|
| id | Long | Khoá chính |
| userId | FK → User | Chủ sở hữu |
| categoryId | FK → Category | Danh mục áp dụng (type = EXPENSE) |
| month | String (yyyy-MM) | Tháng áp dụng |
| amount | BigDecimal | Hạn mức ngân sách (> 0) |

> ⚙️ **Ràng buộc bắt buộc:** `UNIQUE(userId, categoryId, month)`. Một user chỉ có **một** Budget cho cùng danh mục + tháng — tránh trường hợp tạo nhiều bản ghi budget trùng lặp khiến BE không xác định được hạn mức nào là thực (xem BR-12).

### PasswordResetToken

| Trường | Kiểu | Ghi chú |
|---|---|---|
| id | Long | Khoá chính |
| userId | FK → User | User yêu cầu reset |
| tokenHash | String | SHA-256 của token gửi cho user, UNIQUE, đủ độ dài entropy (token gốc khuyến nghị ≥ 32 byte, mã hoá base64/hex) |
| expiresAt | DateTime | Thời điểm hết hạn (tạo lúc gửi + 15–30 phút) |
| usedAt | DateTime (nullable) | Thời điểm token đã được dùng; NULL = chưa dùng |
| createdAt | DateTime | Thời điểm tạo |

> ⚙️ **Chốt (v2.3):** Phục vụ tính năng "Quên mật khẩu" tự phục vụ (mục 4.1b, 4.1c, API 7.1). Token gốc (random, đủ entropy) chỉ tồn tại trong email gửi cho user và không lưu ở DB; BE lưu `tokenHash = SHA-256(token gốc)` để nếu DB bị lộ, attacker không có ngay reset link còn hiệu lực. Khi verify, BE tự hash token nhận từ FE rồi so khớp `tokenHash`. Token chỉ hợp lệ khi `usedAt IS NULL` và `now() < expiresAt`. Sau khi dùng thành công, set `usedAt = now()` để chặn tái sử dụng (BR-24). Có thể dọn định kỳ (cron/job) các token đã hết hạn quá lâu, không bắt buộc cho mock project.

### BudgetTemplate & TemplateItem (Admin)

Thay vì lưu danh sách danh mục mặc định dưới dạng JSON blob, tách thành bảng con `TemplateItem` để giữ khoá ngoại và dễ truy vấn.

| Bảng | Trường | Ghi chú |
|---|---|---|
| BudgetTemplate | id, name, month, createdBy | Mẫu ngân sách |
| TemplateItem | id, templateId (FK), categoryId (FK), defaultAmount | Mỗi dòng = một danh mục + hạn mức mặc định |

> ⚙️ **Chốt (v2.3):** `TemplateItem.categoryId` chỉ được trỏ tới Category **chung** (`userId = NULL`) và **type = EXPENSE**. Không cho phép trỏ vào category riêng của một user cụ thể — vì template dùng chung cho mọi user apply, category riêng của User A sẽ vô nghĩa (hoặc lỗi) khi User B áp dụng. Ràng buộc `UNIQUE(templateId, categoryId)` để một template không có 2 dòng cùng category (BR-21).

### ActivityLog (Admin)

| Trường | Kiểu | Ghi chú |
|---|---|---|
| id | Long | Khoá chính |
| userId | FK → User (**nullable**) | Người thực hiện; NULL nếu User đã bị xoá cứng |
| actorName | String | Snapshot tên người thực hiện tại thời điểm ghi log |
| actorEmail | String | Snapshot email người thực hiện tại thời điểm ghi log |
| action | String | Loại hành động (LOGIN, CREATE_EXPENSE, ...) |
| description | String | Mô tả chi tiết |
| createdAt | DateTime | Thời gian |

> ⚙️ **Chốt (v2.3): `activity_logs.user_id` NULLABLE, FK `ON DELETE SET NULL`, kèm snapshot `actorName`/`actorEmail`.**
> Vấn đề: BR-16 cho phép hard-delete User chưa có Expense/Income/Budget/Category, nhưng User đó **luôn có ActivityLog** (tối thiểu 1 dòng LOGIN). Nếu FK `activity_logs.user_id` là RESTRICT, hard-delete sẽ luôn thất bại — mâu thuẫn với BR-16. Nếu cascade xoá luôn log, mất audit trail.
> Giải pháp: khi ghi ActivityLog, BE lưu kèm **snapshot** `actorName`/`actorEmail` tại thời điểm hành động xảy ra (không JOIN sang bảng User để hiển thị). Khi User bị hard-delete, `userId` được set về `NULL` (FK `ON DELETE SET NULL`) nhưng `actorName`/`actorEmail` vẫn còn nguyên trong bản ghi log — vừa xoá được User, vừa không mất dấu vết ai đã làm gì (BR-22).

### 3.1. Ghi chú bắt buộc cho ERD chính thức

Bảng ở trên là **mô hình dữ liệu tóm tắt** phục vụ đọc SRS/API. ERD đầy đủ (khoá ngoại, index, kiểu dữ liệu chính xác, ON DELETE/ON UPDATE) do Duy thiết kế và là tài liệu tham chiếu chính thức cho migration — nhưng ERD đó **bắt buộc phải tuân theo** các ràng buộc nghiệp vụ sau:

| Bảng | Ràng buộc bắt buộc |
|---|---|
| `users` | `email` UNIQUE, NOT NULL |
| `categories` | `userId` NULLABLE (NULL = danh mục chung); nên có INDEX(`userId`, `type`) để query nhanh |
| `budgets` | **UNIQUE(`user_id`, `category_id`, `month`)** — chặn trùng ngân sách cùng danh mục/tháng (BR-12) |
| `expenses`, `incomes` | `amount` kiểu `DECIMAL` (không dùng `DOUBLE`/`FLOAT` để tránh sai số làm tròn) (BR-19) |
| `expense_attachments` | `expenseId` NOT NULL, xoá Expense thì xoá luôn Attachment liên quan (cascade) kèm file vật lý |
| `budget_template_items` | `templateId` + `categoryId` NOT NULL, **UNIQUE(templateId, categoryId)**; `categoryId` chỉ trỏ Category chung + EXPENSE (BR-21), không dùng JSON blob cho danh sách item |
| `activity_logs` | `userId` **NULLABLE**, FK **ON DELETE SET NULL** (không RESTRICT, không CASCADE); kèm cột snapshot `actorName`, `actorEmail` NOT NULL (BR-22) |
| `password_reset_tokens` | `token_hash` (SHA-256 của token gốc) UNIQUE, NOT NULL — **không lưu token gốc dạng plaintext**; `userId` FK **ON DELETE CASCADE** (User bị xoá thì token cũ vô nghĩa); INDEX(`token_hash`) để tra cứu nhanh khi verify |
| Tất cả bảng | có `created_at`; các bảng cho phép sửa (`users`, `expenses`, `incomes`, `categories`, `budgets`) nên có thêm `updated_at` |
| Charset/Collation | `utf8mb4` cho toàn bộ bảng (hỗ trợ emoji trong `note`, `icon`) |

---

## 4. Đặc tả màn hình — Phía người dùng (Client)

### 4.1. Đăng nhập (Login)

**Mục đích:** Cho phép người dùng xác thực để truy cập hệ thống.

**Thành phần giao diện chính**
- Form: email, mật khẩu
- Nút "Đăng nhập"
- Link "Quên mật khẩu?"

> ⚙️ **Chốt lại (v2.3): Bổ sung tính năng "Quên mật khẩu" tự phục vụ qua email** (đảo ngược quyết định "bỏ" ở v2.1 theo yêu cầu mở rộng scope). Bên cạnh việc Admin có thể đặt lại mật khẩu hộ qua màn 5.3, User giờ có thể tự reset qua email mà không cần liên hệ Admin. Xem màn 4.1b, 4.1c và API mục 7.1.

**Trường dữ liệu**

| Trường | Loại input | Validate |
|---|---|---|
| email | Text | Bắt buộc, đúng định dạng email |
| password | Password | Bắt buộc, tối thiểu 6 ký tự |

**Luồng thao tác**
1. Người dùng nhập email/mật khẩu, bấm Đăng nhập.
2. FE gọi `POST /api/auth/login`.
3. Thành công: lưu token, điều hướng vào Dashboard.
4. Thất bại: hiển thị thông báo lỗi (sai tài khoản/mật khẩu).
5. Bấm "Quên mật khẩu?" → điều hướng màn 4.1b.

**Quy tắc nghiệp vụ**
- Tài khoản bị khoá (`active=false`) không đăng nhập được, trả lỗi rõ ràng.
- Admin vẫn có thể đặt lại mật khẩu hộ User qua màn 5.3 (`PUT /api/admin/users/{id}/password`) — đây là kênh dự phòng, song song với luồng tự phục vụ dưới đây, không thay thế nhau.

### 4.1b. Quên mật khẩu — Yêu cầu reset (Forgot Password)

**Mục đích:** Cho phép User tự yêu cầu đặt lại mật khẩu khi quên, không cần qua Admin.

**Thành phần giao diện chính**
- Form: email
- Nút "Gửi yêu cầu"
- Link quay lại Đăng nhập

**Trường dữ liệu**

| Trường | Loại input | Validate |
|---|---|---|
| email | Text | Bắt buộc, đúng định dạng email |

**Luồng thao tác**
1. Người dùng nhập email, bấm "Gửi yêu cầu".
2. FE gọi `POST /api/auth/forgot-password`.
3. **Luôn** hiển thị thông báo chung dạng "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu" — **không** tiết lộ email có tồn tại hay không (chống dò email — enumeration attack).
4. Nếu email hợp lệ và tồn tại, BE gửi email chứa link kèm token, ví dụ: `https://app.example.com/reset-password?token=...`.

**Quy tắc nghiệp vụ**
- Không tiết lộ qua response việc email có tồn tại trong hệ thống hay không (BR-23).
- Tài khoản bị khoá (`active=false`) vẫn nhận được email reset, nhưng sau khi đổi mật khẩu thành công vẫn **không** đăng nhập được cho tới khi Admin mở khoá lại — reset password không tự động mở khoá tài khoản.

### 4.1c. Đặt lại mật khẩu (Reset Password)

**Mục đích:** Cho phép User đặt mật khẩu mới bằng link nhận được qua email.

**Thành phần giao diện chính**
- Form: mật khẩu mới, xác nhận mật khẩu mới
- Nút "Đặt lại mật khẩu"

**Trường dữ liệu**

| Trường | Loại input | Validate |
|---|---|---|
| newPassword | Password | Bắt buộc, tối thiểu 6 ký tự |
| confirmPassword | Password | Bắt buộc, phải khớp `newPassword` |

**Luồng thao tác**
1. User mở link từ email, FE lấy `token` từ query string.
2. Người dùng nhập mật khẩu mới, bấm "Đặt lại mật khẩu".
3. FE gọi `POST /api/auth/reset-password` kèm `token` + `newPassword`.
4. Thành công → thông báo và điều hướng về màn Login.
5. Token hết hạn/không hợp lệ/đã dùng → hiển thị lỗi, gợi ý yêu cầu lại từ màn 4.1b.

**Quy tắc nghiệp vụ**
- Token có hạn sử dụng ngắn (khuyến nghị 15–30 phút) và **chỉ dùng được 1 lần**; dùng xong hoặc hết hạn → vô hiệu (BR-24).
- Sau khi đặt lại mật khẩu thành công, ghi Activity Log `RESET_PASSWORD_SELF`.

### 4.2. Dashboard (Trang tổng quan)

**Mục đích:** Cho người dùng cái nhìn tổng quan tài chính trong tháng hiện tại.

**Thành phần giao diện chính**
- Thẻ số liệu: Tổng thu nhập / Tổng chi tiêu / Số dư còn lại
- Biểu đồ tròn/cột: chi tiêu theo danh mục
- Nút nhanh "Add new expense"

**Luồng thao tác**
1. FE gọi `GET /api/dashboard/summary` lấy số liệu tổng hợp tháng hiện tại.
2. FE gọi `GET /api/dashboard/expense-by-category` để vẽ biểu đồ.
3. Bấm "Add new expense" → điều hướng tới màn 4.5.

**Quy tắc nghiệp vụ**
- Số liệu mặc định tính theo tháng hiện tại (server tính theo ngày hệ thống).

### 4.3. Danh sách chi tiêu (Expense List)

**Mục đích:** Hiển thị toàn bộ khoản chi tiêu của người dùng, hỗ trợ tìm kiếm/lọc/phân trang.

**Thành phần giao diện chính**
- Thanh tìm kiếm theo tên khoản chi
- Bộ lọc: khoảng ngày, danh mục, khoảng số tiền
- Bảng: tên, số tiền, ngày, danh mục
- Phân trang cuối bảng
- Nút "Thêm mới", click 1 dòng → trang chi tiết

**Luồng thao tác**
1. FE gọi `GET /api/expenses` kèm query params (`page, size, search, fromDate, toDate, categoryId, minAmount, maxAmount`).
2. Người dùng đổi filter → gọi lại API với params mới.
3. Click 1 dòng → điều hướng màn 4.4 theo id.

**Quy tắc nghiệp vụ**
- Chỉ hiển thị expense thuộc user đang đăng nhập (BE tự lọc theo `userId` từ token, không nhận `userId` từ FE).

### 4.4. Chi tiết chi tiêu (Expense Detail)

**Mục đích:** Xem đầy đủ thông tin 1 khoản chi tiêu.

**Thành phần giao diện chính**
- Tên, số tiền, ngày chi, danh mục, ghi chú
- Xem/preview các file đính kèm
- Nút "Sửa" và "Xoá"

**Luồng thao tác**
1. FE gọi `GET /api/expenses/{id}` khi vào trang.
2. Bấm Sửa → mở form 4.5 với dữ liệu điền sẵn.
3. Bấm Xoá → popup xác nhận → `DELETE /api/expenses/{id}`.

**Quy tắc nghiệp vụ**
- Trả 404 nếu id không tồn tại hoặc không thuộc sở hữu của user.

### 4.5. Thêm / Sửa chi tiêu (Expense Form)

**Mục đích:** Tạo mới hoặc chỉnh sửa một khoản chi tiêu.

**Thành phần giao diện chính**
- Form nhập liệu (modal hoặc trang riêng)
- Upload nhiều file đính kèm
- Nút Lưu / Huỷ

**Trường dữ liệu**

| Trường | Loại input | Validate |
|---|---|---|
| title | Text | Bắt buộc |
| amount | Number | Bắt buộc, > 0 |
| date | Date picker | Bắt buộc, không được là ngày tương lai |
| categoryId | Select | Bắt buộc, chọn từ category type=EXPENSE |
| note | Textarea | Không bắt buộc |
| attachments | File upload | Không bắt buộc, ảnh/PDF, cho phép nhiều file (xem contract bên dưới) |

**Luồng thao tác**
1. Người dùng điền form, bấm Lưu.
2. Thêm mới: `POST /api/expenses`. Sửa: `PUT /api/expenses/{id}`.
3. Thành công → quay lại danh sách/chi tiết, hiện thông báo.
4. Thất bại validate → hiển thị lỗi field theo response 400.
5. Sau khi lưu, BE đánh giá lại ngân sách; nếu vượt trả kèm cảnh báo.
6. Khi sửa, các attachment cũ được **giữ nguyên** trừ khi user chủ động xoá; upload thêm file mới sẽ được **thêm vào**, không thay thế toàn bộ danh sách.

**Quy tắc nghiệp vụ**
- Số tiền phải > 0 (BR-04).
- Category phải thuộc loại EXPENSE (BR-05).

**Contract upload file đính kèm (chốt v2.1)**

| Thuộc tính | Giá trị |
|---|---|
| Multipart field | `files` (mảng `MultipartFile[]`); phần dữ liệu form còn lại gửi dạng field `data` (JSON string) hoặc field rời tuỳ FE — BE parse theo `@RequestPart` |
| Số file tối đa | **5 file / Expense** (tính cộng dồn: số attachment hiện có + số file mới upload trong request, không phải 5 file/request — VD: Expense đã có 3 file thì request tiếp theo chỉ được upload tối đa 2 file mới) |
| Dung lượng tối đa / file | 5 MB |
| MIME type cho phép | `image/jpeg`, `image/png`, `application/pdf` |
| Trùng tên file | BE tự sinh tên file lưu trữ (UUID/prefix timestamp), giữ `fileName` gốc để hiển thị, không ghi đè |
| Nơi lưu | Docker volume mount riêng cho thư mục attachment (không lưu trong container ephemeral) |
| Xoá 1 attachment | `DELETE /api/expenses/{expenseId}/attachments/{attachmentId}` (xem mục 7.3) |
| Xoá Expense | Xoá cascade toàn bộ Attachment liên quan, kể cả file vật lý trên volume |
| Vượt giới hạn 5 file/Expense | BE trả **400 Bad Request**, không lưu file nào trong request đó (all-or-nothing cho request, không lưu một phần) |

### 4.6. Danh sách thu nhập (Income List)

**Mục đích:** Hiển thị các nguồn thu nhập của người dùng.

**Thành phần giao diện chính**
- Tìm kiếm, lọc theo tháng / danh mục thu nhập
- Bảng danh sách + phân trang
- Nút Thêm mới

**Luồng thao tác**
1. FE gọi `GET /api/incomes` kèm params (`page, size, month, categoryId`).
2. Click dòng hoặc nút Sửa → mở form 4.7.
3. Nút Xoá → xác nhận → `DELETE /api/incomes/{id}`.

### 4.7. Thêm / Sửa thu nhập (Income Form)

**Mục đích:** Tạo mới hoặc chỉnh sửa một nguồn thu nhập.

**Thành phần giao diện chính**
- Form nhập liệu
- Nút Lưu / Huỷ

**Trường dữ liệu**

| Trường | Loại input | Validate |
|---|---|---|
| source | Text | Bắt buộc |
| amount | Number | Bắt buộc, > 0 |
| date | Date picker | Bắt buộc |
| categoryId | Select | Bắt buộc, chọn từ category type=INCOME |
| note | Textarea | Không bắt buộc |

**Luồng thao tác**
1. Thêm mới: `POST /api/incomes`. Sửa: `PUT /api/incomes/{id}`.
2. Thành công → về danh sách, hiện toast thông báo.

**Quy tắc nghiệp vụ**
- Số tiền phải > 0 (BR-04).
- Category phải thuộc loại INCOME (BR-05).

### 4.8. Danh sách danh mục (Category List)

**Mục đích:** Quản lý danh mục của người dùng: xem danh mục chung (do admin cấp) và tạo/sửa/xoá danh mục riêng.

**Thành phần giao diện chính**
- Danh sách dạng lưới/bảng: icon, tên, mô tả, loại (chung/riêng)
- Nút Thêm / Sửa / Xoá (chỉ với danh mục riêng)

**Trường dữ liệu**

| Trường | Loại input | Validate |
|---|---|---|
| name | Text | Bắt buộc |
| description | Text | Không bắt buộc |
| icon | Icon picker | Không bắt buộc |

**Luồng thao tác**
1. `GET /api/categories` lấy danh sách (chung + riêng của user).
2. `POST /api/categories` thêm danh mục riêng, `PUT /api/categories/{id}` sửa.
3. `DELETE /api/categories/{id}` xoá (chặn nếu đang được Expense/Income/Budget/BudgetTemplateItem tham chiếu).

**Quy tắc nghiệp vụ**
- User chỉ được sửa/xoá danh mục riêng của mình; không sửa/xoá danh mục chung (admin quản lý).
- Không cho xoá danh mục đang được **Expense / Income / Budget / BudgetTemplateItem** tham chiếu (trả 409 Conflict) (BR-09).

### 4.9. Danh sách ngân sách (Budget List)

**Mục đích:** Xem và quản lý ngân sách theo tháng/danh mục, cảnh báo khi vượt mức.

**Thành phần giao diện chính**
- Bộ lọc theo tháng
- Bảng: danh mục, hạn mức, đã chi, % sử dụng
- Cảnh báo màu đỏ/badge khi vượt hạn mức
- Nút Thêm / Sửa / Xoá

**Trường dữ liệu**

| Trường | Loại input | Validate |
|---|---|---|
| categoryId | Select | Bắt buộc |
| month | Month picker | Bắt buộc |
| amount | Number | Bắt buộc, > 0 |

**Luồng thao tác**
1. `GET /api/budgets?month=...` lấy danh sách kèm số đã chi thực tế (BE tự tính tổng expense theo category/tháng).
2. `POST /api/budgets`, `PUT /api/budgets/{id}`, `DELETE /api/budgets/{id}`.
3. Nút "Áp dụng mẫu ngân sách" (tuỳ chọn, nếu Admin đã tạo Budget Template cho tháng đó): `GET /api/budget-templates` để chọn mẫu, sau đó `POST /api/budget-templates/{id}/apply` để tạo hàng loạt Budget cho tháng hiện tại.

**Quy tắc nghiệp vụ**
- Cảnh báo vượt ngân sách tính ở BE (`spent/amount > 1`) và trả kèm flag `isOverBudget` trong response (BR-06).
- Một user chỉ có một Budget cho cùng category + month; tạo trùng → 409 Conflict (BR-12).
- Áp dụng mẫu ngân sách: nếu tháng đó user đã có Budget cho một category nào trong mẫu, bản ghi đó được **bỏ qua** (giữ Budget hiện có), không ghi đè.

### 4.10. Báo cáo & Phân tích (Report & Analytics)

**Mục đích:** Xem báo cáo chi tiêu/thu nhập theo khoảng thời gian và xu hướng.

**Thành phần giao diện chính**
- Bộ lọc: tháng / quý / năm, khoảng ngày tuỳ chỉnh
- Biểu đồ phân bố chi tiêu theo danh mục
- Biểu đồ so sánh thu nhập vs chi tiêu
- Biểu đồ đường xu hướng chi tiêu theo thời gian

**Luồng thao tác**
1. FE gọi `GET /api/reports/summary?period=...` (tháng/quý/năm) **hoặc** `GET /api/reports/summary?from=...&to=...` (khoảng ngày tuỳ chỉnh) lấy số liệu tổng hợp — hai kiểu tham số dùng loại trừ nhau, FE gửi đúng một trong hai bộ.
2. FE gọi `GET /api/reports/trend?from=...&to=...` lấy dữ liệu vẽ biểu đồ xu hướng.

---

## 5. Đặc tả màn hình — Phía quản trị (Admin)

### 5.1. Đăng nhập Admin

**Mục đích:** Xác thực quản trị viên (cùng API login, FE điều hướng khác theo role).

**Thành phần giao diện chính**
- Form email/mật khẩu (dùng chung layout auth, có thể tách route `/admin/login`)

**Luồng thao tác**
1. `POST /api/auth/login` — nếu role trả về khác ADMIN, FE chặn không cho vào khu vực admin.

### 5.2. Danh sách người dùng (User List)

**Mục đích:** Quản trị viên xem, tìm kiếm, lọc danh sách toàn bộ người dùng.

**Thành phần giao diện chính**
- Tìm kiếm theo tên/email
- Lọc theo trạng thái active
- Bảng: tên, email, role, trạng thái
- Nút Thêm mới, click dòng → xem profile

**Luồng thao tác**
1. `GET /api/admin/users` kèm params (`page, size, search, active`).
2. Click 1 dòng → điều hướng màn 5.3.

### 5.3. Hồ sơ người dùng (User Profile)

**Mục đích:** Xem chi tiết 1 người dùng và số liệu tổng quan liên quan.

**Thành phần giao diện chính**
- Thông tin cơ bản: tên, email, role, trạng thái, ngày tạo
- Tổng quan: tổng expense, tổng income của user đó
- Nút Sửa / Xoá / **Đặt lại mật khẩu**

**Luồng thao tác**
1. `GET /api/admin/users/{id}`.
2. Sửa → mở form 5.4. Xoá → xác nhận → `DELETE /api/admin/users/{id}`.
3. "Đặt lại mật khẩu" → popup nhập mật khẩu mới (hoặc BE tự sinh mật khẩu ngẫu nhiên và hiển thị 1 lần cho Admin) → `PUT /api/admin/users/{id}/password`.

**Quy tắc nghiệp vụ**
- `DELETE /api/admin/users/{id}` là **hard delete** thật sự, **không phải** cách khác của khoá tài khoản (khoá tài khoản đã có sẵn qua field `active` ở màn 5.4 — hai thao tác phải tách biệt, không trùng nghĩa). Chỉ xoá được User **chưa phát sinh dữ liệu nghiệp vụ** nào (Expense, Income, Budget, Category riêng). Nếu User đã có dữ liệu liên quan → BE trả **409 Conflict**, gợi ý Admin dùng chức năng khoá tài khoản (`active = false`) thay thế (BR-16).
- Admin không được tự xoá/khoá chính tài khoản Admin đang đăng nhập (BR-17).
- Đặt lại mật khẩu cho User dùng endpoint riêng `PUT /api/admin/users/{id}/password` (xem mục 8.1), tách biệt hoàn toàn khỏi form sửa thông tin ở mục 5.4 — đúng với luồng ở màn 4.1 ("User quên mật khẩu → Admin đặt lại giúp").

### 5.4. Thêm / Sửa người dùng (User Form)

**Mục đích:** Tạo mới hoặc cập nhật thông tin người dùng. **Không** dùng để đổi mật khẩu (xem chức năng "Đặt lại mật khẩu" riêng ở màn 5.3).

**Thành phần giao diện chính**
- Form nhập liệu
- Nút Lưu / Huỷ

**Trường dữ liệu**

| Trường | Loại input | Validate |
|---|---|---|
| name | Text | Bắt buộc |
| email | Text | Bắt buộc, đúng định dạng, duy nhất |
| password | Password | **Chỉ hiện khi tạo mới**, bắt buộc, tối thiểu 6 ký tự. Khi sửa, field này **không xuất hiện trong form** — đổi mật khẩu dùng API/nút riêng `PUT /api/admin/users/{id}/password` ở màn 5.3, không gộp vào `PUT /api/admin/users/{id}` |
| role | Select (USER/ADMIN) | Bắt buộc |
| active | Switch/Checkbox | Mặc định true |

**Luồng thao tác**
1. Thêm mới: `POST /api/admin/users`. Sửa: `PUT /api/admin/users/{id}`.

**Quy tắc nghiệp vụ**
- Email trùng → BE trả 409 Conflict (BR-01).
- Admin đặt mật khẩu khởi tạo trực tiếp khi tạo User; BE hash bằng BCrypt trước khi lưu, **không lưu/log plaintext** (chốt v2.1 — thay cho phương án gửi email kích hoạt, ngoài scope mock project).

### 5.5. Quản lý danh mục chung (Category — Admin)

**Mục đích:** Quản trị toàn bộ danh mục dùng chung (`userId = NULL`) cho cả hệ thống.

**Thành phần giao diện chính**
- Bảng: tên, mô tả, loại (expense/income)
- Nút Thêm / Sửa / Xoá

**Trường dữ liệu**

| Trường | Loại input | Validate |
|---|---|---|
| name | Text | Bắt buộc |
| description | Text | Không bắt buộc |
| type | Select (EXPENSE/INCOME) | Bắt buộc |

**Luồng thao tác**
1. `GET/POST/PUT/DELETE /api/admin/categories`.

**Quy tắc nghiệp vụ**
- Danh mục do admin tạo có `userId = NULL` (danh mục chung).
- Không cho xoá danh mục đang được **Expense / Income / Budget / BudgetTemplateItem** tham chiếu (409 Conflict) (BR-09).

### 5.6. Quản lý mẫu ngân sách (Budget Template)

**Mục đích:** Tạo các mẫu ngân sách mặc định để gợi ý/áp dụng nhanh cho người dùng.

**Thành phần giao diện chính**
- Bảng: tên mẫu, tháng áp dụng
- Form thêm/sửa cho phép cấu hình nhiều danh mục + hạn mức mặc định

**Trường dữ liệu**

| Trường | Loại input | Validate |
|---|---|---|
| name | Text | Bắt buộc |
| month | Month picker | Bắt buộc |
| items | Danh sách (category + amount) | Ít nhất 1 dòng; `category` chỉ chọn từ danh mục **chung** loại EXPENSE (không hiện category riêng của bất kỳ user nào trong dropdown); không chọn trùng category trong cùng template |

**Luồng thao tác**
1. `GET/POST/PUT/DELETE /api/admin/budget-templates`.

**Quy tắc nghiệp vụ**
- Mỗi template gồm nhiều `TemplateItem` (category + defaultAmount), lưu quan hệ khoá ngoại thay vì JSON.
- `TemplateItem.categoryId` chỉ được chọn từ Category chung (`userId = NULL`) + type EXPENSE; chọn category riêng của user khác hoặc category INCOME → 400 Bad Request (BR-21).
- Trong cùng một template không được có 2 item cùng category (`UNIQUE(templateId, categoryId)`, BR-21).
- Template do Admin tạo được User xem và áp dụng cho tháng của mình qua Client API (`GET /api/budget-templates`, `POST /api/budget-templates/{id}/apply`) — xem mục 4.9 và 7.6. Nếu không áp dụng, template chỉ tồn tại như dữ liệu tham khảo, không tự động tạo Budget cho user.

### 5.7. Quản lý chi tiêu toàn hệ thống (Expense — Admin)

**Mục đích:** Xem và quản lý toàn bộ khoản chi tiêu của mọi người dùng.

**Thành phần giao diện chính**
- Bộ lọc: theo user, category, khoảng ngày
- Bảng danh sách + phân trang
- Xem chi tiết / Sửa / Xoá

**Luồng thao tác**
1. `GET /api/admin/expenses` kèm params (`page, size, userId, categoryId, fromDate, toDate`).
2. `GET /api/admin/expenses/{id}` xem chi tiết.
3. `PUT /api/admin/expenses/{id}` sửa, `DELETE /api/admin/expenses/{id}` xoá.

### 5.8. Quản lý thu nhập toàn hệ thống (Income — Admin)

**Mục đích:** Xem và quản lý toàn bộ nguồn thu nhập của mọi người dùng.

**Thành phần giao diện chính**
- Bộ lọc: theo user, category, khoảng ngày
- Bảng danh sách + phân trang
- Xem chi tiết / Sửa / Xoá

**Luồng thao tác**
1. `GET /api/admin/incomes` kèm params (`page, size, userId, categoryId, fromDate, toDate`).
2. Click 1 dòng → `GET /api/admin/incomes/{id}` xem chi tiết.
3. `PUT /api/admin/incomes/{id}` sửa, `DELETE /api/admin/incomes/{id}` xoá.

### 5.9. Nhật ký hoạt động (Activity Log)

**Mục đích:** Theo dõi lịch sử thao tác của người dùng và admin.

**Thành phần giao diện chính**
- Bảng: thời gian, người thực hiện, hành động, mô tả
- Bộ lọc theo user / loại hành động / khoảng thời gian
- Nút Xoá log

**Luồng thao tác**
1. `GET /api/admin/activity-logs` kèm params (`page, size, userId, action, fromDate, toDate`).
2. `DELETE /api/admin/activity-logs/{id}` hoặc xoá hàng loạt theo filter.

**Quy tắc nghiệp vụ**
- Log được BE tự động ghi (qua AOP/Interceptor) mỗi khi login/logout hoặc CRUD Expense/Income/Category/Budget/User — FE không tạo log thủ công (BR-08).

---

## 6. Tổng hợp quy tắc nghiệp vụ (Business Rules)

| Mã | Quy tắc |
|---|---|
| BR-01 | Email người dùng là duy nhất; trùng email → 409 Conflict. |
| BR-02 | Role hợp lệ: USER, ADMIN. `/api/admin/**` yêu cầu role = ADMIN. |
| BR-03 | User chỉ thao tác trên dữ liệu của chính mình; BE lấy `userId` từ token. |
| BR-04 | `amount` của expense/income phải > 0. |
| BR-05 | Category dùng cho expense phải có type = EXPENSE; cho income phải type = INCOME. |
| BR-06 | Khi tổng chi của danh mục/tháng > hạn mức ngân sách → `isOverBudget = true`, hiển thị cảnh báo. |
| BR-07 | User chỉ sửa/xoá danh mục riêng (`userId` của mình); danh mục chung do admin quản lý. |
| BR-08 | Mọi login/logout và create/update/delete thực thể chính đều được ghi Activity Log tự động. |
| BR-09 | Không cho xoá Category đang được **Expense / Income / Budget / BudgetTemplateItem** tham chiếu (409 Conflict). |
| BR-10 | File đính kèm expense giới hạn định dạng ảnh/PDF (`jpeg, png, pdf`), tối đa **5 file/Expense** (tính tổng file hiện có + file mới upload, không phải 5 file/request), tối đa 5MB/file. |
| BR-11 | `date` của expense không được là ngày trong tương lai. |
| BR-12 | Một user chỉ có một Budget cho cùng `categoryId` + `month`; ràng buộc `UNIQUE(userId, categoryId, month)` ở CSDL, vi phạm → 409 Conflict. |
| BR-13 | Budget chỉ được áp dụng cho Category type = EXPENSE. |
| BR-14 | Category dùng trong Expense/Income phải là danh mục chung (`userId = NULL`) hoặc thuộc chính user đang thao tác; category của user khác → 404 Not Found. |
| BR-15 | Không cho đổi `type` của Category (EXPENSE ↔ INCOME) nếu category đó đã được Expense/Income/Budget/TemplateItem tham chiếu (409 Conflict). |
| BR-16 | `DELETE /api/admin/users/{id}` là **hard delete thật sự**, tách biệt với khoá tài khoản (`active = false`, thao tác qua sửa User). Chỉ cho xoá User chưa phát sinh Expense/Income/Budget/Category riêng; nếu đã có dữ liệu → 409 Conflict, yêu cầu khoá tài khoản thay vì xoá. ActivityLog **không** tính là dữ liệu chặn xoá — khi hard-delete, `activity_logs.userId` được set NULL (giữ nguyên snapshot `actorName`/`actorEmail`), xem BR-22. |
| BR-17 | Admin không được tự xoá/khoá chính tài khoản Admin đang đăng nhập. |
| BR-18 | Dữ liệu import qua CSV phải tuân theo cùng bộ validate như API CRUD tương ứng (amount > 0, category đúng type, ngày hợp lệ...); dòng nào không hợp lệ bị bỏ qua và ghi vào `errors`, các dòng hợp lệ khác vẫn được import (partial import). |
| BR-19 | Toàn bộ số tiền (`amount`) dùng kiểu `DECIMAL` ở CSDL và `BigDecimal` ở BE, không dùng `double`/`float` để tránh sai số làm tròn. |
| BR-20 | Đặt lại mật khẩu User dùng riêng `PUT /api/admin/users/{id}/password`, tách khỏi `PUT /api/admin/users/{id}` (sửa thông tin thường); mọi lần reset đều ghi Activity Log `RESET_USER_PASSWORD`. |
| BR-21 | `BudgetTemplateItem.categoryId` chỉ được trỏ Category **chung** (`userId = NULL`) và **type = EXPENSE**; mỗi template không có 2 dòng cùng category (`UNIQUE(templateId, categoryId)`). |
| BR-22 | Khi hard-delete User, `activity_logs.userId` set NULL (`ON DELETE SET NULL`) nhưng bản ghi log giữ nguyên snapshot `actorName`/`actorEmail` đã lưu tại thời điểm ghi log — không mất dấu vết audit dù User gốc đã bị xoá. |
| BR-23 | `POST /api/auth/forgot-password` luôn trả response thành công chung chung, không tiết lộ email có tồn tại trong hệ thống hay không (chống dò/enumerate email). |
| BR-24 | Token reset mật khẩu (`PasswordResetToken`) có hạn dùng 15–30 phút và chỉ dùng được **1 lần**; `usedAt` chỉ được set khi cập nhật mật khẩu **thành công** (validation fail hoặc lỗi hệ thống không consume token). Token đã dùng hoặc hết hạn → vô hiệu, yêu cầu lại từ đầu qua `forgot-password`. Reset mật khẩu thành công **không** tự động mở khoá tài khoản đang bị `active=false`. |
| BR-25 | Khi import Expense/Income qua CSV, nếu tên category trùng cả ở danh mục riêng của user và danh mục chung, **ưu tiên category riêng của user** trước, chỉ dùng category chung khi user không có category riêng cùng tên/type. |

---

## 7. Tài liệu API — Client API

Tiền tố chung: `/api`. Yêu cầu header `Authorization: Bearer <token>`, trừ nhóm Auth.

### 7.1. Auth

#### `POST /api/auth/login`
Đăng nhập, trả về access token + thông tin user. **Quyền:** Công khai.

**Request body**
```json
{ "email": "user@example.com", "password": "123456" }
```
**Response 200**
```json
{
  "status": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "name": "Nguyen Van A", "email": "user@example.com", "role": "USER" }
  }
}
```

#### `POST /api/auth/logout`
Đăng xuất. **Quyền:** USER / ADMIN.

**Response 200**
```json
{ "status": 200, "message": "Đăng xuất thành công", "data": null }
```

> ⚙️ **Chốt cơ chế JWT logout (v2.1):** Hệ thống dùng JWT **stateless**, access token có thời hạn ngắn (ví dụ 1–2 giờ) và BE **không** duy trì blacklist/revocation store cho mock project này. `POST /api/auth/logout` chỉ có tác dụng: (1) FE xoá token khỏi bộ nhớ/localStorage, (2) BE ghi Activity Log hành động `LOGOUT`. Token cũ về mặt kỹ thuật vẫn hợp lệ đến khi hết hạn tự nhiên — chấp nhận được với scope mock project vì thời hạn token ngắn. Đây **không phải** cơ chế thu hồi token tức thời; nếu sau này cần revoke ngay lập tức, phải bổ sung refresh-token + storage riêng (ngoài scope hiện tại).

#### `POST /api/auth/forgot-password`
Yêu cầu gửi email đặt lại mật khẩu. **Quyền:** Công khai.
**Request body**
```json
{ "email": "user@example.com" }
```
**Response 200 (luôn trả 200 dù email có tồn tại hay không — BR-23)**
```json
{ "status": 200, "message": "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu", "data": null }
```
Nếu email tồn tại, BE sinh token reset (random, đủ độ dài entropy), lưu `tokenHash = SHA-256(token)` kèm hạn dùng (15–30 phút) và gửi email chứa link `https://<fe-domain>/reset-password?token=...` (token gốc, chưa hash).

#### `POST /api/auth/reset-password`
Đặt mật khẩu mới bằng token nhận từ email. **Quyền:** Công khai (xác thực qua token, không qua Bearer header).
**Request body**
```json
{ "token": "a1b2c3...", "newPassword": "NewPass@123" }
```
**Response 200**
```json
{ "status": 200, "message": "Đặt lại mật khẩu thành công", "data": null }
```
**Response 400 (token sai/hết hạn/đã dùng, hoặc `newPassword` không hợp lệ)**
```json
{ "status": 400, "message": "Token không hợp lệ hoặc đã hết hạn", "data": null }
```
BE hash token nhận được (SHA-256) rồi so khớp `tokenHash` để xác định bản ghi. Token chỉ dùng được 1 lần: `usedAt` **chỉ được set khi cập nhật mật khẩu thành công**. Nếu request thất bại vì lý do khác (VD: `newPassword` không đạt validation tối thiểu 6 ký tự, lỗi hệ thống...) thì token **không** bị consume và vẫn dùng được cho tới khi hết hạn (BR-24). Ghi Activity Log `RESET_PASSWORD_SELF` khi thành công.

### 7.2. Dashboard

#### `GET /api/dashboard/summary`
Tổng thu nhập, tổng chi tiêu, số dư tháng hiện tại. **Quyền:** USER.

**Response 200**
```json
{ "status": 200, "message": "Thành công", "data": { "totalIncome": 15000000, "totalExpense": 9800000, "balance": 5200000 } }
```

#### `GET /api/dashboard/expense-by-category`
Dữ liệu chi tiêu theo danh mục để vẽ biểu đồ. **Quyền:** USER.

**Response 200**
```json
{ "status": 200, "message": "Thành công", "data": [ { "categoryId": 3, "name": "Ăn uống", "amount": 4200000 } ] }
```

### 7.3. Expense

#### `GET /api/expenses`
Danh sách chi tiêu (phân trang, search, filter). **Quyền:** USER.

**Tham số:** `page, size, sort` (page bắt đầu từ 0), `search` (tên khoản chi), `categoryId`, `fromDate, toDate`, `minAmount, maxAmount`.

**Response 200**
```json
{
  "status": 200,
  "message": "Thành công",
  "data": {
    "items": [
      { "id": 12, "title": "Ăn trưa", "amount": 50000, "date": "2026-08-14", "categoryId": 3, "categoryName": "Ăn uống", "note": "Cơm văn phòng" }
    ],
    "page": 0, "size": 10, "totalItems": 42, "totalPages": 5
  }
}
```

#### `GET /api/expenses/{id}`
Chi tiết 1 khoản chi tiêu kèm danh sách file đính kèm. **Quyền:** USER (chủ sở hữu).

**Response 200**
```json
{
  "status": 200,
  "message": "Thành công",
  "data": {
    "id": 12, "title": "Ăn trưa", "amount": 50000, "date": "2026-08-14",
    "categoryId": 3, "categoryName": "Ăn uống", "note": "Cơm văn phòng",
    "attachments": [ { "id": 7, "fileName": "bill.jpg", "fileUrl": "/files/bill.jpg" } ]
  }
}
```

#### `POST /api/expenses`
Tạo mới khoản chi tiêu (multipart/form-data khi có file đính kèm). **Quyền:** USER.

**Request body**
```json
{ "title": "Ăn trưa", "amount": 50000, "date": "2026-08-14", "categoryId": 3, "note": "Cơm văn phòng" }
```
**Response 201**
```json
{ "status": 201, "message": "Tạo chi tiêu thành công", "data": { "id": 12, "budgetWarning": { "isOverBudget": true, "categoryId": 3 } } }
```

#### `PUT /api/expenses/{id}`
Cập nhật khoản chi tiêu. **Quyền:** USER (chủ sở hữu).
```json
{ "status": 200, "message": "Cập nhật thành công", "data": { "id": 12 } }
```

#### `DELETE /api/expenses/{id}`
Xoá khoản chi tiêu. **Quyền:** USER (chủ sở hữu).
```json
{ "status": 200, "message": "Xoá thành công", "data": null }
```
Xoá cascade toàn bộ Attachment liên quan (bản ghi + file vật lý trên volume).

#### `DELETE /api/expenses/{expenseId}/attachments/{attachmentId}`
Xoá một file đính kèm cụ thể mà không xoá cả khoản chi. **Quyền:** USER (chủ sở hữu Expense).
```json
{ "status": 200, "message": "Xoá file đính kèm thành công", "data": null }
```
Trả 404 nếu `attachmentId` không tồn tại hoặc không thuộc `expenseId` đã cho.

### 7.4. Income

#### `GET /api/incomes`
Danh sách thu nhập (phân trang, filter theo tháng/danh mục). **Quyền:** USER.
**Tham số:** `page, size`, `month` (yyyy-MM), `categoryId`.
```json
{ "status": 200, "message": "Thành công", "data": { "items": [ { "id": 4, "source": "Lương tháng 8", "amount": 15000000, "date": "2026-08-01", "categoryId": 1, "categoryName": "Lương" } ], "page": 0, "size": 10, "totalItems": 8, "totalPages": 1 } }
```

#### `POST /api/incomes`
Tạo mới nguồn thu nhập. **Quyền:** USER.
**Request body**
```json
{ "source": "Lương tháng 8", "amount": 15000000, "date": "2026-08-01", "categoryId": 1, "note": "" }
```
**Response 201**
```json
{ "status": 201, "message": "Tạo thu nhập thành công", "data": { "id": 4 } }
```

#### `PUT /api/incomes/{id}` — Cập nhật nguồn thu nhập. **Quyền:** USER (chủ sở hữu).
#### `DELETE /api/incomes/{id}` — Xoá nguồn thu nhập. **Quyền:** USER (chủ sở hữu).

### 7.5. Category (Client)

#### `GET /api/categories`
Danh sách danh mục: danh mục chung + danh mục riêng của user (có thể lọc theo type). **Quyền:** USER.
```json
{
  "status": 200,
  "message": "Thành công",
  "data": [
    { "id": 3, "name": "Ăn uống", "type": "EXPENSE", "scope": "COMMON" },
    { "id": 15, "name": "Nuôi mèo", "type": "EXPENSE", "scope": "PRIVATE" }
  ]
}
```

#### `POST /api/categories`
Thêm danh mục riêng của user (`userId` gán tự động từ token). **Quyền:** USER.
**Request body**
```json
{ "name": "Nuôi mèo", "description": "Thức ăn, cát vệ sinh", "icon": "cat", "type": "EXPENSE" }
```
**Response 201**
```json
{ "status": 201, "message": "Tạo danh mục thành công", "data": { "id": 15 } }
```

#### `PUT /api/categories/{id}`
Sửa danh mục riêng của user. **Quyền:** USER (chủ sở hữu).
- Chỉ sửa được danh mục riêng; sửa danh mục chung → 403 Forbidden.

#### `DELETE /api/categories/{id}`
Xoá danh mục riêng (chặn nếu đang được dùng). **Quyền:** USER (chủ sở hữu).
- Đang được expense/budget dùng → 409 Conflict.

### 7.6. Budget

#### `GET /api/budgets`
Danh sách ngân sách theo tháng, kèm `spent` & `isOverBudget`. **Quyền:** USER.
**Tham số:** `month` (yyyy-MM), `categoryId`.
```json
{
  "status": 200,
  "message": "Thành công",
  "data": {
    "items": [ { "id": 1, "categoryId": 3, "categoryName": "Ăn uống", "month": "2026-08", "amount": 2000000, "spent": 2350000, "isOverBudget": true } ],
    "page": 0, "size": 10, "totalItems": 1, "totalPages": 1
  }
}
```

#### `POST /api/budgets`
Tạo mới ngân sách. **Quyền:** USER.
**Request body**
```json
{ "categoryId": 3, "month": "2026-08", "amount": 2000000 }
```
**Response 201**
```json
{ "status": 201, "message": "Tạo ngân sách thành công", "data": { "id": 1 } }
```

#### `PUT /api/budgets/{id}` — Sửa ngân sách. **Quyền:** USER (chủ sở hữu).
#### `DELETE /api/budgets/{id}` — Xoá ngân sách. **Quyền:** USER (chủ sở hữu).

Tạo/sửa Budget trùng `(categoryId, month)` với bản ghi đã có → 409 Conflict (BR-12).

### 7.6b. Budget Template (Client — xem trước & áp dụng)

#### `GET /api/budget-templates`
Xem danh sách mẫu ngân sách do Admin tạo (chỉ đọc). **Quyền:** USER.
```json
{ "status": 200, "message": "Thành công", "data": [ { "id": 1, "name": "Mẫu tháng chuẩn", "month": "2026-08", "items": [ { "categoryId": 3, "categoryName": "Ăn uống", "defaultAmount": 4000000 } ] } ] }
```

#### `POST /api/budget-templates/{id}/apply`
Áp dụng mẫu để tạo hàng loạt Budget cho user hiện tại trong một tháng cụ thể. **Quyền:** USER.
**Request body**
```json
{ "month": "2026-09" }
```
**Response 200**
```json
{ "status": 200, "message": "Áp dụng mẫu ngân sách thành công", "data": { "createdCount": 4, "skippedCount": 1, "skippedCategories": [3] } }
```
`skippedCount`/`skippedCategories` liệt kê các category mà user đã có Budget cho tháng đó (không bị ghi đè, theo quy tắc ở mục 4.9).

### 7.7. Report & Analytics

#### `GET /api/reports/summary`
Báo cáo tổng hợp theo `period = month | quarter | year`, **hoặc** theo khoảng ngày tuỳ chỉnh. **Quyền:** USER.
**Tham số:** `period` + `value` (ví dụ 2026-08 / 2026-Q3 / 2026) **hoặc** `from` + `to` (yyyy-MM-dd) — hai bộ tham số dùng loại trừ nhau, không gửi đồng thời.
```json
{ "status": 200, "message": "Thành công", "data": { "totalIncome": 45000000, "totalExpense": 30000000, "byCategory": [ { "name": "Ăn uống", "amount": 12000000 } ] } }
```

#### `GET /api/reports/trend`
Dữ liệu xu hướng chi tiêu theo khoảng thời gian `from/to`. **Quyền:** USER.
```json
{ "status": 200, "message": "Thành công", "data": [ { "period": "2026-06", "expense": 9000000 }, { "period": "2026-07", "expense": 9500000 } ] }
```

---

## 8. Tài liệu API — Admin API

Tiền tố chung: `/api/admin`. Yêu cầu header `Authorization: Bearer <token>` với role = ADMIN, nếu không đủ quyền trả 403 Forbidden.

### 8.1. User (Admin)

#### `GET /api/admin/users`
Danh sách người dùng (phân trang, filter theo trạng thái). **Quyền:** ADMIN.
**Tham số:** `page, size`, `search` (tên/email), `active` (true|false).
```json
{ "status": 200, "message": "Thành công", "data": { "items": [ { "id": 1, "name": "Nguyen Van A", "email": "a@example.com", "role": "USER", "active": true } ], "page": 0, "size": 10, "totalItems": 25, "totalPages": 3 } }
```

#### `GET /api/admin/users/{id}`
Xem hồ sơ chi tiết 1 người dùng. **Quyền:** ADMIN.
```json
{ "status": 200, "message": "Thành công", "data": { "id": 1, "name": "Nguyen Van A", "email": "a@example.com", "role": "USER", "active": true, "totalExpense": 9800000, "totalIncome": 15000000 } }
```

#### `POST /api/admin/users`
Tạo mới người dùng. **Quyền:** ADMIN.
**Request body**
```json
{ "name": "Tran B", "email": "b@example.com", "password": "Abc@123456", "role": "USER", "active": true }
```
**Response 201**
```json
{ "status": 201, "message": "Tạo người dùng thành công", "data": { "id": 26 } }
```
`password` bắt buộc khi tạo mới, tối thiểu 6 ký tự, BE hash bằng BCrypt trước khi lưu (BR liên quan tới mật khẩu — xem mục 5.4).

#### `PUT /api/admin/users/{id}` — Cập nhật thông tin người dùng (name/email/role/active — **không** gồm password). **Quyền:** ADMIN.

#### `PUT /api/admin/users/{id}/password`
Đặt lại mật khẩu cho một User. **Quyền:** ADMIN.
**Request body**
```json
{ "newPassword": "NewPass@123" }
```
**Response 200**
```json
{ "status": 200, "message": "Đặt lại mật khẩu thành công", "data": null }
```
`newPassword` tối thiểu 6 ký tự, BE hash BCrypt trước khi lưu; tách hoàn toàn khỏi `PUT /api/admin/users/{id}` để tránh việc sửa thông tin vô tình đổi luôn mật khẩu (BR-20). Mỗi lần gọi ghi Activity Log `RESET_USER_PASSWORD`.

#### `DELETE /api/admin/users/{id}`
Xoá người dùng. **Quyền:** ADMIN.
**Response 200 (xoá được — chưa có dữ liệu nghiệp vụ)**
```json
{ "status": 200, "message": "Xoá người dùng thành công", "data": null }
```
**Response 409 (đã có dữ liệu nghiệp vụ)**
```json
{ "status": 409, "message": "Không thể xoá người dùng đã phát sinh dữ liệu. Hãy khoá tài khoản thay thế.", "data": null }
```
Đây là **hard delete thật sự**, chỉ thực hiện được khi User chưa có Expense/Income/Budget/Category riêng nào; nếu đã có, Admin dùng `PUT /api/admin/users/{id}` với `active=false` để khoá tài khoản thay vì xoá (BR-16).

### 8.2. Category (Admin)

#### `GET /api/admin/categories`
Danh sách danh mục chung toàn hệ thống. **Quyền:** ADMIN.
```json
{ "status": 200, "message": "Thành công", "data": [ { "id": 3, "name": "Ăn uống", "type": "EXPENSE" } ] }
```

#### `POST /api/admin/categories`
Tạo danh mục chung (`userId = NULL`). **Quyền:** ADMIN.
**Request body**
```json
{ "name": "Lương", "description": "Thu nhập chính", "type": "INCOME" }
```
**Response 201**
```json
{ "status": 201, "message": "Tạo danh mục thành công", "data": { "id": 10 } }
```

#### `PUT /api/admin/categories/{id}` — Sửa danh mục chung. **Quyền:** ADMIN.
#### `DELETE /api/admin/categories/{id}` — Xoá danh mục chung (chặn nếu đang dùng → 409). **Quyền:** ADMIN.

### 8.3. Budget Template

#### `GET /api/admin/budget-templates`
Danh sách mẫu ngân sách. **Quyền:** ADMIN.
```json
{ "status": 200, "message": "Thành công", "data": [ { "id": 1, "name": "Mẫu tháng chuẩn", "month": "2026-08" } ] }
```

#### `POST /api/admin/budget-templates`
Tạo mẫu ngân sách với các item (category + hạn mức). **Quyền:** ADMIN.
**Request body**
```json
{
  "name": "Mẫu tháng chuẩn",
  "month": "2026-08",
  "items": [ { "categoryId": 3, "defaultAmount": 4000000 }, { "categoryId": 5, "defaultAmount": 2000000 } ]
}
```
**Response 201**
```json
{ "status": 201, "message": "Tạo template thành công", "data": { "id": 1 } }
```

#### `PUT /api/admin/budget-templates/{id}` — Sửa mẫu ngân sách. **Quyền:** ADMIN.
#### `DELETE /api/admin/budget-templates/{id}` — Xoá mẫu ngân sách. **Quyền:** ADMIN.

### 8.4. Expense (Admin)

#### `GET /api/admin/expenses`
Danh sách chi tiêu toàn hệ thống (filter theo user/category/date). **Quyền:** ADMIN.
**Tham số:** `page, size, sort` (page bắt đầu từ 0), `userId`, `categoryId`, `fromDate, toDate`.
```json
{ "status": 200, "message": "Thành công", "data": { "items": [], "page": 0, "size": 10, "totalItems": 100, "totalPages": 10 } }
```

#### `GET /api/admin/expenses/{id}` — Chi tiết 1 khoản chi tiêu. **Quyền:** ADMIN.
#### `PUT /api/admin/expenses/{id}` — Sửa khoản chi tiêu. **Quyền:** ADMIN.
#### `DELETE /api/admin/expenses/{id}` — Xoá khoản chi tiêu. **Quyền:** ADMIN.

### 8.5. Income (Admin)

#### `GET /api/admin/incomes`
Danh sách thu nhập toàn hệ thống (filter theo user/category/date). **Quyền:** ADMIN.
**Tham số:** `page, size, sort` (page bắt đầu từ 0), `userId`, `categoryId`, `fromDate, toDate`.
```json
{ "status": 200, "message": "Thành công", "data": { "items": [], "page": 0, "size": 10, "totalItems": 60, "totalPages": 6 } }
```

#### `GET /api/admin/incomes/{id}` — Chi tiết 1 nguồn thu nhập. **Quyền:** ADMIN.
#### `PUT /api/admin/incomes/{id}` — Sửa nguồn thu nhập. **Quyền:** ADMIN.
#### `DELETE /api/admin/incomes/{id}` — Xoá nguồn thu nhập. **Quyền:** ADMIN.

### 8.6. Activity Log

#### `GET /api/admin/activity-logs`
Danh sách nhật ký hoạt động (filter theo user/action/date). **Quyền:** ADMIN.
```json
{ "status": 200, "message": "Thành công", "data": { "items": [ { "id": 1, "createdAt": "2026-08-14T09:00:00", "userId": 1, "actorName": "Nguyen Van A", "actorEmail": "a@example.com", "action": "CREATE_EXPENSE", "description": "Tạo chi tiêu #12" } ], "page": 0, "size": 10, "totalItems": 200, "totalPages": 20 } }
```
Response khớp trực tiếp model `ActivityLog` (mục 3): `userId`, `actorName`, `actorEmail` — không còn field `user` gộp. Khi User bị hard-delete, `userId` trả về `null` nhưng `actorName`/`actorEmail` vẫn giữ nguyên (snapshot), ví dụ:
```json
{ "id": 2, "createdAt": "2026-08-14T09:05:00", "userId": null, "actorName": "Nguyen Van A", "actorEmail": "a@example.com", "action": "LOGIN", "description": "Đăng nhập hệ thống" }
```

#### `DELETE /api/admin/activity-logs/{id}` — Xoá 1 log. **Quyền:** ADMIN.

---

## 9. Import / Export API

#### `GET /api/admin/export/{entity}?format=csv`
Xuất CSV cho entity: `user, expense, income, category, budget`. **Quyền:** ADMIN.

Trả về file `text/csv` để tải xuống (`Content-Disposition: attachment; filename="expense.csv"`).

**Cột Export cho từng entity** (chốt v2.2 — chỉ dùng khi xuất, xem riêng phần Import schema bên dưới):

| Entity | Cột CSV Export |
|---|---|
| `expense` | `userEmail, title, category, amount, date, note` |
| `income` | `userEmail, source, category, amount, date, note` |
| `user` | `id, name, email, role, active, totalExpense, totalIncome, balance` |
| `category` | `id, name, description, type, scope` (`scope` = COMMON/PRIVATE) |
| `budget` | `userEmail, category, month, amount, spent, isOverBudget` (`spent`, `isOverBudget` là **derived field**, chỉ để tham khảo khi export, không dùng khi import) |

#### `POST /api/admin/import/{entity}`
Nhập CSV cho entity (multipart/form-data, field `file`). **Quyền:** ADMIN.
```json
{
  "status": 200,
  "message": "Import hoàn tất",
  "data": { "successCount": 48, "failedCount": 2, "errors": ["Dòng 12: amount không hợp lệ"] }
}
```

> ⚠️ **Chốt quan trọng (v2.2): Import và Export dùng SCHEMA CỘT KHÁC NHAU, không phải cùng một file đọc/ghi được cho nhau.** Ở bản v2.1, tài liệu yêu cầu "header import phải khớp cột export" — điều này **không khả thi**: cột export User không có `password` (User import xong không đăng nhập được); cột export Expense không có `userEmail`/`title` (Admin import không biết Expense thuộc user nào, thiếu field bắt buộc của Entity); cột export Budget có `spent`/`isOverBudget` là giá trị BE tự tính, không nên cho phép ghi tay qua import. Vì vậy **Import Schema được định nghĩa riêng** như sau:

**Cột Import cho từng entity:**

| Entity | Cột CSV Import | Ghi chú |
|---|---|---|
| `user` | `name, email, password, role, active` | `password` bắt buộc (Admin đặt sẵn, User đổi sau nếu muốn); không có `id` (luôn tạo mới) |
| `expense` | `userEmail, title, category, amount, date, note` | Resolve User theo `userEmail`; `category` resolve theo tên trong phạm vi danh mục chung hoặc riêng của đúng user đó |
| `income` | `userEmail, source, category, amount, date, note` | Tương tự Expense; `category` phải thuộc type INCOME |
| `category` | `name, description, type` | Import category **chung** (Admin tạo, `userId = NULL`); không có `id`, không có `scope` (mặc định COMMON) |
| `budget` | `userEmail, category, month, amount` | Không có `spent`, `isOverBudget` — hai trường này BE tự tính lại sau khi import, không import trực tiếp; vi phạm UNIQUE(user, category, month) → dòng đó bị coi là lỗi (báo trong `errors`), không cập nhật đè |

**CSV specification chung:**

| Thuộc tính | Giá trị |
|---|---|
| Encoding | UTF-8 (có/không BOM đều chấp nhận) |
| Delimiter | `,` (phẩy) |
| Dòng header | Bắt buộc, phải khớp đúng tên cột theo **bảng Import** ở trên (không phải bảng Export) |
| Định dạng ngày | `yyyy-MM-dd`; tháng (`budget`) dùng `yyyy-MM` |
| Số thập phân | dấu `.`, không dùng dấu phân cách hàng nghìn |
| Resolve User | theo `email` (không dùng `id` — tránh phụ thuộc ID nội bộ khi import từ file ngoài) |
| Resolve Category | theo `name` + `type`, thứ tự ưu tiên: **(1) category riêng của user đó trước → (2) nếu không có, tìm category chung → (3) không thấy ở cả hai → dòng lỗi.** Áp dụng khi user vừa có category riêng vừa có category chung trùng tên (VD: cả hai đều tên "Ăn uống"/EXPENSE) — ưu tiên riêng để tôn trọng tuỳ biến của user (BR-25) |
| Trùng dữ liệu | Không tự động gộp; mỗi dòng CSV luôn tạo bản ghi mới (import không dùng để update bản ghi đã có) |
| Xử lý lỗi | **Partial import**: dòng hợp lệ được commit, dòng lỗi bị bỏ qua và liệt kê trong `errors` kèm số dòng (BR-18); không rollback toàn file |
| Validate | Áp dụng đúng bộ validate như API CRUD tương ứng (amount > 0, category đúng type...) |
| Giới hạn | Tối đa 5MB/file, tối đa 5.000 dòng dữ liệu/lần import |

---

## 10. Bảng tổng hợp endpoint

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| POST | `/api/auth/forgot-password` | Yêu cầu gửi email đặt lại mật khẩu |
| POST | `/api/auth/reset-password` | Đặt mật khẩu mới bằng token từ email |
| GET | `/api/dashboard/summary` | Số liệu tổng quan tháng |
| GET | `/api/dashboard/expense-by-category` | Chi tiêu theo danh mục |
| GET/POST/PUT/DELETE | `/api/expenses` | CRUD chi tiêu |
| DELETE | `/api/expenses/{expenseId}/attachments/{attachmentId}` | Xoá 1 file đính kèm |
| GET/POST/PUT/DELETE | `/api/incomes` | CRUD thu nhập (theo `categoryId`) |
| GET/POST/PUT/DELETE | `/api/categories` | CRUD danh mục (riêng của user) |
| GET/POST/PUT/DELETE | `/api/budgets` | CRUD ngân sách + cảnh báo |
| GET | `/api/budget-templates` | User xem mẫu ngân sách do Admin tạo |
| POST | `/api/budget-templates/{id}/apply` | User áp dụng mẫu cho một tháng |
| GET | `/api/reports/summary`, `/api/reports/trend` | Báo cáo & phân tích (hỗ trợ `period` hoặc `from/to`) |
| GET/POST/PUT/DELETE | `/api/admin/users` | CRUD người dùng (xoá = hard delete, RESTRICT nếu đã có dữ liệu) |
| PUT | `/api/admin/users/{id}/password` | Admin đặt lại mật khẩu cho User |
| GET/POST/PUT/DELETE | `/api/admin/categories` | CRUD danh mục chung |
| GET/POST/PUT/DELETE | `/api/admin/budget-templates` | CRUD budget template |
| GET/PUT/DELETE | `/api/admin/expenses` | Quản lý chi tiêu hệ thống |
| GET/PUT/DELETE | `/api/admin/incomes` | Quản lý thu nhập hệ thống (có GET detail) |
| GET/DELETE | `/api/admin/activity-logs` | Nhật ký hoạt động |
| GET | `/api/admin/export/{entity}` | Export CSV |
| POST | `/api/admin/import/{entity}` | Import CSV |

---

## 11. Phân công công việc

| Thành viên | Vai trò | Đầu việc chính |
|---|---|---|
| Nghĩa | Thiết kế giao diện (UI/UX) | Thiết kế mockup/Figma cho toàn bộ màn hình ở mục 4, 5 |
| Duy | Thiết kế Database (ERD) | Thiết kế ERD dựa trên mô hình dữ liệu ở mục 3 (MySQL) |
| Huy | Backend (Java + Spring Boot) | Khởi tạo project, `ApiResponse<T>`, Exception Handler, Entity + Repository, hiện thực API mục 7–9 |
| Toàn | Frontend (Next.js) | Khởi tạo project, route group, Axios instance, dựng màn hình mục 4–5 |
| Phương | SRS & API Docs | Tài liệu này; cập nhật liên tục theo tiến độ thực tế |
| Minh | DevOps (Docker) | Dockerfile từng phần, Nginx Reverse Proxy, docker-compose.yml |

---

## 12. Quy trình làm việc (Git & Redmine)

### 12.1. Mô hình quản lý mã nguồn

Trưởng nhóm (Minh) fork repo gốc công ty về tài khoản cá nhân và add cả nhóm làm collaborator. Cả nhóm code, push và tạo PR trực tiếp trên repo của Minh; chỉ Minh có quyền merge PR vào repo công ty.

### 12.2. Quy ước Redmine

- Mọi việc làm phải gắn ticket, không làm ngoài ticket. Ticket ≤ 8h, task lớn hơn chia nhỏ.
- Luồng trạng thái: New → In Progress → Resolved → Closed. Cập nhật % Done & Spent time hàng ngày.

### 12.3. Quy ước nhánh / commit / PR

| Hạng mục | Quy ước | Ví dụ (ticket #1234) |
|---|---|---|
| Tên nhánh | `feature/<mã-ticket>-<mô-tả-ngắn>` | `feature/1234-create-user-model` |
| Commit message | `#<mã-ticket>: <nội-dung>` | `#1234: Add User entity and attributes` |
| Tiêu đề PR | `#<mã-ticket> <nội-dung>` | `#1234 Create user model` |
| Mô tả PR | Dán link ticket Redmine tương ứng | `https://edu-redmine.../issues/1234` |

### 12.4. Các bước tạo Pull Request

1. Chuyển ticket Redmine: New → In Progress.
2. Tạo nhánh mới từ master theo đúng mã ticket.
3. Code và commit theo format `#mã-ticket: nội dung`.
4. Đồng bộ: pull master mới nhất, rebase nhánh làm việc lên master (xử lý conflict nếu có).
5. Push nhánh lên repo của trưởng nhóm.
6. Tạo PR về master: tiêu đề đúng chuẩn, dán link Redmine, tag 2 reviewer.
7. Chuyển ticket: In Progress → Resolved; nhắc reviewer Approve.
8. Trưởng nhóm merge PR; ticket chuyển Resolved → Closed.
9. Định kỳ, trưởng nhóm tạo PR từ repo cá nhân → repo công ty và merge.

---

## 13. Yêu cầu phi chức năng (NFR)

Mock project không cần NFR ở mức enterprise; dưới đây là các mốc tối thiểu để FE/BE/DevOps thống nhất khi triển khai.

| Nhóm | Yêu cầu |
|---|---|
| **Bảo mật** | Mật khẩu hash bằng BCrypt; xác thực qua JWT (xem cơ chế logout ở mục 7.1); không log/response trả plaintext password hoặc token; CORS chỉ whitelist domain FE đã biết; validate MIME/size khi upload (mục 4.5). |
| **Hiệu năng** | API thông thường phản hồi < 2 giây với dữ liệu test của mock project; danh sách luôn phân trang (mặc định `size=10`), không trả toàn bộ bảng không giới hạn. |
| **CSDL** | MySQL 8, charset `utf8mb4`; dùng Flyway/Liquibase để quản lý migration có version, hoặc thống nhất rõ chính sách `ddl-auto` nếu dùng Hibernate tự sinh schema (tránh mỗi máy dev một schema khác nhau). |
| **Khả năng tương thích** | Hỗ trợ trình duyệt Chrome/Edge bản hiện hành; giao diện responsive tối thiểu cho desktop, khuyến khích hỗ trợ tablet/mobile nếu còn thời gian. |
| **Triển khai** | Docker Compose gồm FE, BE, MySQL, Nginx reverse proxy; cấu hình qua biến môi trường (`.env`), không hardcode secret trong image; volume riêng cho MySQL data và thư mục attachment để không mất dữ liệu khi container restart. |
| **Gửi email** | BE tích hợp SMTP (Spring Mail) hoặc dịch vụ email ngoài (ví dụ Mailtrap cho môi trường dev/test) để gửi email "Quên mật khẩu" (mục 4.1b); cấu hình SMTP qua biến môi trường, không hardcode; môi trường dev có thể dùng Mailtrap/Mailhog để không gửi email thật. |

> Chi tiết cấu hình Docker/Nginx/ENV cụ thể (port, tên service, healthcheck...) thuộc phạm vi tài liệu DevOps riêng do Minh phụ trách (mục 11), không lặp lại trong SRS này.
