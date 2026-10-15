import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useChangeAdminPassword, useAdminPermissions } from "@/api/adminApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import { toast } from "sonner";
import { KeyRound, ShieldCheck, Lock } from "lucide-react";

export const Route = createFileRoute("/admin/settings/security/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const changePassword = useChangeAdminPassword();
  const permissionsQuery = useAdminPermissions();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Password Change Card */}
      <div className="card bg-base-100 border border-base-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-base-content">
              Change Admin Password
            </h2>
            <p className="text-xs text-base-content/60">
              Ensure your account uses a strong password to safeguard
              administrative access.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-1.5">
                <Lock className="size-3.5 text-base-content/60" /> Current
                Password
              </span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current account password"
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-1.5">
                  <Lock className="size-3.5 text-base-content/60" /> New
                  Password
                </span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-1.5">
                  <Lock className="size-3.5 text-base-content/60" /> Confirm New
                  Password
                </span>
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="input input-sm input-bordered w-full"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="btn btn-primary btn-sm"
            >
              {changePassword.isPending
                ? "Updating Password..."
                : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Platform Permissions Card */}
      <div className="card bg-base-100 border border-base-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-base-content">
              Platform Permissions Directory
            </h2>
            <p className="text-xs text-base-content/60">
              Complete catalog of granular permissions recognized by Greenmouse
              CRM backend.
            </p>
          </div>
        </div>

        <QueryCompLayout query={permissionsQuery}>
          {(permissions) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
              {permissions.map((perm) => (
                <div
                  key={perm.key}
                  className="p-3 bg-base-200/50 rounded-lg border border-base-200 space-y-1"
                >
                  <span className="font-mono text-xs font-semibold text-primary block">
                    {perm.key}
                  </span>
                  <p className="text-xs text-base-content/70 leading-snug">
                    {perm.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </QueryCompLayout>
      </div>
    </div>
  );
}
