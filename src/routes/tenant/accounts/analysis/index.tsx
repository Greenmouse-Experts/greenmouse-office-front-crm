import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import TenantDashStats from "../../-components/TenantDashStats";
import IncomeExpense from "../../-components/charts/IncomeExpense";
import AdminMonthly from "../../-components/AdminMonthly";
import AreaChartExample from "../../-components/charts/AreaChart";
import PieChartExample from "../../-components/charts/PieChart";
import SimpleContainer from "@/components/SimpleContainer";
import { BarChart3, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/tenant/accounts/analysis/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<
    "combined" | "analytics" | "ledger"
  >("combined");

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Financial Analysis & Transactions"
        description="Comprehensive business performance, income vs expense breakdowns, profit analytics, and transactions ledger"
      >
        <div className="flex items-center gap-1.5 bg-base-200/80 p-1 rounded-xl border border-base-300">
          <button
            type="button"
            onClick={() => setActiveTab("combined")}
            className={`btn btn-sm gap-1.5 rounded-lg transition-all ${
              activeTab === "combined"
                ? "btn-primary shadow-sm"
                : "btn-ghost text-base-content/70 hover:text-base-content"
            }`}
          >
            <LayoutDashboard className="size-4" />
            <span>Combined</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`btn btn-sm gap-1.5 rounded-lg transition-all ${
              activeTab === "analytics"
                ? "btn-primary shadow-sm"
                : "btn-ghost text-base-content/70 hover:text-base-content"
            }`}
          >
            <BarChart3 className="size-4" />
            <span>Analytics</span>
          </button>
        </div>
      </PageHeader>

      {/* Analytics Section (Shown in combined and analytics tabs) */}
      {(activeTab === "combined" || activeTab === "analytics") && (
        <div className="space-y-6">
          <TenantDashStats />

          <IncomeExpense />

          <AdminMonthly />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SimpleContainer title="Net Profit Trend">
                <div className="bg-base-100 border border-base-200 rounded-b-box p-4">
                  <AreaChartExample />
                </div>
              </SimpleContainer>
            </div>
            <div className="lg:col-span-1">
              <PieChartExample />
            </div>
          </div>
        </div>
      )}

      {/* Transactions Section (Shown in combined and ledger tabs) */}
      {/*{(activeTab === "combined" || activeTab === "ledger") && (
        <div className="pt-2">
          <TransactionsLedger
            title="Transactions History & Audit"
            showHeaderMetrics={activeTab === "ledger"}
          />
        </div>
      )}*/}
    </div>
  );
}
