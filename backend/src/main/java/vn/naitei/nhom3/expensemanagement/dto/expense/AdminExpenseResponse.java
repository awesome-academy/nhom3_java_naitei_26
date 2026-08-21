package vn.naitei.nhom3.expensemanagement.dto.expense;

import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO used by the Admin system-wide expense list (A10).
 * Extends the basic expense fields with user identity information so the
 * admin frontend can display which user each expense belongs to.
 */
@Getter
public class AdminExpenseResponse {

    private final Long id;
    private final String title;
    private final BigDecimal amount;
    private final LocalDate date;
    private final String note;
    private final Long categoryId;
    private final String categoryName;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    // User fields required by A10 screen (User/Account column)
    private final Long userId;
    private final String userName;
    private final String userEmail;

    public AdminExpenseResponse(
            Long id,
            String title,
            BigDecimal amount,
            LocalDate date,
            String note,
            Long categoryId,
            String categoryName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            Long userId,
            String userName,
            String userEmail) {
        this.id = id;
        this.title = title;
        this.amount = amount;
        this.date = date;
        this.note = note;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
    }
}
