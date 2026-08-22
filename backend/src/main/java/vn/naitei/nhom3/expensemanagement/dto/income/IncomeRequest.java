package vn.naitei.nhom3.expensemanagement.dto.income;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO cho tạo/sửa thu nhập.
 * Field "source" tương ứng với cột "title" trong entity Income
 * (SRS quy ước tên field API là "source").
 */
@Getter
@Setter
public class IncomeRequest {

    @NotBlank(message = "Nguồn thu nhập không được để trống")
    @Size(max = 255, message = "Nguồn thu nhập tối đa 255 ký tự")
    private String source;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;

    @NotNull(message = "Ngày nhận không được để trống")
    private LocalDate date;

    private String note;
}
