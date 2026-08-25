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
          <h1 className="text-2xl font-bold text-gray-900">User Detail</h1>
          <p className="text-sm text-gray-500 mt-1">User ID: {userId}</p>
        </div>
      </div>

      <Card title="User Information">
        {isLoading && <Skeleton className="h-16 w-full" />}
        {isError && (
          <p className="text-sm text-gray-500">Unable to load user information.</p>
        )}
        {!isLoading && !isError && user && (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase text-gray-400">Name</dt>
              <dd className="text-sm font-medium text-gray-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-400">Email</dt>
              <dd className="text-sm font-medium text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-400">Role</dt>
              <dd className="text-sm font-medium text-gray-900">{user.role}</dd>
            </div>
          </dl>
        )}
      </Card>

      <Card title="Activity Log">
        <ActivityLogTable userId={userId} />
      </Card>
    </div>
  );
}
