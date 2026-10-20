// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import apiClient from "./simpleApi";
import { useCategories } from "./crmApi";

vi.mock("@/store/authStore", () => ({
  get_user_value: () => null,
  set_user_value: vi.fn(),
  clear_user: vi.fn(),
  DEFAULT_ADMIN_SESSION: null,
  DEFAULT_STAFF_SESSION: null,
}));

afterEach(() => vi.restoreAllMocks());

describe("useCategories", () => {
  it("requests and caches product and service categories separately", async () => {
    const get = vi.spyOn(apiClient, "get").mockImplementation(async (_url, config) => ({
      data: [{ id: config?.params?.type, name: "Category" }],
    }) as never);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const product = renderHook(() => useCategories("product"), { wrapper });
    const service = renderHook(() => useCategories("service"), { wrapper });

    await waitFor(() => expect(product.result.current.data?.[0]?.id).toBe("product"));
    await waitFor(() => expect(service.result.current.data?.[0]?.id).toBe("service"));
    expect(get).toHaveBeenCalledWith("/categories", { params: { type: "product" } });
    expect(get).toHaveBeenCalledWith("/categories", { params: { type: "service" } });
  });
});
