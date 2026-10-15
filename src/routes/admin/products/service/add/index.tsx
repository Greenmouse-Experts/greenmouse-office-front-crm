import SimpleTitle from "@/components/SimpleTitle";
import { useSelectImage } from "@/helpers/images";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import SelectImage from "@/components/images/SelectImage";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useForm, FormProvider } from "react-hook-form";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useAdminCrossCategories } from "@/api/adminApi";
import { toast } from "sonner";
import { ArrowLeft, Info } from "lucide-react";

interface ServiceFormFields {
  name: string;
  price: number;
  description: string;
  categoryId: string;
  isActive?: boolean;
}

export const Route = createFileRoute("/admin/products/service/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: categories = [] } = useAdminCrossCategories();
  const { image, setImage, image_link } = useSelectImage();
  const methods = useForm<ServiceFormFields>({
    defaultValues: {
      isActive: true,
    },
  });
  const { handleSubmit } = methods;

  const onSubmit = async () => {
    toast.info(
      "Services catalog authoring is tenant-managed. As an administrator, you have platform oversight across all tenant catalogs.",
    );
    navigate({ to: "/admin/products/service" });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/products/service"
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="Back to services"
        >
          <ArrowLeft size={18} />
        </Link>
        <SimpleTitle title="Add New Service" />
      </div>

      <div className="alert alert-info shadow-sm text-sm">
        <Info size={18} className="shrink-0" />
        <span>
          Services are scoped to individual tenant accounts. Authoring is
          managed within each tenant's portal, while platform administrators
          oversee cross-tenant catalogs.
        </span>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-base-100 rounded-box border border-base-200 p-6 space-y-6 shadow-sm">
            <h3 className="font-semibold text-base-content border-b border-base-200 pb-3">
              Service Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimpleInput
                name="name"
                label="Service Name"
                placeholder="e.g. Website Maintenance & SEO"
                required
              />
              <LocalSelect name="categoryId" label="Category">
                <option value="">Select category</option>
                {(categories as any[]).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <SimpleInput
              name="price"
              label="Standard Rate (₦)"
              type="number"
              placeholder="0.00"
              required
            />

            <SimpleTextArea
              name="description"
              label="Description & Scope of Work"
              placeholder="Detail what is included in this service, deliverables, and turnaround time..."
              rows={3}
            />
          </div>

          <div className="bg-base-100 rounded-box border border-base-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-base-content border-b border-base-200 pb-3">
              Cover Image / Badge
            </h3>
            <SelectImage
              image={image}
              image_link={image_link}
              setImage={setImage}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link to="/admin/products/service" className="btn btn-ghost">
              Back to Services
            </Link>
            <button type="submit" className="btn btn-primary">
              Save Service
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
