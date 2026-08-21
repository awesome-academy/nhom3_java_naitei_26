package vn.naitei.nhom3.expensemanagement.expense;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.Expense;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.security.JwtTokenProvider;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class ExpenseFilterPaginationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User userA;
    private Category foodCategory;
    private Category travelCategory;
    private String tokenA;

    @BeforeEach
    void setUp() {
        userA = saveUser("filter-user-a");
        User userB = saveUser("filter-user-b");
        foodCategory = saveCategory("Ăn uống");
        travelCategory = saveCategory("Đi lại");
        tokenA = jwtTokenProvider.generateToken(new UserPrincipal(userA));

        saveExpense(userA, foodCategory, "Cơm sáng", "10000", "2026-08-10");
        saveExpense(userA, foodCategory, "Cơm Trưa", "50000", "2026-08-14");
        saveExpense(userA, travelCategory, "Taxi", "100000", "2026-08-15");
        saveExpense(userA, travelCategory, "Vé xe", "200000", "2026-08-20");
        saveExpense(userA, foodCategory, "Cơm tối", "80000", "2026-08-15");
        saveExpense(userB, foodCategory, "Expense user khác", "50000", "2026-08-21");
    }

    @Test
    void shouldReturnDefaultPageSortedByDateDescendingAndOnlyCurrentUser() throws Exception {
        mockMvc.perform(get("/api/expenses").header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Thành công"))
                .andExpect(jsonPath("$.data.items.length()").value(5))
                .andExpect(jsonPath("$.data.items[0].title").value("Vé xe"))
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(10))
                .andExpect(jsonPath("$.data.totalItems").value(5))
                .andExpect(jsonPath("$.data.totalPages").value(1));
    }

    @Test
    void shouldPaginateFromZeroAndReturnEmptyPageBeyondData() throws Exception {
        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param("page", "1")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(2))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.size").value(2))
                .andExpect(jsonPath("$.data.totalItems").value(5))
                .andExpect(jsonPath("$.data.totalPages").value(3));

        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param("page", "9")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isEmpty())
                .andExpect(jsonPath("$.data.totalItems").value(5));
    }

    @Test
    void shouldSearchTitleCaseInsensitivelyAndTrimKeyword() throws Exception {
        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param("search", "  CƠM  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(3))
                .andExpect(jsonPath("$.data.totalItems").value(3));
    }

    @Test
    void shouldFilterByEachOptionalConditionAndIncludeBoundaries() throws Exception {
        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param("categoryId", travelCategory.getId().toString())
                        .param("fromDate", "2026-08-15")
                        .param("toDate", "2026-08-20")
                        .param("minAmount", "100000")
                        .param("maxAmount", "200000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(2))
                .andExpect(jsonPath("$.data.totalItems").value(2));
    }

    @Test
    void shouldCombineFiltersWithAnd() throws Exception {
        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param("search", "cơm")
                        .param("categoryId", foodCategory.getId().toString())
                        .param("fromDate", "2026-08-14")
                        .param("maxAmount", "80000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(2))
                .andExpect(jsonPath("$.data.totalItems").value(2));
    }

    @Test
    void shouldSortByWhitelistedFieldAndStableId() throws Exception {
        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param("sort", "amount,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].amount").value(10000))
                .andExpect(jsonPath("$.data.items[4].amount").value(200000));

        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param("sort", "title,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(5));
    }

    @Test
    void shouldReturnEmptyPageForUnknownCategory() throws Exception {
        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param("categoryId", "999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isEmpty())
                .andExpect(jsonPath("$.data.totalItems").value(0));
    }

    @Test
    void shouldRejectInvalidPaginationSortAndRanges() throws Exception {
        assertBadRequest("page", "-1");
        assertBadRequest("size", "0");
        assertBadRequest("size", "101");
        assertBadRequest("sort", "user,password");
        assertBadRequest("fromDate", "not-a-date");

        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param("fromDate", "2026-08-20")
                        .param("toDate", "2026-08-10"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param("minAmount", "200")
                        .param("maxAmount", "100"))
                .andExpect(status().isBadRequest());
    }

    private void assertBadRequest(String parameter, String value) throws Exception {
        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", bearerToken())
                        .param(parameter, value))
                .andExpect(status().isBadRequest());
    }

    private User saveUser(String prefix) {
        User user = new User();
        user.setName(prefix);
        user.setEmail(prefix + "-" + UUID.randomUUID() + "@test.com");
        user.setPassword("test-password");
        user.setRole(Role.USER);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.saveAndFlush(user);
    }

    private Category saveCategory(String name) {
        Category category = new Category();
        category.setName(name);
        category.setType(CategoryType.EXPENSE);
        return categoryRepository.saveAndFlush(category);
    }

    private void saveExpense(
            User user, Category category, String title, String amount, String expenseDate) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setCategory(category);
        expense.setTitle(title);
        expense.setAmount(new BigDecimal(amount));
        expense.setExpenseDate(LocalDate.parse(expenseDate));
        expenseRepository.saveAndFlush(expense);
    }

    private String bearerToken() {
        return "Bearer " + tokenA;
    }
}
