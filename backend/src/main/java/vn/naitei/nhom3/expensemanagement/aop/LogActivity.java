package vn.naitei.nhom3.expensemanagement.aop;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Đánh dấu một controller method để {@link ActivityLogAspect} tự động ghi
 * ActivityLog sau khi method chạy thành công.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogActivity {

    String action();

    String entityType();

    /** Biểu thức SpEL trả về entityId, vd "#id" hoặc "#result.body.data.id". */
    String entityId();

    /** Biểu thức SpEL trả về description; để trống nếu không cần. */
    String description() default "";
}
