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
import { ArrowLeft, Percent, Info } from "lucide-react";

interface ProductFormFields {
  name: string;
  price: number;
  cost?: number;
  currency?: string;
  description: string;
  quantity: number;
  categoryId: string;
  isActive?: boolean;
}

export const Route = createFileRoute("/admin/products/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: categories = [] } = useAdminCrossCategories();
  const { image, setImage, image_link } = useSelectImage();
  const methods = useForm<ProductFormFields>({
    defaultValues: {
      currency: "NGN",
      isActive: true,
      quantity: 0,
    },
  });
  const { handleSubmit, watch } = methods;

  const watchedPrice = watch("price");
  const watchedCost = watch("cost");
  const calculatedMargin =
    watchedPrice &&
    watchedCost &&
    Number(watchedPrice) > 0 &&
    Number(watchedCost) >= 0
      ? (
          ((Number(watchedPrice) - Number(watchedCost)) /
            Number(watchedPrice)) *
          100
        ).toFixed(1)
      : null;

  const onSubmit = async () => {
    toast.info(
      "Product catalog authoring is tenant-managed. As an administrator, you have platform oversight across all tenant catalogs.",
    );
    navigate({ to: "/admin/products" });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/products"
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="Back to products"
        >
          <ArrowLeft size={18} />
        </Link>
        <SimpleTitle title="Add New Product" />
      </div>

      <div className="alert alert-info shadow-sm text-sm">
        <Info size={18} className="shrink-0" />
        <span>
          Products are scoped to individual tenant stores. Authoring is managed
          within each tenant's portal, while platform administrators oversee
          cross-tenant catalogs.
        </span>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-base-100 rounded-box border border-base-200 p-6 space-y-6 shadow-sm">
            <h3 className="font-semibold text-base-content border-b border-base-200 pb-3">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimpleInput
                name="name"
                label="Product Name"
                placeholder="e.g. Premium Ergonomic Chair"
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

            <SimpleTextArea
              name="description"
              label="Description"
              placeholder="Describe the product features, specifications, and warranty details..."
              rows={3}
            />
          </div>

          <div className="bg-base-100 rounded-box border border-base-200 p-6 space-y-6 shadow-sm">
            <h3 className="font-semibold text-base-content border-b border-base-200 pb-3">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <LocalSelect name="currency" label="Currency">
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </LocalSelect>
              <SimpleInput
                name="price"
                label="Selling Price"
                type="number"
                placeholder="0.00"
                required
              />
              <SimpleInput
                name="cost"
                label="Cost Price"
                type="number"
                placeholder="0.00"
              />
              <SimpleInput
                name="quantity"
                label="Initial Stock Qty"
                type="number"
                placeholder="0"
              />
            </div>

            {calculatedMargin !== null && (
              <div className="bg-base-200/50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-base-content/80">
                  <Percent size={16} className="text-primary" />
                  <span>Estimated Profit Margin:</span>
                </div>
                <div
                  className={`text-lg font-semibold ${
                    Number(calculatedMargin) >= 20
                      ? "text-success"
                      : Number(calculatedMargin) > 0
                        ? "text-warning"
                        : "text-error"
                  }`}
                >
                  {calculatedMargin}%
                </div>
              </div>
            )}
          </div>

          <div className="bg-base-100 rounded-box border border-base-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-base-content border-b border-base-200 pb-3">
              Product Media
            </h3>
            <SelectImage
              image={image}
              image_link={image_link}
              setImage={setImage}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link to="/admin/products" className="btn btn-ghost">
              Back to Catalog
            </Link>
            <button type="submit" className="btn btn-primary">
              Save Product
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
