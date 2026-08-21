package vn.naitei.nhom3.expensemanagement.service;

import org.springframework.web.multipart.MultipartFile;
import vn.naitei.nhom3.expensemanagement.dto.expense.AttachmentDownload;
import vn.naitei.nhom3.expensemanagement.dto.expense.AttachmentResponse;
import vn.naitei.nhom3.expensemanagement.entity.Expense;

import java.util.List;

public interface ExpenseAttachmentService {

    List<AttachmentResponse> saveAll(Expense expense, List<MultipartFile> files);

    List<AttachmentResponse> getAll(Long expenseId);

    AttachmentDownload download(Long userId, Long expenseId, Long attachmentId);

    void delete(Long userId, Long expenseId, Long attachmentId);

    void deleteAll(Long expenseId);
}
