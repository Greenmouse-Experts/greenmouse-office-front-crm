import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { Building2, Globe, Mail, Phone, MapPin, RefreshCw } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import CompanySummary from "./-components/CompanySummary";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import { useAdminCrossCompanies } from "@/api/adminApi";
import type { Company } from "@/api/crmApi";

export const Route = createFileRoute("/admin/contacts/companies/")({
  component: RouteComponent,
});

function RouteComponent() {
  const searchProps = useSearch();
  const query = useAdminCrossCompanies({
    search: searchProps.search || undefined,
  });

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleOpenDetails = (company: Company) => {
    setSelectedCompany(company);
    detailsModalRef.current?.open();
  };

  const columns = [
    {
      key: "name",
      label: "Company Name",
      render: (company: Company) => (
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-primary/10 text-primary rounded-lg w-10 h-10 flex items-center justify-center font-semibold">
              {company.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
          </div>
          <div>
            <div className="font-semibold text-base-content">
              {company.name}
            </div>
            {company.industry && (
              <div className="text-sm text-base-content/60">
                {company.industry}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact Info",
      render: (company: Company) => (
        <div className="space-y-0.5 text-sm text-base-content/70">
          {company.email && (
            <div className="flex items-center gap-1.5">
              <Mail size={12} className="text-base-content/40" />
              <span>{company.email}</span>
            </div>
          )}
          {company.workPhone && (
            <div className="flex items-center gap-1.5">
              <Phone size={12} className="text-base-content/40" />
              <span>{company.workPhone}</span>
            </div>
          )}
          {!company.email && !company.workPhone && (
            <span className="text-base-content/40">—</span>
          )}
        </div>
      ),
    },
    {
      key: "website",
      label: "Website",
      render: (company: Company) =>
        company.website ? (
          <a
            href={
              company.website.startsWith("http")
                ? company.website
                : `https://${company.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Globe size={12} />
            <span className="truncate max-w-[150px]">{company.website}</span>
          </a>
        ) : (
          <span className="text-sm text-base-content/40">—</span>
        ),
    },
    {
      key: "location",
      label: "Location",
      render: (company: Company) => {
        const parts = [company.city, company.state, company.country].filter(
          Boolean,
        );
        return parts.length > 0 ? (
          <div className="flex items-center gap-1.5 text-sm text-base-content/70">
            <MapPin size={12} className="text-base-content/40 shrink-0" />
            <span>{parts.join(", ")}</span>
          </div>
        ) : (
          <span className="text-sm text-base-content/40">—</span>
        );
      },
    },
  ];

  const actions: Actions<Company>[] = [
    {
      key: "view",
      label: "View Details",
      action: (company) => handleOpenDetails(company),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Companies Directory"
        description="Audit, monitor, and inspect corporate clients across all platform tenants"
      >
        <button
          onClick={() => query.refetch()}
          className="btn btn-outline btn-sm gap-2"
          disabled={query.isFetching}
        >
          <RefreshCw
            size={15}
            className={query.isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </PageHeader>

      <PageLoader query={query}>
        {() => (
          <div className="space-y-6">
            <CompanySummary />

            <SimpleContainer>
              <ContainerRow
                showSearch
                searchProps={searchProps}
                searchPlaceholder="Search companies by name..."
              />
              <CustomTable
                actions={actions}
                columns={columns}
                data={query.data || []}
              />
            </SimpleContainer>

            {/* Details Modal */}
            <Modal ref={detailsModalRef}>
              {selectedCompany && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-base-200 pb-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-xl">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-base-content">
                        {selectedCompany.name}
                      </h3>
                      {selectedCompany.industry && (
                        <p className="text-sm text-base-content/60">
                          Industry: {selectedCompany.industry}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Email
                      </span>
                      <span className="text-sm font-semibold text-base-content break-all">
                        {selectedCompany.email || "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Phone
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedCompany.workPhone || "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Website
                      </span>
                      <span className="text-sm font-semibold text-base-content break-all">
                        {selectedCompany.website || "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Location
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {[
                          selectedCompany.addressLine1,
                          selectedCompany.city,
                          selectedCompany.state,
                          selectedCompany.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </span>
                    </div>
                  </div>

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
          </div>
        )}
      </PageLoader>
    </div>
  );
}
