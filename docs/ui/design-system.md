# Design System

Visual language: **calm, institutional, premium.** Deep navy / slate / neutral foundation with one restrained indigo accent. Colour is reserved for state (status, validation) and the accent; everything else is neutral.

All raw values live in one place: `src/index.css`. Components use semantic Tailwind names (`bg-surface`, `text-secondary`, `border-border-subtle`, `bg-accent-solid` …) and never hard-code colours.

## 1. Principles

1. **Guided, not giant.** One concern per screen; the PDF becomes a 14-step workflow.
2. **Backend is the source of truth.** The UI displays `maxScore` / `selfScore` from the API and never calculates scores.
3. **Hierarchy through restraint.** One primary card per screen (highlighted); supporting content is quieter (flat). Borders first, shadows second.
4. **Accessible by default.** AA contrast on every text/background pair, visible focus, keyboard-complete, reduced-motion respected.
5. **Motion explains state.** 150–250 ms for UI state, up to 350 ms for larger elements. Nothing bounces.

## 2. Colour tokens

Semantic names; light and dark are designed independently (dark is not an inversion).

| Token | Tailwind | Light | Dark | Use |
|---|---|---|---|---|
| `--background` | `bg-background` | `#f7f7f5` | `#0a0f1c` | App canvas (warm neutral / deep navy) |
| `--surface` | `bg-surface` | `#ffffff` | `#0f1626` | Cards, inputs |
| `--surface-elevated` | `bg-surface-elevated` | `#ffffff` | `#141c2f` | Modals, menus, toasts |
| `--surface-muted` | `bg-surface-muted` | `#f1f2f4` | `#121a2c` | Hover rows, inset areas, skeletons |
| `--sidebar` | `bg-sidebar` | `#fbfbfa` | `#0b1120` | Sidebar (integrated with the canvas, separated by a hairline) |
| `--border` | `border-border` | `#e2e4e9` | `#1f2943` | Inputs, cards |
| `--border-subtle` | `border-border-subtle` | `#eceef1` | `#172036` | Dividers, table rows |
| `--border-strong` | `border-border-strong` | `#c9cdd6` | `#2c3857` | Hover borders, dashed drop zone |
| `--text-primary` | `text-primary` | `#0e1530` | `#e8ecf5` | Headings, body |
| `--text-secondary` | `text-secondary` | `#4a5468` | `#a6b0c6` | Supporting text |
| `--text-muted` | `text-muted` | `#646e84` | `#7d89a4` | Metadata, placeholders |
| `--accent` | `text-accent` | `#4a52d6` | `#9aa2ff` | Accent text, icons, focus |
| `--accent-solid` | `bg-accent-solid` | `#4a52d6` | `#5b63e6` | Fills: primary button, bars, dots |
| `--accent-hover` | `bg-accent-hover` | `#3d44c0` | `#6a72f0` | Primary hover |
| `--accent-subtle` | `bg-accent-subtle` | `#eff0fc` | `#1a2145` | Active nav, highlight surface |
| `--success / warning / danger / info` | `text-*` | `#15803d / #9a5a07 / #b42323 / #0b6a9e` | `#4ade80 / #f5b84a / #f87171 / #5eb8f0` | Status and validation only |
| `--*-subtle` | `bg-*-subtle` | tinted | tinted | Badge/alert backgrounds |
| `--danger-solid` | `bg-danger-solid` | `#b42323` | `#dc2626` | Destructive button |

### Contrast (WCAG, measured)

| Pair | Light | Dark |
|---|---|---|
| primary on surface | 17.97 | 15.26 |
| secondary on surface | 7.61 | 8.29 |
| muted on surface | 4.83 | 5.15 |
| accent on surface | 6.05 | 7.73 |
| success / warning / danger / info on surface | 5.02 / 5.47 / 6.55 / 5.88 | 10.36 / 10.18 / 6.53 / 8.25 |
| white on accent-solid | 6.05 | 4.80 |

All text pairs ≥ 4.5:1. Muted text is used only for metadata and placeholders, never for essential labels.

## 3. Typography

Font: **Inter** with `cv11, ss01` features, `-0.006em` body tracking, `1.55` line-height.

| Level | Utility | Size / weight | Use |
|---|---|---|---|
| Page title | `type-page` | 22 → 24 px / 600, −0.022em | One per screen |
| Section title | `type-section` | 15 px / 600 | Card and form-section headers |
| Label | `type-label` | 13 px / 500 | Field labels, card titles |
| Body | default | 14 px / 400 | Content, inputs |
| Secondary | `text-[13px] text-secondary` | 13 px | Descriptions |
| Meta | `type-meta` | 12 px | Timestamps, hints |
| Eyebrow | `type-eyebrow` | 11 px / 600, caps, +0.06em | Context above a title, table headers |

Large numerals use `tabular-nums`. Headings use `text-wrap: balance`.

## 4. Spacing, radius, elevation

- 4-pt grid. Page gutter 16 / 24 / 32 (mobile / tablet / desktop). Card padding 20–24 (`pad="md"`), 16 compact. Form grid gaps 20. Max content width 1200 (wizard column 880).
- **Radius**: controls `rounded-control` 8 · cards `rounded-card` 12 · modals `rounded-modal` 16 · pills/avatars full.
- **Control height**: one value everywhere: `h-control` 38 px (buttons, inputs, selects) and `h-control-sm` 32 px (compact).
- **Shadows**: `shadow-xs` (buttons/inputs), `shadow-card` (hairline), `shadow-pop` (menus, modals, toasts). Dark mode scales shadow strength ×2.2 because borders carry most of the separation.

## 5. Layout & breakpoints

| Width | Layout |
|---|---|
| ≥ 1024 | Persistent sidebar (256 px), collapsible to a 72 px icon rail with tooltips; state is remembered |
| 640–1023 | Sidebar becomes a drawer; tables remain tables; wizard step rail becomes a compact progress card with a step selector |
| < 640 | Drawer; breadcrumb shows the current page only; tables become stacked cards; modals become bottom sheets; toasts span the width |

Verified at 1440, 1280, 1024, 768, 390 and 375: no horizontal overflow.

## 6. Interaction states

| State | Treatment |
|---|---|
| Hover | Neutral surfaces → `surface-muted`; borders → `border-strong`; cards lift only when `interactive` |
| Focus | 2 px accent outline on buttons/links; inputs use accent border + 3 px 15% accent ring (no glow) |
| Active/press | Buttons `translate-y-px`, icon buttons `scale-95` |
| Disabled | 50% opacity, no pointer events; disabled inputs use `surface-muted` |
| Error | `danger` border + message (replaces helper text, linked by `aria-describedby`) |
| Selected nav | `accent-subtle` background, accent icon, 600 weight, 3 px accent indicator at the sidebar edge |
| Loading | Shimmer skeletons that match the final layout (dashboard cards, table rows, profile, wizard) |

## 7. Motion

| Where | Effect | Duration |
|---|---|---|
| Hover / focus / buttons | colour, border, shadow | 150 ms |
| Dropdown / profile menu | fade + 4 px drop | 150 ms |
| Modal, toast, page | fade + 6 px rise | 220–240 ms |
| Sidebar collapse, drawer | width / transform | 250 ms |
| Progress ring & bars | stroke / width | 500–700 ms |
| Check marks (step done, saved, uploaded, theme choice) | scale-in | 320 ms |
| Skeleton | shimmer | 1.6 s loop |

`prefers-reduced-motion` collapses all of it.

## 8. Status badges

Restrained: tinted background, matching text, 1 px inset ring at 15%, 6 px radius, leading dot.

| Status | Tone |
|---|---|
| Not started / Draft | neutral |
| In progress | info |
| Submitted | accent |
| Under review / Returned | warning |
| Approved | success |
| Rejected | danger |

Values come from the API; the UI only maps them to tones.

## 8b. Provisional marker

Anything the college PDF does not define (mandatory rules, digital signatures, approval workflow, totals handling, score entry) carries an amber **Provisional** tag or notice (`warning-subtle` background, `warning` text) with the reason, and is listed in `pdf-audit.md`. Never present an assumed institutional rule as fact.

## 9. Forms

Labels above fields; helper text below (muted); errors replace helper text. Required = red `*` plus "(required)" for screen readers. Inputs share `controlCls()`. Validation is advisory on blur and enforced on the Review step; the server is authoritative.

## 10. Accessibility checklist

- Skip link; `header`, `nav`, `main` landmarks; breadcrumb `nav`.
- Stepper is a `nav` with `aria-current="step"` and an sr-only state for each step.
- Modals: focus moves to the first field (or the safe action), Tab is trapped, Esc closes, focus is restored.
- Profile menu: arrow-key navigation, Esc returns focus to the trigger.
- Icon-only controls use `IconButton` (required `label` → `aria-label` + native tooltip).
- Collapsed-sidebar tooltips appear on hover and keyboard focus, and the links keep `aria-label`.
- Toasts use `role="status"` (errors `role="alert"`).
