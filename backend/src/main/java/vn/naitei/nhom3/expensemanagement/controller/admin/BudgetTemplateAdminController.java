package vn.naitei.nhom3.expensemanagement.controller.admin;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import vn.naitei.nhom3.expensemanagement.aop.LogActivity;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.budgettemplate.BudgetTemplateCreateRequest;
import vn.naitei.nhom3.expensemanagement.dto.budgettemplate.BudgetTemplateDetailRequest;
import vn.naitei.nhom3.expensemanagement.dto.budgettemplate.BudgetTemplateDetailResponse;
import vn.naitei.nhom3.expensemanagement.dto.budgettemplate.BudgetTemplateResponse;
import vn.naitei.nhom3.expensemanagement.dto.budgettemplate.BudgetTemplateUpdateRequest;
import vn.naitei.nhom3.expensemanagement.entity.BudgetTemplate;
import vn.naitei.nhom3.expensemanagement.entity.BudgetTemplateDetail;
import vn.naitei.nhom3.expensemanagement.service.BudgetTemplateDetailService;
import vn.naitei.nhom3.expensemanagement.service.BudgetTemplateService;

@RestController
@RequestMapping("/api/admin/budget-templates")
@RequiredArgsConstructor
public class BudgetTemplateAdminController {

    private final BudgetTemplateService budgetTemplateService;
    private final BudgetTemplateDetailService budgetTemplateDetailService;

    @GetMapping
        @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<BudgetTemplateResponse>>> getAll() {
        List<BudgetTemplateResponse> responses = budgetTemplateService.getAll().stream()
                .map(template -> toResponse(template,
                        budgetTemplateDetailService.getByTemplateId(template.getId())))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
        @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<BudgetTemplateResponse>> getById(@PathVariable Long id) {
        BudgetTemplate template = budgetTemplateService.getById(id);
        List<BudgetTemplateDetail> details = budgetTemplateDetailService.getByTemplateId(id);
        return ResponseEntity.ok(ApiResponse.success(toResponse(template, details)));
    }

    @PostMapping
        @Transactional
        @LogActivity(action = "CREATE_BUDGET_TEMPLATE", entityType = "BUDGET_TEMPLATE",
                entityId = "#result.body.data.id", description = "'Create budget template: ' + #result.body.data.name")
    public ResponseEntity<ApiResponse<BudgetTemplateResponse>> create(
            @Valid @RequestBody BudgetTemplateCreateRequest request) {
        BudgetTemplate template = budgetTemplateService.create(toEntity(request.getName(),
                request.getMonth(), request.getWarningPercentage()));
        List<BudgetTemplateDetail> details = createDetails(template.getId(), request.getDetails());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED, "Create budget template successfully",
                        toResponse(template, details)));
    }

    @PutMapping("/{id}")
        @Transactional
        @LogActivity(action = "UPDATE_BUDGET_TEMPLATE", entityType = "BUDGET_TEMPLATE",
                entityId = "#id", description = "'Update budget template #' + #id")
    public ResponseEntity<ApiResponse<BudgetTemplateResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BudgetTemplateUpdateRequest request) {
        BudgetTemplate existingTemplate = budgetTemplateService.getById(id);
        BudgetTemplate updatedTemplate = budgetTemplateService.update(id,
                toEntity(request.getName(), request.getMonth(), request.getWarningPercentage()));

        List<BudgetTemplateDetail> existingDetails = budgetTemplateDetailService.getByTemplateId(
                existingTemplate.getId());
        existingDetails.forEach(detail -> budgetTemplateDetailService.delete(detail.getId()));
        List<BudgetTemplateDetail> details = createDetails(id, request.getDetails());

        return ResponseEntity.ok(ApiResponse.success("Update budget template successfully",
                toResponse(updatedTemplate, details)));
    }

    @DeleteMapping("/{id}")
        @Transactional
        @LogActivity(action = "DELETE_BUDGET_TEMPLATE", entityType = "BUDGET_TEMPLATE",
                entityId = "#id", description = "'Delete budget template #' + #id")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        budgetTemplateService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Delete budget template successfully", null));
    }

    private BudgetTemplate toEntity(String name, Integer month, Integer warningPercentage) {
        BudgetTemplate template = new BudgetTemplate();
        template.setName(name);
        template.setMonth(month);
        template.setWarningPercentage(warningPercentage);
        return template;
    }

    private List<BudgetTemplateDetail> createDetails(Long templateId,
            List<BudgetTemplateDetailRequest> requests) {
        return requests.stream()
                .map(request -> budgetTemplateDetailService.create(templateId, request.getCategoryId(),
                        toDetail(request.getAmount())))
                .toList();
    }

    private BudgetTemplateDetail toDetail(BigDecimal amount) {
        BudgetTemplateDetail detail = new BudgetTemplateDetail();
        detail.setAmount(amount);
        return detail;
    }

    private BudgetTemplateResponse toResponse(BudgetTemplate template,
            List<BudgetTemplateDetail> details) {
        List<BudgetTemplateDetailResponse> detailResponses = details.stream()
                .map(this::toDetailResponse)
                .toList();
        return new BudgetTemplateResponse(
                template.getId(),
                template.getName(),
                template.getMonth(),
                template.getWarningPercentage(),
                detailResponses,
                template.getCreatedAt(),
                template.getUpdatedAt());
    }

    private BudgetTemplateDetailResponse toDetailResponse(BudgetTemplateDetail detail) {
        return new BudgetTemplateDetailResponse(
                detail.getId(),
                detail.getCategory().getId(),
                detail.getCategory().getName(),
                detail.getCategory().getIcon(),
                detail.getAmount());
    }
}