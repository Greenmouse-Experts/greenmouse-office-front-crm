import { createFileRoute } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";

export const Route = createFileRoute("/tenant/settings/security/")({
  component: RouteComponent,
});

function RouteComponent() {
  const methods = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div className="space-y-6">
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="card bg-base-100 shadow-xl p-6 space-y-4"
        >
          <h2 className="card-title text-2xl font-semibold">Password Change</h2>
          <p className="text-sm text-base-content/70">
            Update your account password.
          </p>
          <SimpleInput
            label="Current Password"
            name="currentPassword"
            type="password"
            placeholder="Enter current password"
          />
          <SimpleInput
            label="New Password"
            name="newPassword"
            type="password"
            placeholder="Enter new password"
          />
          <SimpleInput
            label="Confirm New Password"
            name="confirmNewPassword"
            type="password"
            placeholder="Confirm new password"
          />
          <div className="card-actions justify-end">
            <button type="submit" className="btn btn-primary">
              Change Password
            </button>
          </div>
        </form>
      </FormProvider>

      <div className="card bg-base-100 shadow-xl p-6 space-y-4">
        <h2 className="card-title text-2xl font-semibold">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-base-content/70">
          Two-factor authentication (2FA) adds an extra layer of security to
          your account by requiring a second verification step.
        </p>
        <div className="card-actions justify-end">
          <button className="btn btn-secondary">Enable 2FA</button>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl p-6 space-y-4">
        <h2 className="card-title text-2xl font-semibold">
          Recent Login Activity
        </h2>
        <p className="text-sm text-base-content/70">
          Review your recent login sessions.
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between items-center bg-base-200 p-3 rounded-md">
            <span>
              Logged in from Chrome on Windows - New York, NY (192.168.1.1)
            </span>
            <span className="text-base-content/60">Just now</span>
          </li>
          <li className="flex justify-between items-center bg-base-200 p-3 rounded-md">
            <span>Logged in from Firefox on macOS - London, UK (10.0.0.5)</span>
            <span className="text-base-content/60">2 hours ago</span>
          </li>
        </ul>
        <div className="card-actions justify-end">
          <button className="btn btn-ghost">View all activity</button>
        </div>
      </div>
    </div>
  );
}
