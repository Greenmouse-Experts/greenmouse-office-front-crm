import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import apiClient, { isSupportedApiEndpoint, UnsupportedApiEndpointError } from "./simpleApi";

describe("Office CRM endpoint matching", () => {
  it("accepts documented methods, path parameters, and query strings", () => {
    expect(isSupportedApiEndpoint("GET", "/contacts/abc-123?expand=notes")).toBe(true);
    expect(isSupportedApiEndpoint("PATCH", "/pipelines/one/stages/two")).toBe(true);
    expect(isSupportedApiEndpoint("GET", "/v1")).toBe(true);
    expect(isSupportedApiEndpoint("POST", "/attendance/check-in")).toBe(true);
    expect(isSupportedApiEndpoint("GET", "/attendance/today")).toBe(true);
    expect(isSupportedApiEndpoint("GET", "/attendance/me?from=2026-10-01&to=2026-10-22")).toBe(true);
    expect(isSupportedApiEndpoint("GET", "/attendance?staffId=one")).toBe(true);
    expect(isSupportedApiEndpoint("PUT", "/attendance/2026-10-22/report")).toBe(true);
    expect(isSupportedApiEndpoint("PATCH", "/staffs/profile/password")).toBe(true);
    expect(isSupportedApiEndpoint("PATCH", "/owner/password")).toBe(true);
    expect(isSupportedApiEndpoint("POST", "/owner/forgot-password")).toBe(true);
    expect(isSupportedApiEndpoint("POST", "/owner/reset-password")).toBe(true);
  });

  it("rejects removed paths and unsupported methods", () => {
    expect(isSupportedApiEndpoint("GET", "/customers")).toBe(false);
    expect(isSupportedApiEndpoint("GET", "/deals/kanban/list")).toBe(false);
    expect(isSupportedApiEndpoint("POST", "/tenant/subscription/upgrade")).toBe(false);
    expect(isSupportedApiEndpoint("DELETE", "/invoices/one/status")).toBe(false);
    expect(isSupportedApiEndpoint("POST", "/staffs/forgot-password")).toBe(false);
  });

  it("blocks an obsolete request before the transport runs", async () => {
    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));
    await expect(apiClient.get("/customers", { adapter })).rejects.toBeInstanceOf(
      UnsupportedApiEndpointError,
    );
    expect(adapter).not.toHaveBeenCalled();

    await apiClient.get("/contacts", { adapter });
    expect(adapter).toHaveBeenCalledOnce();
  });
});
