import { createFileRoute, Link } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useStaffProfile } from "@/api/tenantApi";
import {
  useChangeOwnerPassword,
  useChangeStaffPassword,
  type ChangePasswordPayload,
} from "@/api/passwordApi";

export const Route = createFileRoute("/staff/settings/security/")({
  component: RouteComponent,
});

function RouteComponent() {
  const profile = useStaffProfile();
  const changeStaffPassword = useChangeStaffPassword();
  const changeOwnerPassword = useChangeOwnerPassword();
  const form = useForm<ChangePasswordPayload>({
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });
  const isOwner = profile.data?.role?.name?.toLowerCase() === "owner";
  const isSaving = changeStaffPassword.isPending || changeOwnerPassword.isPending;

  const save = async (values: ChangePasswordPayload) => {
    try {
      if (isOwner) {
        await changeOwnerPassword.mutateAsync(values);
      } else {
        await changeStaffPassword.mutateAsync(values);
      }
      form.reset();
      toast.success("Password changed successfully.");
    } catch (error) {
      const response = error as { response?: { data?: { message?: string | string[] } }; message?: string };
      const message = response.response?.data?.message;
      toast.error((Array.isArray(message) ? message.join(". ") : message) || response.message || "Could not change your password.");
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-5 rounded-xl bg-base-100 p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <KeyRound className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Change password</h1>
          <p className="mt-1 text-sm text-base-content/70">Enter your current password, then choose a new one.</p>
        </div>
      </div>

      {profile.isError && (
        <div role="alert" className="alert alert-error alert-soft text-sm">
          Could not identify your account. <button type="button" className="link" onClick={() => profile.refetch()}>Try again</button>
        </div>
      )}

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(save)} className="space-y-4">
          <SimpleInput label="Current password" type="password" autoComplete="current-password"
            {...form.register("currentPassword", { required: "Current password is required" })} />
          <SimpleInput label="New password" type="password" autoComplete="new-password"
            {...form.register("newPassword", {
              required: "New password is required",
              minLength: { value: 6, message: "Use at least 6 characters" },
              validate: (value) => value !== form.getValues("currentPassword") || "Choose a different password",
            })} />
          <SimpleInput label="Confirm new password" type="password" autoComplete="new-password"
            {...form.register("confirmNewPassword", {
              required: "Confirm your new password",
              validate: (value) => value === form.getValues("newPassword") || "Passwords do not match",
            })} />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {isOwner ? (
              <Link to="/auth/forgot-password" search={{ account: "owner", email: profile.data?.email }} className="link link-primary text-sm">
                Forgot your current password?
              </Link>
            ) : <span className="text-sm text-base-content/60">Forgot your password? Contact your workspace owner.</span>}
            <button type="submit" className="btn btn-primary" disabled={isSaving || profile.isPending || profile.isError}>
              {isSaving ? "Saving..." : "Change password"}
            </button>
          </div>
        </form>
      </FormProvider>
    </section>
  );
}
