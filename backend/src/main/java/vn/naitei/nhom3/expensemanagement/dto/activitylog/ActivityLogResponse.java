package vn.naitei.nhom3.expensemanagement.dto.activitylog;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ActivityLogResponse {

    private final Long id;
    private final LocalDateTime createdAt;
    private final Long userId;
    private final String actorName;
    private final String actorEmail;
    private final String action;
    private final String description;
}
