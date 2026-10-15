# Super Admin Platform Management API

Super admin setup, administrator profiles, permissions, accounts, roles, and platform knowledge base management.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | [`/v1/auth/admin/login`](#super-admin-login) | Super admin login |
| `POST` | [`/v1/admins/setup`](#create-the-first-super-admin-account-one-time-only) | Create the first super admin account (one-time only) |
| `GET` | [`/v1/admins/profile`](#get-own-admin-profile) | Get own admin profile |
| `PATCH` | [`/v1/admins/profile`](#update-own-admin-profile) | Update own admin profile |
| `PATCH` | [`/v1/admins/change-password`](#change-own-admin-password) | Change own admin password |
| `GET` | [`/v1/admins/permissions`](#list-all-available-admin-permissions) | List all available admin permissions |
| `PATCH` | [`/v1/admins/roles/:id/permissions`](#update-permissions-on-an-admin-role-super-only) | Update permissions on an admin role (super-only) |
| `DELETE` | [`/v1/admins/roles/:id`](#delete-an-admin-role-super-only) | Delete an admin role (super-only) |
| `GET` | [`/v1/admins/roles`](#list-all-admin-roles-super-only) | List all admin roles (super-only) |
| `POST` | [`/v1/admins/roles`](#create-a-new-admin-role-super-only) | Create a new admin role (super-only) |
| `GET` | [`/v1/admins/:id`](#get-admin-detail-by-id-super-only) | Get admin detail by ID (super-only) |
| `PATCH` | [`/v1/admins/:id`](#update-admin-account-role-status-profile-super-only) | Update admin account — role, status, profile (super-only) |
| `DELETE` | [`/v1/admins/:id`](#delete-an-admin-account-super-only) | Delete an admin account (super-only) |
| `PATCH` | [`/v1/admins/knowledge-base/categories/:id`](#admin-knowledge-base-controller-update-category) | Admin Knowledge Base Controller update Category |
| `DELETE` | [`/v1/admins/knowledge-base/categories/:id`](#admin-knowledge-base-controller-delete-category) | Admin Knowledge Base Controller delete Category |
| `GET` | [`/v1/admins/knowledge-base/categories`](#admin-knowledge-base-controller-categories) | Admin Knowledge Base Controller categories |
| `POST` | [`/v1/admins/knowledge-base/categories`](#admin-knowledge-base-controller-create-category) | Admin Knowledge Base Controller create Category |
| `POST` | [`/v1/admins/knowledge-base/articles/:id/publish`](#admin-knowledge-base-controller-publish) | Admin Knowledge Base Controller publish |
| `POST` | [`/v1/admins/knowledge-base/articles/:id/archive`](#admin-knowledge-base-controller-archive) | Admin Knowledge Base Controller archive |
| `GET` | [`/v1/admins/knowledge-base/articles/:id`](#admin-knowledge-base-controller-article) | Admin Knowledge Base Controller article |
| `PATCH` | [`/v1/admins/knowledge-base/articles/:id`](#admin-knowledge-base-controller-update-article) | Admin Knowledge Base Controller update Article |
| `DELETE` | [`/v1/admins/knowledge-base/articles/:id`](#admin-knowledge-base-controller-delete-article) | Admin Knowledge Base Controller delete Article |
| `GET` | [`/v1/admins/knowledge-base/articles`](#admin-knowledge-base-controller-articles) | Admin Knowledge Base Controller articles |
| `POST` | [`/v1/admins/knowledge-base/articles`](#admin-knowledge-base-controller-create-article) | Admin Knowledge Base Controller create Article |
| `GET` | [`/v1/admins`](#list-all-admin-accounts-super-only) | List all admin accounts (super-only) |
| `POST` | [`/v1/admins`](#create-a-new-admin-account-super-only) | Create a new admin account (super-only) |

---

## Endpoints

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

*No response example is provided in the collection.*


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

**Responses**

#### `201 Created`

*No response example is provided in the collection.*


### Get own admin profile

`GET /v1/admins/profile`

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


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

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


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

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### List all available admin permissions

`GET /v1/admins/permissions`

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


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

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### Delete an admin role (super-only)

`DELETE /v1/admins/roles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### List all admin roles (super-only)

`GET /v1/admins/roles`

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


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

**Responses**

#### `201 Created`

*No response example is provided in the collection.*


### Get admin detail by ID (super-only)

`GET /v1/admins/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


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

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### Delete an admin account (super-only)

`DELETE /v1/admins/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller update Category

`PATCH /v1/admins/knowledge-base/categories/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "string",
  "description": "string",
  "sortOrder": 7089.101590247997
}
```

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller delete Category

`DELETE /v1/admins/knowledge-base/categories/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller categories

`GET /v1/admins/knowledge-base/categories`

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller create Category

`POST /v1/admins/knowledge-base/categories`

**Request Body** (`application/json`)

```json
{
  "name": "string",
  "description": "string",
  "sortOrder": 7089.101590247997
}
```

**Responses**

#### `201 Created`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller publish

`POST /v1/admins/knowledge-base/articles/:id/publish`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `201 Created`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller archive

`POST /v1/admins/knowledge-base/articles/:id/archive`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `201 Created`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller article

`GET /v1/admins/knowledge-base/articles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller update Article

`PATCH /v1/admins/knowledge-base/articles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "title": "string",
  "bodyMarkdown": "string",
  "slug": "string",
  "summary": "string",
  "categoryId": "string",
  "tags": [
    "string",
    "string"
  ],
  "status": "archived",
  "sortOrder": 2444.747610231466,
  "isFeatured": true
}
```

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller delete Article

`DELETE /v1/admins/knowledge-base/articles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller articles

`GET /v1/admins/knowledge-base/articles`

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


### Admin Knowledge Base Controller create Article

`POST /v1/admins/knowledge-base/articles`

**Request Body** (`application/json`)

```json
{
  "title": "string",
  "bodyMarkdown": "string",
  "slug": "string",
  "summary": "string",
  "categoryId": "string",
  "tags": [
    "string",
    "string"
  ],
  "status": "archived",
  "sortOrder": 2444.747610231466,
  "isFeatured": true
}
```

**Responses**

#### `201 Created`

*No response example is provided in the collection.*


### List all admin accounts (super-only)

`GET /v1/admins`

**Responses**

#### `200 OK`

*No response example is provided in the collection.*


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

**Responses**

#### `201 Created`

*No response example is provided in the collection.*
