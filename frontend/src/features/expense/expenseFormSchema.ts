import { z } from "zod";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const expenseFormSchema = z.object({
  title: z.string().trim().min(1, "Tên khoản chi không được để trống"),
  amount: z
    .string()
    .min(1, "Số tiền không được để trống")
    .refine((value) => Number(value) > 0, "Số tiền phải lớn hơn 0"),
  date: z
    .string()
    .min(1, "Ngày chi không được để trống")
    .refine((value) => value <= getToday(), "Ngày chi không được ở tương lai"),
  categoryId: z.string().min(1, "Danh mục không được để trống"),
  note: z.string(),
  files: z
    .array(z.instanceof(File))
    .max(MAX_FILES, "Mỗi khoản chi chỉ được có tối đa 5 file đính kèm")
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      "Dung lượng mỗi file không được vượt quá 5MB"
    )
    .refine(
      (files) => files.every((file) => ALLOWED_TYPES.includes(file.type)),
      "File đính kèm chỉ hỗ trợ JPEG, PNG hoặc PDF"
    ),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function getFileValidationError(files: File[], existingFileCount: number = 0) {
  if (existingFileCount + files.length > MAX_FILES) {
    return `Chỉ có thể thêm tối đa ${Math.max(0, MAX_FILES - existingFileCount)} file`;
  }
  if (files.some((file) => file.size > MAX_FILE_SIZE)) {
    return "Dung lượng mỗi file không được vượt quá 5MB";
  }
  if (files.some((file) => !ALLOWED_TYPES.includes(file.type))) {
    return "File đính kèm chỉ hỗ trợ JPEG, PNG hoặc PDF";
  }
  return undefined;
}

function getToday(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
