import { useId, type CSSProperties } from "react";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

interface PhoneNumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  error?: string;
  disabled?: boolean;
}

export const validatePhoneNumber = (value: string) =>
  !value || isPossiblePhoneNumber(value) || "Enter a valid phone number";

export default function PhoneNumberInput({
  label,
  value,
  onChange,
  onBlur,
  name,
  error,
  disabled,
}: PhoneNumberInputProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="w-full space-y-2">
      <label htmlFor={id} className="fieldset-label font-semibold">
        <span className="text-sm">{label}</span>
      </label>
      <PhoneInput
        id={id}
        name={name}
        defaultCountry="NG"
        flags={flags}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        onBlur={onBlur}
        disabled={disabled}
        autoComplete="tel"
        placeholder="Enter phone number"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        style={{ "--PhoneInput-color--focus": "var(--color-primary)" } as CSSProperties}
        className={`PhoneInput input input-md input-bordered w-full gap-2 text-sm focus-within:outline-2 focus-within:outline-primary [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:grow [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none ${error ? "input-error" : ""}`}
      />
      {error && <p id={errorId} className="text-error text-sm">{error}</p>}
    </div>
  );
}
