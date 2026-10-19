import { useRef, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import {
  PlusCircleIcon,
  User,
  Eye,
  Pencil,
  Trash2,
  Ticket,
} from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import CustomerSummary from "./-components/CustomerSum";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import CreateTicketModal, {
  type CreateTicketModalHandle,
} from "@/components/support/CreateTicketModal";
import { useContacts, useDeleteContact, type Contact } from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/contacts/customers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const query = useContacts();
  const deleteContact = useDeleteContact();
  const searchProps = useSearch();

  const ticketModalRef = useRef<CreateTicketModalHandle>(null);

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
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await query.refetch();
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
        <Link
          to="/staff/contacts/customers/details/$id"
          params={{ id: item.id }}
          className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
        >
          <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
            <User className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight group-hover:text-primary transition-colors">
              {item.firstName} {item.lastName}
            </div>
            <div className="text-xs text-base-content/60">{item.email}</div>
          </div>
        </Link>
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
          <Ticket className="size-4" /> Create Ticket
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
        navigate({
          to: "/staff/contacts/customers/details/$id",
          params: { id: item.id },
        });
      },
    },
    {
      key: "edit",
      label: "Edit Customer",
      render: () => (
        <span className="flex items-center gap-2">
          <Pencil className="size-4" /> Edit Customer
        </span>
      ),
      action: (item: Contact) => {
        navigate({
          to: "/staff/contacts/customers/details/$id/edit",
          params: { id: item.id },
        });
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
          <Link to="/staff/contacts/customers/add" className="btn btn-primary">
            <PlusCircleIcon className="size-4 mr-1" /> Add Customer
          </Link>
        </div>
      </PageHeader>

      <CustomerSummary contacts={contacts} />

      <SimpleContainer
        title={
          <>Customer Directory {query.data && `(${filteredContacts.length})`}</>
        }
      >
        <ContainerRow
          searchProps={searchProps}
          showSearch
          searchPlaceholder="Search customers..."
        />
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

      <CreateTicketModal ref={ticketModalRef} />
    </>
  );
}
