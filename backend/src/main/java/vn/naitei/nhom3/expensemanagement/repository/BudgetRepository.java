package vn.naitei.nhom3.expensemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.naitei.nhom3.expensemanagement.entity.Budget;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserId(Long userId);

    List<Budget> findByUserIdAndYearAndMonth(Long userId, Short year, Byte month);

    Optional<Budget> findByUserIdAndCategoryIdAndYearAndMonth(Long userId, Long categoryId, Short year, Byte month);

    boolean existsByUserIdAndCategoryIdAndYearAndMonth(Long userId, Long categoryId, Short year, Byte month);
}
