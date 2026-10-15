import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import SimpleContainer from "@/components/SimpleContainer";
import PageHeader from "@/components/Headers/PageHeader";
import ContainerRow from "@/components/ContainerRow";
import ActionButton from "@/components/buttons/ActionButton";
import Modal from "@/components/modals/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import PageLoader from "@/components/layout/PageLoader";
import { useSearch } from "@/stores/data";
import { useModal } from "@/store/modals";
import {
  useQuotes,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
  type Quote,
} from "@/api/salesApi";

export const Route = createFileRoute("/tenant/accounts/quotes/")({
  component: RouteComponent,
});

interface QuoteFormValues {
  date: string;
  clientName: string;
  amount: number;
  description: string;
  status: string;
}

const defaultValues = (): QuoteFormValues => ({
  date: new Date().toISOString().slice(0, 10),
  clientName: "",
  amount: 0,
  description: "",
  status: "pending",
});

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || fallback;
};

const formatAmount = (amount: number) =>
  Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const renderStatus = (status: string) => {
  const normalized = (status || "pending").toLowerCase();
  const color =
    normalized === "accepted"
      ? "badge-success"
      : normalized === "rejected" || normalized === "expired"
        ? "badge-error"
        : "badge-info";

  return (
    <span className={`badge badge-sm badge-soft font-medium capitalize ${color}`}>
      {normalized}
    </span>
  );
};

function RouteComponent() {
  const query = useQuotes();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const deleteQuote = useDeleteQuote();
  const searchProps = useSearch();
  const modal = useModal();
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const methods = useForm<QuoteFormValues>({ defaultValues: defaultValues() });

  const filteredQuotes = useMemo(() => {
    const search = (searchProps.search || "").trim().toLowerCase();
    const quotes = query.data || [];
    if (!search) return quotes;
    return quotes.filter((quote) =>
      [quote.clientName, quote.description, quote.status, quote.date]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search)),
    );
  }, [query.data, searchProps.search]);

  const openCreate = () => {
    setEditingQuote(null);
    methods.reset(defaultValues());
    modal.showModal();
  };

  const openEdit = (quote: Quote) => {
    const status = quote.status?.toLowerCase() || "pending";
    setEditingQuote(quote);
    methods.reset({
      date: quote.date?.slice(0, 10) || "",
      clientName: quote.clientName,
      amount: quote.amount,
      description: quote.description || "",
      status,
    });
    modal.showModal();
  };

  const onSubmit = async (values: QuoteFormValues) => {
    const quote = {
      date: values.date,
      clientName: values.clientName.trim(),
      amount: Number(values.amount),
      description: values.description.trim(),
    };

    try {
      if (editingQuote) {
        const statusChanged =
          values.status !== (editingQuote.status?.toLowerCase() || "pending");
        await updateQuote.mutateAsync({
          id: editingQuote.id,
          ...quote,
          ...(statusChanged ? { status: values.status } : {}),
        });
        toast.success("Quote updated successfully.");
      } else {
        await createQuote.mutateAsync({ ...quote, status: values.status });
        toast.success("Quote created successfully.");
      }
      modal.closeModal();
      methods.reset(defaultValues());
      setEditingQuote(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save quote. Please try again."));
    }
  };

  const handleDelete = async (quote: Quote) => {
    if (!window.confirm(`Delete quote for "${quote.clientName}"?`)) return;
    try {
      await deleteQuote.mutateAsync(quote.id);
      toast.success("Quote deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete quote."));
    }
  };

  const columns: columnType<Quote>[] = [
    {
      key: "date",
      label: "Date",
      render: (value: string, quote: Quote) => (
        <span className="text-sm text-base-content/70">
          {value || quote.createdAt
            ? new Date(value || quote.createdAt!).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      key: "clientName",
      label: "Client",
      render: (value: string) => (
        <span className="font-medium text-base-content">{value || "—"}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => (
        <span className="tabular-nums font-medium">{formatAmount(value)}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value: string) => (
        <span className="block max-w-xs truncate text-sm text-base-content/70" title={value || ""}>
          {value || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => renderStatus(value),
    },
  ];

  const actions: Actions<Quote>[] = [
    { key: "edit", label: "Edit Quote", action: openEdit },
    {
      key: "delete",
      label: "Delete Quote",
      render: () => <span className="font-medium text-error">Delete Quote</span>,
      action: handleDelete,
    },
  ];

  const isSaving = createQuote.isPending || updateQuote.isPending;

  return (
    <>
      <Modal ref={modal.ref} title={editingQuote ? "Edit Quote" : "Add Quote"}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <SimpleInput
                label="Date"
                type="date"
                {...methods.register("date", { required: "Date is required" })}
              />
              <SimpleInput
                label="Amount"
                type="number"
                min="0.01"
                step="0.01"
                {...methods.register("amount", {
                  required: "Amount is required",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Amount must be positive" },
                })}
              />
            </div>
            <SimpleInput
              label="Client Name"
              placeholder="Customer or company name"
              {...methods.register("clientName", {
                required: "Client name is required",
                validate: (value) => !!value.trim() || "Client name is required",
              })}
            />
            <SimpleInput
              label="Description"
              placeholder="What is this quote for?"
              {...methods.register("description", {
                required: "Description is required",
                validate: (value) => !!value.trim() || "Description is required",
              })}
            />
            <LocalSelect label="Status" {...methods.register("status")}>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              {editingQuote &&
                !["pending", "accepted", "rejected"].includes(
                  editingQuote.status.toLowerCase(),
                ) && (
                  <option value={editingQuote.status.toLowerCase()}>
                    {editingQuote.status}
                  </option>
                )}
            </LocalSelect>
            <div className="modal-action">
              <button type="button" className="btn" onClick={modal.closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : editingQuote ? "Save Changes" : "Add Quote"}
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
      <PageHeader title="Quotes" description="Create and manage customer quotes.">
        <ActionButton onClick={openCreate}>Add Quote</ActionButton>
      </PageHeader>
      <SimpleContainer title={<>Quotes {query.data && `(${query.data.length})`}</>}>
        <ContainerRow searchProps={searchProps} showSearch searchPlaceholder="Search quotes..." />
        <PageLoader
          query={query}
          emptyState={{
            title: "No Quotes Yet",
            description: "Create a quote to start tracking proposals for your customers.",
            actionText: "Add Quote",
            onAction: openCreate,
          }}
        >
          {() =>
            filteredQuotes.length > 0 ? (
              <CustomTable data={filteredQuotes} columns={columns} actions={actions} ring={false} />
            ) : (
              <div className="rounded-b-box border border-base-200 bg-base-100 px-4 py-10 text-center text-sm text-base-content/70">
                No quotes match your search.
              </div>
            )
          }
        </PageLoader>
      </SimpleContainer>
    </>
  );
}
