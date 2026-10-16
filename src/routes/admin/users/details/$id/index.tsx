import { useEffect } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useRoles, useStaff, useUpdateStaff } from "@/api/adminApi";
import SimpleTitle from "@/components/SimpleTitle";
import PageLoader from "@/components/layout/PageLoader";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/details/$id/")({
  component: RouteComponent,
});

type FormValues = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleId: string;
  isActive: boolean;
};

function RouteComponent() {
  const { id } = useParams({ strict: false });
  const account = useStaff(id || "");
  const roles = useRoles();
  const update = useUpdateStaff();
  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (account.data)
      reset({
        firstName: account.data.firstName,
        lastName: account.data.lastName,
        phoneNumber: account.data.phoneNumber || "",
        roleId: account.data.roleId || account.data.role?.id || "",
        isActive: account.data.isActive ?? false,
      });
  }, [account.data, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await update.mutateAsync({ id: id || "", ...values });
      toast.success("Administrator updated.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not update administrator.",
      );
    }
  };

  return (
    <div className=" mx-auto space-y-6 pb-12">
      <SimpleTitle backBtn title="Administrator details" />
      <PageLoader query={account}>
        {(admin) => (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-base-100 rounded-box p-6 space-y-4"
          >
            <div>
              <h2 className="text-xl font-semibold">
                {admin.firstName} {admin.lastName}
              </h2>
              <p className="text-base-content/70">{admin.email}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-control">
                First name
                <input
                  className="input input-bordered w-full"
                  required
                  {...register("firstName")}
                />
              </label>
              <label className="form-control">
                Last name
                <input
                  className="input input-bordered w-full"
                  required
                  {...register("lastName")}
                />
              </label>
            </div>
            <label className="form-control">
              Phone number
              <input
                type="tel"
                className="input input-bordered w-full"
                {...register("phoneNumber")}
              />
            </label>
            <label className="form-control">
              Role
              <select
                className="select select-bordered w-full"
                {...register("roleId")}
              >
                <option value="">Select a role</option>
                {roles.data?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                {...register("isActive")}
              />{" "}
              Active account
            </label>
            <button
              type="submit"
              disabled={update.isPending}
              className="btn btn-primary"
            >
              {update.isPending ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </PageLoader>
    </div>
  );
}
