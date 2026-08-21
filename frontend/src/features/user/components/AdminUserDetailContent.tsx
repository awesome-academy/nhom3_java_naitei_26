"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import ActivityLogTable from "@/features/activity-log/ActivityLogTable";
import { useUser } from "../hooks";

interface AdminUserDetailContentProps {
  userId: string;
}

export default function AdminUserDetailContent({ userId }: AdminUserDetailContentProps) {
  const { data: user, isLoading, isError } = useUser(userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users">
          <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">User ID: {userId}</p>
        </div>
      </div>

      <Card title="Thông tin người dùng">
        {isLoading && <Skeleton className="h-16 w-full" />}
        {isError && (
          <p className="text-sm text-gray-500">Không tải được thông tin người dùng.</p>
        )}
        {!isLoading && !isError && user && (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase text-gray-400">Tên</dt>
              <dd className="text-sm font-medium text-gray-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-400">Email</dt>
              <dd className="text-sm font-medium text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-400">Vai trò</dt>
              <dd className="text-sm font-medium text-gray-900">{user.role}</dd>
            </div>
          </dl>
        )}
      </Card>

      <Card title="Nhật ký hoạt động">
        <ActivityLogTable userId={userId} />
      </Card>
    </div>
  );
}
