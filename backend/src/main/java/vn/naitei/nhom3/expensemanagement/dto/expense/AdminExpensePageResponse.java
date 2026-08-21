package vn.naitei.nhom3.expensemanagement.dto.expense;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * Paginated response wrapper for the Admin system-wide expense list (A10).
 * Mirrors the structure of {@link ExpensePageResponse} but carries
 * {@link AdminExpenseResponse} items that include user identity.
 */
@Getter
@AllArgsConstructor
public class AdminExpensePageResponse {

    private final List<AdminExpenseResponse> items;
    private final int page;
    private final int size;
    private final long totalItems;
    private final int totalPages;
}
