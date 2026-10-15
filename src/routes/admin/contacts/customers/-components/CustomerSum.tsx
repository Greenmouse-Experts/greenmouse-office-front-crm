import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";
import { useAdminCrossContacts } from "@/api/adminApi";
import type { Customer } from "@/api/crmApi";

export default function CustomerSummary({
  customers: propCustomers,
}: {
  customers?: Customer[];
} = {}) {
  const { data: queryCustomers = [] } = useAdminCrossContacts();
  const customers = (propCustomers || queryCustomers) as Customer[];

  const total = customers.length;
  const individual = customers.filter(
    (c: any) => c.type === "individual" || (!c.companyName && !c.companyId),
  ).length;
  const business = customers.filter(
    (c: any) => c.type === "business" || !!c.companyName || !!c.companyId,
  ).length;
  const withPhone = customers.filter(
    (c: any) => !!c.workPhone || !!c.cellPhone || !!c.phone,
  ).length;
  const newThisMonth = customers.filter((c: any) => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const summary = [
    {
      title: "Total Customers",
      value: total,
    },
    {
      title: "Individual Clients",
      value: individual,
    },
    {
      title: "Business Clients",
      value: business,
    },
    {
      title: "With Phone",
      value: withPhone,
    },
    {
      title: "New This Month",
      value: newThisMonth,
    },
  ];

  return (
    <div>
      <SummaryGrid>
        {summary.map((item, index) => (
          <SummaryCard key={index} item={item} />
        ))}
      </SummaryGrid>
    </div>
  );
}
