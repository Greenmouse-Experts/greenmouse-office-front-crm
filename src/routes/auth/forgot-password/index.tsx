import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useRequestOwnerPasswordReset } from "@/api/passwordApi";

type Account = "owner" | "staff" | "admin";

export const Route = createFileRoute("/auth/forgot-password/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { email?: string; account: Account } => ({
    email: typeof search.email === "string" ? search.email : undefined,
    account: search.account === "staff" || search.account === "admin" ? search.account : "owner",
  }),
});

function RouteComponent() {
  const { email, account } = Route.useSearch();
  const navigate = useNavigate();
  const requestReset = useRequestOwnerPasswordReset();
  const form = useForm<{ email: string }>({ defaultValues: { email: email || "" } });
  const loginPath = account === "staff" ? "/auth/staff" : account === "admin" ? "/auth/admin" : "/auth/login";

  const submit = async ({ email: address }: { email: string }) => {
    try {
      await requestReset.mutateAsync(address.trim());
      toast.success("If this is your Owner email, a reset code has been sent.");
      navigate({ to: "/auth/forgot-password/new-password", search: { email: address.trim() } });
    } catch (error) {
      const response = error as { response?: { data?: { message?: string | string[] } }; message?: string };
      const message = response.response?.data?.message;
      toast.error((Array.isArray(message) ? message.join(". ") : message) || response.message || "Could not send a reset code.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-base-100 p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary"><Mail className="size-5" aria-hidden="true" /></div>
          <div>
            <h1 className="text-xl font-semibold">Forgot password</h1>
            <p className="mt-1 text-sm text-base-content/70">
              {account === "owner" ? "Enter your Owner email to receive a reset code." :
                account === "staff" ? "Ask your workspace Owner to help restore access to your staff account." :
                  "Contact a platform administrator to restore access to your admin account."}
            </p>
          </div>
        </div>

        {account === "owner" && (
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
              <SimpleInput label="Owner email" type="email" autoComplete="email" placeholder="owner@example.com"
                {...form.register("email", {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
                })} />
              <button type="submit" className="btn btn-primary w-full" disabled={requestReset.isPending}>
                {requestReset.isPending ? "Sending..." : "Send reset code"}
              </button>
            </form>
          </FormProvider>
        )}
        <Link to={loginPath} className="link link-primary mt-5 inline-block text-sm">Back to sign in</Link>
      </div>
    </main>
  );
}
