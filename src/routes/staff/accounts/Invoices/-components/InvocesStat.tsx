import { useInvoiceStats } from "@/api/financeApi";
import PageLoader from "@/components/layout/PageLoader";

const formatAmount = (amount: number) =>
  `₦${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function InvoicesStat() {
  const query = useInvoiceStats();

  return (
    <PageLoader query={query} loadingText="Loading invoice statistics...">
      {(stats) => {
        const remaining = Math.max(0, stats.totalInvoices - stats.paid.count);
        const cards = [
          {
            title: "Total Invoices",
            value: stats.totalInvoices,
            description: "All invoices",
          },
          {
            title: "Paid Invoices",
            value: stats.paid.count,
            description: `Collected: ${formatAmount(stats.paid.total)}`,
          },
          {
            title: "Other Invoices",
            value: remaining,
            description: "Invoices not marked paid",
          },
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
