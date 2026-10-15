import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, Tag } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import PageHeader from "@/components/Headers/PageHeader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
} from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/tenant/products/categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const searchProps = useSearch();

  const addModalRef = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleOpenAdd = () => {
    setForm({
      name: "",
      description: "",
    });
    addModalRef.current?.open();
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setForm({
      name: category.name || "",
      description: category.description || "",
    });
    editModalRef.current?.open();
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      await createCategory.mutateAsync(form);
      toast.success("Category created successfully");
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create category");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      await updateCategory.mutateAsync({
        id: selectedCategory.id,
        ...form,
      });
      toast.success("Category updated successfully");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (category: Category) => {
    if (
      !confirm(`Are you sure you want to delete category "${category.name}"?`)
    )
      return;
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success("Category deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    }
  };

  const categoriesList = query.data || [];
  const searchTerm = searchProps.search?.toLowerCase() || "";
  const filteredCategories = categoriesList.filter((c) => {
    if (!searchTerm) return true;
    return (
      c.name?.toLowerCase().includes(searchTerm) ||
      c.description?.toLowerCase().includes(searchTerm)
    );
  });

  const columns = [
    {
      key: "name",
      label: "Category Name",
      render: (_: any, item: Category) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
            <Tag className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content">{item.name}</div>
            <div className="text-xs text-base-content/60">
              {item.description || "No description"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (val: any) => (
        <span className="badge badge-sm badge-outline capitalize">
          {val || "product"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (val: any) => (
        <span className="text-xs text-base-content/70">
          {val ? new Date(val).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Category>[] = [
    {
      key: "edit",
      label: "Edit Category",
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
        title="Product & Service Categories"
        description="Organize your catalog items by department, type, or service group"
      >
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Create Category
        </button>
      </PageHeader>

      <PageLoader
        query={query}
        showSuccessState={true}
        emptyState={{
          title: "No Categories Found",
          description:
            "Organize your products and services by creating your first category.",
          actionText: "Create Category",
          onAction: handleOpenAdd,
        }}
      >
        <SimpleContainer title="Catalog Categories">
          <ContainerRow searchProps={searchProps} showSearch={true} />
          <CustomTable
            data={filteredCategories}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* Add Category Modal */}
      <Modal ref={addModalRef} title="Create Category">
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Category Name *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              placeholder="e.g. Office Supplies, Consulting Services"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              placeholder="Optional category description..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="modal-action">
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
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal ref={editModalRef} title="Edit Category">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Category Name *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="modal-action">
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
              disabled={updateCategory.isPending}
            >
              {updateCategory.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
