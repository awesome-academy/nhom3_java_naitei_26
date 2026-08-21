package vn.naitei.nhom3.expensemanagement.dto.activitylog;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class ActivityLogFilterRequest {

    @Min(value = 0, message = "Trang phải bắt đầu từ 0")
    private int page = 0;

    @Min(value = 1, message = "Kích thước trang phải từ 1 đến 100")
    @Max(value = 100, message = "Kích thước trang phải từ 1 đến 100")
    private int size = 10;

    @Positive(message = "Người dùng phải có id lớn hơn 0")
    private Long userId;

    @Size(max = 50, message = "Hành động tối đa 50 ký tự")
    private String action;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;

    @AssertTrue(message = "Ngày bắt đầu không được sau ngày kết thúc")
    public boolean isDateRangeValid() {
        return fromDate == null || toDate == null || !fromDate.isAfter(toDate);
    }
}
