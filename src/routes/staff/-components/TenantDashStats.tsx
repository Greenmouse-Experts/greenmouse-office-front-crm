import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  FileText,
  ReceiptText,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useDashboardStats } from "@/api/tenantApi";
import { useInvoiceRevenueReport } from "@/api/reportsApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
const formatMoney = (value: number) => `₦${formatNumber(value)}`;

function Change({ value }: { value: number }) {
  const label = `${value > 0 ? "+" : ""}${value}%`;
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold tabular-nums ${
        value > 0
          ? "bg-success/10 text-success"
          : value < 0
            ? "bg-error/10 text-error"
            : "bg-base-200 text-base-content/70"
      }`}
      aria-label={`${label} change`}
    >
      {label}
    </span>
  );
}

export default function TenantDashStats() {
  const query = useDashboardStats();
  const debtsQuery = useInvoiceRevenueReport({ currency: "NGN" });

  return (
    <QueryCompLayout query={query}>
      {(stats) => {
        const cards = [
          {
            title: "Total Income",
            value: formatMoney(stats.totalIncome),
            change: stats.totalIncomeChange,
            linkLabel: "View income",
            icon: Wallet,
            to: "/staff/accounts/income-expenses",
            accent: "bg-primary/10 text-primary",
          },
          {
            title: "Total Expenses",
            value: formatMoney(stats.totalExpenses),
            change: stats.totalExpensesChange,
            linkLabel: "View expenses",
            icon: ReceiptText,
            to: "/staff/accounts/income-expenses",
            accent: "bg-warning/10 text-warning",
          },
          {
            title: "Total Customers",
            value: formatNumber(stats.totalCustomers),
            change: stats.totalCustomersChange,
            linkLabel: "View customers",
            icon: UsersRound,
            to: "/staff/contacts/customers",
            accent: "bg-info/10 text-info",
          },
          // {
          //   title: "Products",
          //   value: formatNumber(stats.totalProducts),
          //   change: stats.totalProductsChange,
          //   linkLabel: "View products",
          //   icon: Package,
          //   to: "/staff/products",
          //   accent: "bg-primary/10 text-primary",
          // },
          // {
          //   title: "Services",
          //   value: formatNumber(stats.totalServices),
          //   change: stats.totalServicesChange,
          //   linkLabel: "View services",
          //   icon: ShoppingBag,
          //   to: "/staff/products/service",
          //   accent: "bg-info/10 text-info",
          // },
          {
            title: "Total Debts",
            value: debtsQuery.isLoading
              ? "…"
              : debtsQuery.data
                ? formatMoney(debtsQuery.data.outstandingTotal)
                : "—",
            linkLabel: "View Debts",
            icon: Clock,
            to: "/staff/accounts/debts",
            accent: "bg-warning/10 text-warning",
          },
          {
            title: "Total Invoices",
            value: formatNumber(stats.totalInvoices),
            change: stats.totalInvoicesChange,
            linkLabel: "View invoices",
            icon: FileText,
            to: "/staff/accounts/Invoices",
            accent: "bg-primary/10 text-primary",
          },
          // {
          //   title: "Team Members",
          //   value: formatNumber(stats.totalStaffs),
          //   linkLabel: "View team",
          //   icon: Users,
          //   to: "/staff/users",
          //   accent: "bg-info/10 text-info",
          // },
        ];

        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.to}
                  className="card border border-base-200 bg-base-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="card-body gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`rounded-xl p-2.5 ${card.accent}`}>
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      {card.change !== undefined && (
                        <Change value={card.change} />
                      )}
                    </div>
                    <div>
                      <p className="text-base font-semibold tabular-nums text-base-content">
                        {card.value}
                      </p>
                      <p className="text-xs font-semibold text-base-content/70">
                        {card.title}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${card.accent} !bg-transparent`}
                    >
                      {card.linkLabel}
                      <ArrowRight className="!size-3" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        );
      }}
    </QueryCompLayout>
  );
}
