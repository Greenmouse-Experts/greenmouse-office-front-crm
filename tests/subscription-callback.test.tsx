// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";

const { mutateAsync } = vi.hoisted(() => ({ mutateAsync: vi.fn() }));

vi.mock("@/api/tenantApi", () => ({
  useTenantSubscriptionVerify: () => ({ mutateAsync }),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  Link: ({ to, children }: PropsWithChildren<{ to: string }>) => (
    <a href={to}>{children}</a>
  ),
}));

import { SubscriptionCallback } from "@/routes/tenant/subscription/callback";

describe("subscription payment callback", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("verifies the returned Paystack reference before showing success", async () => {
    window.history.replaceState(
      {},
      "",
      "/tenant/subscription/callback/?reference=payment-123",
    );
    mutateAsync.mockResolvedValue({ status: "success" });
    sessionStorage.setItem(
      "tenant-subscription-pending-reference",
      "payment-123",
    );

    render(<SubscriptionCallback />);

    expect(await screen.findByText("Payment verified")).toBeTruthy();
    expect(mutateAsync).toHaveBeenCalledExactlyOnceWith({
      reference: "payment-123",
    });
    expect(
      sessionStorage.getItem("tenant-subscription-pending-reference"),
    ).toBeNull();
  });

  it("does not accept a pending payment and lets the user retry verification", async () => {
    window.history.replaceState(
      {},
      "",
      "/tenant/subscription/callback/?trxref=payment-456",
    );
    mutateAsync
      .mockResolvedValueOnce({ status: "pending" })
      .mockResolvedValueOnce({ status: "success" });

    render(<SubscriptionCallback />);

    expect(await screen.findByText("Payment not verified yet")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry verification" }));
    expect(await screen.findByText("Payment verified")).toBeTruthy();
    expect(mutateAsync).toHaveBeenCalledTimes(2);
    expect(mutateAsync).toHaveBeenLastCalledWith({ reference: "payment-456" });
  });

  it("does not call verification without a transaction reference", () => {
    window.history.replaceState({}, "", "/tenant/subscription/callback/");

    render(<SubscriptionCallback />);

    expect(screen.getByText("Payment reference missing")).toBeTruthy();
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
