import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";
import { useAdminCrossCompanies } from "@/api/adminApi";

export default function CompanySummary() {
  const { data: companies = [] } = useAdminCrossCompanies();

  const total = companies.length;

  const summary = [
    {
      title: "Total Companies",
      value: total,
    },
    {
      title: "With Website",
      value: companies.filter((c: any) => !!c.website).length,
    },
    {
      title: "With Phone",
      value: companies.filter((c: any) => !!c.workPhone).length,
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
