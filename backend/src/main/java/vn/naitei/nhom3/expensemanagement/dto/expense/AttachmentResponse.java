package vn.naitei.nhom3.expensemanagement.dto.expense;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttachmentResponse {

    private final Long id;
    private final String fileName;
    private final String fileUrl;
}
