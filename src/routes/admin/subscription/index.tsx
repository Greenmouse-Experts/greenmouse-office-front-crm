import { useState, useRef, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useAdminSubscriptions,
  useAdminSubscriptionFeatures,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  type SubscriptionPlan,
} from "@/api/adminApi";
import PageHeader from "@/components/Headers/PageHeader";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/layout/PageLoader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { toast } from "sonner";
import {
  PlusCircleIcon,
  Layers,
  Sparkles,
  Plus,
  Search,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/admin/subscription/")({
  component: RouteComponent,
});

const DEFAULT_PLAN_FORM = {
  name: "",
  description: "",
  priceMonthly: 0,
  priceYearly: 0,
  trialDays: 14,
  maxStaff: 3,
  maxContacts: 100,
  maxProducts: 25,
  maxServices: 10,
  maxInvoicesPerMonth: 30,
  maxOrdersPerMonth: 60,
  maxCategories: 10,
  selectedFeatures: ["analytics", "data_export"],
  isCustomPrice: false,
  isActive: true,
};

function RouteComponent() {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState(DEFAULT_PLAN_FORM);
  const [featureSearch, setFeatureSearch] = useState("");
  const [customFeatureInput, setCustomFeatureInput] = useState("");

  const query = useAdminSubscriptions();
  const featuresQuery = useAdminSubscriptionFeatures();
  const createPlan = useCreateSubscriptionPlan();
  const updatePlan = useUpdateSubscriptionPlan();
  const deletePlan = useDeleteSubscriptionPlan();

  const planModalRef = useRef<ModalHandle>(null);

  const featureLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    if (Array.isArray(featuresQuery.data)) {
      featuresQuery.data.forEach((feature: any) => {
        if (!feature || typeof feature !== "object") return;
        const key = feature.key ?? feature.value;
        const label = feature.name ?? feature.label;
        if (typeof key === "string" && typeof label === "string") {
          labels[key] = label;
        }
      });
    }
    return labels;
  }, [featuresQuery.data]);

  // Available feature keys list
  const availableFeatures = useMemo(() => {
    const list = new Set<string>();
    if (Array.isArray(featuresQuery.data)) {
      featuresQuery.data.forEach((f: any) => {
        if (typeof f === "string") list.add(f);
        else if (f && typeof f === "object") {
          const key = f.key ?? f.value;
          if (typeof key === "string") list.add(key);
        }
      });
    }
    // Include any features present in current editing plan or user selections
    formData.selectedFeatures.forEach((f) => list.add(f));
    return Array.from(list);
  }, [featuresQuery.data, formData.selectedFeatures]);

  // Filter the available feature list by name or key.
  const filteredFeatures = useMemo(() => {
    if (!featureSearch.trim()) return availableFeatures;
    const term = featureSearch.toLowerCase();
    return availableFeatures.filter((featKey) => {
      const label = featureLabels[featKey] || featKey;
      return (
        featKey.toLowerCase().includes(term) ||
        label.toLowerCase().includes(term)
      );
    });
  }, [availableFeatures, featureLabels, featureSearch]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData(DEFAULT_PLAN_FORM);
    setFeatureSearch("");
    setCustomFeatureInput("");
    planModalRef.current?.open();
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      priceMonthly: plan.priceMonthly || 0,
      priceYearly: plan.priceYearly || 0,
      trialDays: plan.trialDays || 14,
      maxStaff: plan.maxStaff ?? 3,
      maxContacts: plan.maxContacts ?? 100,
      maxProducts: plan.maxProducts ?? 25,
      maxServices: plan.maxServices ?? 10,
      maxInvoicesPerMonth: plan.maxInvoicesPerMonth ?? 30,
      maxOrdersPerMonth: plan.maxOrdersPerMonth ?? 60,
      maxCategories: plan.maxCategories ?? 10,
      selectedFeatures: plan.features || [],
      isCustomPrice: plan.isCustomPrice || false,
      isActive: plan.isActive !== undefined ? plan.isActive : true,
    });
    setFeatureSearch("");
    setCustomFeatureInput("");
    planModalRef.current?.open();
  };

  const toggleFeature = (featureKey: string) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.selectedFeatures.includes(featureKey);
      return {
        ...prev,
        selectedFeatures: isAlreadySelected
          ? prev.selectedFeatures.filter((f) => f !== featureKey)
          : [...prev.selectedFeatures, featureKey],
      };
    });
  };

  const handleSelectAllFeatures = () => {
    setFormData((prev) => ({
      ...prev,
      selectedFeatures: Array.from(
        new Set([...prev.selectedFeatures, ...availableFeatures]),
      ),
    }));
  };

  const handleClearAllFeatures = () => {
    setFormData((prev) => ({
      ...prev,
      selectedFeatures: [],
    }));
  };

  const handleAddCustomFeature = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanKey = customFeatureInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");

    if (!cleanKey) return;

    if (!formData.selectedFeatures.includes(cleanKey)) {
      setFormData((prev) => ({
        ...prev,
        selectedFeatures: [...prev.selectedFeatures, cleanKey],
      }));
    }
    setCustomFeatureInput("");
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (
      !window.confirm(`Are you sure you want to delete plan "${plan.name}"?`)
    ) {
      return;
    }

    try {
      await deletePlan.mutateAsync(plan.id);
      toast.success(`Plan "${plan.name}" deleted successfully.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete plan.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    const payload: Partial<SubscriptionPlan> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      priceMonthly: formData.isCustomPrice ? 0 : Number(formData.priceMonthly),
      priceYearly: formData.isCustomPrice ? 0 : Number(formData.priceYearly),
      trialDays: Number(formData.trialDays),
      maxStaff: Number(formData.maxStaff),
      maxContacts: Number(formData.maxContacts),
      maxProducts: Number(formData.maxProducts),
      maxServices: Number(formData.maxServices),
      maxInvoicesPerMonth: Number(formData.maxInvoicesPerMonth),
      maxOrdersPerMonth: Number(formData.maxOrdersPerMonth),
      maxCategories: Number(formData.maxCategories),
      features: formData.selectedFeatures,
      isCustomPrice: formData.isCustomPrice,
      isActive: formData.isActive,
    };

    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({
          id: editingPlan.id,
          ...payload,
        });
        toast.success(`Plan "${formData.name}" updated successfully.`);
      } else {
        await createPlan.mutateAsync(payload);
        toast.success(`Plan "${formData.name}" created successfully.`);
      }
      planModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Plan Name",
      render: (_value: string, item: SubscriptionPlan) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
            <Layers className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.name}
            </div>
            <div className="text-sm text-base-content/60 max-w-xs truncate">
              {item.description || "No description provided"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "priceMonthly",
      label: "Monthly / Yearly",
      render: (_value: any, item: SubscriptionPlan) => (
        <div>
          {item.isCustomPrice ? (
            <span className="badge badge-info badge-soft badge-md">
              Custom Price
            </span>
          ) : (
            <div className="text-sm">
              <span className="font-semibold text-base-content">
                ${Number(item.priceMonthly).toLocaleString()}
              </span>
              <span className="text-sm text-base-content/50">/mo</span>
              <div className="text-sm text-base-content/60">
                ${Number(item.priceYearly).toLocaleString()}/yr
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "limits",
      label: "Resource Limits",
      render: (_value: any, item: SubscriptionPlan) => (
        <div className="text-sm space-y-0.5 text-base-content/70">
          <div>
            Staff:{" "}
            <strong>
              {item.maxStaff === -1 ? "Unlimited" : item.maxStaff}
            </strong>
          </div>
          <div>
            Contacts:{" "}
            <strong>
              {item.maxContacts === -1 ? "Unlimited" : item.maxContacts}
            </strong>
          </div>
          <div>
            Products:{" "}
            <strong>
              {item.maxProducts === -1 ? "Unlimited" : item.maxProducts}
            </strong>
          </div>
        </div>
      ),
    },
    {
      key: "features",
      label: "Features",
      render: (features: string[]) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {features && features.length > 0 ? (
            features.map((feat, i) => (
              <span key={i} className="badge badge-xs badge-ghost">
                {featureLabels[feat] || feat}
              </span>
            ))
          ) : (
            <span className="text-sm text-base-content/40">Standard</span>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (value: boolean) => (
        <span
          className={`badge badge-md ${
            value ? "badge-success text-success-content" : "badge-ghost"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions: Actions<SubscriptionPlan>[] = [
    {
      key: "edit",
      label: "Edit Plan",
      action: (item: SubscriptionPlan) => {
        handleOpenEdit(item);
      },
    },
    {
      key: "delete",
      label: "Delete Plan",
      render: () => <span className="text-error font-medium">Delete Plan</span>,
      action: (item: SubscriptionPlan) => {
        handleDelete(item);
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Subscription Plans"
        description="Configure subscription tiers, pricing, and resource allocations for tenant businesses."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/subscription/features"
            className="btn btn-sm btn-ghost border border-base-300"
          >
            <Sparkles className="size-4" /> Feature Catalog
          </Link>
          <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
            <PlusCircleIcon className="size-4" /> Create Plan
          </button>
        </div>
      </PageHeader>

      <SimpleContainer title="Platform Subscription Tiers">
        <PageLoader query={query}>
          {(response) => (
            <CustomTable
              ring={false}
              data={response.data}
              columns={columns}
              actions={actions}
            />
          )}
        </PageLoader>
      </SimpleContainer>

      {/* Create / Edit Plan Modal */}
      <Modal
        ref={planModalRef}
        title={
          editingPlan
            ? `Edit Plan: ${editingPlan.name}`
            : "Create Subscription Plan"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Basic Plan Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
              <span>Plan Overview</span>
            </h4>

            <div className="space-y-3">
              <div>
                <label className="label py-1">
                  <span className="label-text font-semibold text-sm">
                    Plan Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Starter, Growth, Enterprise"
                  className="input input-sm input-bordered w-full"
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text font-semibold text-sm">
                    Description
                  </span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief summary of who this plan is suitable for"
                  className="textarea textarea-bordered textarea-sm w-full"
                  rows={2}
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-base-200 bg-base-100 hover:bg-base-200/40 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <div>
                    <div className="text-sm font-semibold">Active Tier</div>
                    <div className="text-xs text-base-content/60">
                      Visible to tenant businesses for subscription
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-base-200 bg-base-100 hover:bg-base-200/40 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isCustomPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isCustomPrice: e.target.checked,
                      })
                    }
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <div>
                    <div className="text-sm font-semibold">
                      Enterprise / Custom Pricing
                    </div>
                    <div className="text-xs text-base-content/60">
                      Requires direct sales consultation
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 2: Pricing & Trial */}
          <div className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Pricing & Trial
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label py-1">
                  <span className="label-text font-semibold text-sm">
                    Monthly Price ($)
                  </span>
                </label>
                <input
                  type="number"
                  disabled={formData.isCustomPrice}
                  value={formData.priceMonthly}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceMonthly: Number(e.target.value),
                    })
                  }
                  className="input input-sm input-bordered w-full disabled:bg-base-200 disabled:opacity-60"
                  min={0}
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text font-semibold text-sm">
                    Yearly Price ($)
                  </span>
                </label>
                <input
                  type="number"
                  disabled={formData.isCustomPrice}
                  value={formData.priceYearly}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceYearly: Number(e.target.value),
                    })
                  }
                  className="input input-sm input-bordered w-full disabled:bg-base-200 disabled:opacity-60"
                  min={0}
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text font-semibold text-sm">
                    Trial Period (Days)
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.trialDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trialDays: Number(e.target.value),
                    })
                  }
                  className="input input-sm input-bordered w-full"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Resource Quotas & Limits */}
          <div className="space-y-3 pt-2 border-t border-base-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                Resource Allocations
              </h4>
              <span className="text-xs text-base-content/50 flex items-center gap-1">
                <HelpCircle className="size-3" /> Set -1 for unlimited
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Max Staff
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.maxStaff}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxStaff: Number(e.target.value),
                    })
                  }
                  className="input input-sm input-bordered w-full"
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Max Contacts
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.maxContacts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxContacts: Number(e.target.value),
                    })
                  }
                  className="input input-sm input-bordered w-full"
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Max Products
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.maxProducts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxProducts: Number(e.target.value),
                    })
                  }
                  className="input input-sm input-bordered w-full"
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Max Services
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.maxServices}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxServices: Number(e.target.value),
                    })
                  }
                  className="input input-sm input-bordered w-full"
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Invoices / Mo
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.maxInvoicesPerMonth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxInvoicesPerMonth: Number(e.target.value),
                    })
                  }
                  className="input input-sm input-bordered w-full"
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Orders / Mo
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.maxOrdersPerMonth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxOrdersPerMonth: Number(e.target.value),
                    })
                  }
                  className="input input-sm input-bordered w-full"
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Categories
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.maxCategories}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxCategories: Number(e.target.value),
                    })
                  }
                  className="input input-sm input-bordered w-full"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Feature Entitlements */}
          <div className="space-y-3 pt-2 border-t border-base-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                  Feature Entitlements
                </h4>
                <span className="badge badge-sm badge-primary badge-outline font-semibold">
                  {formData.selectedFeatures.length} active
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllFeatures}
                  className="text-primary hover:underline font-medium"
                >
                  Select All
                </button>
                <span className="text-base-content/30">·</span>
                <button
                  type="button"
                  onClick={handleClearAllFeatures}
                  className="text-base-content/60 hover:text-base-content"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Feature Search Filter & Quick Custom Add */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-base-content/40 pointer-events-none" />
                <input
                  type="text"
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  placeholder="Filter available features..."
                  aria-label="Filter available features"
                  className="input input-sm input-bordered w-full pl-8"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customFeatureInput}
                  onChange={(e) => setCustomFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomFeature();
                    }
                  }}
                  placeholder="Add custom slug..."
                  aria-label="Custom feature key"
                  className="input input-sm input-bordered w-36 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomFeature()}
                  disabled={!customFeatureInput.trim()}
                  className="btn btn-sm btn-ghost border border-base-300 gap-1 shrink-0"
                >
                  <Plus className="size-3" /> Add
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-base-200 bg-base-100">
              <div className="flex items-center justify-between border-b border-base-200 bg-base-200/50 px-3 py-2 text-xs text-base-content/70">
                <span>Available features</span>
                <span>{filteredFeatures.length} shown</span>
              </div>
              {filteredFeatures.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-base-content/60">
                  No features match "{featureSearch}". Use the input above to
                  add it.
                </div>
              ) : (
                <ul className="max-h-64 divide-y divide-base-200 overflow-y-auto">
                  {filteredFeatures.map((featKey) => {
                    const isSelected =
                      formData.selectedFeatures.includes(featKey);
                    const label = featureLabels[featKey] || featKey;

                    return (
                      <li key={featKey}>
                        <label
                          className={`flex min-h-14 cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-base-200/60 focus-within:bg-base-200/60 ${
                            isSelected ? "bg-primary/5" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFeature(featKey)}
                            className="checkbox checkbox-primary checkbox-sm shrink-0"
                          />
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="text-sm font-medium text-base-content">
                              {label}
                            </span>
                            {featureLabels[featKey] && (
                              <span className="break-all font-mono text-xs text-base-content/60">
                                {featKey}
                              </span>
                            )}
                          </span>
                          {isSelected && (
                            <span className="shrink-0 text-xs font-medium text-primary">
                              Included
                            </span>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={() => planModalRef.current?.close()}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPlan.isPending || updatePlan.isPending}
              className="btn btn-sm btn-primary"
            >
              {createPlan.isPending || updatePlan.isPending
                ? "Saving..."
                : editingPlan
                  ? "Update Plan"
                  : "Create Plan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
