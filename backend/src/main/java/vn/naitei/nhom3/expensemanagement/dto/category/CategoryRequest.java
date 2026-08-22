package vn.naitei.nhom3.expensemanagement.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;

/**
 * Request DTO cho tạo/sửa danh mục.
 * User tạo danh mục riêng (userId tự gán từ token), Admin tạo danh mục chung.
 */
@Getter
@Setter
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục tối đa 100 ký tự")
    private String name;

    private String description;

    @Size(max = 255, message = "Icon tối đa 255 ký tự")
    private String icon;

    @NotNull(message = "Loại danh mục không được để trống")
    private CategoryType type;
}
