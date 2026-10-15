import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import { Link } from "@tanstack/react-router";
import { useAdminTenants, type Tenant } from "@/api/adminApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import { Building2 } from "lucide-react";

export default function AdminUserList() {
  const query = useAdminTenants();

  const columns = [
    {
      key: "companyName",
      label: "Tenant Company",
      render: (_value: string, item: Tenant) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
            <Building2 className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.companyName || "Unnamed Business"}
            </div>
            <div className="text-xs text-base-content/60">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone",
      render: (value: string) => (
        <span className="text-xs text-base-content/70">{value || "—"}</span>
      ),
    },
    {
      key: "subscriptionStatus",
      label: "Subscription",
      render: (value: string) => {
        const isTrial = value === "trial";
        const isActive = value === "active";
        return (
          <span
            className={`badge badge-sm font-medium ${
              isActive
                ? "badge-success badge-soft"
                : isTrial
                  ? "badge-warning badge-soft"
                  : "badge-ghost"
            }`}
          >
            {value ? value.toUpperCase() : "N/A"}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Account Status",
      render: (value: string) => (
        <span
          className={`badge badge-sm ${
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
      key: "createdAt",
      label: "Joined",
      render: (value: string) => (
        <span className="text-xs text-base-content/60">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SimpleContainer
        title="Recent Business Tenants"
        actions={
          <Link to="/admin/tenants" className="btn btn-primary btn-sm">
            View All Tenants
          </Link>
        }
      >
        <QueryCompLayout query={query}>
          {(tenants) => {
            const recentTenants = tenants.slice(0, 5);
            return (
              <CustomTable
                ring={false}
                data={recentTenants}
                columns={columns}
              />
            );
          }}
        </QueryCompLayout>
      </SimpleContainer>
    </div>
  );
}
