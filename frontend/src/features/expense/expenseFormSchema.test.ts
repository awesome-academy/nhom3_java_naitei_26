import { describe, expect, it } from "vitest";
import { expenseFormSchema, getFileValidationError } from "./expenseFormSchema";

const validForm = {
  title: "Cơm trưa",
  amount: "50000",
  date: "2026-08-14",
  categoryId: "3",
  note: "",
  files: [] as File[],
};

describe("expenseFormSchema", () => {
  it("chấp nhận dữ liệu hợp lệ và boundary file", () => {
    const files = Array.from(
      { length: 5 },
      (_, index) => new File(["a"], `${index}.jpg`, { type: "image/jpeg" })
    );
    expect(expenseFormSchema.safeParse({ ...validForm, files }).success).toBe(true);
  });

  it("từ chối field bắt buộc, amount không dương và ngày tương lai", () => {
    const result = expenseFormSchema.safeParse({
      ...validForm,
      title: " ",
      amount: "0",
      date: "2999-01-01",
      categoryId: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        title: ["Tên khoản chi không được để trống"],
        amount: ["Số tiền phải lớn hơn 0"],
        date: ["Ngày chi không được ở tương lai"],
        categoryId: ["Danh mục không được để trống"],
      });
    }
  });

  it("từ chối sai MIME và file quá 5MB", () => {
    const wrongType = new File(["a"], "script.exe", { type: "application/octet-stream" });
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.pdf", {
      type: "application/pdf",
    });
    expect(expenseFormSchema.safeParse({ ...validForm, files: [wrongType] }).success).toBe(false);
    expect(expenseFormSchema.safeParse({ ...validForm, files: [oversized] }).success).toBe(false);
    expect(getFileValidationError([wrongType])).toBe("File đính kèm chỉ hỗ trợ JPEG, PNG hoặc PDF");
  });
});
