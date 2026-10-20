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
| `GET` | [`/v1/products/:id/stock-movements`](#list-immutable-stock-movement-history) | List immutable stock movement history |
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

**Example responses from the collection**

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

**Example responses from the collection**

#### `200 OK`

---

### Delete a category

`DELETE /v1/categories/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Create a new category

`POST /v1/categories`

**Request Body** (`application/json`)

```json
{
  "name": "Electronics",
  "description": "All electronic products and gadgets",
  "type": "product"
}
```

**Example responses from the collection**

#### `201 Created`

---

### Get all categories

`GET /v1/categories?type=product&search=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Search by category name |
| `type` | `product` or `service` | Return categories for the selected catalog type |

**Example responses from the collection**

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

**Example responses from the collection**

#### `200 OK`

---

### List immutable stock movement history

`GET /v1/products/:id/stock-movements?page=1&limit=20`

Newest first by createdAt, then ID. No edit/delete routes, notifications or order deductions.

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `1` | Filter / pagination param |
| `limit` | `20` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

```json
{
  "data": [
    {
      "id": "d9671bbd-b280-b7ce-c85c-24a9dacd6e2c",
      "productId": "648374bb-580b-b7d5-051f-3eb7c9a72dce",
      "companyId": "b634b2a2-a8b2-d462-f8fd-b22b4faa6a92",
      "change": 6984.519499322181,
      "previousStock": 8278.563402817956,
      "newStock": 7148.742599900246,
      "source": "adjustment",
      "createdBy": "9f89b231-bdb3-90e0-e76b-c63580a00ae6",
      "createdAt": "1963-11-01T11:02:30.685Z"
    },
    {
      "id": "68aab960-a7d0-a70c-5583-e663e4eb87b3",
      "productId": "debf9bd4-2696-8182-260f-1cbdc7fb04ce",
      "companyId": "2d102f68-b206-fcf6-1592-0cc949f7d4c8",
      "change": 3695.947010195235,
      "previousStock": 9097.635313646999,
      "newStock": 4171.501035530252,
      "source": "adjustment",
      "createdBy": "c28c4aac-7231-1497-6e93-50225cc75a18",
      "createdAt": "2004-03-14T16:13:08.307Z"
    }
  ],
  "total": 1052.1042140364866,
  "page": 1572.4414051772228,
  "limit": 6633.0894961339945,
  "totalPages": 9021.200220593097,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

#### `404 Not Found`

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

**Example responses from the collection**

#### `200 OK`

---

### Get a product by ID

`GET /v1/products/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

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
  "name": "string",
  "type": "product",
  "price": 1380859721.28384,
  "cost": 490190541.84201443,
  "currency": "string",
  "stock": 827606091.2636967,
  "trackInventory": true,
  "images": [
    "string",
    "string"
  ],
  "isActive": true,
  "supplier": "string",
  "reorderLevel": 997722671.9661005,
  "description": "string",
  "categoryId": "bbc5e479-efbb-cc7f-16ab-0b4f889b9243",
  "quantity": 1676265287.7709136,
  "inStock": false
}
```

**Example responses from the collection**

#### `200 OK`

---

### Delete a product

`DELETE /v1/products/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `409 Conflict`

---

### Bulk import products from a large CSV (async, up to 100MB, partial success, SSE progress)

`POST /v1/products/import/async`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Example responses from the collection**

#### `201 Created`

---

### Bulk import products from CSV (sync, ≤2MB / 1000 rows, all-or-nothing)

`POST /v1/products/import`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Example responses from the collection**

#### `201 Created`

---

### Create a product or service

`POST /v1/products`

**Request Body** (`application/json`)

```json
{
  "name": "Office Chair",
  "price": 45000,
  "sku": "CHAIR-01",
  "reorderLevel": 1862371008.406165,
  "supplier": "Acme Supplies",
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

**Example responses from the collection**

#### `409 Conflict`

---

### List products (filter by category, type, stock status)

`GET /v1/products?search=string&categoryId=string&isActive=false&type=service`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `search` | `string` | Filter / pagination param |
| `categoryId` | `string` | Filter / pagination param |
| `isActive` | `false` | Filter / pagination param |
| `type` | `service` | Filter / pagination param |

**Example responses from the collection**

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

**Example responses from the collection**

#### `200 OK`

---

### Toggle service active status

`PATCH /v1/services/:id/toggle-active`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Get a service by ID

`GET /v1/services/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

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
  "price": 39999,
  "categoryId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "description": "Updated description",
  "isActive": false
}
```

**Example responses from the collection**

#### `200 OK`

---

### Delete a service

`DELETE /v1/services/:id`

**Path Parameters**

| Parameter | Description |
| :--- | :--- |
| `id` | Resource identifier |

**Example responses from the collection**

#### `200 OK`

---

### Bulk import services from a large CSV (async, up to 100MB, partial success, SSE progress)

`POST /v1/services/import/async`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Example responses from the collection**

#### `201 Created`

---

### Bulk import services from CSV (sync, ≤2MB / 1000 rows, all-or-nothing)

`POST /v1/services/import`

**Request Body** (`multipart/form-data`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `file` | `file` | Upload payload field |

**Example responses from the collection**

#### `201 Created`

---

### Create a new service

`POST /v1/services`

**Request Body** (`application/json`)

```json
{
  "name": "Electronic Wooden Fish",
  "price": 32499,
  "image": "https://res.cloudinary.com/...",
  "categoryId": "664f1b2c-9d3e-4a5b-8c7d-8e9f0a1b2c3d",
  "description": "Premium wooden fish service with electronic components",
  "isActive": true
}
```

**Example responses from the collection**

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

**Example responses from the collection**

#### `200 OK`

---
