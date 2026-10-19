import { describe, expect, it } from "vitest";
import { defaultQuoteValues, quotePayload } from "./QuoteFields";

describe("quote request payload", () => {
  it("sends the current contact and company record fields together", () => {
    const payload = quotePayload({
      ...defaultQuoteValues(),
      date: "2026-06-15",
      amount: 150000,
      description: "**Website redesign** and SEO optimization",
      status: "draft",
      contactId: "d26fc1dd-4a12-31fe-d757-e3ca2ee2a0fa",
      companyRecordId: "325cdde0-5e61-7a58-93ce-d6017dc0b849",
      expiresAt: "2026-10-31",
      notes: "Payment due within 30 days",
    });

    expect(payload).toEqual({
      date: "2026-06-15",
      amount: 150000,
      description: "**Website redesign** and SEO optimization",
      status: "draft",
      contactId: "d26fc1dd-4a12-31fe-d757-e3ca2ee2a0fa",
      companyRecordId: "325cdde0-5e61-7a58-93ce-d6017dc0b849",
      expiresAt: "2026-10-31",
      notes: "Payment due within 30 days",
    });
    expect(payload).not.toHaveProperty("companyId");
    expect(payload).not.toHaveProperty("clientName");
  });
});
