# Tasks, Follow-ups & Activity Management API

Task creation, calendar scheduling, status updates, resource assignment, filtering, and activity tracking for CRM workflows.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/tasks/calendar`](#calendar-view-of-tasks-in-a-date-range) | Calendar view of tasks in a date range |
| `PATCH` | [`/v1/tasks/:id/status`](#change-task-status) | Change task status |
| `GET` | [`/v1/tasks/:id`](#get-a-task-by-id) | Get a task by ID |
| `PATCH` | [`/v1/tasks/:id`](#update-a-task) | Update a task |
| `DELETE` | [`/v1/tasks/:id`](#delete-a-task) | Delete a task |
| `POST` | [`/v1/tasks`](#create-a-task-follow-up-or-activity) | Create a task, follow-up or activity |
| `GET` | [`/v1/tasks`](#list-tasks-filter-by-status-type-dates-) | List tasks (filter by status, type, dates) |

---

## Endpoints

### Calendar view of tasks in a date range

`GET /v1/tasks/calendar?from=string&to=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `from` | `string` | Filter / pagination param |
| `to` | `string` | Date-only bounds cover the whole UTC day (to=2026-09-30 includes tasks due that day) |

**Responses**

#### `200 OK`

---

### Change task status

`PATCH /v1/tasks/:id/status`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "status": "completed"
}
```

**Responses**

#### `200 OK`

---

### Get a task by ID

`GET /v1/tasks/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a task

`PATCH /v1/tasks/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "title": "Call Acme about renewal",
  "description": "Confirm seats and billing contact",
  "type": "email",
  "priority": "high",
  "dueAt": "2026-09-30T10:00:00.000Z",
  "startAt": "2026-09-30T10:00:00.000Z",
  "endAt": "2026-09-30T10:30:00.000Z",
  "relatedType": "deal",
  "relatedId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "assignedTo": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d"
}
```

**Responses**

#### `200 OK`

---

### Delete a task

`DELETE /v1/tasks/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a task, follow-up or activity

`POST /v1/tasks`

**Request Body** (`application/json`)

```json
{
  "title": "Call Acme about renewal",
  "description": "Confirm seats and billing contact",
  "type": "follow_up",
  "status": "open",
  "priority": "high",
  "dueAt": "2026-09-30T10:00:00.000Z",
  "startAt": "2026-09-30T10:00:00.000Z",
  "endAt": "2026-09-30T10:30:00.000Z",
  "relatedType": "deal",
  "relatedId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "assignedTo": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d"
}
```

**Responses**

#### `201 Created`

---

### List tasks (filter by status, type, dates)

`GET /v1/tasks?search=string&status=completed&type=email&priority=medium&assignedTo=string&relatedType=string&relatedId=string&dueFrom=string&dueTo=string&overdue=false`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `status` | `completed` | Filter / pagination param |
| `type` | `email` | Filter / pagination param |
| `priority` | `medium` | Filter / pagination param |
| `assignedTo` | `string` | Filter / pagination param |
| `relatedType` | `string` | Filter / pagination param |
| `relatedId` | `string` | Filter / pagination param |
| `dueFrom` | `string` | Filter / pagination param |
| `dueTo` | `string` | Filter / pagination param |
| `overdue` | `false` | Filter / pagination param |

**Responses**

#### `200 OK`

---

