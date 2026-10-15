import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient from "@/client/api";

export const Route = createFileRoute("/auth/forgot-password/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { email?: string } => {
    return {
      email: typeof search.email === "string" ? search.email : undefined,
    };
  },
});

interface ForgotPasswordProps {
  email: string;
}

function RouteComponent() {
  const { email } = Route.useSearch();
  const nav = useNavigate();
  const form = useForm<ForgotPasswordProps>({
    defaultValues: {
      email: email || "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ForgotPasswordProps) =>
      apiClient
        .post("/tenant/auth/forgot-password", data)
        .then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res.message || "Reset OTP sent to your email");
      nav({
        to: "/auth/forgot-password/new-password",
        search: { email: form.getValues("email") },
      });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to send reset OTP";
      toast.error(message);
    },
  });

  const onSubmit = (data: ForgotPasswordProps) => mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-300 isolate">
      <div
        className={`fixed inset-0 z-[-2] h-screen w-screen rotate-180 transform bg-white dark:bg-base-300 bg-[radial-gradient(oklch(from_var(--color-base-100)_l_c_h_/_50%),oklch(from_var(--color-primary)_l_c_h_/_50%))] opacity-50`}
      ></div>
      <div className="fixed inset-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:56px_96px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      <div className="w-full flex flex-col mx-auto space-y-4 px-4 z-20">
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-semibold leading-normal">CRMgreenmouse</h2>
          <p className="font-semibold text-primary mx-auto w-fit text-sm">
            Reset Password
          </p>
          <p className="text-xs text-base-content/60 max-w-xs mx-auto mt-1">
            Enter your business email address and we'll send you an OTP to reset
            your password.
          </p>
        </div>

        <form
          className="card max-w-sm w-full mx-auto bg-base-100 border border-base-content/10 shadow-lg p-6 space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <SimpleInput
            label="Business Email"
            type="email"
            required
            placeholder="destiny@greenmouse.com"
            {...form.register("email", { required: true })}
          />

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary w-full text-white font-semibold"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Send Reset OTP"
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/auth/login"
              className="text-xs text-primary font-semibold hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
