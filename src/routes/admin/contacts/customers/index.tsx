import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { User, RefreshCw, Building2 } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import CustomerSummary from "./-components/CustomerSum";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import { useAdminCrossContacts } from "@/api/adminApi";
import type { Customer } from "@/api/crmApi";

export const Route = createFileRoute("/admin/contacts/customers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [filter, setFilter] = useState<string>("all");
  const searchProps = useSearch();
  const query = useAdminCrossContacts({
    search: searchProps.search || undefined,
  });

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const rawCustomers: Customer[] = (query.data || []) as Customer[];

  const filteredCustomers = useMemo(() => {
    return rawCustomers.filter((item) => {
      const isBusiness =
        item.type === "business" || !!item.companyName || !!item.companyId;
      if (filter === "individual") {
        return !isBusiness;
      }
      if (filter === "business") {
        return isBusiness;
      }
      if (filter === "has_phone") {
        return !!(item.workPhone || item.cellPhone || item.phone);
      }
      return true;
    });
  }, [rawCustomers, filter]);

  const handleOpenDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    detailsModalRef.current?.open();
  };

  const columns = [
    {
      key: "name",
      label: "Customer Name",
      render: (_value: any, item: Customer) => {
        const initials =
          `${item.firstName?.[0] || ""}${item.lastName?.[0] || ""}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              {initials || <User className="size-5" />}
            </div>
            <div>
              <div className="font-semibold text-base-content text-sm leading-tight">
                {item.firstName} {item.lastName}
              </div>
              <div className="text-sm text-base-content/60">{item.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Client Type",
      render: (_value: any, item: Customer) => {
        const isBusiness =
          item.type === "business" || !!item.companyName || !!item.companyId;
        return (
          <span
            className={`badge badge-md font-medium text-sm ${
              isBusiness ? "badge-primary badge-outline" : "badge-ghost"
            }`}
          >
            {isBusiness ? "Business" : "Individual"}
          </span>
        );
      },
    },
    {
      key: "company",
      label: "Company / Account",
      render: (_value: any, item: Customer) => {
        const companyName = item.companyName || item.company?.name;
        if (!companyName) {
          return <span className="text-sm text-base-content/40">—</span>;
        }
        return (
          <div className="flex items-center gap-1.5 text-sm font-medium text-base-content">
            <Building2 className="size-3.5 text-base-content/50" />
            <span>{companyName}</span>
          </div>
        );
      },
    },
    {
      key: "workPhone",
      label: "Phone",
      render: (_value: any, item: Customer) => (
        <span className="text-sm text-base-content/70">
          {item.workPhone || item.cellPhone || item.phone || "—"}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (_value: any, item: Customer) => {
        const loc = [item.city, item.state, item.country]
          .filter(Boolean)
          .join(", ");
        return (
          <span className="text-sm text-base-content/70">{loc || "—"}</span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date Added",
      render: (_value: any, item: Customer) => (
        <span className="text-sm text-base-content/60">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Customer>[] = [
    {
      key: "view",
      label: "View Details",
      action: (customer) => handleOpenDetails(customer),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers Directory"
        description="Audit, monitor, and inspect individual and business customer accounts across all platform tenants"
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
            <CustomerSummary customers={rawCustomers} />

            <SimpleContainer
              title={
                <div className="flex items-center gap-2">
                  <span>Customer Directory</span>
                  <span className="badge badge-md badge-ghost">
                    {filteredCustomers.length}
                  </span>
                </div>
              }
            >
              <ContainerRow
                showSearch
                searchProps={searchProps}
                searchPlaceholder="Search customers by name, email, or company..."
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "All Contacts", key: "all" },
                    { label: "Individual", key: "individual" },
                    { label: "Business", key: "business" },
                    { label: "With Phone", key: "has_phone" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`btn btn-sm rounded-full text-sm ${
                        filter === tab.key
                          ? "btn-primary text-primary-content"
                          : "btn-ghost text-base-content/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </ContainerRow>

              <CustomTable
                actions={actions}
                columns={columns}
                data={filteredCustomers}
              />
            </SimpleContainer>

            {/* Customer Details Modal */}
            <Modal ref={detailsModalRef}>
              {selectedCustomer && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-base-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-3 rounded-xl font-semibold text-base">
                        {`${selectedCustomer.firstName?.[0] || ""}${selectedCustomer.lastName?.[0] || ""}`.toUpperCase() || (
                          <User size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-base-content">
                          {selectedCustomer.firstName}{" "}
                          {selectedCustomer.lastName}
                        </h3>
                        <p className="text-sm text-base-content/60">
                          Customer ID: {selectedCustomer.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`badge badge-md text-sm ${
                        selectedCustomer.type === "business" ||
                        selectedCustomer.companyName
                          ? "badge-primary badge-outline"
                          : "badge-ghost"
                      }`}
                    >
                      {selectedCustomer.type === "business" ||
                      selectedCustomer.companyName
                        ? "Business Client"
                        : "Individual Client"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Email Address
                      </span>
                      <span className="text-sm font-semibold text-base-content break-all">
                        {selectedCustomer.email || "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Phone
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedCustomer.workPhone ||
                          selectedCustomer.cellPhone ||
                          selectedCustomer.phone ||
                          "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Company Name
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedCustomer.companyName ||
                          selectedCustomer.company?.name ||
                          "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Location
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {[
                          selectedCustomer.addressLine1,
                          selectedCustomer.city,
                          selectedCustomer.state,
                          selectedCustomer.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Created At
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedCustomer.createdAt
                          ? new Date(
                              selectedCustomer.createdAt,
                            ).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Tenant Scope
                      </span>
                      <span className="text-sm font-mono text-base-content truncate block">
                        {(selectedCustomer as any).tenantId ||
                          "Global / System"}
                      </span>
                    </div>
                  </div>

                  <div className="modal-action">
                    <button
                      type="button"
                      className="btn btn-ghost text-sm"
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
