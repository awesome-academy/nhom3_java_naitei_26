package vn.naitei.nhom3.expensemanagement.expense;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class ExpenseApiIntegrationTest {

    private static final String PASSWORD = "test-password";

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
    private User userB;
    private Category expenseCategory;
    private Category incomeCategory;
    private String tokenA;
    private String tokenB;

    @BeforeEach
    void setUp() {
        userA = saveUser("user-a");
        userB = saveUser("user-b");
        expenseCategory = saveCategory("Ăn uống", CategoryType.EXPENSE);
        incomeCategory = saveCategory("Lương", CategoryType.INCOME);
        tokenA = jwtTokenProvider.generateToken(new UserPrincipal(userA));
        tokenB = jwtTokenProvider.generateToken(new UserPrincipal(userB));
    }

    @Test
    void shouldCreateReadUpdateAndDeleteExpense() throws Exception {
        String response = mockMvc.perform(post("/api/expenses")
                        .header("Authorization", bearer(tokenA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("Cơm trưa", "50000", expenseCategory.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Tạo chi tiêu thành công"))
                .andExpect(jsonPath("$.data.date").value("2026-08-14"))
                .andExpect(jsonPath("$.data.categoryName").value("Ăn uống"))
                .andExpect(jsonPath("$.data.categoryIcon").value("restaurant"))
                .andReturn().getResponse().getContentAsString();
        Long expenseId = extractId(response);

        mockMvc.perform(get("/api/expenses/{id}", expenseId)
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Cơm trưa"))
                .andExpect(jsonPath("$.data.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.data.categoryName").value("Ăn uống"))
                .andExpect(jsonPath("$.data.categoryIcon").value("restaurant"));

        mockMvc.perform(put("/api/expenses/{id}", expenseId)
                        .header("Authorization", bearer(tokenA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("Cơm tối", "80000", expenseCategory.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Cập nhật thành công"))
                .andExpect(jsonPath("$.data.title").value("Cơm tối"))
                .andExpect(jsonPath("$.data.amount").value(80000));

        mockMvc.perform(delete("/api/expenses/{id}", expenseId)
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Xoá thành công"));

        mockMvc.perform(get("/api/expenses/{id}", expenseId)
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectInvalidRequestFields() throws Exception {
        assertBadRequest(request("", "0", "2099-01-01", expenseCategory.getId()), "title");
        assertBadRequest(request("   ", "-100", null, null), "title");
    }

    @Test
    void shouldRejectIncomeAndUnknownCategories() throws Exception {
        assertBadCategory(incomeCategory.getId());
        assertBadCategory(999999L);
    }

    @Test
    @Disabled("Chờ Auth #98950 cấu hình AuthenticationEntryPoint trả 401 thay vì 403")
    void shouldRejectRequestWithoutToken() throws Exception {
        mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("Cơm trưa", "50000", expenseCategory.getId())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Disabled("Chờ Auth #98950 cấu hình AuthenticationEntryPoint trả 401 thay vì 403")
    void shouldRejectInvalidToken() throws Exception {
        mockMvc.perform(post("/api/expenses")
                        .header("Authorization", "Bearer invalid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("Cơm trưa", "50000", expenseCategory.getId())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldHideExpenseFromOtherUser() throws Exception {
        Expense expense = saveExpense(userA);

        mockMvc.perform(get("/api/expenses/{id}", expense.getId())
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/expenses/{id}", expense.getId())
                        .header("Authorization", bearer(tokenB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("Không được sửa", "1", expenseCategory.getId())))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/expenses/{id}", expense.getId())
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnBadRequestForNonNumericId() throws Exception {
        mockMvc.perform(get("/api/expenses/abc")
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isBadRequest());
    }

    private void assertBadRequest(String content, String field) throws Exception {
        mockMvc.perform(post("/api/expenses")
                        .header("Authorization", bearer(tokenA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(content))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data." + field).exists());
    }

    private void assertBadCategory(Long categoryId) throws Exception {
        mockMvc.perform(post("/api/expenses")
                        .header("Authorization", bearer(tokenA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("Khoản chi", "100", categoryId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Danh mục khoản chi không hợp lệ"));
    }

    private User saveUser(String prefix) {
        User user = new User();
        user.setName(prefix);
        user.setEmail(prefix + "-" + UUID.randomUUID() + "@test.com");
        user.setPassword(PASSWORD);
        user.setRole(Role.USER);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.saveAndFlush(user);
    }

    private Category saveCategory(String name, CategoryType type) {
        Category category = new Category();
        category.setName(name);
        category.setIcon(type == CategoryType.EXPENSE ? "restaurant" : null);
        category.setType(type);
        return categoryRepository.saveAndFlush(category);
    }

    private Expense saveExpense(User owner) {
        Expense expense = new Expense();
        expense.setUser(owner);
        expense.setCategory(expenseCategory);
        expense.setTitle("Expense của A");
        expense.setAmount(BigDecimal.valueOf(50000));
        expense.setExpenseDate(LocalDate.of(2026, 8, 14));
        return expenseRepository.saveAndFlush(expense);
    }

    private String validRequest(String title, String amount, Long categoryId) {
        return request(title, amount, "2026-08-14", categoryId);
    }

    private String request(String title, String amount, String date, Long categoryId) {
        String dateField = date == null ? "" : ",\"date\":\"" + date + "\"";
        String categoryField = categoryId == null ? "" : ",\"categoryId\":" + categoryId;
        return "{\"title\":\"" + title + "\",\"amount\":" + amount
                + dateField + categoryField + ",\"note\":\"ok\"}";
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private Long extractId(String response) {
        String marker = "\"id\":";
        int start = response.indexOf(marker) + marker.length();
        int end = response.indexOf(',', start);
        return Long.valueOf(response.substring(start, end));
    }
}
