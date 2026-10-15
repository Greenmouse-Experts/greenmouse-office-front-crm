import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import ExpensesStat from "./-components/ExpensesStats";
import { useTabs, type Tab } from "@/stores/client";
import CustomTabs from "@/components/CustomTabs";
import IncomeTable from "./-components/IncomeTable";
import ExpenseTable from "./-components/ExpenseTable";
import ActionButton from "@/components/buttons/ActionButton";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import PageHeader from "@/components/Headers/PageHeader";
import LocalSelect from "@/components/inputs/LocalSelect";
import {
  useCreateIncome,
  useCreateExpense,
  useFinancialCategories,
} from "@/api/financeApi";
import { toast } from "sonner";
import { PlusCircle, Tags } from "lucide-react";

export const Route = createFileRoute("/tenant/accounts/income-expenses/")({
  component: RouteComponent,
});

function RouteComponent() {
  const tabs: Tab[] = [{ name: "Income" }, { name: "Expenses" }];
  const tab = useTabs(tabs, { name: "Income" });

  const createIncome = useCreateIncome();
  const createExpense = useCreateExpense();
  const categoriesQuery = useFinancialCategories({ isActive: true });
  const incomeCategories =
    categoriesQuery.data?.filter((category) => category.kind === "income") ??
    [];
  const expenseCategories =
    categoriesQuery.data?.filter((category) => category.kind === "expense") ??
    [];

  const incomeModalRef = useRef<ModalHandle>(null);
  const expenseModalRef = useRef<ModalHandle>(null);

  const [incomeForm, setIncomeForm] = useState({
    amount: "",
    categoryId: "",
    source: "",
    description: "",
    status: "Pending",
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    categoryId: "",
    date: new Date().toLocaleDateString("en-CA"),
    paidTo: "",
    description: "",
    status: "Pending",
  });

  const handleOpenIncome = () => {
    setIncomeForm({
      amount: "",
      categoryId: "",
      source: "",
      description: "",
      status: "Pending",
    });
    incomeModalRef.current?.open();
  };

  const handleOpenExpense = () => {
    setExpenseForm({
      amount: "",
      categoryId: "",
      date: new Date().toLocaleDateString("en-CA"),
      paidTo: "",
      description: "",
      status: "Pending",
    });
    expenseModalRef.current?.open();
  };

  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !Number.isFinite(Number(incomeForm.amount)) ||
      Number(incomeForm.amount) <= 0 ||
      !incomeForm.source.trim() ||
      !incomeForm.categoryId ||
      !incomeCategories.some((c) => c.id === incomeForm.categoryId)
    ) {
      toast.error(
        "Enter a positive amount, source, and active income category.",
      );
      return;
    }
    try {
      await createIncome.mutateAsync({
        amount: Number(incomeForm.amount),
        categoryId: incomeForm.categoryId,
        source: incomeForm.source.trim(),
        description: incomeForm.description,
        status: incomeForm.status,
      });
      toast.success("Income record created successfully.");
      incomeModalRef.current?.close();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create income record.",
      );
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !Number.isFinite(Number(expenseForm.amount)) ||
      Number(expenseForm.amount) <= 0 ||
      !expenseForm.paidTo.trim() ||
      !expenseForm.date ||
      !expenseForm.categoryId ||
      !expenseCategories.some((c) => c.id === expenseForm.categoryId)
    ) {
      toast.error(
        "Enter a positive amount, date, recipient, and active expense category.",
      );
      return;
    }
    try {
      await createExpense.mutateAsync({
        amount: Number(expenseForm.amount),
        categoryId: expenseForm.categoryId,
        date: expenseForm.date,
        paidTo: expenseForm.paidTo.trim(),
        description: expenseForm.description,
        status: expenseForm.status,
      });
      toast.success("Expense record created successfully.");
      expenseModalRef.current?.close();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create expense record.",
      );
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader
        title="Income & Expenses"
        description="View cash flow, track incoming revenue, and log operational expenses"
      >
        <Link
          to="/tenant/accounts/income-expenses/categories"
          className="btn btn-outline btn-sm"
        >
          <Tags className="size-4" /> Manage Categories
        </Link>
      </PageHeader>

      <ExpensesStat />

      <div className="bg-base-100 shadow rounded-box flex items-center justify-between p-2">
        <CustomTabs tabs={tabs} tabProps={tab} />
        <div>
          {tab.tab.name === "Income" ? (
            <ActionButton
              className="btn btn-success btn-sm text-success-content"
              onClick={handleOpenIncome}
            >
              <PlusCircle className="size-4 mr-1" /> Add Income
            </ActionButton>
          ) : (
            <ActionButton
              className="btn btn-error btn-sm text-error-content"
              onClick={handleOpenExpense}
            >
              <PlusCircle className="size-4 mr-1" /> Add Expense
            </ActionButton>
          )}
        </div>
      </div>

      <div className="bg-base-100 shadow rounded-box p-4">
        {tab.tab.name === "Income" ? <IncomeTable /> : <ExpenseTable />}
      </div>

      {/* Add Income Modal */}
      <Modal ref={incomeModalRef} title="Log New Income">
        <form onSubmit={handleSubmitIncome} className="space-y-4 pt-2">
          <SimpleInput
            label="Amount ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={incomeForm.amount}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, amount: e.target.value })
            }
            required
          />
          <LocalSelect
            label="Income Category"
            value={incomeForm.categoryId}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, categoryId: e.target.value })
            }
            required
            disabled={categoriesQuery.isPending || categoriesQuery.isError}
          >
            <option value="">
              {categoriesQuery.isPending
                ? "Loading categories..."
                : "Select a category"}
            </option>
            {incomeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </LocalSelect>
          {categoriesQuery.isError && (
            <p className="text-sm text-error">
              Could not load categories. Please retry.
            </p>
          )}
          {!categoriesQuery.isPending &&
            !categoriesQuery.isError &&
            incomeCategories.length === 0 && (
              <Link
                to="/tenant/accounts/income-expenses/categories"
                className="link link-primary text-sm"
              >
                Create an income category first
              </Link>
            )}
          <SimpleInput
            label="Payer / Source"
            type="text"
            placeholder="e.g. Acme Corp, Client X"
            value={incomeForm.source}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, source: e.target.value })
            }
            required
          />
          <LocalSelect
            label="Payment Status"
            value={incomeForm.status}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, status: e.target.value })
            }
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Paid">Paid</option>
          </LocalSelect>
          <SimpleTextArea
            label="Description / Memo"
            placeholder="Notes or invoice reference..."
            value={incomeForm.description}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, description: e.target.value })
            }
          />
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => incomeModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createIncome.isPending}
              className="btn btn-primary"
            >
              {createIncome.isPending ? "Saving..." : "Save Income"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal ref={expenseModalRef} title="Record New Expense">
        <form onSubmit={handleSubmitExpense} className="space-y-4 pt-2">
          <SimpleInput
            label="Amount ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={expenseForm.amount}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, amount: e.target.value })
            }
            required
          />
          <LocalSelect
            label="Expense Category"
            value={expenseForm.categoryId}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, categoryId: e.target.value })
            }
            required
            disabled={categoriesQuery.isPending || categoriesQuery.isError}
          >
            <option value="">
              {categoriesQuery.isPending
                ? "Loading categories..."
                : "Select a category"}
            </option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </LocalSelect>
          {categoriesQuery.isError && (
            <p className="text-sm text-error">
              Could not load categories. Please retry.
            </p>
          )}
          {!categoriesQuery.isPending &&
            !categoriesQuery.isError &&
            expenseCategories.length === 0 && (
              <Link
                to="/tenant/accounts/income-expenses/categories"
                className="link link-primary text-sm"
              >
                Create an expense category first
              </Link>
            )}
          <SimpleInput
            label="Date"
            type="date"
            value={expenseForm.date}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, date: e.target.value })
            }
            required
          />
          <SimpleInput
            label="Vendor / Payee"
            type="text"
            placeholder="e.g. AWS, Office Depot, Contractor"
            value={expenseForm.paidTo}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, paidTo: e.target.value })
            }
            required
          />
          <LocalSelect
            label="Approval Status"
            value={expenseForm.status}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, status: e.target.value })
            }
          >
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </LocalSelect>
          <SimpleTextArea
            label="Description / Memo"
            placeholder="Details or receipt reference..."
            value={expenseForm.description}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, description: e.target.value })
            }
          />
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => expenseModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createExpense.isPending}
              className="btn btn-error text-error-content"
            >
              {createExpense.isPending ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
