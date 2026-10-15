import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/admin/")({
  component: RouteComponent,
  validateSearch: (search: { email?: string }): { email: string } => {
    return { email: search.email ?? "" };
  },
});

import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SimpleInput from "@/components/inputs/SimpleInput";
import { new_url } from "@/client/api";
import { set_user_value } from "@/store/authStore";
import axios from "axios";

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
      axios.post(new_url + "auth/admin/login", data).then((res) => res.data),
    onSuccess: async (res) => {
      // res is { accessToken, refreshToken, user }
      set_user_value(res);
      toast.success("Login successful");
      return nav({
        to: "/admin",
      });
      // try {
      //   const profileRes = await apiClient
      //     .get("/tenant/auth/me")
      //     .then((r) => r.data);
      //   const profileData = profileRes.data ?? profileRes;

      //   if (profileData) {
      //     // Store detailed profile in auth store
      //     set_profile_value(profileData);

      //     updateFormData({
      //       _id: profileData.sub,
      //       email: profileData.email,
      //       companyName: profileData.companyName,
      //       isOnboarded: profileData.isOnboarded,
      //     });

      //     if (!profileData.isOnboarded) {
      //       nav({ to: "/auth/register/on-boarding" });
      //       return;
      //     }
      //   }
      //   nav({ to: "/tenant" });
      // } catch (err) {
      //   console.error("Failed to fetch profile", err);
      //   // nav({ to: "/tenant" });
      // }
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
            Business Management Portal
          </p>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          action=""
          className="p-6 space-y-6 py-8 mx-auto  bg-base-100/70 backdrop-blur-md rounded-box drop-shadow-xl ring ring-current/10 w-full max-w-md m-2 mb-12  "
        >
          <div className="space-y-1 ">
            <h2 className="text-2xl font-semibold text-center">Login</h2>
            <p className="text-sm text-center fieldset-label ">
              Enter your credentials to access your account
            </p>
          </div>

          <SimpleInput label="Email Address" {...form.register("email")} />
          <SimpleInput
            label="Password"
            {...form.register("password")}
            type="password"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="toggle" name="" id="" />{" "}
              <span className="fieldset-label text-sm">Remember Me</span>
            </div>
            <Link
              to="/auth/forgot-password"
              search={{ email: form.getValues("email") }}
              className="link link-primary text-sm font-semibold"
            >
              Forgot Password?
            </Link>
          </div>
          <button className="btn btn-primary btn-block" disabled={isPending}>
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Login"
            )}
          </button>
          <button
            className="btn btn-soft ring btn-block"
            onClick={() => {
              form.setValues({
                email: "greenmousedev@gmail.com",
                password: "Password@2022",
              });
            }}
          >
            Prefill
          </button>
          {/*<div className="">
            <section className="ring ring-current/10 bg-base-200 rounded-box p-4 text-xs text-base-content/80 space-y-2">
              <p className="font-semibold ">Demo Credientials</p>
              <div>
                <p>Email: greenmousedev+admin@gmail.com</p>
                <p>Password: admin124</p>
              </div>
            </section>
          </div>*/}
        </form>
      </div>
    </div>
  );
}
