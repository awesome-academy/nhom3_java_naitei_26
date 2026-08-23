package vn.naitei.nhom3.expensemanagement.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.naitei.nhom3.expensemanagement.entity.Income;

import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByUserId(Long userId);

    Page<Income> findByUserIdOrderByIncomeDateDesc(Long userId, Pageable pageable);

    Page<Income> findByUserIdAndIncomeDateBetweenOrderByIncomeDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable);

    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id = :userId")
    java.math.BigDecimal sumAmountByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id = :userId AND i.incomeDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumAmountByUserIdAndIncomeDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT new vn.naitei.nhom3.expensemanagement.dto.report.ReportPeriodAmount(YEAR(i.incomeDate), MONTH(i.incomeDate), SUM(i.amount)) FROM Income i WHERE i.user.id = :userId AND i.incomeDate BETWEEN :startDate AND :endDate GROUP BY YEAR(i.incomeDate), MONTH(i.incomeDate)")
    List<vn.naitei.nhom3.expensemanagement.dto.report.ReportPeriodAmount> sumMonthlyAmountByUserIdAndIncomeDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
