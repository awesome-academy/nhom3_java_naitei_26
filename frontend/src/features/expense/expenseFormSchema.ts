import { z } from "zod";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const expenseFormSchema = z.object({
  title: z.string().trim().min(1, "Expense title is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => Number(value) > 0, "Amount must be greater than 0"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((value) => value <= getToday(), "Date cannot be in the future"),
  categoryId: z.string().min(1, "Category is required"),
  note: z.string(),
  files: z
    .array(z.instanceof(File))
    .max(MAX_FILES, "Each expense can have up to 5 attachments")
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      "Each file must not exceed 5MB"
    )
    .refine(
      (files) => files.every((file) => ALLOWED_TYPES.includes(file.type)),
      "Attachments must be JPEG, PNG, or PDF files"
    ),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function getFileValidationError(files: File[], existingFileCount: number = 0) {
  if (existingFileCount + files.length > MAX_FILES) {
    return `You can add up to ${Math.max(0, MAX_FILES - existingFileCount)} more files`;
  }
  if (files.some((file) => file.size > MAX_FILE_SIZE)) {
    return "Each file must not exceed 5MB";
  }
  if (files.some((file) => !ALLOWED_TYPES.includes(file.type))) {
    return "Attachments must be JPEG, PNG, or PDF files";
  }
  return undefined;
}

function getToday(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
