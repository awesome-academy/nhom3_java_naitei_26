package vn.naitei.nhom3.expensemanagement.dto.budgettemplate;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class BudgetTemplateDetailResponse {

    private final Long id;
    private final Long categoryId;
    private final String categoryName;
    private final String categoryIcon;
    private final BigDecimal amount;
}
