# ProcurePilot AI

> **“Intelligent procurement. Explainable decisions. Secure payments.”**

ProcurePilot AI is an intelligent procurement management and payment platform for businesses. It combines AI-powered purchasing request understanding, supplier quotation extraction, inventory intelligence, multi-factor supplier risk analysis, procurement decision-making, human approval workflows, and secure **PayPal Sandbox** payment execution.

---

## 1. Core Workflow

```text
Request → Understand → Check Inventory → Collect Quotes → Analyze Suppliers → Calculate True Cost → Assess Risk → AI Recommendation → Human Approval → PayPal Payment → Audit
```

---

## 2. User Roles & Seed Demo Accounts

All demo accounts use password: `demo123`

| Role | Demo Account | Organization | Permissions & Scope |
|---|---|---|---|
| **Company User** (Requester) | `procurement@acme.test` | Acme Technologies Pvt Ltd | Creates purchasing requests, uploads quotations, edits AI assumptions, views inventory, submits PR for approval. |
| **Finance Approver** (Treasury) | `finance@acme.test` | Acme Technologies Pvt Ltd | Reviews AI recommendations, inspects supplier comparison, validates TCO & risk, approves PR, authorizes PayPal payment. |
| **Supplier A** (Preferred) | `supplier-a@test.com` | Apex Ergonomics Pvt Ltd | Inspects assigned RFQs, submits live quotes with discount/shipping/tax calculation, tracks purchase orders and payments. |
| **Supplier B** (Budget/High Delay) | `supplier-b@test.com` | ValueCraft Office Solutions | Alternative low-price bidder with delivery slippage risk. |
| **Supplier C** (Premium/100% Wire) | `supplier-c@test.com` | Zenith Luxury Seating Inc | Luxury vendor requiring 100% upfront wire advance. |

---

## 3. Dedicated Portals & Routes

### A. Authentication
- `/login` — Email, password, remember me, password visibility toggle, 1-click role logins
- `/register` — Full name, company name, business email, password, role selection (Company User vs Supplier)
- `/forgot-password` — Password recovery with demo token simulator
- `/reset-password` — Set new password with confirmation

### B. Company Portal
- `/company/dashboard` — Summary cards (Active requests, pending approvals, total spend, estimated savings, supplier counts), recent procurement table, and AI insights
- `/company/procurement/new` — 5-step guided wizard: Details → Budget → Justification → Inventory → Review
- `/company/procurement/:id` — Procurement decision console with TCO breakdown, quotes, risk alerts, and audit trail
- `/company/procurement/:id/compare` — Dedicated multi-factor supplier comparison matrix
- `/company/inventory` — Warehouse inventory depots (SKU, current, reserved, available, days remaining)
- `/company/suppliers` — Supplier directory and historical pricing trends
- `/company/quotes` — Centralized quotations management hub
- `/company/analytics` — Spend breakdown by category, vendor SLA tracking, and AI savings

### C. Finance Portal
- `/finance/dashboard` — Pending approvals queue, approved spend, payment success rate
- `/finance/approvals/:id` — 8-point approval workbench: Summary, inventory, comparison, AI recommendation, risk, budget, supporting docs, audit trail. Actions: **Approve & Pay**, **Reject**, **Request Changes**
- `/finance/payments` & `/finance/payments/:id` — PayPal Sandbox settlements, transaction receipts, capture IDs
- `/finance/reports` — Treasury reports, spend concentration, budget variance
- `/finance/audit` — Cryptographic immutable audit trail

### D. Supplier Portal
- `/supplier/dashboard` — Vendor commercial suite, RFQ pipeline, order status
- `/supplier/procurements/:id` — Interactive quotation submission with automated real-time math: Subtotal, Discount, Shipping, 18% GST, and Final Total
- `/supplier/orders` — Purchase order review and delivery SLA compliance
- `/supplier/payments` — PayPal Sandbox settled transactions

---

## 4. Key Architectural Modules

### Inventory Intelligence
Before recommending any vendor purchase, ProcurePilot checks warehouse records. For the demo **PR-2026-00001** (100 chairs), ProcurePilot detects **35 units** in the Bengaluru Central Facility and recommends purchasing **only 65 units**, preserving **₹77,000** in corporate working capital.

### True Cost of Ownership (TCO) Engine
Calculates true operational cost:
$$\text{Effective Cost} = \text{Base Price} + \text{Shipping} + \text{Taxes} + \text{Installation} + \text{Maintenance Risk} + \text{Delay Impact}$$
Explains why ValueCraft's lower invoice bid (₹1,72,735) actually incurs higher true cost (₹2,08,735) than Apex Ergonomics (₹1,80,490).

### Strict Payment Safety Gateway
Before any PayPal Sandbox disbursement:
- `Approved Supplier == Payment Destination Supplier`
- `Approved Amount == Payment Amount`
- `Procurement Status == APPROVED`
- `Approver Role == FINANCE_APPROVER`

If any check fails, the transaction is **BLOCKED** and logged to the security audit trail.

---

## 5. Local Setup & Execution

```bash
# Install dependencies
npm install

# Start full-stack development server (Express + Vite on port 3000)
npm run dev

# Run TypeScript linter
npm run lint

# Build for production
npm run build
```
