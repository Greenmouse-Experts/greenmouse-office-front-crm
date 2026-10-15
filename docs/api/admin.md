# Super Admin Platform Management API

Super admin initial setup, administrator profile, RBAC permission dictionary, cross-tenant management, tenant status toggle, subscription plan authoring, and platform oversight.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/admins/staff/:id`](#get-a-staff-member-by-id-cross-tenant-) | Get a staff member by ID (cross-tenant) |
| `GET` | [`/v1/admins/staff`](#list-all-staff-across-all-tenants) | List all staff across all tenants |
| `PATCH` | [`/v1/admins/roles/:id/permissions`](#update-permissions-on-an-admin-role-super-only-) | Update permissions on an admin role (super-only) |
| `GET` | [`/v1/admins/roles/:id`](#get-a-role-by-id-cross-tenant-) | Get a role by ID (cross-tenant) |
| `DELETE` | [`/v1/admins/roles/:id`](#delete-an-admin-role-super-only-) | Delete an admin role (super-only) |
| `GET` | [`/v1/admins/roles`](#list-all-admin-roles-super-only-) | List all admin roles (super-only) |
| `POST` | [`/v1/admins/roles`](#create-a-new-admin-role-super-only-) | Create a new admin role (super-only) |
| `GET` | [`/v1/admins/companies/:id`](#get-a-company-by-id-cross-tenant-) | Get a company by ID (cross-tenant) |
| `GET` | [`/v1/admins/companies`](#list-all-companies-across-all-tenants) | List all companies across all tenants |
| `GET` | [`/v1/admins/import/jobs/:id`](#get-an-import-job-by-id-cross-tenant-) | Get an import job by ID (cross-tenant) |
| `GET` | [`/v1/admins/import/jobs`](#list-import-jobs-across-all-tenants) | List import jobs across all tenants |
| `GET` | [`/v1/admins/subscriptions/features`](#list-all-available-subscription-features) | List all available subscription features |
| `GET` | [`/v1/admins/subscriptions/:id`](#get-a-single-subscription-plan) | Get a single subscription plan |
| `PATCH` | [`/v1/admins/subscriptions/:id`](#update-a-subscription-plan) | Update a subscription plan |
| `DELETE` | [`/v1/admins/subscriptions/:id`](#delete-a-subscription-plan) | Delete a subscription plan |
| `POST` | [`/v1/admins/subscriptions`](#create-a-new-subscription-plan) | Create a new subscription plan |
| `GET` | [`/v1/admins/subscriptions`](#list-all-subscription-plans-admin-view-includes-inactive-with-pagination) | List all subscription plans (admin view, includes inactive) with pagination |
| `GET` | [`/v1/admins/notifications/unread-count`](#get-unread-notification-count-for-a-tenant) | Get unread notification count for a tenant |
| `GET` | [`/v1/admins/notifications`](#list-notifications-for-a-tenant-cross-tenant-) | List notifications for a tenant (cross-tenant) |
| `GET` | [`/v1/admins/contacts/:id`](#get-a-contact-by-id-cross-tenant-) | Get a contact by ID (cross-tenant) |
| `GET` | [`/v1/admins/contacts`](#list-all-contacts-across-all-tenants) | List all contacts across all tenants |
| `GET` | [`/v1/admins/categories/:id`](#get-a-category-by-id-cross-tenant-) | Get a category by ID (cross-tenant) |
| `GET` | [`/v1/admins/categories`](#list-all-categories-across-all-tenants) | List all categories across all tenants |
| `GET` | [`/v1/admins/income/:id`](#get-an-income-record-by-id-cross-tenant-) | Get an income record by ID (cross-tenant) |
| `GET` | [`/v1/admins/income`](#list-all-income-records-across-all-tenants) | List all income records across all tenants |
| `GET` | [`/v1/admins/expenses/:id`](#get-an-expense-record-by-id-cross-tenant-) | Get an expense record by ID (cross-tenant) |
| `GET` | [`/v1/admins/expenses`](#list-all-expense-records-across-all-tenants) | List all expense records across all tenants |
| `GET` | [`/v1/admins/invoices/stats`](#aggregate-invoice-stats-across-all-tenants) | Aggregate invoice stats across all tenants |
| `GET` | [`/v1/admins/invoices/branding`](#get-invoice-branding-config-cross-tenant-) | Get invoice branding config (cross-tenant) |
| `GET` | [`/v1/admins/invoices/:id/html`](#render-invoice-as-html-cross-tenant-) | Render invoice as HTML (cross-tenant) |
| `GET` | [`/v1/admins/invoices/:id/pdf`](#render-invoice-as-pdf-cross-tenant-) | Render invoice as PDF (cross-tenant) |
| `GET` | [`/v1/admins/invoices/:id/receipts`](#list-all-receipts-for-an-invoice-cross-tenant-) | List all receipts for an invoice (cross-tenant) |
| `GET` | [`/v1/admins/invoices/:id/payments`](#list-payment-ledger-for-an-invoice-cross-tenant-) | List payment ledger for an invoice (cross-tenant) |
| `GET` | [`/v1/admins/invoices/:id`](#get-an-invoice-by-id-cross-tenant-) | Get an invoice by ID (cross-tenant) |
| `GET` | [`/v1/admins/invoices`](#list-all-invoices-across-all-tenants) | List all invoices across all tenants |
| `GET` | [`/v1/admins/receipts/:id/html`](#render-receipt-as-html-cross-tenant-) | Render receipt as HTML (cross-tenant) |
| `GET` | [`/v1/admins/receipts/:id/pdf`](#render-receipt-as-pdf-cross-tenant-) | Render receipt as PDF (cross-tenant) |
| `GET` | [`/v1/admins/receipts/:id`](#get-a-receipt-by-id-cross-tenant-) | Get a receipt by ID (cross-tenant) |
| `GET` | [`/v1/admins/orders/stats`](#aggregate-order-stats-across-all-tenants) | Aggregate order stats across all tenants |
| `GET` | [`/v1/admins/orders/:id`](#get-an-order-by-id-cross-tenant-) | Get an order by ID (cross-tenant) |
| `GET` | [`/v1/admins/orders`](#list-all-orders-across-all-tenants) | List all orders across all tenants |
| `GET` | [`/v1/admins/products/:id`](#get-a-product-by-id-cross-tenant-) | Get a product by ID (cross-tenant) |
| `GET` | [`/v1/admins/products`](#list-all-products-across-all-tenants) | List all products across all tenants |
| `GET` | [`/v1/admins/services/:id`](#get-a-service-by-id-cross-tenant-) | Get a service by ID (cross-tenant) |
| `GET` | [`/v1/admins/services`](#list-all-services-across-all-tenants) | List all services across all tenants |
| `GET` | [`/v1/admins/dashboard/stats`](#dashboard-stats-for-a-specific-tenant) | Dashboard stats for a specific tenant |
| `GET` | [`/v1/admins/dashboard/income-expense`](#income-vs-expense-chart-for-a-specific-tenant) | Income vs expense chart for a specific tenant |
| `GET` | [`/v1/admins/dashboard/balance`](#account-balance-for-a-specific-tenant) | Account balance for a specific tenant |
| `GET` | [`/v1/admins/dashboard/profit`](#profit-chart-for-a-specific-tenant) | Profit chart for a specific tenant |
| `GET` | [`/v1/admins/dashboard/user-analytics`](#user-analytics-for-a-specific-tenant) | User analytics for a specific tenant |
| `GET` | [`/v1/admins/pipelines/:id`](#get-a-pipeline-by-id-cross-tenant-) | Get a pipeline by ID (cross-tenant) |
| `GET` | [`/v1/admins/pipelines`](#list-all-pipelines-across-all-tenants) | List all pipelines across all tenants |
| `GET` | [`/v1/admins/tenants/stats`](#tenant-statistics-total-active-suspended-trial-) | Tenant statistics (total, active, suspended, trial) |
| `GET` | [`/v1/admins/tenants/:id/history`](#get-tenant-subscription-change-history) | Get tenant subscription change history |
| `GET` | [`/v1/admins/tenants/:id/login-activity`](#get-tenant-login-activity) | Get tenant login activity |
| `GET` | [`/v1/admins/tenants/:id/onboarding`](#get-tenant-onboarding-status) | Get tenant onboarding status |
| `GET` | [`/v1/admins/tenants/:id/reminders`](#get-tenant-reminder-preferences) | Get tenant reminder preferences |
| `PATCH` | [`/v1/admins/tenants/:id/status`](#activate-or-suspend-a-tenant) | Activate or suspend a tenant |
| `PATCH` | [`/v1/admins/tenants/:id/subscription`](#assign-or-upgrade-a-tenant-subscription-plan) | Assign or upgrade a tenant subscription plan |
| `POST` | [`/v1/admins/tenants/:id/verify-payment`](#verify-a-subscription-payment-by-paystack-reference-for-a-tenant-fallback-if-webhook-fails-) | Verify a subscription payment by Paystack reference for a tenant (fallback if webhook fails) |
| `GET` | [`/v1/admins/tenants/:id`](#get-a-single-tenant) | Get a single tenant |
| `GET` | [`/v1/admins/tenants`](#list-all-tenants) | List all tenants |
| `GET` | [`/v1/admins/overview/revenue-trend`](#monthly-contracted-mrr-movement-added-vs-lost-cached-10-min-not-collected-cash-) | Monthly contracted MRR movement: added vs lost (cached 10 min; not collected cash) |
| `GET` | [`/v1/admins/overview/plan-distribution`](#tenants-per-subscription-plan-cached-5-min-) | Tenants per subscription plan (cached 5 min) |
| `GET` | [`/v1/admins/overview/trial-funnel`](#trial-started-converted-expired-conversion-rate-cached-5-min-) | Trial started/converted/expired + conversion rate (cached 5 min) |
| `GET` | [`/v1/admins/overview/engagement`](#tenant-login-activity-dormant-tenants-onboarding-progress-cached-5-min-) | Tenant login activity, dormant tenants, onboarding progress (cached 5 min) |
| `GET` | [`/v1/admins/overview`](#platform-summary-mrr-estimate-tenant-counts-trials-expiring-churn-cached-5-min-) | Platform summary: MRR estimate, tenant counts, trials expiring, churn (cached 5 min) |
| `GET` | [`/v1/admins/tickets/:id`](#get-a-ticket-by-id-cross-tenant-) | Get a ticket by ID (cross-tenant) |
| `GET` | [`/v1/admins/tickets`](#list-all-tickets-across-all-tenants) | List all tickets across all tenants |
| `GET` | [`/v1/admins/quotes/stats`](#aggregate-quote-stats-across-all-tenants) | Aggregate quote stats across all tenants |
| `GET` | [`/v1/admins/quotes/:id`](#get-a-quote-by-id-cross-tenant-) | Get a quote by ID (cross-tenant) |
| `GET` | [`/v1/admins/quotes`](#list-all-quotes-across-all-tenants) | List all quotes across all tenants |
| `GET` | [`/v1/admins/leads/:id`](#get-a-lead-by-id-cross-tenant-) | Get a lead by ID (cross-tenant) |
| `GET` | [`/v1/admins/leads`](#list-all-leads-across-all-tenants) | List all leads across all tenants |
| `GET` | [`/v1/admins/deals/kanban`](#kanban-view-for-a-pipeline-cross-tenant-) | Kanban view for a pipeline (cross-tenant) |
| `GET` | [`/v1/admins/deals/:id/stage-history`](#get-deal-stage-history) | Get deal stage history |
| `GET` | [`/v1/admins/deals/:id`](#get-a-deal-by-id-cross-tenant-) | Get a deal by ID (cross-tenant) |
| `GET` | [`/v1/admins/deals`](#list-all-deals-across-all-tenants) | List all deals across all tenants |
| `GET` | [`/v1/admins/reports/pipeline-funnel`](#pipeline-funnel-report-for-a-specific-tenant) | Pipeline funnel report for a specific tenant |
| `GET` | [`/v1/admins/reports/win-rate`](#win-rate-report-for-a-specific-tenant) | Win rate report for a specific tenant |
| `GET` | [`/v1/admins/reports/avg-deal`](#average-deal-value-for-a-specific-tenant) | Average deal value for a specific tenant |
| `GET` | [`/v1/admins/reports/cycle-time`](#average-cycle-time-for-a-specific-tenant) | Average cycle time for a specific tenant |
| `GET` | [`/v1/admins/reports/revenue-trend`](#revenue-trend-for-a-specific-tenant) | Revenue trend for a specific tenant |
| `GET` | [`/v1/admins/reports/stage-dwell`](#average-time-per-pipeline-stage-for-a-specific-tenant) | Average time per pipeline stage for a specific tenant |
| `POST` | [`/v1/admins/setup`](#create-the-first-super-admin-account-one-time-only-) | Create the first super admin account (one-time only) |
| `GET` | [`/v1/admins/profile`](#get-own-admin-profile) | Get own admin profile |
| `PATCH` | [`/v1/admins/profile`](#update-own-admin-profile) | Update own admin profile |
| `PATCH` | [`/v1/admins/change-password`](#change-own-admin-password) | Change own admin password |
| `GET` | [`/v1/admins/permissions`](#list-all-available-admin-permissions) | List all available admin permissions |
| `GET` | [`/v1/admins/:id`](#get-admin-detail-by-id-super-only-) | Get admin detail by ID (super-only) |
| `PATCH` | [`/v1/admins/:id`](#update-admin-account-role-status-profile-super-only-) | Update admin account — role, status, profile (super-only) |
| `DELETE` | [`/v1/admins/:id`](#delete-an-admin-account-super-only-) | Delete an admin account (super-only) |
| `GET` | [`/v1/admins`](#list-all-admin-accounts-super-only-) | List all admin accounts (super-only) |
| `POST` | [`/v1/admins`](#create-a-new-admin-account-super-only-) | Create a new admin account (super-only) |

---

## Endpoints

### Get a staff member by ID (cross-tenant)

`GET /v1/admins/staff/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all staff across all tenants

`GET /v1/admins/staff`

**Responses**

#### `200 OK`

---

### Update permissions on an admin role (super-only)

`PATCH /v1/admins/roles/:id/permissions`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "permissions": [
    "platform:read",
    "tenants:view",
    "tenants:suspend"
  ]
}
```

**Responses**

#### `200 OK`

---

### Get a role by ID (cross-tenant)

`GET /v1/admins/roles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Delete an admin role (super-only)

`DELETE /v1/admins/roles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all admin roles (super-only)

`GET /v1/admins/roles`

**Responses**

#### `200 OK`

---

### Create a new admin role (super-only)

`POST /v1/admins/roles`

**Request Body** (`application/json`)

```json
{
  "name": "support",
  "permissions": [
    "platform:read",
    "tenants:view"
  ],
  "description": "Read-only support access"
}
```

**Responses**

#### `201 Created`

---

### Get a company by ID (cross-tenant)

`GET /v1/admins/companies/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all companies across all tenants

`GET /v1/admins/companies?search=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get an import job by ID (cross-tenant)

`GET /v1/admins/import/jobs/:id?tenantId=string`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### List import jobs across all tenants

`GET /v1/admins/import/jobs?tenantId=string&limit=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |
| `limit` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### List all available subscription features

`GET /v1/admins/subscriptions/features`

**Responses**

#### `200 OK`

---

### Get a single subscription plan

`GET /v1/admins/subscriptions/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a subscription plan

`PATCH /v1/admins/subscriptions/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Starter Plan",
  "description": "Perfect for small teams getting started",
  "priceMonthly": 15000,
  "priceYearly": 150000,
  "trialDays": 14,
  "maxStaff": 3,
  "maxContacts": 50,
  "maxProducts": 10,
  "maxServices": 5,
  "maxInvoicesPerMonth": 10,
  "maxOrdersPerMonth": 30,
  "maxCategories": 5,
  "maxLeads": 50,
  "maxCompanies": 10,
  "features": [
    "analytics",
    "data_export"
  ],
  "paystackPlanCodeMonthly": "PLN_abc123",
  "paystackPlanCodeYearly": "PLN_xyz456",
  "isCustomPrice": false,
  "isActive": true
}
```

**Responses**

#### `200 OK`

---

### Delete a subscription plan

`DELETE /v1/admins/subscriptions/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a new subscription plan

`POST /v1/admins/subscriptions`

**Request Body** (`application/json`)

```json
{
  "name": "Starter Plan",
  "description": "Perfect for small teams getting started",
  "priceMonthly": 15000,
  "priceYearly": 150000,
  "trialDays": 14,
  "maxStaff": 3,
  "maxContacts": 50,
  "maxProducts": 10,
  "maxServices": 5,
  "maxInvoicesPerMonth": 10,
  "maxOrdersPerMonth": 30,
  "maxCategories": 5,
  "maxLeads": 50,
  "maxCompanies": 10,
  "features": [
    "analytics",
    "data_export"
  ],
  "paystackPlanCodeMonthly": "PLN_abc123",
  "paystackPlanCodeYearly": "PLN_xyz456",
  "isCustomPrice": false,
  "isActive": true
}
```

**Responses**

#### `201 Created`

---

### List all subscription plans (admin view, includes inactive) with pagination

`GET /v1/admins/subscriptions?page=1&limit=10&isActive=true`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `1` | Page number (starts from 1) |
| `limit` | `10` | Number of items per page (default: 10, max: 100) |
| `isActive` | `true` | Filter by active status (optional) |

**Responses**

#### `200 OK`

```json
{
  "data": [
    [],
    []
  ],
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

### Get unread notification count for a tenant

`GET /v1/admins/notifications/unread-count?tenantId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### List notifications for a tenant (cross-tenant)

`GET /v1/admins/notifications?tenantId=string&page=5705.605456861728&limit=5705.605456861728&unreadOnly=false`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |
| `page` | `5705.605456861728` | Filter / pagination param |
| `limit` | `5705.605456861728` | Filter / pagination param |
| `unreadOnly` | `false` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get a contact by ID (cross-tenant)

`GET /v1/admins/contacts/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all contacts across all tenants

`GET /v1/admins/contacts`

**Responses**

#### `200 OK`

---

### Get a category by ID (cross-tenant)

`GET /v1/admins/categories/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all categories across all tenants

`GET /v1/admins/categories`

**Responses**

#### `200 OK`

---

### Get an income record by ID (cross-tenant)

`GET /v1/admins/income/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all income records across all tenants

`GET /v1/admins/income`

**Responses**

#### `200 OK`

---

### Get an expense record by ID (cross-tenant)

`GET /v1/admins/expenses/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all expense records across all tenants

`GET /v1/admins/expenses`

**Responses**

#### `200 OK`

---

### Aggregate invoice stats across all tenants

`GET /v1/admins/invoices/stats`

**Responses**

#### `200 OK`

---

### Get invoice branding config (cross-tenant)

`GET /v1/admins/invoices/branding?tenantId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Render invoice as HTML (cross-tenant)

`GET /v1/admins/invoices/:id/html`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Render invoice as PDF (cross-tenant)

`GET /v1/admins/invoices/:id/pdf`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all receipts for an invoice (cross-tenant)

`GET /v1/admins/invoices/:id/receipts`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List payment ledger for an invoice (cross-tenant)

`GET /v1/admins/invoices/:id/payments`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Get an invoice by ID (cross-tenant)

`GET /v1/admins/invoices/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all invoices across all tenants

`GET /v1/admins/invoices?status=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `status` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Render receipt as HTML (cross-tenant)

`GET /v1/admins/receipts/:id/html`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Render receipt as PDF (cross-tenant)

`GET /v1/admins/receipts/:id/pdf`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Get a receipt by ID (cross-tenant)

`GET /v1/admins/receipts/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Aggregate order stats across all tenants

`GET /v1/admins/orders/stats`

**Responses**

#### `200 OK`

---

### Get an order by ID (cross-tenant)

`GET /v1/admins/orders/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all orders across all tenants

`GET /v1/admins/orders?status=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `status` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get a product by ID (cross-tenant)

`GET /v1/admins/products/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all products across all tenants

`GET /v1/admins/products?search=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get a service by ID (cross-tenant)

`GET /v1/admins/services/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all services across all tenants

`GET /v1/admins/services?search=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Dashboard stats for a specific tenant

`GET /v1/admins/dashboard/stats?tenantId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Income vs expense chart for a specific tenant

`GET /v1/admins/dashboard/income-expense?tenantId=string&year=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |
| `year` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Account balance for a specific tenant

`GET /v1/admins/dashboard/balance?tenantId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Profit chart for a specific tenant

`GET /v1/admins/dashboard/profit?tenantId=string&year=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |
| `year` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### User analytics for a specific tenant

`GET /v1/admins/dashboard/user-analytics?tenantId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get a pipeline by ID (cross-tenant)

`GET /v1/admins/pipelines/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all pipelines across all tenants

`GET /v1/admins/pipelines`

**Responses**

#### `200 OK`

---

### Tenant statistics (total, active, suspended, trial)

`GET /v1/admins/tenants/stats`

**Responses**

#### `200 OK`

---

### Get tenant subscription change history

`GET /v1/admins/tenants/:id/history?page=5705.605456861728&limit=5705.605456861728`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `5705.605456861728` | Filter / pagination param |
| `limit` | `5705.605456861728` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get tenant login activity

`GET /v1/admins/tenants/:id/login-activity?page=5705.605456861728&limit=5705.605456861728`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `5705.605456861728` | Filter / pagination param |
| `limit` | `5705.605456861728` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get tenant onboarding status

`GET /v1/admins/tenants/:id/onboarding`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Get tenant reminder preferences

`GET /v1/admins/tenants/:id/reminders`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Activate or suspend a tenant

`PATCH /v1/admins/tenants/:id/status`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Assign or upgrade a tenant subscription plan

`PATCH /v1/admins/tenants/:id/subscription`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "subscriptionPlanId": "110e8400-e29b-41d4-a716-446655440000",
  "billingCycle": "monthly"
}
```

**Responses**

#### `200 OK`

---

### Verify a subscription payment by Paystack reference for a tenant (fallback if webhook fails)

`POST /v1/admins/tenants/:id/verify-payment`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "reference": "abc123xyz"
}
```

**Responses**

#### `201 Created`

---

### Get a single tenant

`GET /v1/admins/tenants/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all tenants

`GET /v1/admins/tenants?search=string&subscriptionStatus=string&status=active`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `subscriptionStatus` | `string` | Filter / pagination param |
| `status` | `active` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Monthly contracted MRR movement: added vs lost (cached 10 min; not collected cash)

`GET /v1/admins/overview/revenue-trend?months=5705.605456861728`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `months` | `5705.605456861728` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Tenants per subscription plan (cached 5 min)

`GET /v1/admins/overview/plan-distribution`

**Responses**

#### `200 OK`

---

### Trial started/converted/expired + conversion rate (cached 5 min)

`GET /v1/admins/overview/trial-funnel?days=5705.605456861728`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `days` | `5705.605456861728` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Tenant login activity, dormant tenants, onboarding progress (cached 5 min)

`GET /v1/admins/overview/engagement`

**Responses**

#### `200 OK`

---

### Platform summary: MRR estimate, tenant counts, trials expiring, churn (cached 5 min)

`GET /v1/admins/overview`

**Responses**

#### `200 OK`

---

### Get a ticket by ID (cross-tenant)

`GET /v1/admins/tickets/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all tickets across all tenants

`GET /v1/admins/tickets`

**Responses**

#### `200 OK`

---

### Aggregate quote stats across all tenants

`GET /v1/admins/quotes/stats`

**Responses**

#### `200 OK`

---

### Get a quote by ID (cross-tenant)

`GET /v1/admins/quotes/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all quotes across all tenants

`GET /v1/admins/quotes?status=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `status` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get a lead by ID (cross-tenant)

`GET /v1/admins/leads/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all leads across all tenants

`GET /v1/admins/leads?search=string&status=string&source=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `status` | `string` | Filter / pagination param |
| `source` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Kanban view for a pipeline (cross-tenant)

`GET /v1/admins/deals/kanban?pipelineId=string&tenantId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |
| `tenantId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get deal stage history

`GET /v1/admins/deals/:id/stage-history`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Get a deal by ID (cross-tenant)

`GET /v1/admins/deals/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all deals across all tenants

`GET /v1/admins/deals`

**Responses**

#### `200 OK`

---

### Pipeline funnel report for a specific tenant

`GET /v1/admins/reports/pipeline-funnel?tenantId=string&pipelineId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |
| `pipelineId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Win rate report for a specific tenant

`GET /v1/admins/reports/win-rate?tenantId=string&pipelineId=string&year=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |
| `pipelineId` | `string` | Filter / pagination param |
| `year` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Average deal value for a specific tenant

`GET /v1/admins/reports/avg-deal?tenantId=string&pipelineId=string&year=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |
| `pipelineId` | `string` | Filter / pagination param |
| `year` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Average cycle time for a specific tenant

`GET /v1/admins/reports/cycle-time?tenantId=string&pipelineId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |
| `pipelineId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Revenue trend for a specific tenant

`GET /v1/admins/reports/revenue-trend?tenantId=string&year=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |
| `year` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Average time per pipeline stage for a specific tenant

`GET /v1/admins/reports/stage-dwell?tenantId=string&pipelineId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` | Filter / pagination param |
| `pipelineId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Create the first super admin account (one-time only)

`POST /v1/admins/setup`

**Request Body** (`application/json`)

```json
{
  "email": "admin@greenmouse.com",
  "password": "StrongPass123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+2348012345678"
}
```

**Responses**

#### `201 Created`

---

### Get own admin profile

`GET /v1/admins/profile`

**Responses**

#### `200 OK`

---

### Update own admin profile

`PATCH /v1/admins/profile`

**Request Body** (`application/json`)

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@greenmouse.com",
  "phoneNumber": "+2348012345678",
  "bio": "Super Admin / Team Manager",
  "profilePic": "https://res.cloudinary.com/...",
  "country": "Nigeria",
  "cityState": "Lagos, Ikeja",
  "postalCode": "100001",
  "taxId": "AS45645756"
}
```

**Responses**

#### `200 OK`

---

### Change own admin password

`PATCH /v1/admins/change-password`

**Request Body** (`application/json`)

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmNewPassword": "NewPass456"
}
```

**Responses**

#### `200 OK`

---

### List all available admin permissions

`GET /v1/admins/permissions`

**Responses**

#### `200 OK`

---

### Get admin detail by ID (super-only)

`GET /v1/admins/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update admin account — role, status, profile (super-only)

`PATCH /v1/admins/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "roleId": "string",
  "isActive": true,
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string"
}
```

**Responses**

#### `200 OK`

---

### Delete an admin account (super-only)

`DELETE /v1/admins/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all admin accounts (super-only)

`GET /v1/admins`

**Responses**

#### `200 OK`

---

### Create a new admin account (super-only)

`POST /v1/admins`

**Request Body** (`application/json`)

```json
{
  "email": "admin@example.com",
  "password": "Password@2022",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+2340000000000",
  "roleId": "string"
}
```

**Responses**

#### `201 Created`

---

