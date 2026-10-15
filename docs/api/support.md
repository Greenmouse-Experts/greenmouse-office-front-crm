# Support Tickets & Helpdesk Threading API

Customer support tickets, agent ticket assignment, priority escalation, lifecycle status updates, and chronological reply threads.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `PATCH` | [`/v1/tickets/:id/status`](#change-ticket-status) | Change ticket status |
| `PATCH` | [`/v1/tickets/:id/assign`](#assign-ticket-to-a-staff-member) | Assign ticket to a staff member |
| `POST` | [`/v1/tickets/:id/messages`](#reply-to-a-ticket-thread) | Reply to a ticket thread |
| `GET` | [`/v1/tickets/:id`](#get-ticket-detail-with-full-message-thread) | Get ticket detail with full message thread |
| `PATCH` | [`/v1/tickets/:id`](#update-ticket-subject-description-or-priority) | Update ticket subject, description or priority |
| `DELETE` | [`/v1/tickets/:id`](#delete-a-ticket) | Delete a ticket |
| `POST` | [`/v1/tickets`](#create-a-new-support-ticket) | Create a new support ticket |
| `GET` | [`/v1/tickets`](#list-all-tickets-filter-by-status-priority-assigned-staff-) | List all tickets (filter by status, priority, assigned staff) |

---

## Endpoints

### Change ticket status

`PATCH /v1/tickets/:id/status`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "status": "closed"
}
```

**Responses**

#### `200 OK`

---

### Assign ticket to a staff member

`PATCH /v1/tickets/:id/assign`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "staffId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d"
}
```

**Responses**

#### `200 OK`

---

### Reply to a ticket thread

`POST /v1/tickets/:id/messages`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "content": "We are looking into this issue and will update you shortly.",
  "attachments": [
    "https://res.cloudinary.com/example/file.pdf"
  ]
}
```

**Responses**

#### `201 Created`

---

### Get ticket detail with full message thread

`GET /v1/tickets/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update ticket subject, description or priority

`PATCH /v1/tickets/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "contactId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "subject": "Unable to process payment",
  "description": "Payment fails at checkout with error code 500",
  "priority": "medium",
  "attachments": [
    "https://res.cloudinary.com/example/screenshot.png"
  ]
}
```

**Responses**

#### `200 OK`

---

### Delete a ticket

`DELETE /v1/tickets/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a new support ticket

`POST /v1/tickets`

**Request Body** (`application/json`)

```json
{
  "subject": "Unable to process payment",
  "contactId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "description": "Payment fails at checkout with error code 500",
  "priority": "medium",
  "attachments": [
    "https://res.cloudinary.com/example/screenshot.png"
  ]
}
```

**Responses**

#### `201 Created`

---

### List all tickets (filter by status, priority, assigned staff)

`GET /v1/tickets?priority=medium&assignedTo=string&status=closed`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `priority` | `medium` | Filter / pagination param |
| `assignedTo` | `string` | Filter by staff ID |
| `status` | `closed` | Filter / pagination param |

**Responses**

#### `200 OK`

---

