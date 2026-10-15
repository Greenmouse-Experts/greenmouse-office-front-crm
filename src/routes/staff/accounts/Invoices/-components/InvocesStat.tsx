import { useInvoiceStats, useInvoices, type Invoice } from "@/api/financeApi";

interface InvoicesStatProps {
  invoices?: Invoice[];
}

export default function InvoicesStat({
  invoices: propInvoices,
}: InvoicesStatProps) {
  const { data: statsData } = useInvoiceStats();
  const { data: fetchedInvoices = [] } = useInvoices();
  const invoices = propInvoices || fetchedInvoices;

  const totalInvoices = statsData?.total ?? invoices.length;
  const paidInvoices =
    statsData?.paid ??
    invoices.filter((i) => (i.status || "").toLowerCase() === "paid").length;
  const pendingInvoices =
    statsData?.pending ??
    invoices.filter((i) => {
      const s = (i.status || "").toLowerCase();
      return s === "pending" || s === "sent" || s === "draft";
    }).length;

  const totalAmount =
    statsData?.revenue ??
    invoices.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const paidAmount =
    statsData?.paidAmount ??
    invoices
      .filter((i) => (i.status || "").toLowerCase() === "paid")
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
  const pendingAmount =
    statsData?.pendingAmount ??
    invoices
      .filter((i) => (i.status || "").toLowerCase() !== "paid")
      .reduce((acc, curr) => acc + (curr.total || 0), 0);

  const stats = [
    {
      title: "Total Invoices",
      value: totalInvoices,
      desc: `Total volume: $${totalAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      figureClass: "text-primary",
    },
    {
      title: "Paid Invoices",
      value: paidInvoices,
      desc: `Collected: $${paidAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      figureClass: "text-success",
    },
    {
      title: "Pending & Sent",
      value: pendingInvoices,
      desc: `Outstanding: $${pendingAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      figureClass: "text-warning",
    },
  ];

  return (
    <div className="stats *:bg-base-100 stats-vertical lg:stats-horizontal shadow-sm w-full">
      {stats.map((stat, index) => (
        <div className="stat" key={index}>
          <div className="stat-title text-xs font-medium text-base-content/60">
            {stat.title}
          </div>
          <div className="stat-value text-2xl font-semibold text-base-content mt-1">
            {stat.value}
          </div>
          <div className="stat-desc text-xs mt-1 text-base-content/70">
            {stat.desc}
          </div>
        </div>
      ))}
    </div>
  );
}
