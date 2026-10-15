# Finance, Billing, Income, Expenses, Invoices & Receipts API

Revenue tracking, operating expense entries, status updates, invoice and receipt generation, custom HTML/PDF rendering, white-label branding, and payment reconciliation.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `PATCH` | [`/v1/income/:id/status`](#update-income-status) | Update income status |
| `GET` | [`/v1/income/:id`](#get-an-income-record-by-id) | Get an income record by ID |
| `PATCH` | [`/v1/income/:id`](#update-an-income-record) | Update an income record |
| `DELETE` | [`/v1/income/:id`](#delete-an-income-record) | Delete an income record |
| `POST` | [`/v1/income`](#create-an-income-record) | Create an income record |
| `GET` | [`/v1/income`](#get-all-income-records) | Get all income records |
| `PATCH` | [`/v1/expenses/:id/status`](#update-expense-status) | Update expense status |
| `GET` | [`/v1/expenses/:id`](#get-an-expense-record-by-id) | Get an expense record by ID |
| `PATCH` | [`/v1/expenses/:id`](#update-an-expense-record) | Update an expense record |
| `DELETE` | [`/v1/expenses/:id`](#delete-an-expense-record) | Delete an expense record |
| `POST` | [`/v1/expenses`](#create-an-expense-record) | Create an expense record |
| `GET` | [`/v1/expenses`](#get-all-expense-records) | Get all expense records |
| `GET` | [`/v1/invoices/stats`](#get-invoice-statistics-by-status) | Get invoice statistics by status |
| `GET` | [`/v1/invoices/branding`](#get-my-invoice-brand-settings-merged-over-defaults-) | Get my invoice brand settings (merged over defaults) |
| `PATCH` | [`/v1/invoices/branding`](#create-or-update-invoice-brand-settings-requires-invoice-branding-feature-) | Create or update invoice brand settings (requires invoice_branding feature) |
| `GET` | [`/v1/invoices/:id/html`](#render-invoice-as-html-branded-when-plan-has-invoice-branding-plain-greenmouse-template-otherwise-) | Render invoice as HTML (branded when plan has invoice_branding, plain Greenmouse template otherwise) |
| `GET` | [`/v1/invoices/:id/pdf`](#download-invoice-as-pdf-branded-when-plan-has-invoice-branding-) | Download invoice as PDF (branded when plan has invoice_branding) |
| `PATCH` | [`/v1/invoices/:id/send`](#mark-invoice-as-sent) | Mark invoice as sent |
| `PATCH` | [`/v1/invoices/:id/mark-paid`](#mark-invoice-as-paid-records-paidat-timestamp-) | Mark invoice as paid (records paidAt timestamp) |
| `PATCH` | [`/v1/invoices/:id/status`](#update-invoice-status) | Update invoice status |
| `POST` | [`/v1/invoices/:id/payments`](#record-a-payment-full-or-partial-and-auto-issue-a-receipt-rcp-yyyy-xxxxxx-) | Record a payment (full or partial) and auto-issue a receipt (RCP-YYYY-XXXXXX) |
| `GET` | [`/v1/invoices/:id/payments`](#list-payment-ledger-entries-for-an-invoice) | List payment ledger entries for an invoice |
| `GET` | [`/v1/invoices/:id/receipts`](#list-all-receipts-for-an-invoice) | List all receipts for an invoice |
| `GET` | [`/v1/invoices/:id`](#get-an-invoice-by-id) | Get an invoice by ID |
| `PATCH` | [`/v1/invoices/:id`](#update-a-draft-invoice) | Update a draft invoice |
| `DELETE` | [`/v1/invoices/:id`](#delete-an-invoice) | Delete an invoice |
| `POST` | [`/v1/invoices`](#create-a-new-invoice-invoice-number-auto-generated-) | Create a new invoice (invoice number auto-generated) |
| `GET` | [`/v1/invoices`](#list-all-invoices) | List all invoices |
| `GET` | [`/v1/receipts/:id/html`](#render-receipt-as-html-branded-when-entitled-) | Render receipt as HTML (branded when entitled) |
| `GET` | [`/v1/receipts/:id/pdf`](#download-receipt-as-pdf) | Download receipt as PDF |
| `POST` | [`/v1/receipts/:id/void`](#void-a-receipt-reverses-ledger-entry-recalcs-invoice-balance-) | Void a receipt (reverses ledger entry, recalcs invoice balance) |
| `POST` | [`/v1/receipts/:id/resend`](#re-send-an-issued-receipt-email-to-the-client-html-pdf-attachment-) | Re-send an issued receipt email to the client (HTML + PDF attachment) |
| `GET` | [`/v1/receipts/:id`](#get-a-receipt-by-id-with-payment-) | Get a receipt by ID (with payment) |

---

## Endpoints

### Update income status

`PATCH /v1/income/:id/status`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Get an income record by ID

`GET /v1/income/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update an income record

`PATCH /v1/income/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "amount": 2000,
  "type": "Bonus",
  "source": "Greenmouse Ltd.",
  "description": "Updated description",
  "status": "Pending"
}
```

**Responses**

#### `200 OK`

---

### Delete an income record

`DELETE /v1/income/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create an income record

`POST /v1/income`

**Request Body** (`application/json`)

```json
{
  "amount": 1500,
  "type": "Salary",
  "source": "Greenmouse Ltd.",
  "description": "Monthly salary for April",
  "status": "Pending"
}
```

**Responses**

#### `201 Created`

---

### Get all income records

`GET /v1/income?search=string&status=Pending&type=Bonus`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `status` | `Pending` | Filter / pagination param |
| `type` | `Bonus` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Update expense status

`PATCH /v1/expenses/:id/status`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Get an expense record by ID

`GET /v1/expenses/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update an expense record

`PATCH /v1/expenses/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "amount": 750,
  "category": "Meals",
  "paidTo": "Jane Smith",
  "description": "Updated description",
  "status": "Pending"
}
```

**Responses**

#### `200 OK`

---

### Delete an expense record

`DELETE /v1/expenses/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create an expense record

`POST /v1/expenses`

**Request Body** (`application/json`)

```json
{
  "amount": 526.15,
  "category": "Travel",
  "paidTo": "Vernon Effertz",
  "description": "Team offsite travel and accommodation",
  "status": "Pending"
}
```

**Responses**

#### `201 Created`

---

### Get all expense records

`GET /v1/expenses?search=string&status=Pending&category=Hardware`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `status` | `Pending` | Filter / pagination param |
| `category` | `Hardware` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get invoice statistics by status

`GET /v1/invoices/stats`

**Responses**

#### `200 OK`

---

### Get my invoice brand settings (merged over defaults)

`GET /v1/invoices/branding`

**Responses**

#### `200 OK`

---

### Create or update invoice brand settings (requires invoice_branding feature)

`PATCH /v1/invoices/branding`

**Request Body** (`application/json`)

```json
{
  "logoUrl": "https://res.cloudinary.com/example/logo.png",
  "accentColor": "#1a7c4a",
  "footerNotes": "Payment due within 14 days. Bank: 0123456789 (GTB).",
  "displayName": "Acme Trading Co."
}
```

**Responses**

#### `200 OK`

---

### Render invoice as HTML (branded when plan has invoice_branding, plain Greenmouse template otherwise)

`GET /v1/invoices/:id/html`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Download invoice as PDF (branded when plan has invoice_branding)

`GET /v1/invoices/:id/pdf`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Mark invoice as sent

`PATCH /v1/invoices/:id/send`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Mark invoice as paid (records paidAt timestamp)

`PATCH /v1/invoices/:id/mark-paid`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update invoice status

`PATCH /v1/invoices/:id/status`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "status": "draft"
}
```

**Responses**

#### `200 OK`

---

### Record a payment (full or partial) and auto-issue a receipt (RCP-YYYY-XXXXXX)

`POST /v1/invoices/:id/payments`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "amount": 40000,
  "method": "bank_transfer",
  "reference": "TRF-123456",
  "paidAt": "2026-09-20T10:00:00.000Z",
  "notes": "Part payment via transfer",
  "sendEmail": true
}
```

**Responses**

#### `201 Created`

---

### List payment ledger entries for an invoice

`GET /v1/invoices/:id/payments`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List all receipts for an invoice

`GET /v1/invoices/:id/receipts`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Get an invoice by ID

`GET /v1/invoices/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a draft invoice

`PATCH /v1/invoices/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "orderId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "quoteId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "contactId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "billingAddress": "15 Marina Road, Lagos, Nigeria",
  "issuedDate": "2026-05-25",
  "dueDate": "2026-06-25",
  "items": [
    {
      "description": "Web Design Service",
      "qty": 2,
      "unitPrice": 50000
    },
    {
      "description": "Web Design Service",
      "qty": 2,
      "unitPrice": 50000
    }
  ],
  "discount": 5000,
  "tax": 3750,
  "currency": "NGN",
  "status": "draft",
  "pdfUrl": "https://res.cloudinary.com/example/invoice.pdf"
}
```

**Responses**

#### `200 OK`

---

### Delete an invoice

`DELETE /v1/invoices/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a new invoice (invoice number auto-generated)

`POST /v1/invoices`

**Request Body** (`application/json`)

```json
{
  "issuedDate": "2026-05-25",
  "dueDate": "2026-06-25",
  "items": [
    {
      "description": "Web Design Service",
      "qty": 2,
      "unitPrice": 50000
    },
    {
      "description": "Web Design Service",
      "qty": 2,
      "unitPrice": 50000
    }
  ],
  "orderId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "quoteId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "contactId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "billingAddress": "15 Marina Road, Lagos, Nigeria",
  "discount": 5000,
  "tax": 3750,
  "currency": "NGN",
  "status": "draft"
}
```

**Responses**

#### `201 Created`

---

### List all invoices

`GET /v1/invoices?search=string&contactId=string&status=overdue`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Search by invoice number |
| `contactId` | `string` | Filter / pagination param |
| `status` | `overdue` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Render receipt as HTML (branded when entitled)

`GET /v1/receipts/:id/html`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Download receipt as PDF

`GET /v1/receipts/:id/pdf`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Void a receipt (reverses ledger entry, recalcs invoice balance)

`POST /v1/receipts/:id/void`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "reason": "Duplicate entry"
}
```

**Responses**

#### `201 Created`

---

### Re-send an issued receipt email to the client (HTML + PDF attachment)

`POST /v1/receipts/:id/resend`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `201 Created`

---

### Get a receipt by ID (with payment)

`GET /v1/receipts/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

