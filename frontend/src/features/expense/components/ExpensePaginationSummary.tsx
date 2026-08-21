interface ExpensePaginationSummaryProps {
  page: number;
  size: number;
  itemCount: number;
  totalItems: number;
}

export default function ExpensePaginationSummary({
  page,
  size,
  itemCount,
  totalItems,
}: ExpensePaginationSummaryProps) {
  if (totalItems === 0) {
    return <span>Hiển thị 0 trên tổng 0 khoản chi</span>;
  }

  const firstItem = page * size + 1;
  const lastItem = firstItem + itemCount - 1;

  return (
    <span>
      Hiển thị{" "}
      <strong>
        {firstItem}–{lastItem}
      </strong>{" "}
      trên tổng <strong>{totalItems}</strong> khoản chi
    </span>
  );
}
