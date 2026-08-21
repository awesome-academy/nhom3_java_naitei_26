package vn.naitei.nhom3.expensemanagement.service;

import vn.naitei.nhom3.expensemanagement.dto.activitylog.ActivityLogFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.activitylog.ActivityLogPageResponse;
import vn.naitei.nhom3.expensemanagement.entity.ActivityLog;

import java.util.List;

public interface ActivityLogService {

    List<ActivityLog> getByUserId(Long userId);

    ActivityLog log(Long userId, String action, String entityType, Long entityId, String description);

    ActivityLogPageResponse getAll(ActivityLogFilterRequest filter);

    void delete(Long id);
}
