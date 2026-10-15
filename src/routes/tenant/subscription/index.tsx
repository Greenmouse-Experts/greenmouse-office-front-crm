import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PaystackPop from "@paystack/inline-js";
import { getPaystackAccessCode } from "./-checkout";
import { priceForCycle } from "./-pricing";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import {
  useTenantSubscriptionCurrent,
  useTenantSubscriptionPlans,
  useTenantSubscriptionHistory,
  useTenantSubscriptionUpgrade,
  useTenantSubscriptionDowngrade,
  useTenantSubscriptionCancel,
} from "@/api/tenantApi";
import { toast } from "sonner";
import {
  Check,
  Zap,
  ShieldCheck,
  Calendar,
  CreditCard,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  XCircle,
  Layers,
} from "lucide-react";
import QueryCompLayout from "@/components/layout/QueryCompLayout";

export const Route = createFileRoute("/tenant/subscription/")({
  component: RouteComponent,
});

const PENDING_PAYMENT_KEY = "tenant-subscription-pending-reference";

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
};

function RouteComponent() {
  const [billingCycleSelection, setBillingCycleSelection] = useState<
    "monthly" | "yearly" | null
  >(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [pendingReference, setPendingReference] = useState<string | null>(
    () => {
      try {
        return sessionStorage.getItem(PENDING_PAYMENT_KEY);
      } catch {
        return null;
      }
    },
  );

  const currentQuery = useTenantSubscriptionCurrent();
  const plansQuery = useTenantSubscriptionPlans();
  const historyQuery = useTenantSubscriptionHistory();

  const upgradeMutation = useTenantSubscriptionUpgrade();
  const downgradeMutation = useTenantSubscriptionDowngrade();
  const cancelMutation = useTenantSubscriptionCancel();

  const currentSub = currentQuery.data;
  const billingCycle =
    billingCycleSelection ??
    (currentSub?.billingCycle === "yearly" ? "yearly" : "monthly");
  const plans = plansQuery.data || [];
  const history = historyQuery.data || [];

  const rememberReference = (reference: string) => {
    setPendingReference(reference);
    try {
      sessionStorage.setItem(PENDING_PAYMENT_KEY, reference);
    } catch {
      // Verification still works during this visit if storage is unavailable.
    }
  };

  const clearPendingReference = () => {
    setPendingReference(null);
    try {
      sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    } catch {
      // The in-memory reminder has already been cleared.
    }
  };

  const pendingVerificationUrl = pendingReference
    ? `/tenant/subscription/callback/?reference=${encodeURIComponent(pendingReference)}`
    : null;

  // Existing Paystack callback settings may still point to the plan page.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    if (reference) {
      const callback = new URL(
        "/tenant/subscription/callback/",
        window.location.origin,
      );
      callback.searchParams.set("reference", reference);
      window.location.replace(callback.toString());
    }
  }, []);

  const handleSubscribeOrUpgrade = async (plan: any) => {
    if (checkoutPlanId) return;
    setCheckoutPlanId(plan.id);
    try {
      const callbackUrl = new URL(
        "/tenant/subscription/callback/",
        window.location.origin,
      ).toString();
      const res = await upgradeMutation.mutateAsync({
        planId: plan.id,
        billingCycle,
        callbackUrl,
      });

      const checkout = res?.data?.data ?? res?.data ?? res;
      const accessCode = getPaystackAccessCode(checkout);
      const reference = checkout?.reference;

      if (reference) rememberReference(reference);
      if (res?.callbackUrlRejected) {
        toast.warning(
          "The payment server did not accept the return URL. If checkout leaves this page, use Verify payment here when you return.",
        );
      }

      if (accessCode) {
        const paystack = new PaystackPop();
        paystack.resumeTransaction(accessCode, {
          onSuccess: (transaction) => {
            const paymentReference =
              transaction?.reference || transaction?.trxref || reference;
            if (paymentReference) {
              const callback = new URL(callbackUrl);
              callback.searchParams.set("reference", paymentReference);
              window.location.assign(callback.toString());
            } else {
              setCheckoutPlanId(null);
              toast.error(
                "Payment completed, but no reference was returned. Please contact support.",
              );
            }
          },
          onCancel: () => {
            setCheckoutPlanId(null);
            toast.info(
              reference
                ? "Checkout closed. If you completed payment, use Verify payment below."
                : "Checkout closed. No payment has been verified.",
            );
          },
          onError: (error) => {
            setCheckoutPlanId(null);
            toast.error(error?.message || "Unable to open Paystack checkout.");
          },
        });
      } else {
        throw new Error(
          "Inline checkout is unavailable. The payment server must return a Paystack access_code or standard checkout URL.",
        );
      }
    } catch (err: any) {
      setCheckoutPlanId(null);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to initiate subscription upgrade. Please try again.",
      );
    }
  };

  const handleDowngrade = async (plan: any) => {
    if (
      !window.confirm(`Are you sure you want to downgrade to "${plan.name}"?`)
    ) {
      return;
    }
    try {
      await downgradeMutation.mutateAsync({ planId: plan.id });
      toast.success(`Downgraded to ${plan.name} plan successfully.`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to downgrade subscription.",
      );
    }
  };

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel your subscription?",
      )
    ) {
      return;
    }
    try {
      await cancelMutation.mutateAsync();
      toast.success("Subscription cancelled.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to cancel subscription.",
      );
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "—";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const historyColumns = [
    {
      key: "planName",
      label: "Plan",
      render: (_val: any, item: any) => (
        <span className="font-semibold text-base-content">
          {item.planName || item.plan?.name || "Subscription"}
        </span>
      ),
    },
    {
      key: "billingCycle",
      label: "Billing Cycle",
      render: (cycle: string) => (
        <span className="capitalize text-xs text-base-content/70">
          {cycle || "Monthly"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (amount: number) => (
        <span className="font-medium text-base-content">
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = (status || "completed").toLowerCase();
        let badgeClass = "badge-ghost";
        if (s === "success" || s === "completed" || s === "active")
          badgeClass = "badge-success badge-soft";
        else if (s === "pending") badgeClass = "badge-warning badge-soft";
        else if (s === "failed" || s === "cancelled")
          badgeClass = "badge-error badge-soft";

        return (
          <span
            className={`badge badge-sm font-semibold uppercase text-[10px] ${badgeClass}`}
          >
            {status || "Completed"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (date: string) => (
        <span className="text-xs text-base-content/70">
          {date ? new Date(date).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const currentPlanId = currentSub?.planId || currentSub?.plan?.id;
  const subscriptionStatus =
    currentSub?.subscriptionStatus || currentSub?.status || "unknown";
  const currentPlan =
    currentSub?.plan || plans.find((plan) => plan.id === currentPlanId);
  const currentBillingCycle =
    currentSub?.billingCycle === "yearly" ? "yearly" : "monthly";
  const currentPlanPrice =
    priceForCycle(currentSub?.plan, currentBillingCycle) ?? currentSub?.price;
  const statusBadgeClass =
    subscriptionStatus === "active"
      ? "badge-success"
      : subscriptionStatus === "trial"
        ? "badge-warning"
        : "badge-ghost";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription & Billing"
        description="View your current plan, upgrade your tier, manage billing cycles, and view payment history"
      />

      {pendingVerificationUrl && (
        <div
          role="status"
          className="alert flex flex-wrap items-center justify-between gap-3 border border-base-300 bg-base-100 text-base-content"
        >
          <div className="min-w-0 space-y-1">
            <p className="font-medium">Waiting for payment confirmation</p>
            <p className="text-sm text-base-content/70">
              If you completed checkout but were not returned here, verify the
              transaction. You will not be charged again.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a className="btn btn-sm btn-primary" href={pendingVerificationUrl}>
              Verify payment
            </a>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={clearPendingReference}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <QueryCompLayout query={currentQuery}>
        {/* Current Subscription Card */}
        {() => {
          return (
            <>
              {currentSub && (
                <div className="card bg-base-100 shadow-md border border-base-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-6 border-b border-base-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`badge uppercase text-[10px] font-semibold tracking-wider ${statusBadgeClass}`}>
                          {subscriptionStatus === "trial" ? "Trial plan" : "Current plan"}
                        </span>
                        {currentSub.cancelAtPeriodEnd && (
                          <span className="badge badge-warning text-[10px] font-semibold gap-1">
                            <AlertCircle className="size-3" /> Cancels at period
                            end
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-semibold text-base-content flex items-center gap-2">
                        {currentSub.planName ||
                          currentSub.plan?.name ||
                          "Standard Plan"}
                        <ShieldCheck className="size-6 text-primary" />
                      </h2>
                      {currentSub.plan?.description && (
                        <p className="text-sm text-base-content/70">
                          {currentSub.plan.description}
                        </p>
                      )}
                      <p className="text-sm text-base-content/70 flex items-center gap-3">
                        <span className="capitalize font-semibold text-base-content">
                          {currentSub.billingCycle || "Monthly"} Billing
                        </span>
                        <span>•</span>
                        <span>
                          Status:{" "}
                          <span className="font-semibold capitalize text-base-content">
                            {subscriptionStatus}
                          </span>
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {subscriptionStatus !== "cancelled" &&
                        subscriptionStatus !== "expired" &&
                        !currentSub.cancelAtPeriodEnd && (
                          <button
                            onClick={handleCancel}
                            disabled={cancelMutation.isPending}
                            className="btn btn-sm btn-outline btn-error gap-1"
                          >
                            <XCircle className="size-4" /> Cancel Subscription
                          </button>
                        )}
                      <button
                        onClick={() => currentQuery.refetch()}
                        className="btn btn-sm btn-ghost gap-1"
                      >
                        <RefreshCw className="size-4" /> Refresh
                      </button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-base-100">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50">
                      <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                        <CreditCard className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60">
                          Plan Price
                        </p>
                        <p className="font-semibold text-base text-base-content">
                          {formatCurrency(currentPlanPrice)}
                          <span className="text-xs font-normal text-base-content/60">
                            /
                            {currentBillingCycle === "yearly" ? "yr" : "mo"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {currentSub.currentPeriodStart && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50">
                        <div className="size-10 rounded-lg bg-info/10 text-info grid place-items-center">
                          <Calendar className="size-5" />
                        </div>
                        <div>
                          <p className="text-xs text-base-content/60">Period Start</p>
                          <p className="font-semibold text-base-content">
                            {formatDate(currentSub.currentPeriodStart)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50">
                      <div className="size-10 rounded-lg bg-success/10 text-success grid place-items-center">
                        <Clock className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60">
                          {subscriptionStatus === "trial" ? "Trial Ends" : "Renews / Expiration"}
                        </p>
                        <p className="font-semibold text-base-content">
                          {formatDate(
                            subscriptionStatus === "trial"
                              ? currentSub.trialEndsAt || currentSub.currentPeriodEnd
                              : currentSub.currentPeriodEnd,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        }}
      </QueryCompLayout>

      {/* Subscription Plans Selection Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-6 rounded-box shadow border border-base-200">
          <div>
            <h3 className="text-xl font-semibold text-base-content flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Choose a Subscription
              Plan
            </h3>
            <p className="text-sm text-base-content/70">
              Upgrade or switch your workspace plan to unlock more staff,
              contacts, and features.
            </p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center gap-3 bg-base-200/60 p-1.5 rounded-xl border border-base-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycleSelection("monthly")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === "monthly"
                  ? "bg-base-100 text-primary shadow"
                  : "text-base-content/70 hover:text-base-content"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycleSelection("yearly")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                billingCycle === "yearly"
                  ? "bg-base-100 text-primary shadow"
                  : "text-base-content/70 hover:text-base-content"
              }`}
            >
              Yearly Billing
              <span className="badge badge-accent badge-xs text-[9px] uppercase font-semibold">
                Save
              </span>
            </button>
          </div>
        </div>

        <PageLoader query={plansQuery}>
          {plans.length === 0 ? (
            <div className="text-center py-12 bg-base-100 rounded-box border border-base-200 space-y-2">
              <Layers className="size-12 mx-auto text-base-content/30" />
              <p className="text-base font-semibold text-base-content/70">
                No active subscription plans available at the moment.
              </p>
              <p className="text-xs text-base-content/50">
                Please check back later or contact system administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan: any) => {
                const isCurrent = currentPlanId === plan.id;
                const price = priceForCycle(plan, billingCycle);
                const comparisonPrice = priceForCycle(currentPlan, billingCycle);
                const isHigher =
                  price === undefined ||
                  comparisonPrice === undefined ||
                  price > comparisonPrice;

                return (
                  <div
                    key={plan.id}
                    className={`card bg-base-100 shadow-md border-2 transition-all hover:shadow-lg flex flex-col justify-between ${
                      isCurrent
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-base-200"
                    }`}
                  >
                    <div className="card-body p-6 space-y-4">
                      {isCurrent && (
                        <div className="badge badge-primary font-semibold text-[10px] uppercase tracking-wider self-start">
                          {subscriptionStatus === "trial" ? "Your Trial Plan" : "Your Current Plan"}
                        </div>
                      )}

                      <div className="space-y-1">
                        <h4 className="text-xl font-semibold text-base-content">
                          {plan.name}
                        </h4>
                        {plan.description && (
                          <p className="text-xs text-base-content/60 min-h-[32px] leading-relaxed">
                            {plan.description}
                          </p>
                        )}
                      </div>

                      <div className="py-2 border-y border-base-200">
                        <div className="text-3xl font-semibold text-base-content">
                          {plan.isCustomPrice ? (
                            "Custom"
                          ) : (
                            <>
                              {formatCurrency(price)}
                              <span className="text-xs font-normal text-base-content/60 ml-1">
                                /{billingCycle === "yearly" ? "year" : "month"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quotas & Limits */}
                      <div className="space-y-2 text-xs">
                        <p className="font-semibold text-base-content/70 uppercase text-[10px] tracking-wider">
                          Resource Limits
                        </p>
                        <ul className="space-y-1.5 text-base-content/80">
                          {plan.maxStaff !== undefined && (
                            <li className="flex justify-between border-b border-base-200/50 pb-1">
                              <span>Max Staff Users</span>
                              <span className="font-semibold">
                                {plan.maxStaff === 0 || plan.maxStaff === -1
                                  ? "Unlimited"
                                  : plan.maxStaff}
                              </span>
                            </li>
                          )}
                          {plan.maxContacts !== undefined && (
                            <li className="flex justify-between border-b border-base-200/50 pb-1">
                              <span>Max Contacts</span>
                              <span className="font-semibold">
                                {plan.maxContacts === 0 ||
                                plan.maxContacts === -1
                                  ? "Unlimited"
                                  : plan.maxContacts}
                              </span>
                            </li>
                          )}
                          {plan.maxInvoicesPerMonth !== undefined && (
                            <li className="flex justify-between border-b border-base-200/50 pb-1">
                              <span>Invoices / Month</span>
                              <span className="font-semibold">
                                {plan.maxInvoicesPerMonth === 0 ||
                                plan.maxInvoicesPerMonth === -1
                                  ? "Unlimited"
                                  : plan.maxInvoicesPerMonth}
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Included Features */}
                      {Array.isArray(plan.features) &&
                        plan.features.length > 0 && (
                          <div className="space-y-2 text-xs">
                            <p className="font-semibold text-base-content/70 uppercase text-[10px] tracking-wider">
                              Included Features
                            </p>
                            <ul className="space-y-1.5">
                              {plan.features.map(
                                (feat: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-base-content/80"
                                  >
                                    <Check className="size-4 text-success shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="p-6 pt-0 mt-auto">
                      {isCurrent ? (
                        <button
                          disabled
                          className="btn btn-outline btn-block btn-disabled"
                        >
                          Current Plan
                        </button>
                      ) : isHigher ? (
                        <button
                          onClick={() => handleSubscribeOrUpgrade(plan)}
                          disabled={Boolean(checkoutPlanId)}
                          className="btn btn-primary btn-block gap-2"
                        >
                          <Zap className="size-4" />{" "}
                          {checkoutPlanId === plan.id
                            ? "Payment in progress..."
                            : "Subscribe / Upgrade"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDowngrade(plan)}
                          disabled={downgradeMutation.isPending}
                          className="btn btn-outline btn-secondary btn-block"
                        >
                          Downgrade
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PageLoader>
      </section>

      {/* Subscription Change & Payment History */}
      <SimpleContainer title="Subscription History">
        <PageLoader query={historyQuery}>
          <div className="bg-base-100">
            <CustomTable ring={false} data={history} columns={historyColumns} />
          </div>
        </PageLoader>
      </SimpleContainer>
    </div>
  );
}
