import CustomTabs from "@/components/CustomTabs";
import { useTabs } from "@/stores/client";
import type { StaffMember } from "@/api/tenantApi";

interface FullInfoProps {
  staff?: StaffMember;
}

export default function FullInfo({ staff }: FullInfoProps) {
  const tabs = [
    { name: "Employee Information" },
    { name: "Role & Access" },
    { name: "Audit Timestamps" },
  ];
  const props = useTabs(tabs, tabs[0]);

  return (
    <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-sm">
      <CustomTabs tabs={tabs} tabProps={props} />
      <div className="mt-6">
        {props.tab.name === "Employee Information" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-base-content/60 font-semibold uppercase">
                First Name
              </p>
              <p className="text-base font-medium text-base-content mt-1">
                {staff?.firstName || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-semibold uppercase">
                Last Name
              </p>
              <p className="text-base font-medium text-base-content mt-1">
                {staff?.lastName || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-semibold uppercase">
                Email Address
              </p>
              <p className="text-base font-medium text-base-content mt-1">
                {staff?.email || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-semibold uppercase">
                Phone Number
              </p>
              <p className="text-base font-medium text-base-content mt-1">
                {staff?.phoneNumber || "—"}
              </p>
            </div>
          </div>
        )}

        {props.tab.name === "Role & Access" && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-base-content/60 font-semibold uppercase">
                Assigned Role
              </p>
              <p className="text-base font-semibold text-base-content mt-1">
                {staff?.role?.name || "Standard Staff"}
              </p>
              {staff?.role?.description && (
                <p className="text-xs text-base-content/60 mt-1">
                  {staff.role.description}
                </p>
              )}
            </div>

            {staff?.role?.permissions && staff.role.permissions.length > 0 && (
              <div>
                <p className="text-xs text-base-content/60 font-semibold uppercase mb-2">
                  Privileges & Permissions ({staff.role.permissions.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {staff.role.permissions.map((perm, i) => (
                    <span
                      key={i}
                      className="badge badge-sm badge-ghost font-mono"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {props.tab.name === "Audit Timestamps" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-base-content/60 font-semibold uppercase">
                Created At
              </p>
              <p className="text-sm font-medium text-base-content mt-1">
                {staff?.createdAt
                  ? new Date(staff.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-semibold uppercase">
                Staff ID
              </p>
              <p className="text-xs font-mono text-base-content/70 mt-1">
                {staff?.id || "—"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
