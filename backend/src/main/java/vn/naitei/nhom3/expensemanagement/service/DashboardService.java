package vn.naitei.nhom3.expensemanagement.service;

import vn.naitei.nhom3.expensemanagement.dto.dashboard.CategoryExpenseResponse;

import java.util.List;

public interface DashboardService {

    List<CategoryExpenseResponse> getExpenseStatisticsByCategory(Long userId);
}
