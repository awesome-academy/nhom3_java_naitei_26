package vn.naitei.nhom3.expensemanagement.controller;

import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.category.CategoryRequest;
import vn.naitei.nhom3.expensemanagement.dto.category.CategoryResponse;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;
import vn.naitei.nhom3.expensemanagement.service.CategoryService;

/**
 * REST Controller cho quản lý danh mục phía client (SRS mục 7.5).
 *
 * Endpoints:
 * - GET    /api/categories          — Danh sách danh mục (chung + riêng)
 * - POST   /api/categories          — Tạo danh mục riêng
 * - PUT    /api/categories/{id}     — Sửa danh mục riêng
 * - DELETE /api/categories/{id}     — Xoá danh mục riêng
 *
 * Quyền: USER. Danh mục chung chỉ được admin sửa/xoá qua /api/admin/categories.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * GET /api/categories
     * Trả về danh mục chung + danh mục riêng của user hiện tại.
     * Có thể lọc theo type (EXPENSE/INCOME).
     *
     * @param type Lọc theo loại danh mục (tuỳ chọn)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) CategoryType type) {
        List<CategoryResponse> categories = categoryService.getVisibleCategories(
                principal.getId(), type);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * GET /api/categories/{id}
     * Lấy chi tiết danh mục theo ID.
     * Trả về nếu là danh mục chung hoặc danh mục riêng thuộc user hiện tại.
     * 404 nếu không tồn tại / không có quyền.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        CategoryResponse response = categoryService.getByIdForUser(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /api/categories
     * Tạo danh mục riêng cho user hiện tại. userId gán tự động từ token.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createForUser(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED, "Tạo danh mục thành công", response));
    }

    /**
     * PUT /api/categories/{id}
     * Sửa danh mục riêng. Chỉ chủ sở hữu mới được sửa (BR-07).
     * Sửa danh mục chung → 403 Forbidden.
     * Đổi loại danh mục đang có dữ liệu → 409 Conflict.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.updateForUser(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục thành công", response));
    }

    /**
     * DELETE /api/categories/{id}
     * Xoá mềm danh mục riêng.
     * Xoá danh mục chung → 403 Forbidden.
     * Đang được sử dụng → 409 Conflict (BR-09).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        categoryService.deleteForUser(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Xoá danh mục thành công", null));
    }
}
