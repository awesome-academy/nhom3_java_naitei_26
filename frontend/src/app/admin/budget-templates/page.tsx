"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useBudgetTemplates, useDeleteBudgetTemplate } from "@/features/budget-template/hooks";
import { formatCurrency } from "@/lib/utils";

export default function AdminBudgetTemplatesPage() {
  const { data: templates, isLoading, isError } = useBudgetTemplates();
  const deleteMutation = useDeleteBudgetTemplate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#131b2e] md:text-3xl">
            System Budget Templates
          </h1>
          <p className="mt-1 text-sm text-[#515f74]">
            Preconfigured monthly budget allocations for users to quickly apply to their personal
            accounts
          </p>
        </div>
        <Link href="/admin/budget-templates/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Budget Template
          </Button>
        </Link>
      </div>

      {isLoading && <LoadingState />}

      {isError && (
        <Card>
          <div className="flex min-h-48 items-center justify-center text-sm text-red-600">
            Không thể tải danh sách mẫu ngân sách.
          </div>
        </Card>
      )}

      {deleteMutation.isError && (
        <p className="text-sm text-red-600">Không thể xóa mẫu ngân sách. Vui lòng thử lại.</p>
      )}

      {!isLoading && !isError && templates?.length === 0 && (
        <Card>
          <div className="flex min-h-48 items-center justify-center text-sm text-gray-500">
            Chưa có mẫu ngân sách nào.
          </div>
        </Card>
      )}

      {!isLoading && !isError && templates && templates.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const total = template.details.reduce((sum, detail) => sum + detail.amount, 0);

            return (
              <div
                key={template.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#004ac6]">
                      Budget Template
                    </span>
                    <span className="shrink-0 text-xs font-medium text-[#515f74]">
                      Month: {template.month}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[#131b2e]">{template.name}</h2>
                  <p className="mt-1 text-xs text-[#515f74]">
                    {template.details.length} default category allocation
                    {template.details.length === 1 ? "" : "s"} · Warning at{" "}
                    {template.warningPercentage}%
                  </p>

                  <div className="mt-4 space-y-2 border-t border-[#E2E8F0] pt-4 text-xs">
                    {template.details.length === 0 ? (
                      <p className="text-[#515f74]">No category allocations</p>
                    ) : (
                      template.details.slice(0, 4).map((detail) => (
                        <div key={detail.id} className="flex justify-between gap-4">
                          <span className="truncate text-[#515f74]">
                            {detail.categoryName ?? "Category"}:
                          </span>
                          <span className="shrink-0 font-mono font-semibold text-[#131b2e]">
                            {formatCurrency(detail.amount)}
                          </span>
                        </div>
                      ))
                    )}
                    {template.details.length > 4 && (
                      <p className="pt-1 text-[#515f74]">
                        +{template.details.length - 4} more allocations
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
                  <div>
                    <span className="block text-[11px] text-slate-400">Total Budget</span>
                    <span className="font-mono text-sm font-bold text-[#004ac6]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/budget-templates/${template.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={`Edit ${template.name}`}
                        aria-label={`Edit ${template.name}`}
                      >
                        <Pencil className="h-4 w-4 text-[#515f74]" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      title={`Delete ${template.name}`}
                      aria-label={`Delete ${template.name}`}
                      onClick={() => {
                        if (window.confirm(`Delete budget template "${template.name}"?`)) {
                          deleteMutation.mutate(template.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-[#515f74]" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </div>
  );
}
