package vn.naitei.nhom3.expensemanagement.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ReportCategoryResponse {

    private final Long categoryId;
    private final String name;
    private final BigDecimal amount;
}