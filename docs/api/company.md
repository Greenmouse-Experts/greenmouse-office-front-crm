# Company Login Activity API

Recent and latest login activity for the current company.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/company/login-activity/latest`](#get-latest-login-activity) | Get latest login activity |
| `GET` | [`/v1/company/login-activity`](#get-recent-login-activities-paginated-) | Get recent login activities (paginated) |

---

## Endpoints

### Get latest login activity

`GET /v1/company/login-activity/latest`

**Example responses from the collection**

#### `200 OK`

---

### Get recent login activities (paginated)

`GET /v1/company/login-activity?page=607.016967160765&limit=607.016967160765`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `607.016967160765` | Filter / pagination param |
| `limit` | `607.016967160765` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---
