import SimpleContainer from "@/components/SimpleContainer";
import { useProfitLossReport } from "@/api/reportsApi";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

interface ProfitLossTabProps {
  from: string;
  to: string;
}

export default function ProfitLossTab({ from, to }: ProfitLossTabProps) {
  const { data: plReport, isLoading } = useProfitLossReport({ from, to });

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <>
          {/* P&L Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-base-100 border border-base-200 p-6 shadow-xs">
              <div className="flex items-center justify-between text-base-content/60 text-xs font-semibold uppercase">
                <span>Total Income</span>
                <ArrowUpRight className="size-4 text-success" />
              </div>
              <div className="text-3xl font-bold mt-2 text-success font-mono">
                ₦{(plReport?.incomeTotal || 0).toLocaleString()}
              </div>
              <div className="text-xs text-base-content/50 mt-1">
                Recorded revenue entries
              </div>
            </div>

            <div className="card bg-base-100 border border-base-200 p-6 shadow-xs">
              <div className="flex items-center justify-between text-base-content/60 text-xs font-semibold uppercase">
                <span>Total Expenses</span>
                <ArrowDownRight className="size-4 text-error" />
              </div>
              <div className="text-3xl font-bold mt-2 text-error font-mono">
                ₦{(plReport?.expenseTotal || 0).toLocaleString()}
              </div>
              <div className="text-xs text-base-content/50 mt-1">
                Operational expenditures
              </div>
            </div>

            <div className="card bg-base-100 border border-base-200 p-6 shadow-xs">
              <div className="flex items-center justify-between text-base-content/60 text-xs font-semibold uppercase">
                <span>Net Profit</span>
                <TrendingUp className="size-4 text-primary" />
              </div>
              <div
                className={`text-3xl font-bold mt-2 font-mono ${
                  (plReport?.profit || 0) >= 0 ? "text-primary" : "text-error"
                }`}
              >
                ₦{(plReport?.profit || 0).toLocaleString()}
              </div>
              <div className="text-xs text-base-content/50 mt-1">
                Net cash margin for selected period
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <SimpleContainer title="Monthly Financial Trend">
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Income (₦)</th>
                    <th>Expenses (₦)</th>
                    <th>Net Profit (₦)</th>
                    <th>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {(plReport?.monthly || []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-base-content/60"
                      >
                        No monthly transactions recorded for this date range.
                      </td>
                    </tr>
                  ) : (
                    plReport?.monthly?.map((row, idx) => {
                      const margin =
                        row.income > 0
                          ? ((row.profit / row.income) * 100).toFixed(1)
                          : "0.0";
                      return (
                        <tr key={idx} className="hover">
                          <td className="font-semibold text-base-content">
                            {row.month}
                          </td>
                          <td className="font-mono text-success">
                            +₦{row.income.toLocaleString()}
                          </td>
                          <td className="font-mono text-error">
                            -₦{row.expenses.toLocaleString()}
                          </td>
                          <td
                            className={`font-mono font-bold ${
                              row.profit >= 0 ? "text-primary" : "text-error"
                            }`}
                          >
                            ₦{row.profit.toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`badge badge-sm ${
                                Number(margin) >= 0
                                  ? "badge-success/20 text-success"
                                  : "badge-error/20 text-error"
                              }`}
                            >
                              {margin}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </SimpleContainer>
        </>
      )}
    </div>
  );
}
