package vn.naitei.nhom3.expensemanagement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.income.IncomeRequest;
import vn.naitei.nhom3.expensemanagement.dto.income.IncomeResponse;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;
import vn.naitei.nhom3.expensemanagement.service.IncomeService;

/**
 * REST Controller cho quản lý thu nhập phía client (SRS mục 7.4).
 *
 * Endpoints:
 * - GET    /api/incomes          — Danh sách thu nhập (phân trang, filter)
 * - POST   /api/incomes          — Tạo mới thu nhập
 * - PUT    /api/incomes/{id}     — Cập nhật thu nhập
 * - DELETE /api/incomes/{id}     — Xoá thu nhập
 *
 * Quyền: USER (chủ sở hữu). userId luôn lấy từ JWT token (BR-03).
 */
@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    /**
     * GET /api/incomes
     * Lấy danh sách thu nhập của user hiện tại, hỗ trợ phân trang và filter.
     *
     * @param month      Lọc theo tháng, format yyyy-MM (tuỳ chọn)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<IncomeResponse>>> getAll(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String month,
            Pageable pageable) {
        Page<IncomeResponse> page = incomeService.getByUser(
                principal.getId(), month, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    /**
     * GET /api/incomes/{id}
     * Lấy chi tiết một khoản thu nhập theo ID. Chỉ chủ sở hữu mới được xem.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        IncomeResponse response = incomeService.getById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /api/incomes
     * Tạo mới một khoản thu nhập. Trả 201 Created.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<IncomeResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody IncomeRequest request) {
        IncomeResponse response = incomeService.create(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED, "Create income successfully", response));
    }

    /**
     * PUT /api/incomes/{id}
     * Cập nhật khoản thu nhập. Chỉ chủ sở hữu mới được sửa.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody IncomeRequest request) {
        IncomeResponse response = incomeService.update(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Update income successfully", response));
    }

    /**
     * DELETE /api/incomes/{id}
     * Xoá khoản thu nhập. Chỉ chủ sở hữu mới được xoá.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        incomeService.delete(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Delete income successfully", null));
    }
}
