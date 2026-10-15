import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import SimpleTitle from "@/components/SimpleTitle";
import { useCreateStaff, useRoles } from "@/api/adminApi";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/add/")({ component: RouteComponent });

type FormValues = { firstName: string; lastName: string; email: string; password: string; roleId: string; phoneNumber: string };

function RouteComponent() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const createAdmin = useCreateStaff();
  const roles = useRoles();

  const onSubmit = async (values: FormValues) => {
    try {
      await createAdmin.mutateAsync(values);
      toast.success("Administrator created.");
      navigate({ to: "/admin/users" });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not create administrator.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <SimpleTitle backBtn title="Add administrator" />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-base-100 rounded-box p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-control">First name<input className="input input-bordered w-full" {...register("firstName", { required: true })} />{errors.firstName && <span className="text-error text-sm">First name is required.</span>}</label>
          <label className="form-control">Last name<input className="input input-bordered w-full" {...register("lastName", { required: true })} />{errors.lastName && <span className="text-error text-sm">Last name is required.</span>}</label>
        </div>
        <label className="form-control">Email<input type="email" className="input input-bordered w-full" {...register("email", { required: true })} />{errors.email && <span className="text-error text-sm">Email is required.</span>}</label>
        <label className="form-control">Temporary password<input type="password" autoComplete="new-password" className="input input-bordered w-full" {...register("password", { required: true, minLength: 8 })} />{errors.password && <span className="text-error text-sm">Use at least eight characters.</span>}</label>
        <label className="form-control">Role<select className="select select-bordered w-full" {...register("roleId", { required: true })}><option value="">Select a role</option>{roles.data?.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>{errors.roleId && <span className="text-error text-sm">Choose a role.</span>}</label>
        <label className="form-control">Phone number<input type="tel" className="input input-bordered w-full" {...register("phoneNumber")} /></label>
        <button type="submit" disabled={createAdmin.isPending || roles.isLoading} className="btn btn-primary">{createAdmin.isPending ? "Creating..." : "Create administrator"}</button>
      </form>
    </div>
  );
}
