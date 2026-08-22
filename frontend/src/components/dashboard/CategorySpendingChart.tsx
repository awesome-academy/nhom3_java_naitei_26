"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Card from "@/components/ui/Card";
import type { CategorySpending } from "@/features/dashboard/types";
import { AlertCircle, PieChart as PieChartIcon } from "lucide-react";

interface CategorySpendingChartProps {
  data?: CategorySpending[];
  isLoading: boolean;
  isError: boolean;
}

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#6B7280", // Gray
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function CategorySpendingChart({
  data = [],
  isLoading,
  isError,
}: CategorySpendingChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <PieChartIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-900">Cơ cấu chi tiêu</h2>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="h-40 w-40 animate-pulse rounded-full border-8 border-gray-100 border-t-indigo-500" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <PieChartIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-900">Cơ cấu chi tiêu</h2>
        </div>
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-red-500">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm font-medium">Không thể tải dữ liệu biểu đồ</p>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <PieChartIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-900">Cơ cấu chi tiêu</h2>
        </div>
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-400">
          <PieChartIcon className="h-10 w-10 stroke-[1.5]" />
          <p className="text-sm">Chưa có dữ liệu chi tiêu để hiển thị biểu đồ</p>
        </div>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: item.totalAmount,
    percentage: item.percentage,
    icon: item.categoryIcon,
  }));

  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-900">Cơ cấu chi tiêu</h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">Theo danh mục</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-5 items-center">
        {/* Donut Chart */}
        <div className="relative h-64 md:col-span-3 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-200 cursor-pointer focus:outline-none"
                    style={{
                      filter: activeIndex === index ? "brightness(1.1)" : "none",
                      transform: activeIndex === index ? "scale(1.03)" : "scale(1)",
                      transformOrigin: "center",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), "Số tiền"]}
                contentStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  border: "1px solid #E5E7EB",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Dynamic Value display */}
          <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
            {activeItem ? (
              <>
                <span className="text-xs font-medium text-gray-500 truncate max-w-[100px]">
                  {activeItem.name}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(activeItem.value)}
                </span>
                <span className="text-xs font-semibold text-indigo-600">
                  {activeItem.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-gray-400">Danh mục</span>
                <span className="text-base font-bold text-gray-700">{data.length}</span>
                <span className="text-[10px] text-gray-400">Đã ghi nhận</span>
              </>
            )}
          </div>
        </div>

        {/* Legend & Breakdown List */}
        <div className="md:col-span-2 space-y-3 max-h-64 overflow-y-auto pr-1">
          {chartData.map((item, index) => {
            const color = COLORS[index % COLORS.length];
            const isHovered = activeIndex === index;

            return (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
                  isHovered ? "bg-gray-50 ring-1 ring-gray-200" : "hover:bg-gray-50/60"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {item.icon ? `${item.icon} ` : ""}{item.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-gray-900">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-500">
                    {item.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
