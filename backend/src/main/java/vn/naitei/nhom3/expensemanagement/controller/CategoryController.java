package vn.naitei.nhom3.expensemanagement.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.category.CategoryResponse;
import vn.naitei.nhom3.expensemanagement.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<Page<CategoryResponse>> getAll(Pageable pageable) {
        List<CategoryResponse> categories = categoryService.getActiveSystemExpenseCategories()
                .stream()
                .map(CategoryResponse::from)
                .toList();
        Page<CategoryResponse> page = new PageImpl<>(categories, pageable, categories.size());
        return ApiResponse.success(page);
    }
}
