import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";
import { useStaffs } from "@/api/adminApi";

export default function UserSummary() {
  const { data: staffs = [] } = useStaffs();

  const total = staffs.length;
  const active = staffs.filter((s) => s.status === "active").length;
  const inactive = total - active;

  const summary = [
    {
      title: "Total Staffs",
      value: total,
    },
    {
      title: "Active Staffs",
      value: active,
    },
    {
      title: "Inactive Staffs",
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
