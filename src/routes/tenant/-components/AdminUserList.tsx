import SimpleContainer from "@/components/SimpleContainer";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import { Link } from "@tanstack/react-router";
import { useStaffs, type StaffMember } from "@/api/tenantApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import { Users } from "lucide-react";

export default function AdminUserList() {
  const query = useStaffs();

  const columns: columnType[] = [
    {
      key: "name",
      label: "Staff Member",
      render: (_value: string, item: StaffMember) => {
        const fullName =
          `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
          "Staff Member";
        const initials =
          `${item.firstName?.[0] || ""}${item.lastName?.[0] || ""}`.toUpperCase() ||
          "S";
        return (
          <div className="flex items-center gap-3">
            {item.profilePic ? (
              <div className="avatar">
                <div className="mask mask-squircle w-10 h-10">
                  <img src={item.profilePic} alt={fullName} />
                </div>
              </div>
            ) : (
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                {initials}
              </div>
            )}
            <div>
              <div className="font-semibold text-sm text-base-content leading-tight">
                {fullName}
              </div>
              <div className="text-xs text-base-content/60">{item.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      label: "Role",
      render: (_value: any, item: StaffMember) => (
        <span className="badge badge-sm badge-soft badge-primary font-medium">
          {item.role?.name || "Staff"}
        </span>
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
      key: "status",
      label: "Status",
      render: (value: string) => {
        const isActive = (value || "active").toLowerCase() === "active";
        return (
          <span
            className={`badge badge-sm ${
              isActive
                ? "badge-success text-success-content"
                : "badge-ghost text-base-content/60"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
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
        title="Workspace Team"
        actions={
          <Link to="/tenant/users" className="btn btn-primary btn-sm">
            Manage Staff
          </Link>
        }
      >
        <QueryCompLayout query={query}>
          {(staffs) => {
            const recent = (staffs || []).slice(0, 5);
            if (recent.length === 0) {
              return (
                <div className="text-center py-10 space-y-2">
                  <div className="p-3 bg-base-200 rounded-full w-fit mx-auto text-base-content/40">
                    <Users className="size-6" />
                  </div>
                  <p className="text-sm font-semibold text-base-content/70">
                    No team members added yet
                  </p>
                  <p className="text-xs text-base-content/50">
                    Invite colleagues and assign roles to collaborate across
                    your workspace.
                  </p>
                  <Link
                    to="/tenant/users/add"
                    className="btn btn-sm btn-primary mt-2"
                  >
                    Add Staff Member
                  </Link>
                </div>
              );
            }

            return <CustomTable ring={false} data={recent} columns={columns} />;
          }}
        </QueryCompLayout>
      </SimpleContainer>
    </div>
  );
}
