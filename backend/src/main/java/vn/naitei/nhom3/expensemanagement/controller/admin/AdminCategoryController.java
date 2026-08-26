package vn.naitei.nhom3.expensemanagement.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.category.CategoryAdminResponse;
import vn.naitei.nhom3.expensemanagement.dto.category.CategoryRequest;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.service.CategoryService;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CategoryAdminResponse>>> getAllSystemCategories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CategoryType type,
            Pageable pageable) {
        Page<CategoryAdminResponse> response = categoryService.getAdminCategories(search, type, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryAdminResponse>> getSystemCategoryById(@PathVariable Long id) {
        CategoryAdminResponse response = categoryService.getAdminCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryAdminResponse>> createSystemCategory(
            @Valid @RequestBody CategoryRequest request) {
        CategoryAdminResponse response = categoryService.createSystemCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED, "Create global category successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryAdminResponse>> updateSystemCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryAdminResponse response = categoryService.updateSystemCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Update global category successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSystemCategory(@PathVariable Long id) {
        categoryService.deleteSystemCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Delete global category successfully", null));
    }
}
