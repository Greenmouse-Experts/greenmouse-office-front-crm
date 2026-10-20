// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import apiClient from "./simpleApi";
import { useOutstandingInvoicesReport } from "./reportsApi";

vi.mock("@/store/authStore", () => ({
  get_user_value: () => null,
  set_user_value: vi.fn(),
  clear_user: vi.fn(),
  DEFAULT_ADMIN_SESSION: null,
  DEFAULT_STAFF_SESSION: null,
}));

afterEach(() => vi.restoreAllMocks());

const report = {
  currency: "NGN",
  data: [{ id: "invoice-1", invoiceNumber: "INV-001", status: "sent", currency: "NGN", total: 50000, amountPaid: 10000, balanceDue: 40000 }],
  total: 37,
  page: 2,
  limit: 20,
  totalPages: 2,
  hasNextPage: false,
  hasPrevPage: true,
};

describe("useOutstandingInvoicesReport", () => {
  it.each([report, { data: report }])("keeps invoice rows and pagination from the API response", async (response) => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({ data: response } as never);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

    const result = renderHook(() => useOutstandingInvoicesReport({ currency: "NGN", page: 2, limit: 20 }), { wrapper });

    await waitFor(() => expect(result.result.current.data?.data[0].balanceDue).toBe(40000));
    expect(result.result.current.data?.total).toBe(37);
    expect(get).toHaveBeenCalledWith("/reports/outstanding-invoices", { params: { currency: "NGN", page: 2, limit: 20 } });
  });
});
