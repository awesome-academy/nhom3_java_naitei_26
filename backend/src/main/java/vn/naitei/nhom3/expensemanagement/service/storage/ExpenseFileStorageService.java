package vn.naitei.nhom3.expensemanagement.service.storage;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.naitei.nhom3.expensemanagement.exception.BadRequestException;
import vn.naitei.nhom3.expensemanagement.exception.ResourceNotFoundException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ExpenseFileStorageService {

    private final Path storageDirectory;

    public ExpenseFileStorageService(
            @Value("${app.expense-attachment.storage-path}") String storagePath) {
        this.storageDirectory = Path.of(storagePath).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void initialize() {
        try {
            Files.createDirectories(storageDirectory);
        } catch (IOException ex) {
            throw new IllegalStateException("Không thể khởi tạo thư mục lưu file đính kèm", ex);
        }
    }

    public String store(MultipartFile file) {
        String storedName = UUID.randomUUID() + getExtension(file.getContentType());
        Path destination = resolve(storedName);
        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return storedName;
        } catch (IOException ex) {
            deleteQuietly(destination);
            throw new BadRequestException("Không thể lưu file đính kèm");
        }
    }

    public Resource load(String storedName) {
        try {
            Resource resource = new UrlResource(resolve(storedName).toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw ResourceNotFoundException.of("File đính kèm", storedName);
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw ResourceNotFoundException.of("File đính kèm", storedName);
        }
    }

    public void delete(String storedName) {
        try {
            Files.deleteIfExists(resolve(storedName));
        } catch (IOException ex) {
            throw new IllegalStateException("Không thể xoá file đính kèm", ex);
        }
    }

    private Path resolve(String storedName) {
        Path resolved = storageDirectory.resolve(storedName).normalize();
        if (!resolved.startsWith(storageDirectory)) {
            throw new BadRequestException("Đường dẫn file đính kèm không hợp lệ");
        }
        return resolved;
    }

    private String getExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "application/pdf" -> ".pdf";
            default -> "";
        };
    }

    private void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // Keep the original storage exception as the primary failure.
        }
    }
}
