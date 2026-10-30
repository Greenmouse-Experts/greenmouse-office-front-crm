import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import InvoicesStat from "./-components/InvocesStat";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import CustomTable from "@/components/tables/CustomTable";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import type { ModalHandle } from "@/components/DialogModal";
import ConfirmModal, {
  type ConfirmModalHandle,
} from "@/components/ConfirmModal";
import RecordPaymentModal from "./-components/RecordPaymentModal";
import type { Actions } from "@/components/tables/pop-up";
import {
  PlusCircleIcon,
  Send,
  CheckCircle,
  Trash2,
  Eye,
  Edit,
} from "lucide-react";
import { useSearch } from "@/stores/data";
import {
  useInvoices,
  useSendInvoice,
  useDeleteInvoice,
  type Invoice,
} from "@/api/financeApi";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/accounts/Invoices/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useInvoices();
  const sendInvoice = useSendInvoice();
  const paymentModalRef = useRef<ModalHandle>(null);
  const confirmRef = useRef<ConfirmModalHandle>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const deleteInvoice = useDeleteInvoice();
  const searchProps = useSearch();
  const navigate = useNavigate();

  const invoices = query.data || [];

  const filteredInvoices = useMemo(() => {
    const q = (searchProps.search || "").toLowerCase().trim();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const invNum = (inv.invoiceNumber || inv.id || "").toLowerCase();
      const customerName =
        `${inv.contact?.firstName || ""} ${inv.contact?.lastName || ""}`.toLowerCase();
      const email = (inv.contact?.email || "").toLowerCase();
      const status = (inv.status || "").toLowerCase();
      return (
        invNum.includes(q) ||
        customerName.includes(q) ||
        email.includes(q) ||
        status.includes(q)
      );
    });
  }, [invoices, searchProps.search]);

  const handleSend = async (inv: Invoice) => {
    try {
      await sendInvoice.mutateAsync(inv.id);
      toast.success(
        `Invoice ${inv.invoiceNumber || inv.id} sent successfully.`,
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send invoice.");
    }
  };

  const openPayment = (invoice: Invoice) => {
    setPaymentInvoice(invoice);
    paymentModalRef.current?.open();
  };

  const handleDelete = async (inv: Invoice) => {
    const confirmed = await confirmRef.current?.confirm({
      title: "Delete invoice",
      message: `Are you sure you want to delete invoice ${inv.invoiceNumber || inv.id}? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteInvoice.mutateAsync(inv.id);
      toast.success("Invoice deleted.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete invoice.");
    }
  };

  const invoiceColumns = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      render: (_value: any, item: Invoice) => (
        <span className="font-mono font-medium text-base-content">
          {item.invoiceNumber || `#${item.id.slice(0, 8)}`}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = (status || "draft").toLowerCase();
        let badgeClass = "badge-ghost";
        if (s === "paid") badgeClass = "badge-success badge-soft";
        else if (s === "pending" || s === "sent")
          badgeClass = "badge-warning badge-soft";
        else if (s === "overdue") badgeClass = "badge-error badge-soft";
        return (
          <span
            className={`badge badge-sm font-semibold uppercase text-[10px] ${badgeClass}`}
          >
            {status || "Draft"}
          </span>
        );
      },
    },
    {
      key: "customer",
      label: "Customer",
      render: (_value: any, item: Invoice) => {
        const name = item.contact
          ? `${item.contact.firstName} ${item.contact.lastName}`
          : "Standard Client";
        return (
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {name}
            </div>
            {item.contact?.email && (
              <div className="text-xs text-base-content/60">
                {item.contact.email}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "issuedDate",
      label: "Issue Date",
      render: (date: string) => (
        <span className="text-xs text-base-content/70">
          {date ? new Date(date).toLocaleDateString() : "\u2014"}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (date: string) => (
        <span className="text-xs text-base-content/70">
          {date ? new Date(date).toLocaleDateString() : "\u2014"}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total Amount",
      render: (val: number, item: Invoice) => (
        <span className="font-semibold text-base-content">
          ₦
          {(val || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          <span className="text-xs text-base-content/50 font-normal">
            {item.currency || "NGN"}
          </span>
        </span>
      ),
    },
  ];

  const invoiceActions: Actions<Invoice>[] = [
    {
      key: "view",
      label: "View Details",
      render: () => (
        <span className="flex items-center gap-2">
          <Eye className="size-4" /> View Details
        </span>
      ),
      action: (item: Invoice) => {
        navigate({
          to: "/staff/accounts/Invoices/$id",
          params: { id: item.id },
        });
      },
    },
    {
      key: "edit",
      label: "Edit Invoice",
      render: () => (
        <span className="flex items-center gap-2">
          <Edit className="size-4" /> Edit Invoice
        </span>
      ),
      action: (item: Invoice) => {
        navigate({
          to: "/staff/accounts/Invoices/$id/edit",
          params: { id: item.id },
        });
      },
    },
    {
      key: "send",
      label: "Send to Customer",
      render: () => (
        <span className="flex items-center gap-2">
          <Send className="size-4" /> Send Invoice
        </span>
      ),
      action: (item: Invoice) => handleSend(item),
    },
    {
      key: "record-payment",
      label: "Record Payment",
      disabled: (item) => item.status === "paid" || item.status === "cancelled",
      render: () => (
        <span className="flex items-center gap-2 text-success">
          <CheckCircle className="size-4" /> Record Payment
        </span>
      ),
      action: openPayment,
    },
    {
      key: "delete",
      label: "Delete",
      render: () => (
        <span className="flex items-center gap-2 text-error">
          <Trash2 className="size-4" /> Delete
        </span>
      ),
      action: (item: Invoice) => handleDelete(item),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoices"
        description="Manage your customer invoices, billing records, and incoming payments"
      >
        <Link to="/staff/accounts/Invoices/add" className="btn btn-primary">
          <PlusCircleIcon className="size-4 mr-1" /> Add Invoice
        </Link>
      </PageHeader>

      <InvoicesStat />

      <SimpleContainer title="Invoices Directory">
        <ContainerRow searchProps={searchProps} />
        <PageLoader query={query}>
          <div className="bg-base-100">
            <CustomTable
              ring={false}
              data={filteredInvoices}
              columns={invoiceColumns}
              actions={invoiceActions}
            />
          </div>
        </PageLoader>
      </SimpleContainer>
      <RecordPaymentModal invoice={paymentInvoice} modalRef={paymentModalRef} />
      <ConfirmModal ref={confirmRef} />
    </div>
  );
}
