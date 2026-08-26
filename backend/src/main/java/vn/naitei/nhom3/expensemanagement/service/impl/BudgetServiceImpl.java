package vn.naitei.nhom3.expensemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.naitei.nhom3.expensemanagement.dto.budget.BudgetRequest;
import vn.naitei.nhom3.expensemanagement.dto.budget.BudgetResponse;
import vn.naitei.nhom3.expensemanagement.entity.Budget;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.BudgetRepository;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.service.BudgetService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(Long userId, Integer year, Integer month) {
        List<Budget> budgets;
        if (year != null && month != null) {
            budgets = budgetRepository.findByUserIdAndYearAndMonth(userId, year.shortValue(), month.byteValue());
        } else {
            budgets = budgetRepository.findByUserId(userId);
        }

        return budgets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getBudgetById(Long userId, Long budgetId) {
        Budget budget = findUserBudget(userId, budgetId);
        return mapToResponse(budget);
    }

    @Override
    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        Short year = request.getYear().shortValue();
        Byte month = request.getMonth().byteValue();

        if (budgetRepository.existsByUserIdAndCategoryIdAndYearAndMonth(
                userId, request.getCategoryId(), year, month)) {
            throw new BadRequestException("Budget for this category in the specified month already exists.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .month(month)
                .year(year)
                .build();

        Budget saved = budgetRepository.save(budget);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BudgetResponse updateBudget(Long userId, Long budgetId, BudgetRequest request) {
        Budget budget = findUserBudget(userId, budgetId);
        Short year = request.getYear().shortValue();
        Byte month = request.getMonth().byteValue();

        boolean isCategoryOrTimeChanged = !budget.getCategory().getId().equals(request.getCategoryId())
                || !budget.getYear().equals(year)
                || !budget.getMonth().equals(month);

        if (isCategoryOrTimeChanged && budgetRepository.existsByUserIdAndCategoryIdAndYearAndMonth(
                userId, request.getCategoryId(), year, month)) {
            throw new BadRequestException("Budget for this category in the specified month already exists.");
        }

        if (!budget.getCategory().getId().equals(request.getCategoryId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            budget.setCategory(category);
        }

        budget.setAmount(request.getAmount());
        budget.setMonth(month);
        budget.setYear(year);

        Budget updated = budgetRepository.save(budget);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = findUserBudget(userId, budgetId);
        budgetRepository.delete(budget);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgetAlerts(Long userId) {
        YearMonth currentYm = YearMonth.now();
        List<Budget> currentBudgets = budgetRepository.findByUserIdAndYearAndMonth(
                userId,
                (short) currentYm.getYear(),
                (byte) currentYm.getMonthValue()
        );

        return currentBudgets.stream()
                .map(this::mapToResponse)
                .filter(b -> !"NORMAL".equals(b.getAlertStatus()))
                .collect(Collectors.toList());
    }

    private Budget findUserBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found."));

        if (!budget.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Budget not found.");
        }

        return budget;
    }

    private BudgetResponse mapToResponse(Budget budget) {
        YearMonth ym = YearMonth.of(budget.getYear().intValue(), budget.getMonth().intValue());
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        BigDecimal actualSpending = expenseRepository.sumExpenseByUserIdAndCategoryIdAndDateRange(
                budget.getUser().getId(),
                budget.getCategory().getId(),
                startDate,
                endDate
        );
        if (actualSpending == null) actualSpending = BigDecimal.ZERO;

        double percentage = 0.0;
        if (budget.getAmount() != null && budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentage = actualSpending.multiply(BigDecimal.valueOf(100))
                    .divide(budget.getAmount(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        String alertStatus = "NORMAL";
        if (percentage >= 100.0) {
            alertStatus = "EXCEEDED";
        } else if (percentage >= 80.0) {
            alertStatus = "WARNING";
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .userId(budget.getUser().getId())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .categoryIcon(budget.getCategory().getIcon())
                .amount(budget.getAmount())
                .month(budget.getMonth().intValue())
                .year(budget.getYear().intValue())
                .actualSpending(actualSpending)
                .spendingPercentage(percentage)
                .alertStatus(alertStatus)
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}
