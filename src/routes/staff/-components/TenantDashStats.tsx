import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileText,
  UsersRound,
  Clock,
  Banknote,
  Ban,
} from "lucide-react";
import { useDashboardStats } from "@/api/tenantApi";
import { Naira } from "@/components/icons";

export default function TenantDashStats() {
  const { data: stats, isLoading } = useDashboardStats();

  const cards = [
    {
      title: "Total Income",
      value: isLoading ? "..." : (stats?.totalIncome ?? 0),
      linkLabel: "View income",
      icon: UsersRound,
      valueIcon: Naira,
      to: "/staff/accounts/income",
      color: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Expenses",
      value: isLoading ? "..." : (stats?.totalExpenses ?? 0),
      linkLabel: "View expenses",
      icon: Clock,
      valueIcon: Naira,
      to: "/staff/accounts/expenses",
      color:
        "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Total Customers",
      value: isLoading ? "..." : (stats?.totalCustomers ?? 0),
      linkLabel: "View customers",
      icon: FileText,
      to: "/staff/contacts/customers",
      color:
        "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    },

    {
      title: "Total Debts",
      value: isLoading ? "..." : (stats?.totalDebts ?? 0),
      linkLabel: "View debts  ",
      icon: Banknote,
      valueIcon: Naira,
      to: "/staff/users",
      color: "from-teal-500/20 to-teal-500/5 text-teal-600 dark:text-teal-400",
    },
    {
      title: "Total Invoices",
      value: isLoading ? "..." : (stats?.totalInvoices ?? 0),
      linkLabel: "View invoices",
      icon: FileText,
      to: "/staff/accounts/invoices",
      color:
        "from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Link
            key={index}
            to={card.to}
            className="card bg-base-100 shadow-sm hover:shadow-md border border-base-200 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="card-body p-4">
              <div
                className={`p-2.5 w-fit rounded-xl bg-gradient-to-br ${card.color}`}
              >
                <Icon className="size-5" />
              </div>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold text-base-content">
                    {card.valueIcon && (
                      <card.valueIcon className="size-5 inline-block" />
                    )}{" "}
                    {card.value}
                  </p>
                  <div className="flex flex-col gap-1 pt-1 text-xs font-medium text-primary">
                    <span className=" font-semibold text-xs  text-base-content/70  tracking-wider">
                      {card.title}
                    </span>
                    <div
                      className={`inline-flex items-center gap-1 pt-1 text-xs font-medium text-primary ${card.color}`}
                    >
                      {card.linkLabel}
                      <ArrowRight className="size-3" aria-hidden="true" />
                    </div>{" "}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
