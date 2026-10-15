# Staff Members & RBAC Roles API

Tenant staff invitations, team directory, custom role creation, granular permission assignment, and privilege escalation management.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/staffs/:id`](#get-a-staff-member-by-id) | Get a staff member by ID |
| `PATCH` | [`/v1/staffs/:id`](#update-a-staff-member) | Update a staff member |
| `DELETE` | [`/v1/staffs/:id`](#delete-a-staff-member) | Delete a staff member |
| `POST` | [`/v1/staffs`](#create-a-new-staff-member) | Create a new staff member |
| `GET` | [`/v1/staffs`](#get-all-staff-members) | Get all staff members |
| `GET` | [`/v1/roles/permissions`](#list-assignable-permissions-with-descriptions-use-when-creating-updating-roles) | List assignable permissions with descriptions — use when creating/updating roles |
| `PATCH` | [`/v1/roles/:id/permissions`](#assign-permissions-to-a-role) | Assign permissions to a role |
| `GET` | [`/v1/roles/:id`](#get-a-role-by-id) | Get a role by ID |
| `PATCH` | [`/v1/roles/:id`](#update-role-name-or-description) | Update role name or description |
| `DELETE` | [`/v1/roles/:id`](#delete-a-role) | Delete a role |
| `POST` | [`/v1/roles`](#create-a-new-role) | Create a new role |
| `GET` | [`/v1/roles`](#get-all-roles) | Get all roles |

---

## Endpoints

### Get a staff member by ID

`GET /v1/staffs/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a staff member

`PATCH /v1/staffs/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "email": "staff@greenmouse.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phoneNumber": "+2348012345678",
  "roleId": "110e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "profilePic": "https://res.cloudinary.com/..."
}
```

**Responses**

#### `200 OK`

---

### Delete a staff member

`DELETE /v1/staffs/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a new staff member

`POST /v1/staffs`

**Request Body** (`application/json`)

```json
{
  "email": "staff@greenmouse.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phoneNumber": "+2348012345678",
  "roleId": "110e8400-e29b-41d4-a716-446655440000",
  "profilePic": "https://res.cloudinary.com/..."
}
```

**Responses**

#### `201 Created`

---

### Get all staff members

`GET /v1/staffs`

**Responses**

#### `200 OK`

---

### List assignable permissions with descriptions — use when creating/updating roles

`GET /v1/roles/permissions`

**Responses**

#### `200 OK`

---

### Assign permissions to a role

`PATCH /v1/roles/:id/permissions`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "permissions": [
    "customers:read",
    "orders:read"
  ]
}
```

**Responses**

#### `200 OK`

---

### Get a role by ID

`GET /v1/roles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update role name or description

`PATCH /v1/roles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Sales Manager",
  "description": "Manages sales team and customer accounts",
  "permissions": [
    "customers:read",
    "orders:read"
  ]
}
```

**Responses**

#### `200 OK`

---

### Delete a role

`DELETE /v1/roles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a new role

`POST /v1/roles`

**Request Body** (`application/json`)

```json
{
  "name": "Sales Rep",
  "description": "Can manage customers and view orders",
  "permissions": [
    "customers:read",
    "orders:read"
  ]
}
```

**Responses**

#### `201 Created`

---

### Get all roles

`GET /v1/roles`

**Responses**

#### `200 OK`

---

