# Finance, Billing, Income, Expenses, Invoices & Receipts API

Revenue tracking, operating expense entries, status updates, invoice and receipt generation, custom HTML/PDF rendering, white-label branding, and payment reconciliation.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/financial-categories/:id`](#get-a-company-financial-category) | Get a company financial category |
| `PATCH` | [`/v1/financial-categories/:id`](#rename-archive-or-reactivate-a-company-financial-category-kind-is-immutable-) | Rename, archive or reactivate a company financial category (kind is immutable) |
| `POST` | [`/v1/financial-categories`](#create-a-company-income-or-expense-category) | Create a company income or expense category |
| `GET` | [`/v1/financial-categories`](#list-company-financial-categories-including-archived-unless-filtered-) | List company financial categories (including archived unless filtered) |
| `PATCH` | [`/v1/income/:id/status`](#update-income-status) | Update income status |
| `GET` | [`/v1/income/:id`](#get-an-income-record-by-id) | Get an income record by ID |
| `PATCH` | [`/v1/income/:id`](#update-an-income-record) | Update an income record |
| `DELETE` | [`/v1/income/:id`](#delete-an-income-record) | Delete an income record |
| `POST` | [`/v1/income`](#create-an-income-record) | Create an income record |
| `GET` | [`/v1/income`](#get-all-income-records) | Get all income records |
| `POST` | [`/v1/expenses/:id/receipt`](#upload-or-replace-a-single-expense-receipt) | Upload or replace a single expense receipt |
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

### Get a company financial category

`GET /v1/financial-categories/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

```json
{
  "id": "3ad2372e-1d17-c89d-b314-2060a2c98cc9",
  "companyId": "0c63b628-54ad-e1a7-6f78-374ea4ec37a2",
  "kind": "income",
  "name": "string",
  "isActive": true,
  "createdAt": "1967-05-13T21:38:24.873Z",
  "updatedAt": "1996-08-14T02:02:25.545Z"
}
```

---

### Rename, archive or reactivate a company financial category (kind is immutable)

`PATCH /v1/financial-categories/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Consulting",
  "isActive": true
}
```

**Example responses from the collection**

#### `200 OK`

```json
{
  "id": "3ad2372e-1d17-c89d-b314-2060a2c98cc9",
  "companyId": "0c63b628-54ad-e1a7-6f78-374ea4ec37a2",
  "kind": "income",
  "name": "string",
  "isActive": true,
  "createdAt": "1967-05-13T21:38:24.873Z",
  "updatedAt": "1996-08-14T02:02:25.545Z"
}
```

---

### Create a company income or expense category

`POST /v1/financial-categories`

**Request Body** (`application/json`)

```json
{
  "kind": "income",
  "name": "Consulting"
}
```

**Example responses from the collection**

#### `201 Created`

```json
{
  "id": "3ad2372e-1d17-c89d-b314-2060a2c98cc9",
  "companyId": "0c63b628-54ad-e1a7-6f78-374ea4ec37a2",
  "kind": "income",
  "name": "string",
  "isActive": true,
  "createdAt": "1967-05-13T21:38:24.873Z",
  "updatedAt": "1996-08-14T02:02:25.545Z"
}
```

---

### List company financial categories (including archived unless filtered)

`GET /v1/financial-categories?kind=income&isActive=false`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `kind` | `income` | Filter / pagination param |
| `isActive` | `false` | Omit to include active and archived categories |

**Example responses from the collection**

#### `200 OK`

```json
[
  {
    "id": "86c78d81-bff4-e6aa-e24e-861b9b45a83e",
    "companyId": "e12030d7-8dd6-e1e0-9d41-2e4f6af4fe3d",
    "kind": "income",
    "name": "string",
    "isActive": true,
    "createdAt": "1996-08-01T09:09:02.101Z",
    "updatedAt": "1990-10-22T08:41:44.203Z"
  },
  {
    "id": "302b49fa-e5e5-180e-cb6d-5df6495f8191",
    "companyId": "f330056c-7811-a63f-c3c3-c9c4c9c6cef3",
    "kind": "income",
    "name": "string",
    "isActive": false,
    "createdAt": "2009-06-02T13:52:51.235Z",
    "updatedAt": "1975-02-03T22:22:53.909Z"
  }
]
```

---

### Update income status

`PATCH /v1/income/:id/status`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

```json
{
  "id": "4ea43ee9-76a5-a992-8436-103b21cde000",
  "amount": 2120.3559738968947,
  "categoryId": "858743f2-2a13-5442-7997-e4cef24395d1",
  "category": {
    "id": "42b1dc3c-d4cd-1560-7827-850e61de9224",
    "companyId": "9bcdfca5-e556-b57c-7dbf-fffa09f7c603",
    "kind": "income",
    "name": "string",
    "isActive": false,
    "createdAt": "1960-11-07T10:48:45.677Z",
    "updatedAt": "1995-11-17T19:16:53.262Z"
  },
  "description": "string",
  "status": "Rejected",
  "companyId": "3382fd12-7058-129c-465e-718540208a72",
  "createdAt": "2005-12-23T18:29:27.037Z",
  "updatedAt": "2015-01-04T09:10:34.102Z",
  "source": "string"
}
```

---

### Get an income record by ID

`GET /v1/income/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

```json
{
  "id": "4ea43ee9-76a5-a992-8436-103b21cde000",
  "amount": 2120.3559738968947,
  "categoryId": "858743f2-2a13-5442-7997-e4cef24395d1",
  "category": {
    "id": "42b1dc3c-d4cd-1560-7827-850e61de9224",
    "companyId": "9bcdfca5-e556-b57c-7dbf-fffa09f7c603",
    "kind": "income",
    "name": "string",
    "isActive": false,
    "createdAt": "1960-11-07T10:48:45.677Z",
    "updatedAt": "1995-11-17T19:16:53.262Z"
  },
  "description": "string",
  "status": "Rejected",
  "companyId": "3382fd12-7058-129c-465e-718540208a72",
  "createdAt": "2005-12-23T18:29:27.037Z",
  "updatedAt": "2015-01-04T09:10:34.102Z",
  "source": "string"
}
```

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
  "categoryId": "e73bf626-0692-110b-f0bf-79c7a3b8d478",
  "source": "Greenmouse Ltd.",
  "description": "Updated description",
  "status": "Approved"
}
```

**Example responses from the collection**

#### `200 OK`

```json
{
  "id": "4ea43ee9-76a5-a992-8436-103b21cde000",
  "amount": 2120.3559738968947,
  "categoryId": "858743f2-2a13-5442-7997-e4cef24395d1",
  "category": {
    "id": "42b1dc3c-d4cd-1560-7827-850e61de9224",
    "companyId": "9bcdfca5-e556-b57c-7dbf-fffa09f7c603",
    "kind": "income",
    "name": "string",
    "isActive": false,
    "createdAt": "1960-11-07T10:48:45.677Z",
    "updatedAt": "1995-11-17T19:16:53.262Z"
  },
  "description": "string",
  "status": "Rejected",
  "companyId": "3382fd12-7058-129c-465e-718540208a72",
  "createdAt": "2005-12-23T18:29:27.037Z",
  "updatedAt": "2015-01-04T09:10:34.102Z",
  "source": "string"
}
```

---

### Delete an income record

`DELETE /v1/income/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Create an income record

`POST /v1/income`

**Request Body** (`application/json`)

```json
{
  "amount": 1500,
  "categoryId": "33b39fee-8a79-84a3-c7b9-ffd076256129",
  "source": "Greenmouse Ltd.",
  "description": "Monthly salary for April",
  "status": "Pending"
}
```

**Example responses from the collection**

#### `201 Created`

```json
{
  "id": "4ea43ee9-76a5-a992-8436-103b21cde000",
  "amount": 2120.3559738968947,
  "categoryId": "858743f2-2a13-5442-7997-e4cef24395d1",
  "category": {
    "id": "42b1dc3c-d4cd-1560-7827-850e61de9224",
    "companyId": "9bcdfca5-e556-b57c-7dbf-fffa09f7c603",
    "kind": "income",
    "name": "string",
    "isActive": false,
    "createdAt": "1960-11-07T10:48:45.677Z",
    "updatedAt": "1995-11-17T19:16:53.262Z"
  },
  "description": "string",
  "status": "Rejected",
  "companyId": "3382fd12-7058-129c-465e-718540208a72",
  "createdAt": "2005-12-23T18:29:27.037Z",
  "updatedAt": "2015-01-04T09:10:34.102Z",
  "source": "string"
}
```

---

### Get all income records

`GET /v1/income?search=string&categoryId=21f5bf2a-1d50-9bd0-e812-cc54679ae4e2&status=Pending`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `categoryId` | `21f5bf2a-1d50-9bd0-e812-cc54679ae4e2` | Filter / pagination param |
| `status` | `Pending` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

```json
[
  {
    "id": "53e46070-8a0c-50d3-2bb5-aa8de40eece8",
    "amount": 8820.56512987522,
    "categoryId": "a37470c4-3f22-63fa-fb5d-3dc2bbf76e6e",
    "category": {
      "id": "cd0d69ed-1593-3d68-2450-6dd6a45f10ce",
      "companyId": "488dc64e-9ef1-331a-b939-3ca12c572680",
      "kind": "expense",
      "name": "string",
      "isActive": true,
      "createdAt": "1986-05-26T01:02:13.238Z",
      "updatedAt": "1960-10-16T22:03:52.825Z"
    },
    "description": "string",
    "status": "Rejected",
    "companyId": "a3143f46-7278-abf9-d7ea-e3e55e4f2184",
    "createdAt": "1968-11-22T06:40:19.752Z",
    "updatedAt": "1986-08-23T05:47:17.105Z",
    "source": "string"
  },
  {
    "id": "07e6d325-4495-7018-0390-04ce3b3d519c",
    "amount": 6432.925220737707,
    "categoryId": "b07315ad-1fdc-8439-da6b-ff5f4dcac103",
    "category": {
      "id": "172736c9-0c12-e2bd-361c-5a2b804e3688",
      "companyId": "32498746-33b7-c2ed-e3b8-35c9be5426d4",
      "kind": "expense",
      "name": "string",
      "isActive": true,
      "createdAt": "1985-06-07T22:51:09.175Z",
      "updatedAt": "1998-03-01T06:23:55.430Z"
    },
    "description": "string",
    "status": "Pending",
    "companyId": "3929a250-9b2d-eab0-38ce-935acc5aa6a4",
    "createdAt": "1989-09-26T08:50:12.514Z",
    "updatedAt": "2013-06-06T19:07:29.314Z",
    "source": "string"
  }
]
```

---

### Upload or replace a single expense receipt

`POST /v1/expenses/:id/receipt`

JPEG/PNG/PDF with a matching signature, maximum 5 MB. Replaced external files are retained.

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Example responses from the collection**

#### `201 Created`

```json
{
  "id": "32b0ff16-85fa-930f-5096-9d2f333bb15c",
  "amount": 1218.672556592777,
  "categoryId": "4583532f-458d-a5c4-d15d-9580ecb178d3",
  "category": {
    "id": "fd624082-af1b-899b-1a5a-7255a2d2069d",
    "companyId": "954cfe9e-e936-972c-699b-fb18b0d9f181",
    "kind": "expense",
    "name": "string",
    "isActive": false,
    "createdAt": "1962-03-23T20:32:39.740Z",
    "updatedAt": "1995-08-06T01:25:08.415Z"
  },
  "description": "string",
  "status": "Rejected",
  "companyId": "cb835600-cff7-6054-b675-8c1023128a38",
  "createdAt": "1954-12-21T03:36:09.891Z",
  "updatedAt": "1992-11-03T21:56:24.122Z",
  "date": "1994-09-12",
  "receipt": {
    "url": "string",
    "publicId": "string",
    "resourceType": "string",
    "mimeType": "image/jpeg",
    "size": 3055676.8180539855,
    "uploadedBy": "6576c46d-bdb6-34fc-8e6b-cfeb03e529a9",
    "uploadedAt": "1994-10-15T12:06:53.541Z"
  },
  "paidTo": "string"
}
```

#### `400 Bad Request`

#### `404 Not Found`

#### `502 Bad Gateway`

---

### Update expense status

`PATCH /v1/expenses/:id/status`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

```json
{
  "id": "32b0ff16-85fa-930f-5096-9d2f333bb15c",
  "amount": 1218.672556592777,
  "categoryId": "4583532f-458d-a5c4-d15d-9580ecb178d3",
  "category": {
    "id": "fd624082-af1b-899b-1a5a-7255a2d2069d",
    "companyId": "954cfe9e-e936-972c-699b-fb18b0d9f181",
    "kind": "expense",
    "name": "string",
    "isActive": false,
    "createdAt": "1962-03-23T20:32:39.740Z",
    "updatedAt": "1995-08-06T01:25:08.415Z"
  },
  "description": "string",
  "status": "Rejected",
  "companyId": "cb835600-cff7-6054-b675-8c1023128a38",
  "createdAt": "1954-12-21T03:36:09.891Z",
  "updatedAt": "1992-11-03T21:56:24.122Z",
  "date": "1994-09-12",
  "receipt": {
    "url": "string",
    "publicId": "string",
    "resourceType": "string",
    "mimeType": "image/jpeg",
    "size": 3055676.8180539855,
    "uploadedBy": "6576c46d-bdb6-34fc-8e6b-cfeb03e529a9",
    "uploadedAt": "1994-10-15T12:06:53.541Z"
  },
  "paidTo": "string"
}
```

---

### Get an expense record by ID

`GET /v1/expenses/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

```json
{
  "id": "32b0ff16-85fa-930f-5096-9d2f333bb15c",
  "amount": 1218.672556592777,
  "categoryId": "4583532f-458d-a5c4-d15d-9580ecb178d3",
  "category": {
    "id": "fd624082-af1b-899b-1a5a-7255a2d2069d",
    "companyId": "954cfe9e-e936-972c-699b-fb18b0d9f181",
    "kind": "expense",
    "name": "string",
    "isActive": false,
    "createdAt": "1962-03-23T20:32:39.740Z",
    "updatedAt": "1995-08-06T01:25:08.415Z"
  },
  "description": "string",
  "status": "Rejected",
  "companyId": "cb835600-cff7-6054-b675-8c1023128a38",
  "createdAt": "1954-12-21T03:36:09.891Z",
  "updatedAt": "1992-11-03T21:56:24.122Z",
  "date": "1994-09-12",
  "receipt": {
    "url": "string",
    "publicId": "string",
    "resourceType": "string",
    "mimeType": "image/jpeg",
    "size": 3055676.8180539855,
    "uploadedBy": "6576c46d-bdb6-34fc-8e6b-cfeb03e529a9",
    "uploadedAt": "1994-10-15T12:06:53.541Z"
  },
  "paidTo": "string"
}
```

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
  "amount": 75000,
  "date": "1970-07-13",
  "categoryId": "67834787-f9ae-9c0c-88f3-d0a5b26351d4",
  "paidTo": "Jane Smith",
  "description": "Updated description",
  "status": "Approved"
}
```

**Example responses from the collection**

#### `200 OK`

```json
{
  "id": "32b0ff16-85fa-930f-5096-9d2f333bb15c",
  "amount": 1218.672556592777,
  "categoryId": "4583532f-458d-a5c4-d15d-9580ecb178d3",
  "category": {
    "id": "fd624082-af1b-899b-1a5a-7255a2d2069d",
    "companyId": "954cfe9e-e936-972c-699b-fb18b0d9f181",
    "kind": "expense",
    "name": "string",
    "isActive": false,
    "createdAt": "1962-03-23T20:32:39.740Z",
    "updatedAt": "1995-08-06T01:25:08.415Z"
  },
  "description": "string",
  "status": "Rejected",
  "companyId": "cb835600-cff7-6054-b675-8c1023128a38",
  "createdAt": "1954-12-21T03:36:09.891Z",
  "updatedAt": "1992-11-03T21:56:24.122Z",
  "date": "1994-09-12",
  "receipt": {
    "url": "string",
    "publicId": "string",
    "resourceType": "string",
    "mimeType": "image/jpeg",
    "size": 3055676.8180539855,
    "uploadedBy": "6576c46d-bdb6-34fc-8e6b-cfeb03e529a9",
    "uploadedAt": "1994-10-15T12:06:53.541Z"
  },
  "paidTo": "string"
}
```

---

### Delete an expense record

`DELETE /v1/expenses/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Create an expense record

`POST /v1/expenses`

**Request Body** (`application/json`)

```json
{
  "amount": 52615,
  "categoryId": "5195f014-7e14-7850-23ae-1943b8d43cce",
  "date": "2026-10-09",
  "paidTo": "Vernon Effertz",
  "description": "Team offsite travel and accommodation",
  "status": "Pending"
}
```

**Example responses from the collection**

#### `201 Created`

```json
{
  "id": "32b0ff16-85fa-930f-5096-9d2f333bb15c",
  "amount": 1218.672556592777,
  "categoryId": "4583532f-458d-a5c4-d15d-9580ecb178d3",
  "category": {
    "id": "fd624082-af1b-899b-1a5a-7255a2d2069d",
    "companyId": "954cfe9e-e936-972c-699b-fb18b0d9f181",
    "kind": "expense",
    "name": "string",
    "isActive": false,
    "createdAt": "1962-03-23T20:32:39.740Z",
    "updatedAt": "1995-08-06T01:25:08.415Z"
  },
  "description": "string",
  "status": "Rejected",
  "companyId": "cb835600-cff7-6054-b675-8c1023128a38",
  "createdAt": "1954-12-21T03:36:09.891Z",
  "updatedAt": "1992-11-03T21:56:24.122Z",
  "date": "1994-09-12",
  "receipt": {
    "url": "string",
    "publicId": "string",
    "resourceType": "string",
    "mimeType": "image/jpeg",
    "size": 3055676.8180539855,
    "uploadedBy": "6576c46d-bdb6-34fc-8e6b-cfeb03e529a9",
    "uploadedAt": "1994-10-15T12:06:53.541Z"
  },
  "paidTo": "string"
}
```

---

### Get all expense records

`GET /v1/expenses?search=string&categoryId=21f5bf2a-1d50-9bd0-e812-cc54679ae4e2&status=Pending`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `categoryId` | `21f5bf2a-1d50-9bd0-e812-cc54679ae4e2` | Filter / pagination param |
| `status` | `Pending` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

```json
[
  {
    "id": "152252db-39c9-4ec9-79ae-b79c19bf3101",
    "amount": 9669.312472619898,
    "categoryId": "133805e6-4010-a0c4-af92-8682edca50f6",
    "category": {
      "id": "dcbd3353-df6f-e597-bb80-ca9d83cb7062",
      "companyId": "f6b97724-cfb4-1c58-1457-86c80d1719b9",
      "kind": "expense",
      "name": "string",
      "isActive": false,
      "createdAt": "1966-09-20T13:35:24.453Z",
      "updatedAt": "1991-04-08T11:36:23.944Z"
    },
    "description": "string",
    "status": "Rejected",
    "companyId": "fc2d4655-85c8-7921-a840-67df2bffb8f0",
    "createdAt": "1980-05-23T00:31:23.889Z",
    "updatedAt": "1965-05-01T02:01:34.745Z",
    "date": "1958-03-09",
    "receipt": {
      "url": "string",
      "publicId": "string",
      "resourceType": "string",
      "mimeType": "image/jpeg",
      "size": 2208218.861339405,
      "uploadedBy": "4d2a983c-c2f4-8765-ff86-b7a65a6fddfd",
      "uploadedAt": "1949-04-18T17:23:28.374Z"
    },
    "paidTo": "string"
  },
  {
    "id": "e37212e6-988a-5fb1-50fe-6b47d23fb701",
    "amount": 3179.47040656251,
    "categoryId": "663bd9b7-88c3-337f-ac24-ad231cd00654",
    "category": {
      "id": "094d665e-97c6-815f-1c2a-61c35487dc53",
      "companyId": "145340e9-5a9a-555f-6afb-a9a5f5d0cfe1",
      "kind": "expense",
      "name": "string",
      "isActive": false,
      "createdAt": "2026-05-31T12:53:05.385Z",
      "updatedAt": "2014-06-07T15:14:58.744Z"
    },
    "description": "string",
    "status": "Approved",
    "companyId": "df78a95f-8dba-9581-9a3c-d86bbf1c913c",
    "createdAt": "2009-05-17T23:55:32.122Z",
    "updatedAt": "1987-09-15T04:58:36.778Z",
    "date": "1988-09-18",
    "receipt": {
      "url": "string",
      "publicId": "string",
      "resourceType": "string",
      "mimeType": "application/pdf",
      "size": 2542192.202820367,
      "uploadedBy": "4a384e80-745a-ba5b-0134-2842491f029f",
      "uploadedAt": "2003-03-22T18:51:37.171Z"
    },
    "paidTo": "string"
  }
]
```

---

### Get invoice statistics by status

`GET /v1/invoices/stats`

**Response body**

```json
{
  "totalInvoices": 1,
  "paid": {
    "count": 1,
    "total": 15000
  }
}
```

---

### Get my invoice brand settings (merged over defaults)

`GET /v1/invoices/branding`

**Example responses from the collection**

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

**Example responses from the collection**

#### `200 OK`

---

### Render invoice as HTML (branded when plan has invoice_branding, plain Greenmouse template otherwise)

`GET /v1/invoices/:id/html`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Download invoice as PDF (branded when plan has invoice_branding)

`GET /v1/invoices/:id/pdf`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Mark invoice as sent

`PATCH /v1/invoices/:id/send`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Mark invoice as paid (records paidAt timestamp)

`PATCH /v1/invoices/:id/mark-paid`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

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
  "status": "partial"
}
```

**Example responses from the collection**

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

**Example responses from the collection**

#### `201 Created`

---

### List payment ledger entries for an invoice

`GET /v1/invoices/:id/payments`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### List all receipts for an invoice

`GET /v1/invoices/:id/receipts`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Get an invoice by ID

`GET /v1/invoices/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

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

**Example responses from the collection**

#### `200 OK`

---

### Delete an invoice

`DELETE /v1/invoices/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

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

**Example responses from the collection**

#### `201 Created`

---

### List all invoices

`GET /v1/invoices?search=string&contactId=string&status=draft`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Search by invoice number |
| `contactId` | `string` | Filter / pagination param |
| `status` | `draft` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---

### Render receipt as HTML (branded when entitled)

`GET /v1/receipts/:id/html`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Download receipt as PDF

`GET /v1/receipts/:id/pdf`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

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

**Example responses from the collection**

#### `201 Created`

---

### Re-send an issued receipt email to the client (HTML + PDF attachment)

`POST /v1/receipts/:id/resend`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `201 Created`

---

### Get a receipt by ID (with payment)

`GET /v1/receipts/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---
