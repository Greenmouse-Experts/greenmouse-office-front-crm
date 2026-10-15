import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, Package, Layers } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ProductSummary from "./-components/ProductSummary";
import UpdateImages from "@/components/images/UpdateImages";
import { useUploadImage } from "@/api/imageApi";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAdjustStock,
  type Product,
} from "@/api/catalogApi";
import { useCategories } from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/tenant/products/")({
  component: RouteComponent,
});

interface AddProductFormValues {
  name: string;
  price: number;
  cost?: number;
  stock?: number;
  categoryId?: string;
  description?: string;
}

interface EditProductFormValues {
  name: string;
  price: number;
  categoryId?: string;
  description?: string;
}

function RouteComponent() {
  const query = useProducts();
  const categoriesQuery = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const adjustStock = useAdjustStock();
  const uploadImage = useUploadImage();
  const searchProps = useSearch();

  const addModalRef = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);
  const stockModalRef = useRef<ModalHandle>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);

  // Add Product Images State
  const [addNewImages, setAddNewImages] = useState<File[] | FileList | []>([]);
  const [addPrevImages, setAddPrevImages] = useState<
    { url: string; path: string }[]
  >([]);

  // Edit Product Images State
  const [editNewImages, setEditNewImages] = useState<File[] | FileList | []>(
    [],
  );
  const [editPrevImages, setEditPrevImages] = useState<
    { url: string; path: string }[]
  >([]);

  const addMethods = useForm<AddProductFormValues>({
    defaultValues: {
      name: "",
      price: 0,
      cost: 0,
      stock: 0,
      categoryId: "",
      description: "",
    },
  });

  const editMethods = useForm<EditProductFormValues>({
    defaultValues: {
      name: "",
      price: 0,
      categoryId: "",
      description: "",
    },
  });

  const handleOpenAdd = () => {
    addMethods.reset({
      name: "",
      price: 0,
      cost: 0,
      stock: 0,
      categoryId: "",
      description: "",
    });
    setAddNewImages([]);
    setAddPrevImages([]);
    addModalRef.current?.open();
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    editMethods.reset({
      name: product.name || "",
      price: Number(product.price) || 0,
      categoryId: product.categoryId || "",
      description: product.description || "",
    });
    setEditNewImages([]);
    setEditPrevImages(
      (product.images || []).map((url) => ({ url, path: url })),
    );
    editModalRef.current?.open();
  };

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    detailsModalRef.current?.open();
  };

  const handleOpenStock = (product: Product) => {
    setSelectedProduct(product);
    setStockAdjustment(0);
    stockModalRef.current?.open();
  };

  const uploadMultipleImages = async (files: File[] | FileList | []) => {
    const uploadedUrls: string[] = [];
    if (files && files.length > 0) {
      const filesArr = Array.from(files);
      for (const file of filesArr) {
        try {
          const res = await uploadImage.mutateAsync(file);
          const url =
            res?.data?.url || (res as any)?.url || (res as any)?.payload?.url;
          if (url) uploadedUrls.push(url);
        } catch (err) {
          console.error("Failed to upload image file:", err);
        }
      }
    }
    return uploadedUrls;
  };

  const handleSaveAdd = async (data: AddProductFormValues) => {
    const priceVal = Number(data.price);
    if (isNaN(priceVal) || priceVal <= 0) {
      toast.error("Price must be a positive number");
      return;
    }
    try {
      const uploadedUrls = await uploadMultipleImages(addNewImages);
      const finalImages = [...addPrevImages.map((i) => i.url), ...uploadedUrls];

      await createProduct.mutateAsync({
        name: data.name.trim(),
        price: priceVal,
        cost: data.cost ? Number(data.cost) : undefined,
        stock: data.stock ? Number(data.stock) : 0,
        categoryId: data.categoryId || undefined,
        description: data.description?.trim() || undefined,
        images: finalImages.length > 0 ? finalImages : undefined,
        type: "product",
      });
      toast.success("Product created successfully");
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create product");
    }
  };

  const handleSaveEdit = async (data: EditProductFormValues) => {
    if (!selectedProduct) return;
    const priceVal = Number(data.price);
    if (isNaN(priceVal) || priceVal <= 0) {
      toast.error("Price must be a positive number");
      return;
    }
    try {
      const uploadedUrls = await uploadMultipleImages(editNewImages);
      const finalImages = [
        ...editPrevImages.map((i) => i.url),
        ...uploadedUrls,
      ];

      await updateProduct.mutateAsync({
        id: selectedProduct.id,
        name: data.name.trim(),
        price: priceVal,
        categoryId: data.categoryId || undefined,
        description: data.description?.trim() || undefined,
        images: finalImages,
      });
      toast.success("Product updated successfully");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update product");
    }
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await adjustStock.mutateAsync({
        id: selectedProduct.id,
        adjustment: Number(stockAdjustment),
      });
      toast.success("Stock updated successfully");
      stockModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to adjust stock");
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success("Product deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete product");
    }
  };

  const productsList = query.data || [];
  const searchTerm = searchProps.search?.toLowerCase() || "";
  const filteredProducts = productsList.filter((p) => {
    if (!searchTerm) return true;
    return (
      p.name?.toLowerCase().includes(searchTerm) ||
      p.description?.toLowerCase().includes(searchTerm) ||
      p.category?.name?.toLowerCase().includes(searchTerm)
    );
  });

  const columns = [
    {
      key: "name",
      label: "Product",
      render: (_: any, item: Product) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden shrink-0 border border-base-200">
            {item.images && item.images.length > 0 && item.images[0] ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="size-full object-cover"
              />
            ) : (
              <Package className="size-5" />
            )}
          </div>
          <div>
            <div className="font-semibold text-base-content">{item.name}</div>
            <div className="text-xs text-base-content/60 line-clamp-1 max-w-[200px]">
              {item.description || "No description"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (val: any, item: Product) => (
        <div>
          <span className="font-medium text-base-content">
            {item.currency || "₦"}
            {Number(val || 0).toLocaleString()}
          </span>
          {item.cost ? (
            <div className="text-xs text-base-content/50">
              Cost: {item.currency || "₦"}
              {Number(item.cost).toLocaleString()}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (_: any, item: Product) => (
        <span className="badge badge-sm badge-ghost">
          {item.category?.name || "General"}
        </span>
      ),
    },
    {
      key: "stock",
      label: "Stock Level",
      render: (_: any, item: Product) => {
        const qty = item.stock ?? item.quantity ?? 0;
        return (
          <span
            className={`badge badge-sm font-semibold ${
              qty > 5
                ? "badge-success text-white"
                : qty > 0
                  ? "badge-warning text-white"
                  : "badge-error text-white"
            }`}
          >
            {qty} units
          </span>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      render: (val: any) => (
        <span
          className={`badge badge-sm ${
            val !== false ? "badge-success text-white" : "badge-ghost"
          }`}
        >
          {val !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions: Actions<Product>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
    {
      key: "stock",
      label: "Adjust Stock",
      action: (item) => handleOpenStock(item),
    },
    {
      key: "edit",
      label: "Edit Product",
      action: (item) => handleOpenEdit(item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item) => handleDelete(item),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products Catalog"
        description="Manage your inventory items, pricing, and stock levels"
      >
        <div className="flex items-center gap-2">
          <Link
            to="/tenant/products/categories"
            className="btn btn-outline btn-sm"
          >
            <Layers className="size-4" /> Categories
          </Link>
          <Link to="/tenant/products/add" className="btn btn-outline btn-sm">
            <PlusCircleIcon className="size-4" /> Full Add Form
          </Link>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <PlusCircleIcon className="size-4" /> Quick Add
          </button>
        </div>
      </PageHeader>

      <PageLoader
        query={query}
        showSuccessState={true}
        emptyState={{
          title: "No Products Found",
          description:
            "Get started by adding your first product to the catalog.",
          actionText: "Add Product",
          onAction: handleOpenAdd,
        }}
      >
        <ProductSummary products={productsList} />

        <SimpleContainer title="Products Inventory">
          <ContainerRow searchProps={searchProps} showSearch={true} />
          <CustomTable
            data={filteredProducts}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* Quick Add Product Modal */}
      <Modal ref={addModalRef} title="Create New Product">
        <form
          onSubmit={addMethods.handleSubmit(handleSaveAdd)}
          className="space-y-4 max-h-[80vh] overflow-y-auto pr-1"
        >
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">
              Product Images
            </label>
            <UpdateImages
              images={addPrevImages}
              setNew={(files) => setAddNewImages(files)}
              setPrev={(imgs) => setAddPrevImages(imgs)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Product Name *
            </label>
            <input
              type="text"
              className="input input-bordered w-full mt-1"
              placeholder="e.g. Ergonomic Office Chair"
              {...addMethods.register("name", {
                required: "Product name is required",
              })}
            />
            {addMethods.formState.errors.name && (
              <span className="text-xs text-error mt-1 block">
                {addMethods.formState.errors.name.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Selling Price (₦) *
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full mt-1"
                placeholder="0.00"
                {...addMethods.register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                  validate: (val) =>
                    (val !== undefined && !isNaN(val) && val > 0) ||
                    "Price must be a positive number",
                })}
              />
              {addMethods.formState.errors.price && (
                <span className="text-xs text-error mt-1 block">
                  {addMethods.formState.errors.price.message}
                </span>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Cost Price (₦)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input input-bordered w-full mt-1"
                placeholder="0.00"
                {...addMethods.register("cost", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                className="input input-bordered w-full mt-1"
                placeholder="0"
                {...addMethods.register("stock", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Category
              </label>
              <select
                className="select select-bordered w-full mt-1"
                {...addMethods.register("categoryId")}
              >
                <option value="">Select a category</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              placeholder="Product description and specifications..."
              {...addMethods.register("description")}
            />
          </div>

          <div className="modal-action pt-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => addModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createProduct.isPending || uploadImage.isPending}
            >
              {createProduct.isPending || uploadImage.isPending
                ? "Saving..."
                : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal ref={editModalRef} title="Edit Product">
        <form
          onSubmit={editMethods.handleSubmit(handleSaveEdit)}
          className="space-y-4 max-h-[80vh] overflow-y-auto pr-1"
        >
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">
              Product Images
            </label>
            <UpdateImages
              images={editPrevImages}
              setNew={(files) => setEditNewImages(files)}
              setPrev={(imgs) => setEditPrevImages(imgs)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Product Name *
            </label>
            <input
              type="text"
              className="input input-bordered w-full mt-1"
              {...editMethods.register("name", {
                required: "Product name is required",
              })}
            />
            {editMethods.formState.errors.name && (
              <span className="text-xs text-error mt-1 block">
                {editMethods.formState.errors.name.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Selling Price (₦) *
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full mt-1"
                {...editMethods.register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                  validate: (val) =>
                    (val !== undefined && !isNaN(val) && val > 0) ||
                    "Price must be a positive number",
                })}
              />
              {editMethods.formState.errors.price && (
                <span className="text-xs text-error mt-1 block">
                  {editMethods.formState.errors.price.message}
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Category
              </label>
              <select
                className="select select-bordered w-full mt-1"
                {...editMethods.register("categoryId")}
              >
                <option value="">Select a category</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              {...editMethods.register("description")}
            />
          </div>

          <div className="modal-action pt-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => editModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateProduct.isPending || uploadImage.isPending}
            >
              {updateProduct.isPending || uploadImage.isPending
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal ref={stockModalRef} title="Adjust Stock Quantity">
        <form onSubmit={handleSaveStock} className="space-y-4">
          <p className="text-sm text-base-content/70">
            Adjust inventory for{" "}
            <span className="font-semibold text-base-content">
              {selectedProduct?.name}
            </span>
            . Current stock:{" "}
            <span className="badge badge-sm badge-info">
              {selectedProduct?.stock ?? selectedProduct?.quantity ?? 0}
            </span>
          </p>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Adjustment Amount (use positive to add, negative to remove)
            </label>
            <input
              type="number"
              required
              className="input input-bordered w-full mt-1"
              placeholder="e.g. 10 or -5"
              value={stockAdjustment}
              onChange={(e) => setStockAdjustment(Number(e.target.value))}
            />
          </div>

          <div className="p-3 bg-base-200/50 rounded-lg text-xs text-base-content/70">
            New calculated stock:{" "}
            <span className="font-semibold text-base-content">
              {Math.max(
                0,
                (selectedProduct?.stock ?? selectedProduct?.quantity ?? 0) +
                  Number(stockAdjustment),
              )}
            </span>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => stockModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={adjustStock.isPending}
            >
              {adjustStock.isPending ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal ref={detailsModalRef} title="Product Details">
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
              <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden shrink-0 border border-base-200">
                {selectedProduct.images &&
                selectedProduct.images.length > 0 &&
                selectedProduct.images[0] ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <Package className="size-8" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-base-content">
                  {selectedProduct.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-sm badge-ghost">
                    {selectedProduct.category?.name || "General"}
                  </span>
                  <span
                    className={`badge badge-sm ${
                      selectedProduct.isActive !== false
                        ? "badge-success text-white"
                        : "badge-ghost"
                    }`}
                  >
                    {selectedProduct.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Images Gallery */}
            {selectedProduct.images && selectedProduct.images.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-base-content/70 block">
                  Product Gallery ({selectedProduct.images.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedProduct.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden border border-base-200 bg-base-200/50"
                    >
                      <img
                        src={imgUrl}
                        alt={`${selectedProduct.name} image ${idx + 1}`}
                        className="size-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Selling Price
                </span>
                <span className="font-semibold text-base-content text-base">
                  ₦{Number(selectedProduct.price || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Cost Price
                </span>
                <span className="font-semibold text-base-content text-base">
                  ₦{Number(selectedProduct.cost || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Current Stock
                </span>
                <span className="font-semibold text-base-content text-base">
                  {selectedProduct.stock ?? selectedProduct.quantity ?? 0} units
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Product ID
                </span>
                <span className="font-mono text-xs text-base-content/70">
                  {selectedProduct.id}
                </span>
              </div>
            </div>

            {selectedProduct.description && (
              <div>
                <span className="text-xs font-semibold text-base-content/70 block mb-1">
                  Description
                </span>
                <p className="text-sm text-base-content/80 p-3 bg-base-200/30 rounded-lg">
                  {selectedProduct.description}
                </p>
              </div>
            )}

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => detailsModalRef.current?.close()}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
