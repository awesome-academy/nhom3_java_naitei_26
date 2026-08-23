package vn.naitei.nhom3.expensemanagement.dto.income;

import vn.naitei.nhom3.expensemanagement.entity.Income;

/**
 * Mapper chuyển đổi giữa Income entity và IncomeResponse DTO.
 * Entity dùng field "title", API dùng "source" — mapper xử lý mapping này.
 */
public final class IncomeMapper {

    private IncomeMapper() {
        // Utility class — không cho phép tạo instance
    }

    /**
     * Chuyển Income entity → IncomeResponse DTO.
     * Mapping: entity.title → response.source (theo SRS).
     */
    public static IncomeResponse toResponse(Income income) {
        return new IncomeResponse(
                income.getId(),
                income.getTitle(),         // entity "title" → API "source"
                income.getAmount(),
                income.getIncomeDate(),

                income.getNote(),
                income.getCreatedAt(),
                income.getUpdatedAt());
    }
}
