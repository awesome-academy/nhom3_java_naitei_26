package vn.naitei.nhom3.expensemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.naitei.nhom3.expensemanagement.entity.Budget;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserId(Long userId);

    List<Budget> findByUserIdAndYearAndMonth(Long userId, Short year, Byte month);

    Optional<Budget> findByUserIdAndCategoryIdAndYearAndMonth(Long userId, Long categoryId, Short year, Byte month);

    boolean existsByUserIdAndCategoryIdAndYearAndMonth(Long userId, Long categoryId, Short year, Byte month);

    @Modifying
    @Query("UPDATE Budget b SET b.category.id = :newId WHERE b.category.id = :oldId")
    void updateCategoryByOldCategory(@Param("oldId") Long oldId, @Param("newId") Long newId);
}
