import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartNoAxesCombined, RefreshCw } from "lucide-react";
import { useAdminRevenueTrend } from "@/api/adminApi";

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const fullNumber = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
});

function monthLabel(month: string) {
  const [year, number] = month.split("-").map(Number);
  return `${new Intl.DateTimeFormat("en", { month: "short" }).format(
    new Date(year, number - 1, 1),
  )} ’${String(year).slice(-2)}`;
}

export default function AdminFinanceTrend() {
  const query = useAdminRevenueTrend();
  const trend = query.data?.trend ?? [];
  const totals = trend.reduce(
    (result, point) => ({
      added: result.added + point.added,
      lost: result.lost + point.lost,
      net: result.net + point.net,
    }),
    { added: 0, lost: 0, net: 0 },
  );
  const period = trend.length
    ? `${monthLabel(trend[0].month)} – ${monthLabel(trend[trend.length - 1].month)}`
    : "";
  const chartData = trend.map((point) => ({
    ...point,
    label: monthLabel(point.month),
  }));

  return (
    <section
      className="overflow-hidden rounded-2xl border border-base-200 bg-base-100"
      aria-labelledby="mrr-trend-title"
    >
      <div className="flex items-start gap-3 border-b border-base-200 px-5 py-5 sm:px-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ChartNoAxesCombined className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="mrr-trend-title" className="text-lg font-semibold text-base-content">
            Contracted MRR movement
          </h2>
          <p className="mt-0.5 text-sm text-base-content/70">
            {query.data?.note || "Monthly recurring revenue added, lost, and net change. This is not collected cash."}
          </p>
        </div>
      </div>
      {query.isPending ? (
        <div className="flex min-h-76 items-center justify-center" role="status">
          <span className="loading loading-spinner text-primary" />
          <span className="sr-only">Loading MRR trend</span>
        </div>
      ) : query.isError ? (
        <div className="px-6 py-12 text-center" role="alert">
          <p className="font-medium">MRR trend could not be loaded.</p>
          <p className="mt-1 text-sm text-base-content/70">{query.error.message}</p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-3"
            onClick={() => query.refetch()}
          >
            <RefreshCw className="size-4" /> Try again
          </button>
        </div>
      ) : !trend.length ? (
        <div className="px-6 py-12 text-center">
          <p className="font-medium">No MRR movement has been recorded yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 border-b border-base-200 px-5 py-4 sm:grid-cols-3 sm:px-6">
            {([
              ["Added MRR", totals.added, "text-emerald-600"],
              ["Lost MRR", totals.lost, "text-rose-600"],
              ["Net change", totals.net, "text-primary"],
            ] as const).map(([label, value, color]) => (
              <div key={label}>
                <p className="text-xs font-medium text-base-content/70">{label}</p>
                <p className={`mt-1 text-xl font-semibold tabular-nums ${color}`}>
                  {fullNumber.format(value)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-3 pb-5 pt-5 sm:px-6">
            <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-2 text-xs font-medium text-base-content/70">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-emerald-600" /> Added
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-rose-600" /> Lost
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-primary" /> Net change
              </span>
              <span className="sm:ml-auto">{period}</span>
            </div>
            <div
              className="h-72 w-full sm:h-80"
              role="img"
              aria-label={`Monthly contracted MRR added, lost, and net change from ${period}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  accessibilityLayer
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--color-base-300)"
                    strokeDasharray="3 4"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-base-content)", fontSize: 12 }}
                    tickMargin={12}
                    minTickGap={14}
                  />
                  <YAxis
                    width={58}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-base-content)", fontSize: 12 }}
                    tickFormatter={(value: number) => compactNumber.format(value)}
                  />
                  <Tooltip
                    formatter={(value, name) => [fullNumber.format(Number(value)), String(name)]}
                    contentStyle={{
                      backgroundColor: "var(--color-base-100)",
                      border: "1px solid var(--color-base-300)",
                      borderRadius: 12,
                      color: "var(--color-base-content)",
                    }}
                  />
                  <Bar dataKey="added" name="Added MRR" fill="#059669" maxBarSize={28} />
                  <Bar dataKey="lost" name="Lost MRR" fill="#e11d48" maxBarSize={28} />
                  <Line
                    type="monotone"
                    dataKey="net"
                    name="Net change"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <table className="sr-only">
              <caption>Contracted MRR movement by month, {period}</caption>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Added MRR</th>
                  <th scope="col">Lost MRR</th>
                  <th scope="col">Net change</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((point) => (
                  <tr key={point.month}>
                    <th scope="row">{monthLabel(point.month)}</th>
                    <td>{fullNumber.format(point.added)}</td>
                    <td>{fullNumber.format(point.lost)}</td>
                    <td>{fullNumber.format(point.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
