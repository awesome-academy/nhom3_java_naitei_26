package vn.naitei.nhom3.expensemanagement.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.naitei.nhom3.expensemanagement.entity.BudgetTemplate;
import vn.naitei.nhom3.expensemanagement.entity.BudgetTemplateDetail;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.BudgetTemplateDetailRepository;
import vn.naitei.nhom3.expensemanagement.repository.BudgetTemplateRepository;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.service.BudgetTemplateDetailService;

@Service
@RequiredArgsConstructor
public class BudgetTemplateDetailServiceImpl implements BudgetTemplateDetailService {

    private final BudgetTemplateDetailRepository budgetTemplateDetailRepository;
    private final BudgetTemplateRepository budgetTemplateRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BudgetTemplateDetail> getByTemplateId(Long templateId) {
        getActiveTemplate(templateId);
        return budgetTemplateDetailRepository.findByTemplateId(templateId);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetTemplateDetail getById(Long id) {
        return budgetTemplateDetailRepository.findById(id)
                .filter(detail -> detail.getTemplate() != null
                        && detail.getTemplate().getDeletedAt() == null)
                .orElseThrow(() -> ResourceNotFoundException.of("Budget template detail", id));
    }

    @Override
    @Transactional
    public BudgetTemplateDetail create(Long templateId, Long categoryId,
            BudgetTemplateDetail detail) {
        BudgetTemplate template = getActiveTemplate(templateId);
        Category category = getActiveExpenseCategory(categoryId);
        validateAmount(detail);

        detail.setTemplate(template);
        detail.setCategory(category);
        return budgetTemplateDetailRepository.save(detail);
    }

    @Override
    @Transactional
    public BudgetTemplateDetail update(Long id, BudgetTemplateDetail updated) {
        BudgetTemplateDetail existingDetail = getById(id);
        validateAmount(updated);

        existingDetail.setAmount(updated.getAmount());
        return budgetTemplateDetailRepository.save(existingDetail);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        BudgetTemplateDetail detail = getById(id);
        budgetTemplateDetailRepository.delete(detail);
    }

    private BudgetTemplate getActiveTemplate(Long templateId) {
        return budgetTemplateRepository.findByIdAndDeletedAtIsNull(templateId)
                .orElseThrow(() -> ResourceNotFoundException.of("Budget template", templateId));
    }

    private Category getActiveExpenseCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", categoryId));

        if (category.getDeletedAt() != null) {
            throw ResourceNotFoundException.of("Category", categoryId);
        }

        if (category.getType() != CategoryType.EXPENSE) {
            throw new BadRequestException("Category must have type EXPENSE");
        }

        return category;
    }

    private void validateAmount(BudgetTemplateDetail detail) {
        if (detail == null) {
            throw new BadRequestException("Budget template detail is required");
        }

        if (detail.getAmount() == null || detail.getAmount().signum() <= 0) {
            throw new BadRequestException("Amount must be positive");
        }
    }
}