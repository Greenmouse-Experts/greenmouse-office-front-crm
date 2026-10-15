# Sales Pipeline, Leads, Deals, Quotes & Orders API

Lead capture and qualification, visual Kanban deal pipelines, stage reordering, quote generation, sales order fulfillment, and status tracking.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/orders/stats`](#get-order-statistics-by-status) | Get order statistics by status |
| `PATCH` | [`/v1/orders/:id/status`](#update-order-status) | Update order status |
| `GET` | [`/v1/orders/:id`](#get-an-order-by-id-with-full-item-details) | Get an order by ID with full item details |
| `PATCH` | [`/v1/orders/:id`](#update-an-order) | Update an order |
| `DELETE` | [`/v1/orders/:id`](#cancel-delete-an-order) | Cancel / delete an order |
| `POST` | [`/v1/orders`](#create-a-new-order) | Create a new order |
| `GET` | [`/v1/orders`](#list-all-orders) | List all orders |
| `PATCH` | [`/v1/pipelines/:id/stages/:stageId`](#update-a-pipeline-stage) | Update a pipeline stage |
| `DELETE` | [`/v1/pipelines/:id/stages/:stageId`](#delete-a-pipeline-stage) | Delete a pipeline stage |
| `PATCH` | [`/v1/pipelines/:id/stages/reorder`](#reorder-pipeline-stages) | Reorder pipeline stages |
| `POST` | [`/v1/pipelines/:id/stages`](#add-a-stage-to-a-pipeline) | Add a stage to a pipeline |
| `GET` | [`/v1/pipelines/:id`](#get-a-pipeline-with-stages) | Get a pipeline with stages |
| `PATCH` | [`/v1/pipelines/:id`](#update-a-pipeline) | Update a pipeline |
| `DELETE` | [`/v1/pipelines/:id`](#delete-a-pipeline) | Delete a pipeline |
| `POST` | [`/v1/pipelines`](#create-a-new-pipeline) | Create a new pipeline |
| `GET` | [`/v1/pipelines`](#list-all-pipelines) | List all pipelines |
| `GET` | [`/v1/quotes/stats`](#get-quote-statistics-by-status) | Get quote statistics by status |
| `PATCH` | [`/v1/quotes/:id/status`](#update-quote-status) | Update quote status |
| `POST` | [`/v1/quotes/:id/convert`](#convert-a-quote-to-an-invoice-or-an-order) | Convert a quote to an invoice or an order |
| `GET` | [`/v1/quotes/:id`](#get-a-quote-by-id) | Get a quote by ID |
| `PATCH` | [`/v1/quotes/:id`](#update-a-quote) | Update a quote |
| `DELETE` | [`/v1/quotes/:id`](#delete-a-quote) | Delete a quote |
| `POST` | [`/v1/quotes`](#create-a-new-quote) | Create a new quote |
| `GET` | [`/v1/quotes`](#list-all-quotes) | List all quotes |
| `GET` | [`/v1/leads/export`](#export-leads-to-csv-streamed-download-mirrors-list-filters-) | Export leads to CSV (streamed download, mirrors list filters) |
| `POST` | [`/v1/leads/:id/convert`](#convert-a-lead-to-a-customer-and-optionally-a-deal-) | Convert a lead to a customer (and optionally a deal) |
| `GET` | [`/v1/leads/:id`](#get-a-lead-by-id) | Get a lead by ID |
| `PATCH` | [`/v1/leads/:id`](#update-a-lead) | Update a lead |
| `DELETE` | [`/v1/leads/:id`](#delete-a-lead) | Delete a lead |
| `POST` | [`/v1/leads/import/async`](#bulk-import-leads-from-a-large-csv-async-up-to-100mb-partial-success-sse-progress-) | Bulk import leads from a large CSV (async, up to 100MB, partial success, SSE progress) |
| `POST` | [`/v1/leads/import`](#bulk-import-leads-from-csv-sync-2mb-1000-rows-all-or-nothing-) | Bulk import leads from CSV (sync, ≤2MB / 1000 rows, all-or-nothing) |
| `POST` | [`/v1/leads`](#create-a-new-lead) | Create a new lead |
| `GET` | [`/v1/leads`](#list-all-leads) | List all leads |
| `GET` | [`/v1/deals/kanban/list`](#get-kanban-view-for-a-pipeline) | Get kanban view for a pipeline |
| `PATCH` | [`/v1/deals/:id/stage`](#move-deal-to-a-different-stage-kanban-drag-drop-) | Move deal to a different stage (kanban drag-drop) |
| `POST` | [`/v1/deals/:id/mark-won`](#mark-deal-as-won) | Mark deal as won |
| `POST` | [`/v1/deals/:id/mark-lost`](#mark-deal-as-lost) | Mark deal as lost |
| `GET` | [`/v1/deals/:id`](#get-a-deal-by-id) | Get a deal by ID |
| `PATCH` | [`/v1/deals/:id`](#update-a-deal) | Update a deal |
| `DELETE` | [`/v1/deals/:id`](#delete-a-deal) | Delete a deal |
| `POST` | [`/v1/deals`](#create-a-new-deal) | Create a new deal |
| `GET` | [`/v1/deals`](#list-all-deals) | List all deals |

---

## Endpoints

### Get order statistics by status

`GET /v1/orders/stats`

**Responses**

#### `200 OK`

---

### Update order status

`PATCH /v1/orders/:id/status`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "status": "shipped"
}
```

**Responses**

#### `200 OK`

---

### Get an order by ID with full item details

`GET /v1/orders/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update an order

`PATCH /v1/orders/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "contactId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "quoteId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "items": [
    {
      "productId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
      "qty": 2,
      "unitPrice": 15000
    },
    {
      "productId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
      "qty": 2,
      "unitPrice": 15000
    }
  ],
  "discount": 500,
  "tax": 750,
  "currency": "NGN",
  "status": "pending",
  "paymentStatus": "unpaid",
  "assignedTo": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "notes": "Deliver before end of month."
}
```

**Responses**

#### `200 OK`

---

### Cancel / delete an order

`DELETE /v1/orders/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a new order

`POST /v1/orders`

**Request Body** (`application/json`)

```json
{
  "items": [
    {
      "productId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
      "qty": 2,
      "unitPrice": 15000
    },
    {
      "productId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
      "qty": 2,
      "unitPrice": 15000
    }
  ],
  "contactId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "quoteId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "discount": 500,
  "tax": 750,
  "currency": "NGN",
  "status": "pending",
  "paymentStatus": "unpaid",
  "assignedTo": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "notes": "Deliver before end of month."
}
```

**Responses**

#### `201 Created`

---

### List all orders

`GET /v1/orders?search=string&status=cancelled`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `status` | `cancelled` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Update a pipeline stage

`PATCH /v1/pipelines/:id/stages/:stageId`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |
| `stageId` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Proposal Sent",
  "color": "#F59E0B",
  "isWon": false,
  "isLost": false
}
```

**Responses**

#### `200 OK`

---

### Delete a pipeline stage

`DELETE /v1/pipelines/:id/stages/:stageId`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |
| `stageId` | Resource identifier |

**Responses**

#### `200 OK`

---

### Reorder pipeline stages

`PATCH /v1/pipelines/:id/stages/reorder`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "stageIds": [
    "uuid-3",
    "uuid-1",
    "uuid-2"
  ]
}
```

**Responses**

#### `200 OK`

---

### Add a stage to a pipeline

`POST /v1/pipelines/:id/stages`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Qualified",
  "color": "#3B82F6",
  "isWon": false,
  "isLost": false
}
```

**Responses**

#### `201 Created`

---

### Get a pipeline with stages

`GET /v1/pipelines/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a pipeline

`PATCH /v1/pipelines/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Updated Pipeline",
  "description": "Updated description",
  "isActive": true
}
```

**Responses**

#### `200 OK`

---

### Delete a pipeline

`DELETE /v1/pipelines/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a new pipeline

`POST /v1/pipelines`

**Request Body** (`application/json`)

```json
{
  "name": "Enterprise Sales",
  "description": "High-value enterprise deals"
}
```

**Responses**

#### `201 Created`

---

### List all pipelines

`GET /v1/pipelines`

**Responses**

#### `200 OK`

---

### Get quote statistics by status

`GET /v1/quotes/stats`

**Responses**

#### `200 OK`

---

### Update quote status

`PATCH /v1/quotes/:id/status`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Convert a quote to an invoice or an order

`POST /v1/quotes/:id/convert`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "target": "invoice",
  "contactId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "currency": "NGN",
  "discount": 0,
  "tax": 0,
  "issuedDate": "2026-09-23",
  "dueDate": "2026-10-23",
  "notes": "Deliver before end of month.",
  "assignedTo": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "items": [
    "string",
    "string"
  ]
}
```

**Responses**

#### `201 Created`

---

### Get a quote by ID

`GET /v1/quotes/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a quote

`PATCH /v1/quotes/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "date": "2026-06-15",
  "clientName": "Acme Corp",
  "amount": 150000,
  "description": "Website redesign and SEO optimization",
  "status": "pending"
}
```

**Responses**

#### `200 OK`

---

### Delete a quote

`DELETE /v1/quotes/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a new quote

`POST /v1/quotes`

**Request Body** (`application/json`)

```json
{
  "date": "2026-06-15",
  "clientName": "Acme Corp",
  "amount": 150000,
  "description": "Website redesign and SEO optimization",
  "status": "pending"
}
```

**Responses**

#### `201 Created`

---

### List all quotes

`GET /v1/quotes?search=string&status=pending`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Search by client name |
| `status` | `pending` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Export leads to CSV (streamed download, mirrors list filters)

`GET /v1/leads/export?status=string&source=string&assignedTo=string&search=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `status` | `string` | Filter / pagination param |
| `source` | `string` | Filter / pagination param |
| `assignedTo` | `string` | Filter / pagination param |
| `search` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Convert a lead to a customer (and optionally a deal)

`POST /v1/leads/:id/convert`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "createDeal": true,
  "pipelineId": "uuid-of-pipeline",
  "stageId": "uuid-of-stage",
  "initialValue": 50000
}
```

**Responses**

#### `201 Created`

---

### Get a lead by ID

`GET /v1/leads/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a lead

`PATCH /v1/leads/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@acme.com",
  "phone": "+2348012345678",
  "companyName": "Acme Corp",
  "source": "other",
  "status": "contacted",
  "score": 75,
  "notes": "Updated notes",
  "assignedTo": "uuid-of-staff"
}
```

**Responses**

#### `200 OK`

---

### Delete a lead

`DELETE /v1/leads/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Bulk import leads from a large CSV (async, up to 100MB, partial success, SSE progress)

`POST /v1/leads/import/async`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Responses**

#### `201 Created`

---

### Bulk import leads from CSV (sync, ≤2MB / 1000 rows, all-or-nothing)

`POST /v1/leads/import`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Responses**

#### `201 Created`

---

### Create a new lead

`POST /v1/leads`

**Request Body** (`application/json`)

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@acme.com",
  "phone": "+2348012345678",
  "companyName": "Acme Corp",
  "source": "website",
  "status": "new",
  "score": 75,
  "notes": "Interested in enterprise plan",
  "assignedTo": "uuid-of-staff"
}
```

**Responses**

#### `201 Created`

---

### List all leads

`GET /v1/leads?status=qualified&source=referral&assignedTo=string&search=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `status` | `qualified` | Filter / pagination param |
| `source` | `referral` | Filter / pagination param |
| `assignedTo` | `string` | Filter / pagination param |
| `search` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get kanban view for a pipeline

`GET /v1/deals/kanban/list?pipelineId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Move deal to a different stage (kanban drag-drop)

`PATCH /v1/deals/:id/stage`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "stageId": "uuid-of-stage"
}
```

**Responses**

#### `200 OK`

---

### Mark deal as won

`POST /v1/deals/:id/mark-won`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `201 Created`

---

### Mark deal as lost

`POST /v1/deals/:id/mark-lost`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `201 Created`

---

### Get a deal by ID

`GET /v1/deals/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a deal

`PATCH /v1/deals/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Acme Q4 Deal v2",
  "value": 75000,
  "currency": "NGN",
  "expectedCloseDate": "2026-12-31",
  "status": "lost",
  "notes": "Updated notes",
  "assignedTo": "uuid-of-staff",
  "stageId": "uuid-of-stage",
  "pipelineId": "uuid-of-pipeline"
}
```

**Responses**

#### `200 OK`

---

### Delete a deal

`DELETE /v1/deals/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a new deal

`POST /v1/deals`

**Request Body** (`application/json`)

```json
{
  "name": "Acme Q4 Deal",
  "pipelineId": "uuid-of-pipeline",
  "stageId": "uuid-of-stage",
  "leadId": "uuid-of-lead",
  "contactId": "uuid-of-contact",
  "value": 50000,
  "currency": "NGN",
  "expectedCloseDate": "2026-12-31",
  "status": "open",
  "notes": "High priority deal",
  "assignedTo": "uuid-of-staff"
}
```

**Responses**

#### `201 Created`

---

### List all deals

`GET /v1/deals?pipelineId=string&stageId=string&status=on_hold&assignedTo=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |
| `stageId` | `string` | Filter / pagination param |
| `status` | `on_hold` | Filter / pagination param |
| `assignedTo` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

