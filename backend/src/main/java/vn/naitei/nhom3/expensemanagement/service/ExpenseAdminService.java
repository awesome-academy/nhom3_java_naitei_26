package vn.naitei.nhom3.expensemanagement.service;

import java.math.BigDecimal;

import vn.naitei.nhom3.expensemanagement.dto.expense.AdminExpenseFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.expense.AdminExpensePageResponse;

/**
 * Admin service for system-wide expense operations (Task #99032 – A10).
 */
public interface ExpenseAdminService {

    /**
     * Returns a paginated, filterable list of all expenses across the entire system.
     * Intended for admin use only.
     *
     * @param filter pagination and optional filter criteria
     * @return paginated list of expenses with user identity information
     */
    AdminExpensePageResponse getAllSystem(AdminExpenseFilterRequest filter);

    BigDecimal getTotalExpenseAcrossAllUsers();
}
