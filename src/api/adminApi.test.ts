import { describe, expect, it } from "vitest";
import {
  parseAdminRevenueTrend,
  parseTenantRevenueTrend,
  tenantRelatedRows,
} from "./adminApi";

describe("tenantRelatedRows", () => {
  it("reads paginated history and login activity inside API envelopes", () => {
    expect(
      tenantRelatedRows({
        data: { data: { items: [{ id: "change-1", action: "upgraded" }] } },
      }),
    ).toEqual([{ id: "change-1", action: "upgraded" }]);
    expect(tenantRelatedRows({ data: { activity: [] } })).toEqual([]);
  });

  it("reports unsupported responses instead of showing a false empty state", () => {
    expect(() => tenantRelatedRows({ data: { total: 4 } })).toThrow(
      "Tenant activity format is not supported.",
    );
  });
});

describe("parseAdminRevenueTrend", () => {
  it("reads the contracted MRR movement response", () => {
    expect(
      parseAdminRevenueTrend({
        trend: [
          { month: "2025-11", added: 0, lost: 0, net: 0 },
          { month: "2026-06", added: 50000, lost: 0, net: 50000 },
          { month: "2026-09", added: 29166.67, lost: 0, net: 29166.67 },
        ],
        note: "Contracted MRR movement, not collected cash.",
      }),
    ).toEqual({
      trend: [
        { month: "2025-11", added: 0, lost: 0, net: 0 },
        { month: "2026-06", added: 50000, lost: 0, net: 50000 },
        { month: "2026-09", added: 29166.67, lost: 0, net: 29166.67 },
      ],
      note: "Contracted MRR movement, not collected cash.",
    });
  });

  it("reads an API envelope and rejects unrelated report rows", () => {
    expect(
      parseAdminRevenueTrend({
        data: { trend: [{ month: "2026-10", added: 10, lost: 2, net: 8 }] },
      }).trend,
    ).toEqual([{ month: "2026-10", added: 10, lost: 2, net: 8 }]);
    expect(() =>
      parseAdminRevenueTrend({
        trend: [{ month: "2026-10", invoiced: 10, received: 8 }],
      }),
    ).toThrow("Revenue trend format is not supported.");
  });
});

describe("parseTenantRevenueTrend", () => {
  it("reads monthly records inside an API envelope", () => {
    expect(
      parseTenantRevenueTrend({
        data: {
          currency: "NGN",
          outstandingTotal: 400,
          monthly: [
            { month: "2026-01", invoiced: 1500, received: 1100 },
            { month: "2026-02", invoiced: "900", received: "900" },
          ],
        },
      }),
    ).toEqual({
      currency: "NGN",
      outstandingTotal: 400,
      months: [
        { month: "2026-01", invoiced: 1500, received: 1100 },
        { month: "2026-02", invoiced: 900, received: 900 },
      ],
    });
  });

  it("reads parallel month and amount arrays", () => {
    expect(
      parseTenantRevenueTrend({
        data: { months: ["Jan", "Feb"], invoiced: [20, 30], received: [10, 25] },
      }).months,
    ).toEqual([
      { month: "Jan", invoiced: 20, received: 10 },
      { month: "Feb", invoiced: 30, received: 25 },
    ]);
  });

  it("rejects unknown data instead of plotting invented zeroes", () => {
    expect(() => parseTenantRevenueTrend({ data: [{ month: "Jan", value: 20 }] })).toThrow(
      "Revenue report format is not supported.",
    );
  });
});
