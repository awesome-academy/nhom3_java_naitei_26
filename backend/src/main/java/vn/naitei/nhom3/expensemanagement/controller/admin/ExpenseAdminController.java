package vn.naitei.nhom3.expensemanagement.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.expense.AdminExpenseFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.expense.AdminExpensePageResponse;
import vn.naitei.nhom3.expensemanagement.service.ExpenseAdminService;

/**
 * Admin controller for system-wide expense management (Task #99032 – A10).
 * All endpoints are automatically protected by {@code hasRole("ADMIN")} via
 * the {@code /api/admin/**} rule in {@code SecurityConfig}.
 */
@RestController
@RequestMapping("/api/admin/expenses")
@RequiredArgsConstructor
public class ExpenseAdminController {

    private final ExpenseAdminService expenseAdminService;

    /**
     * GET /api/admin/expenses
     *
     * <p>Returns a paginated list of all expense records in the system.
     * Supports optional filtering by userId, categoryId, date range, amount range,
     * and title search. Pagination and sort follow the same conventions as the
     * user-facing {@code /api/expenses} endpoint.
     *
     * @param filter pagination and filter parameters (all optional except page/size defaults)
     * @return {@code ApiResponse} wrapping an {@link AdminExpensePageResponse}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AdminExpensePageResponse>> getAllSystem(
            @Valid @ModelAttribute AdminExpenseFilterRequest filter) {
        AdminExpensePageResponse response = expenseAdminService.getAllSystem(filter);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
