import Card from "@/components/ui/Card";
import ActivityLogTable from "@/features/activity-log/ActivityLogTable";

export default function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nhật ký hoạt động</h1>
        <p className="text-sm text-gray-500 mt-1">Xem và xoá log hoạt động của hệ thống</p>
      </div>
      <Card>
        <ActivityLogTable />
      </Card>
    </div>
  );
}
