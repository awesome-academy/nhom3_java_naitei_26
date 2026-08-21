package vn.naitei.nhom3.expensemanagement.dto.budgettemplate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class BudgetTemplateResponse {

    private final Long id;
    private final String name;
    private final Integer month;
    private final Integer warningPercentage;
    private final List<BudgetTemplateDetailResponse> details;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
