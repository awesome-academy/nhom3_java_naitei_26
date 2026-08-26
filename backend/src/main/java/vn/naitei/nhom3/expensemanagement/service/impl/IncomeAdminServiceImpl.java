package vn.naitei.nhom3.expensemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.naitei.nhom3.expensemanagement.dto.income.AdminIncomeFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.income.AdminIncomePageResponse;
import vn.naitei.nhom3.expensemanagement.dto.income.AdminIncomeResponse;
import vn.naitei.nhom3.expensemanagement.dto.income.IncomeRequest;
import vn.naitei.nhom3.expensemanagement.entity.Income;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.IncomeRepository;
import vn.naitei.nhom3.expensemanagement.repository.specification.IncomeSpecification;
import vn.naitei.nhom3.expensemanagement.service.IncomeAdminService;

import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IncomeAdminServiceImpl implements IncomeAdminService {

    private static final Map<String, String> SORT_FIELDS = Map.of(
            "date", "incomeDate",
            "title", "title",
            "amount", "amount");

    private final IncomeRepository incomeRepository;
    private final jakarta.persistence.EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public AdminIncomePageResponse getAllSystem(AdminIncomeFilterRequest filter) {
        Pageable pageable = PageRequest.of(
                filter.getPage(), filter.getSize(), createSort(filter.getSort()));
        Page<Income> incomes = incomeRepository.findAll(
                IncomeSpecification.filterByAdmin(filter), pageable);
        return new AdminIncomePageResponse(
                incomes.getContent().stream().map(this::toAdminResponse).toList(),
                incomes.getNumber(),
                incomes.getSize(),
                incomes.getTotalElements(),
                incomes.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminIncomeResponse getById(Long id) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));
        return toAdminResponse(income);
    }

    @Override
    @Transactional
    public AdminIncomeResponse update(Long id, IncomeRequest request) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));

        income.setTitle(request.getSource());
        income.setAmount(request.getAmount());
        income.setIncomeDate(request.getDate());
        income.setNote(request.getNote());

        income = incomeRepository.save(income);
        return toAdminResponse(income);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!incomeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Income not found");
        }
        incomeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public java.math.BigDecimal getTotalIncomeAcrossAllUsers(AdminIncomeFilterRequest filter) {
        var spec = IncomeSpecification.filterByAdmin(filter);
        var cb = entityManager.getCriteriaBuilder();
        var query = cb.createQuery(java.math.BigDecimal.class);
        var root = query.from(Income.class);
        query.select(cb.coalesce(cb.sum(root.get("amount")), java.math.BigDecimal.ZERO));
        if (spec != null) {
            var predicate = spec.toPredicate(root, query, cb);
            if (predicate != null) {
                query.where(predicate);
            }
        }
        return entityManager.createQuery(query).getSingleResult();
    }

    private AdminIncomeResponse toAdminResponse(Income income) {
        return new AdminIncomeResponse(
                income.getId(),
                income.getTitle(),
                income.getAmount(),
                income.getIncomeDate(),
                income.getNote(),
                income.getCreatedAt(),
                income.getUpdatedAt(),
                income.getUser().getId(),
                income.getUser().getName(),
                income.getUser().getEmail());
    }

    private Sort createSort(String sortParameter) {
        if (sortParameter == null || sortParameter.isBlank()) {
            return Sort.by(Sort.Order.desc("incomeDate"), Sort.Order.desc("id"));
        }
        String[] parts = sortParameter.split(",");
        String property = SORT_FIELDS.get(parts[0].toLowerCase(Locale.ROOT));
        Sort.Direction direction = Sort.Direction.fromString(parts[1]);
        return Sort.by(new Sort.Order(direction, property), Sort.Order.desc("id"));
    }
}
