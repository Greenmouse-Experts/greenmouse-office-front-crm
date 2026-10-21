import { Filter } from "lucide-react";

interface PipelineSelectProps {
  pipelines: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export default function PipelineSelect({
  pipelines,
  value,
  onChange,
  placeholder,
}: PipelineSelectProps) {
  return (
    <div className="flex items-center gap-3 bg-base-100 p-3 rounded-xl border border-base-200 max-w-sm">
      <Filter className="size-4 text-primary" />
      <span className="text-xs font-semibold text-base-content/70">
        Pipeline:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select select-sm select-ghost font-medium flex-1"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {pipelines.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
