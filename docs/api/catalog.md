# Product Catalog, Services & Categories API

Inventory items, physical products, recurring/one-off services, item categories, stock level adjustments, CSV bulk exports, and streaming async imports.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/categories/:id`](#get-a-category-by-id) | Get a category by ID |
| `PATCH` | [`/v1/categories/:id`](#update-a-category) | Update a category |
| `DELETE` | [`/v1/categories/:id`](#delete-a-category) | Delete a category |
| `POST` | [`/v1/categories`](#create-a-new-category) | Create a new category |
| `GET` | [`/v1/categories`](#get-all-categories) | Get all categories |
| `GET` | [`/v1/products/export`](#export-products-to-csv-streamed-download-mirrors-list-filters-) | Export products to CSV (streamed download, mirrors list filters) |
| `PATCH` | [`/v1/products/:id/stock`](#adjust-stock-quantity-positive-to-add-negative-to-subtract-) | Adjust stock quantity (positive to add, negative to subtract) |
| `GET` | [`/v1/products/:id`](#get-a-product-by-id) | Get a product by ID |
| `PATCH` | [`/v1/products/:id`](#update-a-product) | Update a product |
| `DELETE` | [`/v1/products/:id`](#delete-a-product) | Delete a product |
| `POST` | [`/v1/products/import/async`](#bulk-import-products-from-a-large-csv-async-up-to-100mb-partial-success-sse-progress-) | Bulk import products from a large CSV (async, up to 100MB, partial success, SSE progress) |
| `POST` | [`/v1/products/import`](#bulk-import-products-from-csv-sync-2mb-1000-rows-all-or-nothing-) | Bulk import products from CSV (sync, ≤2MB / 1000 rows, all-or-nothing) |
| `POST` | [`/v1/products`](#create-a-product-or-service) | Create a product or service |
| `GET` | [`/v1/products`](#list-products-filter-by-category-type-stock-status-) | List products (filter by category, type, stock status) |
| `GET` | [`/v1/services/export`](#export-services-to-csv-streamed-download-mirrors-list-filters-) | Export services to CSV (streamed download, mirrors list filters) |
| `PATCH` | [`/v1/services/:id/toggle-active`](#toggle-service-active-status) | Toggle service active status |
| `GET` | [`/v1/services/:id`](#get-a-service-by-id) | Get a service by ID |
| `PATCH` | [`/v1/services/:id`](#update-a-service) | Update a service |
| `DELETE` | [`/v1/services/:id`](#delete-a-service) | Delete a service |
| `POST` | [`/v1/services/import/async`](#bulk-import-services-from-a-large-csv-async-up-to-100mb-partial-success-sse-progress-) | Bulk import services from a large CSV (async, up to 100MB, partial success, SSE progress) |
| `POST` | [`/v1/services/import`](#bulk-import-services-from-csv-sync-2mb-1000-rows-all-or-nothing-) | Bulk import services from CSV (sync, ≤2MB / 1000 rows, all-or-nothing) |
| `POST` | [`/v1/services`](#create-a-new-service) | Create a new service |
| `GET` | [`/v1/services`](#get-all-services) | Get all services |

---

## Endpoints

### Get a category by ID

`GET /v1/categories/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a category

`PATCH /v1/categories/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Electronics",
  "description": "All electronic products and gadgets"
}
```

**Responses**

#### `200 OK`

---

### Delete a category

`DELETE /v1/categories/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Create a new category

`POST /v1/categories`

**Request Body** (`application/json`)

```json
{
  "name": "Electronics",
  "description": "All electronic products and gadgets"
}
```

**Responses**

#### `201 Created`

---

### Get all categories

`GET /v1/categories?search=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Search by category name |

**Responses**

#### `200 OK`

---

### Export products to CSV (streamed download, mirrors list filters)

`GET /v1/products/export?search=string&categoryId=string&isActive=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `categoryId` | `string` | Filter / pagination param |
| `isActive` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Adjust stock quantity (positive to add, negative to subtract)

`PATCH /v1/products/:id/stock`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "adjustment": 10
}
```

**Responses**

#### `200 OK`

---

### Get a product by ID

`GET /v1/products/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a product

`PATCH /v1/products/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Electronic Metal Hat v2",
  "categoryId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "price": 950,
  "quantity": 20,
  "inStock": true,
  "description": "Updated description"
}
```

**Responses**

#### `200 OK`

---

### Delete a product

`DELETE /v1/products/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Bulk import products from a large CSV (async, up to 100MB, partial success, SSE progress)

`POST /v1/products/import/async`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Responses**

#### `201 Created`

---

### Bulk import products from CSV (sync, ≤2MB / 1000 rows, all-or-nothing)

`POST /v1/products/import`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Responses**

#### `201 Created`

---

### Create a product or service

`POST /v1/products`

**Request Body** (`application/json`)

```json
{
  "name": "Office Chair",
  "price": 45000,
  "description": "Ergonomic office chair with lumbar support",
  "categoryId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "type": "product",
  "cost": 30000,
  "currency": "NGN",
  "stock": 20,
  "trackInventory": true,
  "images": [
    "https://res.cloudinary.com/example/image1.jpg"
  ],
  "isActive": true
}
```

**Responses**

#### `201 Created`

---

### List products (filter by category, type, stock status)

`GET /v1/products?search=string&categoryId=string&isActive=false&type=product`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `categoryId` | `string` | Filter / pagination param |
| `isActive` | `false` | Filter / pagination param |
| `type` | `product` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Export services to CSV (streamed download, mirrors list filters)

`GET /v1/services/export?search=string&categoryId=string&isActive=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `categoryId` | `string` | Filter / pagination param |
| `isActive` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Toggle service active status

`PATCH /v1/services/:id/toggle-active`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Get a service by ID

`GET /v1/services/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Update a service

`PATCH /v1/services/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Request Body** (`application/json`)

```json
{
  "name": "Electronic Wooden Fish Pro",
  "image": "https://res.cloudinary.com/...",
  "price": 399.99,
  "categoryId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "description": "Updated description",
  "isActive": false
}
```

**Responses**

#### `200 OK`

---

### Delete a service

`DELETE /v1/services/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Responses**

#### `200 OK`

---

### Bulk import services from a large CSV (async, up to 100MB, partial success, SSE progress)

`POST /v1/services/import/async`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Responses**

#### `201 Created`

---

### Bulk import services from CSV (sync, ≤2MB / 1000 rows, all-or-nothing)

`POST /v1/services/import`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Responses**

#### `201 Created`

---

### Create a new service

`POST /v1/services`

**Request Body** (`application/json`)

```json
{
  "name": "Electronic Wooden Fish",
  "price": 324.99,
  "image": "https://res.cloudinary.com/...",
  "categoryId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "description": "Premium wooden fish service with electronic components",
  "isActive": true
}
```

**Responses**

#### `201 Created`

---

### Get all services

`GET /v1/services?search=string&categoryId=string&isActive=false`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Search by service name |
| `categoryId` | `string` | Filter / pagination param |
| `isActive` | `false` | Filter / pagination param |

**Responses**

#### `200 OK`

---

