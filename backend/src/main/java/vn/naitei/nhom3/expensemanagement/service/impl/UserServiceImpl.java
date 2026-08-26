package vn.naitei.nhom3.expensemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.naitei.nhom3.expensemanagement.dto.user.UserFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.user.UserPageResponse;
import vn.naitei.nhom3.expensemanagement.dto.user.UserResponse;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;
import vn.naitei.nhom3.expensemanagement.exception.ForbiddenException;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.repository.specification.UserSpecification;
import vn.naitei.nhom3.expensemanagement.service.UserService;

import java.util.List;
import java.util.Optional;

/**
 * Triển khai UserService — quản trị người dùng cho Admin (#99029).
 *
 * Business rules áp dụng:
 * - BR-17: Admin không tự khoá chính mình (không áp dụng cho đổi vai trò —
 *   SRS chỉ ràng buộc hành vi xoá/khoá).
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional
    public User create(User user) {
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User update(Long id, User updated) {
        User user = getById(id);
        user.setName(updated.getName());
        user.setEmail(updated.getEmail());
        user.setRole(updated.getRole());
        user.setStatus(updated.getStatus());
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = getById(id);
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserPageResponse getAllForAdmin(UserFilterRequest filter) {
        Pageable pageable = PageRequest.of(
                filter.getPage(), filter.getSize(), Sort.by(Sort.Order.desc("id")));
        Page<User> users = userRepository.findAll(UserSpecification.filterBy(filter), pageable);
        return new UserPageResponse(
                users.getContent().stream().map(this::toResponse).toList(),
                users.getNumber(),
                users.getSize(),
                users.getTotalElements(),
                users.getTotalPages());
    }

    @Override
    @Transactional
    public User updateRole(Long id, Role role) {
        User user = getById(id);
        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateStatus(Long id, UserStatus status, Long currentAdminId) {
        if (id.equals(currentAdminId) && status == UserStatus.INACTIVE) {
            throw new ForbiddenException("Can not lock your own account");
        }
        User user = getById(id);
        user.setStatus(status);
        return userRepository.save(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
