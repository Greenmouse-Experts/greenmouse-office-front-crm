import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react";
import { useTenantSubscriptionVerify } from "@/api/tenantApi";

export const Route = createFileRoute("/tenant/subscription/callback/")({
  component: SubscriptionCallback,
});

type VerificationState = "verifying" | "success" | "error" | "missing";

export function SubscriptionCallback() {
  const params = new URLSearchParams(window.location.search);
  const reference = params.get("reference") || params.get("trxref");
  const verifyMutation = useTenantSubscriptionVerify();
  const inFlight = useRef(false);
  const [state, setState] = useState<VerificationState>(
    reference ? "verifying" : "missing",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const verifyPayment = async () => {
    if (!reference || inFlight.current) return;
    inFlight.current = true;
    setState("verifying");
    setErrorMessage("");

    try {
      const result = await verifyMutation.mutateAsync({ reference });
      const verification = result?.data ?? result;
      const paymentStatus = String(verification?.status ?? "").toLowerCase();
      if (
        verification?.success === false ||
        verification?.verified === false ||
        verification?.status === false ||
        ["failed", "pending", "abandoned", "reversed", "declined", "error"].includes(
          paymentStatus,
        )
      ) {
        throw new Error("Your payment has not been confirmed yet.");
      }
      try {
        if (
          sessionStorage.getItem("tenant-subscription-pending-reference") ===
          reference
        ) {
          sessionStorage.removeItem("tenant-subscription-pending-reference");
        }
      } catch {
        // Payment verification does not depend on browser storage.
      }
      setState("success");
    } catch (error: any) {
      const responseMessage = error?.response?.data?.message;
      setErrorMessage(
        (Array.isArray(responseMessage)
          ? responseMessage.join(". ")
          : responseMessage) ||
          error?.message ||
          "We could not confirm this payment. Please try again.",
      );
      setState("error");
    } finally {
      inFlight.current = false;
    }
  };

  useEffect(() => {
    if (reference) void verifyPayment();
    else setState("missing");
  }, [reference]);

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-xl items-center px-4 py-12">
      <section className="card w-full border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body items-center gap-4 text-center sm:p-10">
          <div
            className={`flex size-16 items-center justify-center rounded-2xl ${
              state === "success"
                ? "bg-success/10 text-success"
                : state === "verifying"
                  ? "bg-primary/10 text-primary"
                  : "bg-warning/10 text-warning"
            }`}
          >
            {state === "success" ? (
              <CheckCircle2 className="size-8" aria-hidden="true" />
            ) : state === "verifying" ? (
              <LoaderCircle className="size-8 animate-spin" aria-hidden="true" />
            ) : (
              <AlertCircle className="size-8" aria-hidden="true" />
            )}
          </div>

          <div role="status" aria-live="polite" className="space-y-2">
            <h1 className="text-2xl font-semibold">
              {state === "success"
                ? "Payment verified"
                : state === "verifying"
                  ? "Verifying your payment"
                  : state === "missing"
                    ? "Payment reference missing"
                    : "Payment not verified yet"}
            </h1>
            <p className="text-sm text-base-content/70">
              {state === "success"
                ? "Your subscription payment was confirmed. Your plan details are ready to view."
                : state === "verifying"
                  ? "Please wait while we confirm your transaction with the server."
                  : state === "missing"
                    ? "Paystack did not provide a transaction reference, so we cannot check this payment."
                    : errorMessage}
            </p>
          </div>

          {reference && (
            <p className="max-w-full break-all rounded-lg bg-base-200/60 px-3 py-2 font-mono text-xs text-base-content/60">
              Reference: {reference}
            </p>
          )}

          <div className="card-actions mt-3 justify-center gap-2">
            {state === "error" && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void verifyPayment()}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Retry verification
              </button>
            )}
            <Link
              to="/tenant/subscription"
              className={`btn ${state === "success" ? "btn-primary" : "btn-ghost"}`}
            >
              Back to subscription
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
