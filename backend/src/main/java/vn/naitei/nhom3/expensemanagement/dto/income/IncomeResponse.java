package vn.naitei.nhom3.expensemanagement.dto.income;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO cho thu nhập.
 * Trả về đúng contract API SRS mục 7.4:
 * id, source, amount, date, categoryId, categoryName, note, timestamps.
 */
@Getter
@AllArgsConstructor
public class IncomeResponse {

    private final Long id;
    private final String source;
    private final BigDecimal amount;
    private final LocalDate date;

    private final String note;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
