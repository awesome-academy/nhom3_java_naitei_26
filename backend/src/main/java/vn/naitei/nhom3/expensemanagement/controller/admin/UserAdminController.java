package vn.naitei.nhom3.expensemanagement.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.naitei.nhom3.expensemanagement.aop.LogActivity;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.user.UpdateUserRoleRequest;
import vn.naitei.nhom3.expensemanagement.dto.user.UpdateUserStatusRequest;
import vn.naitei.nhom3.expensemanagement.dto.user.UserFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.user.UserPageResponse;
import vn.naitei.nhom3.expensemanagement.dto.user.UserResponse;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;
import vn.naitei.nhom3.expensemanagement.service.UserService;

/**
 * Admin controller quản lý người dùng hệ thống (#99029).
 *
 * Endpoints:
 * - GET /api/admin/users            — Danh sách người dùng phân trang, lọc theo status/role/search
 * - PUT /api/admin/users/{id}/role   — Đổi vai trò người dùng
 * - PUT /api/admin/users/{id}/status — Khoá/mở khoá người dùng (active/inactive)
 *
 * Quyền: ADMIN (áp dụng qua rule /api/admin/** trong SecurityConfig).
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserService userService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<UserPageResponse>> getAll(
            @Valid @ModelAttribute UserFilterRequest filter) {
        UserPageResponse response = userService.getAllForAdmin(filter);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/role")
    @Transactional
    @LogActivity(action = "UPDATE_USER_ROLE", entityType = "USER", entityId = "#id",
            description = "'Cập nhật vai trò người dùng #' + #id + ' thành ' + #result.body.data.role")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        User user = userService.updateRole(id, request.getRole());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vai trò thành công", toResponse(user)));
    }

    @PutMapping("/{id}/status")
    @Transactional
    @LogActivity(action = "UPDATE_USER_STATUS", entityType = "USER", entityId = "#id",
            description = "'Cập nhật trạng thái người dùng #' + #id + ' thành ' + #result.body.data.status")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        User user = userService.updateStatus(id, request.getStatus(), principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", toResponse(user)));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
