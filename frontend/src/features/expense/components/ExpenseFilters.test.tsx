import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExpenseFilters from "./ExpenseFilters";
import type { ExpenseFilterValues } from "../types";

const values: ExpenseFilterValues = {
  search: "",
  categoryId: "",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
};

describe("ExpenseFilters", () => {
  it("render controls và phát sự kiện thay đổi/reset", () => {
    const onChange = vi.fn();
    const onReset = vi.fn();
    render(
      <ExpenseFilters
        values={values}
        categories={[{ id: 3, name: "Ăn uống" }]}
        errors={{}}
        onChange={onChange}
        onReset={onReset}
      />
    );

    fireEvent.change(screen.getByLabelText("Tìm theo tên khoản chi"), {
      target: { value: "cơm" },
    });
    fireEvent.change(screen.getByLabelText("Danh mục"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Đặt lại" }));

    expect(screen.getByText("Từ ngày")).toBeInTheDocument();
    expect(screen.getByText("Đến ngày")).toBeInTheDocument();
    expect(screen.getByText("Số tiền từ")).toBeInTheDocument();
    expect(screen.getByText("Số tiền đến")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith("search", "cơm");
    expect(onChange).toHaveBeenCalledWith("categoryId", "3");
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("hiển thị validation và thông báo category fallback", () => {
    render(
      <ExpenseFilters
        values={values}
        categories={[]}
        errors={{ date: "Ngày không hợp lệ", amount: "Tiền không hợp lệ" }}
        isCategoryFallback
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("Ngày không hợp lệ")).toBeInTheDocument();
    expect(screen.getByText("Tiền không hợp lệ")).toBeInTheDocument();
    expect(screen.getByText(/Category API chưa sẵn sàng/)).toBeInTheDocument();
  });
});
