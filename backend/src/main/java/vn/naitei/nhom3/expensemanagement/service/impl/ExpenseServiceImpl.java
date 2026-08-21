package vn.naitei.nhom3.expensemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseMapper;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpensePageResponse;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseRequest;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseResponse;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.Expense;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.repository.specification.ExpenseSpecification;
import vn.naitei.nhom3.expensemanagement.service.ExpenseAttachmentService;
import vn.naitei.nhom3.expensemanagement.service.ExpenseService;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private static final Map<String, String> SORT_FIELDS = Map.of(
            "date", "expenseDate",
            "title", "title",
            "amount", "amount",
            "createdat", "createdAt");

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseAttachmentService attachmentService;

    @Override
    @Transactional(readOnly = true)
    public ExpensePageResponse getAllByUser(Long userId, ExpenseFilterRequest filter) {
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), createSort(filter.getSort()));
        Page<Expense> expenses = expenseRepository.findAll(
                ExpenseSpecification.filterBy(userId, filter), pageable);
        return new ExpensePageResponse(
                expenses.getContent().stream().map(ExpenseMapper::toResponse).toList(),
                expenses.getNumber(),
                expenses.getSize(),
                expenses.getTotalElements(),
                expenses.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getById(Long userId, Long id) {
        Expense expense = findOwnedExpense(userId, id);
        return ExpenseMapper.toResponse(expense, attachmentService.getAll(expense.getId()));
    }

    @Override
    @Transactional
    public ExpenseResponse create(Long userId, ExpenseRequest request) {
        return ExpenseMapper.toResponse(createExpense(userId, request));
    }

    @Override
    @Transactional
    public ExpenseResponse create(Long userId, ExpenseRequest request, List<MultipartFile> files) {
        Expense expense = createExpense(userId, request);
        return ExpenseMapper.toResponse(expense, attachmentService.saveAll(expense, files));
    }

    private Expense createExpense(Long userId, ExpenseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Người dùng", userId));
        Category category = validateCategory(userId, request.getCategoryId());

        Expense expense = new Expense();
        expense.setUser(user);
        expense.setCategory(category);
        updateExpense(expense, request);

        return expenseRepository.save(expense);
    }

    @Override
    @Transactional
    public ExpenseResponse update(Long userId, Long id, ExpenseRequest request) {
        Expense expense = updateExpense(userId, id, request);
        return ExpenseMapper.toResponse(expense, attachmentService.getAll(expense.getId()));
    }

    @Override
    @Transactional
    public ExpenseResponse update(
            Long userId, Long id, ExpenseRequest request, List<MultipartFile> files) {
        Expense expense = updateExpense(userId, id, request);
        attachmentService.saveAll(expense, files);
        return ExpenseMapper.toResponse(expense, attachmentService.getAll(expense.getId()));
    }

    private Expense updateExpense(Long userId, Long id, ExpenseRequest request) {
        Expense expense = findOwnedExpense(userId, id);
        Category category = validateCategory(userId, request.getCategoryId());

        expense.setCategory(category);
        updateExpense(expense, request);

        return expenseRepository.save(expense);
    }

    @Override
    @Transactional
    public void delete(Long userId, Long id) {
        Expense expense = findOwnedExpense(userId, id);
        attachmentService.deleteAll(expense.getId());
        expenseRepository.delete(expense);
    }

    private Expense findOwnedExpense(Long userId, Long id) {
        return expenseRepository.findById(id)
                .filter(expense -> expense.getUser().getId().equals(userId))
                .orElseThrow(() -> ResourceNotFoundException.of("Khoản chi", id));
    }

    private Category validateCategory(Long userId, Long categoryId) {
        return categoryRepository.findVisibleToUserAndType(userId, CategoryType.EXPENSE).stream()
                .filter(category -> category.getId().equals(categoryId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Danh mục khoản chi không hợp lệ"));
    }

    private void updateExpense(Expense expense, ExpenseRequest request) {
        expense.setTitle(request.getTitle().trim());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getDate());
        expense.setNote(request.getNote());
    }

    private Sort createSort(String sortParameter) {
        if (sortParameter == null || sortParameter.isBlank()) {
            return Sort.by(Sort.Order.desc("expenseDate"), Sort.Order.desc("id"));
        }
        String[] parts = sortParameter.split(",");
        String property = SORT_FIELDS.get(parts[0].toLowerCase(Locale.ROOT));
        Sort.Direction direction = Sort.Direction.fromString(parts[1]);
        return Sort.by(new Sort.Order(direction, property), Sort.Order.desc("id"));
    }
}
