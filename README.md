# ERP Inventory System

**A production-grade inventory management system built with NestJS, React, and PostgreSQL — featuring atomic stock operations, inventory reservation logic, role-based access control, and financial integrity through protected invoice records.**

---

## Problem Statement

Most small businesses track inventory in spreadsheets or basic CRUD apps. That works until two sales reps confirm the same stock at the same time, an invoice gets deleted by mistake, or no one can tell why stock numbers changed last week.

This project addresses those real gaps:

- **Overselling** is prevented by reserving stock when an order is created, not when it ships.
- **Data loss** is prevented by never deleting financial records — invoices are voided, not removed.
- **Missing audit trails** are solved by logging every stock change as an `InventoryMovement` record.
- **Access control** is enforced at the backend level so the frontend can't be bypassed to perform unauthorized actions.

---

## Key Features

### Inventory Logic

- **Stock reservation** — when a sale order is created, stock is reserved (`reserved_quantity` increments) without touching `quantity_on_hand`. Physical stock only decreases on order completion.
- **Available stock formula** — `available = quantity_on_hand - reserved_quantity`, so the system always knows what can actually be sold.
- **Low stock alerts** — each product has a `reorder_level`. The dashboard flags products that fall below it.
- **Full audit trail** — every stock change (sale, purchase, manual adjustment) creates an `InventoryMovement` record with the reason, user, and timestamp.

### Order Processing

- **Pending → Complete workflow** — orders move through defined status transitions. Completing an order triggers stock deduction and invoice generation atomically.
- **Server-side total calculation** — order totals are calculated on the backend using snapshotted prices. Client-sent totals are never trusted.
- **Price & cost snapshots** — `price_snapshot` and `cost_snapshot` are stored on each order item at creation time, so historical profit reports stay accurate even if product prices change later.

### Financial Integrity

- **Invoice auto-generation** — an invoice is created automatically when a sale order is completed.
- **VOID instead of delete** — invoices can be voided but never deleted. This preserves financial history.
- **Profit tracking** — because `cost_snapshot` is stored alongside `price_snapshot`, the reports module can calculate gross profit per order without guessing.

### Security

- **JWT authentication** with expiration handling.
- **Role-based access control** enforced in NestJS Guards at the controller level.
- **Four roles:** ADMIN, ACCOUNTANT, SALES, STOREKEEPER — each with defined permissions.
- **Passwords** are hashed with bcrypt before storage.

---

## Architecture Decisions

### Why is Invoice separate from Order?

An order is an operational record — it tracks what was requested and whether it was fulfilled. An invoice is a financial document — it tracks what is owed and whether it was paid. Mixing them into one model makes it impossible to handle cases like: a completed order with a disputed invoice, or generating a credit note. Keeping them separate follows standard accounting logic.

### Why use stock reservation instead of direct decrement?

If stock was decremented the moment an order was placed, pending orders that get cancelled would need stock "returned." That creates complex undo logic. Reservation is cleaner: `reserved_quantity` increases on create, and `quantity_on_hand` only decreases on complete. Cancellation just releases the reservation — no reversal needed.

### Why are transactions mandatory for stock operations?

A sale order completion touches multiple tables: `Inventory`, `InventoryMovement`, `Order`, and `Invoice`. If any of these writes fail midway — say the invoice creation throws an error — the stock would already be decremented with no corresponding invoice. Prisma's `$transaction()` ensures all-or-nothing behavior: either every write succeeds, or none of them do.

### Why are permissions enforced in code instead of a database table?

A dynamic permission table (Role → Permission → Action) makes sense for systems where admins configure permissions through a UI. For this project's scale, that would be over-engineering. Permissions are defined once in a `permissions.js` utility and enforced via NestJS `RolesGuard`. It's simpler, easier to reason about, and harder to misconfigure.

### Why does the schema include warehouse support if it defaults to one warehouse?

Multi-warehouse support is built into `Inventory` as a `(product_id, warehouse_id)` unique pair. In practice, the app defaults to a single main warehouse. This means the data model is already correct if warehouses are added later — no schema migration needed, just UI changes.

---

## Database Design

### Entity Relationship Overview

```mermaid
erDiagram
    Role ||--o{ User : "has"
    User ||--o{ Order : "creates"
    User ||--o{ InventoryMovement : "performs"

    Product ||--o{ OrderItem : "included in"
    Product ||--o{ Inventory : "tracked in"
    Product ||--o{ InventoryMovement : "tracks"
    Product ||--o{ SupplierProduct : "supplied by"

    Supplier ||--o{ Order : "fulfills"
    Supplier ||--o{ SupplierProduct : "offers"

    Customer ||--o{ Order : "places"

    Warehouse ||--o{ Inventory : "stores"
    Warehouse ||--o{ InventoryMovement : "records"

    Order ||--o{ OrderItem : "contains"
    Order ||--o{ InventoryMovement : "triggers"
    Order ||--|| Invoice : "generates"

    Role {
        int id PK
        string name
        string description
    }
    User {
        int id PK
        string email
        string password_hash
        string fullname
        int role_id FK
        bool is_active
    }
    Product {
        int id PK
        string sku
        string name
        decimal price
        decimal cost
        int reorder_level
        bool is_active
    }
    Inventory {
        int id PK
        int product_id FK
        int warehouse_id FK
        int quantity_on_hand
        int reserved_quantity
    }
    Order {
        int id PK
        enum type
        enum status
        decimal total
        int customer_id FK
        int supplier_id FK
        int created_by FK
    }
    OrderItem {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_snapshot
        decimal cost_snapshot
    }
    Invoice {
        int id PK
        string invoice_number
        int order_id FK
        enum status
        datetime issue_date
        datetime paid_at
    }
    InventoryMovement {
        int id PK
        int product_id FK
        int warehouse_id FK
        int order_id FK
        enum type
        int quantity_change
        int created_by FK
    }
```

### Design Notes

- **Auditability** — `InventoryMovement` is append-only. You can reconstruct the full stock history for any product at any point in time by replaying its movements.
- **Price integrity** — `OrderItem` stores `price_snapshot` and `cost_snapshot` at the time of order creation. This decouples historical reports from current product prices.
- **Soft deletes** — users are deactivated via `is_active`, not deleted. This preserves `created_by` references across orders and movements.
- **No dynamic permissions** — `Role` is a simple name lookup. Permissions live in application code, not the database.

---

## Transaction & Concurrency Handling

### The Core Problem

Without transactions, completing an order involves multiple separate database writes. If one fails in the middle, the database ends up in a broken state — stock decremented but no invoice created, or an invoice created for an order that's still PENDING.

### How It's Handled

Every critical stock operation is wrapped in `prisma.$transaction()`:

```
Order Completion Flow:
─────────────────────────────────────────────
1. Fetch order + items                  ─┐
2. Lock inventory rows (SELECT FOR UPDATE) │  All inside
3. Decrement quantity_on_hand             │  a single
4. Decrement reserved_quantity            │  transaction
5. Create InventoryMovement record        │
6. Update order status → COMPLETED        │
7. Create Invoice (UNPAID)              ─┘

If any step fails → entire transaction rolls back
─────────────────────────────────────────────
```

### Row-Level Locking

When two requests try to complete orders for the same product simultaneously, a race condition can cause stock to go negative. To prevent this, inventory rows are locked with `SELECT ... FOR UPDATE` before being updated. The second request waits until the first transaction commits before it can proceed.

### Server-Side Validation

- Order totals are **calculated on the server** using `price_snapshot` values fetched from the database.
- Available stock is **checked on the server** before reservation. A client sending `quantity: 9999` for a product with 5 units in stock will get a `400 Bad Request`.
- Product prices are **never taken from the request body** — they're always read fresh from the `Product` table at order creation time.

---

## Tech Stack

| Layer              | Technology        | Reason                                                            |
| ------------------ | ----------------- | ----------------------------------------------------------------- |
| Backend Framework  | NestJS            | Modular architecture, built-in DI, native TypeScript support      |
| ORM                | Prisma            | Type-safe queries, clean transaction API, great migration tooling |
| Database           | PostgreSQL        | ACID compliance, row-level locking, reliable for financial data   |
| Authentication     | JWT (Passport.js) | Stateless, easy to scale, standard for REST APIs                  |
| Frontend Framework | React             | Component model fits the feature-based structure                  |
| Styling            | TailwindCSS       | Utility-first makes it easy to build a consistent design system   |
| Password Hashing   | bcrypt            | Industry standard, configurable cost factor                       |

---

## Project Structure

### Backend (NestJS)

```
src/
├── auth/              # Login, JWT strategy, Guards (JwtAuthGuard, RolesGuard)
├── users/             # User management — ADMIN only
├── products/          # Product catalog with stock level info
├── orders/            # Core order logic, stock reservation, completion flow
├── inventory/         # Stock levels, manual adjustments
├── invoices/          # Invoice listing, mark as paid, void
├── reports/           # Sales, profit, inventory summary queries
├── dashboard/         # Aggregated KPI endpoint
├── suppliers/         # Supplier management
├── customers/         # Customer management
└── prisma/            # PrismaService singleton
```

### Frontend (React)

```
src/
├── api/               # Axios instance + one file per feature (products.api.js, etc.)
├── components/
│   ├── layout/        # AppLayout, Sidebar, TopBar
│   ├── ui/            # Button, Badge, Table, Drawer, StatCard, etc.
│   └── forms/         # ProductForm, OrderForm, AdjustmentForm, UserForm
├── context/           # AuthContext — global user state and role
├── hooks/             # useAuth, useToast
├── pages/             # One folder per feature, each with list + detail pages
├── router/            # AppRouter with protected route wrapper
└── utils/             # formatters.js, permissions.js
```

---

## API Reference

### Auth

| Method | Endpoint      | Access            |
| ------ | ------------- | ----------------- |
| POST   | `/auth/login` | Public            |
| GET    | `/auth/me`    | All authenticated |

### Products

| Method | Endpoint        | Access                    |
| ------ | --------------- | ------------------------- |
| GET    | `/products`     | ADMIN, SALES, STOREKEEPER |
| POST   | `/products`     | ADMIN                     |
| PATCH  | `/products/:id` | ADMIN                     |
| DELETE | `/products/:id` | ADMIN                     |

### Orders

| Method | Endpoint             | Access                    |
| ------ | -------------------- | ------------------------- |
| GET    | `/orders`            | ADMIN, SALES, STOREKEEPER |
| POST   | `/orders`            | ADMIN, SALES              |
| PATCH  | `/orders/:id/status` | ADMIN, STOREKEEPER        |

### Inventory

| Method | Endpoint            | Access             |
| ------ | ------------------- | ------------------ |
| GET    | `/inventory`        | ADMIN, STOREKEEPER |
| POST   | `/inventory/adjust` | ADMIN, STOREKEEPER |

### Invoices

| Method | Endpoint             | Access            |
| ------ | -------------------- | ----------------- |
| GET    | `/invoices`          | ADMIN, ACCOUNTANT |
| PATCH  | `/invoices/:id/pay`  | ADMIN, ACCOUNTANT |
| PATCH  | `/invoices/:id/void` | ADMIN             |

### Reports & Dashboard

| Method | Endpoint             | Access            |
| ------ | -------------------- | ----------------- |
| GET    | `/dashboard`         | All authenticated |
| GET    | `/reports/sales`     | ADMIN, ACCOUNTANT |
| GET    | `/reports/profit`    | ADMIN, ACCOUNTANT |
| GET    | `/reports/inventory` | ADMIN, ACCOUNTANT |

---

## Security

- **Password hashing** — all passwords are hashed with `bcrypt` (salt rounds: 10) before being stored. Plain-text passwords are never persisted.
- **JWT expiration** — tokens expire after 8 hours. The frontend detects `401` responses and redirects to login.
- **Role enforcement** — roles are validated in NestJS `RolesGuard` on every protected endpoint. A SALES user cannot call an ADMIN-only endpoint regardless of what the frontend does.
- **No sensitive fields in responses** — `password_hash` is never returned from any API endpoint.
- **Input validation** — all request bodies are validated with `class-validator` DTOs before reaching service logic.
- **Server-side trust** — prices, totals, and available stock are always computed on the server. The backend does not trust numeric values sent by the client for financial fields.

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend

```bash
# Clone the repo
git clone https://github.com/your-username/stockflow-erp.git
cd stockflow-erp/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Run database migrations
npx prisma migrate dev

# Seed initial data (roles, admin user, default warehouse)
npx prisma db seed

# Start the server
npm run start:dev
```

**Default admin credentials after seeding:**

```
Email:    admin@erp.com
Password: Admin@123
```

### Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000

# Start the dev server
npm run dev
```

### Environment Variables

**Backend `.env`**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/erp_db"
JWT_SECRET="your-secret-key-minimum-32-characters"
JWT_EXPIRATION="8h"
DEFAULT_WAREHOUSE_ID=1
```

**Frontend `.env`**

```env
VITE_API_URL="http://localhost:3000"
```

---

## Roles & Permissions

| Permission              | ADMIN | ACCOUNTANT | SALES | STOREKEEPER |
| ----------------------- | :---: | :--------: | :---: | :---------: |
| View dashboard          |   ✓   |     ✓      |   ✓   |      ✓      |
| Manage users            |   ✓   |            |       |             |
| Create/view products    |   ✓   |            |   ✓   |      ✓      |
| Create sale orders      |   ✓   |            |   ✓   |             |
| Complete/cancel orders  |   ✓   |            |       |      ✓      |
| View & adjust inventory |   ✓   |            |       |      ✓      |
| View invoices           |   ✓   |     ✓      |       |             |
| Mark invoices paid/void |   ✓   |     ✓      |       |             |
| View reports            |   ✓   |     ✓      |       |             |

---
