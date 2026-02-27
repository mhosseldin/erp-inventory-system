export default function Select({
  label,
  id,
  required = false,
  error,
  helper,
  placeholder,
  options = [],
  className = "",
  ...rest
}) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-") ?? undefined;

  const hasError = Boolean(error);

  const selectBase =
    "w-full appearance-none rounded-md border bg-white px-3 py-2 pr-9 " +
    "text-sm text-slate-800 transition-colors duration-150 cursor-pointer " +
    "focus:outline-none focus:ring-2 focus:ring-offset-0 " +
    "disabled:bg-gray-50 disabled:text-slate-400 disabled:cursor-not-allowed";

  const selectState = hasError
    ? "border-danger focus:border-danger focus:ring-danger/20"
    : "border-gray-200 hover:border-slate-400 focus:border-accent focus:ring-accent/20";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          id={selectId}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${selectId}-error`
              : helper
                ? `${selectId}-helper`
                : undefined
          }
          className={[selectBase, selectState].join(" ")}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <span
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>

      {error && (
        <p
          id={`${selectId}-error`}
          role="alert"
          className="text-xs font-medium text-danger"
        >
          {error}
        </p>
      )}

      {helper && !error && (
        <p id={`${selectId}-helper`} className="text-xs text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
}
