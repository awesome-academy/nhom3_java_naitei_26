package vn.naitei.nhom3.expensemanagement.expense;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import vn.naitei.nhom3.expensemanagement.dto.expense.AdminExpenseFilterRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class AdminExpenseFilterRequestValidationTest {

    private static Validator validator;
    private static AutoCloseable validatorFactory;

    @BeforeAll
    static void setUpValidator() {
        var factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        validatorFactory = factory;
    }

    @AfterAll
    static void closeValidatorFactory() throws Exception {
        validatorFactory.close();
    }

    @Test
    void acceptsSupportedSortFieldsAndDirections() {
        for (String field : new String[]{"date", "amount", "title"}) {
            for (String direction : new String[]{"asc", "desc"}) {
                AdminExpenseFilterRequest request = new AdminExpenseFilterRequest();
                request.setSort(field + "," + direction);

                assertThat(validator.validate(request)).isEmpty();
            }
        }
    }

    @Test
    void rejectsUnsupportedSortFieldsAndDirections() {
        assertThat(violationsFor(requestWithSort("createdAt,asc"))).isNotEmpty();
        assertThat(violationsFor(requestWithSort("date,sideways"))).isNotEmpty();
    }

    @Test
    void rejectsInvalidPaginationAndIdentifiers() {
        AdminExpenseFilterRequest request = new AdminExpenseFilterRequest();
        request.setPage(-1);
        request.setSize(101);
        request.setUserId(0L);
        request.setCategoryId(-1L);

        assertThat(violationsFor(request))
                .contains("page", "size", "userId", "categoryId");
    }

    @Test
    void rejectsInvalidDateAndAmountRanges() {
        AdminExpenseFilterRequest request = new AdminExpenseFilterRequest();
        request.setFromDate(LocalDate.of(2026, 8, 20));
        request.setToDate(LocalDate.of(2026, 8, 1));
        request.setMinAmount(new BigDecimal("60000"));
        request.setMaxAmount(new BigDecimal("30000"));

        assertThat(violationsFor(request))
                .contains("dateRangeValid", "amountRangeValid");
    }

    @Test
    void rejectsNegativeAmounts() {
        AdminExpenseFilterRequest request = new AdminExpenseFilterRequest();
        request.setMinAmount(new BigDecimal("-0.01"));
        request.setMaxAmount(new BigDecimal("-1"));

        assertThat(violationsFor(request))
                .contains("minAmount", "maxAmount");
    }

    private Set<String> violationsFor(AdminExpenseFilterRequest request) {
        Set<String> propertyPaths = new HashSet<>();
        validator.validate(request).forEach(violation ->
                propertyPaths.add(violation.getPropertyPath().toString()));
        return propertyPaths;
    }

    private AdminExpenseFilterRequest requestWithSort(String sort) {
        AdminExpenseFilterRequest request = new AdminExpenseFilterRequest();
        request.setSort(sort);
        return request;
    }
}