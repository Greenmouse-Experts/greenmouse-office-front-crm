import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import {
  useInvoiceRevenueReport,
  useOutstandingInvoicesReport,
} from "@/api/reportsApi";

interface InvoicesTabProps {
  from: string;
  to: string;
}

const invoiceColumns = [
  {
    key: "invoiceNumber",
    label: "Invoice #",
    render: (val: string) => (
      <span className="font-semibold text-primary">{val}</span>
    ),
  },
  {
    key: "customer",
    label: "Customer",
    render: (_val: any, item: any) => (
      <div>
        <div className="font-medium text-base-content">
          {item.customer?.name || "—"}
        </div>
        <div className="text-xs text-base-content/60">
          {item.customer?.email}
        </div>
      </div>
    ),
  },
  {
    key: "total",
    label: "Total Amount",
    render: (val: number, item: any) => (
      <span className="font-mono font-medium">
        {item.currency || "₦"}
        {(val || 0).toLocaleString()}
      </span>
    ),
  },
  {
    key: "balanceDue",
    label: "Balance Due",
    render: (val: number, item: any) => (
      <span className="font-mono font-bold text-error">
        {item.currency || "₦"}
        {(val || 0).toLocaleString()}
      </span>
    ),
  },
  {
    key: "dueDate",
    label: "Due Date",
    render: (val: string) => (
      <span className="text-xs text-base-content/70">
        {val ? new Date(val).toLocaleDateString() : "—"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (val: string) => (
      <span className="badge badge-sm badge-warning font-medium uppercase text-[10px]">
        {val || "Unpaid"}
      </span>
    ),
  },
];

export default function InvoicesTab({ from, to }: InvoicesTabProps) {
  const { data: invoiceReport, isLoading } = useInvoiceRevenueReport({
    from,
    to,
  });
  const { data: outstandingReport, isLoading: isLoadingOut } =
    useOutstandingInvoicesReport();

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <>
          {/* Invoice Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card bg-base-100 border border-base-200 p-5 shadow-xs">
              <div className="text-xs font-semibold text-base-content/60 uppercase">
                Total Invoiced
              </div>
              <div className="text-2xl font-bold mt-1 text-base-content font-mono">
                ₦{(invoiceReport?.invoicedTotal || 0).toLocaleString()}
              </div>
            </div>

            <div className="card bg-base-100 border border-base-200 p-5 shadow-xs">
              <div className="text-xs font-semibold text-base-content/60 uppercase">
                Received Revenue
              </div>
              <div className="text-2xl font-bold mt-1 text-success font-mono">
                ₦{(invoiceReport?.receivedTotal || 0).toLocaleString()}
              </div>
            </div>

            <div className="card bg-base-100 border border-base-200 p-5 shadow-xs">
              <div className="text-xs font-semibold text-base-content/60 uppercase">
                Outstanding Balance
              </div>
              <div className="text-2xl font-bold mt-1 text-error font-mono">
                ₦{(invoiceReport?.outstandingTotal || 0).toLocaleString()}
              </div>
              <div className="text-xs text-base-content/60 mt-1">
                {invoiceReport?.outstandingCount || 0} unpaid invoices
              </div>
            </div>
          </div>

          {/* Outstanding Invoices List */}
          <SimpleContainer title="Unpaid & Aging Invoices">
            {isLoadingOut ? (
              <div className="flex justify-center p-8">
                <span className="loading loading-spinner text-primary" />
              </div>
            ) : (
              <CustomTable
                columns={invoiceColumns}
                data={outstandingReport?.data || []}
              />
            )}
          </SimpleContainer>
        </>
      )}
    </div>
  );
}
