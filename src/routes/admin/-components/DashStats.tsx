export default function DashStats() {
  const incomeData = [
    { date: "17 - 12 - 25", name: "", amount: 4600.0 },
    { date: "17 - 12 - 25", name: "Kacey Cotton Sp", amount: 18782.0 },
    { date: "16 - 12 - 25", name: "", amount: 23000.0 },
    { date: "16 - 12 - 25", name: "", amount: 3855.78 },
    { date: "15 - 12 - 25", name: "", amount: 12000.0 },
  ];

  const expenseData = [
    { date: "17 - 12 - 25", name: "Utility Bill", amount: 150.0 },
    { date: "17 - 12 - 25", name: "Groceries", amount: 75.5 },
    { date: "16 - 12 - 25", name: "Rent", amount: 1200.0 },
    { date: "16 - 12 - 25", name: "Internet", amount: 60.0 },
    { date: "15 - 12 - 25", name: "Dinner Out", amount: 45.75 },
  ];

  return (
    <div className=" grid md:grid-cols-2 gap-6">
      <Card title="Recent Income">
        {incomeData.map((item, index) => (
          <TransactionCard
            key={index}
            type="income"
            date={item.date}
            name={item.name}
            amount={item.amount}
          />
        ))}
      </Card>
      <Card title="Recent Expenses">
        {expenseData.map((item, index) => (
          <TransactionCard
            key={index}
            type="expense"
            date={item.date}
            name={item.name}
            amount={item.amount}
          />
        ))}
      </Card>
    </div>
  );
}

const Card = (props: any) => {
  return (
    <div className=" ring ring-current/10 shadow-md rounded-box bg-base-100 ">
      <div className="h-14 p-4 font-semibold text-lg border-b border-current/20">
        {props.title}
      </div>
      <ul className="menu w-full space-y-2">{props.children}</ul>
    </div>
  );
};

interface TransactionCardProps {
  type: "income" | "expense";
  date: string;
  name: string;
  amount: number;
}
const TransactionCard = (props: TransactionCardProps) => {
  const { type, date, name, amount } = props;
  const isIncome = type === "income";
  const textColor = isIncome ? "text-success" : "text-error";
  const bgColor = isIncome ? "bg-success/10" : "bg-error/10";
  const iconColor = isIncome ? "text-success" : "text-error";
  const iconPath = isIncome
    ? "M5 10l7-7m0 0l7 7m-7-7v18"
    : "M19 14l-7 7m0 0l-7-7m7 7V3";

  return (
    <li>
      <a className="flex items-center p-2 rounded-lg hover:bg-base-200 transition-colors duration-200">
        <div
          className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full mr-3 ${bgColor}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${iconColor}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={iconPath}
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {name || (isIncome ? "Income" : "Expense")}
          </div>
          <div className="text-xs text-current/70">{date}</div>
        </div>
        <div className={`ml-3 text-base font-semibold ${textColor} shrink-0`}>
          {isIncome ? "+" : "-"}
          {amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD", // Assuming USD, you might want to make this dynamic
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </a>
    </li>
  );
};
