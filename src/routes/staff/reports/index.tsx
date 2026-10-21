import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react";
import ProfitLossTab from "./-components/ProfitLossTab";
import InvoicesTab from "./-components/InvoicesTab";
import SalesFunnelTab from "./-components/SalesFunnelTab";
import WinRateTab from "./-components/WinRateTab";

export const Route = createFileRoute("/staff/reports/")({
  component: ReportsPageComponent,
});

type ReportTab = "profit_loss" | "invoices" | "sales_funnel" | "win_rate";

const TABS: { id: ReportTab; label: string; icon: LucideIcon }[] = [
  { id: "profit_loss", label: "Profit & Loss", icon: TrendingUp },
  { id: "invoices", label: "Invoice Receivables", icon: FileSpreadsheet },
  { id: "sales_funnel", label: "Sales Funnel", icon: BarChart3 },
  { id: "win_rate", label: "Win-Rate & Velocity", icon: PieChart },
];

function ReportsPageComponent() {
  const [activeTab, setActiveTab] = useState<ReportTab>("profit_loss");

  // Date filters
  const currentYear = new Date().getFullYear();
  const [from, setFrom] = useState(`${currentYear}-01-01`);
  const [to, setTo] = useState(`${currentYear}-12-31`);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Business Analytics & Reports"
        description="Enterprise performance reporting, cash-flow profit & loss, receivables audit, and sales velocity metrics"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-base-100 p-1.5 rounded-xl border border-base-200 text-xs">
            <span className="text-base-content/60 font-medium">From:</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input input-xs input-ghost"
            />
            <span className="text-base-content/60 font-medium">To:</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input input-xs input-ghost"
            />
          </div>
        </div>
      </PageHeader>

      {/* TABS HEADER */}
      <div className="flex items-center gap-2 border-b border-base-300 pb-2 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`btn btn-sm gap-2 rounded-xl transition-all ${
              activeTab === id ? "btn-primary shadow-xs" : "btn-ghost"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "profit_loss" && <ProfitLossTab from={from} to={to} />}
      {activeTab === "invoices" && <InvoicesTab from={from} to={to} />}
      {activeTab === "sales_funnel" && <SalesFunnelTab />}
      {activeTab === "win_rate" && <WinRateTab />}
    </div>
  );
}
