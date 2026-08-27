package vn.naitei.nhom3.expensemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.naitei.nhom3.expensemanagement.dto.expense.AttachmentDownload;
import vn.naitei.nhom3.expensemanagement.dto.expense.AttachmentResponse;
import vn.naitei.nhom3.expensemanagement.entity.Expense;
import vn.naitei.nhom3.expensemanagement.entity.ExpenseAttachment;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseAttachmentRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.service.ExpenseAttachmentService;
import vn.naitei.nhom3.expensemanagement.service.storage.ExpenseFileStorageService;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ExpenseAttachmentServiceImpl implements ExpenseAttachmentService {

    private static final int MAX_FILES = 5;
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "application/pdf");

    private final ExpenseAttachmentRepository attachmentRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseFileStorageService storageService;

    @Override
    @Transactional
    public List<AttachmentResponse> saveAll(Expense expense, List<MultipartFile> files) {
        if (files.isEmpty()) {
            return List.of();
        }
        validateFiles(expense.getId(), files);
        List<String> storedNames = new ArrayList<>();
        try {
            List<ExpenseAttachment> attachments = files.stream()
                    .map(file -> storeAttachment(expense, file, storedNames))
                    .toList();
            return attachmentRepository.saveAll(attachments).stream()
                    .map(this::toResponse)
                    .toList();
        } catch (RuntimeException ex) {
            storedNames.forEach(storageService::delete);
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAll(Long expenseId) {
        return attachmentRepository.findByExpenseId(expenseId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AttachmentDownload download(Long userId, Long expenseId, Long attachmentId) {
        findOwnedExpense(userId, expenseId);
        ExpenseAttachment attachment = findAttachment(expenseId, attachmentId);
        return new AttachmentDownload(
                storageService.load(attachment.getFilePath()),
                attachment.getFileName(),
                attachment.getFileType());
    }

    @Override
    @Transactional
    public void delete(Long userId, Long expenseId, Long attachmentId) {
        findOwnedExpense(userId, expenseId);
        ExpenseAttachment attachment = findAttachment(expenseId, attachmentId);
        storageService.delete(attachment.getFilePath());
        attachmentRepository.delete(attachment);
    }

    @Override
    @Transactional
    public void deleteAll(Long expenseId) {
        List<ExpenseAttachment> attachments = attachmentRepository.findByExpenseId(expenseId);
        attachments.forEach(attachment -> storageService.delete(attachment.getFilePath()));
        attachmentRepository.deleteAll(attachments);
    }

    private void validateFiles(Long expenseId, List<MultipartFile> files) {
        long currentCount = attachmentRepository.countByExpenseId(expenseId);
        if (currentCount + files.size() > MAX_FILES) {
            throw new BadRequestException("Each expense can have a maximum of 5 attachments");
        }
        files.forEach(this::validateFile);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File attachment cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Each file cannot exceed 5MB");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("File attachment only supports JPEG, PNG or PDF");
        }
    }

    private ExpenseAttachment storeAttachment(
            Expense expense, MultipartFile file, List<String> storedNames) {
        String storedName = storageService.store(file);
        storedNames.add(storedName);
        ExpenseAttachment attachment = new ExpenseAttachment();
        attachment.setExpense(expense);
        attachment.setFileName(getOriginalFileName(file));
        attachment.setFilePath(storedName);
        attachment.setFileType(file.getContentType());
        return attachment;
    }

    private String getOriginalFileName(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            return "file";
        }
        String normalizedName = originalName.replace('\\', '/');
        return normalizedName.substring(normalizedName.lastIndexOf('/') + 1);
    }

    private Expense findOwnedExpense(Long userId, Long expenseId) {
        return expenseRepository.findById(expenseId)
                .filter(expense -> expense.getUser().getId().equals(userId))
                .orElseThrow(() -> ResourceNotFoundException.of("Expense", expenseId));
    }

    private ExpenseAttachment findAttachment(Long expenseId, Long attachmentId) {
        return attachmentRepository.findByIdAndExpenseId(attachmentId, expenseId)
                .orElseThrow(() -> ResourceNotFoundException.of("File attachment", attachmentId));
    }

    private AttachmentResponse toResponse(ExpenseAttachment attachment) {
        String fileUrl = "/api/expenses/%d/attachments/%d/download"
                .formatted(attachment.getExpense().getId(), attachment.getId());
        return new AttachmentResponse(attachment.getId(), attachment.getFileName(), fileUrl);
    }
}
