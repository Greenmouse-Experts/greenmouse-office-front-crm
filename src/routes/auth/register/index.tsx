import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient from "@/client/api";

export const Route = createFileRoute("/auth/register/")({
  component: RouteComponent,
});

interface RegisterForm {
  email: string;
  password: string;
  companyName: string;
  phoneNumber: string;
}

function RouteComponent() {
  const nav = useNavigate();
  const form = useForm<RegisterForm>();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegisterForm) =>
      apiClient.post("/tenant/auth/register", data).then((res) => res.data),
    onSuccess: (_, variables) => {
      toast.success("Account created! Please verify your email.");
      nav({
        to: "/auth/verify",
        search: { email: variables.email },
      });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Registration failed";
      toast.error(message);
    },
  });

  return (
    <FormProvider {...form}>
      <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Get started</h1>
          <p className="text-base-content/60 text-sm">
            Create your account to start managing your business.
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit((data) => mutate(data))}
          className="space-y-5"
        >
          <SimpleInput
            label="Company Name"
            placeholder="Acme Corp"
            {...form.register("companyName", {
              required: "Company name is required",
            })}
          />

          <SimpleInput
            label="Email Address"
            type="email"
            placeholder="john@acmecorp.com"
            {...form.register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />

          <SimpleInput
            label="Phone Number"
            type="tel"
            placeholder="+2348012345678"
            {...form.register("phoneNumber", {
              required: "Phone number is required",
            })}
          />

          <SimpleInput
            label="Password"
            type="password"
            placeholder="••••••••"
            {...form.register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />

          <button
            type="submit"
            className="btn btn-primary btn-block mt-2"
            disabled={isPending}
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-base-content/60">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </FormProvider>
  );
}
