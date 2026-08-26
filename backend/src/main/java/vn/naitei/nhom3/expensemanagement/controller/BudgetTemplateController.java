package vn.naitei.nhom3.expensemanagement.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.budgettemplate.BudgetTemplateResponse;
import vn.naitei.nhom3.expensemanagement.service.BudgetTemplateDetailService;
import vn.naitei.nhom3.expensemanagement.service.BudgetTemplateService;

@RestController
@RequestMapping("/api/budget-templates")
@RequiredArgsConstructor
public class BudgetTemplateController {

    private final BudgetTemplateService budgetTemplateService;
    private final BudgetTemplateDetailService budgetTemplateDetailService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<BudgetTemplateResponse>>> getAll() {
        List<BudgetTemplateResponse> responses = budgetTemplateService.getAll().stream()
                .map(template -> new BudgetTemplateResponse(
                        template.getId(),
                        template.getName(),
                        template.getMonth(),
                        template.getWarningPercentage(),
                        budgetTemplateDetailService.getByTemplateId(template.getId()).stream()
                                .map(detail -> new vn.naitei.nhom3.expensemanagement.dto.budgettemplate.BudgetTemplateDetailResponse(
                                        detail.getId(),
                                        detail.getCategory().getId(),
                                        detail.getCategory().getName(),
                                        detail.getCategory().getIcon(),
                                        detail.getAmount()))
                                .toList(),
                        template.getCreatedAt(),
                        template.getUpdatedAt()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}