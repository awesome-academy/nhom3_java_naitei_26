import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CategorySpendingChart from "./CategorySpendingChart";

vi.mock("recharts", () => {
  const Container = ({ children }: { children: ReactNode }) => <div>{children}</div>;

  return {
    Cell: () => null,
    Pie: Container,
    PieChart: Container,
    ResponsiveContainer: Container,
    Tooltip: () => null,
  };
});

describe("CategorySpendingChart", () => {
  it("renders Material Symbol icons while preserving the English chart copy", () => {
    const { container } = render(
      <CategorySpendingChart
        data={[
          {
            categoryId: 3,
            categoryName: "Food & Dining",
            categoryIcon: "restaurant",
            totalAmount: 850_000,
            percentage: 100,
          },
        ]}
        isLoading={false}
        isError={false}
      />
    );

    expect(screen.getByText("Spending by Category")).toBeInTheDocument();
    expect(screen.getByText("Category breakdown")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Recorded")).toBeInTheDocument();
    expect(container.querySelector(".material-symbols-outlined")).toHaveTextContent("restaurant");
  });
});
