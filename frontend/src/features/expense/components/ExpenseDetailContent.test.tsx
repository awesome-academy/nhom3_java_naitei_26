import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ExpenseDetailContent from "./ExpenseDetailContent";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refetch: vi.fn(),
  deleteExpense: vi.fn(),
  deleteAttachment: vi.fn(),
  downloadAttachment: vi.fn(),
  useExpense: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));
vi.mock("../api", () => ({
  expenseApi: { downloadAttachment: mocks.downloadAttachment },
}));
vi.mock("../hooks", () => ({
  useExpense: (id: number) => mocks.useExpense(id),
  useExpenseCategories: () => ({ data: [{ id: 3, name: "Ăn uống" }] }),
  useDeleteExpense: () => ({ mutate: mocks.deleteExpense, isPending: false }),
  useDeleteExpenseAttachment: () => ({ mutate: mocks.deleteAttachment, isPending: false }),
}));
vi.mock("./ExpenseFormModal", () => ({
  default: ({ isOpen, expense }: { isOpen: boolean; expense?: { title: string } }) =>
    isOpen ? <div role="dialog">Edit form {expense?.title}</div> : null,
}));

const expense = {
  id: 12,
  title: "Cơm trưa",
  amount: 50000,
  date: "2026-08-14",
  categoryId: 3,
  categoryName: "Ăn uống",
  note: "Cơm văn phòng",
  attachments: [{ id: 7, fileName: "bill.pdf", fileUrl: "/download" }],
};

describe("ExpenseDetailContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useExpense.mockReturnValue({
      data: expense,
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("không tải API với id không hợp lệ", () => {
    render(<ExpenseDetailContent expenseId={null} />);
    expect(screen.getByText("Invalid expense URL")).toBeInTheDocument();
    expect(mocks.useExpense).toHaveBeenCalledWith(0);
  });

  it("hiển thị trạng thái loading", () => {
    mocks.useExpense.mockReturnValue({ isLoading: true, refetch: mocks.refetch });
    render(<ExpenseDetailContent expenseId={12} />);
    expect(screen.getByLabelText("Loading expense details")).toBeInTheDocument();
  });

  it("hiển thị lỗi an toàn và cho thử lại", () => {
    mocks.useExpense.mockReturnValue({
      isLoading: false,
      isError: true,
      refetch: mocks.refetch,
    });
    render(<ExpenseDetailContent expenseId={12} />);
    expect(screen.getByText("you do not have access", { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });

  it("hiển thị đầy đủ thông tin và mở form sửa", () => {
    render(<ExpenseDetailContent expenseId={12} />);
    expect(mocks.useExpense).toHaveBeenCalledWith(12);
    expect(screen.getByText("Cơm trưa")).toBeInTheDocument();
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
    expect(screen.getByText("14/08/2026")).toBeInTheDocument();
    expect(screen.getByText("Ăn uống")).toBeInTheDocument();
    expect(screen.getByText("Cơm văn phòng")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit expense" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Edit form Cơm trưa");
  });

  it("hiển thị empty state khi không có ghi chú và attachment", () => {
    mocks.useExpense.mockReturnValue({
      data: { ...expense, note: "", attachments: [] },
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });
    render(<ExpenseDetailContent expenseId={12} />);
    expect(screen.getByText("No note")).toBeInTheDocument();
    expect(screen.getByText("This expense has no attachments.")).toBeInTheDocument();
  });

  it("tải attachment bằng Blob và mở tab mới", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const createObjectURL = vi.fn(() => "blob:bill");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    mocks.downloadAttachment.mockResolvedValue({ data: new Blob(["bill"]) });
    render(<ExpenseDetailContent expenseId={12} />);

    fireEvent.click(screen.getByRole("button", { name: "bill.pdf" }));
    await waitFor(() => {
      expect(mocks.downloadAttachment).toHaveBeenCalledWith(12, 7);
      expect(open).toHaveBeenCalledWith("blob:bill", "_blank", "noopener,noreferrer");
    });
  });

  it("không ẩn file khi xóa lỗi", () => {
    mocks.deleteAttachment.mockImplementation(
      (_variables: unknown, options: { onError: () => void }) => options.onError()
    );
    render(<ExpenseDetailContent expenseId={12} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete file bill.pdf" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete file" }));

    expect(mocks.deleteAttachment).toHaveBeenCalledWith(
      { expenseId: 12, attachmentId: 7 },
      expect.any(Object)
    );
    expect(screen.getAllByText("bill.pdf").length).toBeGreaterThan(0);
    expect(mocks.toastError).toHaveBeenCalledWith("Unable to delete the attachment");
  });

  it("chỉ xóa Expense sau khi xác nhận và điều hướng khi thành công", () => {
    mocks.deleteExpense.mockImplementation(
      (_id: number, options: { onSuccess: () => void }) => options.onSuccess()
    );
    render(<ExpenseDetailContent expenseId={12} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete expense" }));
    expect(mocks.deleteExpense).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "Delete expense" })[1]);

    expect(mocks.deleteExpense).toHaveBeenCalledWith(12, expect.any(Object));
    expect(mocks.replace).toHaveBeenCalledWith("/expenses");
  });
});
