# PDF Alignment Audit

Source: *Faculty Self-Appraisal & Assessment Report*, Sri Vasavi Engineering College (Autonomous), 6 pages. The PDF was read directly (text extraction plus rendered page images). It is the authority for field names, columns, options, section order, score criteria and cadre-wise maximum marks.

Rule used throughout: **if the PDF does not define something, it is labelled "Provisional, requires college confirmation" in the UI and listed in section 4.** Nothing institutional was invented silently.

## 1. What the first (provisional) build got wrong

The first build was made without the PDF. Audit of its fields:

| First build | Disposition |
|---|---|
| General: Faculty name, Employee ID, Designation, Department, Date of joining, Qualification | **Replaced** by the PDF's Part A fields (Designation is now "Designation (Cadre)" with the five cadres; Department / Branch uses the PDF's eight options; joining date split into the two PDF dates; Qualification is "Highest Qualification & Specialization") |
| (missing) | **Added** from the PDF: Academic Year, Contact No., Ph.D. Status, Total Experience (Teaching / Industry / Research), E-mail ID, ORCID / Scopus / Google Scholar / Vidwan ID |
| Teaching: Course / Semester / Details / Supporting reference | **Replaced** by the 8 PDF columns + the three totals |
| Every table had "Details" and "Supporting reference" columns | **Removed**: not in the PDF |
| Mentoring, FDP, Administrative, Research, Projects, IPR, Outreach, Memberships: one generic table each with 4 generic columns | **Replaced** by the PDF's 16 repeating tables (plus the research-metrics grid and the Own Ph.D. form) with exact columns (see information-architecture.md) |
| Administrative: one table | **Split** into the PDF's three tables (Institute, Department, events) |
| Research: one table | **Split** into journals (+counts), conferences, research profile metrics, research guidance, own Ph.D. progress |
| Other Contributions: repeating table | **Replaced** by two free-text areas (Department / Institute level) |
| Score: single total only | **Replaced** by the 9-row score sheet with cadre maximum marks, Self-Score column and Annexure A |
| Documents: free upload | **Extended** with the PDF's 11-item checklist + "Others: ____" |
| Declaration: invented wording + checkbox + typed name | **Replaced** by the PDF's wording verbatim + Date, Place, Signature of Faculty |
| (missing) HoD / Principal | **Added** as read-only steps |
| Step titles (e.g. "Funded Projects", "Patents / Books / IPR", "Memberships / Awards") | **Renamed** to the PDF's titles |
| 14 steps | **16 steps**: the PDF's 15 parts + the UI-only Review & Submit |

## 2. Where your written summary and the PDF differ (the PDF was followed)

| Topic | Summary said | PDF says |
|---|---|---|
| Journal table | separate "Author position" column | No such column. It is part of "Title of Paper (mark your position in author list)" |
| Journal Indexing options | SCI/SCIE, Scopus, UGC-CARE / ABDC, Others | "Indexing (SCI / Scopus / UGC-CARE / ABDC / Others)" |
| Outreach column | "Event / Activity Name" | "Event / Activity" |
| Student achievements | Achievement (free) | Achievement (Placement / Hackathon / Paper / Award / GATE-CAT-GRE / Start-up) |
| Supporting documents | checklist | tick-boxes, last one "Others: ______" |
| Patents date | Date | Date (DD-MM-YYYY) |
| Part A | not listed | fully defined (see above) |
| Declaration | not worded | wording printed (used verbatim) |
| Score sheet | max marks | also a **Self-Score** column per criterion, and the sentence "Maximum marks for your cadre are given in Annexure A." |
| Annexure A | cadre table | separate page titled "ANNEXURE A – CADRE-WISE MAXIMUM MARKS" with the note that the Appraisal Panel uses the same criteria and marks |

Everything else (columns, options, section order, the nine criteria, cadre marks) matched. The cadre marks were re-checked against the rendered Annexure A page: 45 values, 0 mismatches, every cadre totals 100.

## 3. Display conventions applied

- "S. No" is shown automatically per row (not stored).
- Where a PDF column header lists options in brackets, the label drops the bracket and the options are the selectable values (e.g. Level: Inst / State / Nat / Intl).
- "Duration (From–To)" is two date inputs. Dates display as DD-MM-YYYY; "Month & Year" as `Mon YYYY`.
- Roles in Outreach and the example roles in Administrative tables are suggestions (free text still allowed).

## 4. Provisional register: requires college confirmation

Each of these is labelled in the UI.

| # | Item | Current behaviour |
|---|---|---|
| 1 | **Which fields and sections are mandatory** | UI rule only: Part A needs Name, Academic Year, Department / Branch, Designation (Cadre); the Declaration needs Date, Place, Signature; a table row needs its first (identifying) column. Empty optional sections do not block submission; they are listed as "not addressed" |
| 2 | **"Nothing to report here" switch** | Added by the UI so a blank section is a deliberate answer; not in the PDF |
| 3 | **Totals and counts** (teaching totals, journal counts, project summary, patents summary, books counts) | PDF shows blanks. Entered by hand; not derived from table rows. Needs a decision: typed or computed |
| 4 | **"Average Feedback % (Ph-1 & Ph-2)"** | One field. Unclear whether Ph-1 and Ph-2 averages are entered separately |
| 5 | **Self-Score column** | Displayed from the backend at criterion level and, for B1 to B5, component level (`ScoreSheetDto`). The documents give maximum marks (criterion and component) but no formula, so none is implemented. Who enters or computes any self-score, and whether a criterion score is the sum of its components, is undefined; the frontend never sums them |
| 6 | **Faculty signature** | PDF is a handwritten signature. UI uses a typed name as a digital stand-in |
| 7 | **HoD / Principal sections** | Read-only for faculty, values from the backend. How they complete these (signature, seal, timing, return / reject) is undefined; no approval workflow was invented |
| 8 | **Review & Submit step** and the submission gate | Added by the UI. The PDF defines no submission process |
| 9 | **Cadre source of truth** | Maximum marks use the cadre selected in Part A, falling back to the institutional profile. If the backend reports a different maximum, a warning is shown |
| 10 | **Department / Branch** | PDF shows check-boxes. Implemented as a single choice. Not auto-mapped from the institutional department name |
| 11 | **Own Ph.D. progress "(if pursuing)"** | Optional block; not tied to the Ph.D. Status field |
| 12 | **Research profile metrics layout** | Platform × metric grid as printed; no value rules |
| 13 | **Formats of free fields** | "Period", "Year", "Sem", "Duration" label text, and the author-position marking are free text / dates; no formats are specified |
| 14 | **Supporting documents** | Ticking records "enclosed"; uploads can be attached per item (UI addition). File types (PDF, PNG, JPG, DOC, DOCX) and the 10 MB limit are UI defaults, not from the PDF |
| 15 | **Numeric limits** | Percent fields are limited to 0–100 and counts to ≥ 0 as input sanity checks, not institutional rules |
| 16 | **Academic-year list** | 2025-26, 2024-25, 2023-24 are placeholders |
| 17 | **Cadre name matching** | Annexure A abbreviations (Asst. Prof., Sr. Asst. Prof., Assoc. Prof.) are treated as the same five cadres listed in Part A |

## 5. Questions for the college

1. Are the totals / counts typed by the faculty or computed from the tables?
2. Who fills the **Self-Score** column (criterion and component level), and is there a scoring rubric? (The documents give maximum marks, now also per component for B1 to B5, but no way to turn evidence into a score.)
3. Which sections or fields are mandatory?
4. How are faculty signature, HoD recommendation and Principal remarks captured digitally, and in what order? Can an appraisal be returned?
5. Can a faculty member belong to more than one Department / Branch (the PDF uses check-boxes)?
6. Should "Average Feedback %" be one number or one per phase?
7. Are supporting documents required to be uploaded, or only ticked as enclosed?

## 6. Contract freeze: additions and backend questions

The frontend/backend boundary was reviewed against the PDF structure and frozen (see [../backend/api-contract.md](../backend/api-contract.md)). Changes made to remove UI-invented shapes:

| Before | Now |
|---|---|
| One generic `data: Record<stepId, Record<blockId, …>>` blob with UI shorthand keys (`course`, `fb1`, …) and display strings as values (`'Inst'`, `'Online'`) | Typed contract sections named by the PDF's structure (`teaching.entries[]`, `research.metrics[]`, …) with descriptive property names (`courseCodeName`, `phase1FeedbackPercent`, …) and enum codes (`INST`, `ONLINE`) |
| Department as free text, designation as free text on the profile | `department: { code, label }` (the PDF's 8 options) and `cadre` (the PDF's 5 cadres) |
| Part A prefilled in the browser | Part A is a snapshot created by the backend from the profile when the appraisal is created; Academic Year is read-only |
| Mock-only `/dashboard` endpoint, mock `scores: Record<string, number>` | No dashboard endpoint (the UI composes it from the appraisal, documents and activity); `ScoreSheetDto` with exactly 9 criteria, `maxMarks` and `selfScore` from the backend |
| Mock statuses `in_progress`, lowercase codes | `NOT_STARTED` (no row), `DRAFT`, `SUBMITTED`; the rest are PROVISIONAL |
| Whole-appraisal save | `PATCH` of changed sections with optimistic `version` (`If-Match`, `412` on stale) |
| Documents filtered by free-text category | `documentType` = the PDF's 11-item checklist code |
| Mock notification said the "appraisal is open for submissions" | Removed: it asserted an appraisal window the PDF does not define |

### Additional questions for the college (backend-facing)

8. How do users sign in (college SSO / directory, or accounts managed by this system)?
9. Which roles exist besides faculty, HoD and Principal (for example an administrator for academic years and faculty records)? Which faculty does a given HoD review?
10. How long are appraisals and uploaded documents retained, and may a faculty member see previous years' appraisals?
11. Is the list of academic years fixed by the college, and is there an open/close window for submission?
12. Should Part A values (name, department, cadre, qualification, experience) stay editable by faculty after being prefilled from the institutional record?
13. Which file types and sizes are acceptable for supporting documents, and must they be uploaded or only ticked?

## 7. Scoring Annexure: B1 to B5

A second source was added: **"Scoring criteria B1 to B5 (Annexure A & B)"**, a 5-page document giving the component breakdown of criteria B1 to B5 for each cadre.

**What changed in our understanding.** Earlier we treated the PDFs as giving only criterion maximum marks. We now know the structure is *Criterion → Maximum marks → Scoring components (B1 to B5) → Component maximum marks*. We still know nothing about how marks are *earned*.

**About the source.** The document itself could not be opened from this machine, so the figures were taken from the transcription supplied with the request. They were checked for internal consistency: for every one of the 25 cadre/criterion pairs the components add up exactly to the criterion maximum already confirmed from the original PDF's Annexure A, and the stored data matches the supplied text for all 102 components (label and number). Please compare the tables in [api-contract.md §3.2](../backend/api-contract.md#3-scoring-reference) with the physical document once.

### CONFIRMED FROM SOURCE DOCUMENT

| Confirmed | Status |
|---|---|
| **B1 to B5 maximum marks** (criterion level, per cadre; original PDF Annexure A) | confirmed (unchanged) |
| **B1 to B5 component definitions**: the components that exist for each cadre and criterion, with their wording (102 in total: Lecturer 19, Assistant Professor 21, Senior Assistant Professor 21, Associate Professor 21, Professor 20) | confirmed |
| **Component maximum marks**, which add up to the criterion maximum for every cadre | confirmed (verified for all 25 cadre/criterion pairs) |
| **Cadre-specific component differences**: the set, number and wording of components differ between cadres (for example Lecturer B5: 3, Assistant Professor B5: 5; Professor B2: 3, the others 4) | confirmed. Components are identified by position within a cadre's list and are not matched across cadres |
| **B6 to B9 criterion maximum marks** (Funded Projects / Consultancy, Patents, Books & IPR, Outreach, Professional Memberships, Awards & Recognitions) | confirmed (original PDF). These four criteria have **no components** in the source |
| The nine criteria, 100 total per cadre, no tenth criterion ("Any Other Contributions" is not scored) | confirmed (unchanged) |

### REQUIRES COLLEGE CONFIRMATION

| # | Not confirmed |
|---|---|
| 14 | **How component self-scores are calculated.** The annexure gives maximum marks only. No percentage rule, publication or FDP count rule, threshold table, weighting or automatic scoring is given, so none is implemented |
| 21 | **Whether component self-scores are required** at all |
| 16 | **Whether a criterion self-score equals the sum of its component self-scores.** Not assumed, derived or validated anywhere: criterion maximum, component maximum, criterion self-score and component self-score are four separate values returned by the backend |
| 15 | **Who enters self-scores** (faculty, appraisal panel or the system), and at what point in the process |
| 22 | **Whether panel scores use the same component breakdown** (panel scores are not modelled) |
| 19 | **Scoring granularity**: whole marks, halves or decimals |
| 17 | **B6 to B9 detailed scoring methodology.** Only criterion maxima exist. Will component breakdowns be provided? Until then they stay criterion-level only |
| 18 | Which academic years does this scoring template apply to, and how are future changes versioned? (The model supports a new template version per year.) |
| 20 | The annexure is labelled "Annexure A & B". Does its Annexure A repeat the original PDF's Annexure A (criterion maxima), and what is Annexure B? |

### What the application does and does not do
- **Does:** store and show the maximum marks of each criterion and, for B1 to B5, of each component for the faculty member's cadre; provide a reference viewer for every cadre; accept total, criterion and component self-scores *from the backend* and display each exactly as supplied; keep scoring rules versioned by academic year in the proposed data model; tell the user, whenever the breakdown is open, that component scoring is not yet defined by the college.
- **Does not:** calculate, estimate or suggest any score; derive a criterion score from components or a total from criteria; apply any threshold, percentage, publication-count or FDP-count rule; infer B6 to B9 components; assume that components of different cadres correspond; require, cap or reconcile self-scores; add any rule not present in the documents.

### Test data
The case "criterion self-score 24 while its components add up to 25" was used to prove that the frontend only displays what the backend returns. It exists **only as an explicit test fixture** (`frontend/src/test/fixtures/scoreSheet.mismatch.fixture.ts`, labelled "TEST FIXTURE. NOT DEMO DATA") used by the automated tests. The app, the mock API and every page return **no scores** (`scoreSheet: null`, all self-scores shown as "—"), so apparently inconsistent scoring never appears as production or demo data. A test fails if the fixture is imported by any non-test code.
