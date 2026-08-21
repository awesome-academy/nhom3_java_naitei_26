package vn.naitei.nhom3.expensemanagement.expense;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.Expense;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseAttachmentRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.security.JwtTokenProvider;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;
import vn.naitei.nhom3.expensemanagement.service.ExpenseAttachmentService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
class ExpenseAttachmentIntegrationTest {

    @TempDir
    static Path storageDirectory;

    @DynamicPropertySource
    static void configureStorage(DynamicPropertyRegistry registry) {
        registry.add("app.expense-attachment.storage-path", storageDirectory::toString);
        registry.add("spring.servlet.multipart.max-file-size", () -> "6MB");
        registry.add("spring.servlet.multipart.max-request-size", () -> "31MB");
    }

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseAttachmentRepository attachmentRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ExpenseAttachmentService attachmentService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private RestClient restClient;
    private User userA;
    private User userB;
    private Category category;
    private String tokenA;
    private String tokenB;

    @BeforeEach
    void setUp() throws IOException {
        cleanStorage();
        restClient = RestClient.builder().baseUrl("http://localhost:" + port).build();
        userA = saveUser("attachment-user-a");
        userB = saveUser("attachment-user-b");
        category = saveCategory();
        tokenA = jwtTokenProvider.generateToken(new UserPrincipal(userA));
        tokenB = jwtTokenProvider.generateToken(new UserPrincipal(userB));
    }

    @AfterEach
    void tearDown() throws IOException {
        for (Expense expense : expenseRepository.findByUserId(userA.getId())) {
            attachmentRepository.deleteAll(attachmentRepository.findByExpenseId(expense.getId()));
            expenseRepository.delete(expense);
        }
        categoryRepository.deleteById(category.getId());
        userRepository.deleteById(userA.getId());
        userRepository.deleteById(userB.getId());
        cleanStorage();
    }

    @Test
    void shouldUploadFilesReturnDetailsAndDownloadForOwner() throws Exception {
        JsonNode created = createExpense(tokenA, List.of(
                file("bill.jpg", "image/jpeg", "jpeg-content".getBytes()),
                file("bill.pdf", "application/pdf", "pdf-content".getBytes())));
        long expenseId = created.at("/data/id").asLong();

        assertThat(created.at("/data/attachments").size()).isEqualTo(2);
        assertThat(listStoredFiles()).hasSize(2);

        JsonNode detail = getExpense(tokenA, expenseId);
        JsonNode attachment = detail.at("/data/attachments/0");
        long attachmentId = attachment.get("id").asLong();
        assertThat(attachment.get("fileUrl").asText())
                .isEqualTo("/api/expenses/%d/attachments/%d/download".formatted(expenseId, attachmentId));

        ResponseEntity<byte[]> download = restClient.get()
                .uri(attachment.get("fileUrl").asText())
                .header(HttpHeaders.AUTHORIZATION, bearer(tokenA))
                .retrieve()
                .toEntity(byte[].class);
        assertThat(download.getStatusCode().value()).isEqualTo(200);
        assertThat(download.getHeaders().getContentDisposition().getFilename()).isEqualTo("bill.jpg");
    }

    @Test
    void shouldStoreDuplicateOriginalNamesWithoutOverwriting() throws Exception {
        JsonNode created = createExpense(tokenA, List.of(
                file("same.png", "image/png", "first".getBytes()),
                file("same.png", "image/png", "second".getBytes())));
        long expenseId = created.at("/data/id").asLong();

        assertThat(attachmentRepository.findByExpenseId(expenseId))
                .extracting("fileName")
                .containsExactly("same.png", "same.png");
        assertThat(attachmentRepository.findByExpenseId(expenseId))
                .extracting("filePath")
                .doesNotHaveDuplicates();
        assertThat(listStoredFiles()).hasSize(2);
    }

    @Test
    void shouldUpdateExpenseAndAppendFilesWithoutReplacingExistingAttachments() throws Exception {
        JsonNode created = createExpense(tokenA, List.of(
                file("old.jpg", "image/jpeg", new byte[]{1}),
                file("old.pdf", "application/pdf", new byte[]{2})));
        long expenseId = created.at("/data/id").asLong();

        JsonNode updated = updateExpense(tokenA, expenseId, "Cơm trưa đã sửa", List.of(
                file("new-1.png", "image/png", new byte[]{3}),
                file("new-2.pdf", "application/pdf", new byte[]{4})));

        assertThat(updated.at("/data/title").asText()).isEqualTo("Cơm trưa đã sửa");
        assertThat(updated.at("/data/attachments").size()).isEqualTo(4);
        assertThat(attachmentRepository.findByExpenseId(expenseId)).hasSize(4);
        assertThat(listStoredFiles()).hasSize(4);
    }

    @Test
    void shouldRollbackUpdateWhenCumulativeFileLimitIsExceeded() throws Exception {
        JsonNode created = createExpense(tokenA, List.of(
                file("1.jpg", "image/jpeg", new byte[]{1}),
                file("2.jpg", "image/jpeg", new byte[]{2}),
                file("3.jpg", "image/jpeg", new byte[]{3}),
                file("4.jpg", "image/jpeg", new byte[]{4})));
        long expenseId = created.at("/data/id").asLong();

        assertThatThrownBy(() -> updateExpense(tokenA, expenseId, "Không được lưu", List.of(
                file("5.jpg", "image/jpeg", new byte[]{5}),
                file("6.jpg", "image/jpeg", new byte[]{6}))))
                .isInstanceOf(HttpClientErrorException.BadRequest.class);

        JsonNode detail = getExpense(tokenA, expenseId);
        assertThat(detail.at("/data/title").asText()).isEqualTo("Cơm trưa");
        assertThat(detail.at("/data/attachments").size()).isEqualTo(4);
        assertThat(listStoredFiles()).hasSize(4);
    }

    @Test
    void shouldRejectInvalidMimeEmptyOversizedAndTooManyFilesWithoutSavingAnything() {
        long attachmentCountBeforeRequests = attachmentRepository.count();

        assertUploadBadRequest(List.of(file("script.exe", "application/octet-stream", new byte[]{1})));
        assertUploadBadRequest(List.of(file("empty.jpg", "image/jpeg", new byte[0])));
        assertUploadBadRequest(List.of(file("large.pdf", "application/pdf", new byte[5 * 1024 * 1024 + 1])));
        assertUploadBadRequest(List.of(
                file("valid.jpg", "image/jpeg", new byte[]{1}),
                file("invalid.exe", "application/octet-stream", new byte[]{1})));
        assertUploadBadRequest(List.of(
                file("1.jpg", "image/jpeg", new byte[]{1}),
                file("2.jpg", "image/jpeg", new byte[]{1}),
                file("3.jpg", "image/jpeg", new byte[]{1}),
                file("4.jpg", "image/jpeg", new byte[]{1}),
                file("5.jpg", "image/jpeg", new byte[]{1}),
                file("6.jpg", "image/jpeg", new byte[]{1})));

        assertThat(expenseRepository.findByUserId(userA.getId())).isEmpty();
        assertThat(attachmentRepository.count()).isEqualTo(attachmentCountBeforeRequests);
        assertThat(listStoredFiles()).isEmpty();
    }

    @Test
    void shouldRejectWhenExistingAndNewFilesExceedFive() throws Exception {
        JsonNode created = createExpense(tokenA, List.of(
                file("1.jpg", "image/jpeg", new byte[]{1}),
                file("2.jpg", "image/jpeg", new byte[]{1}),
                file("3.jpg", "image/jpeg", new byte[]{1}),
                file("4.jpg", "image/jpeg", new byte[]{1})));
        long expenseId = created.at("/data/id").asLong();
        Expense expense = expenseRepository.findById(expenseId).orElseThrow();

        assertThatThrownBy(() -> attachmentService.saveAll(expense, List.of(
                new MockMultipartFile("files", "5.jpg", "image/jpeg", new byte[]{1}),
                new MockMultipartFile("files", "6.jpg", "image/jpeg", new byte[]{1}))))
                .isInstanceOf(BadRequestException.class);
        assertThat(attachmentRepository.countByExpenseId(expenseId)).isEqualTo(4);
        assertThat(listStoredFiles()).hasSize(4);
    }

    @Test
    void shouldDeleteAttachmentFromDatabaseAndStorage() throws Exception {
        JsonNode created = createExpense(tokenA, List.of(file("bill.jpg", "image/jpeg", new byte[]{1})));
        long expenseId = created.at("/data/id").asLong();
        long attachmentId = created.at("/data/attachments/0/id").asLong();

        restClient.delete()
                .uri("/api/expenses/{expenseId}/attachments/{attachmentId}", expenseId, attachmentId)
                .header(HttpHeaders.AUTHORIZATION, bearer(tokenA))
                .retrieve()
                .toBodilessEntity();

        assertThat(attachmentRepository.findById(attachmentId)).isEmpty();
        assertThat(listStoredFiles()).isEmpty();
    }

    @Test
    void shouldReturnNotFoundForCrossUserAndMismatchedAttachment() throws Exception {
        JsonNode first = createExpense(tokenA, List.of(file("first.jpg", "image/jpeg", new byte[]{1})));
        JsonNode second = createExpense(tokenA, List.of(file("second.jpg", "image/jpeg", new byte[]{2})));
        long firstExpenseId = first.at("/data/id").asLong();
        long firstAttachmentId = first.at("/data/attachments/0/id").asLong();
        long secondExpenseId = second.at("/data/id").asLong();

        assertNotFound(tokenB, firstExpenseId, firstAttachmentId);
        assertNotFound(tokenA, secondExpenseId, firstAttachmentId);
        assertThat(attachmentRepository.findById(firstAttachmentId)).isPresent();
    }

    @Test
    void shouldDeleteAllAttachmentFilesWhenDeletingExpense() throws Exception {
        JsonNode created = createExpense(tokenA, List.of(
                file("first.jpg", "image/jpeg", new byte[]{1}),
                file("second.pdf", "application/pdf", new byte[]{2})));
        long expenseId = created.at("/data/id").asLong();

        restClient.delete()
                .uri("/api/expenses/{id}", expenseId)
                .header(HttpHeaders.AUTHORIZATION, bearer(tokenA))
                .retrieve()
                .toBodilessEntity();

        assertThat(expenseRepository.findById(expenseId)).isEmpty();
        assertThat(attachmentRepository.findByExpenseId(expenseId)).isEmpty();
        assertThat(listStoredFiles()).isEmpty();
    }

    private JsonNode createExpense(String token, List<HttpEntity<ByteArrayResource>> files) throws Exception {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        HttpHeaders dataHeaders = new HttpHeaders();
        dataHeaders.setContentType(MediaType.APPLICATION_JSON);
        String data = "{\"title\":\"Cơm trưa\",\"amount\":50000,\"date\":\"2026-08-14\","
                + "\"categoryId\":" + category.getId() + ",\"note\":\"ok\"}";
        body.add("data", new HttpEntity<>(data, dataHeaders));
        files.forEach(file -> body.add("files", file));

        String response = restClient.post()
                .uri("/api/expenses")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);
        return objectMapper.readTree(response);
    }

    private JsonNode getExpense(String token, long expenseId) throws Exception {
        String response = restClient.get()
                .uri("/api/expenses/{id}", expenseId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .retrieve()
                .body(String.class);
        return objectMapper.readTree(response);
    }

    private JsonNode updateExpense(
            String token,
            long expenseId,
            String title,
            List<HttpEntity<ByteArrayResource>> files) throws Exception {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        HttpHeaders dataHeaders = new HttpHeaders();
        dataHeaders.setContentType(MediaType.APPLICATION_JSON);
        String data = "{\"title\":\"" + title + "\",\"amount\":50000,\"date\":\"2026-08-14\","
                + "\"categoryId\":" + category.getId() + ",\"note\":\"ok\"}";
        body.add("data", new HttpEntity<>(data, dataHeaders));
        files.forEach(file -> body.add("files", file));

        String response = restClient.put()
                .uri("/api/expenses/{id}", expenseId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);
        return objectMapper.readTree(response);
    }

    private HttpEntity<ByteArrayResource> file(String name, String contentType, byte[] content) {
        ByteArrayResource resource = new ByteArrayResource(content) {
            @Override
            public String getFilename() {
                return name;
            }
        };
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        return new HttpEntity<>(resource, headers);
    }

    private void assertUploadBadRequest(List<HttpEntity<ByteArrayResource>> files) {
        assertThatThrownBy(() -> createExpense(tokenA, files))
                .isInstanceOf(HttpClientErrorException.BadRequest.class);
    }

    private void assertNotFound(String token, long expenseId, long attachmentId) {
        assertThatThrownBy(() -> restClient.delete()
                .uri("/api/expenses/{expenseId}/attachments/{attachmentId}", expenseId, attachmentId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(HttpClientErrorException.NotFound.class);
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

    private Category saveCategory() {
        Category savedCategory = new Category();
        savedCategory.setName("Ăn uống");
        savedCategory.setType(CategoryType.EXPENSE);
        return categoryRepository.saveAndFlush(savedCategory);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private List<Path> listStoredFiles() {
        try (var paths = Files.list(storageDirectory)) {
            return paths.toList();
        } catch (IOException ex) {
            throw new IllegalStateException(ex);
        }
    }

    private void cleanStorage() throws IOException {
        for (Path path : listStoredFiles()) {
            Files.deleteIfExists(path);
        }
    }

}
