# Super Admin Platform Management API

Super admin setup, admin accounts and roles, profile settings, and permission management.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | [`/v1/admins/setup`](#create-the-first-super-admin-account-one-time-only-) | Create the first super admin account (one-time only) |
| `GET` | [`/v1/admins/profile`](#get-own-admin-profile) | Get own admin profile |
| `PATCH` | [`/v1/admins/profile`](#update-own-admin-profile) | Update own admin profile |
| `PATCH` | [`/v1/admins/change-password`](#change-own-admin-password) | Change own admin password |
| `GET` | [`/v1/admins/permissions`](#list-all-available-admin-permissions) | List all available admin permissions |
| `PATCH` | [`/v1/admins/roles/:id/permissions`](#update-permissions-on-an-admin-role-super-only-) | Update permissions on an admin role (super-only) |
| `DELETE` | [`/v1/admins/roles/:id`](#delete-an-admin-role-super-only-) | Delete an admin role (super-only) |
| `GET` | [`/v1/admins/roles`](#list-all-admin-roles-super-only-) | List all admin roles (super-only) |
| `POST` | [`/v1/admins/roles`](#create-a-new-admin-role-super-only-) | Create a new admin role (super-only) |
| `GET` | [`/v1/admins/:id`](#get-admin-detail-by-id-super-only-) | Get admin detail by ID (super-only) |
| `PATCH` | [`/v1/admins/:id`](#update-admin-account-role-status-profile-super-only-) | Update admin account — role, status, profile (super-only) |
| `DELETE` | [`/v1/admins/:id`](#delete-an-admin-account-super-only-) | Delete an admin account (super-only) |
| `GET` | [`/v1/admins`](#list-all-admin-accounts-super-only-) | List all admin accounts (super-only) |
| `POST` | [`/v1/admins`](#create-a-new-admin-account-super-only-) | Create a new admin account (super-only) |

---

## Endpoints

### Create the first super admin account (one-time only)

`POST /v1/admins/setup`

**Request Body** (`application/json`)

```json
{
  "email": "admin@greenmouse.com",
  "password": "StrongPass123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+2348012345678"
}
```

**Example responses from the collection**

#### `201 Created`

---

### Get own admin profile

`GET /v1/admins/profile`

**Example responses from the collection**

#### `200 OK`

---

### Update own admin profile

`PATCH /v1/admins/profile`

**Request Body** (`application/json`)

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@greenmouse.com",
  "phoneNumber": "+2348012345678",
  "bio": "Super Admin / Team Manager",
  "profilePic": "https://res.cloudinary.com/...",
  "country": "Nigeria",
  "cityState": "Lagos, Ikeja",
  "postalCode": "100001",
  "taxId": "AS45645756"
}
```

**Example responses from the collection**

#### `200 OK`

---

### Change own admin password

`PATCH /v1/admins/change-password`

**Request Body** (`application/json`)

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmNewPassword": "NewPass456"
}
```

**Example responses from the collection**

#### `200 OK`

---

### List all available admin permissions

`GET /v1/admins/permissions`

**Example responses from the collection**

#### `200 OK`

---

### Update permissions on an admin role (super-only)

`PATCH /v1/admins/roles/:id/permissions`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "permissions": [
    "platform:read",
    "companySettings:view",
    "companySettings:suspend"
  ]
}
```

**Example responses from the collection**

#### `200 OK`

---

### Delete an admin role (super-only)

`DELETE /v1/admins/roles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### List all admin roles (super-only)

`GET /v1/admins/roles`

**Example responses from the collection**

#### `200 OK`

---

### Create a new admin role (super-only)

`POST /v1/admins/roles`

**Request Body** (`application/json`)

```json
{
  "name": "support",
  "permissions": [
    "platform:read",
    "companySettings:view"
  ],
  "description": "Read-only support access"
}
```

**Example responses from the collection**

#### `201 Created`

---

### Get admin detail by ID (super-only)

`GET /v1/admins/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Update admin account — role, status, profile (super-only)

`PATCH /v1/admins/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "roleId": "string",
  "isActive": true,
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string"
}
```

**Example responses from the collection**

#### `200 OK`

---

### Delete an admin account (super-only)

`DELETE /v1/admins/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### List all admin accounts (super-only)

`GET /v1/admins`

**Example responses from the collection**

#### `200 OK`

---

### Create a new admin account (super-only)

`POST /v1/admins`

**Request Body** (`application/json`)

```json
{
  "email": "admin@example.com",
  "password": "Password@2022",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+2340000000000",
  "roleId": "string"
}
```

**Example responses from the collection**

#### `201 Created`

---
