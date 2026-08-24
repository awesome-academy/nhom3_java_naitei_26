package vn.naitei.nhom3.expensemanagement.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.income.AdminIncomeFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.income.AdminIncomePageResponse;
import vn.naitei.nhom3.expensemanagement.dto.income.AdminIncomeResponse;
import vn.naitei.nhom3.expensemanagement.dto.income.IncomeRequest;
import vn.naitei.nhom3.expensemanagement.service.IncomeAdminService;

@RestController
@RequestMapping("/api/admin/incomes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class IncomeAdminController {

    private final IncomeAdminService incomeAdminService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminIncomePageResponse>> getAllSystem(
            @Valid @ModelAttribute AdminIncomeFilterRequest filter) {
        AdminIncomePageResponse response = incomeAdminService.getAllSystem(filter);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminIncomeResponse>> getById(@PathVariable Long id) {
        AdminIncomeResponse response = incomeAdminService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminIncomeResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody IncomeRequest request) {
        AdminIncomeResponse response = incomeAdminService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        incomeAdminService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Income deleted successfully", null));
    }
}
