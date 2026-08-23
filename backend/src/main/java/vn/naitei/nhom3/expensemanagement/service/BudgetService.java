package vn.naitei.nhom3.expensemanagement.service;

import vn.naitei.nhom3.expensemanagement.dto.budget.BudgetRequest;
import vn.naitei.nhom3.expensemanagement.dto.budget.BudgetResponse;

import java.util.List;

public interface BudgetService {

    List<BudgetResponse> getBudgets(Long userId, Integer year, Integer month);

    BudgetResponse getBudgetById(Long userId, Long budgetId);

    BudgetResponse createBudget(Long userId, BudgetRequest request);

    BudgetResponse updateBudget(Long userId, Long budgetId, BudgetRequest request);

    void deleteBudget(Long userId, Long budgetId);

    List<BudgetResponse> getBudgetAlerts(Long userId);
}
