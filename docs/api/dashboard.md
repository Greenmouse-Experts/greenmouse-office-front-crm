# Tenant Dashboard & Real-Time Analytics API

Key performance indicator metrics, cash balance summaries, monthly income vs. expense cash flows, profit breakdown, and user analytics.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/dashboard/stats`](#stat-cards-total-staffs-invoices-pending-orders-customers-products) | Stat cards — total staffs, invoices, pending orders, customers, products |
| `GET` | [`/v1/dashboard/income-expense`](#monthly-income-vs-expense-chart-for-a-given-year) | Monthly income vs expense chart for a given year |
| `GET` | [`/v1/dashboard/balance`](#balance-summary-total-today-this-month) | Balance summary — total, today, this month |
| `GET` | [`/v1/dashboard/profit`](#monthly-profit-chart-income-expense-for-a-given-year) | Monthly profit chart (income − expense) for a given year |
| `GET` | [`/v1/dashboard/user-analytics`](#user-analytics-donut-chart-users-products-expenses-revenue) | User analytics donut chart — users, products, expenses, revenue |

---

## Endpoints

### Stat cards — total staffs, invoices, pending orders, customers, products

`GET /v1/dashboard/stats`

**Responses**

#### `200 OK`

---

### Monthly income vs expense chart for a given year

`GET /v1/dashboard/income-expense?year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `year` | `2026` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Balance summary — total, today, this month

`GET /v1/dashboard/balance`

**Responses**

#### `200 OK`

---

### Monthly profit chart (income − expense) for a given year

`GET /v1/dashboard/profit?year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `year` | `2026` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### User analytics donut chart — users, products, expenses, revenue

`GET /v1/dashboard/user-analytics`

**Responses**

#### `200 OK`

---

