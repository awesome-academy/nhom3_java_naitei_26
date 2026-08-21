package vn.naitei.nhom3.expensemanagement.dto.category;

import lombok.AllArgsConstructor;
import lombok.Getter;
import vn.naitei.nhom3.expensemanagement.entity.Category;

@Getter
@AllArgsConstructor
public class CategoryResponse {

    private final Long id;
    private final String name;
    private final String type;
    private final String icon;

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType().name(),
                category.getIcon());
    }
}
