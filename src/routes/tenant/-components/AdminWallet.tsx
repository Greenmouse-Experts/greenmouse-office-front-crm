import { ArrowBigDown, ArrowBigUp, EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

export default function AdminWallet() {
  const recentTransactions = [
    {
      id: 1,
      type: "income",
      description: "Freelance Project",
      amount: "1,200.00",
      date: "2023-10-26",
    },
    {
      id: 2,
      type: "expense",
      description: "Rent Payment",
      amount: "1,500.00",
      date: "2023-10-26",
    },
    {
      id: 3,
      type: "income",
      description: "Investment Dividend",
      amount: "500.00",
      date: "2023-10-25",
    },
    {
      id: 4,
      type: "expense",
      description: "Groceries",
      amount: "150.00",
      date: "2023-10-25",
    },
    {
      id: 5,
      type: "income",
      description: "Consulting Fee",
      amount: "2,500.00",
      date: "2023-10-24",
    },
  ];
  const [showBalance, setShowBalance] = useState(false);

  return (
    <div className="p-6 bg-base-100 shadow rounded-box space-y-8">
      <h2 className="font-semibold text-sm">Wallet</h2>
      <div className="bg-linear-30 from-primary to-secondary space-y-4 p-4 text-white rounded-box">
        <div className="flex items-center">
          <p className="text-md font-semibold">Total Balance</p>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="btn btn-ghost btn-circle ml-auto"
          >
            {showBalance ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        <div>
          {showBalance ? (
            <h2 className="text-xl font-semibold">3,500,000</h2>
          ) : (
            <h2 className="text-xl font-semibold">********</h2>
          )}
        </div>
      </div>
      <section className="grid grid-cols-2 gap-2">
        <div className="flex gap-2 items-center">
          <div className="badge badge-success btn-circle badge-soft size-auto p-2">
            <ArrowBigUp className="text-success" />
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-success text-xs">Income</h2>
            <p className="text-xs font-semibold">7,200,3455</p>
          </div>
        </div>
        <div className="flex gap-2 items-center justify-items-end justify-end">
          <div className="badge badge-error btn-circle badge-soft size-auto p-2">
            <ArrowBigDown className="text-error" />
          </div>
          <div className=" space-y-1">
            <h2 className="text-error text-xs">Expense</h2>
            <p className="text-xs font-semibold">7,200,3455</p>
          </div>
        </div>
      </section>
      <div className="space-y-2">
        <p className="text-sm text-current/60 font-semibold">Recents</p>
        <div className="space-y-2">
          {recentTransactions
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .map((item) => (
              <RecentTransactionCard
                key={item.id}
                //@ts-ignore
                type={item.type}
                description={item.description}
                amount={item.amount}
                date={item.date}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

const RecentTransactionCard = ({
  type,
  description,
  amount,
  date,
}: {
  type: "income" | "expense";
  description: string;
  amount: string;
  date: string;
}) => {
  const isIncome = type === "income";
  const iconClass = isIncome ? "text-success" : "text-error";
  const badgeClass = isIncome ? "badge-success" : "badge-error";
  const amountClass = isIncome ? "text-success" : "text-error";
  const amountPrefix = isIncome ? "+" : "-";
  const IconComponent = isIncome ? ArrowBigUp : ArrowBigDown;

  return (
    <div className="flex items-center justify-between p-3 bg-base-200 rounded-box">
      <div className="flex items-center gap-3">
        <div
          className={`badge ${badgeClass} btn-circle badge-soft size-auto p-2`}
        >
          <IconComponent className={`${iconClass} w-4 h-4`} />
        </div>
        <div>
          <p className="text-xs font-medium">{description}</p>
          <p className="text-xs text-base-content/70">{date}</p>
        </div>
      </div>
      <p className={`text-sm font-semibold ${amountClass}`}>
        {amountPrefix}${amount}
      </p>
    </div>
  );
};
