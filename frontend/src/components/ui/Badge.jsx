const STATUS_STYLES = {
  // ── Order / Purchase status ────────────────────────────────────
  PENDING: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100   text-red-800",

  // ── Invoice status ─────────────────────────────────────────────
  PAID: "bg-green-100  text-green-800",
  UNPAID: "bg-amber-100  text-amber-800",
  VOID: "bg-gray-100   text-gray-700",

  // ── Order type ─────────────────────────────────────────────────
  SALE: "bg-blue-100   text-blue-800",
  PURCHASE: "bg-orange-100 text-orange-800",

  // ── Inventory ──────────────────────────────────────────────────
  LOW_STOCK: "bg-red-100   text-red-800",
  IN_STOCK: "bg-green-100 text-green-800",
  OUT_OF_STOCK: "bg-red-100   text-red-800",

  // ── User active status ─────────────────────────────────────────
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100  text-gray-600",

  // ── Roles ──────────────────────────────────────────────────────
  ADMIN: "bg-violet-100 text-violet-800",
  ACCOUNTANT: "bg-emerald-100 text-emerald-800",
  SALES: "bg-blue-100  text-blue-800",
  STOREKEEPER: "bg-yellow-100 text-yellow-800",
};

const DOT_STYLES = {
  PENDING: "bg-amber-500",
  COMPLETED: "bg-green-600",
  CANCELLED: "bg-red-600",
  PAID: "bg-green-600",
  UNPAID: "bg-amber-500",
  VOID: "bg-gray-500",
  SALE: "bg-blue-600",
  PURCHASE: "bg-orange-500",
  LOW_STOCK: "bg-red-600",
  IN_STOCK: "bg-green-600",
  OUT_OF_STOCK: "bg-red-600",
  ACTIVE: "bg-green-600",
  INACTIVE: "bg-gray-400",
  ADMIN: "bg-violet-600",
  ACCOUNTANT: "bg-emerald-600",
  SALES: "bg-blue-600",
  STOREKEEPER: "bg-yellow-600",
};

const LABELS = {
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
  IN_STOCK: "In Stock",
};

export default function Badge({ status, dot = false }) {
  const key = status?.toUpperCase().replace(/\s+/g, "_") ?? "";
  const style = STATUS_STYLES[key] ?? "bg-gray-100 text-gray-700";
  const dotStyle = DOT_STYLES[key] ?? "bg-gray-400";
  const label = LABELS[key] ?? status ?? "—";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
        text-xs font-semibold whitespace-nowrap tracking-wide ${style}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}
