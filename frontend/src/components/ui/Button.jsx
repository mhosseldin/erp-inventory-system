import LoadingSpinner from "./LoadingSpinner";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className = "",
  disabled,
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-medium rounded-md " +
    "transition-colors duration-150 focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent " +
    "disabled:opacity-55 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-accent text-white border border-accent hover:bg-accent-hover " +
      "shadow-sm hover:shadow-md focus-visible:ring-accent",
    secondary:
      "bg-white text-slate-700 border border-gray-200 hover:bg-gray-50 " +
      "shadow-sm focus-visible:ring-accent",
    danger:
      "bg-danger text-white border border-danger hover:bg-red-700 " +
      "shadow-sm focus-visible:ring-danger",
    ghost:
      "bg-transparent text-accent border border-transparent " +
      "hover:bg-accent-100 focus-visible:ring-accent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={[
        base,
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      {...rest}
    >
      {icon && !loading && <span className="shrink-0">{icon}</span>}

      {loading && (
        <LoadingSpinner
          size="sm"
          color={
            variant === "secondary" || variant === "ghost" ? "accent" : "white"
          }
        />
      )}

      {children}

      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
