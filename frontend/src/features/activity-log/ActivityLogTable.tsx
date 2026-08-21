"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { useActivityLogs, useDeleteActivityLog } from "./hooks";
import type { ActivityLog } from "./types";

interface ActivityLogTableProps {
  /** Khi truyền vào, danh sách bị khoá theo user này và ẩn ô nhập userId. */
  userId?: string;
}

export default function ActivityLogTable({ userId }: ActivityLogTableProps) {
  const [page, setPage] = useState(0);
  const [userIdInput, setUserIdInput] = useState("");
  const [action, setAction] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const effectiveUserId = userId ?? (userIdInput.trim() || undefined);

  const { data, isLoading, isError } = useActivityLogs({
    page,
    size: 10,
    userId: effectiveUserId,
    action: action || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const deleteMutation = useDeleteActivityLog();

  const handleDelete = (log: ActivityLog) => {
    if (window.confirm(`Xoá nhật ký "${log.action}" của ${log.actorName}?`)) {
      deleteMutation.mutate(log.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {!userId && (
          <Input
            label="User ID"
            placeholder="Lọc theo id người dùng"
            value={userIdInput}
            onChange={(e) => {
              setPage(0);
              setUserIdInput(e.target.value);
            }}
          />
        )}
        <Input
          label="Hành động"
          placeholder="VD: CREATE_EXPENSE"
          value={action}
          onChange={(e) => {
            setPage(0);
            setAction(e.target.value);
          }}
        />
        <Input
          label="Từ ngày"
          type="date"
          value={fromDate}
          onChange={(e) => {
            setPage(0);
            setFromDate(e.target.value);
          }}
        />
        <Input
          label="Đến ngày"
          type="date"
          value={toDate}
          onChange={(e) => {
            setPage(0);
            setToDate(e.target.value);
          }}
        />
      </div>

      {isError && (
        <p className="text-sm text-red-600">Không thể tải nhật ký hoạt động.</p>
      )}
      {deleteMutation.isError && (
        <p className="text-sm text-red-600">Không thể xoá nhật ký. Vui lòng thử lại.</p>
      )}

      <Table<ActivityLog>
        isLoading={isLoading}
        emptyMessage="Không có nhật ký hoạt động nào"
        columns={[
          {
            key: "createdAt",
            label: "Thời gian",
            render: (log) => formatDate(log.createdAt, "dd/MM/yyyy HH:mm"),
          },
          {
            key: "actorName",
            label: "Người thực hiện",
            render: (log) => (
              <div>
                <div className="font-medium text-gray-900">{log.actorName}</div>
                <div className="text-xs text-gray-500">{log.actorEmail}</div>
                {log.userId === null && (
                  <div className="text-xs text-gray-400">(đã bị xoá)</div>
                )}
              </div>
            ),
          },
          { key: "action", label: "Hành động" },
          {
            key: "description",
            label: "Mô tả",
            render: (log) => log.description ?? "-",
          },
          {
            key: "id",
            label: "",
            className: "text-right",
            render: (log) => (
              <Button
                variant="ghost"
                size="sm"
                title="Xoá nhật ký"
                aria-label="Xoá nhật ký"
                disabled={deleteMutation.isPending}
                onClick={() => handleDelete(log)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            ),
          },
        ]}
        data={data?.items ?? []}
      />

      {data && (
        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
