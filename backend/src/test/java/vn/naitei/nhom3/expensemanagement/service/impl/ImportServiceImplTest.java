package vn.naitei.nhom3.expensemanagement.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import vn.naitei.nhom3.expensemanagement.dto.importexport.ImportEntityType;
import vn.naitei.nhom3.expensemanagement.dto.importexport.ImportResultResponse;
import vn.naitei.nhom3.expensemanagement.entity.Budget;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.Expense;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.repository.BudgetRepository;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.IncomeRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ImportServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ExpenseRepository expenseRepository;
    @Mock
    private IncomeRepository incomeRepository;
    @Mock
    private BudgetRepository budgetRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ImportServiceImpl importService;

    private static MockMultipartFile csv(String content) {
        return new MockMultipartFile(
                "file", "test.csv", "text/csv", content.getBytes(StandardCharsets.UTF_8));
    }

    private static User user(long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        return user;
    }

    private static Category category(long id, CategoryType type) {
        Category category = new Category();
        category.setId(id);
        category.setType(type);
        return category;
    }

    @Test
    void importUserSavesValidRow() {
        String content = "name,email,password,role,active\nAlice,alice@test.com,secret,ADMIN,true\n";
        when(userRepository.existsByEmail("alice@test.com")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("hashed");

        ImportResultResponse result = importService.importCsv(ImportEntityType.USER, csv(content));

        assertEquals(1, result.getSuccessCount());
        assertEquals(0, result.getFailedCount());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void importUserFailsOnDuplicateEmail() {
        String content = "name,email,password,role,active\nAlice,alice@test.com,secret,ADMIN,true\n";
        when(userRepository.existsByEmail("alice@test.com")).thenReturn(true);

        ImportResultResponse result = importService.importCsv(ImportEntityType.USER, csv(content));

        assertEquals(0, result.getSuccessCount());
        assertEquals(1, result.getFailedCount());
        assertTrue(result.getErrors().get(0).contains("Dòng 2"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void importCategorySavesGlobalCategory() {
        String content = "name,description,type\nFood,Food expenses,EXPENSE\n";

        ImportResultResponse result = importService.importCsv(ImportEntityType.CATEGORY, csv(content));

        assertEquals(1, result.getSuccessCount());
        ArgumentCaptor<Category> captor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository).save(captor.capture());
        assertNull(captor.getValue().getUser());
    }

    @Test
    void importExpenseSavesValidRow() {
        User user = user(1L, "bob@test.com");
        Category category = category(10L, CategoryType.EXPENSE);
        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUserIdAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(1L, "Food", CategoryType.EXPENSE))
                .thenReturn(Optional.of(category));

        String content = "userEmail,title,category,amount,date,note\n"
                + "bob@test.com,Lunch,Food,50000,2026-01-01,\n";

        ImportResultResponse result = importService.importCsv(ImportEntityType.EXPENSE, csv(content));

        assertEquals(1, result.getSuccessCount());
        ArgumentCaptor<Expense> captor = ArgumentCaptor.forClass(Expense.class);
        verify(expenseRepository).save(captor.capture());
        assertEquals(new BigDecimal("50000"), captor.getValue().getAmount());
    }

    @Test
    void importExpenseFailsOnInvalidAmount() {
        User user = user(1L, "bob@test.com");
        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(user));

        String content = "userEmail,title,category,amount,date,note\n"
                + "bob@test.com,Lunch,Food,abc,2026-01-01,\n";

        ImportResultResponse result = importService.importCsv(ImportEntityType.EXPENSE, csv(content));

        assertEquals(0, result.getSuccessCount());
        assertEquals(1, result.getFailedCount());
        verify(expenseRepository, never()).save(any());
    }

    @Test
    void importExpenseFailsOnFutureDate() {
        User user = user(1L, "bob@test.com");
        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(user));

        String futureDate = LocalDate.now().plusDays(5).toString();
        String content = "userEmail,title,category,amount,date,note\n"
                + "bob@test.com,Lunch,Food," + "50000," + futureDate + ",\n";

        ImportResultResponse result = importService.importCsv(ImportEntityType.EXPENSE, csv(content));

        assertEquals(0, result.getSuccessCount());
        assertEquals(1, result.getFailedCount());
        assertTrue(result.getErrors().get(0).contains("tương lai"));
    }

    @Test
    void importIncomeMapsSourceColumnToTitleField() {
        User user = user(1L, "bob@test.com");
        Category category = category(20L, CategoryType.INCOME);
        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUserIdAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(1L, "Salary", CategoryType.INCOME))
                .thenReturn(Optional.of(category));

        String content = "userEmail,source,category,amount,date,note\n"
                + "bob@test.com,Monthly salary,Salary,5000000,2026-01-01,\n";

        ImportResultResponse result = importService.importCsv(ImportEntityType.INCOME, csv(content));

        assertEquals(1, result.getSuccessCount());
        verify(incomeRepository).save(any());
    }

    @Test
    void importBudgetSavesValidRowAndSplitsYearMonth() {
        User user = user(1L, "bob@test.com");
        Category category = category(10L, CategoryType.EXPENSE);
        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUserIdAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(1L, "Food", CategoryType.EXPENSE))
                .thenReturn(Optional.of(category));
        when(budgetRepository.findByUserIdAndCategoryIdAndYearAndMonth(1L, 10L, (short) 2026, (byte) 1))
                .thenReturn(Optional.empty());

        String content = "userEmail,category,month,amount\nbob@test.com,Food,2026-01,1000000\n";

        ImportResultResponse result = importService.importCsv(ImportEntityType.BUDGET, csv(content));

        assertEquals(1, result.getSuccessCount());
        ArgumentCaptor<Budget> captor = ArgumentCaptor.forClass(Budget.class);
        verify(budgetRepository).save(captor.capture());
        assertEquals((short) 2026, captor.getValue().getYear());
        assertEquals((byte) 1, captor.getValue().getMonth());
    }

    @Test
    void importBudgetFailsOnDuplicateMonth() {
        User user = user(1L, "bob@test.com");
        Category category = category(10L, CategoryType.EXPENSE);
        Budget existing = new Budget();
        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUserIdAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(1L, "Food", CategoryType.EXPENSE))
                .thenReturn(Optional.of(category));
        when(budgetRepository.findByUserIdAndCategoryIdAndYearAndMonth(1L, 10L, (short) 2026, (byte) 1))
                .thenReturn(Optional.of(existing));

        String content = "userEmail,category,month,amount\nbob@test.com,Food,2026-01,1000000\n";

        ImportResultResponse result = importService.importCsv(ImportEntityType.BUDGET, csv(content));

        assertEquals(0, result.getSuccessCount());
        assertEquals(1, result.getFailedCount());
        verify(budgetRepository, never()).save(any());
    }

    @Test
    void partialImportCommitsValidRowsAndReportsFailedRowsWithLineNumber() {
        String content = "name,description,type\n"
                + "Food,Food expenses,EXPENSE\n"
                + "Bad,Invalid type,FOO\n"
                + "Salary,Income source,INCOME\n";

        ImportResultResponse result = importService.importCsv(ImportEntityType.CATEGORY, csv(content));

        assertEquals(2, result.getSuccessCount());
        assertEquals(1, result.getFailedCount());
        assertEquals(1, result.getErrors().size());
        assertTrue(result.getErrors().get(0).contains("Dòng 3"));
        verify(categoryRepository, times(2)).save(any());
    }

    @Test
    void resolvesUserOwnedCategoryBeforeGlobalCategory() {
        User user = user(1L, "bob@test.com");
        Category ownCategory = category(10L, CategoryType.EXPENSE);
        Category globalCategory = category(20L, CategoryType.EXPENSE);
        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUserIdAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(1L, "Food", CategoryType.EXPENSE))
                .thenReturn(Optional.of(ownCategory));

        String content = "userEmail,title,category,amount,date,note\n"
                + "bob@test.com,Lunch,Food,50000,2026-01-01,\n";

        importService.importCsv(ImportEntityType.EXPENSE, csv(content));

        ArgumentCaptor<Expense> captor = ArgumentCaptor.forClass(Expense.class);
        verify(expenseRepository).save(captor.capture());
        assertEquals(10L, captor.getValue().getCategory().getId());
        verify(categoryRepository, never())
                .findByUserIsNullAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(anyString(), any());
    }

    @Test
    void fallsBackToGlobalCategoryWhenNoOwnCategoryMatches() {
        User user = user(1L, "bob@test.com");
        Category globalCategory = category(20L, CategoryType.EXPENSE);
        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUserIdAndNameIgnoreCaseAndTypeAndDeletedAtIsNull(1L, "Food", CategoryType.EXPENSE))
                .thenReturn(Optional.empty());
        when(categoryRepository.findByUserIsNullAndNameIgnoreCaseAndTypeAndDeletedAtIsNull("Food", CategoryType.EXPENSE))
                .thenReturn(Optional.of(globalCategory));

        String content = "userEmail,title,category,amount,date,note\n"
                + "bob@test.com,Lunch,Food,50000,2026-01-01,\n";

        importService.importCsv(ImportEntityType.EXPENSE, csv(content));

        ArgumentCaptor<Expense> captor = ArgumentCaptor.forClass(Expense.class);
        verify(expenseRepository).save(captor.capture());
        assertEquals(20L, captor.getValue().getCategory().getId());
    }

    @Test
    void throwsWhenRequiredColumnIsMissing() {
        String content = "userEmail,title,category,amount,note\nbob@test.com,Lunch,Food,50000,\n";

        assertThrows(BadRequestException.class,
                () -> importService.importCsv(ImportEntityType.EXPENSE, csv(content)));
    }

    @Test
    void throwsWhenFileIsEmpty() {
        MockMultipartFile empty = new MockMultipartFile("file", "test.csv", "text/csv", new byte[0]);

        assertThrows(BadRequestException.class,
                () -> importService.importCsv(ImportEntityType.CATEGORY, empty));
    }

    @Test
    void throwsWhenRowCountExceedsLimit() {
        StringBuilder builder = new StringBuilder("name,description,type\n");
        for (int i = 0; i < 5001; i++) {
            builder.append("Cat").append(i).append(",desc,EXPENSE\n");
        }

        assertThrows(BadRequestException.class,
                () -> importService.importCsv(ImportEntityType.CATEGORY, csv(builder.toString())));
    }
}
