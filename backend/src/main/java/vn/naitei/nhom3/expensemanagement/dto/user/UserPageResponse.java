package vn.naitei.nhom3.expensemanagement.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class UserPageResponse {

    private final List<UserResponse> items;
    private final int page;
    private final int size;
    private final long totalItems;
    private final int totalPages;
}
