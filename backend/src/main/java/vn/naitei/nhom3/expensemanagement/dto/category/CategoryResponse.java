package vn.naitei.nhom3.expensemanagement.dto.category;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Response DTO cho danh mục.
 * Trả về đúng contract API SRS mục 7.5:
 * id, name, description, icon, type, scope (COMMON/PRIVATE).
 */
@Getter
@AllArgsConstructor
public class CategoryResponse {

    private final Long id;
    private final String name;
    private final String description;
    private final String icon;
    private final String type;

    /**
     * Phạm vi danh mục:
     * - COMMON: danh mục chung do admin tạo (userId = null), mọi user đều thấy
     * - PRIVATE: danh mục riêng do user tự tạo, chỉ user đó thấy
     */
    private final String scope;
}
