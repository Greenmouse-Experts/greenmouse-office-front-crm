import { useState, useRef } from "react";
import CustomTable from "@/components/tables/CustomTable";
import { type Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import PageLoader from "@/components/layout/PageLoader";
import {
  useIncomeRecords,
  useUpdateIncome,
  useDeleteIncome,
  useFinancialCategories,
  type IncomeRecord,
} from "@/api/financeApi";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

export default function IncomeTable() {
  const query = useIncomeRecords();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();
  const categoriesQuery = useFinancialCategories({ isActive: true });
  const categories =
    categoriesQuery.data?.filter((category) => category.kind === "income") ??
    [];

  const editModalRef = useRef<ModalHandle>(null);
  const [editingItem, setEditingItem] = useState<Partial<IncomeRecord>>({});

  const incomeList = query.data || [];

  const handleOpenEdit = (item: IncomeRecord) => {
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
      await updateIncome.mutateAsync({
        id: editingItem.id,
        amount: Number(editingItem.amount),
        categoryId: editingItem.categoryId,
        source: editingItem.source,
        description: editingItem.description,
        status: editingItem.status,
      });
      toast.success("Income record updated successfully.");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update income record.",
      );
    }
  };

  const handleDelete = async (item: IncomeRecord) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this income entry for $${item.amount}?`,
      )
    ) {
      return;
    }
    try {
      await deleteIncome.mutateAsync(item.id);
      toast.success("Income entry deleted.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to delete income entry.",
      );
    }
  };

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (_value: any, item: IncomeRecord) => {
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
        <span className="font-semibold text-success">
          +$
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
      render: (_value: string, item: IncomeRecord) => (
        <span className="badge badge-sm badge-outline font-medium">
          {item.category?.name ||
            categoriesQuery.data?.find((c) => c.id === item.categoryId)?.name ||
            "—"}
        </span>
      ),
    },
    {
      key: "source",
      label: "Payer / Source",
      render: (value: string) => (
        <span className="font-medium text-base-content">{value || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const s = (value || "Pending").toLowerCase();
        let badge = "badge-warning";
        if (s === "approved" || s === "received" || s === "paid") {
          badge = "badge-success";
        } else if (s === "rejected" || s === "overdue") {
          badge = "badge-error";
        }
        return (
          <span
            className={`badge badge-soft ring ring-current/50 text-[10px] uppercase font-semibold badge-sm ${badge}`}
          >
            {value || "Pending"}
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

  const actions: Actions<IncomeRecord>[] = [
    {
      key: "edit",
      label: "Edit",
      render: () => (
        <span className="flex items-center gap-2">
          <Edit className="size-4" /> Edit Record
        </span>
      ),
      action: (item: IncomeRecord) => handleOpenEdit(item),
    },
    {
      key: "delete",
      label: "Delete",
      render: () => (
        <span className="flex items-center gap-2 text-error">
          <Trash2 className="size-4" /> Delete
        </span>
      ),
      action: (item: IncomeRecord) => handleDelete(item),
    },
  ];

  return (
    <div>
      <PageLoader query={query}>
        <CustomTable
          ring={false}
          data={incomeList}
          columns={columns}
          actions={actions}
        />
      </PageLoader>

      <Modal ref={editModalRef} title="Edit Income Record">
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
            label="Payer / Source"
            type="text"
            value={editingItem.source || ""}
            onChange={(e) =>
              setEditingItem((prev) => ({ ...prev, source: e.target.value }))
            }
            required
          />
          <LocalSelect
            label="Status"
            value={editingItem.status || "Paid"}
            onChange={(e) =>
              setEditingItem((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Paid">Paid</option>
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
              disabled={updateIncome.isPending}
              className="btn btn-primary"
            >
              {updateIncome.isPending ? "Saving..." : "Update Income"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
