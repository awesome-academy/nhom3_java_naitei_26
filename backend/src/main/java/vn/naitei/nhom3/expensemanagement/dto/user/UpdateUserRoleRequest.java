package vn.naitei.nhom3.expensemanagement.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;

@Getter
@Setter
public class UpdateUserRoleRequest {

    @NotNull(message = "Vai trò không được để trống")
    private Role role;
}
