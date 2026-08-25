import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ExpenseFormModal from "./ExpenseFormModal";

const createMutate = vi.fn();
const updateMutate = vi.fn();
const deleteAttachmentMutate = vi.fn();
const { downloadAttachment } = vi.hoisted(() => ({ downloadAttachment: vi.fn() }));

vi.mock("../hooks", () => ({
  useCreateExpense: () => ({ mutate: createMutate, isPending: false }),
  useUpdateExpense: () => ({ mutate: updateMutate, isPending: false }),
  useDeleteExpenseAttachment: () => ({ mutate: deleteAttachmentMutate, isPending: false }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../api", () => ({
  expenseApi: { downloadAttachment },
}));

const categories = [{ id: 3, name: "Ăn uống", icon: "restaurant" }];

describe("ExpenseFormModal", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("validate các field bắt buộc", async () => {
    render(<ExpenseFormModal isOpen categories={categories} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Create expense" }));

    expect(await screen.findByText("Expense title is required")).toBeInTheDocument();
    expect(screen.getByText("Amount is required")).toBeInTheDocument();
    expect(screen.getByText("Date is required")).toBeInTheDocument();
    expect(screen.getByText("Category is required")).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it("submit create đúng data và file", async () => {
    render(<ExpenseFormModal isOpen categories={categories} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Expense title"), {
      target: { value: "Cơm trưa" },
    });
    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "50000" } });
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-08-14" } });
    fireEvent.click(screen.getByRole("combobox", { name: "Category" }));
    fireEvent.click(screen.getByRole("button", { name: "Ăn uống" }));
    const file = new File(["bill"], "bill.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Attachments"), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Create expense" }));

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        {
          data: {
            title: "Cơm trưa",
            amount: 50000,
            date: "2026-08-14",
            categoryId: 3,
            note: undefined,
          },
          files: [file],
        },
        expect.any(Object)
      );
    });
  });

  it("prefill edit và chặn file vượt giới hạn cộng dồn", async () => {
    render(
      <ExpenseFormModal
        isOpen
        categories={categories}
        expense={{
          id: 12,
          title: "Cơm trưa",
          amount: 50000,
          date: "2026-08-14",
          categoryId: 3,
          categoryName: "Ăn uống",
          attachments: Array.from({ length: 5 }, (_, index) => ({
            id: index,
            fileName: `${index}.pdf`,
            fileUrl: `/files/${index}`,
          })),
        }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Expense title")).toHaveValue("Cơm trưa");

    const file = new File(["bill"], "bill.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Add new attachments"), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("You can add up to 0 more files")).toBeInTheDocument();
    expect(updateMutate).not.toHaveBeenCalled();
  });

  it("báo file không hợp lệ ngay khi chọn và không submit", async () => {
    render(<ExpenseFormModal isOpen categories={categories} onClose={vi.fn()} />);
    const invalidFile = new File(["script"], "script.exe", {
      type: "application/octet-stream",
    });

    fireEvent.change(screen.getByLabelText("Attachments"), {
      target: { files: [invalidFile] },
    });

    expect(
      await screen.findByText("Attachments must be JPEG, PNG, or PDF files")
    ).toBeInTheDocument();
    expect(screen.getByText("script.exe")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create expense" }));
    expect(createMutate).not.toHaveBeenCalled();
  });

  it("hiển thị file hiện có, cho xem và xác nhận xóa", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    });
    downloadAttachment.mockResolvedValue({ data: new Blob(["bill"]) });
    render(
      <ExpenseFormModal
        isOpen
        categories={categories}
        expense={{
          id: 12,
          title: "Cơm trưa",
          amount: 50000,
          date: "2026-08-14",
          categoryId: 3,
          categoryName: "Ăn uống",
          attachments: [{ id: 7, fileName: "bill.pdf", fileUrl: "/download" }],
        }}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "bill.pdf" }));
    await waitFor(() =>
      expect(open).toHaveBeenCalledWith("blob:preview", "_blank", "noopener,noreferrer")
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete file bill.pdf" }));
    const confirmDialog = screen.getByRole("alertdialog");
    expect(confirmDialog).toBeInTheDocument();
    expect(screen.getByText("Delete attachment?")).toBeInTheDocument();
    expect(within(confirmDialog).getByText("bill.pdf")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete file" }));
    expect(deleteAttachmentMutate).toHaveBeenCalledWith(
      { expenseId: 12, attachmentId: 7 },
      expect.any(Object)
    );
  });
});
