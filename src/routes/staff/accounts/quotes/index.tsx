import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import SimpleContainer from "@/components/SimpleContainer";
import PageHeader from "@/components/Headers/PageHeader";
import ContainerRow from "@/components/ContainerRow";
import Modal from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import { useSearch } from "@/stores/data";
import { useModal } from "@/store/modals";
import {
  useQuotes,
  useUpdateQuote,
  useDeleteQuote,
  type Quote,
} from "@/api/salesApi";
import { useContacts, useCompanies } from "@/api/crmApi";
import QuoteFields, { defaultQuoteValues, quotePayload, type QuoteFormValues } from "./-components/QuoteFields";

export const Route = createFileRoute("/staff/accounts/quotes/")({
  component: RouteComponent,
});

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuotes();
  const contactsQuery = useContacts();
  const companiesQuery = useCompanies();

  const contacts = useMemo(() => contactsQuery.data || [], [contactsQuery.data]);
  const companies = useMemo(() => companiesQuery.data || [], [companiesQuery.data]);

  const updateQuote = useUpdateQuote();
  const deleteQuote = useDeleteQuote();
  const searchProps = useSearch();
  const formModal = useModal();
  const deleteModal = useModal();

  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null);

  const methods = useForm<QuoteFormValues>({ defaultValues: defaultQuoteValues() });

  const getClientLabel = (quote: Quote) => {
    if (quote.contactId) {
      const contact = contacts.find((c) => c.id === quote.contactId);
      if (contact) {
        const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
        return fullName || contact.email || quote.contactId;
      }
    }
    if (quote.companyRecordId || quote.companyId) {
      const company = companies.find((c) => c.id === (quote.companyRecordId || quote.companyId));
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

  const openEdit = (quote: Quote) => {
    const status = quote.status?.toLowerCase() || "draft";
    setEditingQuote(quote);
    methods.reset({
      date: quote.date?.slice(0, 10) || "",
      contactId: quote.contactId || "",
      companyRecordId: quote.companyRecordId || "",
      amount: quote.amount,
      description: quote.description || "",
      status,
      expiresAt: quote.expiresAt?.slice(0, 10) || "",
      notes: quote.notes || "",
    });
    formModal.showModal();
  };

  const onSubmit = async (values: QuoteFormValues) => {
    try {
      if (!editingQuote) return;
      await updateQuote.mutateAsync({ id: editingQuote.id, ...quotePayload(values) });
      toast.success("Quote updated successfully.");
      formModal.closeModal();
      methods.reset(defaultQuoteValues());
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
        const isCompany = Boolean(quote.companyRecordId || quote.companyId);
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

  const isSaving = updateQuote.isPending;

  return (
    <>
      <Modal ref={formModal.ref} title="Edit Quote">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <QuoteFields
              contacts={contacts}
              companies={companies}
              contactsLoading={contactsQuery.isLoading}
              companiesLoading={companiesQuery.isLoading}
              editingStatus={editingQuote?.status}
            />
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={formModal.closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
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
        <Link to="/staff/accounts/quotes/add" className="btn btn-primary">Add Quote</Link>
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
            onAction: () => navigate({ to: "/staff/accounts/quotes/add" }),
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
