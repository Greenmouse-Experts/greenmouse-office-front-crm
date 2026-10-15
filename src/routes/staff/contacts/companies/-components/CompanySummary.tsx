import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";
import { useCompanies, type Company } from "@/api/crmApi";

interface CompanySummaryProps {
  companies?: Company[];
}

export default function CompanySummary({
  companies: propCompanies,
}: CompanySummaryProps) {
  const { data: fetchedCompanies = [] } = useCompanies();
  const list = propCompanies || fetchedCompanies;

  const total = list.length;
  // Consider active if it has contact info or standard status
  const withEmail = list.filter((c) => !!c.email || !!c.workPhone).length;
  const industries = new Set(list.map((c) => c.industry).filter(Boolean)).size;

  const stats = [
    {
      title: "Total Companies",
      value: total,
    },
    {
      title: "Active Accounts",
      value: withEmail,
    },
    {
      title: "Industry Verticals",
      value: industries,
    },
  ];

  return (
    <div>
      <SummaryGrid>
        {stats.map((item, idx) => (
          <SummaryCard key={idx} item={item} />
        ))}
      </SummaryGrid>
    </div>
  );
}
