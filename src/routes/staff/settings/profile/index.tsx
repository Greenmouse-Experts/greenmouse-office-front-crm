import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import Modal from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SelectImage from "@/components/images/SelectImage";
import { useModal } from "@/store/modals";
import { useUploadImage } from "@/api/imageApi";
import { useStaffProfile, useUpdateStaffProfile, type UpdateStaffProfilePayload } from "@/api/tenantApi";
import UserInfo from "./-components/UserInfo";
import PersonalInfo from "./-components/PersonalInfo";

export const Route = createFileRoute("/staff/settings/profile/")({
  component: RouteComponent,
});

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

function RouteComponent() {
  const query = useStaffProfile();
  const updateProfile = useUpdateStaffProfile();
  const uploadImage = useUploadImage();
  const editModal = useModal();
  const methods = useForm<ProfileFormValues>();
  const [image, setImage] = useState<File | null | undefined>(null);
  const [removeCurrentPhoto, setRemoveCurrentPhoto] = useState(false);
  const image_link = useMemo(() => image ? URL.createObjectURL(image) : undefined, [image]);
  const isSaving = updateProfile.isPending || uploadImage.isPending;

  const openEdit = () => {
    const profile = query.data;
    if (!profile) return;
    methods.reset({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phoneNumber: profile.phoneNumber || "",
    });
    setImage(null);
    setRemoveCurrentPhoto(false);
    editModal.showModal();
  };

  const onSubmit = async (values: ProfileFormValues) => {
    const payload: UpdateStaffProfilePayload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phoneNumber: values.phoneNumber.trim(),
    };

    try {
      if (image) {
        const uploaded = await uploadImage.mutateAsync(image);
        const url = uploaded.url;
        if (!url) throw new Error("The profile photo upload did not return a URL.");
        payload.profilePic = url;
      } else if (removeCurrentPhoto) {
        payload.profilePic = null;
      }

      await updateProfile.mutateAsync(payload);
      toast.success("Profile updated.");
      editModal.closeModal();
      setImage(null);
    } catch (error) {
      const response = error as { response?: { data?: { message?: string | string[] } }; message?: string };
      const message = response.response?.data?.message;
      toast.error((Array.isArray(message) ? message.join(". ") : message) || response.message || "Could not update profile.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-10">
      <PageHeader title="My profile" description="Manage your personal details and profile photo." />
      <PageLoader query={query}>
        {(profile) => (
          <div className="space-y-4">
            <UserInfo profile={profile} onEdit={openEdit} />
            <PersonalInfo profile={profile} />
          </div>
        )}
      </PageLoader>

      <Modal ref={editModal.ref} title="Edit profile">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
            {query.data?.profilePic && !removeCurrentPhoto && !image && (
              <div className="flex items-center gap-3">
                <img src={query.data.profilePic} alt="Current profile" className="size-14 rounded-full object-cover" />
                <button type="button" className="btn btn-ghost btn-sm text-error" onClick={() => setRemoveCurrentPhoto(true)}>
                  Remove current photo
                </button>
              </div>
            )}
            <SelectImage
              image={image}
              image_link={image_link}
              setImage={(file) => {
                setImage(file ?? null);
                if (file) setRemoveCurrentPhoto(false);
              }}
              title={query.data?.profilePic ? "Replace profile photo" : "Profile photo"}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SimpleInput
                label="First name"
                {...methods.register("firstName", { validate: (value) => !!value.trim() || "First name is required" })}
              />
              <SimpleInput
                label="Last name"
                {...methods.register("lastName", { validate: (value) => !!value.trim() || "Last name is required" })}
              />
            </div>
            <SimpleInput label="Phone number" type="tel" {...methods.register("phoneNumber")} />
            <p className="text-sm text-base-content/70">Email address: {query.data?.email || "—"}</p>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={editModal.closeModal} disabled={isSaving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </div>
  );
}
