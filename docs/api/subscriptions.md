# Subscription Plans, Billing & Paystack Integration API

Public plan catalog, tenant subscription tier management (upgrade, downgrade, cancel, payment verification), and automated Paystack webhooks.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/subscriptions/:id`](#get-a-single-subscription-plan-by-id-public-) | Get a single subscription plan by ID (public) |
| `GET` | [`/v1/subscriptions`](#browse-all-active-subscription-plans-public-) | Browse all active subscription plans (public) |
| `GET` | [`/v1/tenant/subscription/current`](#get-current-subscription-details-and-plan) | Get current subscription details and plan |
| `GET` | [`/v1/tenant/subscription/plans`](#browse-available-subscription-plans) | Browse available subscription plans |
| `GET` | [`/v1/tenant/subscription/history`](#get-subscription-change-history-paginated-) | Get subscription change history (paginated) |
| `POST` | [`/v1/tenant/subscription/upgrade`](#initiate-a-subscription-upgrade-creates-paystack-payment-) | Initiate a subscription upgrade (creates Paystack payment) |
| `POST` | [`/v1/tenant/subscription/downgrade`](#downgrade-to-a-lower-priced-plan-takes-effect-immediately-) | Downgrade to a lower-priced plan (takes effect immediately) |
| `POST` | [`/v1/tenant/subscription/cancel`](#cancel-subscription-data-preserved-access-ends-at-period-close-) | Cancel subscription (data preserved, access ends at period close) |
| `POST` | [`/v1/tenant/subscription/verify`](#verify-a-subscription-payment-by-paystack-reference-fallback-if-webhook-fails-) | Verify a subscription payment by Paystack reference (fallback if webhook fails) |
| `POST` | [`/v1/webhook/paystack`](#paystack-webhook-endpoint) | Paystack webhook endpoint |

---

## Endpoints

### Get a single subscription plan by ID (public)

`GET /v1/subscriptions/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Browse all active subscription plans (public)

`GET /v1/subscriptions?page=1&limit=10&isActive=true`

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

### Get current subscription details and plan

`GET /v1/tenant/subscription/current`

**Responses**

#### `200 OK`

---

### Browse available subscription plans

`GET /v1/tenant/subscription/plans`

**Responses**

#### `200 OK`

---

### Get subscription change history (paginated)

`GET /v1/tenant/subscription/history?page=1&limit=20`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `1` | Filter / pagination param |
| `limit` | `20` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Initiate a subscription upgrade (creates Paystack payment)

`POST /v1/tenant/subscription/upgrade`

**Request Body** (`application/json`)

```json
{
  "planId": "string",
  "billingCycle": "monthly"
}
```

**Responses**

#### `201 Created`

---

### Downgrade to a lower-priced plan (takes effect immediately)

`POST /v1/tenant/subscription/downgrade`

**Request Body** (`application/json`)

```json
{
  "planId": "string"
}
```

**Responses**

#### `201 Created`

---

### Cancel subscription (data preserved, access ends at period close)

`POST /v1/tenant/subscription/cancel`

**Responses**

#### `201 Created`

---

### Verify a subscription payment by Paystack reference (fallback if webhook fails)

`POST /v1/tenant/subscription/verify`

**Request Body** (`application/json`)

```json
{
  "reference": "abc123xyz"
}
```

**Responses**

#### `201 Created`

---

### Paystack webhook endpoint

`POST /v1/webhook/paystack`

**Responses**

#### `200 OK`

---

