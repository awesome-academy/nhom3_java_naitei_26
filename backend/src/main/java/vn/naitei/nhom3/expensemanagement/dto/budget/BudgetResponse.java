package vn.naitei.nhom3.expensemanagement.dto.budget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {

    private Long id;
    private Long userId;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal amount;
    private Integer month;
    private Integer year;
    private BigDecimal actualSpending;
    private Double spendingPercentage;
    private String alertStatus; // NORMAL, WARNING, EXCEEDED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
