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
    return <span>Showing 0 of 0 expenses</span>;
  }

  const firstItem = page * size + 1;
  const lastItem = firstItem + itemCount - 1;

  return (
    <span>
      Showing{" "}
      <strong>
        {firstItem}–{lastItem}
      </strong>{" "}
      of <strong>{totalItems}</strong> expenses
    </span>
  );
}
