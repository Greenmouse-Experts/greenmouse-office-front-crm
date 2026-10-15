# Notifications & Real-Time Alerts API

Company notifications, unread counts, and mark-read actions.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/notifications/unread-count`](#get-unread-notification-count) | Get unread notification count |
| `PATCH` | [`/v1/notifications/:id/read`](#mark-a-single-notification-as-read) | Mark a single notification as read |
| `PATCH` | [`/v1/notifications/read-all`](#mark-all-notifications-as-read) | Mark all notifications as read |
| `GET` | [`/v1/notifications`](#list-notifications-for-the-current-company) | List notifications for the current company |

---

## Endpoints

### Get unread notification count

`GET /v1/notifications/unread-count`

**Example responses from the collection**

#### `200 OK`

---

### Mark a single notification as read

`PATCH /v1/notifications/:id/read`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Mark all notifications as read

`PATCH /v1/notifications/read-all`

**Example responses from the collection**

#### `200 OK`

---

### List notifications for the current company

`GET /v1/notifications?page=1&limit=20&unreadOnly=false`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `1` | Filter / pagination param |
| `limit` | `20` | Filter / pagination param |
| `unreadOnly` | `false` | Filter to unread only |

**Example responses from the collection**

#### `200 OK`

---
