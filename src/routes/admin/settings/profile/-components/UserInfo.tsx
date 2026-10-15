import { type AdminProfile } from "@/api/adminApi";
import { ShieldCheck, Mail, Phone, Calendar } from "lucide-react";

export default function UserInfo({ profile }: { profile: AdminProfile }) {
  const displayName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="card bg-base-100 p-6 border border-base-200">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="avatar">
          <div className="w-20 h-20 rounded-2xl bg-primary text-primary-content flex items-center justify-center text-2xl font-semibold shadow-md ring ring-primary/20 ring-offset-2 ring-offset-base-100">
            {profile.profilePic ? (
              <img
                src={profile.profilePic}
                alt={displayName}
                className="rounded-2xl"
              />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-semibold text-base-content">
              {displayName}
            </h2>
            <span className="badge badge-primary badge-soft font-semibold gap-1">
              <ShieldCheck className="size-3.5" /> Super Admin
            </span>
          </div>

          <p className="text-sm text-base-content/70">
            {profile.bio || "Platform Administrator & System Manager"}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-base-content/60">
            <div className="flex items-center gap-1.5">
              <Mail className="size-3.5" />
              <span>{profile.email}</span>
            </div>
            {profile.phoneNumber && (
              <div className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                <span>{profile.phoneNumber}</span>
              </div>
            )}
            {profile.lastLoginAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>
                  Last login:{" "}
                  {new Date(profile.lastLoginAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
