package vn.naitei.nhom3.expensemanagement.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.naitei.nhom3.expensemanagement.dto.report.ReportComparisonResponse;
import vn.naitei.nhom3.expensemanagement.dto.report.ReportPeriodAmount;
import vn.naitei.nhom3.expensemanagement.dto.report.ReportSummaryResponse;
import vn.naitei.nhom3.expensemanagement.dto.report.ReportTrendPoint;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.IncomeRepository;
import vn.naitei.nhom3.expensemanagement.service.ReportService;

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

            @Override
            @Transactional(readOnly = true)
            public ReportComparisonResponse getComparison(Long userId, LocalDate from, LocalDate to) {
            validateRequest(userId, from, to);

            BigDecimal totalIncome = zeroIfNull(incomeRepository
                .sumAmountByUserIdAndIncomeDateBetween(userId, from, to));
            BigDecimal totalExpense = zeroIfNull(expenseRepository
                .sumAmountByUserIdAndExpenseDateBetween(userId, from, to));
            return new ReportComparisonResponse(totalIncome, totalExpense, totalIncome.subtract(totalExpense));
            }

    @Override
    @Transactional(readOnly = true)
    public List<ReportTrendPoint> getTrend(Long userId, LocalDate from, LocalDate to) {
        validateRequest(userId, from, to);

        YearMonth startMonth = YearMonth.from(from);
        YearMonth endMonth = YearMonth.from(to);

        // Trường hợp 1: Nếu khoảng thời gian nằm trọn vẹn trong 1 tháng -> Gom nhóm theo 4 tuần
        if (startMonth.equals(endMonth)) {
            return getWeeklyTrend(userId, from, to, startMonth);
        }

        // Trường hợp 2: Nếu khoảng thời gian trải dài nhiều tháng (Quý / Năm) -> Gom nhóm theo từng tháng
        return getMonthlyTrend(userId, from, to, startMonth, endMonth);
    }

    private List<ReportTrendPoint> getWeeklyTrend(Long userId, LocalDate from, LocalDate to, YearMonth month) {
        Map<Integer, BigDecimal> incomeByDay = toDailyAmounts(
                incomeRepository.sumDailyAmountByUserIdAndIncomeDateBetween(userId, from, to));
        Map<Integer, BigDecimal> expenseByDay = toDailyAmounts(
                expenseRepository.sumDailyAmountByUserIdAndExpenseDateBetween(userId, from, to));

        BigDecimal[] weekIncomes = new BigDecimal[] { BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO };
        BigDecimal[] weekExpenses = new BigDecimal[] { BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO };

        for (int day = 1; day <= month.lengthOfMonth(); day++) {
            int weekIdx = getWeekIndex(day);
            BigDecimal dayInc = incomeByDay.getOrDefault(day, BigDecimal.ZERO);
            BigDecimal dayExp = expenseByDay.getOrDefault(day, BigDecimal.ZERO);

            weekIncomes[weekIdx] = weekIncomes[weekIdx].add(dayInc);
            weekExpenses[weekIdx] = weekExpenses[weekIdx].add(dayExp);
        }

        List<ReportTrendPoint> trend = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            trend.add(new ReportTrendPoint(
                    month + "-W" + (i + 1),
                    weekIncomes[i],
                    weekExpenses[i]));
        }
        return trend;
    }

    private List<ReportTrendPoint> getMonthlyTrend(Long userId, LocalDate from, LocalDate to, YearMonth start, YearMonth end) {
        Map<YearMonth, BigDecimal> incomeByMonth = toMonthlyAmounts(
                incomeRepository.sumMonthlyAmountByUserIdAndIncomeDateBetween(userId, from, to));
        Map<YearMonth, BigDecimal> expenseByMonth = toMonthlyAmounts(
                expenseRepository.sumMonthlyAmountByUserIdAndExpenseDateBetween(userId, from, to));

        List<ReportTrendPoint> trend = new ArrayList<>();
        YearMonth current = start;
        while (!current.isAfter(end)) {
            trend.add(new ReportTrendPoint(
                    current.toString(),
                    incomeByMonth.getOrDefault(current, BigDecimal.ZERO),
                    expenseByMonth.getOrDefault(current, BigDecimal.ZERO)));
            current = current.plusMonths(1);
        }
        return trend;
    }

    private int getWeekIndex(int day) {
        if (day <= 7) return 0;       // W1
        if (day <= 14) return 1;      // W2
        if (day <= 21) return 2;      // W3
        return 3;                     // W4 (từ ngày 22 đến hết tháng)
    }

    private Map<Integer, BigDecimal> toDailyAmounts(List<Object[]> rows) {
        Map<Integer, BigDecimal> result = new HashMap<>();
        for (Object[] row : rows) {
            int day = ((Number) row[2]).intValue();
            BigDecimal amount = zeroIfNull((BigDecimal) row[3]);
            result.put(day, amount);
        }
        return result;
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

    private Map<YearMonth, BigDecimal> toMonthlyAmounts(List<Object[]> rows) {
        Map<YearMonth, BigDecimal> result = new HashMap<>();
        for (Object[] row : rows) {
            ReportPeriodAmount amount = new ReportPeriodAmount(
                    ((Number) row[0]).intValue(),
                    ((Number) row[1]).intValue(),
                    (BigDecimal) row[2]);
            result.put(YearMonth.of(amount.getYear(), amount.getMonth()), zeroIfNull(amount.getAmount()));
        }
        return result;
    }
}