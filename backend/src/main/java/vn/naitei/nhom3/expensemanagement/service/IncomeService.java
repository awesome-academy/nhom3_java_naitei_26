package vn.naitei.nhom3.expensemanagement.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.naitei.nhom3.expensemanagement.dto.income.IncomeRequest;
import vn.naitei.nhom3.expensemanagement.dto.income.IncomeResponse;

/**
 * Service interface cho quản lý thu nhập (Income).
 * Tất cả method nhận userId từ token (không từ FE) để đảm bảo BR-03.
 */
public interface IncomeService {

    /**
     * Lấy danh sách thu nhập của user với phân trang và bộ lọc.
     *
     * @param userId     ID user (từ token)
     * @param month      Tháng lọc (yyyy-MM), null = không lọc
     * @param pageable   Thông tin phân trang (page 0-based, size, sort)
     */
    Page<IncomeResponse> getByUser(Long userId, String month, Pageable pageable);

    /**
     * Lấy chi tiết một khoản thu nhập theo ID. Chỉ chủ sở hữu mới được xem (BR-03).
     */
    IncomeResponse getById(Long userId, Long id);

    /**
     * Tạo mới một khoản thu nhập.
     */
    IncomeResponse create(Long userId, IncomeRequest request);

    /**
     * Cập nhật khoản thu nhập. Chỉ chủ sở hữu mới được sửa (BR-03).
     */
    IncomeResponse update(Long userId, Long id, IncomeRequest request);

    /**
     * Xoá khoản thu nhập. Chỉ chủ sở hữu mới được xoá (BR-03).
     */
    void delete(Long userId, Long id);
}
