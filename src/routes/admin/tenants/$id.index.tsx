import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  useAdminTenant,
  useAdminTenantHistory,
  useAdminTenantLoginActivity,
  useAdminTenantOnboarding,
  useAdminTenantReminders,
} from "@/api/adminApi";
import CustomTabs from "@/components/CustomTabs";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import { useTabs, type Tab } from "@/stores/client";
import TenantProfile from "./-components/TenantProfile";
import TenantRelatedPanel from "./-components/TenantRelatedPanel";

export const Route = createFileRoute("/admin/tenants/$id/")({
  component: RouteComponent,
});

const tabs: Tab[] = [
  { name: "Overview" },
  { name: "Subscription history" },
  { name: "Login activity" },
  { name: "Onboarding" },
  { name: "Reminders" },
];

function RouteComponent() {
  const { id } = Route.useParams();
  const tab = useTabs(tabs, tabs[0]);
  const tenantQuery = useAdminTenant(id);
  const historyQuery = useAdminTenantHistory(
    tab.tab.name === "Subscription history" ? id : undefined,
  );
  const loginQuery = useAdminTenantLoginActivity(
    tab.tab.name === "Login activity" ? id : undefined,
  );
  const onboardingQuery = useAdminTenantOnboarding(
    tab.tab.name === "Onboarding" ? id : undefined,
  );
  const remindersQuery = useAdminTenantReminders(
    tab.tab.name === "Reminders" ? id : undefined,
  );

  return (
    <div className="space-y-5 pb-12">
      <div>
        <Link to="/admin/tenants" className="btn btn-ghost btn-sm -ml-2 mb-2">
          <ArrowLeft className="size-4" aria-hidden="true" /> All tenants
        </Link>
        <h1 className="text-2xl font-semibold text-base-content">
          {tenantQuery.data?.companyName || "Tenant details"}
        </h1>
        <p className="mt-1 text-sm text-base-content/70">
          Account, subscription, access, and onboarding information.
        </p>
      </div>

      <QueryCompLayout query={tenantQuery}>
        {(tenant) => (
          <>
            <div className="flex flex-wrap gap-2">
              <span className={`badge badge-sm capitalize ${tenant.status === "active" ? "badge-success" : "badge-error"}`}>
                {tenant.status || "Unknown status"}
              </span>
              <span className="badge badge-sm badge-outline capitalize">
                {tenant.subscriptionStatus || "No subscription"}
              </span>
              <span className="badge badge-sm badge-outline">
                {tenant.isOnboarded ? "Onboarded" : "Onboarding pending"}
              </span>
            </div>

            <nav className="overflow-x-auto rounded-xl border border-base-200 bg-base-100 p-1" aria-label="Tenant details">
              <CustomTabs tabs={tabs} tabProps={tab} />
            </nav>

            {tab.tab.name === "Overview" && <TenantProfile tenant={tenant} />}
            {tab.tab.name === "Subscription history" && (
              <TenantRelatedPanel
                title="Subscription history"
                description="Recent plan and billing changes for this tenant."
                emptyMessage="No subscription changes have been recorded."
                query={historyQuery}
                mode="timeline"
              />
            )}
            {tab.tab.name === "Login activity" && (
              <TenantRelatedPanel
                title="Login activity"
                description="Recent access events for this tenant."
                emptyMessage="No login activity has been recorded."
                query={loginQuery}
                mode="timeline"
              />
            )}
            {tab.tab.name === "Onboarding" && (
              <TenantRelatedPanel
                title="Onboarding"
                description="Current setup and completion details."
                emptyMessage="No onboarding details are available."
                query={onboardingQuery}
                mode="details"
              />
            )}
            {tab.tab.name === "Reminders" && (
              <TenantRelatedPanel
                title="Reminders"
                description="Current reminder preferences and settings."
                emptyMessage="No reminder preferences are available."
                query={remindersQuery}
                mode="details"
              />
            )}
          </>
        )}
      </QueryCompLayout>
    </div>
  );
}
