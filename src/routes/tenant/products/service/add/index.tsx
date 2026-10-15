import { useState } from "react";
import SimpleTitle from "@/components/SimpleTitle";
import { useSelectImage } from "@/helpers/images";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SelectImage from "@/components/images/SelectImage";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useForm, FormProvider } from "react-hook-form";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateService } from "@/api/catalogApi";
import { useCategories } from "@/api/crmApi";
import { useUploadImage } from "@/api/imageApi";
import { toast } from "sonner";

interface ServiceFormFields {
  name: string;
  price: number;
  description: string;
  categoryId: string;
}

export const Route = createFileRoute("/tenant/products/service/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createService = useCreateService();
  const categoriesQuery = useCategories();
  const uploadImage = useUploadImage();
  const { image, setImage, image_link } = useSelectImage();
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<ServiceFormFields>({
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      categoryId: "",
    },
  });

  const onSubmit = async (data: ServiceFormFields) => {
    try {
      setSubmitting(true);
      let imageUrl: string | undefined = undefined;

      if (image) {
        try {
          const uploadRes = await uploadImage.mutateAsync(image);
          imageUrl = uploadRes?.data?.url;
        } catch {
          // If image upload fails, proceed without it
        }
      }

      await createService.mutateAsync({
        name: data.name,
        price: Number(data.price),
        categoryId: data.categoryId || undefined,
        description: data.description || undefined,
        image: imageUrl || undefined,
        isActive: true,
      });

      toast.success(`Service "${data.name}" created successfully.`);
      navigate({ to: "/tenant/products/service" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <SimpleTitle title={"Add New Service"} />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-6 bg-base-100 border border-base-200 shadow-sm rounded-2xl"
        >
          <SelectImage
            image={image}
            setImage={setImage}
            image_link={image_link}
            title="Service Image / Cover"
          />

          <div className="flex flex-col gap-4">
            <SimpleInput
              label="Service Name"
              placeholder="e.g. Graphic Design Retainer"
              {...methods.register("name", {
                required: "Service name is required",
              })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LocalSelect label="Category" {...methods.register("categoryId")}>
                <option value="">-- Select Category --</option>
                {categoriesQuery.data?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </LocalSelect>

              <SimpleInput
                label="Service Rate / Price (₦)"
                type="number"
                placeholder="0.00"
                {...methods.register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Price must be positive" },
                })}
              />
            </div>

            <SimpleTextArea
              label="Description & Deliverables"
              placeholder="Detail what is included in this service package..."
              {...methods.register("description")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate({ to: "/tenant/products/service" })}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? "Saving..." : "Add Service"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
