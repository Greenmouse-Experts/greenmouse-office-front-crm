import { useState } from "react";
import SimpleContainer from "@/components/SimpleContainer";
import { NairaIcon } from "@/components/icons";
import {
  useWinRateReport,
  useCycleTimeReport,
  useAvgDealReport,
} from "@/api/reportsApi";
import { usePipelines } from "@/api/pipelinesAndDealsApi";
import { CheckCircle2, Clock } from "lucide-react";
import PipelineSelect from "./PipelineSelect";

export default function WinRateTab() {
  const year = new Date().getFullYear();
  const { data: pipelines = [] } = usePipelines();
  // No default: reports are only requested once the user picks a pipeline.
  const [pipelineId, setPipelineId] = useState("");
  const enabled = Boolean(pipelineId);

  const { data: winRateReport, isLoading } = useWinRateReport(
    { pipelineId, year },
    { enabled },
  );
  const { data: cycleTimeReport } = useCycleTimeReport(
    { pipelineId, year },
    { enabled },
  );
  const { data: avgDealReport } = useAvgDealReport(
    { pipelineId, year },
    { enabled },
  );

  return (
    <div className="space-y-6">
      <PipelineSelect
        pipelines={pipelines}
        value={pipelineId}
        onChange={setPipelineId}
        placeholder="Select a pipeline"
      />

      {!enabled ? (
        <div className="text-center py-12 text-base-content/60 text-sm">
          Select a pipeline to view its win-rate and velocity report.
        </div>
      ) : isLoading ? (
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
  );
}
