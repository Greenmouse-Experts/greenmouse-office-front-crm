export interface SubscriptionPlanPrices {
  price?: number;
  priceMonthly?: number;
  priceYearly?: number;
}

export function priceForCycle(
  plan: SubscriptionPlanPrices | undefined,
  cycle: "monthly" | "yearly",
): number | undefined {
  return cycle === "yearly"
    ? (plan?.priceYearly ?? plan?.price)
    : (plan?.priceMonthly ?? plan?.price);
}
