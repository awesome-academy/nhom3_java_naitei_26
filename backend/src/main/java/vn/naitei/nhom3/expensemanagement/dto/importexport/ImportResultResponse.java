package vn.naitei.nhom3.expensemanagement.dto.importexport;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ImportResultResponse {

    private final int successCount;
    private final int failedCount;
    private final List<String> errors;
}
