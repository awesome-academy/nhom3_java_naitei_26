package vn.naitei.nhom3.expensemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.naitei.nhom3.expensemanagement.dto.report.ReportSummaryResponse;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.IncomeRepository;
import vn.naitei.nhom3.expensemanagement.service.ReportService;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    @Override
    @Transactional(readOnly = true)
    public ReportSummaryResponse getSummary(Long userId, LocalDate from, LocalDate to) {
        validateRequest(userId, from, to);

        BigDecimal totalExpense = zeroIfNull(expenseRepository
            .sumAmountByUserIdAndExpenseDateBetween(userId, from, to));
        BigDecimal totalIncome = zeroIfNull(incomeRepository
            .sumAmountByUserIdAndIncomeDateBetween(userId, from, to));

        return new ReportSummaryResponse(
                totalIncome,
                totalExpense,
                expenseRepository.sumAmountByCategoryAndUserIdAndExpenseDateBetween(userId, from, to));
    }

    private void validateRequest(Long userId, LocalDate from, LocalDate to) {
        if (userId == null || userId <= 0) {
            throw new BadRequestException("User id must be positive");
        }
        if (from == null || to == null) {
            throw new BadRequestException("Date range is required");
        }
        if (from.isAfter(to)) {
            throw new BadRequestException("Start date must not be after end date");
        }
    }

    private BigDecimal zeroIfNull(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}