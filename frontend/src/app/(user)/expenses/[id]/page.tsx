import ExpenseDetailContent from "@/features/expense/components/ExpenseDetailContent";

/**
 * Trang chi tiết Chi tiêu.
 */
export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expenseId = /^\d+$/.test(id) && Number(id) > 0 ? Number(id) : null;

  return <ExpenseDetailContent expenseId={expenseId} />;
}
