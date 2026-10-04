# Screen Specifications

Common frame: sidebar (identity + nav) · top bar (breadcrumb, academic-year control, notifications, theme, profile) · content (max 1200 px). Page title uses `type-page`; an optional eyebrow gives context (academic year, PDF location and step number).

The appraisal content follows the college PDF. See [information-architecture.md](information-architecture.md) for the step ↔ PDF mapping and [pdf-audit.md](pdf-audit.md) for what is provisional.

## Dashboard `/`
Goal: "where do I stand this year?" with a clear visual hierarchy.

| Tier | Element | Variant |
|---|---|---|
| Header | Eyebrow "Academic year …", welcome heading, `StatusBadge` | |
| **Primary** | Completion: 104 px ring, remaining-sections sentence, last activity, primary CTA ("Start" / "Continue" / "Review and submit" / "View"), "Up next" hint | `highlight` card, spans 2 of 3 columns |
| Secondary | Self-score (`selfScore / maxScore` from API) or "Awaiting score" | `flat` |
| Supporting | Pending sections list with link to the review step | `default`, spans 2 columns |
| Supporting | Documents count; Recent activity timeline | `flat` |

Completion counts the 12 data-entry steps (Part A, B1–B10, Declaration).

## My Profile `/profile`
Banner band, overlapping large avatar, name, cadre · department, icon-led detail list. Skeleton mirrors the layout.

## My Appraisals `/appraisals`
Table (year, status, completion, last updated, action); cards on phones.

## Appraisal workflow `/appraisals/:year/step/:stepId`

**Frame**
- Header: eyebrow `<PDF location> · Step N of 16`, step title (the PDF's wording), description, save indicator, status badge, *Save draft*.
- ≥ 1024 px: sticky step rail (264 px) grouped **Part A / Part B / Declaration & approvals / Submission**, with the PDF code (A, B1 … B11) at the right of each step and ✓ ● ○ ! markers. Below 1024 px: progress card with a step selector.
- Content column ≤ 920 px. Sticky footer: Previous · "Step N of 16" · Next.
- Save indicator: `Saving…` → `Saved <time>` / `Unsaved changes` / `Save failed. Retry`; autosave 1.5 s after the last change.
- Steps with several PDF tables show an accessible **tab list** (arrow keys, Home/End) with a state mark per tab; the step's tabs are listed in the IA mapping.

**Block types**
- *Fields*: a titled card with a responsive 1–4 column grid. Checkbox, date, month, select, combobox (suggested values), number (with min/max) and **Duration (From–To)** (two dates) inputs.
- *Repeating table*: "Entries" card with S. No column, columns exactly as in the PDF, Add / Edit / Duplicate / Delete (row form opens in a large modal), empty state, stacked cards on phones. A "Nothing to report in …" switch (not in the PDF) lets a blank section be a deliberate answer.
- *Matrix* (research profile metrics): platform × metric number grid; grid of cards on phones.
- *Provisional* items show an amber **Provisional** tag or notice with the reason.

**Special steps**
- **B11 Score Sheet & Supporting Documents**: score sheet with S. No, Criteria, Max. Marks (my cadre) from `scoring.ts`, Self-Score from the backend ("—" until provided), Total; cadre chip; warnings if the cadre is unknown or the system-reported maximum differs; collapsible **Annexure A** with the user's cadre column highlighted. Below it, the **Supporting documents enclosed** checklist: tick, file count, *Attach* per item, "Others: specify".
- **Declaration**: the PDF's wording, then Date, Place, Signature of Faculty (typed name).
- **Recommendations of HoD / Remarks of the Principal**: read-only remarks box and "(Signature with Seal & Date)" line, filled from the backend; empty state "Awaiting".
- **Review & Submit** (UI step): checklist of all 15 PDF parts, blocking issues with *Fix* links, soft "not addressed" note, submit → confirmation dialog → success panel and read-only mode.

## Documents `/documents`
Upload card with a **Supporting document type** selector (the PDF's 11 items), then a searchable table (name, document type, year, size, date, delete).

## Reports `/reports`
Backend-provided reports with Download. Empty state: "No appraisal reports yet".

## Notifications `/notifications`
Unread count, *Mark all as read*, empty state "You're all caught up".

## Settings `/settings`
Appearance: theme cards.

## Responsive behaviour (verified)

| Width | Behaviour |
|---|---|
| 1440 / 1280 | Full sidebar, 3-column dashboard |
| 1024 | Sidebar (expanded or rail with tooltips), step rail visible |
| 768 | Drawer navigation, compact progress, tables scroll horizontally |
| 390 / 375 | Drawer, current-page breadcrumb, stacked-card tables, bottom-sheet modals, scrolling tab row, no horizontal overflow |
