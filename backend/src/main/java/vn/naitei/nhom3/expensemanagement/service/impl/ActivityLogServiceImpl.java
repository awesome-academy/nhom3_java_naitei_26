package vn.naitei.nhom3.expensemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.naitei.nhom3.expensemanagement.dto.activitylog.ActivityLogFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.activitylog.ActivityLogPageResponse;
import vn.naitei.nhom3.expensemanagement.dto.activitylog.ActivityLogResponse;
import vn.naitei.nhom3.expensemanagement.entity.ActivityLog;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.ActivityLogRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.repository.specification.ActivityLogSpecification;
import vn.naitei.nhom3.expensemanagement.service.ActivityLogService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLog> getByUserId(Long userId) {
        return activityLogRepository.findByUserId(userId);
    }

    // REQUIRES_NEW: ghi log phải luôn commit độc lập, không join transaction của caller
    // (ActivityLogAspect gọi method này từ trong transaction của nghiệp vụ chính, vd
    // BudgetTemplateAdminController.update — join vào transaction đó khiến việc ghi log
    // không thực sự persist do transaction ngoài đã ở giai đoạn commit khi advice chạy).
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ActivityLog log(Long userId, String action, String entityType, Long entityId, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Người dùng", userId));

        ActivityLog activityLog = new ActivityLog();
        activityLog.setUser(user);
        activityLog.setActorName(user.getName());
        activityLog.setActorEmail(user.getEmail());
        activityLog.setAction(action);
        activityLog.setEntityType(entityType);
        activityLog.setEntityId(entityId);
        activityLog.setDescription(description);

        return activityLogRepository.save(activityLog);
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityLogPageResponse getAll(ActivityLogFilterRequest filter) {
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ActivityLog> logs = activityLogRepository.findAll(ActivityLogSpecification.filterBy(filter), pageable);
        return new ActivityLogPageResponse(
                logs.getContent().stream().map(this::toResponse).toList(),
                logs.getNumber(),
                logs.getSize(),
                logs.getTotalElements(),
                logs.getTotalPages());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ActivityLog activityLog = activityLogRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Nhật ký hoạt động", id));
        activityLogRepository.delete(activityLog);
    }

    private ActivityLogResponse toResponse(ActivityLog activityLog) {
        return new ActivityLogResponse(
                activityLog.getId(),
                activityLog.getCreatedAt(),
                activityLog.getUser() == null ? null : activityLog.getUser().getId(),
                activityLog.getActorName(),
                activityLog.getActorEmail(),
                activityLog.getAction(),
                activityLog.getDescription());
    }
}
