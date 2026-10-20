import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Controller, useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import PhoneNumberInput, { validatePhoneNumber } from "@/components/inputs/PhoneNumberInput";
import ActionButton from "@/components/buttons/ActionButton";
import { useSelectImage } from "@/helpers/images";
import SelectImage from "@/components/images/SelectImage";
import SimpleTitle from "@/components/SimpleTitle";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateStaff, useRoles } from "@/api/tenantApi";
import { useUploadImage } from "@/api/imageApi";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/users/add/")({
  component: RouteComponent,
});

interface AddStaffFormFields {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
}

function RouteComponent() {
  const navigate = useNavigate();
  const createStaff = useCreateStaff();
  const rolesQuery = useRoles();
  const uploadImage = useUploadImage();
  const { image, setImage, image_link } = useSelectImage();
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<AddStaffFormFields>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      roleId: "",
    },
  });

  const onSubmit = async (data: AddStaffFormFields) => {
    try {
      setSubmitting(true);
      let profilePicUrl: string | undefined = undefined;

      if (image) {
        try {
          const uploadRes = await uploadImage.mutateAsync(image);
          profilePicUrl = uploadRes.url;
        } catch {
          // If upload fails, proceed without image
        }
      }

      await createStaff.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
        roleId: data.roleId || undefined,
        profilePic: profilePicUrl,
      });

      toast.success(`Staff member "${data.firstName} ${data.lastName}" added.`);
      navigate({ to: "/staff/users" });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create staff member.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4  mx-auto space-y-6">
      <SimpleTitle title={"Add New Staff"} />
      <section className="p-6 bg-base-100 shadow-sm border border-base-200 rounded-2xl">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
            <SelectImage
              image={image}
              setImage={setImage}
              image_link={image_link}
              title="Profile Picture"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimpleInput
                label="First Name"
                placeholder="Jane"
                {...methods.register("firstName", {
                  required: "First Name is required",
                })}
              />
              <SimpleInput
                label="Last Name"
                placeholder="Doe"
                {...methods.register("lastName", {
                  required: "Last Name is required",
                })}
              />
            </div>

            <SimpleInput
              label="Email Address"
              type="email"
              placeholder="jane.doe@company.com"
              {...methods.register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LocalSelect
                label="Assigned Role"
                {...methods.register("roleId")}
              >
                <option value="">-- Select Role --</option>
                {rolesQuery.data?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </LocalSelect>

              <Controller
                name="phoneNumber"
                control={methods.control}
                rules={{ validate: validatePhoneNumber }}
                render={({ field, fieldState }) => (
                  <PhoneNumberInput
                    label="Phone Number"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate({ to: "/staff/users" })}
              >
                Cancel
              </button>
              <ActionButton
                type="submit"
                disabled={submitting}
                title={submitting ? "Adding..." : "Add Staff"}
              />
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
