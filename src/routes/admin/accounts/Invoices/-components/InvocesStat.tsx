import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Invoice } from "@/api/financeApi";
import StatCard from "@/components/StatCard";

interface InvoicesStatProps {
  invoices?: Invoice[];
  statsData?: {
    total?: number;
    paid?: number;
    pending?: number;
    overdue?: number;
    revenue?: number;
  };
}

export default function InvoicesStat({
  invoices = [],
  statsData,
}: InvoicesStatProps) {
  const totalInvoices = statsData?.total ?? invoices.length;
  const paidInvoices =
    statsData?.paid ??
    invoices.filter((inv) => inv.status?.toLowerCase() === "paid").length;
  const pendingInvoices =
    statsData?.pending ??
    invoices.filter((inv) =>
      ["pending", "sent", "draft"].includes(inv.status?.toLowerCase() || ""),
    ).length;
  const overdueInvoices =
    statsData?.overdue ??
    invoices.filter((inv) => inv.status?.toLowerCase() === "overdue").length;

  const totalCollected =
    statsData?.revenue ??
    invoices
      .filter((inv) => inv.status?.toLowerCase() === "paid")
      .reduce((sum, inv) => {
        const itemSum =
          inv.items?.reduce(
            (s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.qty) || 1),
            0,
          ) || 0;
        return sum + (inv.total ?? itemSum);
      }, 0);

  const stats = [
    {
      title: "Total Invoices",
      value: totalInvoices,
      desc: "All issued & drafts",
      icon: <FileText className="size-6" />,
      variant: "primary" as const,
    },
    {
      title: "Paid Invoices",
      value: paidInvoices,
      desc: `Collected: ₦${totalCollected.toLocaleString()}`,
      icon: <CheckCircle2 className="size-6" />,
      variant: "success" as const,
    },
    {
      title: "Pending / Sent",
      value: pendingInvoices,
      desc: "Awaiting client settlement",
      icon: <Clock className="size-6" />,
      variant: "warning" as const,
    },
    {
      title: "Overdue",
      value: overdueInvoices,
      desc: "Requires payment reminder",
      icon: <AlertCircle className="size-6" />,
      variant: "error" as const,
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
