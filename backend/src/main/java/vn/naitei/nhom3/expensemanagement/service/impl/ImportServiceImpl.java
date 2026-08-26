package vn.naitei.nhom3.expensemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.naitei.nhom3.expensemanagement.dto.importexport.ImportEntityType;
import vn.naitei.nhom3.expensemanagement.dto.importexport.ImportResultResponse;
import vn.naitei.nhom3.expensemanagement.entity.Budget;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.Expense;
import vn.naitei.nhom3.expensemanagement.entity.Income;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.repository.BudgetRepository;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.IncomeRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.service.ImportService;

import java.io.IOException;
import java.io.StringReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Import CSV không bọc @Transactional ở method cấp cao: mỗi repository.save(...)
 * tự commit theo transaction ngầm định riêng của Spring Data, đúng BR-18 (dòng hợp lệ
 * commit ngay, dòng lỗi bị bỏ qua, không rollback toàn file).
 */
@Service
@RequiredArgsConstructor
public class ImportServiceImpl implements ImportService {

    private static final int MAX_ROWS = 5000;

    private static final Map<ImportEntityType, List<String>> REQUIRED_COLUMNS = Map.of(
            ImportEntityType.USER, List.of("name", "email", "password", "role", "active"),
            ImportEntityType.EXPENSE, List.of("userEmail", "title", "category", "amount", "date", "note"),
            ImportEntityType.INCOME, List.of("userEmail", "source", "category", "amount", "date", "note"),
            ImportEntityType.CATEGORY, List.of("name", "description", "type"),
            ImportEntityType.BUDGET, List.of("userEmail", "category", "month", "amount"));

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final BudgetRepository budgetRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ImportResultResponse importCsv(ImportEntityType entityType, MultipartFile file) {
        List<CSVRecord> records = parse(entityType, file);

        int successCount = 0;
        List<String> errors = new ArrayList<>();

        for (CSVRecord record : records) {
            try {
                processRecord(entityType, record);
                successCount++;
            } catch (RuntimeException ex) {
                // getRecordNumber() không tính dòng header (bắt đầu từ 1 cho dòng dữ liệu đầu tiên);
                // +1 để khớp số dòng thật trong file (header = dòng 1).
                errors.add("Dòng " + (record.getRecordNumber() + 1) + ": " + ex.getMessage());
            }
        }

        return new ImportResultResponse(successCount, errors.size(), errors);
    }

    private List<CSVRecord> parse(ImportEntityType entityType, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File CSV trống");
        }

        String content = readAsUtf8(file);
        if (content.isBlank()) {
            throw new BadRequestException("File CSV trống");
        }

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setTrim(true)
                .setIgnoreEmptyLines(true)
                .build();

        List<CSVRecord> records;
        Set<String> headerNames;
        try (CSVParser parser = CSVParser.parse(new StringReader(content), format)) {
            headerNames = new HashSet<>(parser.getHeaderNames());
            records = parser.getRecords();
        } catch (IOException ex) {
            throw new BadRequestException("Không đọc được file CSV: " + ex.getMessage());
        }

        List<String> missingColumns = REQUIRED_COLUMNS.get(entityType).stream()
                .filter(column -> !headerNames.contains(column))
                .toList();
        if (!missingColumns.isEmpty()) {
            throw new BadRequestException(
                    "File CSV thiếu cột bắt buộc: " + String.join(", ", missingColumns));
        }

        if (records.size() > MAX_ROWS) {
            throw new BadRequestException(
                    "File CSV vượt quá giới hạn " + MAX_ROWS + " dòng dữ liệu (hiện có "
                            + records.size() + " dòng)");
        }

        return records;
    }

    private String readAsUtf8(MultipartFile file) {
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("Không đọc được file CSV");
        }
        int offset = hasUtf8Bom(bytes) ? 3 : 0;
        return new String(bytes, offset, bytes.length - offset, StandardCharsets.UTF_8);
    }

    private boolean hasUtf8Bom(byte[] bytes) {
        return bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xEF
                && (bytes[1] & 0xFF) == 0xBB
                && (bytes[2] & 0xFF) == 0xBF;
    }

    private void processRecord(ImportEntityType entityType, CSVRecord record) {
        switch (entityType) {
            case USER -> processUserRow(record);
            case EXPENSE -> processExpenseRow(record);
            case INCOME -> processIncomeRow(record);
            case CATEGORY -> processCategoryRow(record);
            case BUDGET -> processBudgetRow(record);
        }
    }

    private void processUserRow(CSVRecord record) {
        String name = requireText(record, "name", "name không được để trống");
        String email = requireText(record, "email", "email không được để trống");
        if (!email.contains("@")) {
            throw new BadRequestException("email không hợp lệ: " + email);
        }
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("email đã tồn tại: " + email);
        }
        String password = requireText(record, "password", "password không được để trống");
        Role role = parseEnum(Role.class, record.get("role"), "role");
        UserStatus status = parseActive(record.get("active"));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setStatus(status);
        userRepository.save(user);
    }

    private void processCategoryRow(CSVRecord record) {
        String name = requireText(record, "name", "name không được để trống");
        CategoryType type = parseEnum(CategoryType.class, record.get("type"), "type");
        String description = record.isSet("description") ? record.get("description") : null;

        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setType(type);
        categoryRepository.save(category);
    }

    private void processExpenseRow(CSVRecord record) {
        User user = resolveUserByEmail(record.get("userEmail"));
        String title = requireText(record, "title", "title không được để trống");
        BigDecimal amount = parseAmount(record.get("amount"));
        LocalDate date = parseDate(record.get("date"));
        if (date.isAfter(LocalDate.now())) {
            throw new BadRequestException("date không được là ngày tương lai: " + date);
        }
        Category category = resolveCategoryByName(user.getId(), record.get("category"), CategoryType.EXPENSE);
        String note = record.isSet("note") ? record.get("note") : null;

        Expense expense = new Expense();
        expense.setUser(user);
        expense.setCategory(category);
        expense.setTitle(title);
        expense.setAmount(amount);
        expense.setExpenseDate(date);
        expense.setNote(note);
        expenseRepository.save(expense);
    }

    private void processIncomeRow(CSVRecord record) {
        User user = resolveUserByEmail(record.get("userEmail"));
        String source = requireText(record, "source", "source không được để trống");
        BigDecimal amount = parseAmount(record.get("amount"));
        LocalDate date = parseDate(record.get("date"));
        // Category category = resolveCategoryByName(user.getId(), record.get("category"), CategoryType.INCOME);
        String note = record.isSet("note") ? record.get("note") : null;

        Income income = new Income();
        income.setUser(user);
        // income.setCategory(category);
        income.setTitle(source);
        income.setAmount(amount);
        income.setIncomeDate(date);
        income.setNote(note);
        incomeRepository.save(income);
    }

    private void processBudgetRow(CSVRecord record) {
        User user = resolveUserByEmail(record.get("userEmail"));
        Category category = resolveCategoryByName(user.getId(), record.get("category"), CategoryType.EXPENSE);
        YearMonth yearMonth = parseYearMonth(record.get("month"));
        BigDecimal amount = parseAmount(record.get("amount"));

        short year = (short) yearMonth.getYear();
        byte month = (byte) yearMonth.getMonthValue();

        budgetRepository.findByUserIdAndCategoryIdAndYearAndMonth(user.getId(), category.getId(), year, month)
                .ifPresent(existing -> {
                    throw new BadRequestException(
                            "budget đã tồn tại cho user/category/tháng " + yearMonth);
                });

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setYear(year);
        budget.setMonth(month);
        budget.setAmount(amount);
        budgetRepository.save(budget);
    }

    private User resolveUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("userEmail không được để trống");
        }
        return userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new BadRequestException("không tìm thấy user với email: " + email));
    }

    private Category resolveCategoryByName(Long userId, String name, CategoryType type) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("category không được để trống");
        }
        String trimmed = name.trim();
        return categoryRepository.findByUserIdAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(userId, trimmed, type)
                .or(() -> categoryRepository.findByUserIsNullAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(trimmed, type))
                .orElseThrow(() -> new BadRequestException(
                        "không tìm thấy category \"" + trimmed + "\" (type " + type + ")"));
    }

    private String requireText(CSVRecord record, String column, String errorMessage) {
        String value = record.isSet(column) ? record.get(column) : null;
        if (value == null || value.isBlank()) {
            throw new BadRequestException(errorMessage);
        }
        return value;
    }

    private <E extends Enum<E>> E parseEnum(Class<E> type, String raw, String fieldName) {
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException(fieldName + " không được để trống");
        }
        try {
            return Enum.valueOf(type, raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(fieldName + " không hợp lệ: " + raw);
        }
    }

    private UserStatus parseActive(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException("active không được để trống");
        }
        String normalized = raw.trim().toLowerCase(Locale.ROOT);
        if ("true".equals(normalized)) {
            return UserStatus.ACTIVE;
        }
        if ("false".equals(normalized)) {
            return UserStatus.INACTIVE;
        }
        throw new BadRequestException("active không hợp lệ (chỉ nhận true/false): " + raw);
    }

    private BigDecimal parseAmount(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException("amount không được để trống");
        }
        BigDecimal amount;
        try {
            amount = new BigDecimal(raw.trim());
        } catch (NumberFormatException ex) {
            throw new BadRequestException("amount không hợp lệ: " + raw);
        }
        if (amount.signum() <= 0) {
            throw new BadRequestException("amount phải lớn hơn 0: " + raw);
        }
        return amount;
    }

    private LocalDate parseDate(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException("date không được để trống");
        }
        try {
            return LocalDate.parse(raw.trim());
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("date không hợp lệ (định dạng yyyy-MM-dd): " + raw);
        }
    }

    private YearMonth parseYearMonth(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException("month không được để trống");
        }
        try {
            return YearMonth.parse(raw.trim());
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("month không hợp lệ (định dạng yyyy-MM): " + raw);
        }
    }
}
