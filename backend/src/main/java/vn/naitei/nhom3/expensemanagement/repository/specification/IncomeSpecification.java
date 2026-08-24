package vn.naitei.nhom3.expensemanagement.repository.specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import vn.naitei.nhom3.expensemanagement.dto.income.AdminIncomeFilterRequest;
import vn.naitei.nhom3.expensemanagement.entity.Income;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.function.Function;

public final class IncomeSpecification {

    private IncomeSpecification() {
    }

    public static Specification<Income> filterByAdmin(AdminIncomeFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            addOptionalPredicate(predicates, filter.getUserId(),
                    value -> criteriaBuilder.equal(root.get("user").get("id"), value));
            addSearchPredicate(filter.getSearch(), predicates, root.get("title"), criteriaBuilder);
            addOptionalPredicate(predicates, filter.getFromDate(),
                    value -> criteriaBuilder.greaterThanOrEqualTo(root.get("incomeDate"), value));
            addOptionalPredicate(predicates, filter.getToDate(),
                    value -> criteriaBuilder.lessThanOrEqualTo(root.get("incomeDate"), value));
            addOptionalPredicate(predicates, filter.getMinAmount(),
                    value -> criteriaBuilder.greaterThanOrEqualTo(root.get("amount"), value));
            addOptionalPredicate(predicates, filter.getMaxAmount(),
                    value -> criteriaBuilder.lessThanOrEqualTo(root.get("amount"), value));

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static void addSearchPredicate(
            String search,
            List<Predicate> predicates,
            Path<String> titlePath,
            CriteriaBuilder criteriaBuilder) {
        if (search == null || search.isBlank()) {
            return;
        }
        String keyword = search.trim().toLowerCase(Locale.ROOT);
        predicates.add(criteriaBuilder.like(criteriaBuilder.lower(titlePath), "%" + keyword + "%"));
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
