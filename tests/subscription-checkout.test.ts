import { describe, expect, it } from "vitest";
import { getPaystackAccessCode } from "@/routes/tenant/subscription/-checkout";

describe("Paystack inline checkout access code", () => {
  it("uses the access code returned by the payment server", () => {
    expect(
      getPaystackAccessCode({
        access_code: "  abc123  ",
        authorization_url: "https://checkout.paystack.com/other-code",
      }),
    ).toBe("abc123");
  });

  it("opens inline from a standard Paystack checkout URL", () => {
    expect(
      getPaystackAccessCode({
        authorization_url: "https://checkout.paystack.com/abc123",
      }),
    ).toBe("abc123");
  });

  it("rejects other URLs instead of leaving the current page", () => {
    expect(
      getPaystackAccessCode({
        authorization_url: "https://checkout.paystack.com.evil.test/abc123",
      }),
    ).toBeNull();
    expect(
      getPaystackAccessCode({
        authorization_url: "https://checkout.paystack.com/pay/abc123",
      }),
    ).toBeNull();
  });

  it("handles a missing checkout response", () => {
    expect(getPaystackAccessCode(null)).toBeNull();
  });
});
