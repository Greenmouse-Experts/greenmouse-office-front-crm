# Tenant Authentication, Onboarding & Security API

Business owner account registration, email OTP verification, password recovery, session tokens, multi-step onboarding wizard, and audit login activity.

## Overview & Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | [`/v1/tenant/auth/register`](#register-a-new-business-account) | Register a new business account |
| `POST` | [`/v1/tenant/auth/verify-email`](#verify-email-with-otp) | Verify email with OTP |
| `POST` | [`/v1/tenant/auth/resend-otp`](#resend-email-verification-otp) | Resend email verification OTP |
| `PATCH` | [`/v1/tenant/auth/change-email`](#change-email-before-verification-re-sends-otp-to-new-email-) | Change email before verification (re-sends OTP to new email) |
| `POST` | [`/v1/tenant/auth/login`](#business-owner-login) | Business owner login |
| `POST` | [`/v1/tenant/auth/refresh`](#refresh-access-token) | Refresh access token |
| `POST` | [`/v1/tenant/auth/forgot-password`](#request-password-reset-otp) | Request password reset OTP |
| `POST` | [`/v1/tenant/auth/reset-password`](#reset-password-using-otp) | Reset password using OTP |
| `POST` | [`/v1/tenant/auth/logout`](#logout-current-tenant) | Logout current tenant |
| `GET` | [`/v1/tenant/auth/me`](#get-current-tenant-profile) | Get current tenant profile |
| `GET` | [`/v1/tenant/login-activity/latest`](#get-latest-login-activity) | Get latest login activity |
| `GET` | [`/v1/tenant/login-activity`](#get-recent-login-activities-paginated-) | Get recent login activities (paginated) |
| `POST` | [`/v1/tenant/onboarding/complete`](#mark-onboarding-as-complete) | Mark onboarding as complete |
| `GET` | [`/v1/tenant/onboarding`](#get-current-onboarding-status-and-saved-data) | Get current onboarding status and saved data |
| `PATCH` | [`/v1/tenant/onboarding`](#save-onboarding-step-data-can-be-called-multiple-times-) | Save onboarding step data (can be called multiple times) |

---

## Endpoints

### Register a new business account

`POST /v1/tenant/auth/register`

**Request Body** (`application/json`)

```json
{
  "email": "john@acmecorp.com",
  "password": "StrongPass123!",
  "companyName": "Acme Corp",
  "phoneNumber": "+2348012345678"
}
```

**Responses**

#### `201 Created`

```json
{
  "message": "Registration successful. Please check your email for the verification code.",
  "email": "john@acmecorp.com"
}
```

#### `409 Conflict`

---

### Verify email with OTP

`POST /v1/tenant/auth/verify-email`

**Request Body** (`application/json`)

```json
{
  "email": "john@acmecorp.com",
  "otp": "482910"
}
```

**Responses**

#### `200 OK`

```json
{
  "message": "Operation completed successfully."
}
```

#### `400 Bad Request`

---

### Resend email verification OTP

`POST /v1/tenant/auth/resend-otp`

**Request Body** (`application/json`)

```json
{
  "email": "john@acmecorp.com"
}
```

**Responses**

#### `200 OK`

```json
{
  "message": "Operation completed successfully."
}
```

---

### Change email before verification (re-sends OTP to new email)

`PATCH /v1/tenant/auth/change-email`

**Request Body** (`application/json`)

```json
{
  "currentEmail": "old@example.com",
  "newEmail": "new@example.com"
}
```

**Responses**

#### `200 OK`

```json
{
  "message": "Email updated. A new verification code has been sent to your new email address.",
  "email": "newemail@acmecorp.com"
}
```

#### `400 Bad Request`

#### `409 Conflict`

---

### Business owner login

`POST /v1/tenant/auth/login`

**Request Body** (`application/json`)

```json
{
  "email": "john@acmecorp.com",
  "password": "StrongPass123!"
}
```

**Responses**

#### `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "664f1b2c9d3e4a5b6c7d8e9f",
    "email": "john@acmecorp.com",
    "companyName": "Acme Corp",
    "isOnboarded": false,
    "userType": "tenant"
  }
}
```

#### `401 Unauthorized`

---

### Refresh access token

`POST /v1/tenant/auth/refresh`

**Responses**

#### `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `401 Unauthorized`

---

### Request password reset OTP

`POST /v1/tenant/auth/forgot-password`

**Request Body** (`application/json`)

```json
{
  "email": "john@acmecorp.com"
}
```

**Responses**

#### `200 OK`

```json
{
  "message": "Operation completed successfully."
}
```

---

### Reset password using OTP

`POST /v1/tenant/auth/reset-password`

**Request Body** (`application/json`)

```json
{
  "email": "john@acmecorp.com",
  "otp": "482910",
  "newPassword": "NewStrongPass123!"
}
```

**Responses**

#### `200 OK`

```json
{
  "message": "Operation completed successfully."
}
```

#### `400 Bad Request`

---

### Logout current tenant

`POST /v1/tenant/auth/logout`

**Responses**

#### `200 OK`

```json
{
  "message": "Operation completed successfully."
}
```

---

### Get current tenant profile

`GET /v1/tenant/auth/me`

**Responses**

#### `200 OK`

```json
{
  "sub": "664f1b2c9d3e4a5b6c7d8e9f",
  "email": "john@acmecorp.com",
  "companyName": "Acme Corp",
  "userType": "tenant",
  "isOnboarded": false
}
```

---

### Get latest login activity

`GET /v1/tenant/login-activity/latest`

**Responses**

#### `200 OK`

---

### Get recent login activities (paginated)

`GET /v1/tenant/login-activity?page=5705.605456861728&limit=5705.605456861728`

**Query Parameters**

| Parameter | Type / Example | Description |
| :--- | :--- | :--- |
| `page` | `5705.605456861728` | Filter / pagination param |
| `limit` | `5705.605456861728` | Filter / pagination param |

**Responses**

#### `200 OK`

---

### Mark onboarding as complete

`POST /v1/tenant/onboarding/complete`

**Responses**

#### `200 OK`

```json
{
  "message": "Onboarding completed successfully"
}
```

---

### Get current onboarding status and saved data

`GET /v1/tenant/onboarding`

**Responses**

#### `200 OK`

```json
{
  "id": "664f1b2c9d3e4a5b6c7d8e9f",
  "companyName": "Acme Corp",
  "isOnboarded": false,
  "industry": "technology",
  "teamSize": "11-50",
  "logo": "https://res.cloudinary.com/example/logo.png",
  "theme": "light",
  "companyAddress": "15 Marina Road",
  "companyCity": "Lagos",
  "companyState": "Lagos State",
  "companyCountry": "Nigeria",
  "companyWebsite": "https://acmecorp.com",
  "businessType": "Limited Liability Company",
  "isCacRegistered": true,
  "hearAboutUs": "Social Media"
}
```

---

### Save onboarding step data (can be called multiple times)

`PATCH /v1/tenant/onboarding`

**Request Body** (`application/json`)

```json
{
  "industry": "Manufacturing",
  "teamSize": "51-200",
  "logo": "https://res.cloudinary.com/...",
  "theme": "light",
  "companyAddress": "15 Marina Road, Lagos",
  "companyCity": "Lagos",
  "companyCountry": "Nigeria",
  "companyWebsite": "https://acmecorp.com",
  "companyState": "Lagos",
  "businessType": "Limited Liability Company",
  "isCacRegistered": true,
  "hearAboutUs": "Social Media"
}
```

**Responses**

#### `200 OK`

```json
{
  "id": "664f1b2c9d3e4a5b6c7d8e9f",
  "companyName": "Acme Corp",
  "isOnboarded": false,
  "industry": "technology",
  "teamSize": "11-50",
  "logo": "https://res.cloudinary.com/example/logo.png",
  "theme": "light",
  "companyAddress": "15 Marina Road",
  "companyCity": "Lagos",
  "companyState": "Lagos State",
  "companyCountry": "Nigeria",
  "companyWebsite": "https://acmecorp.com",
  "businessType": "Limited Liability Company",
  "isCacRegistered": true,
  "hearAboutUs": "Social Media"
}
```

---

