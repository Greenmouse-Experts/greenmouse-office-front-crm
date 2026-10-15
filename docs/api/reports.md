# Sales & Pipeline Analytics Reports API

Advanced analytics including pipeline funnel progression, win/loss conversion rates, average deal sizing, sales cycle velocity, revenue trends, and stage dwell durations.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/reports/pipeline-funnel`](#deals-funnel-by-stage-with-counts-and-values) | Deals funnel by stage with counts and values |
| `GET` | [`/v1/reports/win-rate`](#win-loss-counts-win-rate-and-monthly-trend) | Win/loss counts, win rate and monthly trend |
| `GET` | [`/v1/reports/avg-deal`](#average-won-deal-value-with-monthly-series) | Average won-deal value with monthly series |
| `GET` | [`/v1/reports/cycle-time`](#average-days-to-close-won-deals-with-monthly-series) | Average days to close won deals with monthly series |
| `GET` | [`/v1/reports/revenue-trend`](#monthly-invoiced-vs-received-with-outstanding-total) | Monthly invoiced vs received with outstanding total |
| `GET` | [`/v1/reports/stage-dwell`](#average-time-deals-spend-in-each-pipeline-stage) | Average time deals spend in each pipeline stage |

---

## Endpoints

### Deals funnel by stage with counts and values

`GET /v1/reports/pipeline-funnel?pipelineId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Win/loss counts, win rate and monthly trend

`GET /v1/reports/win-rate?pipelineId=string&year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |
| `year` | `2026` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Average won-deal value with monthly series

`GET /v1/reports/avg-deal?pipelineId=string&year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |
| `year` | `2026` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Average days to close won deals with monthly series

`GET /v1/reports/cycle-time?pipelineId=string&year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |
| `year` | `2026` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Monthly invoiced vs received with outstanding total

`GET /v1/reports/revenue-trend?year=2026`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `year` | `2026` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Average time deals spend in each pipeline stage

`GET /v1/reports/stage-dwell?pipelineId=string`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `pipelineId` | `string` | Filter / pagination param |

**Responses**

#### `200 OK`

---

