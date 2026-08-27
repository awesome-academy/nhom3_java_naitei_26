package vn.naitei.nhom3.expensemanagement.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.naitei.nhom3.expensemanagement.dto.category.CategoryMapper;
import vn.naitei.nhom3.expensemanagement.dto.category.CategoryRequest;
import vn.naitei.nhom3.expensemanagement.dto.category.CategoryResponse;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.exception.ForbiddenException;
import vn.naitei.nhom3.expensemanagement.exception.ConflictException;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.service.CategoryService;

/**
 * Triển khai CategoryService — quản lý danh mục (chung + riêng).
 *
 * Business rules áp dụng:
 * - BR-07: User chỉ sửa/xoá danh mục riêng; danh mục chung do admin quản lý
 * - BR-09: Không xoá danh mục đang được Expense/Income/Budget tham chiếu → 409
 * - BR-15: Không đổi type (EXPENSE↔INCOME) nếu đang có tham chiếu → 409
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    // ==================== ENTITY-LEVEL (nội bộ) ====================

    @Override
    @Transactional(readOnly = true)
    public List<Category> getActiveSystemExpenseCategories() {
        return categoryRepository.findByUserIsNullAndTypeAndDeletedAtIsNullOrderByIdAsc(
                CategoryType.EXPENSE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Category> getVisibleToUser(Long userId) {
        return categoryRepository.findVisibleToUser(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Category> getVisibleToUserByType(Long userId, CategoryType type) {
        return categoryRepository.findVisibleToUserAndType(userId, type);
    }

    @Override
    @Transactional(readOnly = true)
    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .filter(category -> category.getDeletedAt() == null)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", id));
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getByIdForUser(Long userId, Long id) {
        Category category = getById(id);
        // Chỉ được xem nếu là danh mục chung (user == null) hoặc thuộc chính user
        if (category.getUser() != null && !category.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Category does not exist or is not owned by the user");
        }
        return CategoryMapper.toResponse(category);
    }



    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getVisibleCategories(Long userId, CategoryType type) {
        List<Category> categories;
        if (type != null) {
            categories = categoryRepository.findVisibleToUserAndType(userId, type);
        } else {
            categories = categoryRepository.findVisibleToUser(userId);
        }
        return categories.stream()
                .map(CategoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponse createForUser(Long userId, CategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        // BR: Prevent duplicate category name for the same user and type (case-insensitive)
        categoryRepository.findByUserIdAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(userId, request.getName().trim(), request.getType())
                .ifPresent(c -> { throw new ConflictException("Category already exists in your system."); });

        // BR: Prevent user from creating a category with the same name as a SYSTEM category (case-insensitive)
        categoryRepository.findByUserIsNullAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(request.getName().trim(), request.getType())
                .ifPresent(c -> { throw new ConflictException("Category name conflicts with a system default category."); });

        Category category = new Category();
        category.setUser(user);  // Danh mục riêng — gán userId từ token
        applyRequestToEntity(category, request);

        return CategoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateForUser(Long userId, Long id, CategoryRequest request) {
        Category category = getById(id);

        // Use case "Sửa": Là danh mục chung? → 403 Forbidden
        if (category.getUser() == null) {
            throw new ForbiddenException("Cannot edit system category");
        }

        // Không tồn tại / Không chính chủ → 404 Not Found
        if (!category.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Category does not exist or is not owned by the user");
        }

        // BR-15: Danh mục đã được dùng trong 1 expense/income? → 409 Conflict (không cho đổi type)
        if (request.getType() != category.getType() && isCategoryReferenced(id)) {
            throw new ConflictException(
                    "Cannot change the type of a category that has already generated data");
        }

        // BR: Prevent renaming to an existing category name for this user (case-insensitive)
        categoryRepository.findByUserIdAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(userId, request.getName().trim(), request.getType())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(c -> { throw new ConflictException("Category already exists in your system."); });

        // BR: Prevent renaming to a SYSTEM category name (case-insensitive)
        categoryRepository.findByUserIsNullAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(request.getName().trim(), request.getType())
                .ifPresent(c -> { throw new ConflictException("Category name conflicts with a system default category."); });

        applyRequestToEntity(category, request);
        return CategoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteForUser(Long userId, Long id) {
        Category category = getById(id);

        // Use case "Xoá": Là danh mục chung? → 403 Forbidden
        if (category.getUser() == null) {
            throw new ForbiddenException("Cannot delete system category");
        }

        // Không tồn tại / Không chính chủ → 404 Not Found
        if (!category.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Category does not exist or is not owned by the user");
        }

        // BR-09: Danh mục đã được dùng trong 1 expense/income? → 409 Conflict
        if (isCategoryReferenced(id)) {
            throw new ConflictException(
                    "Cannot delete category that has existing data");
        }

        // Xoá mềm (soft delete)
        category.setDeletedAt(LocalDateTime.now());
        categoryRepository.save(category);
    }

    // ==================== PRIVATE HELPERS ====================

    /**
     * Kiểm tra xem category có đang được Expense hoặc Budget tham chiếu không.
     * Dùng cho BR-09 (chặn xoá) và BR-15 (chặn đổi type).
     * Lưu ý: Income không còn liên kết với Category.
     */
    private boolean isCategoryReferenced(Long categoryId) {
        return categoryRepository.isReferencedByExpense(categoryId)
                || categoryRepository.isReferencedByBudget(categoryId);
    }

    /**
     * Áp dụng dữ liệu từ request DTO vào entity Category.
     */
    private void applyRequestToEntity(Category category, CategoryRequest request) {
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        category.setType(request.getType());
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<vn.naitei.nhom3.expensemanagement.dto.category.CategoryAdminResponse> getAdminCategories(String search, vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType type, org.springframework.data.domain.Pageable pageable) {
        return categoryRepository.findSystemCategories(search, type, pageable)
            .map(cat -> vn.naitei.nhom3.expensemanagement.dto.category.CategoryAdminResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .description(cat.getDescription())
                .icon(cat.getIcon())
                .type(cat.getType())
                .createdAt(cat.getCreatedAt())
                .updatedAt(cat.getUpdatedAt())
                .usageCount(categoryRepository.countUsage(cat.getId()))
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public vn.naitei.nhom3.expensemanagement.dto.category.CategoryAdminResponse getAdminCategoryById(Long id) {
        vn.naitei.nhom3.expensemanagement.entity.Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException("Category does not exist or is not owned by the user"));
        if (cat.getUser() != null) throw new vn.naitei.nhom3.expensemanagement.exception.ForbiddenException("Cannot access private category from admin");

        return vn.naitei.nhom3.expensemanagement.dto.category.CategoryAdminResponse.builder()
            .id(cat.getId())
            .name(cat.getName())
            .description(cat.getDescription())
            .icon(cat.getIcon())
            .type(cat.getType())
            .createdAt(cat.getCreatedAt())
            .updatedAt(cat.getUpdatedAt())
            .usageCount(categoryRepository.countUsage(cat.getId()))
            .build();
    }

    @Override
    @Transactional
    public vn.naitei.nhom3.expensemanagement.dto.category.CategoryAdminResponse createSystemCategory(vn.naitei.nhom3.expensemanagement.dto.category.CategoryRequest request) {
        // Prevent duplicate system category (case-insensitive)
        categoryRepository.findByUserIsNullAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(request.getName().trim(), request.getType())
                .ifPresent(c -> { throw new ConflictException("System category already exists."); });

        vn.naitei.nhom3.expensemanagement.entity.Category cat = new vn.naitei.nhom3.expensemanagement.entity.Category();
        cat.setName(request.getName().trim());
        cat.setDescription(request.getDescription());
        cat.setIcon(request.getIcon());
        cat.setType(request.getType());
        cat.setUser(null);
        categoryRepository.save(cat);
        
        return getAdminCategoryById(cat.getId());
    }

    @Override
    @Transactional
    public vn.naitei.nhom3.expensemanagement.dto.category.CategoryAdminResponse updateSystemCategory(Long id, vn.naitei.nhom3.expensemanagement.dto.category.CategoryRequest request) {
        vn.naitei.nhom3.expensemanagement.entity.Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException("System category not found with ID: " + id));
        if (cat.getUser() != null) throw new vn.naitei.nhom3.expensemanagement.exception.ForbiddenException("Only system categories can be updated");
        
        // Prevent renaming to an existing system category (case-insensitive)
        categoryRepository.findByUserIsNullAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(request.getName().trim(), request.getType())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(c -> { throw new ConflictException("System category already exists."); });

        cat.setName(request.getName().trim());
        cat.setDescription(request.getDescription());
        cat.setIcon(request.getIcon());
        cat.setType(request.getType());
        categoryRepository.save(cat);
        
        return getAdminCategoryById(cat.getId());
    }

    @org.springframework.beans.factory.annotation.Autowired
    private vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository expenseRepository;
    
    @org.springframework.beans.factory.annotation.Autowired
    private vn.naitei.nhom3.expensemanagement.repository.BudgetRepository budgetRepository;

    @Override
    @Transactional
    public void deleteSystemCategory(Long id) {
        vn.naitei.nhom3.expensemanagement.entity.Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException("System category not found with ID: " + id));
        if (cat.getUser() != null) throw new vn.naitei.nhom3.expensemanagement.exception.ForbiddenException("Only system categories can be deleted");

        // Find or create "Uncategorized" category for fallback
        vn.naitei.nhom3.expensemanagement.entity.Category fallback = categoryRepository.findByUserIsNullAndNameIgnoreCaseAndTypeAndDeletedAtIsNull("Uncategorized", cat.getType())
            .orElseGet(() -> {
                vn.naitei.nhom3.expensemanagement.entity.Category uncategorized = new vn.naitei.nhom3.expensemanagement.entity.Category();
                uncategorized.setName("Uncategorized");
                uncategorized.setDescription("Fallback category for deleted system categories");
                uncategorized.setIcon("help");
                uncategorized.setType(cat.getType());
                return categoryRepository.save(uncategorized);
            });
            
        // Migrate Expenses
        expenseRepository.updateCategoryByOldCategory(cat.getId(), fallback.getId());
        
        // Migrate Budgets
        budgetRepository.updateCategoryByOldCategory(cat.getId(), fallback.getId());
        
        // Soft delete
        cat.setDeletedAt(java.time.LocalDateTime.now());
        categoryRepository.save(cat);
    }
}

