package vn.naitei.nhom3.expensemanagement.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.naitei.nhom3.expensemanagement.entity.BudgetTemplate;

import java.util.Optional;

public interface BudgetTemplateRepository extends JpaRepository<BudgetTemplate, Long> {

    Page<BudgetTemplate> findByDeletedAtIsNull(Pageable pageable);

    Optional<BudgetTemplate> findByIdAndDeletedAtIsNull(Long id);
}
