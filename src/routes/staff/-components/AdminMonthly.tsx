import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useExpensesReport,
  useRevenueReport,
  type ExpensesReport,
  type RevenueReport,
} from "@/api/reportsApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";

const money = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const shortMoney = (value: number) =>
  `₦${new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;

const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString("en-NG", {
    month: "short",
  });

function ChartCard({
  title,
  description,
  controls,
  children,
}: {
  title: string;
  description: string;
  controls: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-base-content">{title}</h2>
          <p className="mt-0.5 text-xs text-base-content/60">{description}</p>
        </div>
        {controls}
      </div>
      <div className="mt-6 min-h-64 ">{children}</div>
    </section>
  );
}

function MonthlyTrend({
  revenue,
  expenses,
  year,
}: {
  revenue: RevenueReport;
  expenses: ExpensesReport;
  year: number;
}) {
  const current = new Date();
  const lastMonth = year === current.getFullYear() ? current.getMonth() : 11;
  const revenueByMonth = new Map(
    (revenue.monthly ?? []).map((item) => [item.month, item.total]),
  );
  const expensesByMonth = new Map(
    (expenses.monthly ?? []).map((item) => [item.month, item.total]),
  );
  const data = Array.from({ length: lastMonth + 1 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    return {
      month: monthLabel(month),
      income: revenueByMonth.get(month) ?? 0,
      expenses: expensesByMonth.get(month) ?? 0,
    };
  });
  const hasActivity = data.some((item) => item.income > 0 || item.expenses > 0);

  if (!hasActivity) {
    return (
      <div className="flex h-64 items-center justify-center text-center text-sm text-base-content/60">
        No paid income or expenses recorded for {year}.
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Monthly income and expense trend for ${year}`}
      className="h-64 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
        >
          <CartesianGrid
            stroke="var(--color-base-300)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--color-base-content)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={shortMoney}
            tick={{ fontSize: 11, fill: "var(--color-base-content)" }}
            width={62}
          />
          <Tooltip
            formatter={(value, name) => [
              money(Number(value) || 0),
              name === "income" ? "Income" : "Expenses",
            ]}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.14}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="var(--color-error)"
            fill="var(--color-error)"
            fillOpacity={0.08}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryPerformance({
  report,
  kind,
}: {
  report: RevenueReport | ExpensesReport;
  kind: "income" | "expenses";
}) {
  const data = (report.byCategory ?? [])
    .filter((category) => category.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((category) => ({
      name: category.name || "Uncategorized",
      total: category.total,
    }))
    .reverse();

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-center text-sm text-base-content/60">
        No {kind} categories recorded for this month.
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Top five ${kind} categories`}
      className="h-64 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            stroke="var(--color-base-300)"
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tickFormatter={shortMoney}
            tick={{ fontSize: 11, fill: "var(--color-base-content)" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            width={100}
            tick={{ fontSize: 11, fill: "var(--color-base-content)" }}
          />
          <Tooltip formatter={(value) => money(Number(value) || 0)} />
          <Bar
            dataKey="total"
            fill={
              kind === "income" ? "var(--color-primary)" : "var(--color-error)"
            }
            radius={[0, 4, 4, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TenantMonthly() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const month =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const categoryKind = "income";
  const selectedYear = Number(month.slice(0, 4));
  const selectedMonth = Number(month.slice(5, 7));
  const monthRange = {
    from: `${month}-01`,
    to: `${month}-${String(new Date(selectedYear, selectedMonth, 0).getDate()).padStart(2, "0")}`,
  };
  const yearlyRevenue = useRevenueReport({ year });
  const yearlyExpenses = useExpensesReport({ year });
  const monthlyRevenue = useRevenueReport(monthRange);
  const monthName = new Date(`${month}-01T00:00:00`).toLocaleDateString(
    "en-NG",
    {
      month: "long",
      year: "numeric",
    },
  );

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard
        title="Monthly cash flow trend"
        description={`Paid income and expenses in ${year}`}
        controls={
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-base-content/70 sm:inline-flex">
              <span className="size-2 rounded-full bg-primary" /> Income
              <span className="ml-2 size-2 rounded-full bg-error" /> Expenses
            </span>
            <select
              aria-label="Trend year"
              className="select select-bordered select-sm w-24"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {Array.from(
                { length: 5 },
                (_, index) => today.getFullYear() - index,
              ).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <QueryCompLayout query={yearlyRevenue}>
          {(revenue) => (
            <QueryCompLayout query={yearlyExpenses}>
              {(expenses) => (
                <MonthlyTrend
                  revenue={revenue}
                  expenses={expenses}
                  year={year}
                />
              )}
            </QueryCompLayout>
          )}
        </QueryCompLayout>
      </ChartCard>

      <ChartCard
        title="Category performance"
        description={`Income categories · ${monthName}`}
        controls={null}
      >
        <QueryCompLayout query={monthlyRevenue}>
          {(report) => (
            <CategoryPerformance report={report} kind={categoryKind} />
          )}
        </QueryCompLayout>
      </ChartCard>
    </div>
  );
}
