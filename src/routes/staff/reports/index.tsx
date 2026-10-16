import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import {
  useProfitLossReport,
  useInvoiceRevenueReport,
  useOutstandingInvoicesReport,
  usePipelineFunnelReport,
  useWinRateReport,
  useCycleTimeReport,
  useAvgDealReport,
} from "@/api/reportsApi";
import { usePipelines } from "@/api/pipelinesAndDealsApi";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import { NairaIcon } from "@/components/icons";

export const Route = createFileRoute("/staff/reports/")({
  component: ReportsPageComponent,
});

function ReportsPageComponent() {
  const [activeTab, setActiveTab] = useState<
    "profit_loss" | "invoices" | "sales_funnel" | "win_rate"
  >("profit_loss");

  // Date filters
  const currentYear = new Date().getFullYear();
  const [from, setFrom] = useState(`${currentYear}-01-01`);
  const [to, setTo] = useState(`${currentYear}-12-31`);

  // Pipeline selection for funnel
  const { data: pipelines = [] } = usePipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const activePipelineId = selectedPipelineId || pipelines[0]?.id;

  // Report Queries
  const { data: plReport, isLoading: isLoadingPL } = useProfitLossReport({
    from,
    to,
  });
  const { data: invoiceReport, isLoading: isLoadingInv } =
    useInvoiceRevenueReport({ from, to });
  const { data: outstandingReport, isLoading: isLoadingOut } =
    useOutstandingInvoicesReport();
  const { data: funnelReport, isLoading: isLoadingFunnel } =
    usePipelineFunnelReport(activePipelineId);
  const { data: winRateReport, isLoading: isLoadingWinRate } = useWinRateReport(
    {
      pipelineId: activePipelineId,
      year: currentYear,
    },
  );
  const { data: cycleTimeReport } = useCycleTimeReport({
    pipelineId: activePipelineId,
    year: currentYear,
  });
  const { data: avgDealReport } = useAvgDealReport({
    pipelineId: activePipelineId,
    year: currentYear,
  });

  // Outstanding Invoices columns
  const invoiceColumns = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      render: (val: string) => (
        <span className="font-semibold text-primary">{val}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (_val: any, item: any) => (
        <div>
          <div className="font-medium text-base-content">
            {item.customer?.name || "—"}
          </div>
          <div className="text-xs text-base-content/60">
            {item.customer?.email}
          </div>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total Amount",
      render: (val: number, item: any) => (
        <span className="font-mono font-medium">
          {item.currency || "₦"}
          {(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "balanceDue",
      label: "Balance Due",
      render: (val: number, item: any) => (
        <span className="font-mono font-bold text-error">
          {item.currency || "₦"}
          {(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (val: string) => (
        <span className="text-xs text-base-content/70">
          {val ? new Date(val).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val: string) => (
        <span className="badge badge-sm badge-warning font-medium uppercase text-[10px]">
          {val || "Unpaid"}
        </span>
      ),
    },
  ];

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
        <button
          type="button"
          onClick={() => setActiveTab("profit_loss")}
          className={`btn btn-sm gap-2 rounded-xl transition-all ${
            activeTab === "profit_loss" ? "btn-primary shadow-xs" : "btn-ghost"
          }`}
        >
          <TrendingUp className="size-4" />
          Profit & Loss
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`btn btn-sm gap-2 rounded-xl transition-all ${
            activeTab === "invoices" ? "btn-primary shadow-xs" : "btn-ghost"
          }`}
        >
          <FileSpreadsheet className="size-4" />
          Invoice Receivables
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sales_funnel")}
          className={`btn btn-sm gap-2 rounded-xl transition-all ${
            activeTab === "sales_funnel" ? "btn-primary shadow-xs" : "btn-ghost"
          }`}
        >
          <BarChart3 className="size-4" />
          Sales Funnel
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("win_rate")}
          className={`btn btn-sm gap-2 rounded-xl transition-all ${
            activeTab === "win_rate" ? "btn-primary shadow-xs" : "btn-ghost"
          }`}
        >
          <PieChart className="size-4" />
          Win-Rate & Velocity
        </button>
      </div>

      {/* TAB 1: PROFIT & LOSS */}
      {activeTab === "profit_loss" && (
        <div className="space-y-6">
          {isLoadingPL ? (
            <div className="flex justify-center p-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            <>
              {/* P&L Metrics Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-base-100 border border-base-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between text-base-content/60 text-xs font-semibold uppercase">
                    <span>Total Income</span>
                    <ArrowUpRight className="size-4 text-success" />
                  </div>
                  <div className="text-3xl font-bold mt-2 text-success font-mono">
                    ₦{(plReport?.incomeTotal || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-base-content/50 mt-1">
                    Recorded revenue entries
                  </div>
                </div>

                <div className="card bg-base-100 border border-base-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between text-base-content/60 text-xs font-semibold uppercase">
                    <span>Total Expenses</span>
                    <ArrowDownRight className="size-4 text-error" />
                  </div>
                  <div className="text-3xl font-bold mt-2 text-error font-mono">
                    ₦{(plReport?.expenseTotal || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-base-content/50 mt-1">
                    Operational expenditures
                  </div>
                </div>

                <div className="card bg-base-100 border border-base-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between text-base-content/60 text-xs font-semibold uppercase">
                    <span>Net Profit</span>
                    <TrendingUp className="size-4 text-primary" />
                  </div>
                  <div
                    className={`text-3xl font-bold mt-2 font-mono ${
                      (plReport?.profit || 0) >= 0
                        ? "text-primary"
                        : "text-error"
                    }`}
                  >
                    ₦{(plReport?.profit || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-base-content/50 mt-1">
                    Net cash margin for selected period
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <SimpleContainer title="Monthly Financial Trend">
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Income (₦)</th>
                        <th>Expenses (₦)</th>
                        <th>Net Profit (₦)</th>
                        <th>Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(plReport?.monthly || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-8 text-base-content/60"
                          >
                            No monthly transactions recorded for this date
                            range.
                          </td>
                        </tr>
                      ) : (
                        plReport?.monthly?.map((row, idx) => {
                          const margin =
                            row.income > 0
                              ? ((row.profit / row.income) * 100).toFixed(1)
                              : "0.0";
                          return (
                            <tr key={idx} className="hover">
                              <td className="font-semibold text-base-content">
                                {row.month}
                              </td>
                              <td className="font-mono text-success">
                                +₦{row.income.toLocaleString()}
                              </td>
                              <td className="font-mono text-error">
                                -₦{row.expenses.toLocaleString()}
                              </td>
                              <td
                                className={`font-mono font-bold ${
                                  row.profit >= 0
                                    ? "text-primary"
                                    : "text-error"
                                }`}
                              >
                                ${row.profit.toLocaleString()}
                              </td>
                              <td>
                                <span
                                  className={`badge badge-sm ${
                                    Number(margin) >= 0
                                      ? "badge-success/20 text-success"
                                      : "badge-error/20 text-error"
                                  }`}
                                >
                                  {margin}%
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </SimpleContainer>
            </>
          )}
        </div>
      )}

      {/* TAB 2: INVOICES & RECEIVABLES */}
      {activeTab === "invoices" && (
        <div className="space-y-6">
          {isLoadingInv ? (
            <div className="flex justify-center p-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            <>
              {/* Invoice Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card bg-base-100 border border-base-200 p-5 shadow-xs">
                  <div className="text-xs font-semibold text-base-content/60 uppercase">
                    Total Invoiced
                  </div>
                  <div className="text-2xl font-bold mt-1 text-base-content font-mono">
                    ₦{(invoiceReport?.invoicedTotal || 0).toLocaleString()}
                  </div>
                </div>

                <div className="card bg-base-100 border border-base-200 p-5 shadow-xs">
                  <div className="text-xs font-semibold text-base-content/60 uppercase">
                    Received Revenue
                  </div>
                  <div className="text-2xl font-bold mt-1 text-success font-mono">
                    ₦{(invoiceReport?.receivedTotal || 0).toLocaleString()}
                  </div>
                </div>

                <div className="card bg-base-100 border border-base-200 p-5 shadow-xs">
                  <div className="text-xs font-semibold text-base-content/60 uppercase">
                    Outstanding Balance
                  </div>
                  <div className="text-2xl font-bold mt-1 text-error font-mono">
                    ₦{(invoiceReport?.outstandingTotal || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-base-content/60 mt-1">
                    {invoiceReport?.outstandingCount || 0} unpaid invoices
                  </div>
                </div>
              </div>

              {/* Outstanding Invoices List */}
              <SimpleContainer title="Unpaid & Aging Invoices">
                {isLoadingOut ? (
                  <div className="flex justify-center p-8">
                    <span className="loading loading-spinner text-primary" />
                  </div>
                ) : (
                  <CustomTable
                    columns={invoiceColumns}
                    data={outstandingReport?.data || []}
                  />
                )}
              </SimpleContainer>
            </>
          )}
        </div>
      )}

      {/* TAB 3: SALES FUNNEL */}
      {activeTab === "sales_funnel" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-base-100 p-3 rounded-xl border border-base-200 max-w-sm">
            <Filter className="size-4 text-primary" />
            <span className="text-xs font-semibold text-base-content/70">
              Pipeline:
            </span>
            <select
              value={activePipelineId || ""}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="select select-sm select-ghost font-medium flex-1"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {isLoadingFunnel ? (
            <div className="flex justify-center p-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            <SimpleContainer
              title={`Conversion Funnel (${funnelReport?.pipelineName || "Pipeline"})`}
            >
              <div className="space-y-4 p-2">
                {(funnelReport?.stages || []).length === 0 ? (
                  <div className="text-center py-8 text-base-content/60">
                    No stage data found for this pipeline.
                  </div>
                ) : (
                  funnelReport?.stages?.map((stage, idx) => {
                    const maxCount = Math.max(
                      ...(funnelReport?.stages?.map((s) => s.count) || [1]),
                    );
                    const percentage =
                      maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
                    return (
                      <div key={stage.stageId || idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-3 rounded-full"
                              style={{
                                backgroundColor: stage.color || "#007047",
                              }}
                            />
                            <span className="font-semibold text-base-content">
                              {stage.stageName}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-base-content/80">
                              {stage.count} deals
                            </span>
                            <span className="font-mono font-bold text-primary">
                              ₦{(stage.value || 0).toLocaleString()}
                            </span>
                            {stage.conversionRate !== undefined && (
                              <span className="badge badge-sm badge-outline">
                                {stage.conversionRate}% conv.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar representation of funnel width */}
                        <div className="w-full bg-base-200 h-4 rounded-lg overflow-hidden flex">
                          <div
                            className="bg-primary/80 transition-all duration-500 rounded-lg flex items-center justify-end px-2 text-[10px] text-white font-mono"
                            style={{
                              width: `${Math.max(percentage, 6)}%`,
                              backgroundColor: stage.color || undefined,
                            }}
                          >
                            {stage.count > 0 && `${Math.round(percentage)}%`}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SimpleContainer>
          )}
        </div>
      )}

      {/* TAB 4: WIN-RATE & VELOCITY */}
      {activeTab === "win_rate" && (
        <div className="space-y-6">
          {isLoadingWinRate ? (
            <div className="flex justify-center p-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card bg-base-100 border border-base-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-base-content/60 uppercase">
                    <span>Win Rate</span>
                    <CheckCircle2 className="size-4 text-success" />
                  </div>
                  <div className="text-3xl font-bold mt-2 text-success font-mono">
                    {winRateReport?.winRate !== undefined
                      ? `${winRateReport.winRate.toFixed(1)}%`
                      : "0%"}
                  </div>
                  <div className="text-xs text-base-content/50 mt-1">
                    Based on closed opportunities
                  </div>
                </div>

                <div className="card bg-base-100 border border-base-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-base-content/60 uppercase">
                    <span>Average Sales Cycle</span>
                    <Clock className="size-4 text-info" />
                  </div>
                  <div className="text-3xl font-bold mt-2 text-info font-mono">
                    {cycleTimeReport?.averageDays !== undefined
                      ? `${Math.round(cycleTimeReport.averageDays)} days`
                      : "—"}
                  </div>
                  <div className="text-xs text-base-content/50 mt-1">
                    From lead creation to close
                  </div>
                </div>

                <div className="card bg-base-100 border border-base-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-base-content/60 uppercase">
                    <span>Average Deal Size</span>
                    <NairaIcon className="size-4 text-secondary" />
                  </div>
                  <div className="text-3xl font-bold mt-2 text-secondary font-mono">
                    ₦{(avgDealReport?.overallAverage || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-base-content/50 mt-1">
                    Across all closed won deals
                  </div>
                </div>
              </div>

              {/* Monthly Win Rate Breakdown */}
              <SimpleContainer title="Monthly Win-Rate Velocity">
                <div className="overflow-x-auto p-2">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Won Deals</th>
                        <th>Lost Deals</th>
                        <th>Total Closed</th>
                        <th>Win Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(winRateReport?.monthly || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-6 text-base-content/60"
                          >
                            No deal history recorded for this period.
                          </td>
                        </tr>
                      ) : (
                        winRateReport?.monthly?.map((m, idx) => (
                          <tr key={idx} className="hover">
                            <td className="font-semibold text-base-content">
                              {m.month}
                            </td>
                            <td className="font-mono text-success font-medium">
                              {m.won}
                            </td>
                            <td className="font-mono text-error font-medium">
                              {m.lost}
                            </td>
                            <td className="font-mono font-medium">
                              {m.won + m.lost}
                            </td>
                            <td>
                              <span
                                className={`badge badge-sm ${
                                  m.rate >= 50
                                    ? "badge-success/20 text-success"
                                    : "badge-warning/20 text-warning"
                                }`}
                              >
                                {m.rate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </SimpleContainer>
            </>
          )}
        </div>
      )}
    </div>
  );
}
