import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import { useSearch } from "@/stores/data";
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useConvertLead,
  exportLeadsToCsv,
  type Lead,
  type LeadStatus,
  type LeadSource,
} from "@/api/leadsApi";
import { usePipelines } from "@/api/pipelinesAndDealsApi";
import {
  PlusCircle,
  Download,
  Target,
  Building2,
  Mail,
  Phone,
  ArrowRightLeft,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/leads/")({
  component: LeadsPageComponent,
});

const STATUS_BADGES: Record<string, string> = {
  new: "badge-info",
  contacted: "badge-primary",
  qualified: "badge-secondary",
  unqualified: "badge-neutral",
  converted: "badge-success",
};

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  social_media: "Social Media",
  direct: "Direct",
  campaign: "Campaign",
  cold_call: "Cold Call",
  other: "Other",
};

function LeadsPageComponent() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const searchProps = useSearch();

  // Dialog Refs
  const createModalRef = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);
  const convertModalRef = useRef<ModalHandle>(null);

  // Active items for modals
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Form states for creating/editing
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    source: "website" as LeadSource,
    status: "new" as LeadStatus,
    score: 50,
    notes: "",
  });

  // Convert form state
  const [convertData, setConvertData] = useState({
    createDeal: true,
    pipelineId: "",
    stageId: "",
    initialValue: 0,
  });

  // API Queries & Mutations
  const { data: leads = [] } = useLeads({
    status: statusFilter !== "all" ? statusFilter : undefined,
    source: sourceFilter !== "all" ? sourceFilter : undefined,
  });

  const { data: pipelines = [] } = usePipelines();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const convertLeadMutation = useConvertLead();

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const qualifiedCount = leads.filter((l) => l.status === "qualified").length;
    const convertedCount = leads.filter((l) => l.status === "converted").length;
    return { total, newCount, qualifiedCount, convertedCount };
  }, [leads]);

  // Client-side search filtering
  const filteredLeads = useMemo(() => {
    const q = (searchProps.search || "").toLowerCase().trim();
    if (!q) return leads;
    return leads.filter((l) => {
      const name = `${l.firstName || ""} ${l.lastName || ""}`.toLowerCase();
      const email = (l.email || "").toLowerCase();
      const company = (l.companyName || "").toLowerCase();
      const phone = (l.phone || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        company.includes(q) ||
        phone.includes(q)
      );
    });
  }, [leads, searchProps.search]);

  // Handlers
  const handleOpenCreate = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      source: "website",
      status: "new",
      score: 50,
      notes: "",
    });
    createModalRef.current?.open();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      toast.error("First name and Last name are required.");
      return;
    }
    try {
      await createLeadMutation.mutateAsync(formData);
      toast.success("Lead created successfully!");
      createModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create lead.");
    }
  };

  const handleOpenEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      companyName: lead.companyName || "",
      source: (lead.source as LeadSource) || "website",
      status: (lead.status as LeadStatus) || "new",
      score: lead.score ?? 50,
      notes: lead.notes || "",
    });
    editModalRef.current?.open();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await updateLeadMutation.mutateAsync({
        id: selectedLead.id,
        ...formData,
      });
      toast.success("Lead updated successfully!");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update lead.");
    }
  };

  const handleOpenConvert = (lead: Lead) => {
    setSelectedLead(lead);
    const firstPipeline = pipelines[0];
    const firstStage = firstPipeline?.stages?.[0];
    setConvertData({
      createDeal: true,
      pipelineId: firstPipeline?.id || "",
      stageId: firstStage?.id || "",
      initialValue: 1000,
    });
    convertModalRef.current?.open();
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      const res = await convertLeadMutation.mutateAsync({
        id: selectedLead.id,
        createDeal: convertData.createDeal,
        pipelineId: convertData.createDeal ? convertData.pipelineId : undefined,
        stageId: convertData.createDeal ? convertData.stageId : undefined,
        initialValue: convertData.createDeal
          ? Number(convertData.initialValue)
          : undefined,
      });
      toast.success(res.message || "Lead converted to customer successfully!");
      convertModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert lead.");
    }
  };

  const handleDelete = async (lead: Lead) => {
    const name = `${lead.firstName} ${lead.lastName}`;
    if (!window.confirm(`Are you sure you want to delete lead "${name}"?`)) {
      return;
    }
    try {
      await deleteLeadMutation.mutateAsync(lead.id);
      toast.success(`Lead "${name}" deleted.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete lead.");
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await exportLeadsToCsv({
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Leads CSV exported.");
    } catch {
      toast.error("Failed to export CSV.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Lead Name",
      render: (_value: any, item: Lead) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
            {item.firstName?.[0]}
            {item.lastName?.[0]}
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.firstName} {item.lastName}
            </div>
            <div className="text-xs text-base-content/60 flex items-center gap-1.5 mt-0.5">
              {item.email && (
                <span className="flex items-center gap-1">
                  <Mail className="size-3" /> {item.email}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      label: "Company & Phone",
      render: (_value: any, item: Lead) => (
        <div className="space-y-0.5">
          <div className="text-xs font-medium text-base-content flex items-center gap-1">
            <Building2 className="size-3 text-base-content/50" />
            {item.companyName || "—"}
          </div>
          {item.phone && (
            <div className="text-xs text-base-content/60 flex items-center gap-1">
              <Phone className="size-3 text-base-content/40" />
              {item.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (_value: any, item: Lead) => (
        <span className="badge badge-sm badge-soft badge-outline">
          {SOURCE_LABELS[item.source || ""] || item.source || "Unknown"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_value: any, item: Lead) => (
        <span
          className={`badge badge-sm font-medium capitalize ${
            STATUS_BADGES[item.status] || "badge-ghost"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "score",
      label: "Score",
      render: (_value: any, item: Lead) => {
        const score = item.score ?? 50;
        const color =
          score >= 70
            ? "progress-success"
            : score >= 40
              ? "progress-warning"
              : "progress-error";
        return (
          <div className="flex items-center gap-2">
            <progress
              className={`progress ${color} w-16 h-2`}
              value={score}
              max="100"
            />
            <span className="text-xs font-mono font-medium">{score}</span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (_value: any, item: Lead) => (
        <span className="text-xs text-base-content/70">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions: Actions<Lead>[] = [
    {
      key: "convert",
      label: "Convert to Customer",
      action: (item: Lead) => handleOpenConvert(item),
    },
    {
      key: "edit",
      label: "Edit Lead",
      action: (item: Lead) => handleOpenEdit(item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item: Lead) => handleDelete(item),
    },
  ];

  const selectedPipeline = pipelines.find(
    (p) => p.id === convertData.pipelineId,
  );

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Leads Management"
        description="Capture potential customers, monitor conversion funnel scores, and turn qualified prospects into active deals"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="btn btn-outline btn-sm gap-2"
          >
            <Download className="size-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm gap-2 text-white"
          >
            <PlusCircle className="size-4" />
            Add Lead
          </button>
        </div>
      </PageHeader>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-base-100 border border-base-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-base-content/60">
            Total Leads
          </div>
          <div className="text-2xl font-bold mt-1 text-primary">
            {metrics.total}
          </div>
        </div>
        <div className="card bg-base-100 border border-base-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-base-content/60">
            New Prospects
          </div>
          <div className="text-2xl font-bold mt-1 text-info">
            {metrics.newCount}
          </div>
        </div>
        <div className="card bg-base-100 border border-base-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-base-content/60">
            Qualified Leads
          </div>
          <div className="text-2xl font-bold mt-1 text-secondary">
            {metrics.qualifiedCount}
          </div>
        </div>
        <div className="card bg-base-100 border border-base-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-base-content/60">
            Converted
          </div>
          <div className="text-2xl font-bold mt-1 text-success">
            {metrics.convertedCount}
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <SimpleContainer>
        <ContainerRow searchProps={searchProps} showSearch>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-bordered select-sm rounded-lg"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="unqualified">Unqualified</option>
              <option value="converted">Converted</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="select select-bordered select-sm rounded-lg"
            >
              <option value="all">All Sources</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="social_media">Social Media</option>
              <option value="direct">Direct</option>
              <option value="campaign">Campaign</option>
              <option value="cold_call">Cold Call</option>
              <option value="other">Other</option>
            </select>
          </div>
        </ContainerRow>

        <CustomTable columns={columns} data={filteredLeads} actions={actions} />
      </SimpleContainer>

      {/* CREATE LEAD MODAL */}
      <Modal ref={createModalRef}>
        <div className="w-full max-w-xl p-1">
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Target className="size-5 text-primary" /> Create New Lead
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <SimpleInput
                label="First Name *"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
              <SimpleInput
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SimpleInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <SimpleInput
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <SimpleInput
              label="Company Name"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <LocalSelect
                label="Source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source: e.target.value as LeadSource,
                  })
                }
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="direct">Direct</option>
                <option value="campaign">Campaign</option>
                <option value="cold_call">Cold Call</option>
                <option value="other">Other</option>
              </LocalSelect>
              <LocalSelect
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as LeadStatus,
                  })
                }
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
              </LocalSelect>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-base-content/80">
                Lead Score (0 - 100):{" "}
                <span className="font-bold">{formData.score}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) =>
                  setFormData({ ...formData, score: Number(e.target.value) })
                }
                className="range range-primary range-sm"
              />
            </div>
            <SimpleTextArea
              label="Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add relevant prospect background..."
            />
            <div className="modal-action">
              <button
                type="button"
                onClick={() => createModalRef.current?.close()}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLeadMutation.isPending}
                className="btn btn-primary text-white"
              >
                {createLeadMutation.isPending ? "Saving..." : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* EDIT LEAD MODAL */}
      <Modal ref={editModalRef}>
        <div className="w-full max-w-xl p-1">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Edit className="size-5 text-primary" /> Edit Lead
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <SimpleInput
                label="First Name *"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
              <SimpleInput
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SimpleInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <SimpleInput
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <SimpleInput
              label="Company Name"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <LocalSelect
                label="Source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source: e.target.value as LeadSource,
                  })
                }
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="direct">Direct</option>
                <option value="campaign">Campaign</option>
                <option value="cold_call">Cold Call</option>
                <option value="other">Other</option>
              </LocalSelect>
              <LocalSelect
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as LeadStatus,
                  })
                }
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
                <option value="converted">Converted</option>
              </LocalSelect>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-base-content/80">
                Lead Score (0 - 100):{" "}
                <span className="font-bold">{formData.score}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) =>
                  setFormData({ ...formData, score: Number(e.target.value) })
                }
                className="range range-primary range-sm"
              />
            </div>
            <SimpleTextArea
              label="Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
            <div className="modal-action">
              <button
                type="button"
                onClick={() => editModalRef.current?.close()}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateLeadMutation.isPending}
                className="btn btn-primary text-white"
              >
                {updateLeadMutation.isPending ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* CONVERT LEAD MODAL */}
      <Modal ref={convertModalRef}>
        <div className="w-full max-w-lg p-1">
          <form onSubmit={handleConvertSubmit} className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ArrowRightLeft className="size-5 text-success" /> Convert Lead to
              Customer
            </h3>
            <p className="text-sm text-base-content/70">
              Converting{" "}
              <span className="font-semibold text-base-content">
                {selectedLead?.firstName} {selectedLead?.lastName}
              </span>{" "}
              will create an official customer record. You can also create an
              associated deal in your sales pipeline.
            </p>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-base-200/50 rounded-xl border border-base-200">
              <input
                type="checkbox"
                checked={convertData.createDeal}
                onChange={(e) =>
                  setConvertData({
                    ...convertData,
                    createDeal: e.target.checked,
                  })
                }
                className="checkbox checkbox-primary"
              />
              <span className="text-sm font-medium">
                Create an opportunity / deal in pipeline
              </span>
            </label>

            {convertData.createDeal && (
              <div className="space-y-3 pt-2">
                <LocalSelect
                  label="Target Pipeline"
                  value={convertData.pipelineId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    const pl = pipelines.find((p) => p.id === pId);
                    setConvertData({
                      ...convertData,
                      pipelineId: pId,
                      stageId: pl?.stages?.[0]?.id || "",
                    });
                  }}
                >
                  {pipelines.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name}
                    </option>
                  ))}
                </LocalSelect>

                {selectedPipeline &&
                  selectedPipeline.stages &&
                  selectedPipeline.stages.length > 0 && (
                    <LocalSelect
                      label="Initial Stage"
                      value={convertData.stageId}
                      onChange={(e) =>
                        setConvertData({
                          ...convertData,
                          stageId: e.target.value,
                        })
                      }
                    >
                      {selectedPipeline.stages.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </LocalSelect>
                  )}

                <SimpleInput
                  label="Initial Deal Value ($)"
                  type="number"
                  value={convertData.initialValue}
                  onChange={(e) =>
                    setConvertData({
                      ...convertData,
                      initialValue: Number(e.target.value),
                    })
                  }
                />
              </div>
            )}

            <div className="modal-action">
              <button
                type="button"
                onClick={() => convertModalRef.current?.close()}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={convertLeadMutation.isPending}
                className="btn btn-success text-white"
              >
                {convertLeadMutation.isPending
                  ? "Converting..."
                  : "Convert Lead"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
