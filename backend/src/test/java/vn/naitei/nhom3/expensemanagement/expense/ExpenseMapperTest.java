package vn.naitei.nhom3.expensemanagement.expense;

import org.junit.jupiter.api.Test;
import vn.naitei.nhom3.expensemanagement.dto.expense.ExpenseMapper;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.Expense;

import static org.assertj.core.api.Assertions.assertThat;

class ExpenseMapperTest {

    @Test
    void shouldMapCategoryIcon() {
        Expense expense = expenseWithCategoryIcon("restaurant");

        assertThat(ExpenseMapper.toResponse(expense).getCategoryIcon()).isEqualTo("restaurant");
    }

    @Test
    void shouldAllowNullCategoryIcon() {
        Expense expense = expenseWithCategoryIcon(null);

        assertThat(ExpenseMapper.toResponse(expense).getCategoryIcon()).isNull();
    }

    private Expense expenseWithCategoryIcon(String icon) {
        Category category = new Category();
        category.setIcon(icon);

        Expense expense = new Expense();
        expense.setCategory(category);
        return expense;
    }
}
