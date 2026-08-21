package vn.naitei.nhom3.expensemanagement.repository.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import vn.naitei.nhom3.expensemanagement.dto.activitylog.ActivityLogFilterRequest;
import vn.naitei.nhom3.expensemanagement.entity.ActivityLog;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

public final class ActivityLogSpecification {

    private ActivityLogSpecification() {
    }

    public static Specification<ActivityLog> filterBy(ActivityLogFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            addOptionalPredicate(predicates, filter.getUserId(),
                    value -> criteriaBuilder.equal(root.get("user").get("id"), value));
            addOptionalPredicate(predicates, filter.getAction(),
                    value -> criteriaBuilder.equal(root.get("action"), value));
            addOptionalPredicate(predicates, filter.getFromDate(),
                    value -> criteriaBuilder.greaterThanOrEqualTo(
                            root.get("createdAt"), value.atStartOfDay()));
            addOptionalPredicate(predicates, filter.getToDate(),
                    value -> criteriaBuilder.lessThanOrEqualTo(
                            root.get("createdAt"), value.atTime(LocalTime.MAX)));

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static <T> void addOptionalPredicate(
            List<Predicate> predicates,
            T value,
            Function<T, Predicate> predicateFactory) {
        if (value != null) {
            predicates.add(predicateFactory.apply(value));
        }
    }
}
