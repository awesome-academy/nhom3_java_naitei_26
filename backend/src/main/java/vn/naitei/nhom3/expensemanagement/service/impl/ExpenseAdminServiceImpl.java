package vn.naitei.nhom3.expensemanagement.service.impl;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.naitei.nhom3.expensemanagement.dto.expense.AdminExpenseFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.expense.AdminExpensePageResponse;
import vn.naitei.nhom3.expensemanagement.dto.expense.AdminExpenseResponse;
import vn.naitei.nhom3.expensemanagement.entity.Expense;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.specification.ExpenseSpecification;
import vn.naitei.nhom3.expensemanagement.service.ExpenseAdminService;

/**
 * Implementation of {@link ExpenseAdminService} for the system-wide expense list (A10).
 * Reuses the existing {@link ExpenseRepository} and {@link ExpenseSpecification}
 * without any schema changes.
 */
@Service
@RequiredArgsConstructor
public class ExpenseAdminServiceImpl implements ExpenseAdminService {

    private static final Map<String, String> SORT_FIELDS = Map.of(
            "date", "expenseDate",
            "title", "title",
            "amount", "amount");

    private final ExpenseRepository expenseRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminExpensePageResponse getAllSystem(AdminExpenseFilterRequest filter) {
        Pageable pageable = PageRequest.of(
                filter.getPage(), filter.getSize(), createSort(filter.getSort()));
        Page<Expense> expenses = expenseRepository.findAll(
                ExpenseSpecification.filterByAdmin(filter), pageable);
        return new AdminExpensePageResponse(
                expenses.getContent().stream().map(this::toAdminResponse).toList(),
                expenses.getNumber(),
                expenses.getSize(),
                expenses.getTotalElements(),
                expenses.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalExpenseAcrossAllUsers() {
        return expenseRepository.sumTotalExpenseAcrossAllUsers();
    }

    private AdminExpenseResponse toAdminResponse(Expense expense) {
        return new AdminExpenseResponse(
                expense.getId(),
                expense.getTitle(),
                expense.getAmount(),
                expense.getExpenseDate(),
                expense.getNote(),
                expense.getCategory().getId(),
                expense.getCategory().getName(),
                expense.getCreatedAt(),
                expense.getUpdatedAt(),
                expense.getUser().getId(),
                expense.getUser().getName(),
                expense.getUser().getEmail());
    }

    private Sort createSort(String sortParameter) {
        if (sortParameter == null || sortParameter.isBlank()) {
            return Sort.by(Sort.Order.desc("expenseDate"), Sort.Order.desc("id"));
        }
        String[] parts = sortParameter.split(",");
        String property = SORT_FIELDS.get(parts[0].toLowerCase(Locale.ROOT));
        Sort.Direction direction = Sort.Direction.fromString(parts[1]);
        return Sort.by(new Sort.Order(direction, property), Sort.Order.desc("id"));
    }
}
