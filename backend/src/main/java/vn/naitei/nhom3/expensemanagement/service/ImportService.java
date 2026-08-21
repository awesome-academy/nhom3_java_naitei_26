package vn.naitei.nhom3.expensemanagement.service;

import org.springframework.web.multipart.MultipartFile;
import vn.naitei.nhom3.expensemanagement.dto.importexport.ImportEntityType;
import vn.naitei.nhom3.expensemanagement.dto.importexport.ImportResultResponse;

public interface ImportService {

    ImportResultResponse importCsv(ImportEntityType entityType, MultipartFile file);
}
