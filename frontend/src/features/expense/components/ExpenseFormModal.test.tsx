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

const categories = [{ id: 3, name: "Ăn uống" }];

describe("ExpenseFormModal", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("validate các field bắt buộc", async () => {
    render(<ExpenseFormModal isOpen categories={categories} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Tạo khoản chi" }));

    expect(await screen.findByText("Tên khoản chi không được để trống")).toBeInTheDocument();
    expect(screen.getByText("Số tiền không được để trống")).toBeInTheDocument();
    expect(screen.getByText("Ngày chi không được để trống")).toBeInTheDocument();
    expect(screen.getByText("Danh mục không được để trống")).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it("submit create đúng data và file", async () => {
    render(<ExpenseFormModal isOpen categories={categories} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Tên khoản chi"), {
      target: { value: "Cơm trưa" },
    });
    fireEvent.change(screen.getByLabelText("Số tiền"), { target: { value: "50000" } });
    fireEvent.change(screen.getByLabelText("Ngày chi"), { target: { value: "2026-08-14" } });
    fireEvent.change(screen.getByLabelText("Danh mục"), { target: { value: "3" } });
    const file = new File(["bill"], "bill.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("File đính kèm"), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Tạo khoản chi" }));

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
    expect(screen.getByLabelText("Tên khoản chi")).toHaveValue("Cơm trưa");

    const file = new File(["bill"], "bill.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Thêm file mới"), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(await screen.findByText("Chỉ có thể thêm tối đa 0 file")).toBeInTheDocument();
    expect(updateMutate).not.toHaveBeenCalled();
  });

  it("báo file không hợp lệ ngay khi chọn và không submit", async () => {
    render(<ExpenseFormModal isOpen categories={categories} onClose={vi.fn()} />);
    const invalidFile = new File(["script"], "script.exe", {
      type: "application/octet-stream",
    });

    fireEvent.change(screen.getByLabelText("File đính kèm"), {
      target: { files: [invalidFile] },
    });

    expect(
      await screen.findByText("File đính kèm chỉ hỗ trợ JPEG, PNG hoặc PDF")
    ).toBeInTheDocument();
    expect(screen.getByText("script.exe")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tạo khoản chi" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Xóa file bill.pdf" }));
    const confirmDialog = screen.getByRole("alertdialog");
    expect(confirmDialog).toBeInTheDocument();
    expect(screen.getByText("Xóa file đính kèm?")).toBeInTheDocument();
    expect(within(confirmDialog).getByText("bill.pdf")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xóa file" }));
    expect(deleteAttachmentMutate).toHaveBeenCalledWith(
      { expenseId: 12, attachmentId: 7 },
      expect.any(Object)
    );
  });
});
