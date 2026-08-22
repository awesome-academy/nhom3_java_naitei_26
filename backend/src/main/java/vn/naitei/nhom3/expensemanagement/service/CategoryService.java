package vn.naitei.nhom3.expensemanagement.service;

import java.util.List;

import vn.naitei.nhom3.expensemanagement.dto.category.CategoryRequest;
import vn.naitei.nhom3.expensemanagement.dto.category.CategoryResponse;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;

/**
 * Service interface cho quản lý danh mục (Category).
 * Hỗ trợ cả client API (danh mục riêng + chung) và internal use.
 */
public interface CategoryService {

    // ==================== ENTITY-LEVEL (dùng nội bộ) ====================

    /**
     * Lấy danh mục hệ thống (chung, chưa bị xoá mềm) theo type EXPENSE.
     * Dùng nội bộ (ví dụ: BudgetTemplate chỉ dùng category chung + EXPENSE).
     */
    List<Category> getActiveSystemExpenseCategories();

    /**
     * Lấy tất cả danh mục visible cho user (chung + riêng, chưa bị xoá mềm).
     */
    List<Category> getVisibleToUser(Long userId);

    /**
     * Lấy danh mục visible cho user, lọc theo type.
     */
    List<Category> getVisibleToUserByType(Long userId, CategoryType type);

    /**
     * Tìm category theo id (chưa bị xoá mềm). Throw 404 nếu không tìm thấy.
     */
    Category getById(Long id);

    /**
     * Lấy chi tiết danh mục theo ID, trả về DTO.
     * Chỉ trả về nếu là danh mục chung hoặc danh mục riêng thuộc user hiện tại.
     * Throw 404 nếu không tìm thấy / không có quyền.
     */
    CategoryResponse getByIdForUser(Long userId, Long id);

    // ==================== DTO-LEVEL (dùng cho Controller) ====================

    /**
     * Lấy danh sách danh mục của user (chung + riêng), tuỳ chọn lọc theo type.
     * Trả về DTO kèm scope (COMMON/PRIVATE).
     */
    List<CategoryResponse> getVisibleCategories(Long userId, CategoryType type);

    /**
     * Tạo danh mục riêng cho user. userId gán tự động từ token.
     * Validate: name không trùng trong scope của user (tuỳ chọn).
     */
    CategoryResponse createForUser(Long userId, CategoryRequest request);

    /**
     * Sửa danh mục riêng của user.
     * - Chỉ sửa được danh mục riêng (userId != null và thuộc user) — BR-07
     * - Không cho đổi type nếu đang có tham chiếu — BR-15
     */
    CategoryResponse updateForUser(Long userId, Long id, CategoryRequest request);

    /**
     * Xoá mềm danh mục riêng của user.
     * - Chỉ xoá được danh mục riêng — BR-07
     * - Chặn nếu đang được Expense/Income/Budget tham chiếu → 409 — BR-09
     */
    void deleteForUser(Long userId, Long id);
}
