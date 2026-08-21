import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExpenseDeleteConfirmModal from "./ExpenseDeleteConfirmModal";

describe("ExpenseDeleteConfirmModal", () => {
  it("không render khi chưa chọn khoản chi", () => {
    render(<ExpenseDeleteConfirmModal onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("hiển thị cảnh báo và xử lý hủy/xác nhận", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ExpenseDeleteConfirmModal
        expenseTitle="Cơm trưa"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole("alertdialog")).toHaveTextContent("toàn bộ file đính kèm");
    expect(screen.getByText("Cơm trưa")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    fireEvent.click(screen.getByRole("button", { name: "Xóa khoản chi" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("khóa thao tác khi đang xóa", () => {
    render(
      <ExpenseDeleteConfirmModal
        expenseTitle="Cơm trưa"
        isDeleting
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Hủy" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Xóa khoản chi" })).toBeDisabled();
  });
});
