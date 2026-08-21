package vn.naitei.nhom3.expensemanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.naitei.nhom3.expensemanagement.common.response.ApiResponse;
import vn.naitei.nhom3.expensemanagement.dto.report.ReportSummaryResponse;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;
import vn.naitei.nhom3.expensemanagement.service.ReportService;

import java.time.LocalDate;
import java.time.DateTimeException;
import java.time.Year;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private static final DateTimeFormatter YEAR_FORMATTER =
            DateTimeFormatter.ofPattern("uuuu").withResolverStyle(ResolverStyle.STRICT);
    private static final DateTimeFormatter MONTH_FORMATTER =
            DateTimeFormatter.ofPattern("uuuu-MM").withResolverStyle(ResolverStyle.STRICT);

    private final ReportService reportService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ReportSummaryResponse>> getSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "period", required = false) String period,
            @RequestParam(name = "value", required = false) String value,
            @RequestParam(name = "from", required = false) String from,
            @RequestParam(name = "to", required = false) String to) {
        DateRange dateRange = resolveDateRange(period, value, from, to);
        ReportSummaryResponse response = reportService.getSummary(
                principal.getId(), dateRange.from(), dateRange.to());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private DateRange resolveDateRange(String period, String value, String from, String to) {
        boolean hasPeriodGroup = period != null || value != null;
        boolean hasCustomRange = from != null || to != null;

        if (hasPeriodGroup && hasCustomRange) {
            throw new BadRequestException("Period and custom date range cannot be combined");
        }
        if (hasPeriodGroup) {
            if (period == null || value == null || period.isBlank() || value.isBlank()) {
                throw new BadRequestException("Period and value are required together");
            }
            return resolvePeriod(period, value);
        }
        if (hasCustomRange) {
            if (from == null || to == null || from.isBlank() || to.isBlank()) {
                throw new BadRequestException("From and to are required together");
            }
            LocalDate start = parseDate(from, "from");
            LocalDate end = parseDate(to, "to");
            if (start.isAfter(end)) {
                throw new BadRequestException("From date must not be after to date");
            }
            return new DateRange(start, end);
        }
        throw new BadRequestException("Either period/value or from/to is required");
    }

    private DateRange resolvePeriod(String period, String value) {
        return switch (period.toLowerCase()) {
            case "month" -> resolveMonth(value);
            case "quarter" -> resolveQuarter(value);
            case "year" -> resolveYear(value);
            default -> throw new BadRequestException("Unsupported report period: " + period);
        };
    }

    private DateRange resolveMonth(String value) {
        try {
            YearMonth month = YearMonth.parse(value, MONTH_FORMATTER);
            return new DateRange(month.atDay(1), month.atEndOfMonth());
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("Month value must have format yyyy-MM");
        }
    }

    private DateRange resolveQuarter(String value) {
        if (!value.matches("\\d{4}-Q[1-4]")) {
            throw new BadRequestException("Quarter value must have format yyyy-Q1 through yyyy-Q4");
        }
        try {
            Year year = Year.parse(value.substring(0, 4), YEAR_FORMATTER);
            int quarter = value.charAt(6) - '0';
            int startMonth = (quarter - 1) * 3 + 1;
            YearMonth start = YearMonth.of(year.getValue(), startMonth);
            YearMonth end = start.plusMonths(2);
            return new DateRange(start.atDay(1), end.atEndOfMonth());
        } catch (DateTimeException ex) {
            throw new BadRequestException("Quarter value must have format yyyy-Q1 through yyyy-Q4");
        }
    }

    private DateRange resolveYear(String value) {
        try {
            Year year = Year.parse(value, YEAR_FORMATTER);
            return new DateRange(year.atDay(1), year.atMonth(12).atEndOfMonth());
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("Year value must have format yyyy");
        }
    }

    private LocalDate parseDate(String value, String parameter) {
        try {
            return LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException ex) {
            throw new BadRequestException(parameter + " must have format yyyy-MM-dd");
        }
    }

    private record DateRange(LocalDate from, LocalDate to) {
    }
}