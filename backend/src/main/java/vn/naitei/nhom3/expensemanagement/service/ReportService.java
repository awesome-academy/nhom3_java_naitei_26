package vn.naitei.nhom3.expensemanagement.service;

import vn.naitei.nhom3.expensemanagement.dto.report.ReportSummaryResponse;

import java.time.LocalDate;

public interface ReportService {

    ReportSummaryResponse getSummary(Long userId, LocalDate from, LocalDate to);
}