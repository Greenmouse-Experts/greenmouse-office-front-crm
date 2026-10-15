import { RefreshCw } from "lucide-react";

type QueryState = {
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  data?: unknown;
  refetch: () => unknown;
};

type Props = {
  title: string;
  description: string;
  emptyMessage: string;
  query: QueryState;
  mode: "timeline" | "details";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const label = (key: string) =>
  key
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

function displayValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
  if (typeof value === "string") {
    if (/(at|date|time)$/i.test(key)) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
      }
    }
    return value;
  }
  if (Array.isArray(value) && value.every((item) => typeof item !== "object")) {
    return value.map((item) => displayValue(key, item)).join(", ") || "—";
  }
  return "";
}

function Fields({ value, depth = 0 }: { value: Record<string, unknown>; depth?: number }) {
  const entries = Object.entries(value).filter(([key, item]) =>
    !["id", "tenantId", "userId"].includes(key) &&
    !/(password|token|secret|credential)/i.test(key) &&
    item !== null && item !== undefined,
  );
  if (!entries.length) return <p className="text-sm text-base-content/70">No further details available.</p>;

  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {entries.map(([key, item]) => {
        const nested = isRecord(item) ? item : null;
        const nestedRows = Array.isArray(item) ? item.filter(isRecord) : [];
        return (
          <div key={key} className={nested || nestedRows.length ? "sm:col-span-2" : "min-w-0"}>
            <dt className="text-xs font-medium text-base-content/60">{label(key)}</dt>
            {nested && depth < 2 ? (
              <div className="mt-2 rounded-xl bg-base-200/50 p-3"><Fields value={nested} depth={depth + 1} /></div>
            ) : nestedRows.length && depth < 2 ? (
              <div className="mt-2 grid gap-2">
                {nestedRows.map((row, index) => (
                  <div key={index} className="rounded-xl bg-base-200/50 p-3">
                    <Fields value={row} depth={depth + 1} />
                  </div>
                ))}
              </div>
            ) : (
              <dd className="mt-0.5 break-words text-sm font-medium text-base-content">
                {nested || nestedRows.length ? "Additional details" : displayValue(key, item)}
              </dd>
            )}
          </div>
        );
      })}
    </dl>
  );
}

const pickText = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
};

function Timeline({ rows, title }: { rows: Record<string, unknown>[]; title: string }) {
  return (
    <ol className="divide-y divide-base-200">
      {rows.map((row, index) => {
        const itemTitle = pickText(row, [
          "title", "event", "eventType", "action", "description", "planName", "status",
        ]) || `${title} entry ${index + 1}`;
        const when = pickText(row, [
          "createdAt", "occurredAt", "changedAt", "loggedInAt", "loginAt", "timestamp", "date",
        ]);
        return (
          <li key={String(row.id ?? index)} className="py-5 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-base-content">{itemTitle}</h3>
              {when && <time className="text-xs text-base-content/60" dateTime={when}>{displayValue("createdAt", when)}</time>}
            </div>
            <div className="mt-3"><Fields value={row} /></div>
          </li>
        );
      })}
    </ol>
  );
}

export default function TenantRelatedPanel({
  title,
  description,
  emptyMessage,
  query,
  mode,
}: Props) {
  const rows = Array.isArray(query.data) ? query.data.filter(isRecord) : [];
  const detail = isRecord(query.data)
    ? query.data
    : Array.isArray(query.data)
      ? { items: query.data }
      : query.data === null || query.data === undefined
        ? null
        : { value: query.data };
  const isEmpty = mode === "timeline"
    ? rows.length === 0
    : !detail || (Array.isArray(query.data) ? !query.data.length : !Object.keys(detail).length);

  return (
    <section className="rounded-2xl border border-base-200 bg-base-100 p-5 sm:p-6" aria-label={title}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-base-content">{title}</h2>
        <p className="mt-1 text-sm text-base-content/70">{description}</p>
      </div>
      {query.isPending ? (
        <div className="flex min-h-40 items-center justify-center" role="status">
          <span className="loading loading-spinner text-primary" />
          <span className="sr-only">Loading {title.toLowerCase()}</span>
        </div>
      ) : query.isError ? (
        <div className="rounded-xl bg-error/10 p-5" role="alert">
          <p className="font-medium text-error">Could not load {title.toLowerCase()}.</p>
          <p className="mt-1 text-sm text-base-content/70">{query.error?.message}</p>
          <button type="button" className="btn btn-outline btn-sm mt-3" onClick={() => query.refetch()}>
            <RefreshCw className="size-4" /> Try again
          </button>
        </div>
      ) : isEmpty ? (
        <p className="rounded-xl bg-base-200/50 px-4 py-8 text-center text-sm text-base-content/70">
          {emptyMessage}
        </p>
      ) : mode === "timeline" ? (
        <Timeline rows={rows} title={title} />
      ) : detail ? (
        <Fields value={detail} />
      ) : null}
    </section>
  );
}
