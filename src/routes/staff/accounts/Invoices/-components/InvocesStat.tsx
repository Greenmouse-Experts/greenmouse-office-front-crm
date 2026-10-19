import { useInvoiceStats, type InvoiceStatusStats } from "@/api/financeApi";
import PageLoader from "@/components/layout/PageLoader";

const formatAmount = (amount: number) =>
  `₦${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const isStatusStats = (value: unknown): value is InvoiceStatusStats =>
  typeof value === "object" &&
  value !== null &&
  "count" in value &&
  typeof value.count === "number" &&
  "total" in value &&
  typeof value.total === "number";

const statusTitle = (status: string) =>
  `${status.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())} Invoices`;

export default function InvoicesStat() {
  const query = useInvoiceStats();

  return (
    <PageLoader query={query} loadingText="Loading invoice statistics...">
      {(stats) => {
        const cards = [
          {
            title: "Total Invoices",
            value: stats.totalInvoices,
            description: "All invoices",
          },
          ...Object.entries(stats).flatMap(([status, value]) =>
            status !== "totalInvoices" && isStatusStats(value)
              ? [
                  {
                    title: statusTitle(status),
                    value: value.count,
                    description: `${status === "paid" ? "Collected" : "Total"}: ${formatAmount(value.total)}`,
                  },
                ]
              : [],
          ),
        ];

        return (
          <div className="stats stats-vertical w-full shadow-sm lg:stats-horizontal *:bg-base-100">
            {cards.map((card) => (
              <div className="stat" key={card.title}>
                <div className="stat-title text-xs font-medium text-base-content/60">
                  {card.title}
                </div>
                <div className="stat-value mt-1 text-2xl font-semibold text-base-content">
                  {card.value}
                </div>
                <div className="stat-desc mt-1 text-xs text-base-content/70">
                  {card.description}
                </div>
              </div>
            ))}
          </div>
        );
      }}
    </PageLoader>
  );
}
