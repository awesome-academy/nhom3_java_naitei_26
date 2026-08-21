import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ExpensesPage from "./page";

const push = vi.fn();
const refetch = vi.fn();
const useExpensesMock = vi.fn();
const useExpenseCategoriesMock = vi.fn();
const createMutate = vi.fn();
const updateMutate = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/features/expense/hooks", () => ({
  useExpenses: (filter: unknown, enabled: boolean) => useExpensesMock(filter, enabled),
  useExpenseCategories: () => useExpenseCategoriesMock(),
  useExpense: () => ({ data: undefined, isLoading: false }),
  useCreateExpense: () => ({ mutate: createMutate, isPending: false }),
  useUpdateExpense: () => ({ mutate: updateMutate, isPending: false }),
  useDeleteExpenseAttachment: () => ({ mutate: vi.fn(), isPending: false }),
}));

const expense = {
  id: 12,
  title: "Cơm trưa",
  amount: 50000,
  date: "2026-08-14",
  categoryId: 3,
  categoryName: "Ăn uống",
};

describe("ExpensesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useExpenseCategoriesMock.mockReturnValue({ data: [], isError: true });
  });

  afterEach(() => vi.useRealTimers());

  it("gọi hook với page 0, size 10, sort mặc định và hiển thị loading", () => {
    useExpensesMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch,
    });

    render(<ExpensesPage />);

    expect(useExpensesMock).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, size: 10, sort: "date,desc" }),
      true
    );
    expect(screen.getByLabelText("Đang tải danh sách chi tiêu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thêm chi tiêu/i })).toBeEnabled();
  });

  it("hiển thị lỗi và cho phép thử lại", () => {
    useExpensesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch,
    });

    render(<ExpensesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));

    expect(screen.getByText("Không thể tải danh sách chi tiêu")).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("hiển thị empty state", () => {
    useExpensesMock.mockReturnValue({
      data: { items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch,
    });

    render(<ExpensesPage />);

    expect(screen.getByText("Chưa có khoản chi tiêu nào")).toBeInTheDocument();
    expect(screen.getByText("Hiển thị 0 trên tổng 0 khoản chi")).toBeInTheDocument();
  });

  it("render dữ liệu, phân trang 0-based và điều hướng khi click row", async () => {
    useExpensesMock.mockImplementation((filter: { page: number }) => ({
      data: {
        items: [expense],
        page: filter.page,
        size: 10,
        totalItems: 11,
        totalPages: 2,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch,
    }));

    render(<ExpensesPage />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(useExpensesMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, size: 10, sort: "date,desc" }),
        true
      );
    });

    fireEvent.click(screen.getByText("Cơm trưa"));
    expect(push).toHaveBeenCalledWith("/expenses/12");
  });

  it("mở modal sửa từ nút thao tác của row", () => {
    useExpensesMock.mockReturnValue({
      data: { items: [expense], page: 0, size: 10, totalItems: 1, totalPages: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch,
    });

    render(<ExpensesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Sửa Cơm trưa" }));

    expect(screen.getByRole("heading", { name: "Sửa khoản chi" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên khoản chi")).toHaveValue("Cơm trưa");
    expect(push).not.toHaveBeenCalled();
  });

  it("debounce search, trim query và reset pagination về page 0", async () => {
    vi.useFakeTimers();
    useExpensesMock.mockImplementation((filter: { page: number }) => ({
      data: { items: [expense], page: filter.page, size: 10, totalItems: 11, totalPages: 2 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch,
    }));

    render(<ExpensesPage />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.change(screen.getByLabelText("Tìm theo tên khoản chi"), {
      target: { value: "  cơm  " },
    });

    expect(useExpensesMock).not.toHaveBeenLastCalledWith(
      expect.objectContaining({ search: "cơm" }),
      true
    );
    act(() => vi.advanceTimersByTime(300));

    expect(useExpensesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, search: "cơm" }),
      true
    );
  });

  it("gửi đúng filter và không gửi userId", () => {
    useExpensesMock.mockReturnValue({
      data: { items: [expense], page: 0, size: 10, totalItems: 1, totalPages: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch,
    });
    render(<ExpensesPage />);

    fireEvent.change(screen.getByLabelText("Danh mục"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Từ ngày"), { target: { value: "2026-08-01" } });
    fireEvent.change(screen.getByLabelText("Đến ngày"), { target: { value: "2026-08-31" } });
    fireEvent.change(screen.getByLabelText("Số tiền tối thiểu"), { target: { value: "10000" } });
    fireEvent.change(screen.getByLabelText("Số tiền tối đa"), { target: { value: "200000" } });

    const lastFilter = useExpensesMock.mock.lastCall?.[0];
    expect(lastFilter).toBeDefined();
    expect(lastFilter).toEqual(
      expect.objectContaining({
        page: 0,
        categoryId: 3,
        fromDate: "2026-08-01",
        toDate: "2026-08-31",
        minAmount: 10000,
        maxAmount: 200000,
      })
    );
    expect(lastFilter).not.toHaveProperty("userId");
  });

  it("không bật request khi khoảng lọc không hợp lệ và reset được filter", () => {
    useExpensesMock.mockReturnValue({
      data: { items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch,
    });
    render(<ExpensesPage />);

    fireEvent.change(screen.getByLabelText("Từ ngày"), { target: { value: "2026-08-20" } });
    fireEvent.change(screen.getByLabelText("Đến ngày"), { target: { value: "2026-08-01" } });
    expect(screen.getByText("Ngày bắt đầu không được sau ngày kết thúc")).toBeInTheDocument();
    expect(useExpensesMock.mock.lastCall?.[1]).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
    expect(screen.getByLabelText("Từ ngày")).toHaveValue("");
    expect(useExpensesMock.mock.lastCall?.[1]).toBe(true);
  });
});
