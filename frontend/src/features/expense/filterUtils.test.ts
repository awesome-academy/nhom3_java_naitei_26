import { describe, expect, it } from "vitest";
import { toExpenseFilter, validateExpenseFilters } from "./filterUtils";
import type { ExpenseFilterValues } from "./types";

const emptyValues: ExpenseFilterValues = {
  search: "",
  categoryId: "",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
};

describe("expense filter utilities", () => {
  it("chuẩn hoá đúng query và bỏ field rỗng", () => {
    expect(
      toExpenseFilter({
        ...emptyValues,
        search: "  cơm  ",
        categoryId: "3",
        fromDate: "2026-08-01",
        minAmount: "10000",
      })
    ).toEqual({
      search: "cơm",
      categoryId: 3,
      fromDate: "2026-08-01",
      toDate: undefined,
      minAmount: 10000,
      maxAmount: undefined,
    });
  });

  it("validate khoảng ngày đảo", () => {
    expect(
      validateExpenseFilters({
        ...emptyValues,
        fromDate: "2026-08-20",
        toDate: "2026-08-01",
      }).date
    ).toBe("Ngày bắt đầu không được sau ngày kết thúc");
  });

  it("validate khoảng tiền âm và đảo", () => {
    expect(validateExpenseFilters({ ...emptyValues, minAmount: "-1" }).amount).toBe(
      "Số tiền tối thiểu không được âm"
    );
    expect(
      validateExpenseFilters({ ...emptyValues, minAmount: "200", maxAmount: "100" }).amount
    ).toBe("Số tiền tối thiểu không được lớn hơn số tiền tối đa");
  });
});
