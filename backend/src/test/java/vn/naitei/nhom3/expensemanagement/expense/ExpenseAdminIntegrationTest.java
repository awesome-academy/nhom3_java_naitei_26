package vn.naitei.nhom3.expensemanagement.expense;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for GET /api/admin/expenses (Task #99032 – A10).
 *
 * <p>Follows the same pattern as {@code ActivityLogAdminIntegrationTest}:
 * RANDOM_PORT, RestClient, manual @AfterEach cleanup, @ActiveProfiles("local").
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
class ExpenseAdminIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules(); // registers JavaTimeModule for LocalDate

    private RestClient restClient;
    private User admin;
    private User userA;
    private User userB;
    private Category expenseCategory;
    private Category anotherCategory;
    private String adminToken;
    private String userToken;

    private final List<Long> createdExpenseIds = new ArrayList<>();
    private final List<Long> createdUserIds    = new ArrayList<>();
    private final List<Long> createdCategoryIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder().baseUrl("http://localhost:" + port).build();

        admin = saveUser("admin-expense", Role.ADMIN);
        userA = saveUser("expense-user-a", Role.USER);
        userB = saveUser("expense-user-b", Role.USER);

        expenseCategory = saveCategory("Ăn uống", CategoryType.EXPENSE);
        anotherCategory = saveCategory("Di chuyển", CategoryType.EXPENSE);

        adminToken = jwtTokenProvider.generateToken(new UserPrincipal(admin));
        userToken  = jwtTokenProvider.generateToken(new UserPrincipal(userA));
    }

    @AfterEach
    void tearDown() {
        expenseRepository.deleteAllById(createdExpenseIds);
        categoryRepository.deleteAllById(createdCategoryIds);
        userRepository.deleteAllById(createdUserIds);
    }

    // ─── Happy-path tests ────────────────────────────────────────────────────

    @Test
    void shouldReturnAllExpensesAcrossAllUsers() {
        saveExpense(userA, expenseCategory, "Cơm trưa A",  new BigDecimal("50000"),  LocalDate.of(2026, 8, 14));
        saveExpense(userB, expenseCategory, "Cơm trưa B",  new BigDecimal("70000"),  LocalDate.of(2026, 8, 15));

        JsonNode response = get("/api/admin/expenses", adminToken);

        assertThat(response.at("/data/items").size()).isGreaterThanOrEqualTo(2);
        assertThat(response.at("/data/page").asInt()).isEqualTo(0);
        assertThat(response.at("/data/totalItems").asLong()).isGreaterThanOrEqualTo(2);
        assertThat(response.at("/status").asInt()).isEqualTo(200);
        assertThat(response.at("/message").asText()).isEqualTo("Thành công");
    }

    @Test
    void shouldIncludeUserFieldsInEachItem() {
        saveExpense(userA, expenseCategory, "Test user fields", new BigDecimal("100000"), LocalDate.of(2026, 8, 10));

        JsonNode response = get("/api/admin/expenses?userId=" + userA.getId(), adminToken);

        JsonNode items = response.at("/data/items");
        assertThat(items.size()).isGreaterThanOrEqualTo(1);

        JsonNode first = items.get(0);
        assertThat(first.get("userId").asLong()).isEqualTo(userA.getId());
        assertThat(first.get("userName").asText()).isEqualTo(userA.getName());
        assertThat(first.get("userEmail").asText()).isEqualTo(userA.getEmail());
        assertThat(first.get("title").asText()).isEqualTo("Test user fields");
        assertThat(first.get("amount").decimalValue()).isEqualByComparingTo(new BigDecimal("100000"));
        assertThat(first.get("categoryId").asLong()).isEqualTo(expenseCategory.getId());
        assertThat(first.get("categoryName").asText()).isEqualTo(expenseCategory.getName());
    }

    @Test
    void shouldFilterByUserId() {
        saveExpense(userA, expenseCategory, "Expense A", new BigDecimal("50000"), LocalDate.of(2026, 8, 14));
        saveExpense(userB, expenseCategory, "Expense B", new BigDecimal("80000"), LocalDate.of(2026, 8, 14));

        JsonNode response = get("/api/admin/expenses?userId=" + userA.getId(), adminToken);

        JsonNode items = response.at("/data/items");
        for (int i = 0; i < items.size(); i++) {
            assertThat(items.get(i).get("userId").asLong()).isEqualTo(userA.getId());
        }
    }

    @Test
    void shouldFilterBySearchKeywordCaseInsensitive() {
        saveExpense(userA, expenseCategory, "Taxi đi làm",   new BigDecimal("30000"), LocalDate.of(2026, 8, 1));
        saveExpense(userA, expenseCategory, "Cơm bụi trưa",  new BigDecimal("40000"), LocalDate.of(2026, 8, 2));

        JsonNode response = get("/api/admin/expenses?userId=" + userA.getId() + "&search=TAXI", adminToken);

        JsonNode items = response.at("/data/items");
        assertThat(items.size()).isGreaterThanOrEqualTo(1);
        for (int i = 0; i < items.size(); i++) {
            assertThat(items.get(i).get("title").asText().toLowerCase()).contains("taxi");
        }
    }

    @Test
    void shouldFilterByDateRange() {
        saveExpense(userA, expenseCategory, "Early",  new BigDecimal("10000"), LocalDate.of(2026, 1, 5));
        saveExpense(userA, expenseCategory, "Middle", new BigDecimal("20000"), LocalDate.of(2026, 6, 15));
        saveExpense(userA, expenseCategory, "Late",   new BigDecimal("30000"), LocalDate.of(2026, 12, 25));

        JsonNode response = get(
                "/api/admin/expenses?userId=" + userA.getId()
                        + "&fromDate=2026-06-01&toDate=2026-06-30",
                adminToken);

        JsonNode items = response.at("/data/items");
        assertThat(items.size()).isEqualTo(1);
        assertThat(items.get(0).get("title").asText()).isEqualTo("Middle");
    }

    @Test
    void shouldSupportPagination() {
        for (int i = 1; i <= 5; i++) {
            saveExpense(userA, expenseCategory,
                    "Paginated expense " + i,
                    BigDecimal.valueOf(i * 10000L),
                    LocalDate.of(2026, 8, i));
        }

        JsonNode page0 = get("/api/admin/expenses?userId=" + userA.getId() + "&page=0&size=2", adminToken);
        assertThat(page0.at("/data/items").size()).isEqualTo(2);
        assertThat(page0.at("/data/page").asInt()).isEqualTo(0);
        assertThat(page0.at("/data/size").asInt()).isEqualTo(2);
        assertThat(page0.at("/data/totalItems").asLong()).isGreaterThanOrEqualTo(5);

        JsonNode page1 = get("/api/admin/expenses?userId=" + userA.getId() + "&page=1&size=2", adminToken);
        assertThat(page1.at("/data/items").size()).isEqualTo(2);
        assertThat(page1.at("/data/page").asInt()).isEqualTo(1);
    }

    @Test
    void shouldDefaultSortByDateDescending() {
        saveExpense(userA, expenseCategory, "Older",  new BigDecimal("10000"), LocalDate.of(2026, 7, 1));
        saveExpense(userA, expenseCategory, "Newer",  new BigDecimal("20000"), LocalDate.of(2026, 8, 1));

        JsonNode response = get("/api/admin/expenses?userId=" + userA.getId(), adminToken);

        JsonNode items = response.at("/data/items");
        // Default sort is date desc — "Newer" (Aug) should come before "Older" (Jul)
        assertThat(items.get(0).get("title").asText()).isEqualTo("Newer");
    }

    @Test
    void shouldSortByDateInBothDirections() {
        saveExpense(userA, expenseCategory, "Older", new BigDecimal("10000"), LocalDate.of(2026, 7, 1));
        saveExpense(userA, expenseCategory, "Newer", new BigDecimal("20000"), LocalDate.of(2026, 8, 1));

        JsonNode ascending = get("/api/admin/expenses?userId=" + userA.getId() + "&sort=date,asc", adminToken);
        JsonNode descending = get("/api/admin/expenses?userId=" + userA.getId() + "&sort=date,desc", adminToken);

        assertThat(ascending.at("/data/items").get(0).get("title").asText()).isEqualTo("Older");
        assertThat(descending.at("/data/items").get(0).get("title").asText()).isEqualTo("Newer");
    }

    // ─── Authorization tests ─────────────────────────────────────────────────

    @Test
    void shouldForbidRegularUserFromAccessingAdminEndpoint() {
        assertThatThrownBy(() -> restClient.get()
                .uri("/api/admin/expenses")
                .header(HttpHeaders.AUTHORIZATION, bearer(userToken))
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.Forbidden.class);
    }

    @Test
    void shouldRejectRequestWithoutToken() {
        assertThatThrownBy(() -> restClient.get()
                .uri("/api/admin/expenses")
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.class);
    }

    // ─── Validation tests ────────────────────────────────────────────────────

    @Test
    void shouldRejectInvalidPaginationParameters() {
        assertBadRequest("/api/admin/expenses?page=-1");
        assertBadRequest("/api/admin/expenses?size=0");
        assertBadRequest("/api/admin/expenses?size=101");
        assertBadRequest("/api/admin/expenses?sort=user,password");
        assertBadRequest("/api/admin/expenses?sort=date,sideways");
        assertBadRequest("/api/admin/expenses?page=not-a-number");
        assertBadRequest("/api/admin/expenses?minAmount=not-a-number");
        assertBadRequest("/api/admin/expenses?fromDate=2026-99-99");
    }

    @Test
    void shouldRejectInvalidDateRange() {
        assertBadRequest("/api/admin/expenses?fromDate=2026-08-20&toDate=2026-08-01");
    }

    @Test
    void shouldFilterByCategory() {
        saveExpense(userA, expenseCategory, "Lunch", new BigDecimal("50000"), LocalDate.of(2026, 8, 14));
        saveExpense(userA, anotherCategory, "Transport", new BigDecimal("30000"), LocalDate.of(2026, 8, 14));

        JsonNode response = get("/api/admin/expenses?userId=" + userA.getId()
                + "&categoryId=" + expenseCategory.getId(), adminToken);

        JsonNode items = response.at("/data/items");
        for (int i = 0; i < items.size(); i++) {
            assertThat(items.get(i).get("categoryId").asLong()).isEqualTo(expenseCategory.getId());
        }
    }

    @Test
    void shouldFilterByAmountRange() {
        saveExpense(userA, expenseCategory, "Cheap", new BigDecimal("10000"), LocalDate.of(2026, 8, 1));
        saveExpense(userA, expenseCategory, "Medium", new BigDecimal("50000"), LocalDate.of(2026, 8, 5));
        saveExpense(userA, expenseCategory, "Expensive", new BigDecimal("100000"), LocalDate.of(2026, 8, 10));

        JsonNode response = get("/api/admin/expenses?userId=" + userA.getId()
                + "&minAmount=30000&maxAmount=60000", adminToken);

        JsonNode items = response.at("/data/items");
        assertThat(items.size()).isGreaterThanOrEqualTo(1);
        for (int i = 0; i < items.size(); i++) {
            BigDecimal amount = items.get(i).get("amount").decimalValue();
            assertThat(amount).isGreaterThanOrEqualTo(new BigDecimal("30000"));
            assertThat(amount).isLessThanOrEqualTo(new BigDecimal("60000"));
        }
    }

    @Test
    void shouldSortByAmount() {
        saveExpense(userA, expenseCategory, "A-100k", new BigDecimal("100000"), LocalDate.of(2026, 8, 1));
        saveExpense(userA, expenseCategory, "B-50k", new BigDecimal("50000"), LocalDate.of(2026, 8, 2));
        saveExpense(userA, expenseCategory, "C-75k", new BigDecimal("75000"), LocalDate.of(2026, 8, 3));

        JsonNode ascending = get("/api/admin/expenses?userId=" + userA.getId() + "&sort=amount,asc", adminToken);
        JsonNode descending = get("/api/admin/expenses?userId=" + userA.getId() + "&sort=amount,desc", adminToken);
        JsonNode items = ascending.at("/data/items");

        assertThat(items.get(0).get("amount").decimalValue()).isEqualByComparingTo(new BigDecimal("50000"));
        assertThat(descending.at("/data/items").get(0).get("amount").decimalValue())
            .isEqualByComparingTo(new BigDecimal("100000"));
    }

    @Test
    void shouldSortByTitle() {
        saveExpense(userA, expenseCategory, "Zebra", new BigDecimal("50000"), LocalDate.of(2026, 8, 1));
        saveExpense(userA, expenseCategory, "Apple", new BigDecimal("50000"), LocalDate.of(2026, 8, 2));
        saveExpense(userA, expenseCategory, "Mango", new BigDecimal("50000"), LocalDate.of(2026, 8, 3));

        JsonNode ascending = get("/api/admin/expenses?userId=" + userA.getId() + "&sort=title,asc", adminToken);
        JsonNode descending = get("/api/admin/expenses?userId=" + userA.getId() + "&sort=title,desc", adminToken);
        JsonNode items = ascending.at("/data/items");

        assertThat(items.get(0).get("title").asText()).isEqualTo("Apple");
        assertThat(descending.at("/data/items").get(0).get("title").asText()).isEqualTo("Zebra");
    }

    @Test
    void shouldCombineFiltersWithAnd() {
        saveExpense(userA, expenseCategory, "Lunch1", new BigDecimal("50000"), LocalDate.of(2026, 8, 10));
        saveExpense(userA, expenseCategory, "Lunch2", new BigDecimal("60000"), LocalDate.of(2026, 8, 15));
        saveExpense(userA, anotherCategory, "Transport", new BigDecimal("50000"), LocalDate.of(2026, 8, 15));
        saveExpense(userB, expenseCategory, "Dinner", new BigDecimal("50000"), LocalDate.of(2026, 8, 15));

        // Filter: userId=userA AND categoryId=expenseCategory AND dateRange=[8/12, 8/20] AND amountRange=[45k, 65k]
        JsonNode response = get("/api/admin/expenses?userId=" + userA.getId()
                + "&categoryId=" + expenseCategory.getId()
                + "&fromDate=2026-08-12&toDate=2026-08-20"
                + "&minAmount=45000&maxAmount=65000", adminToken);

        JsonNode items = response.at("/data/items");
        // Should only return Lunch2
        assertThat(items.size()).isGreaterThanOrEqualTo(1);
        for (int i = 0; i < items.size(); i++) {
            assertThat(items.get(i).get("userId").asLong()).isEqualTo(userA.getId());
            assertThat(items.get(i).get("categoryId").asLong()).isEqualTo(expenseCategory.getId());
        }
    }

    @Test
    void shouldRejectInvalidAmountRange() {
        assertBadRequest("/api/admin/expenses?minAmount=60000&maxAmount=30000");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private JsonNode get(String uri, String token) {
        String response = restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .retrieve()
                .body(String.class);
        try {
            return objectMapper.readTree(response);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to parse response: " + response, ex);
        }
    }

    private void assertBadRequest(String uri) {
        assertThatThrownBy(() -> restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.BadRequest.class);
    }

    private User saveUser(String prefix, Role role) {
        User user = new User();
        user.setName(prefix);
        user.setEmail(prefix + "-" + UUID.randomUUID() + "@test.com");
        user.setPassword("test-password");
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.saveAndFlush(user);
        createdUserIds.add(saved.getId());
        return saved;
    }

    private Category saveCategory(String name, CategoryType type) {
        Category category = new Category();
        category.setName(name);
        category.setType(type);
        Category saved = categoryRepository.saveAndFlush(category);
        createdCategoryIds.add(saved.getId());
        return saved;
    }

    private Expense saveExpense(User user, Category category, String title,
                                BigDecimal amount, LocalDate date) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setCategory(category);
        expense.setTitle(title);
        expense.setAmount(amount);
        expense.setExpenseDate(date);
        Expense saved = expenseRepository.saveAndFlush(expense);
        createdExpenseIds.add(saved.getId());
        return saved;
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
