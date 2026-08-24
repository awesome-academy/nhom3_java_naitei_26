package vn.naitei.nhom3.expensemanagement.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;

@Getter
@Setter
public class UpdateUserStatusRequest {

    @NotNull(message = "Trạng thái không được để trống")
    private UserStatus status;
}
