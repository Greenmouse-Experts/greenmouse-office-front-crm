import React, { forwardRef, useRef } from "react";
import {
  NumericFormat,
  type NumericFormatProps,
  type NumberFormatValues,
  type SourceInfo,
} from "react-number-format";
import { useFormContext } from "react-hook-form";

export interface FormattedPriceInputProps
  extends Omit<NumericFormatProps, "customInput" | "type" | "size"> {
  label?: string;
  icon?: React.ReactNode;
  currency?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  wrapperClassName?: string;
}

const FormattedPriceInput = forwardRef<HTMLInputElement, FormattedPriceInputProps>(
  (
    {
      label,
      icon,
      currency = "₦",
      size = "md",
      name,
      className,
      wrapperClassName,
      thousandSeparator = ",",
      decimalScale = 2,
      allowNegative = false,
      placeholder = "0.00",
      value,
      defaultValue,
      onChange,
      onValueChange,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    // ✅ SAFE: prevents crash when no FormProvider exists
    let formState: any = null;
    try {
      formState = useFormContext()?.formState;
    } catch {
      formState = null;
    }

    const error = name && formState ? formState.errors?.[name] : undefined;
    const lastValuesRef = useRef<NumberFormatValues | null>(null);

    const handleValueChange = (
      values: NumberFormatValues,
      sourceInfo: SourceInfo,
    ) => {
      lastValuesRef.current = values;
      onValueChange?.(values, sourceInfo);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;
      if (lastValuesRef.current) {
        const raw = lastValuesRef.current.value;
        const num = lastValuesRef.current.floatValue;
        // Make e.target.value return raw unformatted number so Number(e.target.value) or parseFloat() works!
        try {
          Object.defineProperty(e.target, "value", {
            configurable: true,
            enumerable: true,
            get: () => raw,
          });
          Object.defineProperty(e.target, "valueAsNumber", {
            configurable: true,
            enumerable: true,
            get: () => num ?? 0,
          });
        } catch {
          // Fallback if property definition is restricted
        }
      }
      onChange?.(e);
    };

    const sizeClass =
      size === "xs"
        ? "input-xs text-xs"
        : size === "sm"
          ? "input-sm text-sm"
          : size === "lg"
            ? "input-lg text-base"
            : "input-md text-sm";

    return (
      <div className={`w-full ${label ? "space-y-2" : ""} ${wrapperClassName || ""}`}>
        {label && (
          <div className="fieldset-label font-semibold">
            <span className="text-sm">{label}</span>
          </div>
        )}

        <div
          className={`input ${sizeClass} input-bordered flex items-center gap-1.5 w-full ${
            error ? "input-error" : ""
          } ${disabled ? "input-disabled opacity-60" : ""}`}
        >
          {icon !== undefined ? (
            icon
          ) : currency ? (
            <span className="text-base-content/60 font-semibold select-none text-xs shrink-0">
              {currency}
            </span>
          ) : null}

          <NumericFormat
            {...props}
            name={name}
            getInputRef={ref}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            thousandSeparator={thousandSeparator}
            decimalScale={decimalScale}
            allowNegative={allowNegative}
            disabled={disabled}
            required={required}
            onValueChange={handleValueChange}
            onChange={handleChange}
            className={`grow bg-transparent border-none outline-none focus:outline-none w-full ${
              className || ""
            }`}
          />
        </div>

        {error && <p className="text-error text-sm mt-1">{error.message}</p>}
      </div>
    );
  },
);

FormattedPriceInput.displayName = "FormattedPriceInput";

export default FormattedPriceInput;
export { FormattedPriceInput };
