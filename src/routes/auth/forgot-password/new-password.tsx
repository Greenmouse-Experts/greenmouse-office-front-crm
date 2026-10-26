import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useResetOwnerPassword, type ResetOwnerPasswordPayload } from "@/api/passwordApi";

export const Route = createFileRoute("/auth/forgot-password/new-password")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { email: string } => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
});

function RouteComponent() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();
  const resetPassword = useResetOwnerPassword();
  const form = useForm<ResetOwnerPasswordPayload>({
    defaultValues: { email, otp: "", newPassword: "", confirmNewPassword: "" },
  });

  const submit = async (values: ResetOwnerPasswordPayload) => {
    try {
      await resetPassword.mutateAsync({ ...values, email: values.email.trim(), otp: values.otp.trim() });
      toast.success("Password reset. Sign in with your new password.");
      navigate({ to: "/auth/login", search: { email: values.email.trim() } });
    } catch (error) {
      const response = error as { response?: { data?: { message?: string | string[] } }; message?: string };
      const message = response.response?.data?.message;
      toast.error((Array.isArray(message) ? message.join(". ") : message) || response.message || "Could not reset your password.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-base-100 p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary"><KeyRound className="size-5" aria-hidden="true" /></div>
          <div>
            <h1 className="text-xl font-semibold">Reset Owner password</h1>
            <p className="mt-1 text-sm text-base-content/70">Enter the code sent to your email and choose a new password.</p>
          </div>
        </div>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <SimpleInput label="Owner email" type="email" autoComplete="email"
              {...form.register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
              })} />
            <SimpleInput label="Reset code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456"
              {...form.register("otp", { required: "Reset code is required" })} />
            <SimpleInput label="New password" type="password" autoComplete="new-password"
              {...form.register("newPassword", {
                required: "New password is required",
                minLength: { value: 6, message: "Use at least 6 characters" },
              })} />
            <SimpleInput label="Confirm new password" type="password" autoComplete="new-password"
              {...form.register("confirmNewPassword", {
                required: "Confirm your new password",
                validate: (value) => value === form.getValues("newPassword") || "Passwords do not match",
              })} />
            <button type="submit" className="btn btn-primary w-full" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </FormProvider>
        <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
          <Link to="/auth/forgot-password" search={{ account: "owner", email: form.watch("email") }} className="link link-primary">Request another code</Link>
          <Link to="/auth/login" className="link link-primary">Back to sign in</Link>
        </div>
      </div>
    </main>
  );
}
