import SimpleContainer from "@/components/SimpleContainer";
import { Cell, Pie, PieChart, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboardBalance } from "@/api/tenantApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function TenantMonthly() {
  const query = useDashboardBalance();

  return (
    <QueryCompLayout query={query}>
      {(balanceData) => {
        const total = balanceData?.totalBalance ?? 0;
        const incomeMonth = balanceData?.incomeThisMonth ?? 0;
        const expenseMonth = balanceData?.expenseThisMonth ?? 0;

        const balanceDetails = [
          {
            label: "Income Today",
            value: balanceData?.incomeToday ?? 0,
            type: "income",
            icon: TrendingUp,
          },
          {
            label: "Expense Today",
            value: balanceData?.expenseToday ?? 0,
            type: "expense",
            icon: TrendingDown,
          },
          {
            label: "Income This Month",
            value: incomeMonth,
            type: "income",
            icon: TrendingUp,
          },
          {
            label: "Expense This Month",
            value: expenseMonth,
            type: "expense",
            icon: TrendingDown,
          },
        ];

        const chartData = [
          {
            name: "Income",
            value: incomeMonth > 0 ? incomeMonth : 1,
            color: "#007047",
            badge: "badge-primary",
            actual: incomeMonth,
          },
          {
            name: "Expense",
            value: expenseMonth > 0 ? expenseMonth : incomeMonth > 0 ? 0 : 1,
            color: "#ef4444",
            badge: "badge-error",
            actual: expenseMonth,
          },
        ];

        const hasActivity = incomeMonth > 0 || expenseMonth > 0;

        return (
          <div className="grid md:grid-cols-2 gap-6">
            <SimpleContainer fade title="Income vs Expense (This Month)">
              <div className="bg-base-100 border border-base-200 rounded-b-box p-6 flex flex-col items-center justify-center min-h-[360px] relative">
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="badge badge-soft badge-primary text-xs">
                    Income: ${incomeMonth.toLocaleString()}
                  </span>
                  <span className="badge badge-soft badge-error text-xs">
                    Expense: ${expenseMonth.toLocaleString()}
                  </span>
                </div>

                {hasActivity ? (
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          paddingAngle={4}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(_value: any, name: any, item: any) => [
                            `$${(item?.payload?.actual ?? 0).toLocaleString()}`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "var(--color-base-100)",
                            borderColor: "var(--color-base-300)",
                            borderRadius: "0.5rem",
                            color: "var(--color-base-content)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-2">
                    <div className="p-3 bg-base-200 rounded-full w-fit mx-auto text-base-content/40">
                      <DollarSign className="size-8" />
                    </div>
                    <p className="text-sm font-semibold text-base-content/70">
                      No financial activity recorded this month
                    </p>
                    <p className="text-xs text-base-content/50">
                      Income and expenses recorded this month will appear here.
                    </p>
                  </div>
                )}
              </div>
            </SimpleContainer>

            <SimpleContainer fade title="Business Cash Flow & Balance">
              <div className="bg-base-100 border border-base-200 rounded-b-box p-6 flex flex-col justify-between min-h-[360px]">
                <div className="text-center py-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                    Total Operating Balance
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-semibold mt-1 text-primary">
                    $
                    {total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {balanceDetails.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={index}
                        className="flex flex-col p-4 bg-base-200/50 rounded-xl border border-base-200 hover:border-base-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-base-content/60 font-medium">
                            {item.label}
                          </span>
                          <Icon
                            className={`size-4 ${
                              item.type === "income"
                                ? "text-success"
                                : "text-error"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-xl font-semibold mt-2 ${
                            item.type === "income"
                              ? "text-success"
                              : "text-error"
                          }`}
                        >
                          $
                          {item.value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SimpleContainer>
          </div>
        );
      }}
    </QueryCompLayout>
  );
}
