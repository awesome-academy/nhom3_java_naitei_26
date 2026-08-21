package vn.naitei.nhom3.expensemanagement.service;

import java.util.List;

import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;

public interface CategoryService {

    List<Category> getActiveSystemExpenseCategories();

    List<Category> getVisibleToUser(Long userId);

    List<Category> getVisibleToUserByType(Long userId, CategoryType type);

    Category getById(Long id);

    /**
     * userId = null -> tạo danh mục hệ thống (chỉ Admin được phép, kiểm tra ở tầng Controller/Security).
     */
    Category create(Long userId, Category category);

    Category update(Long id, Category updated);

    void delete(Long id);
}
