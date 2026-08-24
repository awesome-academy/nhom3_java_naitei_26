package vn.naitei.nhom3.expensemanagement.dto.income;

import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class AdminIncomeResponse {

    private final Long id;
    private final String source;
    private final BigDecimal amount;
    private final LocalDate date;
    private final String note;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    // User fields required by A10 screen (User/Account column)
    private final Long userId;
    private final String userName;
    private final String userEmail;

    public AdminIncomeResponse(
            Long id,
            String source,
            BigDecimal amount,
            LocalDate date,
            String note,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            Long userId,
            String userName,
            String userEmail) {
        this.id = id;
        this.source = source;
        this.amount = amount;
        this.date = date;
        this.note = note;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
    }
}
