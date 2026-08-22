package vn.naitei.nhom3.expensemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.naitei.nhom3.expensemanagement.dto.dashboard.CategoryExpenseResponse;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository.CategoryExpenseSummaryProjection;
import vn.naitei.nhom3.expensemanagement.service.DashboardService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final ExpenseRepository expenseRepository;

    @Override
    public List<CategoryExpenseResponse> getExpenseStatisticsByCategory(Long userId) {
        List<CategoryExpenseSummaryProjection> projections =
                expenseRepository.getExpenseStatisticsByCategory(userId);

        BigDecimal totalUserExpense = projections.stream()
                .map(CategoryExpenseSummaryProjection::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategoryExpenseResponse> result = new ArrayList<>();
        for (CategoryExpenseSummaryProjection p : projections) {
            double percentage = 0.0;
            if (totalUserExpense.compareTo(BigDecimal.ZERO) > 0) {
                percentage = p.getTotalAmount()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(totalUserExpense, 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            result.add(CategoryExpenseResponse.builder()
                    .categoryId(p.getCategoryId())
                    .categoryName(p.getCategoryName())
                    .categoryIcon(p.getCategoryIcon())
                    .totalAmount(p.getTotalAmount())
                    .percentage(percentage)
                    .build());
        }

        return result;
    }
}
