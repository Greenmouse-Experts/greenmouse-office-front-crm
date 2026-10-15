import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useIncomeRecords, useExpenseRecords } from "@/api/financeApi";

export default function ExpensesStat() {
  const { data: incomeList = [] } = useIncomeRecords();
  const { data: expenseList = [] } = useExpenseRecords();

  const totalIncome = incomeList.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0,
  );
  const totalExpense = expenseList.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0,
  );
  const netProfit = totalIncome - totalExpense;

  const data = [
    {
      title: "Net Balance",
      value: netProfit,
      icon: Wallet,
      colorClass: netProfit >= 0 ? "border-l-primary" : "border-l-error",
      textColor: netProfit >= 0 ? "text-primary" : "text-error",
    },
    {
      title: "Total Income",
      value: totalIncome,
      icon: TrendingUp,
      colorClass: "border-l-success",
      textColor: "text-success",
    },
    {
      title: "Total Expenses",
      value: totalExpense,
      icon: TrendingDown,
      colorClass: "border-l-error",
      textColor: "text-error",
    },
    {
      title: "Operating Margin",
      value:
        totalIncome > 0
          ? `${((netProfit / totalIncome) * 100).toFixed(1)}%`
          : "0%",
      icon: PiggyBank,
      colorClass: "border-l-info",
      textColor: "text-info",
      isRaw: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.title}
            className={`card bg-base-100 shadow-sm rounded-xl overflow-hidden border-l-4 ${item.colorClass} transition-all duration-300 hover:shadow-md`}
          >
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-base-content/70">
                <IconComponent className={`size-5 ${item.textColor}`} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {item.title}
                </span>
              </div>
              <span className={`text-2xl font-semibold mt-1 text-base-content`}>
                {item.isRaw
                  ? item.value
                  : `$${Number(item.value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
