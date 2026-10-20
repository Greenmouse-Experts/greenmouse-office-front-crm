// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Invoice } from "@/api/financeApi";
import InvoiceReceipts from "./InvoiceReceipts";

const api = vi.hoisted(() => ({
  resend: vi.fn().mockResolvedValue({}),
  void: vi.fn().mockResolvedValue({}),
  pdf: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
}));

const receipt = {
  id: "receipt-1",
  receiptNumber: "RCP-001",
  invoiceId: "invoice-1",
  amount: 25_000,
  currency: "NGN",
  status: "issued",
  issuedAt: "2026-09-20T10:00:00.000Z",
  payment: { id: "payment-1", paidAt: "2026-09-20T10:00:00.000Z", method: "bank_transfer", reference: "TRF-987" },
};

const query = (data: unknown) => ({ data, isLoading: false, isError: false });

vi.mock("@/api/financeApi", () => ({
  useInvoicePayments: () => query([{ id: "payment-1", invoiceId: "invoice-1", amount: 25_000, method: "bank_transfer", paidAt: "2026-09-20T10:00:00.000Z", receiptId: "receipt-1", receiptNumber: "RCP-001" }]),
  useInvoiceReceipts: () => query([receipt]),
  useReceipt: (id?: string) => query(id ? receipt : null),
  useReceiptHtml: (id?: string) => query(id ? "<h1>Receipt</h1>" : null),
  useResendReceipt: () => ({ mutateAsync: api.resend, isPending: false }),
  useVoidReceipt: () => ({ mutateAsync: api.void, isPending: false }),
  downloadReceiptPdf: api.pdf,
}));

vi.mock("@/components/DialogModal", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/layout/PageLoader", () => ({
  default: ({ query, children }: { query: { data: unknown }; children: (data: unknown) => ReactNode }) => <>{children(query.data)}</>,
}));

describe("InvoiceReceipts", () => {
  it("opens a receipt and supports PDF, resend, and confirmed void", async () => {
    const invoice: Invoice = { id: "invoice-1", status: "sent", items: [], currency: "NGN" };
    const createObjectURL = vi.fn().mockReturnValue("blob:receipt-pdf");
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    try {
      render(<InvoiceReceipts invoice={invoice} />);
      expect(screen.getByText("Payment history")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "View receipt" }));
      expect(screen.getByTitle("Preview of RCP-001").getAttribute("srcdoc")).toBe("<h1>Receipt</h1>");

      fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
      await waitFor(() => expect(api.pdf).toHaveBeenCalledWith("receipt-1"));
      expect(createObjectURL).toHaveBeenCalled();
      expect(click).toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Resend email" }));
      await waitFor(() => expect(api.resend).toHaveBeenCalledWith("receipt-1"));

      fireEvent.click(screen.getByRole("button", { name: "Void receipt" }));
      fireEvent.change(screen.getByLabelText("Reason for voiding"), { target: { value: "Duplicate entry" } });
      fireEvent.click(screen.getByRole("button", { name: "Confirm void" }));
      await waitFor(() => expect(api.void).toHaveBeenCalledWith({ id: "receipt-1", reason: "Duplicate entry" }));
    } finally {
      delete (URL as Partial<typeof URL>).createObjectURL;
      delete (URL as Partial<typeof URL>).revokeObjectURL;
      click.mockRestore();
    }
  });
});
