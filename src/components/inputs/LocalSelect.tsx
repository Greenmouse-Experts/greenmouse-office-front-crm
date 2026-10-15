import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

export interface LocalSelectOption {
  label: string;
  value: string | number;
}

export interface LocalSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: (LocalSelectOption | string)[];
}

const LocalSelect = forwardRef<HTMLSelectElement, LocalSelectProps>(
  ({ children, className, label, options, ...props }, ref) => {
    return (
      <div className="w-full flex-1">
        {label && (
          <div className="fieldset-label font-semibold mb-2">
            <span className="text-sm">{label}</span>
          </div>
        )}
        <select
          ref={ref}
          className={`select flex-1 select-bordered w-full ${className || ""}`}
          {...props}
        >
          {options
            ? options.map((opt) => {
                const isObj = typeof opt === "object" && opt !== null;
                const val = isObj ? opt.value : opt;
                const lbl = isObj ? opt.label : opt;
                return (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                );
              })
            : children}
        </select>
      </div>
    );
  },
);

LocalSelect.displayName = "LocalSelect";

export default LocalSelect;
