import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/Headers/PageHeader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import {
  usePipelines,
  usePipeline,
  useCreatePipeline,
  useUpdatePipeline,
  useDeletePipeline,
  useAddPipelineStage,
  useUpdatePipelineStage,
  useDeletePipelineStage,
  useReorderPipelineStages,
  type Pipeline,
  type PipelineStage,
} from "@/api/pipelinesAndDealsApi";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/pipelines/")({ component: PipelinesPage });

const emptyPipeline = { name: "", description: "", isActive: true };
const emptyStage = { name: "", color: "#007047", isWon: false, isLost: false };

function PipelinesPage() {
  const pipelinesQuery = usePipelines();
  const pipelines = pipelinesQuery.data || [];
  const [selectedId, setSelectedId] = useState("");
  const activeId = selectedId && pipelines.some((item) => item.id === selectedId)
    ? selectedId
    : pipelines[0]?.id;
  const pipelineQuery = usePipeline(activeId);
  const activePipeline = useMemo(
    () => pipelineQuery.data || pipelines.find((item) => item.id === activeId),
    [pipelineQuery.data, pipelines, activeId],
  );
  const stages = [...(activePipeline?.stages || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const createPipeline = useCreatePipeline();
  const updatePipeline = useUpdatePipeline();
  const deletePipeline = useDeletePipeline();
  const createStage = useAddPipelineStage();
  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();
  const reorderStages = useReorderPipelineStages();

  const pipelineModal = useRef<ModalHandle>(null);
  const stageModal = useRef<ModalHandle>(null);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [pipelineForm, setPipelineForm] = useState(emptyPipeline);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [stageForm, setStageForm] = useState(emptyStage);

  const showError = (error: unknown, fallback: string) => {
    const response = error as { response?: { data?: { message?: string } } };
    toast.error(response.response?.data?.message || fallback);
  };

  const openPipeline = (pipeline?: Pipeline) => {
    setEditingPipeline(pipeline || null);
    setPipelineForm(pipeline
      ? { name: pipeline.name, description: pipeline.description || "", isActive: pipeline.isActive ?? true }
      : emptyPipeline);
    pipelineModal.current?.open();
  };

  const savePipeline = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingPipeline) {
        await updatePipeline.mutateAsync({ id: editingPipeline.id, ...pipelineForm });
        toast.success("Pipeline updated.");
      } else {
        const created = await createPipeline.mutateAsync(pipelineForm);
        if (created?.id) setSelectedId(created.id);
        toast.success("Pipeline created.");
      }
      pipelineModal.current?.close();
    } catch (error) {
      showError(error, "Could not save pipeline.");
    }
  };

  const removePipeline = async () => {
    if (!activePipeline || !window.confirm(`Delete pipeline "${activePipeline.name}"?`)) return;
    try {
      await deletePipeline.mutateAsync(activePipeline.id);
      setSelectedId("");
      toast.success("Pipeline deleted.");
    } catch (error) {
      showError(error, "Could not delete pipeline.");
    }
  };

  const openStage = (stage?: PipelineStage) => {
    setEditingStage(stage || null);
    setStageForm(stage
      ? { name: stage.name, color: stage.color || "#007047", isWon: stage.isWon || false, isLost: stage.isLost || false }
      : emptyStage);
    stageModal.current?.open();
  };

  const saveStage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeId) return;
    try {
      if (editingStage) {
        await updateStage.mutateAsync({ pipelineId: activeId, stageId: editingStage.id, ...stageForm });
        toast.success("Stage updated.");
      } else {
        await createStage.mutateAsync({ pipelineId: activeId, ...stageForm });
        toast.success("Stage added.");
      }
      stageModal.current?.close();
    } catch (error) {
      showError(error, "Could not save stage.");
    }
  };

  const removeStage = async (stage: PipelineStage) => {
    if (!activeId || !window.confirm(`Delete stage "${stage.name}"? Deals in this stage may need to be moved first.`)) return;
    try {
      await deleteStage.mutateAsync({ pipelineId: activeId, stageId: stage.id });
      toast.success("Stage deleted.");
    } catch (error) {
      showError(error, "Could not delete stage. Move its deals first, then retry.");
    }
  };

  const moveStage = async (index: number, direction: -1 | 1) => {
    if (!activeId || index + direction < 0 || index + direction >= stages.length) return;
    const ordered = stages.map((stage) => stage.id);
    [ordered[index], ordered[index + direction]] = [ordered[index + direction], ordered[index]];
    try {
      await reorderStages.mutateAsync({ pipelineId: activeId, stageIds: ordered });
      toast.success("Stage order updated.");
    } catch (error) {
      showError(error, "Could not reorder stages.");
    }
  };

  return <div className="space-y-6 pb-12">
    <PageHeader title="Pipelines" description="Set up sales pipelines and the stages that appear on the deals board.">
      <Link to="/staff/deals" className="btn btn-outline btn-sm">View deals board</Link>
    </PageHeader>

    <section className="bg-base-100 rounded-xl border border-base-200 p-5 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="form-control min-w-52 flex-1 max-w-sm">
          <span className="label-text font-medium mb-1">Pipeline</span>
          <select className="select select-bordered w-full" value={activeId || ""} onChange={(event) => setSelectedId(event.target.value)} disabled={pipelinesQuery.isLoading}>
            {!pipelines.length && <option value="">No pipelines</option>}
            {pipelines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <button type="button" className="btn btn-primary" onClick={() => openPipeline()}><Plus className="size-4" /> New pipeline</button>
      </div>
      {pipelinesQuery.isError && <p role="alert" className="text-error">Could not load pipelines. <button type="button" className="link" onClick={() => pipelinesQuery.refetch()}>Retry</button></p>}
      {pipelinesQuery.isLoading && <p>Loading pipelines...</p>}
      {!pipelinesQuery.isLoading && !pipelinesQuery.isError && !pipelines.length && <p className="text-base-content/70">Create a pipeline to start organizing deals.</p>}
      {activePipeline && <div className="flex flex-wrap items-start justify-between gap-3 border-t border-base-200 pt-5">
        <div><h2 className="text-lg font-semibold">{activePipeline.name}</h2><p className="text-sm text-base-content/70">{activePipeline.description || "No description"}</p><span className={`badge badge-sm mt-2 ${activePipeline.isActive === false ? "badge-ghost" : "badge-success"}`}>{activePipeline.isActive === false ? "Inactive" : "Active"}</span></div>
        <div className="flex gap-2"><button type="button" className="btn btn-sm btn-ghost" onClick={() => openPipeline(activePipeline)}><Pencil className="size-4" /> Edit</button><button type="button" className="btn btn-sm btn-ghost text-error" onClick={removePipeline} disabled={deletePipeline.isPending}><Trash2 className="size-4" /> Delete</button></div>
      </div>}
    </section>

    {activePipeline && <section className="bg-base-100 rounded-xl border border-base-200 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Stages</h2><p className="text-sm text-base-content/70">Their order sets the board column order.</p></div><button type="button" className="btn btn-sm btn-primary" onClick={() => openStage()}><Plus className="size-4" /> Add stage</button></div>
      {pipelineQuery.isError && <p role="alert" className="text-error">Could not load pipeline details. <button type="button" className="link" onClick={() => pipelineQuery.refetch()}>Retry</button></p>}
      {pipelineQuery.isLoading ? <p>Loading stages...</p> : !stages.length ? <p className="text-base-content/70 py-4">No stages yet. Add the first stage to make this pipeline usable on the deals board.</p> : <ol className="divide-y divide-base-200">{stages.map((stage, index) => <li key={stage.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0"><span className="size-3 rounded-full shrink-0" style={{ backgroundColor: stage.color || "#007047" }} /><span className="font-medium truncate">{stage.name}</span>{stage.isWon && <span className="badge badge-success badge-sm">Won</span>}{stage.isLost && <span className="badge badge-error badge-sm">Lost</span>}</div>
        <div className="flex items-center gap-1"><button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Move ${stage.name} earlier`} disabled={index === 0 || reorderStages.isPending} onClick={() => moveStage(index, -1)}><ArrowUp className="size-4" /></button><button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Move ${stage.name} later`} disabled={index === stages.length - 1 || reorderStages.isPending} onClick={() => moveStage(index, 1)}><ArrowDown className="size-4" /></button><button type="button" className="btn btn-ghost btn-sm" onClick={() => openStage(stage)}>Edit</button><button type="button" className="btn btn-ghost btn-sm text-error" disabled={deleteStage.isPending} onClick={() => removeStage(stage)}>Delete</button></div>
      </li>)}</ol>}
    </section>}

    <Modal ref={pipelineModal} title={editingPipeline ? "Edit pipeline" : "New pipeline"}>
      <form onSubmit={savePipeline} className="space-y-4">
        <label className="form-control">Name<input className="input input-bordered w-full" required value={pipelineForm.name} onChange={(event) => setPipelineForm({ ...pipelineForm, name: event.target.value })} /></label>
        <label className="form-control">Description<textarea className="textarea textarea-bordered w-full" value={pipelineForm.description} onChange={(event) => setPipelineForm({ ...pipelineForm, description: event.target.value })} /></label>
        <label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="checkbox checkbox-primary" checked={pipelineForm.isActive} onChange={(event) => setPipelineForm({ ...pipelineForm, isActive: event.target.checked })} /> Active pipeline</label>
        <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={() => pipelineModal.current?.close()}>Cancel</button><button type="submit" className="btn btn-primary" disabled={createPipeline.isPending || updatePipeline.isPending}>Save pipeline</button></div>
      </form>
    </Modal>

    <Modal ref={stageModal} title={editingStage ? "Edit stage" : "Add stage"}>
      <form onSubmit={saveStage} className="space-y-4">
        <label className="form-control">Name<input className="input input-bordered w-full" required value={stageForm.name} onChange={(event) => setStageForm({ ...stageForm, name: event.target.value })} /></label>
        <label className="form-control">Color<input type="color" className="input input-bordered w-20 p-1" value={stageForm.color} onChange={(event) => setStageForm({ ...stageForm, color: event.target.value })} /></label>
        <label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="checkbox checkbox-primary" checked={stageForm.isWon} onChange={(event) => setStageForm({ ...stageForm, isWon: event.target.checked, isLost: event.target.checked ? false : stageForm.isLost })} /> Won stage</label>
        <label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="checkbox checkbox-primary" checked={stageForm.isLost} onChange={(event) => setStageForm({ ...stageForm, isLost: event.target.checked, isWon: event.target.checked ? false : stageForm.isWon })} /> Lost stage</label>
        <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={() => stageModal.current?.close()}>Cancel</button><button type="submit" className="btn btn-primary" disabled={createStage.isPending || updateStage.isPending}>Save stage</button></div>
      </form>
    </Modal>
  </div>;
}
