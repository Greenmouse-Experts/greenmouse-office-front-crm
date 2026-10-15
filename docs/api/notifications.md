# Notifications & Real-Time Alerts API

Tenant notification bell alerts, unread counts, mark-read actions, and bulk acknowledgment.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/notifications/unread-count`](#get-unread-notification-count) | Get unread notification count |
| `PATCH` | [`/v1/notifications/:id/read`](#mark-a-single-notification-as-read) | Mark a single notification as read |
| `PATCH` | [`/v1/notifications/read-all`](#mark-all-notifications-as-read) | Mark all notifications as read |
| `GET` | [`/v1/notifications`](#list-notifications-for-the-current-tenant) | List notifications for the current tenant |

---

## Endpoints

### Get unread notification count

`GET /v1/notifications/unread-count`

**Responses**

#### `200 OK`

---

### Mark a single notification as read

`PATCH /v1/notifications/:id/read`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Mark all notifications as read

`PATCH /v1/notifications/read-all`

**Responses**

#### `200 OK`

---

### List notifications for the current tenant

`GET /v1/notifications?page=1&limit=20&unreadOnly=false`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `1` | Filter / pagination param |
| `limit` | `20` | Filter / pagination param |
| `unreadOnly` | `false` | Filter to unread only |

**Responses**

#### `200 OK`

---

