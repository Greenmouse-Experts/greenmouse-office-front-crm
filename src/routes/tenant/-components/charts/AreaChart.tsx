import { useDashboardProfit } from "@/api/tenantApi";
import {
  Area,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AreaChartExample({
  isAnimationActive = true,
}: {
  isAnimationActive?: boolean;
}) {
  const currentYear = new Date().getFullYear();
  const query = useDashboardProfit(currentYear);

  const profitData = query.data;
  const chartData = (
    profitData?.months || [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
  ).map((month, idx) => ({
    name: month,
    profit: profitData?.profit?.[idx] ?? 0,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007047" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#007047" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-base-300 opacity-60"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            className="text-base-content/60"
          />
          <YAxis
            width={60}
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            className="text-base-content/60"
          />
          <Tooltip
            formatter={(val: any) => [
              `₦${Number(val).toLocaleString()}`,
              "Net Profit",
            ]}
            contentStyle={{
              backgroundColor: "var(--color-base-100)",
              borderColor: "var(--color-base-300)",
              borderRadius: "0.5rem",
              color: "var(--color-base-content)",
            }}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#007047"
            fillOpacity={1}
            fill="url(#colorProfit)"
            isAnimationActive={isAnimationActive}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
