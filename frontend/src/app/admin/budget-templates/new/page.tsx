import BudgetTemplateForm from "@/features/budget-template/BudgetTemplateForm";

export default function NewBudgetTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Budget Template</h1>
        <p className="mt-1 text-sm text-gray-500">Create a reusable expense allocation template.</p>
      </div>
      <BudgetTemplateForm mode="create" />
    </div>
  );
}
