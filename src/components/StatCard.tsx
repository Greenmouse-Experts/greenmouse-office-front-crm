import type { ReactNode } from "react";

export type StatVariant =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default";

export interface StatCardProps {
  title: string;
  value: ReactNode;
  desc?: ReactNode;
  icon?: ReactNode;
  variant?: StatVariant;
  colorClass?: string;
  className?: string;
}

const variantStyles: Record<StatVariant, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-error/10 text-error border-error/20",
  info: "bg-info/10 text-info border-info/20",
  default: "bg-base-200 text-base-content/70 border-base-300",
};

export default function StatCard({
  title,
  value,
  desc,
  icon,
  variant = "default",
  colorClass,
  className = "",
}: StatCardProps) {
  const iconStyle =
    colorClass || variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`card bg-base-100/70 backdrop-blur-md border border-base-200 shadow-sm p-4 hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-base-content/60 uppercase tracking-wider truncate">
            {title}
          </p>
          <h3 className="text-2xl font-semibold text-base-content mt-1 truncate">
            {value}
          </h3>
          {desc && (
            <p className="text-sm text-base-content/50 mt-0.5 truncate">
              {desc}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl border shrink-0 ${iconStyle}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
