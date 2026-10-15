# CRM Contacts & Companies API

Contacts, companies, notes, interactions, CSV export, and CSV imports.

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
| `GET` | [`/v1/contacts/:id/notes`](#list-append-only-contact-notes) | List append-only contact notes |
| `POST` | [`/v1/contacts/:id/interactions`](#record-a-contact-call-email-or-meeting) | Record a contact call, email or meeting |
| `GET` | [`/v1/contacts/:id/interactions`](#list-contact-interactions) | List contact interactions |
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

**Example responses from the collection**

#### `200 OK`

---

### Get a company by ID

`GET /v1/companies/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

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

**Example responses from the collection**

#### `200 OK`

---

### Delete a company

`DELETE /v1/companies/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Bulk import companies from a large CSV (async, up to 100MB, partial success, SSE progress)

`POST /v1/companies/import/async`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Example responses from the collection**

#### `201 Created`

---

### Bulk import companies from CSV (sync, ≤2MB / 1000 rows, all-or-nothing)

`POST /v1/companies/import`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Example responses from the collection**

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

**Example responses from the collection**

#### `201 Created`

---

### Get all companies

`GET /v1/companies?search=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---

### Export contacts to CSV (streamed download)

`GET /v1/contacts/export`

**Example responses from the collection**

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

**Example responses from the collection**

#### `201 Created`

---

### List append-only contact notes

`GET /v1/contacts/:id/notes?page=1&limit=20`

Newest first; staff can access contacts they created or are assigned. Owners can access all company contacts.

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `1` | Filter / pagination param |
| `limit` | `20` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

```json
{
  "page": 2819.845133997083,
  "limit": 3611.4093259098045,
  "total": 2875.434560831662,
  "totalPages": 9667.3148682491,
  "hasNextPage": false,
  "hasPrevPage": true,
  "data": [
    {
      "id": "a37440ef-6f66-da00-d2d0-76c53731a17d",
      "customerId": "8201b14e-379a-9ace-c420-2931b09db209",
      "content": "string",
      "createdBy": "29e5a54b-6fb5-4006-676f-44a21a9ddd82",
      "createdAt": "1960-12-22T19:05:53.191Z",
      "author": {
        "id": "6eca4436-f204-ee21-c26c-f53b9fa8d69b",
        "firstName": "string",
        "lastName": "string"
      }
    },
    {
      "id": "98c2baf4-922f-3523-c3c1-07e595cf48aa",
      "customerId": "0c795f08-13db-b2bb-b767-fe947bddc385",
      "content": "string",
      "createdBy": "e59108d8-4cd1-c94f-3714-9ec7294fae2f",
      "createdAt": "1978-02-13T06:10:15.662Z",
      "author": {
        "id": "9de6c6b2-ec0f-7323-0837-d1839384cf15",
        "firstName": "string",
        "lastName": "string"
      }
    }
  ]
}
```

#### `400 Bad Request`

#### `403 Forbidden`

#### `404 Not Found`

---

### Record a contact call, email or meeting

`POST /v1/contacts/:id/interactions`

Append-only historical record. Does not send email, schedule a meeting or create a task. Staff are attributed to themselves; owners may select same-company staff.

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "type": "call",
  "notes": "Discussed revised pricing",
  "occurredAt": "2026-10-09T10:30:00+01:00"
}
```

**Example responses from the collection**

#### `201 Created`

```json
{
  "id": "cab05fec-e7ec-4f5a-55d2-6e005004fa61",
  "companyId": "4f90e0b6-9c4d-0a89-0fe7-74a1df1daf06",
  "contactId": "9de2dcc2-60b1-e88a-4315-9aae213f44af",
  "type": "call",
  "notes": "string",
  "staffId": "1269a5c8-3156-4a45-cf66-17555b9f278f",
  "createdBy": "5f4d0f0c-b181-2777-c733-a12e24dae890",
  "createdByType": "staff",
  "occurredAt": "1987-11-25T05:14:08.453Z",
  "createdAt": "1951-12-21T13:38:15.500Z",
  "staff": {
    "id": "63c3bbd9-f805-0da5-de63-3365abfd270d",
    "firstName": "string",
    "lastName": "string"
  }
}
```

#### `400 Bad Request`

#### `403 Forbidden`

#### `404 Not Found`

---

### List contact interactions

`GET /v1/contacts/:id/interactions?page=1&limit=20&type=call&staffId=21f5bf2a-1d50-9bd0-e812-cc54679ae4e2&from=1970-01-07T11:46:13.897Z&to=1970-01-07T11:46:13.897Z`

Newest occurrence first. Filter by type, staffId and inclusive timezone-aware from/to timestamps.

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `1` | Filter / pagination param |
| `limit` | `20` | Filter / pagination param |
| `type` | `call` | Filter / pagination param |
| `staffId` | `21f5bf2a-1d50-9bd0-e812-cc54679ae4e2` | Filter / pagination param |
| `from` | `1970-01-07T11:46:13.897Z` | Inclusive occurredAt lower bound; explicit timezone required |
| `to` | `1970-01-07T11:46:13.897Z` | Inclusive occurredAt upper bound; explicit timezone required |

**Example responses from the collection**

#### `200 OK`

```json
{
  "page": 8002.682299199911,
  "limit": 1507.6449055797748,
  "total": 9759.054370536047,
  "totalPages": 4123.763521879425,
  "hasNextPage": true,
  "hasPrevPage": false,
  "data": [
    {
      "id": "39038bc2-ea94-dfce-f6ff-7dc5358205ef",
      "companyId": "f00277a5-33cb-ca07-07f3-74124f21db67",
      "contactId": "9eb9be8b-ae30-ba10-2993-aee304683ba6",
      "type": "call",
      "notes": "string",
      "staffId": "ae43a7b4-44bb-8c1a-775c-9d216caca41c",
      "createdBy": "6ee42fdb-d6a0-53ac-a224-1c666c220a37",
      "createdByType": "staff",
      "occurredAt": "1953-02-09T08:30:46.050Z",
      "createdAt": "1975-08-23T00:25:28.236Z",
      "staff": {
        "id": "057a3207-6efb-080e-c186-3304967d415b",
        "firstName": "string",
        "lastName": "string"
      }
    },
    {
      "id": "05180a3b-4cb3-4fe9-6d9f-c1eb7611cfd2",
      "companyId": "c271d191-c14f-80ca-eec9-e428d67d7281",
      "contactId": "fad137f5-cd5f-b89f-7350-2855fe2a0584",
      "type": "email",
      "notes": "string",
      "staffId": "240377aa-81d9-48ba-3884-402291737b18",
      "createdBy": "81d7c08e-8373-ef2e-9d7a-673429c72062",
      "createdByType": "staff",
      "occurredAt": "2015-03-13T15:09:54.494Z",
      "createdAt": "1975-10-02T09:24:36.423Z",
      "staff": {
        "id": "9f13251d-3610-adb1-5aa9-04c61b3bdb45",
        "firstName": "string",
        "lastName": "string"
      }
    }
  ]
}
```

#### `400 Bad Request`

#### `403 Forbidden`

#### `404 Not Found`

---

### Get a contact by ID

`GET /v1/contacts/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

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

**Example responses from the collection**

#### `200 OK`

---

### Delete a contact

`DELETE /v1/contacts/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `409 Conflict`

---

### Bulk import contacts from a large CSV (async, up to 100MB, partial success, SSE progress)

`POST /v1/contacts/import/async`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Example responses from the collection**

#### `201 Created`

---

### Bulk import contacts from CSV (sync, ≤2MB / 1000 rows, all-or-nothing)

`POST /v1/contacts/import`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Example responses from the collection**

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

**Example responses from the collection**

#### `201 Created`

---

### List all contacts

`GET /v1/contacts`

**Example responses from the collection**

#### `200 OK`

---
