package vn.naitei.nhom3.expensemanagement.dto.budgettemplate;

import java.util.List;
import java.util.Objects;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BudgetTemplateUpdateRequest {

    private static final int WARNING_PERCENTAGE_STEP = 5;

    @NotBlank(message = "Name must not be blank")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer month;

    @NotNull(message = "Warning percentage is required")
    @Min(value = 50, message = "Warning percentage must be between 50 and 100")
    @Max(value = 100, message = "Warning percentage must be between 50 and 100")
    private Integer warningPercentage;

    @Valid
    @NotEmpty(message = "Details must not be empty")
    private List<BudgetTemplateDetailRequest> details;

    @AssertTrue(message = "Warning percentage must be a multiple of 5")
    public boolean isWarningPercentageStepValid() {
        return warningPercentage == null || warningPercentage % WARNING_PERCENTAGE_STEP == 0;
    }

    @AssertTrue(message = "Each category can only appear once in details")
    public boolean isUniqueCategoryDetails() {
        if (details == null || details.isEmpty()) {
            return true;
        }
        long nonNullCategoryCount = details.stream()
                .map(BudgetTemplateDetailRequest::getCategoryId)
                .filter(Objects::nonNull)
                .count();
        long distinctCategoryCount = details.stream()
                .map(BudgetTemplateDetailRequest::getCategoryId)
                .filter(Objects::nonNull)
                .distinct()
                .count();
        return nonNullCategoryCount == distinctCategoryCount;
    }
}
