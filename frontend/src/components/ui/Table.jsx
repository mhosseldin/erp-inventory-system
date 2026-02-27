import EmptyState from "./EmptyState";
import LoadingSpinner from "./LoadingSpinner";

export default function Table({
  columns = [],
  data = [],
  loading = false,
  error,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  skeletonRows = 5,
  className = "",
}) {
  const alignClass = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  };

  return (
    <div
      className={`w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <table className="w-full text-sm border-collapse">
        {/* ── Header ─────────────────────────────────── */}
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  "px-4 py-3 text-xs font-semibold text-slate-500",
                  "uppercase tracking-wider whitespace-nowrap",
                  alignClass[col.align ?? "left"],
                  col.width ?? "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ───────────────────────────────────── */}
        <tbody>
          {/* Error state */}
          {error && !loading && (
            <tr>
              <td colSpan={columns.length}>
                <div className="flex items-center justify-center gap-2 py-12 text-danger text-sm font-medium">
                  <span aria-hidden="true">⚠️</span>
                  {error}
                </div>
              </td>
            </tr>
          )}

          {/* Loading skeleton */}
          {loading &&
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <tr
                key={`skeleton-${rowIdx}`}
                className="border-b border-gray-100 last:border-0"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    <span
                      className="block h-4 rounded bg-gray-200 animate-pulse"
                      style={{
                        // Vary widths so it doesn't look like a grid of identical bars
                        width: `${55 + ((rowIdx * columns.indexOf(col) * 17) % 35)}%`,
                      }}
                      aria-hidden="true"
                    />
                  </td>
                ))}
              </tr>
            ))}

          {/* Empty state */}
          {!loading && !error && data.length === 0 && (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle ?? "No results found"}
                  message={emptyMessage}
                  action={emptyAction}
                />
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!loading &&
            !error &&
            data.map((row, rowIdx) => (
              <tr
                key={row.id ?? rowIdx}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-100"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      "px-4 py-3.5 text-slate-700",
                      alignClass[col.align ?? "left"],
                      col.className ?? "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {col.render(row, rowIdx)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
