export default function Input({
  label,
  id,
  required = false,
  error,
  helper,
  leadingIcon,
  trailingIcon,
  className = "",
  inputClassName = "",
  ...rest
}) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-") ?? undefined;

  const hasError = Boolean(error);

  const inputBase =
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 " +
    "placeholder:text-slate-400 transition-colors duration-150 " +
    "focus:outline-none focus:ring-2 focus:ring-offset-0 " +
    "disabled:bg-gray-50 disabled:text-slate-400 disabled:cursor-not-allowed";

  const inputState = hasError
    ? "border-danger focus:border-danger focus:ring-danger/20"
    : "border-gray-200 hover:border-slate-400 focus:border-accent focus:ring-accent/20";

  const paddingLeft = leadingIcon ? "pl-9" : "";
  const paddingRight = trailingIcon ? "pr-9" : "";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-600 select-none"
        >
          {label}
          {required && (
            <span className="text-danger ml-0.5" aria-hidden="true">
              {" *"}
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {leadingIcon && (
          <span
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        )}

        <input
          id={inputId}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helper
                ? `${inputId}-helper`
                : undefined
          }
          className={[
            inputBase,
            inputState,
            paddingLeft,
            paddingRight,
            inputClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />

        {trailingIcon && (
          <span
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
            aria-hidden="true"
          >
            {trailingIcon}
          </span>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs font-medium text-danger"
        >
          {error}
        </p>
      )}

      {helper && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
}
