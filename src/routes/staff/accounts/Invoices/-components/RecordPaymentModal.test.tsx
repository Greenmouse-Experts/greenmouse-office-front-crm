// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Invoice } from "@/api/financeApi";
import RecordPaymentModal from "./RecordPaymentModal";

const recordPayment = vi.hoisted(() => vi.fn().mockResolvedValue({}));

vi.mock("@/api/financeApi", () => ({
  useRecordInvoicePayment: () => ({ mutateAsync: recordPayment, isPending: false }),
}));

vi.mock("@/components/DialogModal", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("RecordPaymentModal", () => {
  it("records a partial payment with the entered amount and details", async () => {
    const invoice: Invoice = {
      id: "invoice-1",
      invoiceNumber: "INV-001",
      status: "sent",
      items: [],
      currency: "NGN",
      total: 50_000,
      amountDue: 40_000,
    };
    render(<RecordPaymentModal invoice={invoice} modalRef={{ current: null }} />);

    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "25000" } });
    fireEvent.change(screen.getByPlaceholderText("TRF-123456"), { target: { value: "TRF-987" } });
    fireEvent.change(screen.getByPlaceholderText("Optional payment note"), { target: { value: "Part payment" } });
    fireEvent.change(screen.getByLabelText("Paid at"), { target: { value: "2026-09-20T10:00" } });
    fireEvent.click(screen.getByLabelText("Email the receipt to the customer"));
    fireEvent.click(screen.getByRole("button", { name: "Record payment" }));

    await waitFor(() => expect(recordPayment).toHaveBeenCalledWith({
      invoiceId: "invoice-1",
      amount: 25_000,
      method: "bank_transfer",
      reference: "TRF-987",
      paidAt: new Date("2026-09-20T10:00").toISOString(),
      notes: "Part payment",
      sendEmail: true,
    }));
  });
});
