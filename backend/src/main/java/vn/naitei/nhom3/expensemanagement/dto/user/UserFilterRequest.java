package vn.naitei.nhom3.expensemanagement.dto.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;

@Getter
@Setter
public class UserFilterRequest {

    @Min(value = 0, message = "Trang phải bắt đầu từ 0")
    private int page = 0;

    @Min(value = 1, message = "Kích thước trang phải từ 1 đến 100")
    @Max(value = 100, message = "Kích thước trang phải từ 1 đến 100")
    private int size = 10;

    private UserStatus status;

    private Role role;

    @Size(max = 255, message = "Từ khoá tìm kiếm tối đa 255 ký tự")
    private String search;
}
