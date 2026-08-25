import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExpenseTable from "./ExpenseTable";
import type { Expense } from "../types";

const expense: Expense = {
  id: 12,
  title: "Cơm trưa",
  amount: 50000,
  date: "2026-08-14",
  categoryId: 3,
  categoryName: "Ăn uống",
};

describe("ExpenseTable", () => {
  it("hiển thị loading mà không hiện empty state", () => {
    render(<ExpenseTable expenses={[]} isLoading onRowClick={vi.fn()} />);

    expect(screen.getByLabelText("Loading expenses")).toBeInTheDocument();
    expect(screen.queryByText("No expenses yet")).not.toBeInTheDocument();
  });

  it("hiển thị empty state", () => {
    render(<ExpenseTable expenses={[]} onRowClick={vi.fn()} />);

    expect(screen.getByText("No expenses yet")).toBeInTheDocument();
  });

  it("render đúng dữ liệu và xử lý click row", () => {
    const onRowClick = vi.fn();
    render(<ExpenseTable expenses={[expense]} onRowClick={onRowClick} />);

    expect(screen.getByText("Cơm trưa")).toBeInTheDocument();
    expect(screen.getByText("Ăn uống")).toBeInTheDocument();
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
    expect(screen.getByText("14/08/2026")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cơm trưa"));
    expect(onRowClick).toHaveBeenCalledWith(expense);
  });

  it("hỗ trợ mở row bằng bàn phím", () => {
    const onRowClick = vi.fn();
    render(<ExpenseTable expenses={[expense]} onRowClick={onRowClick} />);

    fireEvent.keyDown(screen.getByText("Cơm trưa").closest("tr")!, { key: "Enter" });
    expect(onRowClick).toHaveBeenCalledWith(expense);
  });

  it("mở edit mà không kích hoạt click row", () => {
    const onRowClick = vi.fn();
    const onEdit = vi.fn();
    render(<ExpenseTable expenses={[expense]} onRowClick={onRowClick} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Cơm trưa" }));

    expect(onEdit).toHaveBeenCalledWith(expense);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
