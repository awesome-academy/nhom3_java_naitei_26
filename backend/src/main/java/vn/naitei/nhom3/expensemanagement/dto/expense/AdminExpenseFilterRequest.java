package vn.naitei.nhom3.expensemanagement.dto.expense;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Filter/pagination request DTO for the Admin system-wide expense list (A10).
 * All fields are optional except the page/size defaults.
 * Adds {@code userId} so the admin can optionally scope results to a single user.
 */
@Getter
@Setter
public class AdminExpenseFilterRequest {

    @Min(value = 0, message = "Trang phải bắt đầu từ 0")
    private int page = 0;

    @Min(value = 1, message = "Kích thước trang phải từ 1 đến 100")
    @Max(value = 100, message = "Kích thước trang phải từ 1 đến 100")
    private int size = 10;

    @Pattern(
            regexp = "(?i)^(date|title|amount),(asc|desc)$",
            message = "Sắp xếp phải có dạng field,asc hoặc field,desc")
    private String sort;

    @Size(max = 255, message = "Từ khoá tìm kiếm tối đa 255 ký tự")
    private String search;

    /** Optional: scope results to a specific user (admin filter by user). */
    @Positive(message = "userId phải lớn hơn 0")
    private Long userId;

    @Positive(message = "Danh mục phải có id lớn hơn 0")
    private Long categoryId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;

    @DecimalMin(value = "0.00", message = "Số tiền tối thiểu không được âm")
    private BigDecimal minAmount;

    @DecimalMin(value = "0.00", message = "Số tiền tối đa không được âm")
    private BigDecimal maxAmount;

    @AssertTrue(message = "Ngày bắt đầu không được sau ngày kết thúc")
    public boolean isDateRangeValid() {
        return fromDate == null || toDate == null || !fromDate.isAfter(toDate);
    }

    @AssertTrue(message = "Số tiền tối thiểu không được lớn hơn số tiền tối đa")
    public boolean isAmountRangeValid() {
        return minAmount == null || maxAmount == null || minAmount.compareTo(maxAmount) <= 0;
    }
}
