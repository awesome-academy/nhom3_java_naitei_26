package vn.naitei.nhom3.expensemanagement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.naitei.nhom3.expensemanagement.aop.LogActivity;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.expense.AttachmentDownload;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpensePageResponse;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseRequest;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseResponse;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;
import vn.naitei.nhom3.expensemanagement.service.ExpenseAttachmentService;
import vn.naitei.nhom3.expensemanagement.service.ExpenseService;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ExpenseAttachmentService attachmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<ExpensePageResponse>> getAll(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @ModelAttribute ExpenseFilterRequest filter) {
        ExpensePageResponse response = expenseService.getAllByUser(principal.getId(), filter);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @LogActivity(action = "CREATE_EXPENSE", entityType = "EXPENSE",
            entityId = "#result.body.data.id", description = "'Tạo chi tiêu: ' + #result.body.data.title")
    public ResponseEntity<ApiResponse<ExpenseResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.create(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED, "Tạo chi tiêu thành công", response));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @LogActivity(action = "CREATE_EXPENSE", entityType = "EXPENSE",
            entityId = "#result.body.data.id", description = "'Tạo chi tiêu: ' + #result.body.data.title")
    public ResponseEntity<ApiResponse<ExpenseResponse>> createWithAttachments(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestPart("data") ExpenseRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        List<MultipartFile> attachments = files == null ? List.of() : Arrays.asList(files);
        ExpenseResponse response = expenseService.create(principal.getId(), request, attachments);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED, "Tạo chi tiêu thành công", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ExpenseResponse response = expenseService.getById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @LogActivity(action = "UPDATE_EXPENSE", entityType = "EXPENSE",
            entityId = "#id", description = "'Cập nhật chi tiêu #' + #id")
    public ResponseEntity<ApiResponse<ExpenseResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.update(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", response));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @LogActivity(action = "UPDATE_EXPENSE", entityType = "EXPENSE",
            entityId = "#id", description = "'Cập nhật chi tiêu #' + #id")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateWithAttachments(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestPart("data") ExpenseRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        List<MultipartFile> attachments = files == null ? List.of() : Arrays.asList(files);
        ExpenseResponse response = expenseService.update(principal.getId(), id, request, attachments);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", response));
    }

    @DeleteMapping("/{id}")
    @LogActivity(action = "DELETE_EXPENSE", entityType = "EXPENSE",
            entityId = "#id", description = "'Xoá chi tiêu #' + #id")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        expenseService.delete(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Xoá thành công", null));
    }

    @DeleteMapping("/{expenseId}/attachments/{attachmentId}")
    @LogActivity(action = "DELETE_EXPENSE_ATTACHMENT", entityType = "EXPENSE_ATTACHMENT",
            entityId = "#attachmentId", description = "'Xoá file đính kèm #' + #attachmentId + ' của chi tiêu #' + #expenseId")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long expenseId,
            @PathVariable Long attachmentId) {
        attachmentService.delete(principal.getId(), expenseId, attachmentId);
        return ResponseEntity.ok(ApiResponse.success("Xoá file đính kèm thành công", null));
    }

    @GetMapping("/{expenseId}/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long expenseId,
            @PathVariable Long attachmentId) {
        AttachmentDownload download = attachmentService.download(principal.getId(), expenseId, attachmentId);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(download.getFileName(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(download.getResource());
    }
}
