package vn.naitei.nhom3.expensemanagement.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import org.junit.jupiter.api.extension.ExtendWith;
import vn.naitei.nhom3.expensemanagement.entity.BudgetTemplate;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.BudgetTemplateRepository;

@ExtendWith(MockitoExtension.class)
class BudgetTemplateServiceImplTest {

    @Mock
    private BudgetTemplateRepository budgetTemplateRepository;

    @InjectMocks
    private BudgetTemplateServiceImpl budgetTemplateService;

    @Test
    void getAllReturnsActiveBudgetTemplates() {
        List<BudgetTemplate> templates = List.of(validTemplate());
        when(budgetTemplateRepository.findByDeletedAtIsNull(Pageable.unpaged()))
                .thenReturn(new PageImpl<>(templates));

        List<BudgetTemplate> result = budgetTemplateService.getAll();

        assertEquals(templates, result);
        verify(budgetTemplateRepository).findByDeletedAtIsNull(Pageable.unpaged());
    }

    @Test
    void getByIdReturnsActiveTemplate() {
        BudgetTemplate template = validTemplate();
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(template));

        BudgetTemplate result = budgetTemplateService.getById(1L);

        assertSame(template, result);
    }

    @Test
    void getByIdThrowsWhenTemplateDoesNotExist() {
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateService.getById(1L));
    }

    @Test
    void getByIdThrowsWhenTemplateIsSoftDeleted() {
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateService.getById(1L));
        verify(budgetTemplateRepository).findByIdAndDeletedAtIsNull(1L);
    }

    @Test
    void createSavesValidTemplate() {
        BudgetTemplate template = validTemplate();
        when(budgetTemplateRepository.save(template)).thenReturn(template);

        BudgetTemplate result = budgetTemplateService.create(template);

        assertSame(template, result);
        verify(budgetTemplateRepository).save(template);
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 13})
    void createRejectsInvalidMonth(int month) {
        BudgetTemplate template = validTemplate();
        template.setMonth(month);

        assertThrows(BadRequestException.class,
                () -> budgetTemplateService.create(template));
    }

    @ParameterizedTest
    @ValueSource(ints = {49, 101})
    void createRejectsInvalidWarningPercentage(int warningPercentage) {
        BudgetTemplate template = validTemplate();
        template.setWarningPercentage(warningPercentage);

        assertThrows(BadRequestException.class,
                () -> budgetTemplateService.create(template));
    }

    @Test
    void createRejectsWarningPercentageThatIsNotMultipleOfFive() {
        BudgetTemplate template = validTemplate();
        template.setWarningPercentage(52);

        assertThrows(BadRequestException.class,
                () -> budgetTemplateService.create(template));
    }

    @Test
    void updateUpdatesExistingTemplateFields() {
        BudgetTemplate existingTemplate = validTemplate();
        BudgetTemplate updatedTemplate = validTemplate();
        updatedTemplate.setName("Updated template");
        updatedTemplate.setMonth(12);
        updatedTemplate.setWarningPercentage(75);
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(existingTemplate));
        when(budgetTemplateRepository.save(existingTemplate)).thenReturn(existingTemplate);

        BudgetTemplate result = budgetTemplateService.update(1L, updatedTemplate);

        assertSame(existingTemplate, result);
        assertEquals("Updated template", existingTemplate.getName());
        assertEquals(12, existingTemplate.getMonth());
        assertEquals(75, existingTemplate.getWarningPercentage());
        verify(budgetTemplateRepository).save(existingTemplate);
    }

    @Test
    void updateThrowsWhenTemplateDoesNotExist() {
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetTemplateService.update(1L, validTemplate()));
    }

    @Test
    void deleteSetsDeletedAtInsteadOfPhysicallyDeletingTemplate() {
        BudgetTemplate template = validTemplate();
        when(budgetTemplateRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(template));

        budgetTemplateService.delete(1L);

        assertNotNull(template.getDeletedAt());
        verify(budgetTemplateRepository).save(template);
        verify(budgetTemplateRepository, never()).delete(any(BudgetTemplate.class));
    }

    private BudgetTemplate validTemplate() {
        BudgetTemplate template = new BudgetTemplate();
        template.setName("Monthly template");
        template.setMonth(1);
        template.setWarningPercentage(50);
        return template;
    }
}