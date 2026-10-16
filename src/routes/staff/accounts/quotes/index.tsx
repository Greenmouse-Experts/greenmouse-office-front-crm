import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import SimpleContainer from "@/components/SimpleContainer";
import PageHeader from "@/components/Headers/PageHeader";
import ContainerRow from "@/components/ContainerRow";
import ActionButton from "@/components/buttons/ActionButton";
import Modal from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import PriceInput from "@/components/inputs/PriceInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
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
import { useContacts, useCompanies } from "@/api/crmApi";

export const Route = createFileRoute("/staff/accounts/quotes/")({
  component: RouteComponent,
});

interface QuoteFormValues {
  date: string;
  clientType: "contact" | "company";
  contactId: string;
  companyId: string;
  amount: number;
  description: string;
  status: string;
}

const defaultValues = (): QuoteFormValues => ({
  date: new Date().toISOString().slice(0, 10),
  clientType: "contact",
  contactId: "",
  companyId: "",
  amount: 0,
  description: "",
  status: "draft",
});

const QUOTE_STATUSES = ["draft", "sent", "accepted", "rejected"];

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || fallback;
};

const formatAmount = (amount: number) =>
  Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const renderStatus = (status: string) => {
  const normalized = (status || "draft").toLowerCase();
  const color =
    normalized === "accepted"
      ? "badge-success"
      : normalized === "rejected" || normalized === "expired"
        ? "badge-error"
        : "badge-info";

  return (
    <span
      className={`badge badge-sm badge-soft font-medium capitalize ${color}`}
    >
      {normalized}
    </span>
  );
};

function RouteComponent() {
  const queryClient = useQueryClient();
  const query = useQuotes();
  const contactsQuery = useContacts();
  const companiesQuery = useCompanies();

  const contacts = useMemo(() => contactsQuery.data || [], [contactsQuery.data]);
  const companies = useMemo(() => companiesQuery.data || [], [companiesQuery.data]);

  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const deleteQuote = useDeleteQuote();
  const searchProps = useSearch();
  const formModal = useModal();
  const deleteModal = useModal();

  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null);

  const methods = useForm<QuoteFormValues>({ defaultValues: defaultValues() });
  const clientType = methods.watch("clientType");

  const getClientLabel = (quote: Quote) => {
    if (quote.contactId) {
      const contact = contacts.find((c) => c.id === quote.contactId);
      if (contact) {
        const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
        return fullName || contact.email || quote.contactId;
      }
    }
    if (quote.companyId) {
      const company = companies.find((c) => c.id === quote.companyId);
      if (company) {
        return company.name;
      }
    }
    if (quote.contact) {
      const fullName = `${quote.contact.firstName || ""} ${quote.contact.lastName || ""}`.trim();
      if (fullName) return fullName;
      if (quote.contact.email) return quote.contact.email;
    }
    if (quote.company?.name) {
      return quote.company.name;
    }
    return quote.clientName || "—";
  };

  const filteredQuotes = useMemo(() => {
    const search = (searchProps.search || "").trim().toLowerCase();
    const quotes = query.data || [];
    if (!search) return quotes;
    return quotes.filter((quote) => {
      const client = getClientLabel(quote).toLowerCase();
      const desc = (quote.description || "").toLowerCase();
      const status = (quote.status || "").toLowerCase();
      const date = (quote.date || "").toLowerCase();
      return (
        client.includes(search) ||
        desc.includes(search) ||
        status.includes(search) ||
        date.includes(search)
      );
    });
  }, [query.data, searchProps.search, contacts, companies]);

  const openCreate = () => {
    setEditingQuote(null);
    methods.reset(defaultValues());
    formModal.showModal();
  };

  const openEdit = (quote: Quote) => {
    const status = quote.status?.toLowerCase() || "draft";
    const isCompany = Boolean(quote.companyId && !quote.contactId);
    setEditingQuote(quote);
    methods.reset({
      date: quote.date?.slice(0, 10) || "",
      clientType: isCompany ? "company" : "contact",
      contactId: quote.contactId || "",
      companyId: quote.companyId || "",
      amount: quote.amount,
      description: quote.description || "",
      status,
    });
    formModal.showModal();
  };

  const onSubmit = async (values: QuoteFormValues) => {
    const isContact = values.clientType === "contact";
    const contactId = isContact ? values.contactId || undefined : undefined;
    const companyId = !isContact ? values.companyId || undefined : undefined;

    if (isContact && !contactId) {
      toast.error("Please select a contact.");
      return;
    }
    if (!isContact && !companyId) {
      toast.error("Please select a company.");
      return;
    }

    const selectedContact = contactId
      ? contacts.find((c) => c.id === contactId)
      : null;
    const selectedCompany = companyId
      ? companies.find((c) => c.id === companyId)
      : null;

    const computedClientName = selectedContact
      ? `${selectedContact.firstName} ${selectedContact.lastName}`.trim() || selectedContact.email
      : selectedCompany
        ? selectedCompany.name
        : "";

    const quotePayload: Partial<Quote> = {
      date: values.date,
      amount: Number(values.amount),
      description: values.description.trim(),
      contactId,
      companyId,
      ...(computedClientName ? { clientName: computedClientName } : {}),
      status: values.status,
    };

    try {
      if (editingQuote) {
        const statusChanged =
          values.status !== (editingQuote.status?.toLowerCase() || "draft");
        await updateQuote.mutateAsync({
          id: editingQuote.id,
          ...quotePayload,
          ...(statusChanged ? { status: values.status } : {}),
        });
        toast.success("Quote updated successfully.");
      } else {
        await createQuote.mutateAsync(quotePayload);
        toast.success("Quote created successfully.");
      }
      formModal.closeModal();
      methods.reset(defaultValues());
      setEditingQuote(null);
      void queryClient.invalidateQueries({ queryKey: ["quotes"] });
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to save quote. Please try again."),
      );
    }
  };

  const handleDelete = (quote: Quote) => {
    setDeletingQuote(quote);
    deleteModal.showModal();
  };

  const confirmDelete = async () => {
    if (!deletingQuote) return;
    try {
      await deleteQuote.mutateAsync(deletingQuote.id);
      await queryClient.invalidateQueries({ queryKey: ["quotes"] });
      await query.refetch();
      toast.success("Quote deleted successfully.");
      deleteModal.closeModal();
      setDeletingQuote(null);
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
      render: (_: string, quote: Quote) => {
        const isCompany = Boolean(quote.companyId);
        return (
          <div className="flex flex-col">
            <span className="font-medium text-base-content">
              {getClientLabel(quote)}
            </span>
            {quote.contactId && (
              <span className="text-[10px] text-base-content/50 uppercase font-medium">
                Contact
              </span>
            )}
            {isCompany && (
              <span className="text-[10px] text-base-content/50 uppercase font-medium">
                Company
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => (
        <span className="tabular-nums font-semibold text-base-content">
          ₦{formatAmount(value)}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value: string) => (
        <span
          className="block max-w-xs truncate text-sm text-base-content/70"
          title={value || ""}
        >
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
      render: () => (
        <span className="font-medium text-error">Delete Quote</span>
      ),
      action: handleDelete,
    },
  ];

  const isSaving = createQuote.isPending || updateQuote.isPending;

  return (
    <>
      {/* Create / Edit Quote Modal */}
      <Modal
        ref={formModal.ref}
        title={editingQuote ? "Edit Quote" : "Add Quote"}
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <SimpleInput
                label="Date"
                type="date"
                {...methods.register("date", { required: "Date is required" })}
              />
              <PriceInput
                label="Amount (₦)"
                {...methods.register("amount", {
                  required: "Amount is required",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Amount must be positive" },
                })}
              />
            </div>

            {/* Client Selection (Contact vs Company) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-base-content/70 block">
                Client Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    clientType === "contact"
                      ? "btn-primary"
                      : "btn-outline border-base-300"
                  }`}
                  onClick={() => {
                    methods.setValue("clientType", "contact");
                    methods.setValue("companyId", "");
                  }}
                >
                  Contact / Customer
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    clientType === "company"
                      ? "btn-primary"
                      : "btn-outline border-base-300"
                  }`}
                  onClick={() => {
                    methods.setValue("clientType", "company");
                    methods.setValue("contactId", "");
                  }}
                >
                  Company
                </button>
              </div>

              {clientType === "contact" ? (
                <div className="pt-1">
                  <LocalSelect
                    label="Select Contact / Customer *"
                    {...methods.register("contactId")}
                  >
                    <option value="">Choose a contact...</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                        {c.companyName ? ` (${c.companyName})` : c.email ? ` (${c.email})` : ""}
                      </option>
                    ))}
                  </LocalSelect>
                  {contactsQuery.isLoading && (
                    <p className="text-xs text-base-content/50 mt-1">
                      Loading contacts...
                    </p>
                  )}
                </div>
              ) : (
                <div className="pt-1">
                  <LocalSelect
                    label="Select Company *"
                    {...methods.register("companyId")}
                  >
                    <option value="">Choose a company...</option>
                    {companies.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name}
                        {comp.email ? ` (${comp.email})` : comp.city ? ` (${comp.city})` : ""}
                      </option>
                    ))}
                  </LocalSelect>
                  {companiesQuery.isLoading && (
                    <p className="text-xs text-base-content/50 mt-1">
                      Loading companies...
                    </p>
                  )}
                </div>
              )}
            </div>

            <SimpleTextArea
              label="Description"
              placeholder="What is this quote for?"
              rows={3}
              {...methods.register("description", {
                required: "Description is required",
                validate: (value) =>
                  !!value.trim() || "Description is required",
              })}
            />

            <LocalSelect label="Status" {...methods.register("status")}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              {editingQuote &&
                !QUOTE_STATUSES.includes(editingQuote.status.toLowerCase()) && (
                  <option value={editingQuote.status.toLowerCase()}>
                    {editingQuote.status}
                  </option>
                )}
            </LocalSelect>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={formModal.closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : editingQuote
                    ? "Save Changes"
                    : "Add Quote"}
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal ref={deleteModal.ref} title="Delete Quote">
        <div className="space-y-4">
          <p className="text-sm text-base-content/80">
            Are you sure you want to delete this quote for{" "}
            <span className="font-semibold text-base-content">
              {deletingQuote ? getClientLabel(deletingQuote) : "this client"}
            </span>
            {deletingQuote?.amount !== undefined ? (
              <>
                {" "}valued at{" "}
                <span className="font-semibold text-primary font-mono">
                  ₦{formatAmount(deletingQuote.amount)}
                </span>
              </>
            ) : null}
            ? This action cannot be undone.
          </p>
          <div className="modal-action flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                deleteModal.closeModal();
                setDeletingQuote(null);
              }}
              disabled={deleteQuote.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-error btn-sm text-white"
              onClick={confirmDelete}
              disabled={deleteQuote.isPending}
            >
              {deleteQuote.isPending ? "Deleting..." : "Delete Quote"}
            </button>
          </div>
        </div>
      </Modal>

      <PageHeader
        title="Quotes"
        description="Create and manage customer quotes."
      >
        <ActionButton onClick={openCreate}>Add Quote</ActionButton>
      </PageHeader>

      <SimpleContainer
        title={<>Quotes {query.data && `(${filteredQuotes.length})`}</>}
      >
        <ContainerRow
          searchProps={searchProps}
          showSearch
          searchPlaceholder="Search quotes..."
        />
        <PageLoader
          query={query}
          emptyState={{
            title: "No Quotes Yet",
            description:
              "Create a quote to start tracking proposals for your customers.",
            actionText: "Add Quote",
            onAction: openCreate,
          }}
        >
          {() =>
            filteredQuotes.length > 0 ? (
              <CustomTable
                data={filteredQuotes}
                columns={columns}
                actions={actions}
                ring={false}
              />
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
