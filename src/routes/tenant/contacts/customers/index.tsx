import { useState, useRef, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import {
  PlusCircleIcon,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Eye,
  Trash2,
} from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import CustomerSummary from "./-components/CustomerSum";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import CreateTicketModal, {
  type CreateTicketModalHandle,
} from "@/components/support/CreateTicketModal";
import { useContacts, useDeleteContact, type Contact } from "@/api/crmApi";
import { toast } from "sonner";
import { LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/tenant/contacts/customers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useContacts();
  const deleteContact = useDeleteContact();
  const searchProps = useSearch();

  const detailsModalRef = useRef<ModalHandle>(null);
  const ticketModalRef = useRef<CreateTicketModalHandle>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const contacts = query.data || [];

  const filteredContacts = useMemo(() => {
    const q = (searchProps.search || "").toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const name = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
      const email = (c.email || "").toLowerCase();
      const phone = (c.phone || c.workPhone || c.cellPhone || "").toLowerCase();
      const company = (c.companyName || c.company?.name || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        company.includes(q)
      );
    });
  }, [contacts, searchProps.search]);

  const handleDelete = async (contact: Contact) => {
    const name =
      `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
      contact.email;
    if (!window.confirm(`Are you sure you want to delete contact "${name}"?`)) {
      return;
    }

    try {
      await deleteContact.mutateAsync(contact.id);
      toast.success(`Contact "${name}" deleted.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete contact.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Customer",
      render: (_value: any, item: Contact) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
            <User className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.firstName} {item.lastName}
            </div>
            <div className="text-xs text-base-content/60">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (_value: any, item: Contact) => (
        <span className="text-xs text-base-content/70">
          {item.phone || item.workPhone || item.cellPhone || "—"}
        </span>
      ),
    },
    {
      key: "company",
      label: "Company",
      render: (_value: any, item: Contact) => (
        <span className="text-xs font-medium text-base-content/80">
          {item.companyName || item.company?.name || "Individual"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = (status || "active").toLowerCase();
        const badgeClass =
          s === "active" || s === "customer"
            ? "badge-success badge-soft"
            : s === "lead"
              ? "badge-warning badge-soft"
              : "badge-ghost";
        return (
          <span
            className={`ring badge badge-sm uppercase font-semibold text-[10px] ${badgeClass}`}
          >
            {status || "Active"}
          </span>
        );
      },
    },
    {
      key: "location",
      label: "Location",
      render: (_value: any, item: Contact) => (
        <span className="text-xs text-base-content/60">
          {[item.city, item.state, item.country].filter(Boolean).join(", ") ||
            "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Contact>[] = [
    {
      key: "ticket",
      label: "Create Ticket",
      render: () => (
        <span className="flex items-center gap-2">
          <LifeBuoy className="size-4" /> Create Ticket
        </span>
      ),
      action: (item: Contact) =>
        ticketModalRef.current?.open({ contactId: item.id }),
    },
    {
      key: "view",
      label: "View Details",
      render: () => (
        <span className="flex items-center gap-2">
          <Eye className="size-4" /> View Details
        </span>
      ),
      action: (item: Contact) => {
        setSelectedContact(item);
        detailsModalRef.current?.open();
      },
    },
    {
      key: "delete",
      label: "Delete Contact",
      render: () => (
        <span className="flex items-center gap-2 text-error">
          <Trash2 className="size-4" /> Delete
        </span>
      ),
      action: (item: Contact) => handleDelete(item),
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers & Contacts"
        description="Directory of client contacts, accounts, and engagement history"
      >
        <div>
          <Link to="/tenant/contacts/customers/add" className="btn btn-primary">
            <PlusCircleIcon className="size-4 mr-1" /> Add Customer
          </Link>
        </div>
      </PageHeader>

      <CustomerSummary contacts={contacts} />

      <SimpleContainer title="Customer Directory">
        <ContainerRow searchProps={searchProps} />
        <PageLoader query={query}>
          <div className="bg-base-100">
            <CustomTable
              ring={false}
              data={filteredContacts}
              columns={columns}
              actions={actions}
            />
          </div>
        </PageLoader>
      </SimpleContainer>

      {/* View Details Modal */}
      <Modal ref={detailsModalRef} title="Customer Profile">
        {selectedContact && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-4 bg-base-200/50 p-4 rounded-xl">
              <div className="size-14 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-xl">
                <User className="size-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  {selectedContact.firstName} {selectedContact.lastName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-base-content/60 mt-0.5">
                  <span className="badge badge-sm badge-outline">
                    {selectedContact.type || "Individual"}
                  </span>
                  <span>•</span>
                  <span>{selectedContact.status || "Active"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-base-200/40 p-3 rounded-lg flex items-start gap-3">
                <Mail className="size-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-base-content/60">Email</div>
                  <div className="text-sm font-medium text-base-content break-all">
                    {selectedContact.email || "—"}
                  </div>
                </div>
              </div>

              <div className="bg-base-200/40 p-3 rounded-lg flex items-start gap-3">
                <Phone className="size-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-base-content/60">Phone</div>
                  <div className="text-sm font-medium text-base-content">
                    {selectedContact.phone ||
                      selectedContact.workPhone ||
                      selectedContact.cellPhone ||
                      "—"}
                  </div>
                </div>
              </div>

              <div className="bg-base-200/40 p-3 rounded-lg flex items-start gap-3">
                <Building2 className="size-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-base-content/60">Company</div>
                  <div className="text-sm font-medium text-base-content">
                    {selectedContact.companyName ||
                      selectedContact.company?.name ||
                      "—"}
                  </div>
                </div>
              </div>

              <div className="bg-base-200/40 p-3 rounded-lg flex items-start gap-3">
                <MapPin className="size-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-base-content/60">Location</div>
                  <div className="text-sm font-medium text-base-content">
                    {[
                      selectedContact.address || selectedContact.addressLine1,
                      selectedContact.city,
                      selectedContact.state,
                      selectedContact.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </div>
                </div>
              </div>
            </div>

            {selectedContact.tags && selectedContact.tags.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-base-content/70 mb-2">
                  Tags
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedContact.tags.map((tag, idx) => (
                    <span key={idx} className="badge badge-sm badge-neutral">
                      {tag}
                    </span>
                  ))}
                </div>
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
