import { useState } from "react";
import { useDashboardIncomeExpense } from "@/api/tenantApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function IncomeExpense() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const query = useDashboardIncomeExpense(year);

  return (
    <div className="w-full bg-base-100 ring shadow-sm ring-base-300 rounded-box">
      <div className="p-4 text-lg font-semibold text-base-content/90 border-b border-base-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">Income & Expense</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="select select-bordered  ml-2"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>
        <div className="text-sm flex items-center gap-2">
          <span className="badge badge-soft badge-primary text-xs">Income</span>
          <span className="badge badge-soft badge-error text-xs">Expense</span>
        </div>
      </div>

      <div className="p-4">
        <QueryCompLayout query={query}>
          {(incomeExpenseData) => {
            const chartData = (incomeExpenseData.months || []).map(
              (month, idx) => ({
                name: month,
                income: incomeExpenseData.income?.[idx] ?? 0,
                expense: incomeExpenseData.expense?.[idx] ?? 0,
              }),
            );

            return (
              <AreaChart
                className="!text-sm bg-base-100"
                style={{
                  width: "100%",
                  maxHeight: "350px",
                  aspectRatio: 2.2,
                }}
                responsive
                data={chartData}
                margin={{
                  top: 20,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-base-300 opacity-60"
                />
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  className="text-xs text-base-content/60"
                />
                <YAxis
                  width={60}
                  stroke="currentColor"
                  className="text-xs text-base-content/60"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-base-100)",
                    borderColor: "var(--color-base-300)",
                    borderRadius: "0.5rem",
                    color: "var(--color-base-content)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#007047"
                  fill="#007047"
                  fillOpacity={0.25}
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.25}
                  name="Expense"
                />
              </AreaChart>
            );
          }}
        </QueryCompLayout>
      </div>
    </div>
  );
}
