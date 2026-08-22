package vn.naitei.nhom3.expensemanagement.dto.category;

import vn.naitei.nhom3.expensemanagement.entity.Category;

/**
 * Mapper chuyển đổi giữa Category entity và CategoryResponse DTO.
 * Tính toán field "scope" dựa trên userId của category:
 * - userId = null → COMMON (danh mục chung)
 * - userId != null → PRIVATE (danh mục riêng)
 */
public final class CategoryMapper {

    private CategoryMapper() {
        // Utility class — không cho phép tạo instance
    }

    /**
     * Chuyển Category entity → CategoryResponse DTO.
     */
    public static CategoryResponse toResponse(Category category) {
        String scope = category.getUser() == null ? "COMMON" : "PRIVATE";
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getIcon(),
                category.getType().name(),
                scope);
    }
}
