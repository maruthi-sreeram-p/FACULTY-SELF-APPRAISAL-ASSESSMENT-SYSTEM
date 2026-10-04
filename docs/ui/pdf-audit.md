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
| 5 | **Self-Score column** | Displayed from the backend (total and optional per criterion). No formula exists in the PDF, so none is implemented. Who enters or computes per-criterion self-scores is undefined |
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
2. Who fills the **Self-Score** column, and is there a scoring rubric? (The PDF gives maximum marks only.)
3. Which sections or fields are mandatory?
4. How are faculty signature, HoD recommendation and Principal remarks captured digitally, and in what order? Can an appraisal be returned?
5. Can a faculty member belong to more than one Department / Branch (the PDF uses check-boxes)?
6. Should "Average Feedback %" be one number or one per phase?
7. Are supporting documents required to be uploaded, or only ticked as enclosed?
