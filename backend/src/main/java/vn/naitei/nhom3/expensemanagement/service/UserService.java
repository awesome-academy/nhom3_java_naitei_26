package vn.naitei.nhom3.expensemanagement.service;

import vn.naitei.nhom3.expensemanagement.dto.user.UserFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.user.UserPageResponse;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;

import java.util.List;
import java.util.Optional;

public interface UserService {

    List<User> getAll();

    User getById(Long id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    User create(User user);

    User update(Long id, User updated);

    void delete(Long id);

    /**
     * Admin: danh sách người dùng phân trang, lọc theo status/role/search (#99029).
     */
    UserPageResponse getAllForAdmin(UserFilterRequest filter);

    /**
     * Admin: đổi vai trò người dùng.
     */
    User updateRole(Long id, Role role);

    /**
     * Admin: khoá/mở khoá người dùng (active/inactive).
     * BR-17: admin không tự khoá chính mình.
     */
    User updateStatus(Long id, UserStatus status, Long currentAdminId);
}
