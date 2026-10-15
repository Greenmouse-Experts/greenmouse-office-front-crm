import { User, Mail, Phone, Shield } from "lucide-react";
import type { StaffMember } from "@/api/tenantApi";

interface UserInfoProps {
  staff?: StaffMember;
}

export default function UserInfo({ staff }: UserInfoProps) {
  const fullName = staff
    ? `${staff.firstName} ${staff.lastName}`
    : "Staff Member";
  const roleName = staff?.role?.name || "Staff";

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start p-6 bg-base-100 border border-base-200 shadow-sm rounded-2xl gap-6">
      <div className="avatar">
        <div className="size-28 rounded-2xl ring-4 ring-primary/20 ring-offset-2 overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-semibold text-2xl">
          {staff?.profilePic ? (
            <img
              src={staff.profilePic}
              alt={fullName}
              className="object-cover w-full h-full"
            />
          ) : (
            <User className="size-12" />
          )}
        </div>
      </div>

      <div className="flex-1 text-center sm:text-left space-y-3">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <h2 className="text-2xl font-semibold text-base-content">
              {fullName}
            </h2>
            <span
              className={`badge badge-sm font-semibold capitalize ${
                staff?.status === "active"
                  ? "badge-success text-white"
                  : "badge-ghost"
              }`}
            >
              {staff?.status || "active"}
            </span>
          </div>
          <p className="text-sm font-medium text-primary flex items-center justify-center sm:justify-start gap-1 mt-1">
            <Shield className="size-3.5" />
            {roleName}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2 border-t border-base-200">
          <div className="flex items-center gap-2 text-base-content/80">
            <Mail className="size-4 text-primary shrink-0" />
            <span className="truncate">{staff?.email || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-base-content/80">
            <Phone className="size-4 text-primary shrink-0" />
            <span>{staff?.phoneNumber || "No phone provided"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
