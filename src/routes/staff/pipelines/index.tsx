import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
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

export const Route = createFileRoute("/staff/pipelines/")({
  component: PipelinesPage,
});

type PipelineFormValues = { name: string; description: string };
type StageFormValues = {
  name: string;
  color: string;
  isWon: boolean;
  isLost: boolean;
};

const emptyPipeline: PipelineFormValues = { name: "", description: "" };
const emptyStage: StageFormValues = {
  name: "",
  color: "#007047",
  isWon: false,
  isLost: false,
};

function PipelinesPage() {
  const pipelinesQuery = usePipelines();
  const pipelines = pipelinesQuery.data || [];
  const [selectedId, setSelectedId] = useState("");
  const activeId =
    selectedId && pipelines.some((item) => item.id === selectedId)
      ? selectedId
      : pipelines[0]?.id;
  const pipelineQuery = usePipeline(activeId);

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
  const pipelineForm = useForm<PipelineFormValues>({
    defaultValues: emptyPipeline,
  });
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const stageForm = useForm<StageFormValues>({ defaultValues: emptyStage });

  const showError = (error: unknown, fallback: string) => {
    const response = error as { response?: { data?: { message?: string } } };
    toast.error(response.response?.data?.message || fallback);
  };

  const openPipeline = (pipeline?: Pipeline) => {
    setEditingPipeline(pipeline || null);
    pipelineForm.reset(
      pipeline
        ? {
            name: pipeline.name,
            description: pipeline.description || "",
          }
        : emptyPipeline,
    );
    pipelineModal.current?.open();
  };

  const savePipeline = async (values: PipelineFormValues) => {
    try {
      if (editingPipeline) {
        await updatePipeline.mutateAsync({
          id: editingPipeline.id,
          ...values,
        });
        toast.success("Pipeline updated.");
      } else {
        const created = await createPipeline.mutateAsync(values);
        if (created?.id) setSelectedId(created.id);
        toast.success("Pipeline created.");
      }
      pipelineModal.current?.close();
    } catch (error) {
      showError(error, "Could not save pipeline.");
    }
  };

  const removePipeline = async (pipeline: Pipeline) => {
    if (!window.confirm(`Delete pipeline "${pipeline.name}"?`)) return;
    try {
      await deletePipeline.mutateAsync(pipeline.id);
      setSelectedId("");
      toast.success("Pipeline deleted.");
    } catch (error) {
      showError(error, "Could not delete pipeline.");
    }
  };

  const openStage = (stage?: PipelineStage) => {
    setEditingStage(stage || null);
    stageForm.reset(
      stage
        ? {
            name: stage.name,
            color: stage.color || "#007047",
            isWon: stage.isWon || false,
            isLost: stage.isLost || false,
          }
        : emptyStage,
    );
    stageModal.current?.open();
  };

  const saveStage = async (values: StageFormValues) => {
    if (!activeId) return;
    try {
      if (editingStage) {
        await updateStage.mutateAsync({
          pipelineId: activeId,
          stageId: editingStage.id,
          ...values,
        });
        toast.success("Stage updated.");
      } else {
        await createStage.mutateAsync({ pipelineId: activeId, ...values });
        toast.success("Stage added.");
      }
      stageModal.current?.close();
    } catch (error) {
      showError(error, "Could not save stage.");
    }
  };

  const removeStage = async (stage: PipelineStage) => {
    if (
      !activeId ||
      !window.confirm(
        `Delete stage "${stage.name}"? Deals in this stage may need to be moved first.`,
      )
    )
      return;
    try {
      await deleteStage.mutateAsync({
        pipelineId: activeId,
        stageId: stage.id,
      });
      toast.success("Stage deleted.");
    } catch (error) {
      showError(
        error,
        "Could not delete stage. Move its deals first, then retry.",
      );
    }
  };

  const moveStage = async (
    stages: PipelineStage[],
    index: number,
    direction: -1 | 1,
  ) => {
    if (
      !activeId ||
      index + direction < 0 ||
      index + direction >= stages.length
    )
      return;
    const ordered = stages.map((stage) => stage.id);
    [ordered[index], ordered[index + direction]] = [
      ordered[index + direction],
      ordered[index],
    ];
    try {
      await reorderStages.mutateAsync({
        pipelineId: activeId,
        stageIds: ordered,
      });
      toast.success("Stage order updated.");
    } catch (error) {
      showError(error, "Could not reorder stages.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Pipelines"
        description="Set up sales pipelines and the stages that appear on the deals board."
      >
        <Link to="/staff/deals" className="btn btn-outline btn-sm">
          View deals board
        </Link>
      </PageHeader>

      <PageLoader query={pipelinesQuery} loadingText="Loading pipelines...">
        {(loadedPipelines) => (
          <>
            <section className="bg-base-100 rounded-xl border border-base-200 p-5 space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <label className="form-control min-w-52 flex-1 max-w-sm">
                  <span className="label-text font-medium mb-1">Pipeline</span>
                  <select
                    className="select select-bordered w-full"
                    value={activeId || ""}
                    onChange={(event) => setSelectedId(event.target.value)}
                  >
                    {!loadedPipelines.length && (
                      <option value="">No pipelines</option>
                    )}
                    {loadedPipelines.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => openPipeline()}
                >
                  <Plus className="size-4" /> New pipeline
                </button>
              </div>
              {!loadedPipelines.length && (
                <p className="text-base-content/70">
                  Create a pipeline to start organizing deals.
                </p>
              )}
            </section>

            {activeId && (
              <QueryCompLayout query={pipelineQuery}>
                {(pipeline) => {
                  const stages = [...(pipeline.stages || [])].sort(
                    (a, b) => (a.order ?? 0) - (b.order ?? 0),
                  );
                  return (
                    <>
                      <section className="bg-base-100 rounded-xl border border-base-200 p-5 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold">
                            {pipeline.name}
                          </h2>
                          <p className="text-sm text-base-content/70">
                            {pipeline.description || "No description"}
                          </p>
                          <span
                            className={`badge badge-sm mt-2 ${pipeline.isActive === false ? "badge-ghost" : "badge-success"}`}
                          >
                            {pipeline.isActive === false
                              ? "Inactive"
                              : "Active"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            onClick={() => openPipeline(pipeline)}
                          >
                            <Pencil className="size-4" /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost text-error"
                            onClick={() => removePipeline(pipeline)}
                            disabled={deletePipeline.isPending}
                          >
                            <Trash2 className="size-4" /> Delete
                          </button>
                        </div>
                      </section>
                      <section className="bg-base-100 rounded-xl border border-base-200 p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold">Stages</h2>
                            <p className="text-sm text-base-content/70">
                              Their order sets the board column order.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => openStage()}
                          >
                            <Plus className="size-4" /> Add stage
                          </button>
                        </div>
                        {!stages.length ? (
                          <p className="text-base-content/70 py-4">
                            No stages yet. Add the first stage to make this
                            pipeline usable on the deals board.
                          </p>
                        ) : (
                          <ol className="divide-y divide-base-200">
                            {stages.map((stage, index) => (
                              <li
                                key={stage.id}
                                className="py-3 flex flex-wrap items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className="size-3 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: stage.color || "#007047",
                                    }}
                                  />
                                  <span className="font-medium truncate">
                                    {stage.name}
                                  </span>
                                  {stage.isWon && (
                                    <span className="badge badge-success badge-sm">
                                      Won
                                    </span>
                                  )}
                                  {stage.isLost && (
                                    <span className="badge badge-error badge-sm">
                                      Lost
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm btn-square"
                                    aria-label={`Move ${stage.name} earlier`}
                                    disabled={
                                      index === 0 || reorderStages.isPending
                                    }
                                    onClick={() => moveStage(stages, index, -1)}
                                  >
                                    <ArrowUp className="size-4" />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm btn-square"
                                    aria-label={`Move ${stage.name} later`}
                                    disabled={
                                      index === stages.length - 1 ||
                                      reorderStages.isPending
                                    }
                                    onClick={() => moveStage(stages, index, 1)}
                                  >
                                    <ArrowDown className="size-4" />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => openStage(stage)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm text-error"
                                    disabled={deleteStage.isPending}
                                    onClick={() => removeStage(stage)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ol>
                        )}
                      </section>
                    </>
                  );
                }}
              </QueryCompLayout>
            )}
          </>
        )}
      </PageLoader>

      <Modal
        ref={pipelineModal}
        title={editingPipeline ? "Edit pipeline" : "New pipeline"}
      >
        <FormProvider {...pipelineForm}>
          <form
            onSubmit={pipelineForm.handleSubmit(savePipeline)}
            className="space-y-4"
          >
            <SimpleInput
              label="Name"
              required
              {...pipelineForm.register("name", {
                required: "Name is required",
              })}
            />
            <SimpleTextArea
              label="Description"
              {...pipelineForm.register("description")}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => pipelineModal.current?.close()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createPipeline.isPending || updatePipeline.isPending}
              >
                Save pipeline
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <Modal ref={stageModal} title={editingStage ? "Edit stage" : "Add stage"}>
        <FormProvider {...stageForm}>
          <form
            onSubmit={stageForm.handleSubmit(saveStage)}
            className="space-y-4"
          >
            <SimpleInput
              label="Name"
              required
              {...stageForm.register("name", { required: "Name is required" })}
            />
            <label className="form-control">
              Color
              <input
                type="color"
                className="input input-bordered w-20 p-1"
                {...stageForm.register("color")}
              />
            </label>
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                {...stageForm.register("isWon", {
                  onChange: (event) => {
                    if (event.target.checked)
                      stageForm.setValue("isLost", false);
                  },
                })}
              />{" "}
              Won stage
            </label>
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                {...stageForm.register("isLost", {
                  onChange: (event) => {
                    if (event.target.checked)
                      stageForm.setValue("isWon", false);
                  },
                })}
              />{" "}
              Lost stage
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => stageModal.current?.close()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createStage.isPending || updateStage.isPending}
              >
                Save stage
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </div>
  );
}
