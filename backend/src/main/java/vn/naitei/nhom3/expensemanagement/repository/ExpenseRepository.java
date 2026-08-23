package vn.naitei.nhom3.expensemanagement.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vn.naitei.nhom3.expensemanagement.dto.report.ReportCategoryResponse;
import vn.naitei.nhom3.expensemanagement.entity.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {

    List<Expense> findByUserId(Long userId);

    List<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId);

    // ==================== DASHBOARD & STATS ====================
    @Query("SELECT e.category.id AS categoryId, e.category.name AS categoryName, e.category.icon AS categoryIcon, SUM(e.amount) AS totalAmount " +
           "FROM Expense e WHERE e.user.id = :userId " +
           "GROUP BY e.category.id, e.category.name, e.category.icon " +
           "ORDER BY SUM(e.amount) DESC")
    List<CategoryExpenseSummaryProjection> getExpenseStatisticsByCategory(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal sumTotalExpenseByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumExpenseByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.category.id = :categoryId AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumExpenseByUserIdAndCategoryIdAndDateRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // ==================== REPORT & OVERVIEW ====================
    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.user.id = :userId
          AND e.expenseDate BETWEEN :from AND :to
        """)
    BigDecimal sumAmountByUserIdAndExpenseDateBetween(
        @Param("userId") Long userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to);

    @Query("""
        SELECT new vn.naitei.nhom3.expensemanagement.dto.report.ReportCategoryResponse(
        c.id, c.name, SUM(e.amount))
        FROM Expense e
        JOIN e.category c
        WHERE e.user.id = :userId
          AND e.expenseDate BETWEEN :from AND :to
        GROUP BY c.id, c.name
        ORDER BY c.id
        """)
    List<ReportCategoryResponse> sumAmountByCategoryAndUserIdAndExpenseDateBetween(
        @Param("userId") Long userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal sumAmountByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e "
            + "WHERE e.user.id = :userId AND e.category.id = :categoryId "
            + "AND e.expenseDate BETWEEN :start AND :end")
    BigDecimal sumAmountByUserIdAndCategoryIdAndExpenseDateBetween(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("""
        SELECT FUNCTION('YEAR', e.expenseDate), FUNCTION('MONTH', e.expenseDate), SUM(e.amount)
        FROM Expense e
        WHERE e.user.id = :userId
          AND e.expenseDate BETWEEN :from AND :to
        GROUP BY FUNCTION('YEAR', e.expenseDate), FUNCTION('MONTH', e.expenseDate)
        ORDER BY FUNCTION('YEAR', e.expenseDate), FUNCTION('MONTH', e.expenseDate)
        """)
    List<Object[]> sumMonthlyAmountByUserIdAndExpenseDateBetween(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Modifying
    @Query("UPDATE Expense e SET e.category.id = :newId WHERE e.category.id = :oldId")
    void updateCategoryByOldCategory(@Param("oldId") Long oldId, @Param("newId") Long newId);

    // ==================== PROJECTIONS ====================
    interface CategoryExpenseSummaryProjection {
        Long getCategoryId();
        String getCategoryName();
        String getCategoryIcon();
        BigDecimal getTotalAmount();
    }
}
