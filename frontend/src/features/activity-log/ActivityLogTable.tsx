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
  /** When provided, the list is locked to this user and the userId input is hidden. */
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
    if (window.confirm(`Delete the "${log.action}" log entry by ${log.actorName}?`)) {
      deleteMutation.mutate(log.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {!userId && (
          <Input
            label="User ID"
            placeholder="Filter by user id"
            value={userIdInput}
            onChange={(e) => {
              setPage(0);
              setUserIdInput(e.target.value);
            }}
          />
        )}
        <Input
          label="Action"
          placeholder="e.g. CREATE_EXPENSE"
          value={action}
          onChange={(e) => {
            setPage(0);
            setAction(e.target.value);
          }}
        />
        <Input
          label="From date"
          type="date"
          value={fromDate}
          onChange={(e) => {
            setPage(0);
            setFromDate(e.target.value);
          }}
        />
        <Input
          label="To date"
          type="date"
          value={toDate}
          onChange={(e) => {
            setPage(0);
            setToDate(e.target.value);
          }}
        />
      </div>

      {isError && (
        <p className="text-sm text-red-600">Unable to load activity logs.</p>
      )}
      {deleteMutation.isError && (
        <p className="text-sm text-red-600">Unable to delete the log entry. Please try again.</p>
      )}

      <Table<ActivityLog>
        isLoading={isLoading}
        emptyMessage="No activity logs found"
        columns={[
          {
            key: "createdAt",
            label: "Time",
            render: (log) => formatDate(log.createdAt, "dd/MM/yyyy HH:mm"),
          },
          {
            key: "actorName",
            label: "Actor",
            render: (log) => (
              <div>
                <div className="font-medium text-gray-900">{log.actorName}</div>
                <div className="text-xs text-gray-500">{log.actorEmail}</div>
                {log.userId === null && (
                  <div className="text-xs text-gray-400">(deleted)</div>
                )}
              </div>
            ),
          },
          { key: "action", label: "Action" },
          {
            key: "description",
            label: "Description",
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
                title="Delete log entry"
                aria-label="Delete log entry"
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
