import fs from "fs";
import path from "path";

const postmanPath = "Greenmouse CRM API.postman_collection.json";
const col = JSON.parse(fs.readFileSync(postmanPath, "utf8"));
const v1 = col.item[0];

interface PostmanItem {
  name: string;
  request?: {
    method: string;
    description?: string;
    header?: Array<{ key: string; value: string }>;
    url: {
      raw?: string;
      path?: string[];
      query?: Array<{ key: string; value: string; description?: string }>;
      variable?: Array<{ key: string; value: string; description?: string }>;
    };
    body?: {
      mode: string;
      raw?: string;
      formdata?: Array<{ key: string; type: string; description?: string }>;
    };
  };
  response?: Array<{
    name: string;
    status: string;
    code: number;
    _postman_previewlanguage?: string;
    body?: string;
  }>;
  item?: PostmanItem[];
}

function extractAllEndpoints(
  node: PostmanItem,
  trail: string[] = [],
): Array<{ item: PostmanItem; trail: string[] }> {
  const result: Array<{ item: PostmanItem; trail: string[] }> = [];
  if (node.request) {
    result.push({ item: node, trail });
  }
  if (node.item) {
    for (const sub of node.item) {
      result.push(...extractAllEndpoints(sub, [...trail, node.name]));
    }
  }
  return result;
}

function formatEndpointMarkdown(item: PostmanItem): string {
  const req = item.request!;
  const method = req.method;
  let urlRaw =
    req.url.raw || (req.url.path ? "/" + req.url.path.join("/") : "");
  let cleanUrl = urlRaw.replace("{{baseUrl}}", "");
  if (!cleanUrl.startsWith("/")) cleanUrl = "/" + cleanUrl;

  let md = `### ${item.name}\n\n`;
  md += `\`${method} ${cleanUrl}\`\n\n`;

  if (req.description && req.description.trim()) {
    md += `${req.description.trim()}\n\n`;
  }

  // Path variables
  const pathVars = req.url.variable || [];
  if (pathVars.length > 0) {
    md += `**Path Parameters**\n\n`;
    md += `| Parameter | Description |\n| :--- | :--- |\n`;
    for (const v of pathVars) {
      md += `| \`${v.key}\` | ${v.description ? v.description.replace(/\n/g, " ") : "Resource identifier"} |\n`;
    }
    md += `\n`;
  }

  // Query parameters
  const queryParams = req.url.query || [];
  if (queryParams.length > 0) {
    md += `**Query Parameters**\n\n`;
    md += `| Parameter | Type / Example | Description |\n| :--- | :--- | :--- |\n`;
    for (const q of queryParams) {
      md += `| \`${q.key}\` | \`${q.value ?? ""}\` | ${q.description ? q.description.replace(/\n/g, " ") : "Filter / pagination param"} |\n`;
    }
    md += `\n`;
  }

  // Request Body
  if (req.body) {
    if (req.body.mode === "raw" && req.body.raw && req.body.raw.trim()) {
      md += `**Request Body** (\`application/json\`)\n\n`;
      let formatted = req.body.raw.trim();
      try {
        formatted = JSON.stringify(JSON.parse(formatted), null, 2);
      } catch (e) {}
      md += `\`\`\`json\n${formatted}\n\`\`\`\n\n`;
    } else if (
      req.body.mode === "formdata" &&
      req.body.formdata &&
      req.body.formdata.length > 0
    ) {
      md += `**Request Body** (\`multipart/form-data\`)\n\n`;
      md += `| Field | Type | Description |\n| :--- | :--- | :--- |\n`;
      for (const f of req.body.formdata) {
        md += `| \`${f.key}\` | \`${f.type}\` | ${f.description || "Upload payload field"} |\n`;
      }
      md += `\n`;
    }
  }

  // Responses
  const responses = item.response || [];
  if (responses.length > 0) {
    md += `**Responses**\n\n`;
    for (const res of responses) {
      md += `#### \`${res.code} ${res.status || ""}\`\n\n`;
      if (res.body && res.body.trim()) {
        let bodyStr = res.body.trim();
        let lang = "json";
        if (
          res._postman_previewlanguage === "html" ||
          bodyStr.startsWith("<!DOCTYPE") ||
          bodyStr.startsWith("<html")
        ) {
          lang = "html";
        } else {
          try {
            bodyStr = JSON.stringify(JSON.parse(bodyStr), null, 2);
          } catch (e) {}
        }
        md += `\`\`\`${lang}\n${bodyStr}\n\`\`\`\n\n`;
      }
    }
  }

  md += `---\n\n`;
  return md;
}

// Group definitions
const docsConfig: Record<
  string,
  {
    title: string;
    description: string;
    predicate: (trail: string[], item: PostmanItem) => boolean;
  }
> = {
  "authentication.md": {
    title: "System & Platform Authentication API",
    description:
      "System root greetings, health checks, and platform authentication for Super Admins and Staff members.",
    predicate: (trail, item) => {
      const top = trail[1] || "";
      return (
        top === "healthcheck" ||
        top === "auth" ||
        item?.name === "App Controller get Hello"
      );
    },
  },
  "tenant.md": {
    title: "Tenant Authentication, Onboarding & Security API",
    description:
      "Business owner account registration, email OTP verification, password recovery, session tokens, multi-step onboarding wizard, and audit login activity.",
    predicate: (trail) => {
      const p = trail.join(" > ");
      return (
        p.includes("tenant > auth") ||
        p.includes("tenant > onboarding") ||
        p.includes("tenant > login-activity")
      );
    },
  },
  "subscriptions.md": {
    title: "Subscription Plans, Billing & Paystack Integration API",
    description:
      "Public plan catalog, tenant subscription tier management (upgrade, downgrade, cancel, payment verification), and automated Paystack webhooks.",
    predicate: (trail) => {
      const p = trail.join(" > ");
      return (
        trail[1] === "subscriptions" ||
        p.includes("tenant > subscription") ||
        trail[1] === "webhook"
      );
    },
  },
  "admin.md": {
    title: "Super Admin Platform Management API",
    description:
      "Super admin initial setup, administrator profile, RBAC permission dictionary, cross-tenant management, tenant status toggle, subscription plan authoring, and platform oversight.",
    predicate: (trail) => {
      return trail[1] === "admins";
    },
  },
  "staff-and-roles.md": {
    title: "Staff Members & RBAC Roles API",
    description:
      "Tenant staff invitations, team directory, custom role creation, granular permission assignment, and privilege escalation management.",
    predicate: (trail) => {
      return trail[1] === "staffs" || trail[1] === "roles";
    },
  },
  "crm.md": {
    title: "CRM Contacts & Companies API",
    description:
      "Customer contacts and company accounts directory, interaction notes, streaming CSV export, and bulk synchronous/asynchronous CSV imports.",
    predicate: (trail) => {
      return trail[1] === "companies" || trail[1] === "contacts";
    },
  },
  "tasks.md": {
    title: "Tasks, Follow-ups & Activity Management API",
    description:
      "Task creation, calendar scheduling, status updates, resource assignment, filtering, and activity tracking for CRM workflows.",
    predicate: (trail) => {
      return trail[1] === "tasks";
    },
  },
  "catalog.md": {
    title: "Product Catalog, Services & Categories API",
    description:
      "Inventory items, physical products, recurring/one-off services, item categories, stock level adjustments, CSV bulk exports, and streaming async imports.",
    predicate: (trail) => {
      return (
        trail[1] === "categories" ||
        trail[1] === "products" ||
        trail[1] === "services"
      );
    },
  },
  "finance.md": {
    title: "Finance, Billing, Income, Expenses, Invoices & Receipts API",
    description:
      "Revenue tracking, operating expense entries, status updates, invoice and receipt generation, custom HTML/PDF rendering, white-label branding, and payment reconciliation.",
    predicate: (trail) => {
      return (
        trail[1] === "income" ||
        trail[1] === "expenses" ||
        trail[1] === "invoices" ||
        trail[1] === "receipts"
      );
    },
  },
  "sales.md": {
    title: "Sales Pipeline, Leads, Deals, Quotes & Orders API",
    description:
      "Lead capture and qualification, visual Kanban deal pipelines, stage reordering, quote generation, sales order fulfillment, and status tracking.",
    predicate: (trail) => {
      return (
        trail[1] === "pipelines" ||
        trail[1] === "leads" ||
        trail[1] === "deals" ||
        trail[1] === "quotes" ||
        trail[1] === "orders"
      );
    },
  },
  "dashboard.md": {
    title: "Tenant Dashboard & Real-Time Analytics API",
    description:
      "Key performance indicator metrics, cash balance summaries, monthly income vs. expense cash flows, profit breakdown, and user analytics.",
    predicate: (trail) => {
      return trail[1] === "dashboard";
    },
  },
  "reports.md": {
    title: "Sales & Pipeline Analytics Reports API",
    description:
      "Advanced analytics including pipeline funnel progression, win/loss conversion rates, average deal sizing, sales cycle velocity, revenue trends, and stage dwell durations.",
    predicate: (trail) => {
      return trail[1] === "reports";
    },
  },
  "support.md": {
    title: "Support Tickets & Helpdesk Threading API",
    description:
      "Customer support tickets, agent ticket assignment, priority escalation, lifecycle status updates, and chronological reply threads.",
    predicate: (trail) => {
      return trail[1] === "tickets";
    },
  },
  "notifications.md": {
    title: "Notifications & Real-Time Alerts API",
    description:
      "Tenant notification bell alerts, unread counts, mark-read actions, and bulk acknowledgment.",
    predicate: (trail) => {
      return trail[1] === "notifications";
    },
  },
  "media.md": {
    title: "Multimedia & Cloud Storage API",
    description:
      "Direct asset uploads to Cloudinary for logos, avatars, PDFs, receipts, and media attachments.",
    predicate: (trail) => {
      return trail[1] === "multimedia";
    },
  },
  "import.md": {
    title: "Bulk Data Import & Streaming Jobs Framework API",
    description:
      "Validation contracts, downloadable CSV templates, background import job management, and Server-Sent Events (SSE) progress streaming.",
    predicate: (trail) => {
      return trail[1] === "import";
    },
  },
  "reminders.md": {
    title: "Reminders & Notification Preferences API",
    description:
      "User notification settings, dispatch channels (email/push), reminder schedules, and preference persistence.",
    predicate: (trail) => {
      return trail[1] === "reminders";
    },
  },
};

// Process all endpoints
const allEndpoints = extractAllEndpoints(v1);
console.log(
  `Discovered ${allEndpoints.length} endpoints in Postman collection.`,
);

const docsDir = path.resolve("docs/api");
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const docOutputs: Record<
  string,
  Array<{ item: PostmanItem; trail: string[] }>
> = {};
for (const key of Object.keys(docsConfig)) {
  docOutputs[key] = [];
}

const unassigned: Array<{ item: PostmanItem; trail: string[] }> = [];

for (const ep of allEndpoints) {
  let matched = false;
  for (const [docFile, config] of Object.entries(docsConfig)) {
    if (config.predicate(ep.trail, ep.item)) {
      docOutputs[docFile].push(ep);
      matched = true;
      break;
    }
  }
  if (!matched) {
    unassigned.push(ep);
  }
}

console.log(`Unassigned endpoints: ${unassigned.length}`);
if (unassigned.length > 0) {
  for (const u of unassigned)
    console.log(` - ${u.item.name} (${u.trail.join(" > ")})`);
}

// Generate each markdown file
for (const [docFile, list] of Object.entries(docOutputs)) {
  const config = docsConfig[docFile];
  let content = `# ${config.title}\n\n`;
  content += `${config.description}\n\n`;
  content += `## Overview & Quick Reference\n\n`;
  content += `| Method | Endpoint | Description |\n| :--- | :--- | :--- |\n`;

  for (const ep of list) {
    const method = ep.item.request!.method;
    let urlRaw =
      ep.item.request!.url.raw ||
      (ep.item.request!.url.path
        ? "/" + ep.item.request!.url.path.join("/")
        : "");
    let cleanUrl = urlRaw.replace("{{baseUrl}}", "");
    if (!cleanUrl.startsWith("/")) cleanUrl = "/" + cleanUrl;
    // Strip query string for table brevity
    const pathOnly = cleanUrl.split("?")[0];
    content += `| \`${method}\` | [\`${pathOnly}\`](#${ep.item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}) | ${ep.item.name} |\n`;
  }
  content += `\n---\n\n## Endpoints\n\n`;

  for (const ep of list) {
    content += formatEndpointMarkdown(ep.item);
  }

  fs.writeFileSync(path.join(docsDir, docFile), content, "utf8");
  console.log(`Wrote ${docFile} with ${list.length} endpoints.`);
}

// Generate README.md
let readme = `# Greenmouse CRM API Documentation (v1)\n\n`;
readme += `Auto-generated from the Postman API collection for Greenmouse CRM platform backend services.\n\n`;
readme += `## API Documentation Modules\n\n`;
readme += `| Module | Documentation File | Endpoints Count | Scope & Purpose |\n`;
readme += `| :--- | :--- | :--- | :--- |\n`;

for (const [docFile, list] of Object.entries(docOutputs)) {
  const config = docsConfig[docFile];
  readme += `| **${config.title}** | [\`${docFile}\`](./${docFile}) | ${list.length} | ${config.description} |\n`;
}

readme += `\n---\n\n`;
readme += `## Complete Endpoints Master Index (${allEndpoints.length} total endpoints)\n\n`;
readme += `| Method | Path | Action / Endpoint Name | Module Documentation |\n`;
readme += `| :--- | :--- | :--- | :--- |\n`;

for (const [docFile, list] of Object.entries(docOutputs)) {
  for (const ep of list) {
    const method = ep.item.request!.method;
    let urlRaw =
      ep.item.request!.url.raw ||
      (ep.item.request!.url.path
        ? "/" + ep.item.request!.url.path.join("/")
        : "");
    let cleanUrl = urlRaw.replace("{{baseUrl}}", "");
    if (!cleanUrl.startsWith("/")) cleanUrl = "/" + cleanUrl;
    const pathOnly = cleanUrl.split("?")[0];
    readme += `| \`${method}\` | \`${pathOnly}\` | ${ep.item.name} | [\`${docFile}\`](./${docFile}#${ep.item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}) |\n`;
  }
}

fs.writeFileSync(path.join(docsDir, "README.md"), readme, "utf8");
console.log(`Generated docs/api/README.md successfully!`);
