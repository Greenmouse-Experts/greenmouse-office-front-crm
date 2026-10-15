# Bulk Data Import & Streaming Jobs Framework API

Validation contracts, downloadable CSV templates, background import job management, and Server-Sent Events (SSE) progress streaming.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/import/jobs/:id/events`](#stream-import-job-progress-sse-token-jwt-) | Stream import job progress (SSE, ?token=<jwt>) |
| `GET` | [`/v1/import/jobs/:id`](#get-import-job-status-polling-fallback-) | Get import job status (polling fallback) |
| `GET` | [`/v1/import/jobs`](#list-my-recent-import-jobs-polling-fallback-) | List my recent import jobs (polling fallback) |
| `GET` | [`/v1/import/contracts/:entity`](#machine-readable-import-contract-headers-field-types-limits-live-plan-quota-for-building-the-frontend-uploader) | Machine-readable import contract (headers, field types, limits, live plan/quota) for building the frontend uploader |
| `GET` | [`/v1/import/templates/:entity`](#download-csv-template-for-an-entity) | Download CSV template for an entity |

---

## Endpoints

### Stream import job progress (SSE, ?token=<jwt>)

`GET /v1/import/jobs/:id/events?token=string`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `token` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Get import job status (polling fallback)

`GET /v1/import/jobs/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### List my recent import jobs (polling fallback)

`GET /v1/import/jobs?limit=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `limit` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Machine-readable import contract (headers, field types, limits, live plan/quota) for building the frontend uploader

`GET /v1/import/contracts/:entity`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `entity` | Resource identifier |

**Responses**

#### `200 OK`

---

### Download CSV template for an entity

`GET /v1/import/templates/:entity`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `entity` | Resource identifier |

**Responses**

#### `200 OK`

---

