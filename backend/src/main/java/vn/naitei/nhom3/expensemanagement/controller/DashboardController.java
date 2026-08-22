package vn.naitei.nhom3.expensemanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.dashboard.CategoryExpenseResponse;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;
import vn.naitei.nhom3.expensemanagement.service.DashboardService;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "APIs for Dashboard statistics and financial metrics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/expense-by-category")
    @Operation(summary = "Get expense statistics grouped by category for authenticated user")
    public ResponseEntity<ApiResponse<List<CategoryExpenseResponse>>> getExpenseByCategory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<CategoryExpenseResponse> data = dashboardService.getExpenseStatisticsByCategory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Thành công", data));
    }
}
