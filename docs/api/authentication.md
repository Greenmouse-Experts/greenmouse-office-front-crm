# System & Platform Authentication API

System root greetings, health checks, and platform authentication for Super Admins and Staff members.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/healthcheck`](#app-controller-get-health-check) | App Controller get Health Check |
| `POST` | [`/v1/auth/admin/login`](#super-admin-login) | Super admin login |
| `POST` | [`/v1/auth/staff/login`](#staff-login) | Staff login |
| `POST` | [`/v1/auth/refresh`](#refresh-access-token) | Refresh access token |
| `POST` | [`/v1/auth/logout`](#logout-current-user) | Logout current user |
| `GET` | [`/v1/auth/me`](#get-current-authenticated-user) | Get current authenticated user |
| `GET` | [`/v1`](#app-controller-get-hello) | App Controller get Hello |

---

## Endpoints

### App Controller get Health Check

`GET /v1/healthcheck`

**Responses**

#### `200 OK`

---

### Super admin login

`POST /v1/auth/admin/login`

**Request Body** (`application/json`)

```json
{
  "email": "admin@greenmouse.com",
  "password": "password123"
}
```

**Responses**

#### `201 Created`

---

### Staff login

`POST /v1/auth/staff/login`

**Request Body** (`application/json`)

```json
{
  "email": "admin@greenmouse.com",
  "password": "password123"
}
```

**Responses**

#### `201 Created`

---

### Refresh access token

`POST /v1/auth/refresh`

**Responses**

#### `201 Created`

---

### Logout current user

`POST /v1/auth/logout`

**Responses**

#### `201 Created`

---

### Get current authenticated user

`GET /v1/auth/me`

**Responses**

#### `200 OK`

---

### App Controller get Hello

`GET /v1`

**Responses**

#### `200 OK`

---

