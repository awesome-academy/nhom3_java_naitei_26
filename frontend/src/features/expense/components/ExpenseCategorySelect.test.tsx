import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExpenseCategorySelect from "./ExpenseCategorySelect";

const categories = [
  { id: 1, name: "Food & Dining", icon: "restaurant" },
  { id: 2, name: "Housing", icon: "home" },
];

describe("ExpenseCategorySelect", () => {
  it("shows category icons and selects an option", () => {
    const onChange = vi.fn();
    render(
      <ExpenseCategorySelect
        id="category"
        label="Danh mục"
        value=""
        categories={categories}
        placeholder="Chọn danh mục"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Danh mục" }));

    expect(screen.getByText("restaurant")).toHaveClass("material-symbols-outlined");
    expect(screen.getByText("home")).toHaveClass("material-symbols-outlined");
    fireEvent.click(screen.getByRole("button", { name: "Food & Dining" }));
    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("keeps a category without an icon usable", () => {
    const onChange = vi.fn();
    render(
      <ExpenseCategorySelect
        id="category"
        label="Danh mục"
        value=""
        categories={[{ id: 3, name: "Other", icon: null }]}
        placeholder="Chọn danh mục"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Danh mục" }));
    fireEvent.click(screen.getByRole("button", { name: "Other" }));
    expect(onChange).toHaveBeenCalledWith("3");
  });
});
