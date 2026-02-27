export default function EmptyState({
  icon = "📭",
  title = "No results found",
  message,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center select-none">
      <span className="text-5xl mb-4 opacity-40 block" aria-hidden="true">
        {icon}
      </span>

      <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>

      {message && (
        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
          {message}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
