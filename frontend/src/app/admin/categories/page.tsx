import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-sm text-gray-500 mt-1">CRUD expense categories</p>
        </div>
        <Button><Plus className="h-4 w-4" />Add Category</Button>
      </div>
      <Card>
        <div className="flex h-64 items-center justify-center text-gray-400">
          Category Management page is under construction
        </div>
      </Card>
    </div>
  );
}
