import { useState } from "react";
import SimpleContainer from "@/components/SimpleContainer";
import { usePipelineFunnelReport } from "@/api/reportsApi";
import { usePipelines } from "@/api/pipelinesAndDealsApi";
import PipelineSelect from "./PipelineSelect";

export default function SalesFunnelTab() {
  const { data: pipelines = [] } = usePipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const activePipelineId = selectedPipelineId || pipelines[0]?.id;

  const { data: funnelReport, isLoading } =
    usePipelineFunnelReport(activePipelineId);

  const stages = funnelReport?.stages || [];
  const maxCount = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="space-y-6">
      <PipelineSelect
        pipelines={pipelines}
        value={activePipelineId || ""}
        onChange={setSelectedPipelineId}
      />

      {isLoading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <SimpleContainer
          title={`Conversion Funnel (${funnelReport?.pipelineName || "Pipeline"})`}
        >
          <div className="space-y-4 p-2">
            {stages.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                No stage data found for this pipeline.
              </div>
            ) : (
              stages.map((stage, idx) => {
                const percentage = (stage.count / maxCount) * 100;
                return (
                  <div key={stage.stageId || idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: stage.color || "#007047" }}
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
  );
}
