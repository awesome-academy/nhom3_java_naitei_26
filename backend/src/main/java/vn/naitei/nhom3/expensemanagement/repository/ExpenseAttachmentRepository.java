package vn.naitei.nhom3.expensemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.naitei.nhom3.expensemanagement.entity.ExpenseAttachment;

import java.util.List;
import java.util.Optional;

public interface ExpenseAttachmentRepository extends JpaRepository<ExpenseAttachment, Long> {

    List<ExpenseAttachment> findByExpenseId(Long expenseId);

    Optional<ExpenseAttachment> findByIdAndExpenseId(Long id, Long expenseId);

    long countByExpenseId(Long expenseId);

    void deleteByExpenseId(Long expenseId);
}
