import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExpensePaginationSummary from "./ExpensePaginationSummary";

describe("ExpensePaginationSummary", () => {
  it("hiển thị đúng phạm vi trang đầu", () => {
    render(<ExpensePaginationSummary page={0} size={10} itemCount={10} totalItems={25} />);
    expect(screen.getByText(/1–10/)).toBeInTheDocument();
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });

  it("hiển thị đúng phạm vi trang cuối", () => {
    render(<ExpensePaginationSummary page={2} size={10} itemCount={5} totalItems={25} />);
    expect(screen.getByText(/21–25/)).toBeInTheDocument();
  });

  it("hiển thị tổng bằng 0", () => {
    render(<ExpensePaginationSummary page={0} size={10} itemCount={0} totalItems={0} />);
    expect(screen.getByText("Hiển thị 0 trên tổng 0 khoản chi")).toBeInTheDocument();
  });
});
