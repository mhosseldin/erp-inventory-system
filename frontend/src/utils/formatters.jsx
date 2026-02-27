/**
 * formatCurrency(1500)          // "EGP 1,500.00"
 * formatCurrency(1500.5)        // "EGP 1,500.50"
 * formatCurrency(0)             // "EGP 0.00"
 * formatCurrency(null)          // "—"
 * formatCurrency(1500, { showSymbol: false }) // "1,500.00"
 */
export function formatCurrency(
  value,
  { showSymbol = true, decimals = 2 } = {},
) {
  if (value === null || value === undefined || value === "") return "—";

  const num = Number(value);
  if (isNaN(num)) return "—";

  const formatted = num.toLocaleString("en-EG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `EGP ${formatted}` : formatted;
}

/**
 * formatProfit(3200)   // { text: "+ EGP 3,200.00", positive: true }
 * formatProfit(-500)   // { text: "- EGP 500.00",   positive: false }
 */
export function formatProfit(value) {
  if (value === null || value === undefined)
    return { text: "—", positive: null };
  const num = Number(value);
  if (isNaN(num)) return { text: "—", positive: null };

  const abs = Math.abs(num);
  const sign = num >= 0 ? "+ " : "- ";
  return {
    text: `${sign}EGP ${abs.toLocaleString("en-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    positive: num >= 0,
  };
}

/**
 * formatNumber(1000)   // "1,000"
 * formatNumber(42)     // "42"
 * formatNumber(null)   // "—"
 */
export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (isNaN(num)) return "—";
  return num.toLocaleString("en-EG");
}

/**
 * formatQty(50)   // { text: "50 units", low: false }
 * formatQty(0)    // { text: "0 units",  low: true  }
 */
export function formatQty(value) {
  const num = Number(value);
  if (isNaN(num)) return { text: "—", low: false };
  return {
    text: `${num.toLocaleString("en-EG")} units`,
    low: num <= 0,
  };
}

// ─── Dates ────────────────────────────────────────────────────────────────

/**
 * formatDate("2024-03-15T10:30:00Z")               // "15 Mar 2024"
 * formatDate("2024-03-15T10:30:00Z", { time: true }) // "15 Mar 2024, 10:30"
 * formatDate("2024-03-15", { short: true })          // "15/03/2024"
 * formatDate(null)                                   // "—"
 */
export function formatDate(value, { time = false, short = false } = {}) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "—";

  if (short) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const dateStr = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (!time) return dateStr;

  const timeStr = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateStr}, ${timeStr}`;
}

/**
 * formatRelativeTime(new Date())                    // "just now"
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
 */
export function formatRelativeTime(value) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

  return formatDate(date);
}

/**
 * formatLabel("PENDING")   // "Pending"
 * formatLabel("LOW_STOCK") // "Low stock"
 */
export function formatLabel(value) {
  if (!value) return "";
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1).toLowerCase().replace(/_/g, " ")
  );
}

/**
 * formatInitials("Ahmed Hassan")     // "AH"
 * formatInitials("Nour")             // "N"
 * formatInitials("")                 // "?"
 */
export function formatInitials(fullname) {
  if (!fullname?.trim()) return "?";
  const parts = fullname.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * truncate("A very long product description", 20) // "A very long product…"
 */
export function truncate(value, max = 40) {
  if (!value) return "";
  return value.length <= max ? value : value.slice(0, max - 1) + "…";
}

/**
 * formatInvoiceNumber("INV-1711234567890") // "INV-1711234567890"
 * formatInvoiceNumber(42)                  // "INV-42"
 */
export function formatInvoiceNumber(value) {
  if (!value) return "—";
  const str = String(value);
  return str.startsWith("INV-") ? str : `INV-${str}`;
}

/**
 * formatOrderId(1)    // "#0001"
 * formatOrderId(123)  // "#0123"
 */
export function formatOrderId(id, pad = 4) {
  if (!id) return "—";
  return `#${String(id).padStart(pad, "0")}`;
}
