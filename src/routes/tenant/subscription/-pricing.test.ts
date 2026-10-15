import { describe, expect, it } from "vitest";
import { priceForCycle } from "./-pricing";

describe("priceForCycle", () => {
  it("uses the billing cycle price in the current subscription response", () => {
    const starter = { priceMonthly: 15000, priceYearly: 150000 };
    expect(priceForCycle(starter, "yearly")).toBe(150000);
    expect(priceForCycle(starter, "monthly")).toBe(15000);
  });

  it("keeps compatibility with a legacy single-price plan", () => {
    expect(priceForCycle({ price: 25000 }, "monthly")).toBe(25000);
    expect(priceForCycle(undefined, "yearly")).toBeUndefined();
  });
});
