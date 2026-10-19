# Greenmouse Office CRM API Documentation (v1)

Generated from [Greenmouse Office CRM.postman_collection.json](../../Greenmouse%20Office%20CRM.postman_collection.json) with `bun scripts/update-api-docs.ts`. The collection defines the endpoints, request examples, and illustrative responses below; this is not a live server verification. Set `baseUrl` to the API origin when using the collection.

## API Documentation Modules

| Module | Documentation File | Endpoints Count | Scope & Purpose |
| :--- | :--- | :--- | :--- |
| **System & Platform Authentication API** | [`authentication.md`](./authentication.md) | 7 | System root greetings, health checks, and platform authentication for Super Admins and Staff members. |
| **Company Login Activity API** | [`company.md`](./company.md) | 2 | Recent and latest login activity for the current company. |
| **Knowledge Base API** | [`knowledge-base.md`](./knowledge-base.md) | 15 | Published help articles and categories, feedback, and admin article and category management. |
| **Super Admin Platform Management API** | [`admin.md`](./admin.md) | 14 | Super admin setup, admin accounts and roles, profile settings, and permission management. |
| **Staff Members & RBAC Roles API** | [`staff-and-roles.md`](./staff-and-roles.md) | 12 | Staff directory, staff account management, roles, and permission assignment. |
| **CRM Contacts & Companies API** | [`crm.md`](./crm.md) | 20 | Contacts, companies, notes, interactions, CSV export, and CSV imports. |
| **Tasks, Follow-ups & Activity Management API** | [`tasks.md`](./tasks.md) | 7 | Task creation, calendar scheduling, status updates, resource assignment, filtering, and activity tracking for CRM workflows. |
| **Product Catalog, Services & Categories API** | [`catalog.md`](./catalog.md) | 24 | Inventory items, physical products, recurring/one-off services, item categories, stock level adjustments, CSV bulk exports, and streaming async imports. |
| **Finance, Billing, Income, Expenses, Invoices & Receipts API** | [`finance.md`](./finance.md) | 38 | Revenue tracking, operating expense entries, status updates, invoice and receipt generation, custom HTML/PDF rendering, white-label branding, and payment reconciliation. |
| **Sales Pipeline, Leads, Deals, Quotes & Orders API** | [`sales.md`](./sales.md) | 42 | Lead capture and qualification, visual Kanban deal pipelines, stage reordering, quote generation, sales order fulfillment, and status tracking. |
| **Dashboard & Analytics API** | [`dashboard.md`](./dashboard.md) | 5 | Key performance indicator metrics, cash balance summaries, monthly income vs. expense cash flows, profit breakdown, and user analytics. |
| **Financial & Sales Reports API** | [`reports.md`](./reports.md) | 11 | Paid-ledger profit and loss, revenue, expenses, invoices, and pipeline analytics. |
| **Support Tickets & Helpdesk Threading API** | [`support.md`](./support.md) | 9 | Customer support tickets, agent ticket assignment, priority escalation, lifecycle status updates, and chronological reply threads. |
| **Notifications & Real-Time Alerts API** | [`notifications.md`](./notifications.md) | 4 | Company notifications, unread counts, and mark-read actions. |
| **Multimedia & Cloud Storage API** | [`media.md`](./media.md) | 1 | Direct asset uploads to Cloudinary for logos, avatars, PDFs, receipts, and media attachments. |
| **Bulk Data Import Jobs API** | [`import.md`](./import.md) | 4 | Validation contracts, downloadable CSV templates, and background import job status. |
| **Reminders & Notification Preferences API** | [`reminders.md`](./reminders.md) | 2 | User notification settings, dispatch channels (email/push), reminder schedules, and preference persistence. |
| **Internal Operations API** | [`internal.md`](./internal.md) | 1 | Internal email cron trigger. This is an operational endpoint, not a public client workflow. |

---

## Complete Endpoints Master Index (218 total endpoints)

| Method | Path | Action / Endpoint Name | Module Documentation |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/healthcheck` | App Controller get Health Check | [`authentication.md`](./authentication.md#app-controller-get-health-check) |
| `POST` | `/v1/auth/admin/login` | Super admin login | [`authentication.md`](./authentication.md#super-admin-login) |
| `POST` | `/v1/auth/staff/login` | Staff login | [`authentication.md`](./authentication.md#staff-login) |
| `POST` | `/v1/auth/refresh` | Refresh access token | [`authentication.md`](./authentication.md#refresh-access-token) |
| `POST` | `/v1/auth/logout` | Logout current user | [`authentication.md`](./authentication.md#logout-current-user) |
| `GET` | `/v1/auth/me` | Get current authenticated user | [`authentication.md`](./authentication.md#get-current-authenticated-user) |
| `GET` | `/v1` | App Controller get Hello | [`authentication.md`](./authentication.md#app-controller-get-hello) |
| `GET` | `/v1/company/login-activity/latest` | Get latest login activity | [`company.md`](./company.md#get-latest-login-activity) |
| `GET` | `/v1/company/login-activity` | Get recent login activities (paginated) | [`company.md`](./company.md#get-recent-login-activities-paginated-) |
| `PATCH` | `/v1/admins/knowledge-base/categories/:id` | Admin Knowledge Base Controller update Category | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-update-category) |
| `DELETE` | `/v1/admins/knowledge-base/categories/:id` | Admin Knowledge Base Controller delete Category | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-delete-category) |
| `GET` | `/v1/admins/knowledge-base/categories` | Admin Knowledge Base Controller categories | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-categories) |
| `POST` | `/v1/admins/knowledge-base/categories` | Admin Knowledge Base Controller create Category | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-create-category) |
| `POST` | `/v1/admins/knowledge-base/articles/:id/publish` | Admin Knowledge Base Controller publish | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-publish) |
| `POST` | `/v1/admins/knowledge-base/articles/:id/archive` | Admin Knowledge Base Controller archive | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-archive) |
| `GET` | `/v1/admins/knowledge-base/articles/:id` | Admin Knowledge Base Controller article | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-article) |
| `PATCH` | `/v1/admins/knowledge-base/articles/:id` | Admin Knowledge Base Controller update Article | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-update-article) |
| `DELETE` | `/v1/admins/knowledge-base/articles/:id` | Admin Knowledge Base Controller delete Article | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-delete-article) |
| `GET` | `/v1/admins/knowledge-base/articles` | Admin Knowledge Base Controller articles | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-articles) |
| `POST` | `/v1/admins/knowledge-base/articles` | Admin Knowledge Base Controller create Article | [`knowledge-base.md`](./knowledge-base.md#admin-knowledge-base-controller-create-article) |
| `GET` | `/v1/knowledge-base/categories` | List published help-center categories | [`knowledge-base.md`](./knowledge-base.md#list-published-help-center-categories) |
| `GET` | `/v1/knowledge-base/articles/:slug` | Get a published help-center article by slug | [`knowledge-base.md`](./knowledge-base.md#get-a-published-help-center-article-by-slug) |
| `POST` | `/v1/knowledge-base/articles/:id/feedback` | Mark a published article helpful or not helpful | [`knowledge-base.md`](./knowledge-base.md#mark-a-published-article-helpful-or-not-helpful) |
| `GET` | `/v1/knowledge-base/articles` | Search and list published help-center articles | [`knowledge-base.md`](./knowledge-base.md#search-and-list-published-help-center-articles) |
| `POST` | `/v1/admins/setup` | Create the first super admin account (one-time only) | [`admin.md`](./admin.md#create-the-first-super-admin-account-one-time-only-) |
| `GET` | `/v1/admins/profile` | Get own admin profile | [`admin.md`](./admin.md#get-own-admin-profile) |
| `PATCH` | `/v1/admins/profile` | Update own admin profile | [`admin.md`](./admin.md#update-own-admin-profile) |
| `PATCH` | `/v1/admins/change-password` | Change own admin password | [`admin.md`](./admin.md#change-own-admin-password) |
| `GET` | `/v1/admins/permissions` | List all available admin permissions | [`admin.md`](./admin.md#list-all-available-admin-permissions) |
| `PATCH` | `/v1/admins/roles/:id/permissions` | Update permissions on an admin role (super-only) | [`admin.md`](./admin.md#update-permissions-on-an-admin-role-super-only-) |
| `DELETE` | `/v1/admins/roles/:id` | Delete an admin role (super-only) | [`admin.md`](./admin.md#delete-an-admin-role-super-only-) |
| `GET` | `/v1/admins/roles` | List all admin roles (super-only) | [`admin.md`](./admin.md#list-all-admin-roles-super-only-) |
| `POST` | `/v1/admins/roles` | Create a new admin role (super-only) | [`admin.md`](./admin.md#create-a-new-admin-role-super-only-) |
| `GET` | `/v1/admins/:id` | Get admin detail by ID (super-only) | [`admin.md`](./admin.md#get-admin-detail-by-id-super-only-) |
| `PATCH` | `/v1/admins/:id` | Update admin account — role, status, profile (super-only) | [`admin.md`](./admin.md#update-admin-account-role-status-profile-super-only-) |
| `DELETE` | `/v1/admins/:id` | Delete an admin account (super-only) | [`admin.md`](./admin.md#delete-an-admin-account-super-only-) |
| `GET` | `/v1/admins` | List all admin accounts (super-only) | [`admin.md`](./admin.md#list-all-admin-accounts-super-only-) |
| `POST` | `/v1/admins` | Create a new admin account (super-only) | [`admin.md`](./admin.md#create-a-new-admin-account-super-only-) |
| `GET` | `/v1/staffs/:id` | Get a staff member by ID | [`staff-and-roles.md`](./staff-and-roles.md#get-a-staff-member-by-id) |
| `PATCH` | `/v1/staffs/:id` | Update a staff member | [`staff-and-roles.md`](./staff-and-roles.md#update-a-staff-member) |
| `DELETE` | `/v1/staffs/:id` | Delete a staff member | [`staff-and-roles.md`](./staff-and-roles.md#delete-a-staff-member) |
| `POST` | `/v1/staffs` | Create a new staff member | [`staff-and-roles.md`](./staff-and-roles.md#create-a-new-staff-member) |
| `GET` | `/v1/staffs` | Get all staff members | [`staff-and-roles.md`](./staff-and-roles.md#get-all-staff-members) |
| `GET` | `/v1/roles/permissions` | List assignable permissions with descriptions — use when creating/updating roles | [`staff-and-roles.md`](./staff-and-roles.md#list-assignable-permissions-with-descriptions-use-when-creating-updating-roles) |
| `PATCH` | `/v1/roles/:id/permissions` | Assign permissions to a role | [`staff-and-roles.md`](./staff-and-roles.md#assign-permissions-to-a-role) |
| `GET` | `/v1/roles/:id` | Get a role by ID | [`staff-and-roles.md`](./staff-and-roles.md#get-a-role-by-id) |
| `PATCH` | `/v1/roles/:id` | Update role name or description | [`staff-and-roles.md`](./staff-and-roles.md#update-role-name-or-description) |
| `DELETE` | `/v1/roles/:id` | Delete a role | [`staff-and-roles.md`](./staff-and-roles.md#delete-a-role) |
| `POST` | `/v1/roles` | Create a new role | [`staff-and-roles.md`](./staff-and-roles.md#create-a-new-role) |
| `GET` | `/v1/roles` | Get all roles | [`staff-and-roles.md`](./staff-and-roles.md#get-all-roles) |
| `GET` | `/v1/companies/export` | Export companies to CSV (streamed download, mirrors list filters) | [`crm.md`](./crm.md#export-companies-to-csv-streamed-download-mirrors-list-filters-) |
| `GET` | `/v1/companies/:id` | Get a company by ID | [`crm.md`](./crm.md#get-a-company-by-id) |
| `PATCH` | `/v1/companies/:id` | Update a company | [`crm.md`](./crm.md#update-a-company) |
| `DELETE` | `/v1/companies/:id` | Delete a company | [`crm.md`](./crm.md#delete-a-company) |
| `POST` | `/v1/companies/import/async` | Bulk import companies from a large CSV (async, up to 100MB, partial success, SSE progress) | [`crm.md`](./crm.md#bulk-import-companies-from-a-large-csv-async-up-to-100mb-partial-success-sse-progress-) |
| `POST` | `/v1/companies/import` | Bulk import companies from CSV (sync, ≤2MB / 1000 rows, all-or-nothing) | [`crm.md`](./crm.md#bulk-import-companies-from-csv-sync-2mb-1000-rows-all-or-nothing-) |
| `POST` | `/v1/companies` | Create a new company | [`crm.md`](./crm.md#create-a-new-company) |
| `GET` | `/v1/companies` | Get all companies | [`crm.md`](./crm.md#get-all-companies) |
| `GET` | `/v1/contacts/export` | Export contacts to CSV (streamed download) | [`crm.md`](./crm.md#export-contacts-to-csv-streamed-download-) |
| `POST` | `/v1/contacts/:id/notes` | Add a note to a contact | [`crm.md`](./crm.md#add-a-note-to-a-contact) |
| `GET` | `/v1/contacts/:id/notes` | List append-only contact notes | [`crm.md`](./crm.md#list-append-only-contact-notes) |
| `POST` | `/v1/contacts/:id/interactions` | Record a contact call, email or meeting | [`crm.md`](./crm.md#record-a-contact-call-email-or-meeting) |
| `GET` | `/v1/contacts/:id/interactions` | List contact interactions | [`crm.md`](./crm.md#list-contact-interactions) |
| `GET` | `/v1/contacts/:id` | Get a contact by ID | [`crm.md`](./crm.md#get-a-contact-by-id) |
| `PATCH` | `/v1/contacts/:id` | Update a contact | [`crm.md`](./crm.md#update-a-contact) |
| `DELETE` | `/v1/contacts/:id` | Delete a contact | [`crm.md`](./crm.md#delete-a-contact) |
| `POST` | `/v1/contacts/import/async` | Bulk import contacts from a large CSV (async, up to 100MB, partial success, SSE progress) | [`crm.md`](./crm.md#bulk-import-contacts-from-a-large-csv-async-up-to-100mb-partial-success-sse-progress-) |
| `POST` | `/v1/contacts/import` | Bulk import contacts from CSV (sync, ≤2MB / 1000 rows, all-or-nothing) | [`crm.md`](./crm.md#bulk-import-contacts-from-csv-sync-2mb-1000-rows-all-or-nothing-) |
| `POST` | `/v1/contacts` | Create a new contact | [`crm.md`](./crm.md#create-a-new-contact) |
| `GET` | `/v1/contacts` | List all contacts | [`crm.md`](./crm.md#list-all-contacts) |
| `GET` | `/v1/tasks/calendar` | Calendar view of tasks in a date range | [`tasks.md`](./tasks.md#calendar-view-of-tasks-in-a-date-range) |
| `PATCH` | `/v1/tasks/:id/status` | Change task status | [`tasks.md`](./tasks.md#change-task-status) |
| `GET` | `/v1/tasks/:id` | Get a task by ID | [`tasks.md`](./tasks.md#get-a-task-by-id) |
| `PATCH` | `/v1/tasks/:id` | Update a task | [`tasks.md`](./tasks.md#update-a-task) |
| `DELETE` | `/v1/tasks/:id` | Delete a task | [`tasks.md`](./tasks.md#delete-a-task) |
| `POST` | `/v1/tasks` | Create a task, follow-up or activity | [`tasks.md`](./tasks.md#create-a-task-follow-up-or-activity) |
| `GET` | `/v1/tasks` | List tasks (filter by status, type, dates) | [`tasks.md`](./tasks.md#list-tasks-filter-by-status-type-dates-) |
| `GET` | `/v1/categories/:id` | Get a category by ID | [`catalog.md`](./catalog.md#get-a-category-by-id) |
| `PATCH` | `/v1/categories/:id` | Update a category | [`catalog.md`](./catalog.md#update-a-category) |
| `DELETE` | `/v1/categories/:id` | Delete a category | [`catalog.md`](./catalog.md#delete-a-category) |
| `POST` | `/v1/categories` | Create a new category | [`catalog.md`](./catalog.md#create-a-new-category) |
| `GET` | `/v1/categories` | Get all categories | [`catalog.md`](./catalog.md#get-all-categories) |
| `GET` | `/v1/products/export` | Export products to CSV (streamed download, mirrors list filters) | [`catalog.md`](./catalog.md#export-products-to-csv-streamed-download-mirrors-list-filters-) |
| `GET` | `/v1/products/:id/stock-movements` | List immutable stock movement history | [`catalog.md`](./catalog.md#list-immutable-stock-movement-history) |
| `PATCH` | `/v1/products/:id/stock` | Adjust stock quantity (positive to add, negative to subtract) | [`catalog.md`](./catalog.md#adjust-stock-quantity-positive-to-add-negative-to-subtract-) |
| `GET` | `/v1/products/:id` | Get a product by ID | [`catalog.md`](./catalog.md#get-a-product-by-id) |
| `PATCH` | `/v1/products/:id` | Update a product | [`catalog.md`](./catalog.md#update-a-product) |
| `DELETE` | `/v1/products/:id` | Delete a product | [`catalog.md`](./catalog.md#delete-a-product) |
| `POST` | `/v1/products/import/async` | Bulk import products from a large CSV (async, up to 100MB, partial success, SSE progress) | [`catalog.md`](./catalog.md#bulk-import-products-from-a-large-csv-async-up-to-100mb-partial-success-sse-progress-) |
| `POST` | `/v1/products/import` | Bulk import products from CSV (sync, ≤2MB / 1000 rows, all-or-nothing) | [`catalog.md`](./catalog.md#bulk-import-products-from-csv-sync-2mb-1000-rows-all-or-nothing-) |
| `POST` | `/v1/products` | Create a product or service | [`catalog.md`](./catalog.md#create-a-product-or-service) |
| `GET` | `/v1/products` | List products (filter by category, type, stock status) | [`catalog.md`](./catalog.md#list-products-filter-by-category-type-stock-status-) |
| `GET` | `/v1/services/export` | Export services to CSV (streamed download, mirrors list filters) | [`catalog.md`](./catalog.md#export-services-to-csv-streamed-download-mirrors-list-filters-) |
| `PATCH` | `/v1/services/:id/toggle-active` | Toggle service active status | [`catalog.md`](./catalog.md#toggle-service-active-status) |
| `GET` | `/v1/services/:id` | Get a service by ID | [`catalog.md`](./catalog.md#get-a-service-by-id) |
| `PATCH` | `/v1/services/:id` | Update a service | [`catalog.md`](./catalog.md#update-a-service) |
| `DELETE` | `/v1/services/:id` | Delete a service | [`catalog.md`](./catalog.md#delete-a-service) |
| `POST` | `/v1/services/import/async` | Bulk import services from a large CSV (async, up to 100MB, partial success, SSE progress) | [`catalog.md`](./catalog.md#bulk-import-services-from-a-large-csv-async-up-to-100mb-partial-success-sse-progress-) |
| `POST` | `/v1/services/import` | Bulk import services from CSV (sync, ≤2MB / 1000 rows, all-or-nothing) | [`catalog.md`](./catalog.md#bulk-import-services-from-csv-sync-2mb-1000-rows-all-or-nothing-) |
| `POST` | `/v1/services` | Create a new service | [`catalog.md`](./catalog.md#create-a-new-service) |
| `GET` | `/v1/services` | Get all services | [`catalog.md`](./catalog.md#get-all-services) |
| `GET` | `/v1/financial-categories/:id` | Get a company financial category | [`finance.md`](./finance.md#get-a-company-financial-category) |
| `PATCH` | `/v1/financial-categories/:id` | Rename, archive or reactivate a company financial category (kind is immutable) | [`finance.md`](./finance.md#rename-archive-or-reactivate-a-company-financial-category-kind-is-immutable-) |
| `POST` | `/v1/financial-categories` | Create a company income or expense category | [`finance.md`](./finance.md#create-a-company-income-or-expense-category) |
| `GET` | `/v1/financial-categories` | List company financial categories (including archived unless filtered) | [`finance.md`](./finance.md#list-company-financial-categories-including-archived-unless-filtered-) |
| `PATCH` | `/v1/income/:id/status` | Update income status | [`finance.md`](./finance.md#update-income-status) |
| `GET` | `/v1/income/:id` | Get an income record by ID | [`finance.md`](./finance.md#get-an-income-record-by-id) |
| `PATCH` | `/v1/income/:id` | Update an income record | [`finance.md`](./finance.md#update-an-income-record) |
| `DELETE` | `/v1/income/:id` | Delete an income record | [`finance.md`](./finance.md#delete-an-income-record) |
| `POST` | `/v1/income` | Create an income record | [`finance.md`](./finance.md#create-an-income-record) |
| `GET` | `/v1/income` | Get all income records | [`finance.md`](./finance.md#get-all-income-records) |
| `POST` | `/v1/expenses/:id/receipt` | Upload or replace a single expense receipt | [`finance.md`](./finance.md#upload-or-replace-a-single-expense-receipt) |
| `PATCH` | `/v1/expenses/:id/status` | Update expense status | [`finance.md`](./finance.md#update-expense-status) |
| `GET` | `/v1/expenses/:id` | Get an expense record by ID | [`finance.md`](./finance.md#get-an-expense-record-by-id) |
| `PATCH` | `/v1/expenses/:id` | Update an expense record | [`finance.md`](./finance.md#update-an-expense-record) |
| `DELETE` | `/v1/expenses/:id` | Delete an expense record | [`finance.md`](./finance.md#delete-an-expense-record) |
| `POST` | `/v1/expenses` | Create an expense record | [`finance.md`](./finance.md#create-an-expense-record) |
| `GET` | `/v1/expenses` | Get all expense records | [`finance.md`](./finance.md#get-all-expense-records) |
| `GET` | `/v1/invoices/stats` | Get invoice statistics by status | [`finance.md`](./finance.md#get-invoice-statistics-by-status) |
| `GET` | `/v1/invoices/branding` | Get my invoice brand settings (merged over defaults) | [`finance.md`](./finance.md#get-my-invoice-brand-settings-merged-over-defaults-) |
| `PATCH` | `/v1/invoices/branding` | Create or update invoice brand settings (requires invoice_branding feature) | [`finance.md`](./finance.md#create-or-update-invoice-brand-settings-requires-invoice-branding-feature-) |
| `GET` | `/v1/invoices/:id/html` | Render invoice as HTML (branded when plan has invoice_branding, plain Greenmouse template otherwise) | [`finance.md`](./finance.md#render-invoice-as-html-branded-when-plan-has-invoice-branding-plain-greenmouse-template-otherwise-) |
| `GET` | `/v1/invoices/:id/pdf` | Download invoice as PDF (branded when plan has invoice_branding) | [`finance.md`](./finance.md#download-invoice-as-pdf-branded-when-plan-has-invoice-branding-) |
| `PATCH` | `/v1/invoices/:id/send` | Mark invoice as sent | [`finance.md`](./finance.md#mark-invoice-as-sent) |
| `PATCH` | `/v1/invoices/:id/mark-paid` | Mark invoice as paid (records paidAt timestamp) | [`finance.md`](./finance.md#mark-invoice-as-paid-records-paidat-timestamp-) |
| `PATCH` | `/v1/invoices/:id/status` | Update invoice status | [`finance.md`](./finance.md#update-invoice-status) |
| `POST` | `/v1/invoices/:id/payments` | Record a payment (full or partial) and auto-issue a receipt (RCP-YYYY-XXXXXX) | [`finance.md`](./finance.md#record-a-payment-full-or-partial-and-auto-issue-a-receipt-rcp-yyyy-xxxxxx-) |
| `GET` | `/v1/invoices/:id/payments` | List payment ledger entries for an invoice | [`finance.md`](./finance.md#list-payment-ledger-entries-for-an-invoice) |
| `GET` | `/v1/invoices/:id/receipts` | List all receipts for an invoice | [`finance.md`](./finance.md#list-all-receipts-for-an-invoice) |
| `GET` | `/v1/invoices/:id` | Get an invoice by ID | [`finance.md`](./finance.md#get-an-invoice-by-id) |
| `PATCH` | `/v1/invoices/:id` | Update a draft invoice | [`finance.md`](./finance.md#update-a-draft-invoice) |
| `DELETE` | `/v1/invoices/:id` | Delete an invoice | [`finance.md`](./finance.md#delete-an-invoice) |
| `POST` | `/v1/invoices` | Create a new invoice (invoice number auto-generated) | [`finance.md`](./finance.md#create-a-new-invoice-invoice-number-auto-generated-) |
| `GET` | `/v1/invoices` | List all invoices | [`finance.md`](./finance.md#list-all-invoices) |
| `GET` | `/v1/receipts/:id/html` | Render receipt as HTML (branded when entitled) | [`finance.md`](./finance.md#render-receipt-as-html-branded-when-entitled-) |
| `GET` | `/v1/receipts/:id/pdf` | Download receipt as PDF | [`finance.md`](./finance.md#download-receipt-as-pdf) |
| `POST` | `/v1/receipts/:id/void` | Void a receipt (reverses ledger entry, recalcs invoice balance) | [`finance.md`](./finance.md#void-a-receipt-reverses-ledger-entry-recalcs-invoice-balance-) |
| `POST` | `/v1/receipts/:id/resend` | Re-send an issued receipt email to the client (HTML + PDF attachment) | [`finance.md`](./finance.md#re-send-an-issued-receipt-email-to-the-client-html-pdf-attachment-) |
| `GET` | `/v1/receipts/:id` | Get a receipt by ID (with payment) | [`finance.md`](./finance.md#get-a-receipt-by-id-with-payment-) |
| `GET` | `/v1/orders/stats` | Get order statistics by status | [`sales.md`](./sales.md#get-order-statistics-by-status) |
| `PATCH` | `/v1/orders/:id/status` | Update order status | [`sales.md`](./sales.md#update-order-status) |
| `GET` | `/v1/orders/:id` | Get an order by ID with full item details | [`sales.md`](./sales.md#get-an-order-by-id-with-full-item-details) |
| `PATCH` | `/v1/orders/:id` | Update an order | [`sales.md`](./sales.md#update-an-order) |
| `DELETE` | `/v1/orders/:id` | Cancel / delete an order | [`sales.md`](./sales.md#cancel-delete-an-order) |
| `POST` | `/v1/orders` | Create a new order | [`sales.md`](./sales.md#create-a-new-order) |
| `GET` | `/v1/orders` | List all orders | [`sales.md`](./sales.md#list-all-orders) |
| `GET` | `/v1/quotes/stats` | Get quote statistics by status | [`sales.md`](./sales.md#get-quote-statistics-by-status) |
| `PATCH` | `/v1/quotes/:id/status` | Update quote status | [`sales.md`](./sales.md#update-quote-status) |
| `POST` | `/v1/quotes/:id/convert` | Convert a quote to an invoice or an order | [`sales.md`](./sales.md#convert-a-quote-to-an-invoice-or-an-order) |
| `GET` | `/v1/quotes/:id` | Get a quote by ID | [`sales.md`](./sales.md#get-a-quote-by-id) |
| `PATCH` | `/v1/quotes/:id` | Update a quote | [`sales.md`](./sales.md#update-a-quote) |
| `DELETE` | `/v1/quotes/:id` | Delete a quote | [`sales.md`](./sales.md#delete-a-quote) |
| `POST` | `/v1/quotes` | Create a new quote | [`sales.md`](./sales.md#create-a-new-quote) |
| `GET` | `/v1/quotes` | List all quotes | [`sales.md`](./sales.md#list-all-quotes) |
| `GET` | `/v1/leads/export` | Export leads to CSV (streamed download, mirrors list filters) | [`sales.md`](./sales.md#export-leads-to-csv-streamed-download-mirrors-list-filters-) |
| `POST` | `/v1/leads/:id/convert` | Convert a lead to a customer (and optionally a deal) | [`sales.md`](./sales.md#convert-a-lead-to-a-customer-and-optionally-a-deal-) |
| `GET` | `/v1/leads/:id` | Get a lead by ID | [`sales.md`](./sales.md#get-a-lead-by-id) |
| `PATCH` | `/v1/leads/:id` | Update a lead | [`sales.md`](./sales.md#update-a-lead) |
| `DELETE` | `/v1/leads/:id` | Delete a lead | [`sales.md`](./sales.md#delete-a-lead) |
| `POST` | `/v1/leads/import/async` | Bulk import leads from a large CSV (async, up to 100MB, partial success, SSE progress) | [`sales.md`](./sales.md#bulk-import-leads-from-a-large-csv-async-up-to-100mb-partial-success-sse-progress-) |
| `POST` | `/v1/leads/import` | Bulk import leads from CSV (sync, ≤2MB / 1000 rows, all-or-nothing) | [`sales.md`](./sales.md#bulk-import-leads-from-csv-sync-2mb-1000-rows-all-or-nothing-) |
| `POST` | `/v1/leads` | Create a new lead | [`sales.md`](./sales.md#create-a-new-lead) |
| `GET` | `/v1/leads` | List all leads | [`sales.md`](./sales.md#list-all-leads) |
| `PATCH` | `/v1/pipelines/:id/stages/:stageId` | Update a pipeline stage | [`sales.md`](./sales.md#update-a-pipeline-stage) |
| `DELETE` | `/v1/pipelines/:id/stages/:stageId` | Delete a pipeline stage | [`sales.md`](./sales.md#delete-a-pipeline-stage) |
| `PATCH` | `/v1/pipelines/:id/stages/reorder` | Reorder pipeline stages | [`sales.md`](./sales.md#reorder-pipeline-stages) |
| `POST` | `/v1/pipelines/:id/stages` | Add a stage to a pipeline | [`sales.md`](./sales.md#add-a-stage-to-a-pipeline) |
| `GET` | `/v1/pipelines/:id` | Get a pipeline with stages | [`sales.md`](./sales.md#get-a-pipeline-with-stages) |
| `PATCH` | `/v1/pipelines/:id` | Update a pipeline | [`sales.md`](./sales.md#update-a-pipeline) |
| `DELETE` | `/v1/pipelines/:id` | Delete a pipeline | [`sales.md`](./sales.md#delete-a-pipeline) |
| `POST` | `/v1/pipelines` | Create a new pipeline | [`sales.md`](./sales.md#create-a-new-pipeline) |
| `GET` | `/v1/pipelines` | List all pipelines | [`sales.md`](./sales.md#list-all-pipelines) |
| `PATCH` | `/v1/deals/:id/stage` | Move deal to a different stage (kanban drag-drop) | [`sales.md`](./sales.md#move-deal-to-a-different-stage-kanban-drag-drop-) |
| `POST` | `/v1/deals/:id/mark-won` | Mark deal as won | [`sales.md`](./sales.md#mark-deal-as-won) |
| `POST` | `/v1/deals/:id/mark-lost` | Mark deal as lost | [`sales.md`](./sales.md#mark-deal-as-lost) |
| `GET` | `/v1/deals/:id` | Get a deal by ID | [`sales.md`](./sales.md#get-a-deal-by-id) |
| `PATCH` | `/v1/deals/:id` | Update a deal | [`sales.md`](./sales.md#update-a-deal) |
| `DELETE` | `/v1/deals/:id` | Delete a deal | [`sales.md`](./sales.md#delete-a-deal) |
| `POST` | `/v1/deals` | Create a new deal | [`sales.md`](./sales.md#create-a-new-deal) |
| `GET` | `/v1/deals` | List all deals | [`sales.md`](./sales.md#list-all-deals) |
| `GET` | `/v1/dashboard/stats` | Staff, customers, catalog, orders, invoices, income, expenses, and percentage changes | [`dashboard.md`](./dashboard.md#dashboard-stat-cards) |
| `GET` | `/v1/dashboard/income-expense` | Monthly income vs expense chart for a given year | [`dashboard.md`](./dashboard.md#monthly-income-vs-expense-chart-for-a-given-year) |
| `GET` | `/v1/dashboard/balance` | Balance summary — total, today, this month | [`dashboard.md`](./dashboard.md#balance-summary-total-today-this-month) |
| `GET` | `/v1/dashboard/profit` | Monthly profit chart (income − expense) for a given year | [`dashboard.md`](./dashboard.md#monthly-profit-chart-income-expense-for-a-given-year) |
| `GET` | `/v1/dashboard/user-analytics` | User analytics donut chart — users, products, expenses, revenue | [`dashboard.md`](./dashboard.md#user-analytics-donut-chart-users-products-expenses-revenue) |
| `GET` | `/v1/reports/profit-loss` | Detailed Paid-ledger profit and loss | [`reports.md`](./reports.md#detailed-paid-ledger-profit-and-loss) |
| `GET` | `/v1/reports/revenue` | Paid income-ledger revenue by month/category | [`reports.md`](./reports.md#paid-income-ledger-revenue-by-month-category) |
| `GET` | `/v1/reports/expenses` | Paid expense-ledger report by business date and category | [`reports.md`](./reports.md#paid-expense-ledger-report-by-business-date-and-category) |
| `GET` | `/v1/reports/invoice-revenue` | Currency-filtered invoice revenue and remaining balances | [`reports.md`](./reports.md#currency-filtered-invoice-revenue-and-remaining-balances) |
| `GET` | `/v1/reports/outstanding-invoices` | Paginated current outstanding invoice balances | [`reports.md`](./reports.md#paginated-current-outstanding-invoice-balances) |
| `GET` | `/v1/reports/pipeline-funnel` | Deals funnel by stage with counts and values | [`reports.md`](./reports.md#deals-funnel-by-stage-with-counts-and-values) |
| `GET` | `/v1/reports/win-rate` | Win/loss counts, win rate and monthly trend | [`reports.md`](./reports.md#win-loss-counts-win-rate-and-monthly-trend) |
| `GET` | `/v1/reports/avg-deal` | Average won-deal value with monthly series | [`reports.md`](./reports.md#average-won-deal-value-with-monthly-series) |
| `GET` | `/v1/reports/cycle-time` | Average days to close won deals with monthly series | [`reports.md`](./reports.md#average-days-to-close-won-deals-with-monthly-series) |
| `GET` | `/v1/reports/revenue-trend` | Monthly invoiced vs received with outstanding total | [`reports.md`](./reports.md#monthly-invoiced-vs-received-with-outstanding-total) |
| `GET` | `/v1/reports/stage-dwell` | Average time deals spend in each pipeline stage | [`reports.md`](./reports.md#average-time-deals-spend-in-each-pipeline-stage) |
| `POST` | `/v1/tickets/:id/escalate` | Organization owner explicitly shares a ticket with platform support | [`support.md`](./support.md#organization-owner-explicitly-shares-a-ticket-with-platform-support) |
| `PATCH` | `/v1/tickets/:id/status` | Change ticket status | [`support.md`](./support.md#change-ticket-status) |
| `PATCH` | `/v1/tickets/:id/assign` | Assign ticket to a staff member | [`support.md`](./support.md#assign-ticket-to-a-staff-member) |
| `POST` | `/v1/tickets/:id/messages` | Reply to a ticket thread | [`support.md`](./support.md#reply-to-a-ticket-thread) |
| `GET` | `/v1/tickets/:id` | Get ticket detail with full message thread | [`support.md`](./support.md#get-ticket-detail-with-full-message-thread) |
| `PATCH` | `/v1/tickets/:id` | Update ticket subject, description or priority | [`support.md`](./support.md#update-ticket-subject-description-or-priority) |
| `DELETE` | `/v1/tickets/:id` | Delete a ticket | [`support.md`](./support.md#delete-a-ticket) |
| `POST` | `/v1/tickets` | Create a new support ticket | [`support.md`](./support.md#create-a-new-support-ticket) |
| `GET` | `/v1/tickets` | List all tickets (filter by status, priority, assigned staff) | [`support.md`](./support.md#list-all-tickets-filter-by-status-priority-assigned-staff-) |
| `GET` | `/v1/notifications/unread-count` | Get unread notification count | [`notifications.md`](./notifications.md#get-unread-notification-count) |
| `PATCH` | `/v1/notifications/:id/read` | Mark a single notification as read | [`notifications.md`](./notifications.md#mark-a-single-notification-as-read) |
| `PATCH` | `/v1/notifications/read-all` | Mark all notifications as read | [`notifications.md`](./notifications.md#mark-all-notifications-as-read) |
| `GET` | `/v1/notifications` | List notifications for the current company | [`notifications.md`](./notifications.md#list-notifications-for-the-current-company) |
| `POST` | `/v1/multimedia/upload` | Upload a file (image, video, or PDF) to Cloudinary | [`media.md`](./media.md#upload-a-file-image-video-or-pdf-to-cloudinary) |
| `GET` | `/v1/import/jobs/:id` | Get import job status (polling fallback) | [`import.md`](./import.md#get-import-job-status-polling-fallback-) |
| `GET` | `/v1/import/jobs` | List my recent import jobs (polling fallback) | [`import.md`](./import.md#list-my-recent-import-jobs-polling-fallback-) |
| `GET` | `/v1/import/contracts/:entity` | Machine-readable import contract (headers, field types, limits, live plan/quota) for building the frontend uploader | [`import.md`](./import.md#machine-readable-import-contract-headers-field-types-limits-live-plan-quota-for-building-the-frontend-uploader) |
| `GET` | `/v1/import/templates/:entity` | Download CSV template for an entity | [`import.md`](./import.md#download-csv-template-for-an-entity) |
| `GET` | `/v1/reminders/preferences` | Get my reminder preferences (defaults if never set) | [`reminders.md`](./reminders.md#get-my-reminder-preferences-defaults-if-never-set-) |
| `PATCH` | `/v1/reminders/preferences` | Update my reminder preferences | [`reminders.md`](./reminders.md#update-my-reminder-preferences) |
| `POST` | `/v1/internal/cron/email` | Cron Controller process Email | [`internal.md`](./internal.md#cron-controller-process-email) |
