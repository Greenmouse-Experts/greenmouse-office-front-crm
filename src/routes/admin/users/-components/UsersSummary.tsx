import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";
import { useStaffs } from "@/api/adminApi";

export default function UserSummary() {
  const { data: staffs = [] } = useStaffs();

  const total = staffs.length;
  const active = staffs.filter((s) => s.isActive === true).length;
  const inactive = staffs.filter((s) => s.isActive === false).length;

  const summary = [
    {
      title: "Administrators",
      value: total,
    },
    {
      title: "Active",
      value: active,
    },
    {
      title: "Inactive",
      value: inactive,
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
