package vn.naitei.nhom3.expensemanagement.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.naitei.nhom3.expensemanagement.dto.auth.AuthResponse;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private AuthResponse.UserDto user;
}