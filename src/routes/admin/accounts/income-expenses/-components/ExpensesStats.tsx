import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import type { IncomeRecord, ExpenseRecord } from "@/api/financeApi";
import StatCard, { type StatVariant } from "@/components/StatCard";

interface ExpensesStatProps {
  incomeList?: IncomeRecord[];
  expenseList?: ExpenseRecord[];
}

export default function ExpensesStat({
  incomeList = [],
  expenseList = [],
}: ExpensesStatProps) {
  const totalIncome = incomeList.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const totalExpense = expenseList.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const netBalance = totalIncome - totalExpense;

  const stats: Array<{ title: string; value: string; desc: string; icon: React.ReactNode; variant: StatVariant }> = [
    {
      title: "Net Balance",
      value: `₦${netBalance.toLocaleString()}`,
      desc: "Net cash position",
      icon: <Wallet className="size-6" />,
      variant: netBalance >= 0 ? "primary" : "error",
    },
    {
      title: "Total Income",
      value: `₦${totalIncome.toLocaleString()}`,
      desc: `${incomeList.length} records recorded`,
      icon: <TrendingUp className="size-6" />,
      variant: "success",
    },
    {
      title: "Total Expenses",
      value: `₦${totalExpense.toLocaleString()}`,
      desc: `${expenseList.length} expenses tracked`,
      icon: <TrendingDown className="size-6" />,
      variant: "error",
    },
    {
      title: "Net Cashflow",
      value:
        netBalance >= 0
          ? `+₦${netBalance.toLocaleString()}`
          : `-₦${Math.abs(netBalance).toLocaleString()}`,
      desc: netBalance >= 0 ? "Operating surplus" : "Operating deficit",
      icon: <PiggyBank className="size-6" />,
      variant: "info",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          desc={stat.desc}
          icon={stat.icon}
          variant={stat.variant}
        />
      ))}
    </div>
  );
}
