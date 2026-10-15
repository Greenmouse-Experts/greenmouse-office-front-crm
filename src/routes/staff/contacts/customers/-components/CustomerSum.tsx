import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";
import { useContacts, type Contact } from "@/api/crmApi";

interface CustomerSummaryProps {
  contacts?: Contact[];
}

export default function CustomerSummary({
  contacts: propContacts,
}: CustomerSummaryProps) {
  const { data: fetchedContacts = [] } = useContacts();
  const list = propContacts || fetchedContacts;

  const total = list.length;
  const active = list.filter(
    (c) => c.status !== "inactive" && c.status !== "lead",
  ).length;
  const leads = list.filter(
    (c) => c.status === "lead" || c.status === "inactive",
  ).length;

  const stats = [
    {
      title: "Total Contacts",
      value: total,
    },
    {
      title: "Active Customers",
      value: active,
    },
    {
      title: "Leads & Prospects",
      value: leads,
    },
  ];

  return (
    <div>
      <SummaryGrid>
        {stats.map((item, index) => (
          <SummaryCard key={index} item={item} />
        ))}
      </SummaryGrid>
    </div>
  );
}
