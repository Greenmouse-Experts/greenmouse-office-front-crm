import { useStaff } from "@/api/adminApi";

interface UserInfoProps {
  id?: string;
}

export default function UserInfo({ id }: UserInfoProps) {
  const query = useStaff(id || "");
  const staff = query.data;

  const fullName = staff
    ? `${staff.firstName || ""} ${staff.lastName || ""}`.trim() || staff.email
    : "Staff Member";

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start px-8 py-8 bg-base-100 shadow-md rounded-xl gap-8 border border-base-200">
      <figure className="w-32 h-32 rounded-full overflow-hidden shrink-0 ring-4 ring-primary ring-offset-2 bg-primary/10 flex items-center justify-center">
        {staff?.profilePic ? (
          <img
            src={staff.profilePic}
            alt={fullName}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-4xl font-semibold text-primary">
            {fullName.charAt(0).toUpperCase()}
          </span>
        )}
      </figure>

      <div className="card-body p-0 text-center sm:text-left flex-1">
        <h2 className="card-title text-2xl font-semibold text-base-content mb-1">
          {fullName}
        </h2>
        <p className="text-sm font-semibold text-primary mb-4">
          {staff?.role?.name || "Administrator"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <span className="font-medium text-base-content/60 w-32 shrink-0">
              Email
            </span>
            <span className="text-base-content font-medium break-all">
              {staff?.email || "—"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-base-content/60 w-32 shrink-0">
              Phone
            </span>
            <span className="text-base-content font-medium">
              {staff?.phoneNumber || "—"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-base-content/60 w-32 shrink-0">
              Status
            </span>
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
          <div className="flex items-center">
            <span className="font-medium text-base-content/60 w-32 shrink-0">
              Member Since
            </span>
            <span className="text-base-content font-medium">
              {staff?.createdAt
                ? new Date(staff.createdAt).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
