package vn.naitei.nhom3.expensemanagement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "budget_templates")
public class BudgetTemplate extends SoftDeletableEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer month;

    @Column(name = "warning_percentage", nullable = false)
    private Integer warningPercentage;
}
