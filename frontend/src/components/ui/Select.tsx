import type { ReactNode, SelectHTMLAttributes } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
};

export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  id,
  className,
  ...rest
}: SelectProps) {
  const selectId =
    id ??
    (typeof label === "string"
      ? label.toLowerCase().replace(/\s+/g, "-")
      : undefined);

  return (
    <div className="field">
      {label != null && (
        <label className="field__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={[
          "field__control",
          error ? "field__control--error" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={Boolean(error) || undefined}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="field__error">{error}</p> : null}
      {!error && hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}
