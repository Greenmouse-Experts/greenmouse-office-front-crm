import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, PlusCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import {
  useFinancialCategories,
  useCreateFinancialCategory,
  useUpdateFinancialCategory,
  type FinancialCategory,
} from "@/api/financeApi";

export const Route = createFileRoute(
  "/tenant/accounts/income-expenses/categories/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const categoriesQuery = useFinancialCategories();
  const createCategory = useCreateFinancialCategory();
  const updateCategory = useUpdateFinancialCategory();
  const modalRef = useRef<ModalHandle>(null);
  const [editing, setEditing] = useState<FinancialCategory | null>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<FinancialCategory["kind"]>("income");

  const openCreate = (categoryKind: FinancialCategory["kind"] = "income") => {
    setEditing(null);
    setName("");
    setKind(categoryKind);
    modalRef.current?.open();
  };

  const openEdit = (category: FinancialCategory) => {
    setEditing(category);
    setName(category.name);
    setKind(category.kind);
    modalRef.current?.open();
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Category name is required.");
      return;
    }
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, name: trimmedName });
      } else {
        await createCategory.mutateAsync({ kind, name: trimmedName });
      }
      toast.success(editing ? "Category renamed." : "Category created.");
      modalRef.current?.close();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not save category.");
    }
  };

  const toggleActive = async (category: FinancialCategory) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        isActive: !category.isActive,
      });
      toast.success(
        category.isActive ? "Category archived." : "Category reactivated.",
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not update category.",
      );
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader
        title="Income & Expense Categories"
        description="Manage the categories used when recording income and expenses"
      >
        <Link
          to="/tenant/accounts/income-expenses"
          className="btn btn-ghost btn-sm"
        >
          <ArrowLeft className="size-4" /> Back to records
        </Link>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => openCreate()}
        >
          <PlusCircle className="size-4" /> Add Category
        </button>
      </PageHeader>

      <PageLoader query={categoriesQuery}>
        <div className="grid gap-4 lg:grid-cols-2">
          {(["income", "expense"] as const).map((categoryKind) => {
            const categories =
              categoriesQuery.data?.filter(
                (category) => category.kind === categoryKind,
              ) ?? [];
            return (
              <div
                key={categoryKind}
                className="rounded-box bg-base-100 p-5 shadow space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold capitalize">
                      {categoryKind} categories
                    </h2>
                    <p className="text-sm text-base-content/60">
                      {categories.length} total
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => openCreate(categoryKind)}
                  >
                    <PlusCircle className="size-4" /> Add
                  </button>
                </div>
                {categories.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-base-300 p-6 text-sm text-base-content/60">
                    No {categoryKind} categories yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-base-200">
                    {categories.map((category) => (
                      <li
                        key={category.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{category.name}</span>
                          <span
                            className={`badge badge-sm ${category.isActive ? "badge-success badge-soft" : "badge-ghost"}`}
                          >
                            {category.isActive ? "Active" : "Archived"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEdit(category)}
                          >
                            <Pencil className="size-4" /> Rename
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={updateCategory.isPending}
                            onClick={() => toggleActive(category)}
                          >
                            {category.isActive ? "Archive" : "Reactivate"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </PageLoader>

      <Modal
        ref={modalRef}
        title={editing ? "Rename Category" : "Create Category"}
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {!editing && (
            <LocalSelect
              label="Type"
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as FinancialCategory["kind"])
              }
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </LocalSelect>
          )}
          <SimpleInput
            label="Category Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={100}
            placeholder="e.g. Consulting"
          />
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => modalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createCategory.isPending || updateCategory.isPending}
            >
              {createCategory.isPending || updateCategory.isPending
                ? "Saving..."
                : editing
                  ? "Save Changes"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
