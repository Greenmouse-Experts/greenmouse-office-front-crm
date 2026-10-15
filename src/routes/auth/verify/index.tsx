import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient from "@/client/api";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/auth/verify/")({
  component: RouteComponent,
  validateSearch: (search: { email?: string }): { email: string } => {
    return { email: search.email ?? "" };
  },
});

interface VerifyForm {
  otp: string;
}

function RouteComponent() {
  const { email } = Route.useSearch();
  const nav = useNavigate();
  const form = useForm<VerifyForm>();

  const { mutate: verifyMutate, isPending: isVerifying } = useMutation({
    mutationFn: (data: VerifyForm) =>
      apiClient
        .post("/tenant/auth/verify-email", { email, otp: data.otp })
        .then((res) => res.data),
    onSuccess: () => {
      toast.success("Email verified successfully! You can now log in.");
      nav({
        to: "/auth/login",
        search: { email },
      });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Verification failed";
      toast.error(message);
    },
  });

  const { mutate: resendMutate, isPending: isResending } = useMutation({
    mutationFn: () =>
      apiClient
        .post("/tenant/auth/resend-otp", { email })
        .then((res) => res.data),
    onSuccess: () => {
      toast.success("Verification code resent to your email.");
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Failed to resend code";
      toast.error(message);
    },
  });

  return (
    <FormProvider {...form}>
      <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <Mail className="text-primary" size={24} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-base-content/60 text-sm">
            We've sent a 6-digit verification code to{" "}
            <span className="text-base-content font-semibold">{email}</span>.
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit((data) => verifyMutate(data))}
          className="space-y-5"
        >
          <SimpleInput
            label="Verification Code"
            placeholder="Enter 6-digit code"
            maxLength={6}
            {...form.register("otp", {
              required: "Code is required",
              minLength: {
                value: 6,
                message: "Enter the 6-digit code",
              },
            })}
          />

          <button
            type="submit"
            className="btn btn-primary btn-block mt-2"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        <div className="pt-2 space-y-4">
          <p className="text-sm text-base-content/60">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={() => resendMutate()}
              disabled={isResending}
              className="text-primary font-semibold hover:underline disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend Code"}
            </button>
          </p>

          <p className="text-center text-sm text-base-content/60">
            Wait, I want to{" "}
            <button
              type="button"
              onClick={() => nav({ to: "/auth/login", search: { email } })}
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </FormProvider>
  );
}
