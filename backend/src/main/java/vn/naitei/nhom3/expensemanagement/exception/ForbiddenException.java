package vn.naitei.nhom3.expensemanagement.exception;

/**
 * 403 Forbidden — dùng khi user cố sửa/xoá danh mục chung (COMMON) của hệ thống.
 * Khác với BadRequestException (400): 403 biểu thị "bạn không có quyền",
 * trong khi 400 biểu thị "dữ liệu bạn gửi không hợp lệ".
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
