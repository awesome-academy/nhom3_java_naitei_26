package vn.naitei.nhom3.expensemanagement.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class ReportSummaryResponse {

    private final BigDecimal totalIncome;
    private final BigDecimal totalExpense;
    private final List<ReportCategoryResponse> byCategory;
}