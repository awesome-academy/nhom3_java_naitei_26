package vn.naitei.nhom3.expensemanagement.dto.expense;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ExpensePageResponse {

    private final List<ExpenseResponse> items;
    private final int page;
    private final int size;
    private final long totalItems;
    private final int totalPages;
}
