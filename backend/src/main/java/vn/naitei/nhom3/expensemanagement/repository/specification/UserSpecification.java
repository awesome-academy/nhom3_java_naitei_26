package vn.naitei.nhom3.expensemanagement.repository.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import vn.naitei.nhom3.expensemanagement.dto.user.UserFilterRequest;
import vn.naitei.nhom3.expensemanagement.entity.User;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

public final class UserSpecification {

    private UserSpecification() {
    }

    public static Specification<User> filterBy(UserFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            addOptionalPredicate(predicates, filter.getStatus(),
                    value -> criteriaBuilder.equal(root.get("status"), value));
            addOptionalPredicate(predicates, filter.getRole(),
                    value -> criteriaBuilder.equal(root.get("role"), value));
            addOptionalPredicate(predicates, filter.getSearch(),
                    value -> {
                        String pattern = "%" + value.trim().toLowerCase() + "%";
                        return criteriaBuilder.or(
                                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern),
                                criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), pattern));
                    });

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static <T> void addOptionalPredicate(
            List<Predicate> predicates,
            T value,
            Function<T, Predicate> predicateFactory) {
        if (value != null && !(value instanceof String str && str.isBlank())) {
            predicates.add(predicateFactory.apply(value));
        }
    }
}
