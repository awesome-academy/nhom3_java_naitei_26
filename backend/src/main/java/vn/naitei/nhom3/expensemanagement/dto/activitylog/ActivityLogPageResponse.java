package vn.naitei.nhom3.expensemanagement.dto.activitylog;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ActivityLogPageResponse {

    private final List<ActivityLogResponse> items;
    private final int page;
    private final int size;
    private final long totalItems;
    private final int totalPages;
}
