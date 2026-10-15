# Knowledge Base API

Published help articles and categories, feedback, and admin article and category management.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
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
| `GET` | [`/v1/knowledge-base/categories`](#list-published-help-center-categories) | List published help-center categories |
| `GET` | [`/v1/knowledge-base/articles/:slug`](#get-a-published-help-center-article-by-slug) | Get a published help-center article by slug |
| `POST` | [`/v1/knowledge-base/articles/:id/feedback`](#mark-a-published-article-helpful-or-not-helpful) | Mark a published article helpful or not helpful |
| `GET` | [`/v1/knowledge-base/articles`](#search-and-list-published-help-center-articles) | Search and list published help-center articles |

---

## Endpoints

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

**Example responses from the collection**

#### `200 OK`

---

### Admin Knowledge Base Controller delete Category

`DELETE /v1/admins/knowledge-base/categories/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Admin Knowledge Base Controller categories

`GET /v1/admins/knowledge-base/categories`

**Example responses from the collection**

#### `200 OK`

---

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

**Example responses from the collection**

#### `201 Created`

---

### Admin Knowledge Base Controller publish

`POST /v1/admins/knowledge-base/articles/:id/publish`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `201 Created`

---

### Admin Knowledge Base Controller archive

`POST /v1/admins/knowledge-base/articles/:id/archive`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `201 Created`

---

### Admin Knowledge Base Controller article

`GET /v1/admins/knowledge-base/articles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

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

**Example responses from the collection**

#### `200 OK`

---

### Admin Knowledge Base Controller delete Article

`DELETE /v1/admins/knowledge-base/articles/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Admin Knowledge Base Controller articles

`GET /v1/admins/knowledge-base/articles`

**Example responses from the collection**

#### `200 OK`

---

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

**Example responses from the collection**

#### `201 Created`

---

### List published help-center categories

`GET /v1/knowledge-base/categories`

**Example responses from the collection**

#### `200 OK`

---

### Get a published help-center article by slug

`GET /v1/knowledge-base/articles/:slug`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `slug` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Mark a published article helpful or not helpful

`POST /v1/knowledge-base/articles/:id/feedback`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "helpful": true,
  "voterKey": "string"
}
```

**Example responses from the collection**

#### `201 Created`

---

### Search and list published help-center articles

`GET /v1/knowledge-base/articles?featured=&categoryId=&search=`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `featured` | `` | Filter / pagination param |
| `categoryId` | `` | Filter / pagination param |
| `search` | `` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---
