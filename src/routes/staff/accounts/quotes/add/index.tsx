import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/Headers/PageHeader";
import { useContacts, useCompanies } from "@/api/crmApi";
import { useCreateQuote } from "@/api/salesApi";
import QuoteFields, {
  defaultQuoteValues,
  quotePayload,
  type QuoteFormValues,
} from "../-components/QuoteFields";

export const Route = createFileRoute("/staff/accounts/quotes/add/")({
  component: AddQuotePage,
});

function AddQuotePage() {
  const navigate = useNavigate();
  const contactsQuery = useContacts();
  const companiesQuery = useCompanies();
  const createQuote = useCreateQuote();
  const methods = useForm<QuoteFormValues>({ defaultValues: defaultQuoteValues() });

  const onSubmit = async (values: QuoteFormValues) => {
    if (!values.contactId && !values.companyRecordId) {
      toast.error("Select a contact, a company, or both.");
      return;
    }

    try {
      await createQuote.mutateAsync(quotePayload(values));
      toast.success("Quote created successfully.");
      await navigate({ to: "/staff/accounts/quotes" });
    } catch (error) {
      const response = error as { response?: { data?: { message?: string | string[] } } };
      const message = response.response?.data?.message;
      toast.error((Array.isArray(message) ? message.join(". ") : message) || "Failed to create quote. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <Link to="/staff/accounts/quotes" className="btn btn-ghost btn-sm w-fit gap-2">
        <ArrowLeft className="size-4" /> Back to quotes
      </Link>
      <PageHeader title="Create quote" description="Set the client, amount, scope, and terms for a new quote." />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 rounded-xl bg-base-100 p-5 sm:p-8">
          <QuoteFields
            contacts={contactsQuery.data || []}
            companies={companiesQuery.data || []}
            contactsLoading={contactsQuery.isLoading}
            companiesLoading={companiesQuery.isLoading}
          />
          {(contactsQuery.isError || companiesQuery.isError) && (
            <p role="alert" className="text-sm text-error">
              Some customer options could not be loaded. Retry the page to see the full list.
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3 border-t border-base-200 pt-5">
            <Link to="/staff/accounts/quotes" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={createQuote.isPending}>
              {createQuote.isPending ? "Creating quote..." : "Create quote"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
