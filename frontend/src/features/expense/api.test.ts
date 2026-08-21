import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/lib/axios";
import { expenseApi } from "./api";
import type { ExpensePageResponse } from "./types";

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("expenseApi.getAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gửi đúng page, size, sort và không gửi userId", async () => {
    const response: ExpensePageResponse = {
      items: [],
      page: 0,
      size: 10,
      totalItems: 0,
      totalPages: 0,
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: response });

    await expenseApi.getAll({ page: 0, size: 10, sort: "date,desc" });

    expect(apiClient.get).toHaveBeenCalledWith("/expenses", {
      params: { page: 0, size: 10, sort: "date,desc" },
    });
    const params = vi.mocked(apiClient.get).mock.calls[0][1]?.params;
    expect(params).not.toHaveProperty("userId");
  });

  it("đọc contract items và totalItems của Expense", async () => {
    const response: ExpensePageResponse = {
      items: [
        {
          id: 12,
          title: "Cơm trưa",
          amount: 50000,
          date: "2026-08-14",
          categoryId: 3,
          categoryName: "Ăn uống",
        },
      ],
      page: 0,
      size: 10,
      totalItems: 42,
      totalPages: 5,
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: response });

    const result = await expenseApi.getAll();

    expect(result.data.items[0].title).toBe("Cơm trưa");
    expect(result.data.totalItems).toBe(42);
  });
});

describe("expenseApi mutations", () => {
  const data = {
    title: "Cơm trưa",
    amount: 50000,
    date: "2026-08-14",
    categoryId: 3,
  };

  beforeEach(() => vi.clearAllMocks());

  it("gửi JSON khi create không có file", async () => {
    await expenseApi.create({ data, files: [] });
    expect(apiClient.post).toHaveBeenCalledWith("/expenses", data);
  });

  it("gửi multipart data/files khi create có file", async () => {
    const file = new File(["bill"], "bill.pdf", { type: "application/pdf" });
    await expenseApi.create({ data, files: [file] });

    const formData = vi.mocked(apiClient.post).mock.calls[0][1] as FormData;
    expect(formData.get("data")).toBeInstanceOf(Blob);
    expect(formData.getAll("files")).toEqual([file]);
    expect(vi.mocked(apiClient.post).mock.calls[0][2]).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
    });
  });

  it("gửi PUT multipart khi edit thêm file", async () => {
    const file = new File(["bill"], "bill.jpg", { type: "image/jpeg" });
    await expenseApi.update(12, { data, files: [file] });

    expect(apiClient.put).toHaveBeenCalledWith(
      "/expenses/12",
      expect.any(FormData),
      expect.objectContaining({ headers: { "Content-Type": "multipart/form-data" } })
    );
  });

  it("gọi đúng API xem và xóa attachment", async () => {
    await expenseApi.downloadAttachment(12, 7);
    await expenseApi.deleteAttachment(12, 7);

    expect(apiClient.get).toHaveBeenCalledWith("/expenses/12/attachments/7/download", {
      responseType: "blob",
    });
    expect(apiClient.delete).toHaveBeenCalledWith("/expenses/12/attachments/7");
  });
});
