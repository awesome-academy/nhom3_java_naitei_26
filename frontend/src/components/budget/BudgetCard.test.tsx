import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BudgetCard from "./BudgetCard";
import type { Budget } from "@/features/budget/types";

const budget: Budget = {
  id: 1,
  userId: 7,
  categoryId: 3,
  categoryName: "Food & Dining",
  categoryIcon: "restaurant",
  amount: 1_000_000,
  month: 8,
  year: 2026,
  actualSpending: 850_000,
  spendingPercentage: 85,
  alertStatus: "WARNING",
  createdAt: "2026-08-01T00:00:00Z",
  updatedAt: "2026-08-01T00:00:00Z",
};

describe("BudgetCard", () => {
  it("renders the category icon as a Material Symbol and uses English labels", () => {
    const { container } = render(
      <BudgetCard budget={budget} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(container.querySelector(".material-symbols-outlined")).toHaveTextContent("restaurant");
    expect(screen.getByText("Target: August 2026")).toBeInTheDocument();
    expect(screen.getByText("Spending progress")).toBeInTheDocument();
    expect(screen.getByText("Warning (≥80%)")).toBeInTheDocument();
  });
});
