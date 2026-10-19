import { Pencil } from "lucide-react";
import type { StaffProfile } from "@/api/tenantApi";

interface UserInfoProps {
  profile: StaffProfile;
  onEdit: () => void;
}

export default function UserInfo({ profile, onEdit }: UserInfoProps) {
  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-5 sm:p-6">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-semibold text-primary">
        {profile.profilePic ? (
          <img src={profile.profilePic} alt={`${name || "User"} profile`} className="size-full object-cover" />
        ) : (
          <span aria-hidden="true">{initials || "U"}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-xl font-semibold">{name || "Staff member"}</h2>
        <p className="truncate text-sm text-base-content/70">{profile.email}</p>
        {profile.role?.name && <p className="mt-1 text-sm text-base-content/70">{profile.role.name}</p>}
      </div>
      <button type="button" className="btn btn-outline btn-sm" onClick={onEdit}>
        <Pencil className="size-4" /> Edit profile
      </button>
    </section>
  );
}
