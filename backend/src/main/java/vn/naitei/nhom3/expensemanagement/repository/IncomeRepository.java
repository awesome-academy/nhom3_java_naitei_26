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
}
