const COLOR_MAP = {
  blue: {
    border: "border-l-accent",
    iconBg: "bg-accent-100",
    iconText: "text-accent",
  },
  green: {
    border: "border-l-success",
    iconBg: "bg-green-50",
    iconText: "text-success",
  },
  amber: {
    border: "border-l-warning",
    iconBg: "bg-amber-50",
    iconText: "text-warning",
  },
  red: {
    border: "border-l-danger",
    iconBg: "bg-red-50",
    iconText: "text-danger",
  },
};

function SkeletonLine({ className = "" }) {
  return (
    <span
      className={`block rounded bg-gray-200 animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  loading = false,
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 border-l-4
        ${c.border} p-5 shadow-sm
        transition-shadow duration-300 hover:shadow-md
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {loading ? (
            <>
              <SkeletonLine className="h-3 w-24 mb-3" />
              <SkeletonLine className="h-7 w-32 mb-2" />
              <SkeletonLine className="h-3 w-20" />
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {title}
              </p>
              <p className="text-3xl font-bold text-slate-900 leading-tight font-mono tabular-nums">
                {value ?? "—"}
              </p>
              {subtitle && (
                <p className="mt-1 text-xs text-slate-400 truncate">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>

        {icon && (
          <div
            className={`
              shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
              text-xl ${c.iconBg} ${c.iconText}
            `}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
