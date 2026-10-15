import { useState, useRef, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import CompanySummary from "./-components/CompanySummary";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import CreateTicketModal, {
  type CreateTicketModalHandle,
} from "@/components/support/CreateTicketModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import { useSearch } from "@/stores/data";
import { useCompanies, useDeleteCompany, type Company } from "@/api/crmApi";
import { toast } from "sonner";
import {
  PlusCircleIcon,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Eye,
  Trash2,
  LifeBuoy,
} from "lucide-react";

export const Route = createFileRoute("/tenant/contacts/companies/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useCompanies();
  const deleteCompany = useDeleteCompany();
  const searchProps = useSearch();

  const detailsModalRef = useRef<ModalHandle>(null);
  const ticketModalRef = useRef<CreateTicketModalHandle>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const companies = query.data || [];

  const filteredCompanies = useMemo(() => {
    const q = (searchProps.search || "").toLowerCase().trim();
    if (!q) return companies;
    return companies.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const industry = (c.industry || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const city = (c.city || "").toLowerCase();
      return (
        name.includes(q) ||
        industry.includes(q) ||
        email.includes(q) ||
        city.includes(q)
      );
    });
  }, [companies, searchProps.search]);

  const handleDelete = async (company: Company) => {
    if (
      !window.confirm(
        `Are you sure you want to delete company account "${company.name}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteCompany.mutateAsync(company.id);
      toast.success(`Company "${company.name}" deleted successfully.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete company.");
    }
  };

  const companyColumns = [
    {
      key: "name",
      label: "Company",
      render: (_value: any, item: Company) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
            <Building2 className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.name}
            </div>
            <div className="text-xs text-base-content/60">
              {item.industry || "General Industry"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value: string) => (
        <span className="text-xs text-base-content/70">{value || "—"}</span>
      ),
    },
    {
      key: "workPhone",
      label: "Phone",
      render: (value: string) => (
        <span className="text-xs text-base-content/70">{value || "—"}</span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (_value: any, item: Company) => (
        <span className="text-xs text-base-content/60">
          {[item.city, item.state, item.country].filter(Boolean).join(", ") ||
            "—"}
        </span>
      ),
    },
    {
      key: "website",
      label: "Website",
      render: (value: string) =>
        value ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Globe className="size-3" /> Visit
          </a>
        ) : (
          <span className="text-xs text-base-content/40">—</span>
        ),
    },
  ];

  const actions: Actions<Company>[] = [
    {
      key: "ticket",
      label: "Create Ticket",
      render: () => (
        <span className="flex items-center gap-2">
          <LifeBuoy className="size-4" /> Create Ticket
        </span>
      ),
      action: (item: Company) =>
        ticketModalRef.current?.open({
          companyId: item.id,
          companyName: item.name,
        }),
    },
    {
      key: "view",
      label: "View Details",
      render: () => (
        <span className="flex items-center gap-2">
          <Eye className="size-4" /> View Details
        </span>
      ),
      action: (item: Company) => {
        setSelectedCompany(item);
        detailsModalRef.current?.open();
      },
    },
    {
      key: "delete",
      label: "Delete Company",
      render: () => (
        <span className="flex items-center gap-2 text-error">
          <Trash2 className="size-4" /> Delete
        </span>
      ),
      action: (item: Company) => handleDelete(item),
    },
  ];

  return (
    <>
      <PageHeader
        title="Companies"
        description="Directory of enterprise accounts, corporate partners, and suppliers"
      >
        <div>
          <Link to="/tenant/contacts/companies/add" className="btn btn-primary">
            <PlusCircleIcon className="size-4 mr-1" /> Add Company
          </Link>
        </div>
      </PageHeader>

      <CompanySummary companies={companies} />

      <SimpleContainer title="Company Accounts">
        <ContainerRow searchProps={searchProps} />
        <PageLoader query={query}>
          <div className="bg-base-100">
            <CustomTable
              ring={false}
              data={filteredCompanies}
              columns={companyColumns}
              actions={actions}
            />
          </div>
        </PageLoader>
      </SimpleContainer>

      {/* View Company Modal */}
      <Modal ref={detailsModalRef} title="Company Account Profile">
        {selectedCompany && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-4 bg-base-200/50 p-4 rounded-xl">
              <div className="size-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-semibold text-xl">
                <Building2 className="size-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  {selectedCompany.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-base-content/60 mt-0.5">
                  <span className="badge badge-sm badge-outline">
                    {selectedCompany.industry || "General Industry"}
                  </span>
                  {selectedCompany.groupName && (
                    <>
                      <span>•</span>
                      <span>{selectedCompany.groupName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-base-200/40 p-3 rounded-lg flex items-start gap-3">
                <Mail className="size-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-base-content/60">
                    Business Email
                  </div>
                  <div className="text-sm font-medium text-base-content break-all">
                    {selectedCompany.email || "—"}
                  </div>
                </div>
              </div>

              <div className="bg-base-200/40 p-3 rounded-lg flex items-start gap-3">
                <Phone className="size-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-base-content/60">
                    Phone Number
                  </div>
                  <div className="text-sm font-medium text-base-content">
                    {selectedCompany.workPhone || "—"}
                  </div>
                </div>
              </div>

              <div className="bg-base-200/40 p-3 rounded-lg flex items-start gap-3">
                <Globe className="size-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-base-content/60">Website</div>
                  <div className="text-sm font-medium text-base-content">
                    {selectedCompany.website ? (
                      <a
                        href={
                          selectedCompany.website.startsWith("http")
                            ? selectedCompany.website
                            : `https://${selectedCompany.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedCompany.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-base-200/40 p-3 rounded-lg flex items-start gap-3">
                <MapPin className="size-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-base-content/60">
                    Headquarters
                  </div>
                  <div className="text-sm font-medium text-base-content">
                    {[
                      selectedCompany.addressLine1,
                      selectedCompany.city,
                      selectedCompany.state,
                      selectedCompany.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </div>
                </div>
              </div>
            </div>

            {selectedCompany.federalIdNumber && (
              <div className="bg-base-200/30 p-3 rounded-lg text-xs">
                <span className="font-semibold text-base-content/70">
                  Federal Tax ID:{" "}
                </span>
                <span className="font-mono text-base-content">
                  {selectedCompany.federalIdNumber}
                </span>
              </div>
            )}

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => detailsModalRef.current?.close()}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
      <CreateTicketModal ref={ticketModalRef} />
    </>
  );
}
