package vn.naitei.nhom3.expensemanagement.dto.category;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import vn.naitei.nhom3.expensemanagement.entity.enums.CategoryType;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class CategoryAdminResponse {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private CategoryType type;
    private long usageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
