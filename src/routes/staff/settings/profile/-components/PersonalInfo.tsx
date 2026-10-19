import type { StaffProfile } from "@/api/tenantApi";

export default function PersonalInfo({ profile }: { profile: StaffProfile }) {
  const details = [
    { label: "First name", value: profile.firstName },
    { label: "Last name", value: profile.lastName },
    { label: "Email address", value: profile.email },
    { label: "Phone number", value: profile.phoneNumber },
  ];

  return (
    <section className="rounded-xl bg-base-100 p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Personal information</h2>
      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {details.map(({ label, value }) => (
          <div key={label} className="min-w-0 space-y-1">
            <dt className="text-sm text-base-content/70">{label}</dt>
            <dd className="break-words font-medium">{value || "Not provided"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
