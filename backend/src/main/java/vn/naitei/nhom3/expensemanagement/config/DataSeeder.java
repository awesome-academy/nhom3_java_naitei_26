package vn.naitei.nhom3.expensemanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import vn.naitei.nhom3.expensemanagement.entity.Category;
import vn.naitei.nhom3.expensemanagement.entity.Income;
import vn.naitei.nhom3.expensemanagement.entity.User;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import vn.naitei.nhom3.expensemanagement.entity.enums.Role;
import vn.naitei.nhom3.expensemanagement.entity.enums.UserStatus;
import vn.naitei.nhom3.expensemanagement.repository.CategoryRepository;
import vn.naitei.nhom3.expensemanagement.repository.IncomeRepository;
import vn.naitei.nhom3.expensemanagement.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDate;

@org.springframework.stereotype.Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final IncomeRepository incomeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking database for seeding...");
        
        // 1. Seed Users
        if (userRepository.count() == 0) {
            log.info("No users found. Seeding admin and test user...");
            
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            userRepository.save(admin);

            User testUser = new User();
            testUser.setName("Test User");
            testUser.setEmail("user@example.com");
            testUser.setPassword(passwordEncoder.encode("password"));
            testUser.setRole(Role.USER);
            testUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(testUser);
        }

        // 2. Seed Common Categories
        if (categoryRepository.findByUserIdIsNull().isEmpty()) {
            log.info("No common categories found. Seeding default categories...");

            // Common Income Categories
            seedCommonCategory("Salary", "Monthly fixed salary", "wallet", CategoryType.INCOME);
            seedCommonCategory("Freelance", "Side projects income", "briefcase", CategoryType.INCOME);
            seedCommonCategory("Investment", "Dividends and interest", "trending-up", CategoryType.INCOME);

            // Common Expense Categories
            seedCommonCategory("Food & Dining", "Groceries and eating out", "restaurant", CategoryType.EXPENSE);
            seedCommonCategory("Housing", "Rent and utilities", "home", CategoryType.EXPENSE);
            seedCommonCategory("Transportation", "Gas and transit", "car", CategoryType.EXPENSE);
            seedCommonCategory("Entertainment", "Movies, games, etc", "film", CategoryType.EXPENSE);
        }

        // 3. Seed Incomes for Test User
        User testUser = userRepository.findByEmail("user@example.com").orElse(null);
        if (testUser != null && incomeRepository.findByUserId(testUser.getId()).isEmpty()) {
            log.info("Seeding sample incomes for test user...");

            seedIncome(testUser, "Tech Corp Salary", new BigDecimal("3500.00"), LocalDate.now().minusDays(5), "October Salary");
            seedIncome(testUser, "UI Design Project", new BigDecimal("1200.00"), LocalDate.now().minusDays(2), "Upwork Client");
        }
        
        log.info("Database seeding completed.");
    }

    private void seedCommonCategory(String name, String description, String icon, CategoryType type) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        category.setType(type);
        category.setUser(null); // COMMON category
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
}
