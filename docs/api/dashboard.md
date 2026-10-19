# Dashboard & Analytics API

Key performance indicator metrics, cash balance summaries, monthly income vs. expense cash flows, profit breakdown, and user analytics.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/dashboard/stats`](#dashboard-stat-cards) | Staff, customers, catalog, orders, invoices, income, expenses, and percentage changes |
| `GET` | [`/v1/dashboard/income-expense`](#monthly-income-vs-expense-chart-for-a-given-year) | Monthly income vs expense chart for a given year |
| `GET` | [`/v1/dashboard/balance`](#balance-summary-total-today-this-month) | Balance summary — total, today, this month |
| `GET` | [`/v1/dashboard/profit`](#monthly-profit-chart-income-expense-for-a-given-year) | Monthly profit chart (income − expense) for a given year |
| `GET` | [`/v1/dashboard/user-analytics`](#user-analytics-donut-chart-users-products-expenses-revenue) | User analytics donut chart — users, products, expenses, revenue |

---

## Endpoints

### Dashboard stat cards

`GET /v1/dashboard/stats`

**Response**

#### `200 OK`

```json
{
  "totalStaffs": 3,
  "totalInvoices": 2,
  "pendingOrders": 2,
  "totalCustomers": 3,
  "totalProducts": 2,
  "totalServices": 1,
  "totalCustomersChange": 0,
  "totalProductsChange": 0,
  "totalServicesChange": 0,
  "pendingOrdersChange": 0,
  "totalInvoicesChange": 0,
  "totalIncome": 1275,
  "totalIncomeChange": 0,
  "totalExpenses": 13,
  "totalExpensesChange": 0
}
```

The `*Change` fields are percentages. The response does not include a change percentage for `totalStaffs`.

---

### Monthly income vs expense chart for a given year

`GET /v1/dashboard/income-expense?year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `year` | `2026` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---

### Balance summary — total, today, this month

`GET /v1/dashboard/balance`

**Example responses from the collection**

#### `200 OK`

---

### Monthly profit chart (income − expense) for a given year

`GET /v1/dashboard/profit?year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `year` | `2026` | Filter / pagination param |

**Example responses from the collection**

#### `200 OK`

---

### User analytics donut chart — users, products, expenses, revenue

`GET /v1/dashboard/user-analytics`

**Example responses from the collection**

#### `200 OK`

---
