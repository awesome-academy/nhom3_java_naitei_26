package vn.naitei.nhom3.expensemanagement.aop;

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
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestClient;
import vn.naitei.nhom3.expensemanagement.entity.ActivityLog;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.Expense;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;
import vn.naitei.nhom3.expensemanagement.repository.ActivityLogRepository;
import vn.naitei.nhom3.expensemanagement.repository.BudgetTemplateDetailRepository;
import vn.naitei.nhom3.expensemanagement.repository.BudgetTemplateRepository;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.security.JwtTokenProvider;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
class ActivityLogAspectIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private BudgetTemplateRepository budgetTemplateRepository;

    @Autowired
    private BudgetTemplateDetailRepository budgetTemplateDetailRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private RestClient restClient;
    private User user;
    private User admin;
    private Category categoryA;
    private Category categoryB;
    private String userToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder().baseUrl("http://localhost:" + port).build();
        user = saveUser("aop-user", Role.USER);
        admin = saveUser("aop-admin", Role.ADMIN);
        categoryA = saveCategory("Ăn uống");
        categoryB = saveCategory("Di chuyển");
        userToken = jwtTokenProvider.generateToken(new UserPrincipal(user));
        adminToken = jwtTokenProvider.generateToken(new UserPrincipal(admin));
    }

    @AfterEach
    void tearDown() {
        activityLogRepository.deleteAll(activityLogRepository.findByUserId(user.getId()));
        activityLogRepository.deleteAll(activityLogRepository.findByUserId(admin.getId()));
        for (Expense expense : expenseRepository.findByUserId(user.getId())) {
            expenseRepository.delete(expense);
        }
        for (var template : budgetTemplateRepository.findAll()) {
            budgetTemplateDetailRepository.deleteAll(budgetTemplateDetailRepository.findByTemplateId(template.getId()));
            budgetTemplateRepository.delete(template);
        }
        categoryRepository.delete(categoryA);
        categoryRepository.delete(categoryB);
        userRepository.delete(user);
        userRepository.delete(admin);
    }

    @Test
    void shouldLogActivityWhenExpenseIsCreated() {
        JsonNode created = createExpense();
        long expenseId = created.at("/data/id").asLong();

        List<ActivityLog> logs = activityLogRepository.findByUserId(user.getId());
        ActivityLog log = logs.stream()
                .filter(l -> "CREATE_EXPENSE".equals(l.getAction()))
                .findFirst().orElseThrow();

        assertThat(log.getEntityId()).isEqualTo(expenseId);
        assertThat(log.getActorName()).isEqualTo(user.getName());
        assertThat(log.getActorEmail()).isEqualTo(user.getEmail());
        assertThat(log.getDescription()).contains("Cơm trưa");
    }

    @Test
    void shouldLogActivityWhenExpenseIsDeleted() {
        JsonNode created = createExpense();
        long expenseId = created.at("/data/id").asLong();

        restClient.delete()
                .uri("/api/expenses/{id}", expenseId)
                .header(HttpHeaders.AUTHORIZATION, bearer(userToken))
                .retrieve()
                .toBodilessEntity();

        List<ActivityLog> logs = activityLogRepository.findByUserId(user.getId());
        ActivityLog log = logs.stream()
                .filter(l -> "DELETE_EXPENSE".equals(l.getAction()))
                .findFirst().orElseThrow();

        assertThat(log.getEntityId()).isEqualTo(expenseId);
    }

    @Test
    void shouldLogExactlyOnceWhenBudgetTemplateUpdateCascadesDetailRows() {
        JsonNode created = createBudgetTemplate(List.of(categoryA.getId(), categoryB.getId()));
        long templateId = created.at("/data/id").asLong();

        long logCountBefore = activityLogRepository.findByUserId(admin.getId()).size();

        // Đổi hẳn danh sách detail (bỏ categoryB, thêm lại categoryA với số tiền khác) để
        // buộc BudgetTemplateAdminController.update() chạy loop xoá + tạo lại detail rows.
        String body = """
                {"name":"Mẫu đã sửa","month":9,"warningPercentage":80,
                 "details":[{"categoryId":%d,"amount":500000}]}
                """.formatted(categoryA.getId());
        String updateResponse = restClient.put()
                .uri("/api/admin/budget-templates/{id}", templateId)
                .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);
        JsonNode updated = parse(updateResponse);

        long logCountAfter = activityLogRepository.findByUserId(admin.getId()).size();

        assertThat(updated.at("/data/name").asText()).isEqualTo("Mẫu đã sửa");
        assertThat(updated.at("/data/details").size()).isEqualTo(1);
        assertThat(logCountAfter - logCountBefore).isEqualTo(1);

        ActivityLog log = activityLogRepository.findByUserId(admin.getId()).stream()
                .filter(l -> "UPDATE_BUDGET_TEMPLATE".equals(l.getAction()))
                .findFirst().orElseThrow();
        assertThat(log.getEntityId()).isEqualTo(templateId);
    }

    private JsonNode createExpense() {
        String body = """
                {"title":"Cơm trưa","amount":50000,"date":"2026-08-14","categoryId":%d,"note":"ok"}
                """.formatted(categoryA.getId());
        String response = restClient.post()
                .uri("/api/expenses")
                .header(HttpHeaders.AUTHORIZATION, bearer(userToken))
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);
        return parse(response);
    }

    private JsonNode createBudgetTemplate(List<Long> categoryIds) {
        String details = categoryIds.stream()
                .map(id -> "{\"categoryId\":%d,\"amount\":100000}".formatted(id))
                .reduce((a, b) -> a + "," + b)
                .orElse("");
        String body = """
                {"name":"Mẫu ngân sách","month":8,"warningPercentage":80,"details":[%s]}
                """.formatted(details);
        String response = restClient.post()
                .uri("/api/admin/budget-templates")
                .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);
        return parse(response);
    }

    private JsonNode parse(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    private User saveUser(String prefix, Role role) {
        User newUser = new User();
        newUser.setName(prefix);
        newUser.setEmail(prefix + "-" + UUID.randomUUID() + "@test.com");
        newUser.setPassword("test-password");
        newUser.setRole(role);
        newUser.setStatus(UserStatus.ACTIVE);
        return userRepository.saveAndFlush(newUser);
    }

    private Category saveCategory(String name) {
        Category category = new Category();
        category.setName(name);
        category.setType(CategoryType.EXPENSE);
        return categoryRepository.saveAndFlush(category);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
