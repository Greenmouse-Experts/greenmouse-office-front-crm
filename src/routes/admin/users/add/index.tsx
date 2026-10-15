import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import { useSelectImage } from "@/helpers/images";
import SelectImage from "@/components/images/SelectImage";
import SimpleTitle from "@/components/SimpleTitle";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateStaff, useRoles } from "@/api/adminApi";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/add/")({
  component: RouteComponent,
});

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  phoneNumber: string;
}

function RouteComponent() {
  const navigate = useNavigate();
  const methods = useForm<FormValues>();
  const createStaff = useCreateStaff();
  const rolesQuery = useRoles();
  const props = useSelectImage();

  const onSubmit = async (data: FormValues) => {
    try {
      await createStaff.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        roleId: data.roleId || undefined,
        phoneNumber: data.phoneNumber || undefined,
      });
      toast.success("Staff member added successfully!");
      navigate({ to: "/admin/users" });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create staff member",
      );
    }
  };

  const roles = rolesQuery.data || [];

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <SimpleTitle backBtn title={"Add New Staff Member"} />
      <section className="p-6 bg-base-100 shadow rounded-box border border-base-200">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <SelectImage {...props} title="Profile Picture" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimpleInput
                label="First Name"
                placeholder="Enter first name"
                {...methods.register("firstName", {
                  required: "First name is required",
                })}
              />
              <SimpleInput
                label="Last Name"
                placeholder="Enter last name"
                {...methods.register("lastName", {
                  required: "Last name is required",
                })}
              />
            </div>

            <SimpleInput
              label="Email Address"
              type="email"
              placeholder="e.g. staff@company.com"
              {...methods.register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
            />

            <LocalSelect label="Staff Role" {...methods.register("roleId")}>
              <option value="">Select a role (Optional)</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </LocalSelect>

            <SimpleInput
              label="Phone Number"
              type="tel"
              placeholder="e.g. +234 800 000 0000"
              {...methods.register("phoneNumber")}
            />

            <div className="pt-2">
              <ActionButton
                type="submit"
                title="Create Staff Member"
                disabled={createStaff.isPending}
              />
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
