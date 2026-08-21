package vn.naitei.nhom3.expensemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import vn.naitei.nhom3.expensemanagement.entity.ActivityLog;

import java.util.List;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long>, JpaSpecificationExecutor<ActivityLog> {

    List<ActivityLog> findByUserId(Long userId);

    List<ActivityLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
