import type { Tenant } from "@/api/adminApi";
import { Building2, Mail, Phone } from "lucide-react";

const date = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(parsed);
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-base-200 py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-8">
      <dt className="text-sm text-base-content/70">{label}</dt>
      <dd className="break-words text-sm font-medium text-base-content sm:text-right">{value}</dd>
    </div>
  );
}

export default function TenantProfile({ tenant }: { tenant: Tenant }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
      <section className="rounded-2xl border border-base-200 bg-base-100 p-5 sm:p-6" aria-labelledby="tenant-account-heading">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="tenant-account-heading" className="text-lg font-semibold">Account</h2>
            <p className="text-sm text-base-content/70">Registration and contact details</p>
          </div>
        </div>
        <dl className="mt-4">
          <Detail label="Company" value={tenant.companyName || "Unnamed business"} />
          <Detail label="Email" value={tenant.email || "—"} />
          <Detail label="Phone" value={tenant.phoneNumber || "—"} />
          <Detail label="Email verified" value={tenant.isEmailVerified ? "Yes" : "No"} />
          <Detail label="Registered" value={date(tenant.createdAt)} />
          <Detail label="Last updated" value={date(tenant.updatedAt)} />
          <Detail label="Tenant ID" value={tenant.id} />
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          {tenant.email && (
            <a className="btn btn-outline btn-sm" href={`mailto:${tenant.email}`}>
              <Mail className="size-4" aria-hidden="true" /> Email
            </a>
          )}
          {tenant.phoneNumber && (
            <a className="btn btn-outline btn-sm" href={`tel:${tenant.phoneNumber}`}>
              <Phone className="size-4" aria-hidden="true" /> Call
            </a>
          )}
        </div>
      </section>
      <section className="rounded-2xl border border-base-200 bg-base-100 p-5 sm:p-6" aria-labelledby="tenant-subscription-heading">
        <h2 id="tenant-subscription-heading" className="text-lg font-semibold">Subscription</h2>
        <p className="mt-1 text-sm text-base-content/70">Current account and plan state</p>
        <dl className="mt-4">
          <Detail label="Account status" value={tenant.status || "—"} />
          <Detail label="Subscription status" value={tenant.subscriptionStatus || "—"} />
          <Detail label="Billing cycle" value={tenant.billingCycle || "—"} />
          <Detail label="Trial ends" value={date(tenant.trialEndsAt)} />
          <Detail label="Onboarding" value={tenant.isOnboarded ? "Completed" : "Pending"} />
          <Detail label="Plan ID" value={tenant.subscriptionPlanId || "—"} />
        </dl>
      </section>
    </div>
  );
}
