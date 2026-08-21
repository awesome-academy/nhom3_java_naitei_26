package vn.naitei.nhom3.expensemanagement.service;

import org.springframework.web.multipart.MultipartFile;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseFilterRequest;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpensePageResponse;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseRequest;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseResponse;

import java.util.List;

public interface ExpenseService {

    ExpensePageResponse getAllByUser(Long userId, ExpenseFilterRequest filter);

    ExpenseResponse getById(Long userId, Long id);

    ExpenseResponse create(Long userId, ExpenseRequest request);

    ExpenseResponse create(Long userId, ExpenseRequest request, List<MultipartFile> files);

    ExpenseResponse update(Long userId, Long id, ExpenseRequest request);

    ExpenseResponse update(Long userId, Long id, ExpenseRequest request, List<MultipartFile> files);

    void delete(Long userId, Long id);
}
