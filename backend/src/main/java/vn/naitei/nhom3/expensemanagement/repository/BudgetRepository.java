package vn.naitei.nhom3.expensemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.naitei.nhom3.expensemanagement.entity.Budget;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndYearAndMonth(Long userId, Short year, Byte month);

    Optional<Budget> findByUserIdAndCategoryIdAndYearAndMonth(
            Long userId, Long categoryId, Short year, Byte month);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Budget b SET b.category.id = :newId WHERE b.category.id = :oldId")
    void updateCategoryByOldCategory(@org.springframework.data.repository.query.Param("oldId") Long oldId, @org.springframework.data.repository.query.Param("newId") Long newId);
}
