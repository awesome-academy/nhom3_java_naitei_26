package vn.naitei.nhom3.expensemanagement.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.naitei.nhom3.expensemanagement.entity.Income;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long>, JpaSpecificationExecutor<Income> {

    List<Income> findByUserId(Long userId);


    Page<Income> findByUserIdOrderByIncomeDateDesc(Long userId, Pageable pageable);

    Page<Income> findByUserIdAndIncomeDateBetweenOrderByIncomeDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable);

    // ==================== DASHBOARD SUMMARY ====================
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId")
    BigDecimal sumTotalIncomeByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId AND i.incomeDate BETWEEN :startDate AND :endDate")
    BigDecimal sumIncomeByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // ==================== REPORT & OVERVIEW ====================
    @Query("""
        SELECT COALESCE(SUM(i.amount), 0)
        FROM Income i
        WHERE i.user.id = :userId
          AND i.incomeDate BETWEEN :from AND :to
        """)
    BigDecimal sumAmountByUserIdAndIncomeDateBetween(
        @Param("userId") Long userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId")
    BigDecimal sumAmountByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT FUNCTION('YEAR', i.incomeDate), FUNCTION('MONTH', i.incomeDate), SUM(i.amount)
        FROM Income i
        WHERE i.user.id = :userId
          AND i.incomeDate BETWEEN :from AND :to
        GROUP BY FUNCTION('YEAR', i.incomeDate), FUNCTION('MONTH', i.incomeDate)
        ORDER BY FUNCTION('YEAR', i.incomeDate), FUNCTION('MONTH', i.incomeDate)
        """)
    List<Object[]> sumMonthlyAmountByUserIdAndIncomeDateBetween(
        @Param("userId") Long userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i")
    BigDecimal sumTotalIncomeAcrossAllUsers();

    @Query("SELECT FUNCTION('YEAR', i.incomeDate), FUNCTION('MONTH', i.incomeDate), FUNCTION('DAY', i.incomeDate), SUM(i.amount) " +
            "FROM Income i WHERE i.user.id = :userId AND i.incomeDate BETWEEN :from AND :to " +
            "GROUP BY FUNCTION('YEAR', i.incomeDate), FUNCTION('MONTH', i.incomeDate), FUNCTION('DAY', i.incomeDate)")
    List<Object[]> sumDailyAmountByUserIdAndIncomeDateBetween(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
