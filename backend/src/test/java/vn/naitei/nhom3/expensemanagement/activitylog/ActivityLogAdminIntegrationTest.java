package vn.naitei.nhom3.expensemanagement.activitylog;

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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import vn.naitei.nhom3.expensemanagement.entity.ActivityLog;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;
import vn.naitei.nhom3.expensemanagement.repository.ActivityLogRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.security.JwtTokenProvider;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
class ActivityLogAdminIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private RestClient restClient;
    private User admin;
    private User targetUser;
    private User otherUser;
    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder().baseUrl("http://localhost:" + port).build();
        admin = saveUser("activitylog-admin", Role.ADMIN);
        targetUser = saveUser("activitylog-target", Role.USER);
        otherUser = saveUser("activitylog-other", Role.USER);
        adminToken = jwtTokenProvider.generateToken(new UserPrincipal(admin));
        userToken = jwtTokenProvider.generateToken(new UserPrincipal(targetUser));
    }

    @AfterEach
    void tearDown() {
        activityLogRepository.deleteAll(activityLogRepository.findByUserId(targetUser.getId()));
        activityLogRepository.deleteAll(activityLogRepository.findByUserId(otherUser.getId()));
        userRepository.deleteById(admin.getId());
        userRepository.deleteById(targetUser.getId());
        if (userRepository.existsById(otherUser.getId())) {
            userRepository.deleteById(otherUser.getId());
        }
    }

    @Test
    void shouldReturnPagedActivityLogsForAdmin() {
        seedLog(targetUser, "LOGIN", "Đăng nhập hệ thống", LocalDateTime.now());
        seedLog(otherUser, "LOGIN", "Đăng nhập hệ thống", LocalDateTime.now());

        JsonNode response = get("/api/admin/activity-logs", adminToken);

        assertThat(response.at("/data/items").size()).isGreaterThanOrEqualTo(2);
        assertThat(response.at("/data/page").asInt()).isEqualTo(0);
        assertThat(response.at("/data/totalItems").asLong()).isGreaterThanOrEqualTo(2);
    }

    @Test
    void shouldFilterActivityLogsByUserId() {
        seedLog(targetUser, "CREATE_EXPENSE", "Tạo chi tiêu", LocalDateTime.now());
        seedLog(otherUser, "CREATE_EXPENSE", "Tạo chi tiêu", LocalDateTime.now());

        JsonNode response = get("/api/admin/activity-logs?userId=" + targetUser.getId(), adminToken);

        JsonNode items = response.at("/data/items");
        assertThat(items.size()).isEqualTo(1);
        assertThat(items.get(0).get("userId").asLong()).isEqualTo(targetUser.getId());
    }

    @Test
    void shouldFilterActivityLogsByActionAndDateRange() {
        seedLog(targetUser, "LOGIN", "Đăng nhập", LocalDateTime.of(2026, 1, 1, 10, 0));
        seedLog(targetUser, "LOGOUT", "Đăng xuất", LocalDateTime.of(2026, 6, 1, 10, 0));

        JsonNode byAction = get("/api/admin/activity-logs?userId=" + targetUser.getId() + "&action=LOGIN", adminToken);
        assertThat(byAction.at("/data/items").size()).isEqualTo(1);
        assertThat(byAction.at("/data/items/0/action").asText()).isEqualTo("LOGIN");

        JsonNode byDate = get("/api/admin/activity-logs?userId=" + targetUser.getId()
                + "&fromDate=2026-05-01&toDate=2026-06-30", adminToken);
        assertThat(byDate.at("/data/items").size()).isEqualTo(1);
        assertThat(byDate.at("/data/items/0/action").asText()).isEqualTo("LOGOUT");
    }

    @Test
    void shouldForbidNonAdminFromListingOrDeleting() {
        ActivityLog log = seedLog(targetUser, "LOGIN", "Đăng nhập", LocalDateTime.now());

        assertThatThrownBy(() -> restClient.get()
                .uri("/api/admin/activity-logs")
                .header(HttpHeaders.AUTHORIZATION, bearer(userToken))
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.Forbidden.class);

        assertThatThrownBy(() -> restClient.delete()
                .uri("/api/admin/activity-logs/{id}", log.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(userToken))
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.Forbidden.class);
    }

    @Test
    void shouldDeleteActivityLogAsAdmin() {
        ActivityLog log = seedLog(targetUser, "LOGIN", "Đăng nhập", LocalDateTime.now());

        restClient.delete()
                .uri("/api/admin/activity-logs/{id}", log.getId())
                .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                .retrieve()
                .toBodilessEntity();

        assertThat(activityLogRepository.findById(log.getId())).isEmpty();
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingActivityLog() {
        assertThatThrownBy(() -> restClient.delete()
                .uri("/api/admin/activity-logs/{id}", 999_999_999L)
                .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.NotFound.class);
    }

    /**
     * This test only passes on a schema created fresh from the current entity mapping
     * (ON DELETE SET NULL on activity_logs.user_id). If the local activity_logs table
     * was created before this change, ddl-auto=update may not have rewritten the FK's
     * referential action, and hard-deleting the user will fail with a constraint
     * violation instead of nulling the column — drop the table locally and restart
     * the app once to pick up the corrected schema.
     */
    @Test
    void shouldKeepActivityLogWithNullUserAfterHardDeletingUser() {
        User disposableUser = saveUser("activitylog-disposable", Role.USER);
        ActivityLog log = seedLog(disposableUser, "LOGIN", "Đăng nhập", LocalDateTime.now());

        userRepository.delete(disposableUser);

        ActivityLog reloaded = activityLogRepository.findById(log.getId()).orElseThrow();
        assertThat(reloaded.getUser()).isNull();
        assertThat(reloaded.getActorName()).isEqualTo(disposableUser.getName());
        assertThat(reloaded.getActorEmail()).isEqualTo(disposableUser.getEmail());

        activityLogRepository.delete(reloaded);
    }

    private JsonNode get(String uri, String token) {
        String response = restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .retrieve()
                .body(String.class);
        try {
            return objectMapper.readTree(response);
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    private ActivityLog seedLog(User user, String action, String description, LocalDateTime createdAt) {
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUser(user);
        activityLog.setActorName(user.getName());
        activityLog.setActorEmail(user.getEmail());
        activityLog.setAction(action);
        activityLog.setEntityType("USER");
        activityLog.setEntityId(user.getId());
        activityLog.setDescription(description);
        ActivityLog saved = activityLogRepository.saveAndFlush(activityLog);
        // BaseEntity maps created_at as updatable=false, so JPA silently ignores any
        // change to it after insert — backdate directly via JDBC for test purposes.
        jdbcTemplate.update("UPDATE activity_logs SET created_at = ? WHERE id = ?", createdAt, saved.getId());
        saved.setCreatedAt(createdAt);
        return saved;
    }

    private User saveUser(String prefix, Role role) {
        User user = new User();
        user.setName(prefix);
        user.setEmail(prefix + "-" + UUID.randomUUID() + "@test.com");
        user.setPassword("test-password");
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.saveAndFlush(user);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
