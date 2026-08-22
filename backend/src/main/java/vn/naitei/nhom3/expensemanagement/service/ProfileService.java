package vn.naitei.nhom3.expensemanagement.service;

import vn.naitei.nhom3.expensemanagement.dto.auth.UpdateProfileRequest;
import vn.naitei.nhom3.expensemanagement.dto.auth.UserProfileResponse;

public interface ProfileService {

    UserProfileResponse getCurrentUserProfile(String email);

    UserProfileResponse updateCurrentUserName(String email, UpdateProfileRequest request);
}