import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient, { new_url } from "@/client/api";
import { set_user_value, set_profile_value } from "@/store/authStore";
import axios from "axios";

export const Route = createFileRoute("/auth/login/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { email?: string } => {
    return {
      email: typeof search.email === "string" ? search.email : undefined,
    };
  },
});

interface LoginProps {
  email: string;
  password: string;
}

function RouteComponent() {
  const { email } = Route.useSearch();
  const nav = useNavigate();
  const form = useForm<LoginProps>({
    defaultValues: {
      email: email || "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginProps) =>
      axios.post(new_url + "tenant/auth/login", data).then((res) => res.data),
    onSuccess: async (res) => {
      // res is { accessToken, refreshToken, user }
      set_user_value(res);
      toast.success("Login successful");

      try {
        const profileRes = await apiClient
          .get("/tenant/auth/me")
          .then((r) => r.data);
        const profileData = profileRes.data ?? profileRes;

        if (profileData) {
          // Store detailed profile in auth store
          set_profile_value(profileData);

          if (!profileData.isOnboarded) {
            nav({ to: "/auth/register/on-boarding" });
            return;
          }
        }
        nav({ to: "/tenant" });
      } catch (err) {
        console.error("Failed to fetch profile", err);
        // nav({ to: "/tenant" });
      }
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Login failed";
      toast.error(message);
    },
  });

  const onSubmit = (data: LoginProps) => mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-300 isolate">
      <div
        className={`fixed inset-0 z-[-2] h-screen w-screen rotate-180 transform bg-white dark:bg-base-300 bg-[radial-gradient(oklch(from_var(--color-base-100)_l_c_h_/_50%),oklch(from_var(--color-primary)_l_c_h_/_50%))] opacity-50`}
      ></div>
      <div className="fixed inset-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:56px_96px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      <div className="w-full flex flex-col mx-auto space-y-4 px-4  z-20  ">
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-center leading-normal ">
            CRMgreenmouse
          </h2>
          <p className="font-semibold text-primary mx-auto w-fit text-sm">
            Sign In to your workspace
          </p>
        </div>
        <form
          className="card max-w-sm w-full mx-auto bg-base-100 border border-base-content/10 shadow-lg p-6 space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <SimpleInput
            label="Email Address"
            type="email"
            required
            placeholder="destiny@greenmouse.com"
            {...form.register("email", { required: true })}
          />

          <SimpleInput
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            {...form.register("password", { required: true })}
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-xs"
              />
              <span>Remember me</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary w-full text-white font-semibold"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-xs text-base-content/60 pt-2">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="text-primary font-semibold hover:underline"
            >
              Register your business
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
