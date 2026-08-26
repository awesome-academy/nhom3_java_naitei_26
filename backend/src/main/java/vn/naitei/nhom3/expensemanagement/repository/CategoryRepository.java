package vn.naitei.nhom3.expensemanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.user IS NULL AND c.deletedAt IS NULL AND (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND (:type IS NULL OR c.type = :type)")
    org.springframework.data.domain.Page<Category> findSystemCategories(@Param("search") String search, @Param("type") CategoryType type, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT (SELECT COUNT(e) FROM Expense e WHERE e.category.id = :categoryId) + (SELECT COUNT(b) FROM Budget b WHERE b.category.id = :categoryId)")
    long countUsage(@Param("categoryId") Long categoryId);

    /**
     * Danh mục hệ thống (chung) chưa bị xoá mềm, lọc theo type, sắp xếp theo id.
     */
    List<Category> findByUserIsNullAndTypeAndDeletedAtIsNullOrderByIdAsc(CategoryType type);

    List<Category> findByUserIdIsNull();

    List<Category> findByUserId(Long userId);

    Optional<Category> findByUserIdAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(
            Long userId, String name, CategoryType type);

    Optional<Category> findByUserIsNullAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(
            String name, CategoryType type);

    List<Category> findByDeletedAtIsNullOrderByIdAsc();

    /**
     * Danh mục mà User được phép dùng: danh mục hệ thống (user_id NULL) + danh mục riêng của User.
     * Lọc bỏ các danh mục đã bị xoá mềm.
     */
    @Query("SELECT c FROM Category c WHERE (c.user IS NULL OR c.user.id = :userId) AND c.deletedAt IS NULL")
    List<Category> findVisibleToUser(@Param("userId") Long userId);

    /**
     * Danh mục visible lọc thêm theo type (EXPENSE/INCOME).
     * Lọc bỏ các danh mục đã bị xoá mềm.
     */
    @Query("SELECT c FROM Category c WHERE (c.user IS NULL OR c.user.id = :userId) AND c.type = :type AND c.deletedAt IS NULL")
    List<Category> findVisibleToUserAndType(@Param("userId") Long userId, @Param("type") CategoryType type);

    /**
     * Kiểm tra xem có expense nào đang tham chiếu tới categoryId hay không.
     * Dùng để chặn xoá danh mục đang được sử dụng (BR-09).
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Expense e WHERE e.category.id = :categoryId")
    boolean isReferencedByExpense(@Param("categoryId") Long categoryId);

    /**
     * Kiểm tra xem có budget nào đang tham chiếu tới categoryId hay không (BR-09).
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Budget b WHERE b.category.id = :categoryId")
    boolean isReferencedByBudget(@Param("categoryId") Long categoryId);
}
