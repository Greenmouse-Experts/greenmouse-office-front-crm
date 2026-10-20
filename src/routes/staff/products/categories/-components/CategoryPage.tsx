import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { PlusCircleIcon, Tag } from "lucide-react";
import { toast } from "sonner";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import PageHeader from "@/components/Headers/PageHeader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
  type CategoryType,
} from "@/api/crmApi";

interface CategoryFields {
  name: string;
  description: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  const response = error as { response?: { data?: { message?: string | string[] } } };
  const message = response.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || fallback;
};

export default function CategoryPage({ type }: { type: CategoryType }) {
  const query = useCategories(type);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const searchProps = useSearch();
  const formModalRef = useRef<ModalHandle>(null);
  const deleteModalRef = useRef<ModalHandle>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const form = useForm<CategoryFields>({ defaultValues: { name: "", description: "" } });
  const label = type === "product" ? "Product" : "Service";

  const openCreate = () => {
    setEditingCategory(null);
    form.reset({ name: "", description: "" });
    formModalRef.current?.open();
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({ name: category.name, description: category.description ?? "" });
    formModalRef.current?.open();
  };

  const save = async (values: CategoryFields) => {
    const payload = { name: values.name.trim(), description: values.description.trim() };
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...payload });
        toast.success(`${label} category updated.`);
      } else {
        await createCategory.mutateAsync({ ...payload, type });
        toast.success(`${label} category created.`);
      }
      formModalRef.current?.close();
    } catch (error) {
      toast.error(getErrorMessage(error, `Could not save ${label.toLowerCase()} category.`));
    }
  };

  const remove = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory.mutateAsync(deletingCategory.id);
      toast.success(`${label} category deleted.`);
      deleteModalRef.current?.close();
      setDeletingCategory(null);
    } catch (error) {
      toast.error(getErrorMessage(error, `Could not delete ${label.toLowerCase()} category.`));
    }
  };

  const columns = [
    {
      key: "name",
      label: "Category Name",
      render: (_: unknown, item: Category) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Tag className="size-4" aria-hidden="true" />
          </div>
          <div>
            <div className="font-semibold text-base-content">{item.name}</div>
            <div className="text-xs text-base-content/60">{item.description || "No description"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: string) => (
        <span className="text-xs text-base-content/70">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Category>[] = [
    { key: "edit", label: "Edit Category", action: openEdit },
    {
      key: "delete",
      label: "Delete",
      action: (category) => {
        setDeletingCategory(category);
        deleteModalRef.current?.open();
      },
    },
  ];

  const isSaving = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${label} Categories`}
        description={`Organize your ${label.toLowerCase()} catalog with categories.`}
      >
        <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" aria-hidden="true" /> Create Category
        </button>
      </PageHeader>

      <nav className="flex gap-2" aria-label="Category type">
        <Link to="/staff/products/categories" className={`btn btn-sm ${type === "product" ? "btn-primary" : "btn-ghost"}`}>
          Products
        </Link>
        <Link to="/staff/products/service/categories" className={`btn btn-sm ${type === "service" ? "btn-primary" : "btn-ghost"}`}>
          Services
        </Link>
      </nav>

      <PageLoader
        query={query}
        emptyState={{
          title: `No ${label.toLowerCase()} categories yet`,
          description: `Create a category to organize your ${label.toLowerCase()} catalog.`,
          actionText: "Create Category",
          onAction: openCreate,
        }}
      >
        {(categories) => {
          const search = searchProps.search?.trim().toLowerCase() ?? "";
          const filtered = categories.filter((category) =>
            !search || category.name.toLowerCase().includes(search) ||
            category.description?.toLowerCase().includes(search),
          );
          return (
            <SimpleContainer title={`${label} Categories (${categories.length})`}>
              <ContainerRow searchProps={searchProps} showSearch />
              <CustomTable data={filtered} columns={columns} actions={actions} />
            </SimpleContainer>
          );
        }}
      </PageLoader>

      <Modal ref={formModalRef} title={editingCategory ? `Edit ${label} Category` : `Create ${label} Category`}>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(save)} className="space-y-4">
            <SimpleInput
              label="Category Name"
              placeholder={type === "product" ? "e.g. Office Supplies" : "e.g. Consulting"}
              {...form.register("name", { validate: (value) => !!value.trim() || "Category name is required" })}
            />
            <SimpleTextArea
              label="Description"
              rows={3}
              placeholder="Optional category description"
              {...form.register("description")}
            />
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => formModalRef.current?.close()} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <Modal ref={deleteModalRef} title={`Delete ${label} Category`}>
        <p className="text-sm text-base-content/80">
          Delete <strong>{deletingCategory?.name}</strong>? This action cannot be undone.
        </p>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={() => deleteModalRef.current?.close()} disabled={deleteCategory.isPending}>
            Cancel
          </button>
          <button type="button" className="btn btn-error" onClick={remove} disabled={deleteCategory.isPending}>
            {deleteCategory.isPending ? "Deleting..." : "Delete Category"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
