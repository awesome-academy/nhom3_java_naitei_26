package vn.naitei.nhom3.expensemanagement.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.request.NativeWebRequest;
import vn.naitei.nhom3.expensemanagement.dto.report.ReportCategoryResponse;
import vn.naitei.nhom3.expensemanagement.dto.report.ReportSummaryResponse;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.exception.GlobalExceptionHandler;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;
import vn.naitei.nhom3.expensemanagement.security.UserPrincipal;
import vn.naitei.nhom3.expensemanagement.service.ReportService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    private static final Long AUTHENTICATED_USER_ID = 42L;

    @Mock
    private ReportService reportService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(AUTHENTICATED_USER_ID);
        user.setName("Report user");
        user.setEmail("report-user@example.com");
        user.setPassword("password");
        user.setRole(Role.USER);
        user.setStatus(UserStatus.ACTIVE);

        UserPrincipal principal = new UserPrincipal(user);
        mockMvc = MockMvcBuilders.standaloneSetup(new ReportController(reportService))
                .setCustomArgumentResolvers(new AuthenticatedPrincipalResolver(principal))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void acceptsMonthAndReturnsApiResponse() throws Exception {
        stubSummary();

        perform("period=month&value=2026-08")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.message", is("Thành công")))
                .andExpect(jsonPath("$.data.totalIncome", is(45000000)))
                .andExpect(jsonPath("$.data.totalExpense", is(30000000)))
                .andExpect(jsonPath("$.data.byCategory[0].categoryId", is(3)))
                .andExpect(jsonPath("$.data.byCategory[0].name", is("Food")));

        verify(reportService).getSummary(
                AUTHENTICATED_USER_ID,
                LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 8, 31));
        verifyNoMoreInteractions(reportService);
    }

    @Test
    void resolvesQuarterRange() throws Exception {
        stubSummary();

        perform("period=quarter&value=2026-Q3").andExpect(status().isOk());

        verify(reportService).getSummary(
                AUTHENTICATED_USER_ID,
                LocalDate.of(2026, 7, 1),
                LocalDate.of(2026, 9, 30));
    }

    @Test
    void resolvesYearRange() throws Exception {
        stubSummary();

        perform("period=year&value=2026").andExpect(status().isOk());

        verify(reportService).getSummary(
                AUTHENTICATED_USER_ID,
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 12, 31));
    }

    @Test
    void resolvesCustomDateRange() throws Exception {
        stubSummary();

        perform("from=2026-06-01&to=2026-08-15").andExpect(status().isOk());

        verify(reportService).getSummary(
                AUTHENTICATED_USER_ID,
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 8, 15));
    }

    @Test
    void ignoresClientSuppliedUserIdAndUsesAuthenticatedUser() throws Exception {
        stubSummary();

        perform("period=month&value=2026-08&userId=999").andExpect(status().isOk());

        verify(reportService).getSummary(
                eq(AUTHENTICATED_USER_ID),
                eq(LocalDate.of(2026, 8, 1)),
                eq(LocalDate.of(2026, 8, 31)));
    }

    @Test
    void rejectsConflictingParameterGroups() throws Exception {
        assertBadRequest("period=month&value=2026-08&from=2026-08-01&to=2026-08-31");
    }

    @Test
    void rejectsIncompleteParameterGroups() throws Exception {
        assertBadRequest("period=month");
        assertBadRequest("value=2026-08");
        assertBadRequest("from=2026-08-01");
        assertBadRequest("to=2026-08-31");
    }

    @Test
    void rejectsInvalidPeriodAndValueFormats() throws Exception {
        assertBadRequest("period=week&value=2026-W33");
        assertBadRequest("period=month&value=2026-13");
        assertBadRequest("period=quarter&value=2026-Q5");
        assertBadRequest("period=year&value=26");
        assertBadRequest("from=2026-02-30&to=2026-03-01");
    }

    @Test
    void rejectsReversedCustomRange() throws Exception {
        assertBadRequest("from=2026-08-20&to=2026-08-01");
    }

    @Test
    void mapsServiceBadRequestThroughGlobalExceptionHandler() throws Exception {
        when(reportService.getSummary(
                AUTHENTICATED_USER_ID,
                LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 8, 31)))
                .thenThrow(new BadRequestException("Report range is invalid"));

        perform("period=month&value=2026-08")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", is("Report range is invalid")));
    }

    private ResultActions perform(String query) throws Exception {
        return mockMvc.perform(get("/api/reports/summary?" + query));
    }

    private void assertBadRequest(String query) throws Exception {
        perform(query).andExpect(status().isBadRequest());
    }

    private void stubSummary() {
        when(reportService.getSummary(
                org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.any(LocalDate.class),
                org.mockito.ArgumentMatchers.any(LocalDate.class)))
                .thenReturn(new ReportSummaryResponse(
                        new BigDecimal("45000000"),
                        new BigDecimal("30000000"),
                    List.of(new ReportCategoryResponse(3L, "Food", new BigDecimal("12000000")))));
    }

    private static final class AuthenticatedPrincipalResolver implements HandlerMethodArgumentResolver {

        private final UserPrincipal principal;

        private AuthenticatedPrincipalResolver(UserPrincipal principal) {
            this.principal = principal;
        }

        @Override
        public boolean supportsParameter(MethodParameter parameter) {
            return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
        }

        @Override
        public Object resolveArgument(
                MethodParameter parameter,
                ModelAndViewContainer mavContainer,
                NativeWebRequest webRequest,
                org.springframework.web.bind.support.WebDataBinderFactory binderFactory) {
            return principal;
        }
    }
}