import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AttachmentDeleteConfirmModal from "./AttachmentDeleteConfirmModal";

describe("AttachmentDeleteConfirmModal", () => {
  it("không render khi chưa chọn file", () => {
    render(<AttachmentDeleteConfirmModal onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("hiển thị tên file và xử lý hủy/xác nhận", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <AttachmentDeleteConfirmModal fileName="bill.pdf" onCancel={onCancel} onConfirm={onConfirm} />
    );

    expect(screen.getByText("bill.pdf")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    fireEvent.click(screen.getByRole("button", { name: "Xóa file" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("không cho đóng khi đang xóa", () => {
    const onCancel = vi.fn();
    render(
      <AttachmentDeleteConfirmModal
        fileName="bill.pdf"
        isDeleting
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Hủy" })).toBeDisabled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).not.toHaveBeenCalled();
  });
});
