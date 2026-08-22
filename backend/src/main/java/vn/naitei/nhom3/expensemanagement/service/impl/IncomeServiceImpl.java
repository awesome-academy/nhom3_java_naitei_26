package vn.naitei.nhom3.expensemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.naitei.nhom3.expensemanagement.dto.income.IncomeMapper;
import vn.naitei.nhom3.expensemanagement.dto.income.IncomeRequest;
import vn.naitei.nhom3.expensemanagement.dto.income.IncomeResponse;
import vn.naitei.nhom3.expensemanagement.entity.Income;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.IncomeRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.service.IncomeService;

/**
 * Triển khai IncomeService — quản lý CRUD thu nhập.
 *
 * Business rules áp dụng:
 * - BR-03: userId lấy từ token, không từ FE
 * - BR-04: amount > 0 (validate qua DTO annotation)
 */
@Service
@RequiredArgsConstructor
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    // ==================== READ ====================

    @Override
    @Transactional(readOnly = true)
    public Page<IncomeResponse> getByUser(Long userId, String month, Pageable pageable) {
        if (month != null && !month.trim().isEmpty()) {
            try {
                java.time.YearMonth ym = java.time.YearMonth.parse(month.trim());
                java.time.LocalDate startDate = ym.atDay(1);
                java.time.LocalDate endDate = ym.atEndOfMonth();
                return incomeRepository.findByUserIdAndIncomeDateBetweenOrderByIncomeDateDesc(userId, startDate, endDate, pageable)
                        .map(IncomeMapper::toResponse);
            } catch (Exception ignored) {
                // If invalid month format, fallback to all incomes
            }
        }
        return incomeRepository.findByUserIdOrderByIncomeDateDesc(userId, pageable)
                .map(IncomeMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public IncomeResponse getById(Long userId, Long id) {
        return IncomeMapper.toResponse(findOwnedIncome(userId, id));
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public IncomeResponse create(Long userId, IncomeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Người dùng", userId));

        Income income = new Income();
        income.setUser(user);
        applyRequestToEntity(income, request);

        return IncomeMapper.toResponse(incomeRepository.save(income));
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public IncomeResponse update(Long userId, Long id, IncomeRequest request) {
        Income income = findOwnedIncome(userId, id);

        applyRequestToEntity(income, request);

        return IncomeMapper.toResponse(incomeRepository.save(income));
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void delete(Long userId, Long id) {
        incomeRepository.delete(findOwnedIncome(userId, id));
    }

    // ==================== PRIVATE HELPERS ====================

    /**
     * Tìm income theo id, chỉ trả về nếu thuộc sở hữu của userId.
     * Trả 404 nếu không tìm thấy hoặc không thuộc user (BR-03).
     */
    private Income findOwnedIncome(Long userId, Long id) {
        return incomeRepository.findById(id)
                .filter(income -> income.getUser().getId().equals(userId))
                .orElseThrow(() -> ResourceNotFoundException.of("Thu nhập", id));
    }

    /**
     * Áp dụng dữ liệu từ request DTO vào entity Income.
     * Mapping: request.source → entity.title (theo SRS convention).
     */
    private void applyRequestToEntity(Income income, IncomeRequest request) {
        income.setTitle(request.getSource().trim());  // API "source" → entity "title"
        income.setAmount(request.getAmount());
        income.setIncomeDate(request.getDate());
        income.setNote(request.getNote());
    }
}
