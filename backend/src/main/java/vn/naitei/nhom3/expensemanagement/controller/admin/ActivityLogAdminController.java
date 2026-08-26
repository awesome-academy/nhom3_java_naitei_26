package vn.naitei.nhom3.expensemanagement.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.activitylog.ActivityLogFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.activitylog.ActivityLogPageResponse;
import vn.naitei.nhom3.expensemanagement.service.ActivityLogService;

@RestController
@RequestMapping("/api/admin/activity-logs")
@RequiredArgsConstructor
public class ActivityLogAdminController {

    private final ActivityLogService activityLogService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<ActivityLogPageResponse>> getAll(
            @Valid @ModelAttribute ActivityLogFilterRequest filter) {
        ActivityLogPageResponse response = activityLogService.getAll(filter);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        activityLogService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Delete activity log successfully", null));
    }
}
