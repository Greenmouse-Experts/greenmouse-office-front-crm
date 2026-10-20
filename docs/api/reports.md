# Financial & Sales Reports API

Paid-ledger profit and loss, revenue, expenses, invoices, and pipeline analytics.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/reports/profit-loss`](#detailed-paid-ledger-profit-and-loss) | Detailed Paid-ledger profit and loss |
| `GET` | [`/v1/reports/revenue`](#paid-income-ledger-revenue-by-month-category) | Paid income-ledger revenue by month/category |
| `GET` | [`/v1/reports/expenses`](#paid-expense-ledger-report-by-business-date-and-category) | Paid expense-ledger report by business date and category |
| `GET` | [`/v1/reports/invoice-revenue`](#currency-filtered-invoice-revenue-and-remaining-balances) | Currency-filtered invoice revenue and remaining balances |
| `GET` | [`/v1/reports/outstanding-invoices`](#paginated-current-outstanding-invoice-balances) | Paginated current outstanding invoice balances |
| `GET` | [`/v1/reports/pipeline-funnel`](#deals-funnel-by-stage-with-counts-and-values) | Deals funnel by stage with counts and values |
| `GET` | [`/v1/reports/win-rate`](#win-loss-counts-win-rate-and-monthly-trend) | Win/loss counts, win rate and monthly trend |
| `GET` | [`/v1/reports/avg-deal`](#average-won-deal-value-with-monthly-series) | Average won-deal value with monthly series |
| `GET` | [`/v1/reports/cycle-time`](#average-days-to-close-won-deals-with-monthly-series) | Average days to close won deals with monthly series |
| `GET` | [`/v1/reports/revenue-trend`](#monthly-invoiced-vs-received-with-outstanding-total) | Monthly invoiced vs received with outstanding total |
| `GET` | [`/v1/reports/stage-dwell`](#average-time-deals-spend-in-each-pipeline-stage) | Average time deals spend in each pipeline stage |

---

## Endpoints

### Detailed Paid-ledger profit and loss

`GET /v1/reports/profit-loss?year=2657.0056544389954&from=1956-01-31&to=1956-01-31`

Paid income minus Paid expenses; invoice cash is separate. Advanced Reports feature required. Ledger records have no currency field.

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `year` | `2657.0056544389954` | Current UTC year by default. Cannot be combined with from/to. |
| `from` | `1956-01-31` | Inclusive date; from/to must both be supplied |
| `to` | `1956-01-31` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

```json
{
  "basis": "paid-ledger",
  "period": {
    "from": "2004-04-21",
    "to": "2014-01-21"
  },
  "incomeTotal": 5459.737738678281,
  "expenseTotal": 6657.772883865862,
  "profit": 9233.367518166748,
  "monthly": [
    {
      "month": "string",
      "income": 1439.4109968648006,
      "expenses": 3047.243336347134,
      "profit": 5682.190669374742
    },
    {
      "month": "string",
      "income": 7226.928848161931,
      "expenses": 9978.654449065762,
      "profit": 9230.139438354345
    }
  ],
  "incomeByCategory": [
    {
      "categoryId": "66d58ac7-6fae-a269-e7dd-614d1dc21b49",
      "name": "string",
      "total": 2084.4620855607186,
      "count": 306.3412450100134
    },
    {
      "categoryId": "6387a61b-3b02-620f-6d54-7cca3a9ec5bd",
      "name": "string",
      "total": 4871.047198855056,
      "count": 2522.826390578499
    }
  ],
  "expenseByCategory": [
    {
      "categoryId": "7fbcc3c1-8753-d0ac-32ab-263ba3d72589",
      "name": "string",
      "total": 295.1912041376148,
      "count": 2112.5037707119886
    },
    {
      "categoryId": "a286231f-e9ce-f7bd-b78a-0ad17fb18fd1",
      "name": "string",
      "total": 5619.911774618169,
      "count": 1910.4306370172153
    }
  ]
}
```

#### `400 Bad Request`

#### `403 Forbidden`

---

### Paid income-ledger revenue by month/category

`GET /v1/reports/revenue?from=2026-10-01&to=2026-10-31`

For a single month, supply its first and last dates with `from` and `to`.

Not combined with invoice cash. Advanced Reports feature required.

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `year` | `2657.0056544389954` | Current UTC year by default. Cannot be combined with from/to. |
| `from` | `1956-01-31` | Inclusive date; from/to must both be supplied |
| `to` | `1956-01-31` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

```json
{
  "basis": "paid-ledger",
  "period": {
    "from": "1974-09-28",
    "to": "1981-07-27"
  },
  "total": 2849.1946599006824,
  "count": 1378.9622992815343,
  "monthly": [
    {
      "month": "2026-01",
      "total": 3216.393501251502,
      "count": 9704.446867510414
    },
    {
      "month": "2026-01",
      "total": 3420.125036272652,
      "count": 2129.945196718865
    }
  ],
  "byCategory": [
    {
      "categoryId": "06ff1824-cb13-b7d1-5ce3-37bdce63aab9",
      "name": "string",
      "total": 9461.379657984195,
      "count": 3292.3590375620406
    },
    {
      "categoryId": "8190c229-4ce8-2cab-fc7a-804830f79643",
      "name": "string",
      "total": 6287.4626797073915,
      "count": 8623.721963798067
    }
  ]
}
```

---

### Paid expense-ledger report by business date and category

`GET /v1/reports/expenses?from=2026-10-01&to=2026-10-31`

For a single month, supply its first and last dates with `from` and `to`.

Advanced Reports feature required.

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `year` | `2657.0056544389954` | Current UTC year by default. Cannot be combined with from/to. |
| `from` | `1956-01-31` | Inclusive date; from/to must both be supplied |
| `to` | `1956-01-31` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

```json
{
  "basis": "paid-ledger",
  "period": {
    "from": "1974-09-28",
    "to": "1981-07-27"
  },
  "total": 2849.1946599006824,
  "count": 1378.9622992815343,
  "monthly": [
    {
      "month": "2026-01",
      "total": 3216.393501251502,
      "count": 9704.446867510414
    },
    {
      "month": "2026-01",
      "total": 3420.125036272652,
      "count": 2129.945196718865
    }
  ],
  "byCategory": [
    {
      "categoryId": "06ff1824-cb13-b7d1-5ce3-37bdce63aab9",
      "name": "string",
      "total": 9461.379657984195,
      "count": 3292.3590375620406
    },
    {
      "categoryId": "8190c229-4ce8-2cab-fc7a-804830f79643",
      "name": "string",
      "total": 6287.4626797073915,
      "count": 8623.721963798067
    }
  ]
}
```

---

### Currency-filtered invoice revenue and remaining balances

`GET /v1/reports/invoice-revenue?year=2657.0056544389954&from=1956-01-31&to=1956-01-31&currency=NGN`

Billed excludes draft/cancelled. Received includes actual partial payments and unrecorded legacy settlements. Outstanding is current/all-time. Advanced Reports feature required.

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `year` | `2657.0056544389954` | Current UTC year by default. Cannot be combined with from/to. |
| `from` | `1956-01-31` | Inclusive date; from/to must both be supplied |
| `to` | `1956-01-31` | Filter / pagination param |
| `currency` | `NGN` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

```json
{
  "period": {
    "from": "1991-12-26",
    "to": "2007-12-20"
  },
  "currency": "string",
  "invoicedTotal": 6938.023447018045,
  "receivedTotal": 5644.680731489604,
  "outstandingTotal": 9128.985826844213,
  "outstandingCount": 402.37537703183614,
  "legacyPaidWithoutDateCount": 3691.690100769027,
  "monthly": [
    {
      "month": "string",
      "invoiced": 7901.009916262274,
      "received": 385.33763392085916
    },
    {
      "month": "string",
      "invoiced": 7580.258216609402,
      "received": 7583.444501851975
    }
  ]
}
```

---

### Paginated current outstanding invoice balances

`GET /v1/reports/outstanding-invoices?currency=NGN&page=1&limit=20`

Positive total-minus-paid balances for sent/partial/overdue, newest issued date then ID first. Currency filtered, all-time; Advanced Reports required.

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `currency` | `NGN` | Filter / pagination param |
| `page` | `1` | Filter / pagination param |
| `limit` | `20` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

```json
{
  "currency": "string",
  "data": [
    {
      "id": "e4c41a20-46a0-0673-385c-5eca998d3cbc",
      "invoiceNumber": "string",
      "issuedDate": "2010-07-07",
      "dueDate": "1973-09-06",
      "status": "string",
      "currency": "string",
      "total": 624.4847732053161,
      "amountPaid": 2932.345554420892,
      "balanceDue": 1545.5303632869288,
      "contactId": "eac96c59-3a1f-44d6-9af9-e09a88ac94ec",
      "customer": {
        "id": "3a23949a-55fd-ceee-6661-83782a0fadbd",
        "firstName": "string",
        "lastName": "string",
        "companyName": "string"
      }
    },
    {
      "id": "644a4d67-025a-efc9-8202-414891afd8f3",
      "invoiceNumber": "string",
      "issuedDate": "1976-09-14",
      "dueDate": "2010-07-11",
      "status": "string",
      "currency": "string",
      "total": 5379.3351545427395,
      "amountPaid": 7231.48048629475,
      "balanceDue": 9752.335062153941,
      "contactId": "9815bac6-a1ca-76a3-e05f-257afec264ca",
      "customer": {
        "id": "89383e8a-cd3e-65ef-4b25-2fdc3ec1f2ab",
        "firstName": "string",
        "lastName": "string",
        "companyName": "string"
      }
    }
  ],
  "total": 7646.360027933554,
  "page": 1233.0775342007082,
  "limit": 8256.565571487765,
  "totalPages": 4246.231080980152,
  "hasNextPage": false,
  "hasPrevPage": true
}
```

---

### Deals funnel by stage with counts and values

`GET /v1/reports/pipeline-funnel?pipelineId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---

### Win/loss counts, win rate and monthly trend

`GET /v1/reports/win-rate?pipelineId=string&year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |
| `year` | `2026` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---

### Average won-deal value with monthly series

`GET /v1/reports/avg-deal?pipelineId=string&year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |
| `year` | `2026` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---

### Average days to close won deals with monthly series

`GET /v1/reports/cycle-time?pipelineId=string&year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |
| `year` | `2026` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---

### Monthly invoiced vs received with outstanding total

`GET /v1/reports/revenue-trend?year=2657.0056544389954&currency=NGN`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `year` | `2657.0056544389954` | Filter / pagination param |
| `currency` | `NGN` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---

### Average time deals spend in each pipeline stage

`GET /v1/reports/stage-dwell?pipelineId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---
