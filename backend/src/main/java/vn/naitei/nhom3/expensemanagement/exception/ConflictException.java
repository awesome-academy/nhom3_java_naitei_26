package vn.naitei.nhom3.expensemanagement.exception;

/**
 * Exception cho lỗi xung đột dữ liệu (HTTP 409 Conflict).
 * Ví dụ: xoá danh mục đang được expense/income tham chiếu,
 * tạo trùng budget cho cùng category + tháng.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
