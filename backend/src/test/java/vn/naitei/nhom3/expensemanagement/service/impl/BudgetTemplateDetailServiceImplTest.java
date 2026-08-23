package vn.naitei.nhom3.expensemanagement.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import vn.naitei.nhom3.expensemanagement.entity.BudgetTemplate;
import vn.naitei.nhom3.expensemanagement.entity.BudgetTemplateDetail;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.BudgetTemplateDetailRepository;
import vn.naitei.nhom3.expensemanagement.repository.BudgetTemplateRepository;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;

@ExtendWith(MockitoExtension.class)
class BudgetTemplateDetailServiceImplTest {

    @Mock
    private BudgetTemplateDetailRepository budgetTemplateDetailRepository;

    @Mock
    private BudgetTemplateRepository budgetTemplateRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private BudgetTemplateDetailServiceImpl budgetTemplateDetailService;

    @Test
    void getByTemplateIdReturnsDetailsForActiveTemplate() {
        BudgetTemplate template = activeTemplate();
        List<BudgetTemplateDetail> details = List.of(detail(template, activeCategory()));
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(template));
        when(budgetTemplateDetailRepository.findByTemplateId(1L)).thenReturn(details);

        List<BudgetTemplateDetail> result = budgetTemplateDetailService.getByTemplateId(1L);

        assertEquals(details, result);
        verify(budgetTemplateDetailRepository).findByTemplateId(1L);
    }

    @Test
    void getByTemplateIdThrowsWhenTemplateDoesNotExist() {
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateDetailService.getByTemplateId(1L));
        verify(budgetTemplateDetailRepository, never()).findByTemplateId(any());
    }

    @Test
    void getByTemplateIdThrowsWhenTemplateIsSoftDeleted() {
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateDetailService.getByTemplateId(1L));
    }

    @Test
    void getByIdReturnsDetailWhoseTemplateIsActive() {
        BudgetTemplateDetail detail = detail(activeTemplate(), activeCategory());
        when(budgetTemplateDetailRepository.findById(1L)).thenReturn(Optional.of(detail));

        BudgetTemplateDetail result = budgetTemplateDetailService.getById(1L);

        assertSame(detail, result);
    }

    @Test
    void getByIdThrowsWhenDetailDoesNotExist() {
        when(budgetTemplateDetailRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateDetailService.getById(1L));
    }

    @Test
    void getByIdThrowsWhenDetailTemplateIsSoftDeleted() {
        BudgetTemplate deletedTemplate = activeTemplate();
        deletedTemplate.setDeletedAt(LocalDateTime.now());
        BudgetTemplateDetail detail = detail(deletedTemplate, activeCategory());
        when(budgetTemplateDetailRepository.findById(1L)).thenReturn(Optional.of(detail));

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateDetailService.getById(1L));
    }

    @Test
    void createSavesDetailWithActiveTemplateAndExpenseCategory() {
        BudgetTemplate template = activeTemplate();
        Category category = activeCategory();
        BudgetTemplateDetail detail = new BudgetTemplateDetail();
        detail.setAmount(new BigDecimal("125.50"));
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(template));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(budgetTemplateDetailRepository.save(detail)).thenReturn(detail);

        BudgetTemplateDetail result = budgetTemplateDetailService.create(1L, 2L, detail);

        assertSame(detail, result);
        assertSame(template, detail.getTemplate());
        assertSame(category, detail.getCategory());
        verify(budgetTemplateDetailRepository).save(detail);
    }

    @Test
    void createThrowsWhenTemplateDoesNotExist() {
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateDetailService.create(1L, 2L, validDetail()));
        verify(categoryRepository, never()).findById(any());
    }

    @Test
    void createThrowsWhenCategoryDoesNotExist() {
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(activeTemplate()));
        when(categoryRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateDetailService.create(1L, 2L, validDetail()));
    }

    @Test
    void createThrowsWhenCategoryIsSoftDeleted() {
        Category category = activeCategory();
        category.setDeletedAt(LocalDateTime.now());
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(activeTemplate()));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateDetailService.create(1L, 2L, validDetail()));
    }

    @Test
    void createThrowsWhenCategoryIsNotExpense() {
        Category category = activeCategory();
        category.setType(CategoryType.INCOME);
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(activeTemplate()));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));

        assertThrows(BadRequestException.class,
                () -> budgetTemplateDetailService.create(1L, 2L, validDetail()));
    }

            @Test
            void createThrowsWhenCategoryIsPrivate() {
            Category category = activeCategory();
            category.setUser(new vn.naitei.nhom3.expensemanagement.entity.User());
            when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(activeTemplate()));
            when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));

            assertThrows(BadRequestException.class,
                () -> budgetTemplateDetailService.create(1L, 2L, validDetail()));
            }

    @Test
    void createThrowsWhenDetailIsNull() {
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(activeTemplate()));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(activeCategory()));

        assertThrows(BadRequestException.class,
                () -> budgetTemplateDetailService.create(1L, 2L, null));
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"0", "-1.00"})
    void createThrowsWhenAmountIsNotPositive(String amount) {
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(activeTemplate()));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(activeCategory()));
        BudgetTemplateDetail detail = amount == null ? null : detailWithAmount(new BigDecimal(amount));

        assertThrows(BadRequestException.class,
                () -> budgetTemplateDetailService.create(1L, 2L, detail));
    }

    @Test
    void updateChangesOnlyAmount() {
        BudgetTemplate template = activeTemplate();
        Category category = activeCategory();
        BudgetTemplateDetail existingDetail = detail(template, category);
        existingDetail.setAmount(new BigDecimal("10.00"));
        BudgetTemplateDetail updated = detailWithAmount(new BigDecimal("20.00"));
        when(budgetTemplateDetailRepository.findById(1L)).thenReturn(Optional.of(existingDetail));
        when(budgetTemplateDetailRepository.save(existingDetail)).thenReturn(existingDetail);

        BudgetTemplateDetail result = budgetTemplateDetailService.update(1L, updated);

        assertSame(existingDetail, result);
        assertEquals(new BigDecimal("20.00"), existingDetail.getAmount());
        assertSame(template, existingDetail.getTemplate());
        assertSame(category, existingDetail.getCategory());
        verify(budgetTemplateDetailRepository).save(existingDetail);
    }

    @Test
    void updateThrowsWhenDetailDoesNotExist() {
        when(budgetTemplateDetailRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateDetailService.update(1L, validDetail()));
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"0", "-1.00"})
    void updateThrowsWhenAmountIsNotPositive(String amount) {
        BudgetTemplateDetail existingDetail = detail(activeTemplate(), activeCategory());
        BudgetTemplateDetail updated = amount == null ? null : detailWithAmount(new BigDecimal(amount));
        when(budgetTemplateDetailRepository.findById(1L)).thenReturn(Optional.of(existingDetail));

        assertThrows(BadRequestException.class,
                () -> budgetTemplateDetailService.update(1L, updated));
    }

    @Test
    void deletePhysicallyDeletesActiveDetail() {
        BudgetTemplateDetail detail = detail(activeTemplate(), activeCategory());
        when(budgetTemplateDetailRepository.findById(1L)).thenReturn(Optional.of(detail));

        budgetTemplateDetailService.delete(1L);

        verify(budgetTemplateDetailRepository).delete(detail);
    }

    @Test
    void deleteThrowsWhenDetailDoesNotExist() {
        when(budgetTemplateDetailRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateDetailService.delete(1L));
        verify(budgetTemplateDetailRepository, never()).delete(any());
    }

    @Test
    void deleteThrowsWhenDetailTemplateIsSoftDeleted() {
        BudgetTemplate deletedTemplate = activeTemplate();
        deletedTemplate.setDeletedAt(LocalDateTime.now());
        BudgetTemplateDetail detail = detail(deletedTemplate, activeCategory());
        when(budgetTemplateDetailRepository.findById(1L)).thenReturn(Optional.of(detail));

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateDetailService.delete(1L));
        verify(budgetTemplateDetailRepository, never()).delete(any());
    }

    private BudgetTemplate activeTemplate() {
        return new BudgetTemplate();
    }

    private Category activeCategory() {
        Category category = new Category();
        category.setType(CategoryType.EXPENSE);
        return category;
    }

    private BudgetTemplateDetail validDetail() {
        return detailWithAmount(new BigDecimal("10.00"));
    }

    private BudgetTemplateDetail detailWithAmount(BigDecimal amount) {
        BudgetTemplateDetail detail = new BudgetTemplateDetail();
        detail.setAmount(amount);
        return detail;
    }

    private BudgetTemplateDetail detail(BudgetTemplate template, Category category) {
        BudgetTemplateDetail detail = validDetail();
        detail.setTemplate(template);
        detail.setCategory(category);
        return detail;
    }
}
