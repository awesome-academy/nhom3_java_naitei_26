package vn.naitei.nhom3.expensemanagement.aop;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.expression.MethodBasedEvaluationContext;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.core.ParameterNameDiscoverer;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;
import vn.naitei.nhom3.expensemanagement.service.ActivityLogService;

/**
 * Tự động ghi ActivityLog sau khi một method được đánh dấu {@link LogActivity}
 * chạy thành công (BR-08). Đặt trên controller method (không phải service) để
 * 1 lần gọi HTTP tương ứng đúng 1 dòng log, dù bên trong có cascade nhiều lệnh
 * service khác nhau (vd BudgetTemplateAdminController.update loop xoá/tạo detail).
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class ActivityLogAspect {

    private final ActivityLogService activityLogService;
    private final ParameterNameDiscoverer parameterNameDiscoverer = new DefaultParameterNameDiscoverer();
    private final ExpressionParser expressionParser = new SpelExpressionParser();

    @AfterReturning(pointcut = "@annotation(logActivity)", returning = "result")
    public void logActivity(JoinPoint joinPoint, LogActivity logActivity, Object result) {
        try {
            Long userId = resolveCurrentUserId();
            if (userId == null) {
                log.warn("Bỏ qua ghi activity log cho {}: không xác định được người dùng hiện tại",
                        joinPoint.getSignature());
                return;
            }

            EvaluationContext context = buildContext(joinPoint, result);
            Long entityId = evaluate(logActivity.entityId(), context, Long.class);
            if (entityId == null) {
                log.warn("Bỏ qua ghi activity log cho {}: entityId SpEL trả về null", joinPoint.getSignature());
                return;
            }
            String description = logActivity.description().isBlank()
                    ? null
                    : evaluate(logActivity.description(), context, String.class);

            // ActivityLogService.log(...) là @Transactional(REQUIRES_NEW) — luôn commit độc
            // lập với transaction của method đang được log (nếu có), nên gọi trực tiếp ở đây
            // là an toàn dù advice này chạy lồng trong transaction của controller (vd
            // BudgetTemplateAdminController.update) hay không (vd ExpenseController).
            activityLogService.log(userId, logActivity.action(), logActivity.entityType(), entityId, description);
        } catch (Exception ex) {
            log.warn("Ghi activity log thất bại cho {}: {}", joinPoint.getSignature(), ex.getMessage());
        }
    }

    private Long resolveCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return null;
        }
        return principal.getId();
    }

    private EvaluationContext buildContext(JoinPoint joinPoint, Object result) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        EvaluationContext context = new MethodBasedEvaluationContext(
                joinPoint.getTarget(), signature.getMethod(), joinPoint.getArgs(), parameterNameDiscoverer);
        context.setVariable("result", result);
        return context;
    }

    private <T> T evaluate(String expression, EvaluationContext context, Class<T> type) {
        return expressionParser.parseExpression(expression).getValue(context, type);
    }
}
