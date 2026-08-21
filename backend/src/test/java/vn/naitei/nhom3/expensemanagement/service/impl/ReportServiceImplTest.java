package vn.naitei.nhom3.expensemanagement.service.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.naitei.nhom3.expensemanagement.dto.report.ReportCategoryResponse;
import vn.naitei.nhom3.expensemanagement.dto.report.ReportSummaryResponse;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.IncomeRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private IncomeRepository incomeRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    @Test
    void getSummaryDelegatesUserAndDateRangeAndReturnsAllAggregates() {
        Long userId = 42L;
        LocalDate from = LocalDate.of(2026, 8, 1);
        LocalDate to = LocalDate.of(2026, 8, 31);
        List<ReportCategoryResponse> byCategory = List.of(
                new ReportCategoryResponse(3L, "Food", new BigDecimal("1200000")));

        when(expenseRepository.sumAmountByUserIdAndExpenseDateBetween(userId, from, to))
                .thenReturn(new BigDecimal("3000000"));
        when(incomeRepository.sumAmountByUserIdAndIncomeDateBetween(userId, from, to))
                .thenReturn(new BigDecimal("4500000"));
        when(expenseRepository.sumAmountByCategoryAndUserIdAndExpenseDateBetween(userId, from, to))
                .thenReturn(byCategory);

        ReportSummaryResponse result = reportService.getSummary(userId, from, to);

        assertEquals(new BigDecimal("4500000"), result.getTotalIncome());
        assertEquals(new BigDecimal("3000000"), result.getTotalExpense());
        assertEquals(byCategory, result.getByCategory());
        verify(expenseRepository).sumAmountByUserIdAndExpenseDateBetween(userId, from, to);
        verify(incomeRepository).sumAmountByUserIdAndIncomeDateBetween(userId, from, to);
        verify(expenseRepository).sumAmountByCategoryAndUserIdAndExpenseDateBetween(userId, from, to);
    }

    @Test
    void getSummaryNormalizesNullTotalsToZero() {
        Long userId = 42L;
        LocalDate from = LocalDate.of(2026, 8, 1);
        LocalDate to = LocalDate.of(2026, 8, 31);
        when(expenseRepository.sumAmountByUserIdAndExpenseDateBetween(userId, from, to))
                .thenReturn(null);
        when(incomeRepository.sumAmountByUserIdAndIncomeDateBetween(userId, from, to))
                .thenReturn(null);
        when(expenseRepository.sumAmountByCategoryAndUserIdAndExpenseDateBetween(userId, from, to))
                .thenReturn(List.of());

        ReportSummaryResponse result = reportService.getSummary(userId, from, to);

        assertEquals(BigDecimal.ZERO, result.getTotalIncome());
        assertEquals(BigDecimal.ZERO, result.getTotalExpense());
        assertEquals(List.of(), result.getByCategory());
    }

    @Test
    void getSummaryRejectsNullUserId() {
        assertThrows(BadRequestException.class,
                () -> reportService.getSummary(null, LocalDate.MIN, LocalDate.MAX));

        verifyNoInteractions(expenseRepository, incomeRepository);
    }

    @Test
    void getSummaryRejectsNonPositiveUserId() {
        assertThrows(BadRequestException.class,
                () -> reportService.getSummary(0L, LocalDate.MIN, LocalDate.MAX));

        verifyNoInteractions(expenseRepository, incomeRepository);
    }

    @Test
    void getSummaryRejectsNullStartDate() {
        assertThrows(BadRequestException.class,
                () -> reportService.getSummary(42L, null, LocalDate.of(2026, 8, 31)));

        verifyNoInteractions(expenseRepository, incomeRepository);
    }

    @Test
    void getSummaryRejectsNullEndDate() {
        assertThrows(BadRequestException.class,
                () -> reportService.getSummary(42L, LocalDate.of(2026, 8, 1), null));

        verifyNoInteractions(expenseRepository, incomeRepository);
    }

    @Test
    void getSummaryRejectsStartDateAfterEndDate() {
        assertThrows(BadRequestException.class,
                () -> reportService.getSummary(
                        42L,
                        LocalDate.of(2026, 9, 1),
                        LocalDate.of(2026, 8, 31)));

        verifyNoInteractions(expenseRepository, incomeRepository);
    }
}