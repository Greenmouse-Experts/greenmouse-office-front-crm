import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import ConfirmModal, {
  type ConfirmModalHandle,
} from "@/components/ConfirmModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import FormattedPriceInput from "@/components/inputs/FormattedPriceInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import PageLoader from "@/components/layout/PageLoader";
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

const STATUS_BADGES: Record<LeadStatus, string> = {
  new: "badge-info",
  contacted: "badge-warning",
  qualified: "badge-success",
  unqualified: "badge-error",
  converted: "badge-neutral",
};

const SOURCE_LABELS: Record<LeadSource, string> = {
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
  const confirmRef = useRef<ConfirmModalHandle>(null);

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
  const leadsQuery = useLeads({
    status: statusFilter !== "all" ? statusFilter : undefined,
    source: sourceFilter !== "all" ? sourceFilter : undefined,
  });
  const leads = leadsQuery.data || [];

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
      toast.error("First and last names are required.");
      return;
    }
    try {
      await createLeadMutation.mutateAsync({
        ...formData,
        score: Number(formData.score) || 0,
      });
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
      source: lead.source || "website",
      status: lead.status || "new",
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
        score: Number(formData.score) || 0,
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
          ? Number(convertData.initialValue) || 0
          : undefined,
      });
      toast.success(
        res?.message || "Lead converted to active customer & deal!",
      );
      convertModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert lead.");
    }
  };

  const handleDelete = async (lead: Lead) => {
    const name = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
    const confirmed = await confirmRef.current?.confirm({
      title: "Delete lead",
      message: `Are you sure you want to delete lead "${name}"? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteLeadMutation.mutateAsync(lead.id);
      toast.success("Lead deleted successfully.");
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
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("CSV export downloaded!");
    } catch (err: any) {
      toast.error("Failed to export leads.");
    }
  };

  // Table columns definition
  const columns = [
    {
      key: "name",
      label: "Lead Name",
      render: (_: any, lead: Lead) => (
        <div className="flex flex-col">
          <span className="font-semibold text-base-content hover:text-primary cursor-pointer">
            {lead.firstName} {lead.lastName}
          </span>
          {lead.email && (
            <span className="text-xs text-base-content/60 flex items-center gap-1 mt-0.5">
              <Mail className="size-3" /> {lead.email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "company",
      label: "Company & Phone",
      render: (_: any, lead: Lead) => (
        <div className="flex flex-col text-xs space-y-0.5">
          {lead.companyName ? (
            <span className="font-medium text-base-content flex items-center gap-1">
              <Building2 className="size-3 text-base-content/60" />{" "}
              {lead.companyName}
            </span>
          ) : (
            <span className="text-base-content/40 italic">Individual</span>
          )}
          {lead.phone && (
            <span className="text-base-content/60 flex items-center gap-1">
              <Phone className="size-3" /> {lead.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (source: LeadSource) => (
        <span className="badge badge-sm badge-ghost font-medium">
          {SOURCE_LABELS[source] || source}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: LeadStatus) => (
        <span
          className={`badge badge-sm capitalize text-white ${
            STATUS_BADGES[status] || "badge-neutral"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      key: "score",
      label: "Score",
      render: (score: number = 0) => {
        const color =
          score >= 75
            ? "progress-success"
            : score >= 40
              ? "progress-warning"
              : "progress-error";
        return (
          <div className="flex items-center gap-2 max-w-[120px]">
            <progress
              className={`progress ${color} w-16 h-2`}
              value={score}
              max="100"
            />
            <span className="text-xs font-mono font-semibold">{score}</span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (date: string) => (
        <span className="text-xs text-base-content/60">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions: Actions[] = [
    {
      key: "edit",
      label: "Edit Lead",
      action: (lead: Lead) => handleOpenEdit(lead),
    },
    {
      key: "convert",
      label: "Convert Lead",
      action: (lead: Lead) => handleOpenConvert(lead),
    },
    {
      key: "delete",
      label: "Delete",
      action: (lead: Lead) => handleDelete(lead),
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
      <SimpleContainer
        title={
          <div className="flex items-center gap-2">
            <span>Leads Directory</span>
            {leads.length > 0 && (
              <span className="badge badge-sm badge-neutral font-mono">
                {filteredLeads.length}
              </span>
            )}
          </div>
        }
      >
        <ContainerRow
          searchProps={searchProps}
          showSearch
          searchPlaceholder="Search leads by name, email, company..."
        >
          <div className="flex items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-bordered select-sm min-w-36 font-medium text-xs bg-base-100"
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
              className="select select-bordered select-sm min-w-36 font-medium text-xs bg-base-100"
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

        <PageLoader
          query={leadsQuery}
          loadingText="Loading leads..."
          emptyState={{
            title: "No Leads Found",
            description:
              "No prospects found. Capture potential customers to start tracking leads.",
            actionText: "Add Lead",
            onAction: handleOpenCreate,
          }}
        >
          {(leadsData) => {
            const list = Array.isArray(leadsData) ? leadsData : [];
            const q = (searchProps.search || "").toLowerCase().trim();
            const displayed = q
              ? list.filter((l) => {
                  const name =
                    `${l.firstName || ""} ${l.lastName || ""}`.toLowerCase();
                  const email = (l.email || "").toLowerCase();
                  const company = (l.companyName || "").toLowerCase();
                  const phone = (l.phone || "").toLowerCase();
                  return (
                    name.includes(q) ||
                    email.includes(q) ||
                    company.includes(q) ||
                    phone.includes(q)
                  );
                })
              : list;

            return (
              <CustomTable
                ring={false}
                columns={columns}
                data={displayed}
                actions={actions}
              />
            );
          }}
        </PageLoader>
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
                label="Lead Source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source: e.target.value as LeadSource,
                  })
                }
                options={[
                  { label: "Website", value: "website" },
                  { label: "Referral", value: "referral" },
                  { label: "Social Media", value: "social_media" },
                  { label: "Direct", value: "direct" },
                  { label: "Campaign", value: "campaign" },
                  { label: "Cold Call", value: "cold_call" },
                  { label: "Other", value: "other" },
                ]}
              />
              <LocalSelect
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as LeadStatus,
                  })
                }
                options={[
                  { label: "New", value: "new" },
                  { label: "Contacted", value: "contacted" },
                  { label: "Qualified", value: "qualified" },
                  { label: "Unqualified", value: "unqualified" },
                  { label: "Converted", value: "converted" },
                ]}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Lead Score ({formData.score}/100)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) =>
                  setFormData({ ...formData, score: Number(e.target.value) })
                }
                className="range range-primary range-sm w-full mt-2"
              />
            </div>
            <SimpleTextArea
              label="Notes & Observations"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => createModalRef.current?.close()}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLeadMutation.isPending}
                className="btn btn-primary btn-sm text-white"
              >
                {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* EDIT LEAD MODAL */}
      <Modal
        ref={editModalRef}
        title={
          <>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Edit className="size-5 text-primary" /> Edit Lead
            </h3>
          </>
        }
      >
        <div className="w-full max-w-xl p-1">
          <form onSubmit={handleEditSubmit} className="space-y-4">
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
                label="Lead Source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source: e.target.value as LeadSource,
                  })
                }
                options={[
                  { label: "Website", value: "website" },
                  { label: "Referral", value: "referral" },
                  { label: "Social Media", value: "social_media" },
                  { label: "Direct", value: "direct" },
                  { label: "Campaign", value: "campaign" },
                  { label: "Cold Call", value: "cold_call" },
                  { label: "Other", value: "other" },
                ]}
              />
              <LocalSelect
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as LeadStatus,
                  })
                }
                options={[
                  { label: "New", value: "new" },
                  { label: "Contacted", value: "contacted" },
                  { label: "Qualified", value: "qualified" },
                  { label: "Unqualified", value: "unqualified" },
                  { label: "Converted", value: "converted" },
                ]}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Lead Score ({formData.score}/100)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) =>
                  setFormData({ ...formData, score: Number(e.target.value) })
                }
                className="range range-primary range-sm w-full mt-2"
              />
            </div>
            <SimpleTextArea
              label="Notes & Observations"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => editModalRef.current?.close()}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateLeadMutation.isPending}
                className="btn btn-primary btn-sm text-white"
              >
                {updateLeadMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* CONVERT LEAD MODAL */}
      <Modal ref={convertModalRef}>
        <div className="w-full max-w-md p-1">
          <form onSubmit={handleConvertSubmit} className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ArrowRightLeft className="size-5 text-primary" /> Convert Lead to
              Customer
            </h3>
            <p className="text-sm text-base-content/70">
              Converting{" "}
              <strong>
                {selectedLead?.firstName} {selectedLead?.lastName}
              </strong>{" "}
              will create a CRM Customer contact record and mark the lead as
              converted.
            </p>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  checked={convertData.createDeal}
                  onChange={(e) =>
                    setConvertData({
                      ...convertData,
                      createDeal: e.target.checked,
                    })
                  }
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="label-text font-semibold">
                  Also create an Opportunity / Deal
                </span>
              </label>
            </div>

            {convertData.createDeal && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <LocalSelect
                  label="Sales Pipeline *"
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
                  options={pipelines.map((p) => ({
                    label: p.name,
                    value: p.id,
                  }))}
                  required
                />

                {selectedPipeline?.stages && (
                  <LocalSelect
                    label="Starting Stage *"
                    value={convertData.stageId}
                    onChange={(e) =>
                      setConvertData({
                        ...convertData,
                        stageId: e.target.value,
                      })
                    }
                    options={selectedPipeline.stages.map((st) => ({
                      label: st.name,
                      value: st.id,
                    }))}
                    required
                  />
                )}

                <FormattedPriceInput
                  label="Initial Opportunity Value (₦)"
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => convertModalRef.current?.close()}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={convertLeadMutation.isPending}
                className="btn btn-primary btn-sm text-white"
              >
                {convertLeadMutation.isPending
                  ? "Converting..."
                  : "Convert Lead"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <ConfirmModal ref={confirmRef} />
    </div>
  );
}
