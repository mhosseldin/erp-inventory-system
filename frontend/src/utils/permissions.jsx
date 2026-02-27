const PERMISSIONS = {
  ADMIN: [
    // Users
    "manage_users",
    // Dashboard
    "view_dashboard",
    // Products
    "view_products",
    "create_product",
    "edit_product",
    "delete_product",
    // Orders
    "view_orders",
    "create_order",
    "complete_order",
    "cancel_order",
    // Inventory
    "view_inventory",
    "manage_inventory",
    "adjust_stock",
    // Invoices
    "view_invoices",
    "mark_invoice_paid",
    "void_invoice",
    // Reports
    "view_reports",
  ],

  ACCOUNTANT: [
    "view_dashboard",
    "view_invoices",
    "mark_invoice_paid",
    "void_invoice",
    "view_reports",
  ],

  SALES: [
    "view_dashboard",
    "view_products",
    "view_orders",
    "create_order",
    "cancel_own_order",
  ],

  STOREKEEPER: [
    "view_dashboard",
    "view_products",
    "view_orders",
    "complete_order",
    "view_inventory",
    "manage_inventory",
    "adjust_stock",
  ],
};

export function canDo(role, action) {
  if (!role || !action) return false;
  return PERMISSIONS[role]?.includes(action) ?? false;
}

export function getRolePermissions(role) {
  return PERMISSIONS[role] ?? [];
}

export const ROLES = {
  ADMIN: "ADMIN",
  ACCOUNTANT: "ACCOUNTANT",
  SALES: "SALES",
  STOREKEEPER: "STOREKEEPER",
};
