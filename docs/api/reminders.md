# Reminders & Notification Preferences API

User notification settings, dispatch channels (email/push), reminder schedules, and preference persistence.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/v1/reminders/preferences`](#get-my-reminder-preferences-defaults-if-never-set-) | Get my reminder preferences (defaults if never set) |
| `PATCH` | [`/v1/reminders/preferences`](#update-my-reminder-preferences) | Update my reminder preferences |

---

## Endpoints

### Get my reminder preferences (defaults if never set)

`GET /v1/reminders/preferences`

**Responses**

#### `200 OK`

---

### Update my reminder preferences

`PATCH /v1/reminders/preferences`

**Request Body** (`application/json`)

```json
{
  "invoiceDueEnabled": true,
  "invoiceOverdueEnabled": true,
  "dealCloseEnabled": true,
  "quoteExpiryEnabled": true,
  "leadDaysBefore": 3,
  "sendHour": 8,
  "timezone": "Africa/Lagos",
  "recipientScope": "tenant_only"
}
```

**Responses**

#### `200 OK`

---

