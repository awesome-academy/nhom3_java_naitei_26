package vn.naitei.nhom3.expensemanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.budget.BudgetRequest;
import vn.naitei.nhom3.expensemanagement.dto.budget.BudgetResponse;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;
import vn.naitei.nhom3.expensemanagement.service.BudgetService;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budget", description = "APIs for Budget Management and Spending Alerts")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Get user budgets with optional year and month filter")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        List<BudgetResponse> data = budgetService.getBudgets(userPrincipal.getId(), year, month);
        return ResponseEntity.ok(ApiResponse.success("Success", data));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get budget alerts (budgets with WARNING or EXCEEDED status in the current month)")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgetAlerts(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<BudgetResponse> data = budgetService.getBudgetAlerts(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Success", data));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get budget by ID")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudgetById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        BudgetResponse data = budgetService.getBudgetById(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Success", data));
    }

    @PostMapping
    @Operation(summary = "Create a new monthly budget for a category")
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse data = budgetService.createBudget(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED, "Budget created successfully", data));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing budget")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse data = budgetService.updateBudget(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Budget updated successfully", data));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a budget")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        budgetService.deleteBudget(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Budget deleted successfully", null));
    }
}
