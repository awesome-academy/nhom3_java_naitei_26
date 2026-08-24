package vn.naitei.nhom3.expensemanagement.user;

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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;
import vn.naitei.nhom3.expensemanagement.repository.ActivityLogRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.security.JwtTokenProvider;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for Admin User Management (#99029):
 * GET /api/admin/users, PUT /api/admin/users/{id}/role, PUT /api/admin/users/{id}/status.
 *
 * <p>Follows the same pattern as {@code ExpenseAdminIntegrationTest}:
 * RANDOM_PORT, RestClient, manual @AfterEach cleanup, @ActiveProfiles("local").
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
class UserAdminIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private RestClient restClient;
    private User admin;
    private User userA;
    private User userB;
    private String adminToken;
    private String userToken;

    private final List<Long> createdUserIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder().baseUrl("http://localhost:" + port).build();

        admin = saveUser("admin-user-mgmt", "Admin Quản Trị", Role.ADMIN, UserStatus.ACTIVE);
        userA = saveUser("member-alice", "Alice Nguyen", Role.USER, UserStatus.ACTIVE);
        userB = saveUser("member-bob", "Bob Tran", Role.USER, UserStatus.INACTIVE);

        adminToken = jwtTokenProvider.generateToken(new UserPrincipal(admin));
        userToken = jwtTokenProvider.generateToken(new UserPrincipal(userA));
    }

    @AfterEach
    void tearDown() {
        activityLogRepository.deleteAll(activityLogRepository.findByUserId(admin.getId()));
        userRepository.deleteAllById(createdUserIds);
    }

    // ─── GET /api/admin/users ───────────────────────────────────────────────

    @Test
    void shouldReturnAllUsers() {
        JsonNode response = get("/api/admin/users", adminToken);

        assertThat(response.at("/status").asInt()).isEqualTo(200);
        assertThat(response.at("/message").asText()).isEqualTo("Thành công");
        assertThat(response.at("/data/items").size()).isGreaterThanOrEqualTo(3);
        assertThat(response.at("/data/page").asInt()).isEqualTo(0);
    }

    @Test
    void shouldFilterByStatus() {
        JsonNode response = get("/api/admin/users?status=INACTIVE&size=100", adminToken);

        JsonNode items = response.at("/data/items");
        assertThat(items.size()).isGreaterThanOrEqualTo(1);
        for (int i = 0; i < items.size(); i++) {
            assertThat(items.get(i).get("status").asText()).isEqualTo("INACTIVE");
        }
    }

    @Test
    void shouldFilterByRole() {
        JsonNode response = get("/api/admin/users?role=ADMIN&size=100", adminToken);

        JsonNode items = response.at("/data/items");
        assertThat(items.size()).isGreaterThanOrEqualTo(1);
        for (int i = 0; i < items.size(); i++) {
            assertThat(items.get(i).get("role").asText()).isEqualTo("ADMIN");
        }
    }

    @Test
    void shouldFilterBySearchKeywordCaseInsensitive() {
        JsonNode response = get("/api/admin/users?search=ALICE&size=100", adminToken);

        JsonNode items = response.at("/data/items");
        assertThat(items.size()).isGreaterThanOrEqualTo(1);
        boolean found = false;
        for (int i = 0; i < items.size(); i++) {
            if (items.get(i).get("id").asLong() == userA.getId()) {
                found = true;
            }
        }
        assertThat(found).isTrue();
    }

    @Test
    void shouldSupportPagination() {
        JsonNode page0 = get("/api/admin/users?page=0&size=2", adminToken);
        assertThat(page0.at("/data/items").size()).isEqualTo(2);
        assertThat(page0.at("/data/page").asInt()).isEqualTo(0);
        assertThat(page0.at("/data/size").asInt()).isEqualTo(2);
        assertThat(page0.at("/data/totalItems").asLong()).isGreaterThanOrEqualTo(3);
    }

    @Test
    void shouldRejectInvalidPaginationParameters() {
        assertBadRequest("/api/admin/users?page=-1");
        assertBadRequest("/api/admin/users?size=0");
        assertBadRequest("/api/admin/users?size=101");
    }

    // ─── PUT /api/admin/users/{id}/role ─────────────────────────────────────

    @Test
    void shouldUpdateUserRole() {
        JsonNode response = put("/api/admin/users/" + userA.getId() + "/role",
                "{\"role\":\"ADMIN\"}", adminToken);

        assertThat(response.at("/data/role").asText()).isEqualTo("ADMIN");

        User reloaded = userRepository.findById(userA.getId()).orElseThrow();
        assertThat(reloaded.getRole()).isEqualTo(Role.ADMIN);

        var log = activityLogRepository.findByEntityTypeAndEntityId("USER", userA.getId()).stream()
                .filter(l -> "UPDATE_USER_ROLE".equals(l.getAction()))
                .findFirst().orElseThrow();
        assertThat(log.getDescription()).contains("ADMIN");
    }

    @Test
    void shouldRejectInvalidRoleValue() {
        assertThatThrownBy(() -> restClient.put()
                .uri("/api/admin/users/" + userA.getId() + "/role")
                .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"role\":\"SUPERADMIN\"}")
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.BadRequest.class);
    }

    @Test
    void shouldReturn404WhenUpdatingRoleOfNonexistentUser() {
        assertThatThrownBy(() -> restClient.put()
                .uri("/api/admin/users/999999999/role")
                .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"role\":\"ADMIN\"}")
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.NotFound.class);
    }

    // ─── PUT /api/admin/users/{id}/status ───────────────────────────────────

    @Test
    void shouldDeactivateAnotherUser() {
        JsonNode response = put("/api/admin/users/" + userA.getId() + "/status",
                "{\"status\":\"INACTIVE\"}", adminToken);

        assertThat(response.at("/data/status").asText()).isEqualTo("INACTIVE");

        User reloaded = userRepository.findById(userA.getId()).orElseThrow();
        assertThat(reloaded.getStatus()).isEqualTo(UserStatus.INACTIVE);

        var log = activityLogRepository.findByEntityTypeAndEntityId("USER", userA.getId()).stream()
                .filter(l -> "UPDATE_USER_STATUS".equals(l.getAction()))
                .findFirst().orElseThrow();
        assertThat(log.getDescription()).contains("INACTIVE");
    }

    @Test
    void shouldReactivateUser() {
        JsonNode response = put("/api/admin/users/" + userB.getId() + "/status",
                "{\"status\":\"ACTIVE\"}", adminToken);

        assertThat(response.at("/data/status").asText()).isEqualTo("ACTIVE");
    }

    @Test
    void shouldPreventAdminFromDeactivatingSelf() {
        assertThatThrownBy(() -> restClient.put()
                .uri("/api/admin/users/" + admin.getId() + "/status")
                .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"status\":\"INACTIVE\"}")
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.Forbidden.class);

        User reloaded = userRepository.findById(admin.getId()).orElseThrow();
        assertThat(reloaded.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    void shouldRejectInvalidStatusValue() {
        assertThatThrownBy(() -> restClient.put()
                .uri("/api/admin/users/" + userA.getId() + "/status")
                .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"status\":\"BANNED\"}")
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.BadRequest.class);
    }

    // ─── Authorization ───────────────────────────────────────────────────────

    @Test
    void shouldForbidRegularUserFromAccessingAdminEndpoints() {
        assertThatThrownBy(() -> restClient.get()
                .uri("/api/admin/users")
                .header(HttpHeaders.AUTHORIZATION, bearer(userToken))
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.Forbidden.class);

        assertThatThrownBy(() -> restClient.put()
                .uri("/api/admin/users/" + userA.getId() + "/role")
                .header(HttpHeaders.AUTHORIZATION, bearer(userToken))
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"role\":\"ADMIN\"}")
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.Forbidden.class);
    }

    @Test
    void shouldRejectRequestWithoutToken() {
        assertThatThrownBy(() -> restClient.get()
                .uri("/api/admin/users")
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private JsonNode get(String uri, String token) {
        String response = restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .retrieve()
                .body(String.class);
        return parse(response);
    }

    private JsonNode put(String uri, String body, String token) {
        String response = restClient.put()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
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
            throw new IllegalStateException("Failed to parse response: " + json, ex);
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

    private User saveUser(String prefix, String name, Role role, UserStatus status) {
        User user = new User();
        user.setName(name);
        user.setEmail(prefix + "-" + UUID.randomUUID() + "@test.com");
        user.setPassword("test-password");
        user.setRole(role);
        user.setStatus(status);
        User saved = userRepository.saveAndFlush(user);
        createdUserIds.add(saved.getId());
        return saved;
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
