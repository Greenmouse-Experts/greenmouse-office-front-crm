# CRM Contacts & Companies API

Customer contacts and company accounts directory, interaction notes, streaming CSV export, and bulk synchronous/asynchronous CSV imports.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/companies/export`](#export-companies-to-csv-streamed-download-mirrors-list-filters-) | Export companies to CSV (streamed download, mirrors list filters) |
| `GET` | [`/v1/companies/:id`](#get-a-company-by-id) | Get a company by ID |
| `PATCH` | [`/v1/companies/:id`](#update-a-company) | Update a company |
| `DELETE` | [`/v1/companies/:id`](#delete-a-company) | Delete a company |
| `POST` | [`/v1/companies/import/async`](#bulk-import-companies-from-a-large-csv-async-up-to-100mb-partial-success-sse-progress-) | Bulk import companies from a large CSV (async, up to 100MB, partial success, SSE progress) |
| `POST` | [`/v1/companies/import`](#bulk-import-companies-from-csv-sync-2mb-1000-rows-all-or-nothing-) | Bulk import companies from CSV (sync, ≤2MB / 1000 rows, all-or-nothing) |
| `POST` | [`/v1/companies`](#create-a-new-company) | Create a new company |
| `GET` | [`/v1/companies`](#get-all-companies) | Get all companies |
| `GET` | [`/v1/contacts/export`](#export-contacts-to-csv-streamed-download-) | Export contacts to CSV (streamed download) |
| `POST` | [`/v1/contacts/:id/notes`](#add-a-note-to-a-contact) | Add a note to a contact |
| `GET` | [`/v1/contacts/:id`](#get-a-contact-by-id) | Get a contact by ID |
| `PATCH` | [`/v1/contacts/:id`](#update-a-contact) | Update a contact |
| `DELETE` | [`/v1/contacts/:id`](#delete-a-contact) | Delete a contact |
| `POST` | [`/v1/contacts/import/async`](#bulk-import-contacts-from-a-large-csv-async-up-to-100mb-partial-success-sse-progress-) | Bulk import contacts from a large CSV (async, up to 100MB, partial success, SSE progress) |
| `POST` | [`/v1/contacts/import`](#bulk-import-contacts-from-csv-sync-2mb-1000-rows-all-or-nothing-) | Bulk import contacts from CSV (sync, ≤2MB / 1000 rows, all-or-nothing) |
| `POST` | [`/v1/contacts`](#create-a-new-contact) | Create a new contact |
| `GET` | [`/v1/contacts`](#list-all-contacts) | List all contacts |

---

## Endpoints

### Export companies to CSV (streamed download, mirrors list filters)

`GET /v1/companies/export?search=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get a company by ID

`GET /v1/companies/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a company

`PATCH /v1/companies/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Acme Corporation",
  "industry": "Technology",
  "federalIdNumber": "12-3456789",
  "groupName": "Marketing",
  "workPhone": "555-000-0000",
  "email": "contact@company.com",
  "website": "https://www.company.com",
  "dateJoined": "2026-04-14",
  "addressLine1": "123 Main Street",
  "addressLine2": "Suite 100",
  "city": "Anytown",
  "state": "California",
  "zipCode": "90210",
  "country": "United States of America"
}
```

**Responses**

#### `200 OK`

---

### Delete a company

`DELETE /v1/companies/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Bulk import companies from a large CSV (async, up to 100MB, partial success, SSE progress)

`POST /v1/companies/import/async`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Responses**

#### `201 Created`

---

### Bulk import companies from CSV (sync, ≤2MB / 1000 rows, all-or-nothing)

`POST /v1/companies/import`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Responses**

#### `201 Created`

---

### Create a new company

`POST /v1/companies`

**Request Body** (`application/json`)

```json
{
  "name": "Acme Corporation",
  "industry": "Technology",
  "federalIdNumber": "12-3456789",
  "groupName": "Marketing",
  "workPhone": "555-000-0000",
  "email": "contact@company.com",
  "website": "https://www.company.com",
  "dateJoined": "2026-04-14",
  "addressLine1": "123 Main Street",
  "addressLine2": "Suite 100",
  "city": "Anytown",
  "state": "California",
  "zipCode": "90210",
  "country": "United States of America"
}
```

**Responses**

#### `201 Created`

---

### Get all companies

`GET /v1/companies?search=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Export contacts to CSV (streamed download)

`GET /v1/contacts/export`

**Responses**

#### `200 OK`

---

### Add a note to a contact

`POST /v1/contacts/:id/notes`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "content": "Customer called to enquire about pricing."
}
```

**Responses**

#### `201 Created`

---

### Get a contact by ID

`GET /v1/contacts/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a contact

`PATCH /v1/contacts/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "type": "individual",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Corp",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "address": "123 Main Street",
  "city": "Lagos",
  "state": "Lagos State",
  "zipCode": "100001",
  "country": "Nigeria",
  "tags": [
    "VIP",
    "Wholesale"
  ],
  "assignedTo": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "source": "Referral",
  "status": "lead"
}
```

**Responses**

#### `200 OK`

---

### Delete a contact

`DELETE /v1/contacts/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Bulk import contacts from a large CSV (async, up to 100MB, partial success, SSE progress)

`POST /v1/contacts/import/async`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Responses**

#### `201 Created`

---

### Bulk import contacts from CSV (sync, ≤2MB / 1000 rows, all-or-nothing)

`POST /v1/contacts/import`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Responses**

#### `201 Created`

---

### Create a new contact

`POST /v1/contacts`

**Request Body** (`application/json`)

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "type": "individual",
  "companyName": "Acme Corp",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "address": "123 Main Street",
  "city": "Lagos",
  "state": "Lagos State",
  "zipCode": "100001",
  "country": "Nigeria",
  "tags": [
    "VIP",
    "Wholesale"
  ],
  "assignedTo": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "source": "Referral",
  "status": "lead"
}
```

**Responses**

#### `201 Created`

---

### List all contacts

`GET /v1/contacts`

**Responses**

#### `200 OK`

---

