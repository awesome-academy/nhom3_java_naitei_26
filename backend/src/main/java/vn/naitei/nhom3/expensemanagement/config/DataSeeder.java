package vn.naitei.nhom3.expensemanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import vn.naitei.nhom3.expensemanagement.dto.budget.BudgetRequest;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.Expense;
import vn.naitei.nhom3.expensemanagement.entity.Income;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.repository.ExpenseRepository;
import vn.naitei.nhom3.expensemanagement.repository.IncomeRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;
import vn.naitei.nhom3.expensemanagement.service.BudgetService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@org.springframework.stereotype.Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetService budgetService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking database for seeding...");

        User admin = getOrCreateUser("Admin User", "admin@example.com", "password", Role.ADMIN);
        User testUser1 = getOrCreateUser("Test User", "user@example.com", "password", Role.USER);
        User testUser2 = getOrCreateUser("John Doe", "johndoe@example.com", "password", Role.USER);

        // 2. Seed Common Categories
        if (categoryRepository.findByUserIdIsNull().isEmpty()) {
            log.info("No common categories found. Seeding default categories...");

            // Common Income Categories
            seedCommonCategory("Salary", "Monthly fixed salary", "payments", CategoryType.INCOME);
            seedCommonCategory("Freelance", "Side projects income", "work", CategoryType.INCOME); // Đổi từ "briefcase" -> "work"
            seedCommonCategory("Investment", "Dividends and interest", "savings", CategoryType.INCOME); // Đổi từ "trending-up" -> "savings"

            // Common Expense Categories
            seedCommonCategory("Food & Dining", "Groceries and eating out", "restaurant", CategoryType.EXPENSE);
            seedCommonCategory("Housing", "Rent and utilities", "home", CategoryType.EXPENSE);
            seedCommonCategory("Transportation", "Gas and transit", "directions_car", CategoryType.EXPENSE); // Đổi từ "car" -> "directions_car"
            seedCommonCategory("Entertainment", "Movies, games, etc", "movie", CategoryType.EXPENSE); // Đổi từ "film" -> "movie"
            seedCommonCategory("Shopping", "Clothing, gadgets, and personal items", "shopping_bag", CategoryType.EXPENSE);
        }

        // 3. Seed Incomes for Test User
        List<Category> expenseCategories = categoryRepository.findByUserIsNullAndTypeAndDeletedAtIsNullOrderByIdAsc(CategoryType.EXPENSE);
        if (expenseCategories.isEmpty()) {
            log.warn("No expense categories found to seed data.");
            return;
        }

        Category food = expenseCategories.stream().filter(c -> c.getName().contains("Food")).findFirst().orElse(expenseCategories.get(0));
        Category housing = expenseCategories.stream().filter(c -> c.getName().contains("Housing")).findFirst().orElse(expenseCategories.get(0));
        Category transport = expenseCategories.stream().filter(c -> c.getName().contains("Transport")).findFirst().orElse(expenseCategories.get(0));
        Category entertainment = expenseCategories.stream().filter(c -> c.getName().contains("Entertainment")).findFirst().orElse(expenseCategories.get(0));
        Category shopping = expenseCategories.stream().filter(c -> c.getName().contains("Shopping")).findFirst().orElse(expenseCategories.get(0));

        YearMonth start = YearMonth.of(2025, 8);
        YearMonth end = YearMonth.of(2026, 8);

        // 3. Seed Dữ liệu User 1 (Test User: ~26-33tr thu nhập, chi tiêu có Over Budget)
        if (testUser1 != null && expenseRepository.findByUserId(testUser1.getId()).isEmpty()) {
            log.info("Seeding 1-year data for User 1 (user@example.com)...");

            for (YearMonth ym = start; !ym.isAfter(end); ym = ym.plusMonths(1)) {
                int y = ym.getYear();
                int m = ym.getMonthValue();

                // Income
                seedIncome(testUser1, "Monthly Salary (" + m + "/" + y + ")", new BigDecimal("26000000.00"), LocalDate.of(y, m, 5), "Direct company payroll");
                if (m % 2 == 0) {
                    seedIncome(testUser1, "Freelance Design (" + m + "/" + y + ")", new BigDecimal("7500000.00"), LocalDate.of(y, m, 20), "Contract milestone");
                }
                if (m == 1 || m == 12) {
                    seedIncome(testUser1, "Year-end Bonus (" + y + ")", new BigDecimal("35000000.00"), LocalDate.of(y, m, 25), "Performance bonus");
                }

                // Budgets
                seedBudget(testUser1.getId(), food.getId(), y, m, new BigDecimal("4000000.00"));
                seedBudget(testUser1.getId(), housing.getId(), y, m, new BigDecimal("6500000.00"));
                seedBudget(testUser1.getId(), transport.getId(), y, m, new BigDecimal("1000000.00"));
                seedBudget(testUser1.getId(), entertainment.getId(), y, m, new BigDecimal("1500000.00"));
                seedBudget(testUser1.getId(), shopping.getId(), y, m, new BigDecimal("2000000.00"));

                // Expenses
                seedExpense(testUser1, housing, "Apartment House Rent", new BigDecimal("5000000.00"), LocalDate.of(y, m, 2), "Monthly rent to landlord");
                seedExpense(testUser1, housing, "Utilities & Internet Bill", new BigDecimal("750000.00"), LocalDate.of(y, m, 12), "Water, power and network");
                seedExpense(testUser1, transport, "Gasoline & Parking Fee", new BigDecimal("350000.00"), LocalDate.of(y, m, 10), "Commute gas and monthly parking");
                seedExpense(testUser1, entertainment, "Netflix & Spotify Subscriptions", new BigDecimal("320000.00"), LocalDate.of(y, m, 15), "Digital subscriptions");

                if (m == 8 && y == 2026) {
                    seedExpense(testUser1, food, "Supermarket Groceries", new BigDecimal("1200000.00"), LocalDate.of(y, m, 7), "Weekly food market");
                    seedExpense(testUser1, food, "Dinner with Colleagues", new BigDecimal("450000.00"), LocalDate.of(y, m, 18), "Weekend restaurant dinner");
                } else if (m == 12 && y == 2025) {
                    seedExpense(testUser1, food, "Holiday Groceries & Party", new BigDecimal("3800000.00"), LocalDate.of(y, m, 22), "Christmas family dinner");
                    seedExpense(testUser1, shopping, "New Smartphone & Clothes", new BigDecimal("4200000.00"), LocalDate.of(y, m, 20), "Year-end shopping discount");
                } else if (m == 4 && y == 2026) {
                    seedExpense(testUser1, food, "Supermarket & Eating out", new BigDecimal("3200000.00"), LocalDate.of(y, m, 10), "Regular dining");
                    seedExpense(testUser1, entertainment, "Holiday Trip & Resort tickets", new BigDecimal("2200000.00"), LocalDate.of(y, m, 28), "Vacation tickets");
                } else if (m == 2 && y == 2026) {
                    seedExpense(testUser1, food, "Lunar New Year Food Preparation", new BigDecimal("3650000.00"), LocalDate.of(y, m, 5), "Tet grocery supplies");
                    seedExpense(testUser1, shopping, "Tet Gifts for Family", new BigDecimal("1500000.00"), LocalDate.of(y, m, 6), "Gifts and fruits");
                } else {
                    seedExpense(testUser1, food, "Weekly Supermarket Groceries", new BigDecimal("1850000.00"), LocalDate.of(y, m, 8), "Food and groceries");
                    seedExpense(testUser1, food, "Weekend Dining Out", new BigDecimal("650000.00"), LocalDate.of(y, m, 22), "Restaurant with friends");
                    seedExpense(testUser1, shopping, "Casual Clothes & Supplies", new BigDecimal("600000.00"), LocalDate.of(y, m, 16), "Personal items");
                }
            }
        }

        // 4. Seed Dữ liệu User 2 (John Doe: ~20tr thu nhập, chi tiêu 10-15tr/tháng)
        if (testUser2 != null && expenseRepository.findByUserId(testUser2.getId()).isEmpty()) {
            log.info("Seeding 1-year data for User 2 (johndoe@example.com)...");

            for (YearMonth ym = start; !ym.isAfter(end); ym = ym.plusMonths(1)) {
                int y = ym.getYear();
                int m = ym.getMonthValue();

                // Income: Thu nhập cố định 20 triệu/tháng
                seedIncome(testUser2, "Monthly Salary (" + m + "/" + y + ")", new BigDecimal("20000000.00"), LocalDate.of(y, m, 5), "Monthly bank payroll transfer");

                // Budgets cân đối với mức thu nhập 20 triệu
                seedBudget(testUser2.getId(), food.getId(), y, m, new BigDecimal("4500000.00"));
                seedBudget(testUser2.getId(), housing.getId(), y, m, new BigDecimal("4500000.00"));
                seedBudget(testUser2.getId(), transport.getId(), y, m, new BigDecimal("800000.00"));
                seedBudget(testUser2.getId(), entertainment.getId(), y, m, new BigDecimal("1200000.00"));
                seedBudget(testUser2.getId(), shopping.getId(), y, m, new BigDecimal("1500000.00"));

                // Chi tiêu cơ bản (~8.5 triệu)
                seedExpense(testUser2, housing, "Shared Apartment Rent", new BigDecimal("3500000.00"), LocalDate.of(y, m, 2), "Monthly room rent");
                seedExpense(testUser2, housing, "Electricity & Water Bill", new BigDecimal("550000.00"), LocalDate.of(y, m, 12), "Monthly utility bills");
                seedExpense(testUser2, transport, "Motorbike Gasoline", new BigDecimal("250000.00"), LocalDate.of(y, m, 10), "Gas refill for daily work");
                seedExpense(testUser2, food, "Weekly Groceries", new BigDecimal("2800000.00"), LocalDate.of(y, m, 7), "Market cooking ingredients");
                seedExpense(testUser2, food, "Lunch at work", new BigDecimal("1200000.00"), LocalDate.of(y, m, 24), "Weekday lunch meals");
                seedExpense(testUser2, entertainment, "Mobile 4G & Cinema", new BigDecimal("250000.00"), LocalDate.of(y, m, 15), "Mobile plan and weekend movie");

                // Chi tiêu biến thiên để tổng đạt từ 10.5 - 14.5 triệu/tháng
                if (m % 3 == 0) {
                    // Tháng chi tiêu nhiều hơn (~14.5 triệu)
                    seedExpense(testUser2, shopping, "Clothing and Shoes", new BigDecimal("2800000.00"), LocalDate.of(y, m, 18), "Seasonal wardrobe update");
                    seedExpense(testUser2, entertainment, "Dinner gathering with classmates", new BigDecimal("1200000.00"), LocalDate.of(y, m, 26), "Restaurant gathering");
                } else if (m % 2 == 0) {
                    // Tháng chi tiêu trung bình (~12 triệu)
                    seedExpense(testUser2, shopping, "Personal Hygiene & Household goods", new BigDecimal("1500000.00"), LocalDate.of(y, m, 16), "Home supplies");
                    seedExpense(testUser2, transport, "Motorbike Maintenance & Oil change", new BigDecimal("450000.00"), LocalDate.of(y, m, 20), "Bike service");
                } else {
                    // Tháng tiết kiệm (~10.5 triệu)
                    seedExpense(testUser2, shopping, "Books & Stationery", new BigDecimal("650000.00"), LocalDate.of(y, m, 19), "Self-study books");
                    seedExpense(testUser2, entertainment, "Coffee with friends", new BigDecimal("450000.00"), LocalDate.of(y, m, 28), "Weekend coffee");
                }
            }
        }

        log.info("1-Year historical database seeding completed successfully.");
    }

    private User getOrCreateUser(String name, String email, String password, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            log.info("User {} not found. Creating...", email);
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setStatus(UserStatus.ACTIVE);
            return userRepository.save(user);
        });
    }

    private void seedCommonCategory(String name, String description, String icon, CategoryType type) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        category.setType(type);
        category.setUser(null);
        categoryRepository.save(category);
    }

    private void seedIncome(User user, String title, BigDecimal amount, LocalDate date, String note) {
        Income income = new Income();
        income.setUser(user);
        income.setTitle(title);
        income.setAmount(amount);
        income.setIncomeDate(date);
        income.setNote(note);
        incomeRepository.save(income);
    }

    private void seedExpense(User user, Category category, String title, BigDecimal amount, LocalDate date, String note) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setCategory(category);
        expense.setTitle(title);
        expense.setAmount(amount);
        expense.setExpenseDate(date);
        expense.setNote(note);
        expenseRepository.save(expense);
    }

    private void seedBudget(Long userId, Long categoryId, Integer year, Integer month, BigDecimal amount) {
        BudgetRequest request = new BudgetRequest();
        request.setCategoryId(categoryId);
        request.setYear(year);
        request.setMonth(month);
        request.setAmount(amount);
        budgetService.createBudget(userId, request);
    }
}
