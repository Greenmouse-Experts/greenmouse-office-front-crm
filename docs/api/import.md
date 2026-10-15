# Bulk Data Import Jobs API

Validation contracts, downloadable CSV templates, and background import job status.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/import/jobs/:id`](#get-import-job-status-polling-fallback-) | Get import job status (polling fallback) |
| `GET` | [`/v1/import/jobs`](#list-my-recent-import-jobs-polling-fallback-) | List my recent import jobs (polling fallback) |
| `GET` | [`/v1/import/contracts/:entity`](#machine-readable-import-contract-headers-field-types-limits-live-plan-quota-for-building-the-frontend-uploader) | Machine-readable import contract (headers, field types, limits, live plan/quota) for building the frontend uploader |
| `GET` | [`/v1/import/templates/:entity`](#download-csv-template-for-an-entity) | Download CSV template for an entity |

---

## Endpoints

### Get import job status (polling fallback)

`GET /v1/import/jobs/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### List my recent import jobs (polling fallback)

`GET /v1/import/jobs?limit=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `limit` | `string` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---

### Machine-readable import contract (headers, field types, limits, live plan/quota) for building the frontend uploader

`GET /v1/import/contracts/:entity`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `entity` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Download CSV template for an entity

`GET /v1/import/templates/:entity`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `entity` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---
