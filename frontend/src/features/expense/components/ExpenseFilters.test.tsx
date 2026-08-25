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
        categories={[{ id: 3, name: "Ăn uống", icon: "restaurant" }]}
        errors={{}}
        onChange={onChange}
        onReset={onReset}
      />
    );

    fireEvent.change(screen.getByLabelText("Search by expense title"), {
      target: { value: "cơm" },
    });
    fireEvent.click(screen.getByRole("combobox", { name: "Category" }));
    expect(screen.getByText("restaurant")).toHaveClass("material-symbols-outlined");
    fireEvent.click(screen.getByRole("button", { name: "Ăn uống" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByText("From date")).toBeInTheDocument();
    expect(screen.getByText("To date")).toBeInTheDocument();
    expect(screen.getAllByText("Minimum amount").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maximum amount").length).toBeGreaterThan(0);
    expect(onChange).toHaveBeenCalledWith("search", "cơm");
    expect(onChange).toHaveBeenCalledWith("categoryId", "3");
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("hiển thị validation và thông báo category fallback", () => {
    render(
      <ExpenseFilters
        values={values}
        categories={[]}
        errors={{ date: "Invalid date", amount: "Invalid amount" }}
        isCategoryFallback
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("Invalid date")).toBeInTheDocument();
    expect(screen.getByText("Invalid amount")).toBeInTheDocument();
    expect(screen.getByText(/Category API is unavailable/)).toBeInTheDocument();
  });
});
