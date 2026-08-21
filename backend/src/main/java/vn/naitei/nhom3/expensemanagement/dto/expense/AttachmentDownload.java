package vn.naitei.nhom3.expensemanagement.dto.expense;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.core.io.Resource;

@Getter
@AllArgsConstructor
public class AttachmentDownload {

    private final Resource resource;
    private final String fileName;
    private final String contentType;
}
