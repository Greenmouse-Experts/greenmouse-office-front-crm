import { useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useAdminTenants,
  useAdminTenantStats,
  useToggleTenantStatus,
  useAssignTenantSubscription,
  useAdminSubscriptions,
  type Tenant,
} from "@/api/adminApi";
import PageHeader from "@/components/Headers/PageHeader";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/layout/PageLoader";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SearchBar from "@/components/Searchbar";
import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/tenants/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const statsQuery = useAdminTenantStats();
  const tenantsQuery = useAdminTenants({
    search: searchTerm || undefined,
    status: statusFilter,
    subscriptionStatus: subFilter,
  });

  const { data: plansData } = useAdminSubscriptions({ isActive: true });
  const toggleStatus = useToggleTenantStatus();
  const assignSubscription = useAssignTenantSubscription();

  const planModalRef = useRef<ModalHandle>(null);

  const handleToggleStatus = async (tenant: Tenant) => {
    const isSuspending = tenant.status === "active";
    const confirmMessage = isSuspending
      ? `Are you sure you want to suspend "${tenant.companyName}"?`
      : `Activate "${tenant.companyName}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await toggleStatus.mutateAsync(tenant.id);
      toast.success(
        isSuspending
          ? `Tenant "${tenant.companyName}" suspended.`
          : `Tenant "${tenant.companyName}" activated.`,
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update tenant status.",
      );
    }
  };

  const handleOpenPlanModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setSelectedPlanId(tenant.subscriptionPlanId || "");
    setBillingCycle((tenant.billingCycle as "monthly" | "yearly") || "monthly");
    planModalRef.current?.open();
  };

  const handleAssignPlan = async () => {
    if (!selectedTenant || !selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }

    try {
      await assignSubscription.mutateAsync({
        id: selectedTenant.id,
        subscriptionPlanId: selectedPlanId,
        billingCycle,
      });
      toast.success(`Plan updated for "${selectedTenant.companyName}"`);
      planModalRef.current?.close();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update subscription plan.",
      );
    }
  };

  const columns = [
    {
      key: "companyName",
      label: "Tenant Company",
      render: (_value: string, item: Tenant) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
            <Building2 className="size-5" />
          </div>
          <div>
            <Link
              to="/admin/tenants/$id"
              params={{ id: item.id }}
              className="font-semibold text-base-content leading-tight hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {item.companyName || "Unnamed Business"}
            </Link>
            <div className="text-sm text-base-content/60">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      label: "Contact",
      render: (value: string) => (
        <span className="text-sm text-base-content/70">{value || "—"}</span>
      ),
    },
    {
      key: "subscriptionStatus",
      label: "Plan Status",
      render: (value: string, item: Tenant) => {
        const isTrial = value === "trial";
        const isActive = value === "active";
        // return <>{value}</>;
        return (
          <div className="flex flex-col gap-0.5">
            <span
              className={`badge badge-md font-semibold w-fit ${
                isActive
                  ? "badge-success badge-soft"
                  : isTrial
                    ? "badge-warning badge-soft"
                    : "badge-ghost"
              }`}
            >
              {value ? value.toUpperCase() : "NO PLAN"}
            </span>
            {item.billingCycle && (
              <span className="text-[10px] text-base-content/50 capitalize">
                {item.billingCycle} billing
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Account Status",
      render: (value: string) => (
        <span
          className={`badge badge-md font-medium ${
            value === "active"
              ? "badge-success text-success-content"
              : "badge-error text-error-content"
          }`}
        >
          {value === "active" ? "Active" : "Suspended"}
        </span>
      ),
    },
    {
      key: "isEmailVerified",
      label: "Verified",
      render: (value: boolean) => (
        <span
          className={`badge badge-xs gap-1 font-medium ${
            value ? "badge-success badge-soft" : "badge-neutral badge-soft"
          }`}
        >
          {value ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Registered",
      render: (value: string) => (
        <span className="text-sm text-base-content/60">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Tenant>[] = [
    {
      key: "view-details",
      label: "View Details",
      action: (item: Tenant) => {
        navigate({ to: "/admin/tenants/$id", params: { id: item.id } });
      },
    },
    {
      key: "change-plan",
      label: "Assign Plan",
      action: (item: Tenant) => {
        handleOpenPlanModal(item);
      },
    },
    {
      key: "toggle-status",
      label: "Toggle Status",
      render: (item: Tenant) => (
        <span
          className={
            item.status === "active"
              ? "text-error font-medium"
              : "text-success font-medium"
          }
        >
          {item.status === "active" ? "Suspend Tenant" : "Activate Tenant"}
        </span>
      ),
      action: (item: Tenant) => {
        handleToggleStatus(item);
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Business Tenants"
        description="Manage customer accounts, active subscriptions, and account statuses across Greenmouse CRM."
      />

      {/* Tenant Stats Row */}
      <QueryCompLayout query={statsQuery}>
        {(stats) => {
          const summary = [
            { title: "Total Tenants", value: stats.total },
            { title: "Active", value: stats.active },
            { title: "On Trial", value: stats.trial },
            { title: "Suspended", value: stats.suspended },
            { title: "Verified", value: stats.verified },
          ];
          return (
            <SummaryGrid>
              {summary.map((item, index) => (
                <SummaryCard key={index} item={item} />
              ))}
            </SummaryGrid>
          );
        }}
      </QueryCompLayout>

      {/* Filters & Table */}
      <SimpleContainer
        title={
          <div className="flex items-center gap-2">
            <span>Registered Businesses</span>
            {tenantsQuery.data && (
              <span className="badge badge-md badge-ghost">
                {tenantsQuery.data.length}
              </span>
            )}
          </div>
        }
      >
        <div className="p-4 border-b border-base-200 flex flex-wrap items-center justify-between gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by company or email..."
            className="flex-1 min-w-[240px]"
          />

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-sm select-bordered"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>

            <select
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
              className="select select-sm select-bordered"
            >
              <option value="all">All Subscriptions</option>
              <option value="active">Active Subscriptions</option>
              <option value="trial">Trial Accounts</option>
            </select>
          </div>
        </div>

        <PageLoader query={tenantsQuery}>
          {(tenants) => (
            <CustomTable
              ring={false}
              data={tenants}
              columns={columns}
              actions={actions}
            />
          )}
        </PageLoader>
      </SimpleContainer>

      {/* Assign Subscription Modal */}
      <Modal
        ref={planModalRef}
        title="Assign Subscription Plan"
        actions={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => planModalRef.current?.close()}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssignPlan}
              disabled={assignSubscription.isPending || !selectedPlanId}
              className="btn btn-sm btn-primary"
            >
              {assignSubscription.isPending ? "Updating..." : "Save Plan"}
            </button>
          </div>
        }
      >
        {selectedTenant && (
          <div className="space-y-4">
            <p className="text-sm text-base-content/70">
              Update the subscription tier and billing cycle for{" "}
              <strong className="text-base-content">
                {selectedTenant.companyName}
              </strong>
              .
            </p>

            <div className="space-y-3">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Select Subscription Plan
                  </span>
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">-- Choose a Plan --</option>
                  {plansData?.data.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — ${plan.priceMonthly}/mo (Yearly: $
                      {plan.priceYearly})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Billing Cycle
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`btn btn-sm ${
                      billingCycle === "monthly" ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    className={`btn btn-sm ${
                      billingCycle === "yearly" ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
