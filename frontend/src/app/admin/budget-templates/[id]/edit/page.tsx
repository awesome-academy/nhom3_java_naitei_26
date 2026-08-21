import BudgetTemplateForm from "@/features/budget-template/BudgetTemplateForm";

export default async function EditBudgetTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Budget Template</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the template and its expense allocations.
        </p>
      </div>
      <BudgetTemplateForm mode="edit" id={id} />
    </div>
  );
}
