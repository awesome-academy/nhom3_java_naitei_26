package vn.naitei.nhom3.expensemanagement.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.naitei.nhom3.expensemanagement.entity.BudgetTemplate;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.BudgetTemplateRepository;
import vn.naitei.nhom3.expensemanagement.service.BudgetTemplateService;

@Service
@RequiredArgsConstructor
public class BudgetTemplateServiceImpl implements BudgetTemplateService {

    private static final int MIN_MONTH = 1;
    private static final int MAX_MONTH = 12;
    private static final int MIN_WARNING_PERCENTAGE = 50;
    private static final int MAX_WARNING_PERCENTAGE = 100;
    private static final int WARNING_PERCENTAGE_STEP = 5;

    private final BudgetTemplateRepository budgetTemplateRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BudgetTemplate> getAll() {
        return budgetTemplateRepository
                .findByDeletedAtIsNull(Pageable.unpaged())
                .getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetTemplate getById(Long id) {
        return budgetTemplateRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Budget template", id));
    }

    @Override
    @Transactional
    public BudgetTemplate create(BudgetTemplate template) {
        validateTemplate(template);
        return budgetTemplateRepository.save(template);
    }

    @Override
    @Transactional
    public BudgetTemplate update(Long id, BudgetTemplate updated) {
        BudgetTemplate existingTemplate = getById(id);

        validateTemplate(updated);

        existingTemplate.setName(updated.getName());
        existingTemplate.setMonth(updated.getMonth());
        existingTemplate.setWarningPercentage(updated.getWarningPercentage());

        return budgetTemplateRepository.save(existingTemplate);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        BudgetTemplate template = getById(id);
        template.setDeletedAt(LocalDateTime.now());
        budgetTemplateRepository.save(template);
    }

    private void validateTemplate(BudgetTemplate template) {
        if (template == null) {
            throw new BadRequestException("Budget template is required");
        }

        if (template.getName() == null || template.getName().isBlank()) {
            throw new BadRequestException("Budget template name is required");
        }

        if (template.getMonth() == null
                || template.getMonth() < MIN_MONTH
                || template.getMonth() > MAX_MONTH) {
            throw new BadRequestException("Month must be between 1 and 12");
        }

        if (template.getWarningPercentage() == null
                || template.getWarningPercentage() < MIN_WARNING_PERCENTAGE
                || template.getWarningPercentage() > MAX_WARNING_PERCENTAGE) {
            throw new BadRequestException(
                    "Warning percentage must be between 50 and 100");
        }

        if (template.getWarningPercentage() % WARNING_PERCENTAGE_STEP != 0) {
            throw new BadRequestException(
                    "Warning percentage must be a multiple of 5");
        }
    }
}