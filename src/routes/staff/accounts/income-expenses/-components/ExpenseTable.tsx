import { useState, useRef } from "react";
import CustomTable from "@/components/tables/CustomTable";
import { type Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import PageLoader from "@/components/layout/PageLoader";
import {
  useExpenseRecords,
  useUpdateExpense,
  useDeleteExpense,
  useFinancialCategories,
  type ExpenseRecord,
} from "@/api/financeApi";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

export default function ExpenseTable() {
  const query = useExpenseRecords();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const categoriesQuery = useFinancialCategories({ isActive: true });
  const categories =
    categoriesQuery.data?.filter((category) => category.kind === "expense") ??
    [];

  const editModalRef = useRef<ModalHandle>(null);
  const [editingItem, setEditingItem] = useState<Partial<ExpenseRecord>>({});

  const expenseList = query.data || [];

  const handleOpenEdit = (item: ExpenseRecord) => {
    setEditingItem({ ...item });
    editModalRef.current?.open();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.id || !editingItem.amount || !editingItem.categoryId) {
      toast.error("Amount is required.");
      return;
    }

    try {
      await updateExpense.mutateAsync({
        id: editingItem.id,
        amount: Number(editingItem.amount),
        categoryId: editingItem.categoryId,
        date: editingItem.date,
        paidTo: editingItem.paidTo,
        description: editingItem.description,
        status: editingItem.status,
      });
      toast.success("Expense record updated successfully.");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update expense record.",
      );
    }
  };

  const handleDelete = async (item: ExpenseRecord) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this expense of $${item.amount}?`,
      )
    ) {
      return;
    }
    try {
      await deleteExpense.mutateAsync(item.id);
      toast.success("Expense record deleted.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete expense.");
    }
  };

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (_value: any, item: ExpenseRecord) => {
        const d = item.date || item.createdAt;
        return (
          <span className="text-xs text-base-content/70">
            {d ? new Date(d).toLocaleDateString() : "—"}
          </span>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => (
        <span className="font-semibold text-error">
          -$
          {Number(value || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "categoryId",
      label: "Category",
      render: (_value: string, item: ExpenseRecord) => (
        <span className="badge badge-sm badge-outline font-medium">
          {item.category?.name ||
            categoriesQuery.data?.find((c) => c.id === item.categoryId)?.name ||
            "—"}
        </span>
      ),
    },
    {
      key: "paidTo",
      label: "Vendor / Payee",
      render: (value: string) => (
        <span className="font-medium text-base-content">{value || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const s = (value || "Approved").toLowerCase();
        let badge = "badge-success";
        if (s === "pending") badge = "badge-warning";
        else if (s === "rejected") badge = "badge-error";
        return (
          <span
            className={`badge badge-soft ring ring-current/50 text-[10px] uppercase font-semibold badge-sm ${badge}`}
          >
            {value || "Approved"}
          </span>
        );
      },
    },
    {
      key: "description",
      label: "Description",
      render: (value: string) => (
        <span className="text-xs text-base-content/60 max-w-xs truncate block">
          {value || "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<ExpenseRecord>[] = [
    {
      key: "edit",
      label: "Edit",
      render: () => (
        <span className="flex items-center gap-2">
          <Edit className="size-4" /> Edit Record
        </span>
      ),
      action: (item: ExpenseRecord) => handleOpenEdit(item),
    },
    {
      key: "delete",
      label: "Delete",
      render: () => (
        <span className="flex items-center gap-2 text-error">
          <Trash2 className="size-4" /> Delete
        </span>
      ),
      action: (item: ExpenseRecord) => handleDelete(item),
    },
  ];

  return (
    <div>
      <PageLoader query={query}>
        <CustomTable
          ring={false}
          data={expenseList}
          columns={columns}
          actions={actions}
        />
      </PageLoader>

      <Modal ref={editModalRef} title="Edit Expense Record">
        <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
          <SimpleInput
            label="Amount ($)"
            type="number"
            step="0.01"
            value={editingItem.amount ?? ""}
            onChange={(e) =>
              setEditingItem((prev) => ({
                ...prev,
                amount: parseFloat(e.target.value) || 0,
              }))
            }
            required
          />
          <LocalSelect
            label="Category"
            value={editingItem.categoryId || ""}
            onChange={(e) =>
              setEditingItem((prev) => ({
                ...prev,
                categoryId: e.target.value,
              }))
            }
            required
            disabled={categoriesQuery.isPending || categoriesQuery.isError}
          >
            <option value="">Select a category</option>
            {editingItem.category &&
              !categories.some(
                (category) => category.id === editingItem.categoryId,
              ) && (
                <option value={editingItem.categoryId}>
                  {editingItem.category.name} (archived)
                </option>
              )}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </LocalSelect>
          <SimpleInput
            label="Date"
            type="date"
            value={editingItem.date?.slice(0, 10) || ""}
            onChange={(e) =>
              setEditingItem((prev) => ({ ...prev, date: e.target.value }))
            }
            required
          />
          <SimpleInput
            label="Vendor / Payee"
            type="text"
            value={editingItem.paidTo || ""}
            onChange={(e) =>
              setEditingItem((prev) => ({ ...prev, paidTo: e.target.value }))
            }
            required
          />
          <LocalSelect
            label="Status"
            value={editingItem.status || "Approved"}
            onChange={(e) =>
              setEditingItem((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </LocalSelect>
          <SimpleTextArea
            label="Description"
            value={editingItem.description || ""}
            onChange={(e) =>
              setEditingItem((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
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
              disabled={updateExpense.isPending}
              className="btn btn-primary"
            >
              {updateExpense.isPending ? "Saving..." : "Update Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
