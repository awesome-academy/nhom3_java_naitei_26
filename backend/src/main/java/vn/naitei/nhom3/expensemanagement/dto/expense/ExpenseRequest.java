package vn.naitei.nhom3.expensemanagement.dto.expense;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ExpenseRequest {

    @NotBlank(message = "Tên khoản chi không được để trống")
    @Size(max = 255, message = "Tên khoản chi tối đa 255 ký tự")
    private String title;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;

    @NotNull(message = "Ngày chi không được để trống")
    @PastOrPresent(message = "Ngày chi không được là ngày tương lai")
    private LocalDate date;

    private String note;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;
}
