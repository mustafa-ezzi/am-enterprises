import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

export function Input({
  label,
  hint,
  error,
  id,
  className,
  ...rest
}: InputProps) {
  const inputId = id ?? (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="field">
      {label != null && (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          "field__control",
          error ? "field__control--error" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={Boolean(error) || undefined}
        {...rest}
      />
      {error ? <p className="field__error">{error}</p> : null}
      {!error && hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}
