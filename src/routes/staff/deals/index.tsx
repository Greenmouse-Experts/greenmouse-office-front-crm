import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import PageLoader from "@/components/layout/PageLoader";
import {
  usePipelines,
  useDealsKanban,
  useCreateDeal,
  useUpdateDeal,
  useDeleteDeal,
  useMoveDealStage,
  useMarkDealWon,
  useMarkDealLost,
  useCreatePipeline,
  useAddPipelineStage,
  type Deal,
} from "@/api/pipelinesAndDealsApi";
import {
  Kanban,
  PlusCircle,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Layers,
  FolderPlus,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/deals/")({
  component: DealsPageComponent,
});

function DealsPageComponent() {
  const pipelinesQuery = usePipelines();
  const pipelines = pipelinesQuery.data || [];

  // Active pipeline
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");

  const activePipeline = useMemo(() => {
    if (selectedPipelineId) {
      return pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];
    }
    return pipelines[0];
  }, [pipelines, selectedPipelineId]);

  const activePipelineId = activePipeline?.id;

  // Kanban Query
  const kanbanQuery = useDealsKanban(activePipelineId);
  const kanbanColumns = kanbanQuery.data || [];

  // Mutations
  const createDealMutation = useCreateDeal();
  const updateDealMutation = useUpdateDeal();
  const deleteDealMutation = useDeleteDeal();
  const moveDealStageMutation = useMoveDealStage();
  const markWonMutation = useMarkDealWon();
  const markLostMutation = useMarkDealLost();
  const createPipelineMutation = useCreatePipeline();
  const addStageMutation = useAddPipelineStage();

  // Modal Refs
  const dealModalRef = useRef<ModalHandle>(null);
  const pipelineModalRef = useRef<ModalHandle>(null);
  const stageModalRef = useRef<ModalHandle>(null);

  // Selected item for edit
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Deal Form State
  const [dealForm, setDealForm] = useState({
    name: "",
    pipelineId: "",
    stageId: "",
    value: 1000,
    currency: "USD",
    expectedCloseDate: "",
    notes: "",
  });

  // Pipeline Form State
  const [pipelineForm, setPipelineForm] = useState({
    name: "",
    description: "",
  });

  // Stage Form State
  const [stageForm, setStageForm] = useState({
    name: "",
    color: "#007047",
  });

  // Metric Computations
  const metrics = useMemo(() => {
    let totalDeals = 0;
    let totalValue = 0;
    kanbanColumns.forEach((col) => {
      totalDeals += col.count || col.deals?.length || 0;
      totalValue += col.totalValue || 0;
    });
    return { totalDeals, totalValue };
  }, [kanbanColumns]);

  // Handlers
  const handleOpenCreateDeal = (preselectedStageId?: string) => {
    setEditingDeal(null);
    setDealForm({
      name: "",
      pipelineId: activePipelineId || "",
      stageId: preselectedStageId || activePipeline?.stages?.[0]?.id || "",
      value: 1000,
      currency: "USD",
      expectedCloseDate: new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .slice(0, 10),
      notes: "",
    });
    dealModalRef.current?.open();
  };

  const handleOpenEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setDealForm({
      name: deal.name,
      pipelineId: deal.pipelineId,
      stageId: deal.stageId,
      value: deal.value,
      currency: deal.currency || "USD",
      expectedCloseDate: deal.expectedCloseDate
        ? new Date(deal.expectedCloseDate).toISOString().slice(0, 10)
        : "",
      notes: deal.notes || "",
    });
    dealModalRef.current?.open();
  };

  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealForm.name || !dealForm.stageId) {
      toast.error("Deal name and stage are required.");
      return;
    }
    try {
      if (editingDeal) {
        await updateDealMutation.mutateAsync({
          id: editingDeal.id,
          ...dealForm,
          value: Number(dealForm.value),
        });
        toast.success("Deal updated!");
      } else {
        await createDealMutation.mutateAsync({
          ...dealForm,
          pipelineId: activePipelineId || dealForm.pipelineId,
          value: Number(dealForm.value),
        });
        toast.success("Deal created!");
      }
      dealModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save deal.");
    }
  };

  const handleMoveStage = async (dealId: string, newStageId: string) => {
    try {
      await moveDealStageMutation.mutateAsync({
        id: dealId,
        stageId: newStageId,
      });
      toast.success("Deal moved.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to move deal.");
    }
  };

  const handleMarkWon = async (deal: Deal) => {
    try {
      await markWonMutation.mutateAsync(deal.id);
      toast.success(`Deal "${deal.name}" marked as Won!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to mark won.");
    }
  };

  const handleMarkLost = async (deal: Deal) => {
    try {
      await markLostMutation.mutateAsync(deal.id);
      toast.success(`Deal "${deal.name}" marked as Lost.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to mark lost.");
    }
  };

  const handleDeleteDeal = async (deal: Deal) => {
    if (!window.confirm(`Delete deal "${deal.name}"?`)) return;
    try {
      await deleteDealMutation.mutateAsync(deal.id);
      toast.success("Deal deleted.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete deal.");
    }
  };

  const handleCreatePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineForm.name) return;
    try {
      const created = await createPipelineMutation.mutateAsync(pipelineForm);
      toast.success("Pipeline created!");
      setSelectedPipelineId(created.id);
      pipelineModalRef.current?.close();
      setPipelineForm({ name: "", description: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create pipeline.");
    }
  };

  const handleCreateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageForm.name || !activePipelineId) return;
    try {
      await addStageMutation.mutateAsync({
        pipelineId: activePipelineId,
        ...stageForm,
      });
      toast.success("Stage added!");
      stageModalRef.current?.close();
      setStageForm({ name: "", color: "#007047" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add stage.");
    }
  };

  const stagesList = activePipeline?.stages || [];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Sales Pipeline & Deals"
        description="Visualize opportunity velocity, track deal progression across stages, and accelerate revenue conversion"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => pipelineModalRef.current?.open()}
            className="btn btn-outline btn-sm gap-2"
          >
            <FolderPlus className="size-4" />
            New Pipeline
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreateDeal()}
            className="btn btn-primary btn-sm gap-2 text-white"
          >
            <PlusCircle className="size-4" />
            Add Deal
          </button>
        </div>
      </PageHeader>

      {/* Pipeline Toolbar & Metrics */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-base-100 p-4 rounded-xl border border-base-200">
        <div className="flex items-center gap-3">
          <Layers className="size-5 text-primary" />
          <div className="font-semibold text-sm">Active Pipeline:</div>
          <select
            value={activePipelineId || ""}
            onChange={(e) => setSelectedPipelineId(e.target.value)}
            className="select select-bordered select-sm font-medium"
            disabled={pipelinesQuery.isLoading}
          >
            {pipelines.length === 0 ? (
              <option value="">No pipelines</option>
            ) : (
              pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isActive ? "" : "(Inactive)"}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            onClick={() => stageModalRef.current?.open()}
            className="btn btn-ghost btn-xs text-primary"
            disabled={!activePipelineId}
          >
            + Add Stage
          </button>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-base-content/60 text-xs">Total Deals: </span>
            <span className="font-bold text-base-content">
              {metrics.totalDeals}
            </span>
          </div>
          <div>
            <span className="text-base-content/60 text-xs">
              Pipeline Value:{" "}
            </span>
            <span className="font-bold text-primary">
              ${metrics.totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD */}
      {pipelines.length === 0 && !pipelinesQuery.isLoading ? (
        <div className="card bg-base-100 border border-base-200 p-12 text-center space-y-4">
          <Kanban className="size-12 mx-auto text-base-content/30" />
          <h3 className="font-semibold text-lg">No Sales Pipelines Found</h3>
          <p className="text-sm text-base-content/60 max-w-md mx-auto">
            Create your first sales pipeline to begin tracking deals and
            visualizing stages.
          </p>
          <button
            type="button"
            onClick={() => pipelineModalRef.current?.open()}
            className="btn btn-primary btn-sm mx-auto text-white"
          >
            Create Pipeline
          </button>
        </div>
      ) : (
        <PageLoader
          query={kanbanQuery}
          loadingText="Loading deals kanban..."
          emptyState={{
            title: "No Stages in Pipeline",
            description:
              "Get started by adding stages to this pipeline (e.g., Prospecting, Qualified, Proposal, Won).",
            actionText: "Add First Stage",
            onAction: () => stageModalRef.current?.open(),
          }}
        >
          {(columns) => (
            <div className="flex gap-4 overflow-x-auto pb-6 items-start">
              {columns.map((col) => {
                const stage = col.stage;
                const deals = col.deals || [];
                return (
                  <div
                    key={stage.id}
                    className="w-80 shrink-0 bg-base-200/50 rounded-2xl border border-base-300 p-3 flex flex-col max-h-[calc(100vh-280px)]"
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between pb-3 px-1 border-b border-base-300/60 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: stage.color || "#007047" }}
                        />
                        <span className="font-semibold text-sm text-base-content">
                          {stage.name}
                        </span>
                        <span className="badge badge-sm badge-neutral font-mono">
                          {col.count ?? deals.length}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-semibold text-base-content/70">
                        ${(col.totalValue || 0).toLocaleString()}
                      </div>
                    </div>

                    {/* Deal Cards Container */}
                    <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                      {deals.map((deal) => {
                        const isWon = deal.status === "won";
                        const isLost = deal.status === "lost";
                        return (
                          <div
                            key={deal.id}
                            className={`card bg-base-100 p-4 shadow-xs border transition-all hover:shadow-md ${
                              isWon
                                ? "border-success/40 bg-success/5"
                                : isLost
                                  ? "border-error/40 bg-error/5"
                                  : "border-base-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                onClick={() => handleOpenEditDeal(deal)}
                                className="font-semibold text-sm text-base-content hover:text-primary cursor-pointer leading-snug line-clamp-2"
                              >
                                {deal.name}
                              </h4>
                              {isWon ? (
                                <span className="badge badge-xs badge-success text-white">
                                  Won
                                </span>
                              ) : isLost ? (
                                <span className="badge badge-xs badge-error text-white">
                                  Lost
                                </span>
                              ) : null}
                            </div>

                            {/* Value and Date */}
                            <div className="flex items-center justify-between mt-3 text-xs">
                              <div className="font-bold text-primary font-mono text-sm">
                                ${deal.value.toLocaleString()}
                              </div>
                              {deal.expectedCloseDate && (
                                <div className="flex items-center gap-1 text-base-content/60">
                                  <Calendar className="size-3" />
                                  {new Date(
                                    deal.expectedCloseDate,
                                  ).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Contact or Lead badge */}
                            {(deal.contact || deal.lead) && (
                              <div className="text-xs text-base-content/70 mt-2 truncate">
                                {deal.contact
                                  ? `${deal.contact.firstName} ${deal.contact.lastName}`
                                  : deal.lead
                                    ? `${deal.lead.firstName} ${deal.lead.lastName} (Lead)`
                                    : ""}
                              </div>
                            )}

                            {/* Move & Action Controls */}
                            <div className="pt-3 mt-3 border-t border-base-200 flex items-center justify-between gap-1 text-xs">
                              {/* Move Stage Selector */}
                              <select
                                value={deal.stageId}
                                onChange={(e) =>
                                  handleMoveStage(deal.id, e.target.value)
                                }
                                className="select select-ghost select-xs p-0 text-base-content/70 hover:text-primary text-[11px]"
                              >
                                {stagesList.map((st) => (
                                  <option key={st.id} value={st.id}>
                                    → {st.name}
                                  </option>
                                ))}
                              </select>

                              <div className="flex items-center gap-1">
                                {!isWon && !isLost && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleMarkWon(deal)}
                                      title="Mark Won"
                                      className="btn btn-ghost btn-xs btn-square text-success hover:bg-success/10"
                                    >
                                      <CheckCircle2 className="size-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMarkLost(deal)}
                                      title="Mark Lost"
                                      className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                                    >
                                      <XCircle className="size-3.5" />
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDeal(deal)}
                                  title="Delete Deal"
                                  className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error"
                                >
                                  <MoreVertical className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Quick Add Deal in Stage */}
                      <button
                        type="button"
                        onClick={() => handleOpenCreateDeal(stage.id)}
                        className="btn btn-ghost btn-sm w-full border border-dashed border-base-300 text-base-content/60 hover:border-primary hover:text-primary"
                      >
                        + Add Deal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PageLoader>
      )}

      {/* CREATE / EDIT DEAL MODAL */}
      <Modal ref={dealModalRef}>
        <div className="w-full max-w-md p-1">
          <form onSubmit={handleSaveDeal} className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <DollarSign className="size-5 text-primary" />
              {editingDeal ? "Edit Deal" : "Create New Deal"}
            </h3>
            <SimpleInput
              label="Deal Title *"
              placeholder="e.g. Acme Corp Enterprise License"
              value={dealForm.name}
              onChange={(e) =>
                setDealForm({ ...dealForm, name: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <SimpleInput
                label="Deal Value ($) *"
                type="number"
                value={dealForm.value}
                onChange={(e) =>
                  setDealForm({ ...dealForm, value: Number(e.target.value) })
                }
                required
              />
              <LocalSelect
                label="Currency"
                value={dealForm.currency}
                onChange={(e) =>
                  setDealForm({ ...dealForm, currency: e.target.value })
                }
                options={[
                  { label: "USD ($)", value: "USD" },
                  { label: "NGN (₦)", value: "NGN" },
                  { label: "EUR (€)", value: "EUR" },
                  { label: "GBP (£)", value: "GBP" },
                ]}
              />
            </div>

            <LocalSelect
              label="Pipeline Stage *"
              value={dealForm.stageId}
              onChange={(e) =>
                setDealForm({ ...dealForm, stageId: e.target.value })
              }
              options={stagesList.map((st) => ({
                label: st.name,
                value: st.id,
              }))}
              required
            />

            <SimpleInput
              label="Expected Close Date"
              type="date"
              value={dealForm.expectedCloseDate}
              onChange={(e) =>
                setDealForm({ ...dealForm, expectedCloseDate: e.target.value })
              }
            />

            <SimpleTextArea
              label="Notes & Next Steps"
              value={dealForm.notes}
              onChange={(e) =>
                setDealForm({ ...dealForm, notes: e.target.value })
              }
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => dealModalRef.current?.close()}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createDealMutation.isPending || updateDealMutation.isPending
                }
                className="btn btn-primary btn-sm text-white"
              >
                {createDealMutation.isPending || updateDealMutation.isPending
                  ? "Saving..."
                  : editingDeal
                    ? "Update Deal"
                    : "Create Deal"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* CREATE PIPELINE MODAL */}
      <Modal ref={pipelineModalRef} title="Create Sales Pipeline">
        <div className="w-full  p-1">
          <form onSubmit={handleCreatePipeline} className="space-y-4">
            <SimpleInput
              label="Pipeline Name *"
              placeholder="e.g. Enterprise Sales, Inbound SMB"
              value={pipelineForm.name}
              onChange={(e) =>
                setPipelineForm({ ...pipelineForm, name: e.target.value })
              }
              required
            />
            <SimpleTextArea
              label="Description"
              placeholder="Target sales cycle and deals managed in this pipeline"
              value={pipelineForm.description}
              onChange={(e) =>
                setPipelineForm({
                  ...pipelineForm,
                  description: e.target.value,
                })
              }
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => pipelineModalRef.current?.close()}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createPipelineMutation.isPending}
                className="btn btn-primary btn-sm text-white"
              >
                {createPipelineMutation.isPending
                  ? "Creating..."
                  : "Create Pipeline"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ADD STAGE MODAL */}
      <Modal ref={stageModalRef}>
        <div className="w-full max-w-md p-1">
          <form onSubmit={handleCreateStage} className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Layers className="size-5 text-primary" /> Add Stage to{" "}
              {activePipeline?.name}
            </h3>
            <SimpleInput
              label="Stage Name *"
              placeholder="e.g. Discovery, Negotiation, Legal Review"
              value={stageForm.name}
              onChange={(e) =>
                setStageForm({ ...stageForm, name: e.target.value })
              }
              required
            />
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Stage Theme Color
              </label>
              <div className="flex items-center gap-3 mt-1.5">
                <input
                  type="color"
                  value={stageForm.color}
                  onChange={(e) =>
                    setStageForm({ ...stageForm, color: e.target.value })
                  }
                  className="size-8 rounded-lg cursor-pointer border border-base-300 bg-transparent p-0"
                />
                <span className="font-mono text-xs text-base-content/70">
                  {stageForm.color}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => stageModalRef.current?.close()}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addStageMutation.isPending}
                className="btn btn-primary btn-sm text-white"
              >
                {addStageMutation.isPending ? "Adding..." : "Add Stage"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
