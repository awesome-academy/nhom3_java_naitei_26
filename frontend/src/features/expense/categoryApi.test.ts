import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/lib/axios";
import { expenseCategoryApi } from "./categoryApi";

vi.mock("@/lib/axios", () => ({
  default: { get: vi.fn() },
}));

describe("expenseCategoryApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ưu tiên gọi Category API của nhóm theo contract SRS", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

    await expenseCategoryApi.getExpenseCategories();

    expect(apiClient.get).toHaveBeenCalledWith("/categories", { params: { type: "EXPENSE" } });
  });
});
