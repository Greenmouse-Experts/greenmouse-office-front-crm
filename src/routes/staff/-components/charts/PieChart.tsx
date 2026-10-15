import SimpleContainer from "@/components/SimpleContainer";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardUserAnalytics } from "@/api/tenantApi";

export default function PieChartExample() {
  const query = useDashboardUserAnalytics();
  const data = query.data;

  const chartData = [
    {
      name: "Users",
      value: data?.users ?? 0,
      color: "#007047",
    },
    {
      name: "Products",
      value: data?.products ?? 0,
      color: "#3b82f6",
    },
    {
      name: "Expenses",
      value: data?.expenses ?? 0,
      color: "#ef4444",
    },
    {
      name: "Revenue",
      value: data?.revenue ?? 0,
      color: "#f59e0b",
    },
  ];

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <SimpleContainer title="Platform & Business Distribution">
      <div className="bg-base-100 border border-base-200 rounded-b-box p-4 flex flex-col items-center">
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center text-xs">
              <div
                className="size-3 rounded-full mr-1.5"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-base-content/80">
                {item.name}: {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={
                  total > 0
                    ? chartData
                    : [{ name: "No Data", value: 1, color: "#d1d5db" }]
                }
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {(total > 0
                  ? chartData
                  : [{ name: "No Data", value: 1, color: "#d1d5db" }]
                ).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-base-100)",
                  borderColor: "var(--color-base-300)",
                  borderRadius: "0.5rem",
                  color: "var(--color-base-content)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SimpleContainer>
  );
}
