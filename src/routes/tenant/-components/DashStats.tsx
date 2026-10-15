import { useIncomeRecords, useExpenseRecords } from "@/api/financeApi";
import { Link } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, ArrowRight, DollarSign } from "lucide-react";

export default function DashStats() {
  const { data: incomeList = [], isLoading: incomeLoading } =
    useIncomeRecords();
  const { data: expenseList = [], isLoading: expenseLoading } =
    useExpenseRecords();

  const recentIncome = incomeList.slice(0, 5);
  const recentExpenses = expenseList.slice(0, 5);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Recent Income Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="p-4 border-b border-base-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-success/10 text-success">
              <TrendingUp className="size-4" />
            </div>
            <h3 className="font-semibold text-base text-base-content">
              Recent Income
            </h3>
          </div>
          <Link
            to="/tenant/accounts/income-expenses"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="p-3">
          {incomeLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <div className="skeleton size-9 rounded-full shrink-0" />
                    <div className="space-y-1">
                      <div className="skeleton h-4 w-28" />
                      <div className="skeleton h-3 w-16" />
                    </div>
                  </div>
                  <div className="skeleton h-4 w-16" />
                </div>
              ))}
            </div>
          ) : recentIncome.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="p-2.5 bg-base-200 rounded-full w-fit mx-auto text-base-content/40">
                <DollarSign className="size-5" />
              </div>
              <p className="text-xs font-medium text-base-content/60">
                No income records yet
              </p>
              <Link
                to="/tenant/accounts/income-expenses"
                className="btn btn-xs btn-outline btn-primary"
              >
                Record Income
              </Link>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {recentIncome.map((item) => {
                const dateStr =
                  item.date || item.createdAt
                    ? new Date(
                        item.date || item.createdAt!,
                      ).toLocaleDateString()
                    : "Recent";
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-base-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                        <TrendingUp className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-base-content">
                          {item.source || item.category?.name || "Income"}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {dateStr}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-sm font-semibold text-success">
                        +$
                        {item.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      {item.status && (
                        <p className="text-[10px] text-base-content/50 uppercase font-medium">
                          {item.status}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Expenses Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="p-4 border-b border-base-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-error/10 text-error">
              <TrendingDown className="size-4" />
            </div>
            <h3 className="font-semibold text-base text-base-content">
              Recent Expenses
            </h3>
          </div>
          <Link
            to="/tenant/accounts/income-expenses"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="p-3">
          {expenseLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <div className="skeleton size-9 rounded-full shrink-0" />
                    <div className="space-y-1">
                      <div className="skeleton h-4 w-28" />
                      <div className="skeleton h-3 w-16" />
                    </div>
                  </div>
                  <div className="skeleton h-4 w-16" />
                </div>
              ))}
            </div>
          ) : recentExpenses.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="p-2.5 bg-base-200 rounded-full w-fit mx-auto text-base-content/40">
                <DollarSign className="size-5" />
              </div>
              <p className="text-xs font-medium text-base-content/60">
                No expense records yet
              </p>
              <Link
                to="/tenant/accounts/income-expenses"
                className="btn btn-xs btn-outline btn-error"
              >
                Record Expense
              </Link>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {recentExpenses.map((item) => {
                const dateStr =
                  item.date || item.createdAt
                    ? new Date(
                        item.date || item.createdAt!,
                      ).toLocaleDateString()
                    : "Recent";
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-base-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                        <TrendingDown className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-base-content">
                          {item.paidTo || item.category?.name || "Expense"}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {dateStr}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-sm font-semibold text-error">
                        -$
                        {item.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      {item.status && (
                        <p className="text-[10px] text-base-content/50 uppercase font-medium">
                          {item.status}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
