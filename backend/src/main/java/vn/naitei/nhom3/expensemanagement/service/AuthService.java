package vn.naitei.nhom3.expensemanagement.service;

import vn.naitei.nhom3.expensemanagement.dto.auth.*;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;

public interface AuthService {

    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(UserPrincipal principal);
    RefreshTokenResponse refreshToken(RefreshTokenRequest request);
}
