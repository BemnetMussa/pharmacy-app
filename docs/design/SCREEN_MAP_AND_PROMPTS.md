# Pharmacy App — Screen Map + Stitch / Figma Prompt Pack

> **Source of truth for design.** Do not invent screens outside this map until the freeze below is updated.
> **Code already maps to these routes.** Design follows product, not the other way around.

---

## 0. Why this exists (the real story)

Your sister is a **doctor**. She **bought a pharmacy** so it can run as a business. She hired **pharmacists** to work the counter. Sometimes she also works as a pharmacist — but most days she is busy in her doctor role, so she is **not always there**.

She got frustrated because:

1. **Too much time calculating** — mental math / paper / chasing numbers after the fact  
2. **Money feels lost** — she does not always know where the money went  
3. **Blind stock** — she does not clearly know what medicines are in the shop  
4. **Out of stock surprises** — she only finds out when something is already gone  

She asked you to build this so the pharmacy can be **run with visibility**, even when she is elsewhere.

**Product promise (one sentence):**  
When she opens the app after a busy day, she can answer: *What do we have? What went out? Where did the money go? What is low or empty?*

### Users (two jobs, one shop)

| Persona | Who | Uses the app to… | Cares most about |
|---------|-----|------------------|------------------|
| **Owner** | Sister (doctor / pharmacy owner) | Check in quickly: stock health, sales, money, problems | Trust, clarity, “don’t lose money silently” |
| **Staff** | Hired pharmacists (+ her when she’s on the counter) | Record reality day to day: stock updates, sales, income entries | Speed, simple forms, hard to mess up |

**How we design for this:**

| Area | Primary user | Design bias |
|------|--------------|-------------|
| Overview + Reports | Owner | Clear answers, alerts (low/out of stock, money totals), low clutter |
| Medicines + Sales (+ Income entry) | Staff | Fast recording, obvious primary actions, tables for confirmation |
| Income list / money views | Owner (review) + Staff (enter) | Audit-friendly: dates, descriptions, amounts — no mystery totals |

**MVP auth note:** Same login + same screens for everyone at first (no separate “owner portal” yet). Mentally design for both personas. Strict **roles/permissions** (staff can’t delete history, owner-only reports, etc.) = later freeze — do not block Stitch on it.

### Product freeze (MVP)

| Item | Decision |
|------|----------|
| Who | Owner (sister) + staff pharmacists |
| Core loop | Staff record → owner sees truth without standing at the counter all day |
| Owner must answer | Stock on hand · what’s low/out · sales out · money in · simple “how are we doing” |
| Platforms | Desktop first (counter / office), mobile usable for quick owner checks |
| Auth | Email + password (login / signup already exist); roles later |
| Out of scope (for now) | Online storefront, Rx workflow, multi-branch, barcode hardware, suppliers CRM, full accounting, strict RBAC |

### Domain language

| Word | Meaning in this app |
|------|---------------------|
| Medicine | Stock item (qty, sell price, cost, expiry) |
| Sale | Medicine going **out** → reduces stock, records revenue |
| Income | Manual cash **in** entry (other income not tied to a line item) |
| Report | Aggregated view over sales / income / stock signals |
| Low / out of stock | Owner alert — qty at/under threshold or zero |

---

## 1. Information architecture → code

| Route | Feature folder | Purpose (one job) |
|-------|----------------|-------------------|
| `/login` | `features/auth` | Sign in |
| `/signup` | `features/auth` | Create account |
| `/dashboard` | `features/reports` | Owner pulse — stock / money / alerts without standing at the counter |
| `/medicines` | `features/medicines` | Staff: browse / add / edit; Owner: what’s here / low / out |
| `/sales` | `features/sales` | Staff: record outflow; Owner: see what went out |
| `/income` | `features/income` | Staff: log cash in; Owner: follow the money |
| `/reports` | `features/reports` | Owner: deeper “where did we stand this month?” |

Shell (every authenticated page):

- Top bar: product name, theme toggle, user menu  
- Side nav: Overview · Medicines · Sales · Income · Reports  
- Main: page content only  

Code shell: `src/app/(dashboard)/layout.tsx`, `components/layout/*`

---

## 2. Screen map (frames to put in Figma / Stitch)

Create **one frame per row**. Name frames exactly like the **Frame name** column.

### Auth

| Frame name | Route | Job | Primary actions |
|------------|-------|-----|-----------------|
| `Auth / Login` | `/login` | Get in | Email, password, Submit → dashboard |
| `Auth / Signup` | `/signup` | Create account | Name, email, password, Submit |

### App shell (design once, reuse)

| Frame name | Job |
|------------|-----|
| `Shell / Desktop` | Sidebar + topbar + empty main |
| `Shell / Mobile` | Topbar + hamburger sheet nav |

### Core screens

| Frame name | Route | Job | Must show |
|------------|-------|-----|-----------|
| `App / Overview` | `/dashboard` | Daily pulse | Greeting, 4 summary metrics, 30-day revenue trend, short links to key actions |
| `App / Medicines — List` | `/medicines` | Stock table | Search/filter if space, table, Add medicine CTA |
| `App / Medicines — Add` | dialog/sheet on list | Create stock item | Form fields below |
| `App / Medicines — Edit` | dialog/sheet on list | Update stock item | Same form, prefilled |
| `App / Sales — List` | `/sales` | Outflow history | Recent sales table, Record sale CTA |
| `App / Sales — Record` | dialog/sheet | Sell & decrement stock | Medicine pick, qty, optional note |
| `App / Income — List` | `/income` | Cash-in history | Entries table, Add income CTA |
| `App / Income — Add` | dialog/sheet | Log money in | Amount, description, date |
| `App / Reports` | `/reports` | Analysis | Monthly revenue, top medicines, income vs outflow picture |

### Required states (same screens, variants)

For **Medicines List**, **Sales List**, **Income List** also make:

| Variant | When |
|---------|------|
| `… / Empty` | Zero rows — one clear CTA |
| `… / Loading` | Skeleton or quiet progress |
| `… / Error` | Short message + retry |

For **Medicines List** also:

| Variant | When |
|---------|------|
| `… / Low stock` | Highlight rows where qty is low (suggest threshold e.g. ≤ 10) |
| `… / Expiring soon` | Soft warning on near-expiry rows |

---

## 3. Fields per screen (lock data + forms)

### Medicine (add / edit)

| Field | Type | Notes |
|-------|------|-------|
| name | text | required |
| category | text | required |
| quantity | integer ≥ 0 | stock on hand |
| unit | text | e.g. box, strip, bottle |
| unitPrice | number > 0 | sell price |
| costPrice | number > 0 | buy/cost price |
| expiryDate | date optional | |
| description | text optional | |

### Sale (record)

| Field | Type | Notes |
|-------|------|-------|
| medicineId | select from stock | required |
| quantity | integer ≥ 1 | must not exceed stock |
| note | text optional | |

Derived (show, don’t type): unit price, line total.

### Income (add)

| Field | Type | Notes |
|-------|------|-------|
| amount | number > 0 | |
| description | text | required |
| date | date | required |

### Overview metrics (suggested cards)

1. Total medicines (SKU count)  
2. Total stock units (sum of qty)  
3. Revenue (sales — pick window: today or 30d — pick one and stick)  
4. Income entries total (same window) **or** low-stock count  

### Reports blocks

1. Daily/monthly revenue chart  
2. Top medicines by revenue  
3. Income vs sales overview for the year  

---

## 4. Component inventory (design in Figma, map to shadcn)

Build these as Figma components **before** polishing every screen:

| Figma component | Maps to |
|-----------------|---------|
| Button / Primary, Secondary, Ghost, Destructive | `components/ui/button` |
| Input, Label, Select, Textarea | `ui/input`, `label`, `select` |
| Table + row + empty row | `ui/table` |
| Dialog / Sheet form shell | `ui/dialog`, `ui/sheet` |
| Card / metric | `ui/card` |
| Badge / low stock, expired | `ui/badge` |
| Nav item / active | sidebar link |
| Page header (title + subtitle + actions) | feature layout pattern |
| Empty state (icon optional, title, body, CTA) | shared pattern |
| Chart panel | `components/charts` |

Rule: if a UI bit is used twice, it becomes a component. Screens only **compose**.

---

## 5. Visual direction (anti-generic)

For Stitch/Figma, steer hard away from purple gradients, cream+terracotta “AI default”, and dark neon dashboards.

**Recommended direction — Clinical calm:**

- Atmosphere: soft cool gray-blue surfaces, subtle paper-grain or very light grid (not flat white void)
- Brand signal: wordmark / “Pharmacy” (or her pharmacy name) visible in shell as a real identity, not tiny nav text
- Accent: deep teal or mineral green for primary actions (one accent only)
- Type: clean humanist sans for UI (e.g. Source Sans / DM Sans / Geist) — if Stitch allows a serif, use it **only** for the product name, not body
- Density: readable tables first; this is a work tool, not a marketing landing page
- Cards: only for interactive or metric containers; no decorative card soup
- Motion: keep for later in code (hover/nav); Stitch frames stay static

**CSS token names to mirror later** (do not invent a second naming system in Figma):

```
--background, --foreground
--card, --card-foreground
--primary, --primary-foreground
--muted, --muted-foreground
--accent, --destructive, --border, --ring
--radius
```

(These already match shadcn / Tailwind theme variables.)

---

## 6. Figma file structure

```
📄 Pharmacy App Design
├── 0 Cover          → name, owner, MVP date, link to this doc
├── 1 Flows          → simple arrows: Login → Overview → Medicines → Sale → Reports
├── 2 Tokens         → color, type, spacing 4/8/12/16/24/32, radius
├── 3 Components     → buttons, inputs, table, dialog, nav, empty
├── 4 Shell          → Desktop + Mobile
├── 5 Screens        → frames from §2
└── 6 Handoff        → screenshot of each final screen + component list
```

**Done means:** Tokens + Components + Screens for MVP routes, with Empty states. Not “every pixel perfect forever.”

---

## 7. Stitch prompt pack

Use these as separate generations. **Do not** ask Stitch for “a pharmacy app” in one vague prompt.

### 7.1 Global style (paste into every prompt)

```
Design system: Clinical calm pharmacy ops tool for a small pharmacy owner (doctor).
Desktop app UI (1440×900), light mode.
One accent only: deep teal (#0F766E). Surfaces: cool gray-blue (#F4F7F8 background, white panels).
Text: near-black #0F172A, secondary #64748B.
Typography: clean sans (DM Sans or similar). Product name can be slightly stronger weight.
Layout: left sidebar + top bar + main content. No purple, no neon, no glassmorphism, no gradient heroes, no marketing landing style.
Dense but breathable tables. Sparse decoration. Real pharmacy data in placeholders (medicine names, ETB or local currency).
Use clear primary buttons for main actions. Avoid card overload — cards only for metric summaries or form containers.
Accessibility: high contrast text, large click targets.
```

### 7.2 Shell

```
[PASTE GLOBAL STYLE]

Frame: authenticated app shell only.
Left sidebar: product name "Amina Pharmacy" at top, nav links Overview / Medicines / Sales / Income / Reports. Active = Overview.
Top bar: page title area empty, right side theme toggle + avatar menu.
Main: empty light content area with subtle padding.
No extra widgets. Mobile-ready structure notes in a caption (optional second frame 390×844 with hamburger).
```

### 7.3 Overview

```
[PASTE GLOBAL STYLE]

Frame: Overview dashboard inside the shell.
Page title "Overview", subtitle "Welcome back, Dr. Amina".
Row of 4 metric blocks: Total medicines, Units in stock, Sales (30 days), Low stock alerts.
Below: simple line chart "Revenue — last 30 days" with plausible data.
Below chart: two quick actions — "Record sale", "Add medicine" as text buttons or secondary buttons (not floating badges).
No notification toasts, no decorative stickers.
```

### 7.4 Medicines list

```
[PASTE GLOBAL STYLE]

Frame: Medicines list page inside shell. Nav active = Medicines.
Page header "Medicines" + primary button "Add medicine".
Table columns: Name, Category, Qty, Unit, Sell price, Expiry, Actions.
8–10 realistic rows. Mark 1–2 rows with low qty (badge "Low") and one near expiry.
Row actions: Edit / subtle delete.
Empty of clutter — no sidebar filters unless a single search field above the table.
```

### 7.5 Medicines add (dialog)

```
[PASTE GLOBAL STYLE]

Frame: Medicines list dimmed behind a centered dialog "Add medicine".
Form fields in two columns where sensible: Name, Category, Quantity, Unit, Sell price, Cost price, Expiry date, Description.
Footer: Cancel + Save medicine (primary teal).
Clean labels, helper text only where needed (e.g. quantity cannot be negative).
```

### 7.6 Sales list + record

```
[PASTE GLOBAL STYLE]

Frame: Sales page, nav active = Sales.
Header "Sales" + primary "Record sale".
Table: Date, Medicine, Qty, Unit price, Total, Note.
6–8 recent sales.
Plus a side or modal "Record sale": Medicine select, Quantity, optional Note, computed Total preview, Cancel / Confirm sale.
```

### 7.7 Income

```
[PASTE GLOBAL STYLE]

Frame: Income page, nav active = Income.
Header "Income" + "Add income".
Table: Date, Description, Amount.
Dialog "Add income": Amount, Description, Date, Cancel / Save.
Tone: bookkeeping clear, not banking-app flashy.
```

### 7.8 Reports

```
[PASTE GLOBAL STYLE]

Frame: Reports page, nav active = Reports.
Title "Reports".
Section 1: bar or line chart Monthly revenue (Jan–Dec sample).
Section 2: horizontal bar "Top medicines by revenue" (5 items).
Section 3: simple comparison Income entries vs Sales revenue (two series).
Year selector as a simple select control top-right.
No KPI spam — three sections max.
```

### 7.9 Auth

```
[PASTE GLOBAL STYLE]

Frame: Login only (no app shell). Centered form on calm background with soft atmosphere (very light gradient or soft pattern — not flat white).
Brand name large above form. Fields: Email, Password. Primary button "Sign in". Link "Create account".
Second frame: Signup with Name, Email, Password, "Create account", link back to Sign in.
Brand-first: if you remove nav (there is none), the pharmacy name still dominates the first viewport.
```

---

## 8. Workflow: Stitch → Figma → Code (stop the tweak loop)

```
Step A  Read this document. Do not expand MVP silently.
Step B  Generate shells + screens in Stitch with the prompts above (one screen family at a time).
Step C  Import / paste into Figma. Kill outliers — pick ONE look.
Step D  Rebuild Tokens + Components in Figma from that look (not 12 unique buttons).
Step E  Rebuild each screen BY COMPOSING components (throw away Stitch one-offs that don’t match).
Step F  Freeze: mark frames ✅ Ready for build. No more redesign without updating this doc.
Step G  Code order (do not jump around):
        1) Tokens in CSS / theme
        2) Shell polish (sidebar, topbar, page header)
        3) Medicines
        4) Sales
        5) Income
        6) Overview
        7) Reports
        8) Auth pages last (or parallel if shell is done)
```

### Rules of engagement

1. **Change tokens, not pages** — if many screens feel wrong, fix color/type/spacing once.  
2. **One feature per PR / session** — finish Medicines before touching Reports visuals.  
3. **Code matches routes** — do not rename nav labels without updating this map.  
4. **No “while we’re here” redesign** during implementation. Log ideas under a “v2” page in Figma.

---

## 9. Sister checklist (optional 10-minute confirm)

Before Figma freeze, confirm with her:

1. Currency to show?  
2. Low-stock number that worries her?  
3. Does she need “expenses” separate from “income”, or is Income enough for now?  
4. Expiry: how many days counts as “soon”?  
5. Who else uses the app — only her, or staff too?  

Update §0–§3 if answers change. Then design.

---

## 10. Definition of done (design → ready for Auto)

You can start coding when:

- [ ] Figma has Tokens page  
- [ ] Figma has Components (buttons, inputs, table, dialog, nav, empty)  
- [ ] All §2 core frames exist (at least desktop)  
- [ ] Empty state for Medicines / Sales / Income  
- [ ] This doc still matches what she needs  
- [ ] Share Figma link (view access) for implementation  

Until those boxes are checked, we **do not** pixel-chase in React.
