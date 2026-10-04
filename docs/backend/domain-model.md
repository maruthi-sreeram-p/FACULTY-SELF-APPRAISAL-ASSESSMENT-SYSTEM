# Domain Model

> **PROPOSED.** The domain follows the **PDF's business structure**, not the UI's 16 steps. A step is a screen; an entity is something the college keeps records about.

Related: [api-contract.md](api-contract.md) · [database-design.md](database-design.md) · [service-boundaries.md](service-boundaries.md)

## 1. Principles

1. **One aggregate: `Appraisal`.** Everything the faculty fills in (Part A, Part B 1–10, the supporting-documents ticks, the declaration) and everything done to it afterwards (score sheet, HoD and Principal reviews) belongs to one appraisal, which belongs to **one faculty and one academic year**.
2. **Repeating PDF tables are child entities.** Each repeating table in the PDF is its own list of rows under the appraisal.
3. **Part A is a snapshot.** It is prefilled from the Faculty profile when the appraisal is created and then owned by the appraisal, so history does not change when a profile does.
4. **Scores are backend facts.** The PDF defines the nine criteria and the cadre-wise maximum marks, but no formula. The backend owns `maxScore` / `selfScore`; no formula is modelled here.
5. **UI steps are not entities.** HoD / Principal "steps", "Review & Submit" and the stepper have no tables of their own.
6. **Provisional things are flagged, not invented.** Review workflow, submission rules and statuses beyond `DRAFT` / `SUBMITTED` are placeholders until the college confirms them.

## 2. Context map

```mermaid
flowchart LR
  subgraph Identity
    U[User / Role]
  end
  subgraph FacultyCtx[Faculty context]
    F[Faculty]
    D[Department]
  end
  subgraph AppraisalCtx[Appraisal context]
    AY[AcademicYear]
    A[(Appraisal aggregate)]
    SC[Score reference: Criteria + Cadre max marks]
  end
  subgraph DocCtx[Document context]
    SD[Supporting Document files]
  end
  U --- F
  F --> D
  F -. "faculty_id (by value)" .-> A
  AY --> A
  SC -. "maxima copied when scored" .-> A
  A -. "appraisal_id (by value)" .-> SD
```
Contexts reference each other **by id value**, never by database foreign key, so each can become its own service without a rewrite.

## 3. Entity overview

```mermaid
erDiagram
  DEPARTMENT ||--o{ FACULTY : "belongs to"
  FACULTY ||--o{ APPRAISAL : "has one per year"
  ACADEMIC_YEAR ||--o{ APPRAISAL : "scopes"
  APPRAISAL ||--|| GENERAL_INFO : "Part A snapshot"
  APPRAISAL ||--|| SUMMARY_COUNTS : "typed totals"
  APPRAISAL ||--o{ SECTION_FLAG : "nothing to report (provisional)"
  APPRAISAL ||--o{ SCORE : "9 rows"
  APPRAISAL ||--o| DECLARATION : "signed once"
  APPRAISAL ||--o{ REVIEW : "HOD and PRINCIPAL"
  APPRAISAL ||--o{ DOCUMENT_CHECKLIST_TICK : "enclosed items"
  APPRAISAL ||--o{ SUPPORTING_DOCUMENT : "files"
  APPRAISAL ||--o{ TEACHING_ENTRY : ""
  APPRAISAL ||--o{ STUDENT_ACHIEVEMENT : ""
  APPRAISAL ||--o{ PROJECT_GUIDANCE : ""
  APPRAISAL ||--o{ FDP : ""
  APPRAISAL ||--o{ CERTIFICATION : ""
  APPRAISAL ||--o{ ADMIN_ROLE : "institute or department"
  APPRAISAL ||--o{ ADMIN_EVENT : ""
  APPRAISAL ||--o{ JOURNAL_PUBLICATION : ""
  APPRAISAL ||--o{ CONFERENCE_PAPER : ""
  APPRAISAL ||--o{ RESEARCH_METRIC : "max 3, one per platform"
  APPRAISAL ||--o{ RESEARCH_GUIDANCE : ""
  APPRAISAL ||--o| PHD_PROGRESS : "if pursuing"
  APPRAISAL ||--o{ FUNDED_PROJECT : ""
  APPRAISAL ||--o{ PATENT_IPR : ""
  APPRAISAL ||--o{ BOOK_CHAPTER : ""
  APPRAISAL ||--o{ OUTREACH_ACTIVITY : ""
  APPRAISAL ||--o{ MEMBERSHIP_AWARD : ""
  APPRAISAL ||--o| OTHER_CONTRIBUTION : "two free-text areas"
```

### Appraisal and its identity

```mermaid
erDiagram
  FACULTY {
    uuid id PK
    string employee_id
    string name
    string department_code FK
    string cadre
  }
  DEPARTMENT {
    string code PK
    string label
  }
  ACADEMIC_YEAR {
    uuid id PK
    string label "2025-26"
    boolean is_current
  }
  APPRAISAL {
    uuid id PK
    uuid faculty_id "unique with academic_year_id"
    uuid academic_year_id
    string status "DRAFT, SUBMITTED (+ provisional)"
    int version
    timestamptz submitted_at
  }
  GENERAL_INFO {
    uuid appraisal_id PK
    string faculty_name
    string department_code
    string cadre "drives maximum marks"
    string ph_d_status
  }
  SCORE {
    uuid appraisal_id PK
    string criterion PK "one of 9"
    int max_marks "copied from Annexure A"
    numeric self_score "backend supplied"
  }
  REVIEW {
    uuid appraisal_id PK
    string role PK "HOD or PRINCIPAL"
    string remarks
    date signed_on
  }
  DEPARTMENT ||--o{ FACULTY : has
  FACULTY ||--o{ APPRAISAL : has
  ACADEMIC_YEAR ||--o{ APPRAISAL : scopes
  APPRAISAL ||--|| GENERAL_INFO : snapshot
  APPRAISAL ||--o{ SCORE : scored
  APPRAISAL ||--o{ REVIEW : reviewed
```

## 4. Entities and their PDF origin

| Entity | Kind | PDF origin | Cardinality under an appraisal | Source / owner |
|---|---|---|---|---|
| **Faculty** | root (Faculty context) | Part A identity fields | n/a | [P], Faculty Service |
| **Department** | reference | Part A "Department / Branch" (8 options) | n/a | Faculty Service |
| **AcademicYear** | reference | Part A "Academic Year" | n/a | Appraisal Service |
| **Appraisal** | aggregate root | the whole report | one per (faculty, academic year) | [A], Appraisal Service |
| GeneralInfo | child, 1:1 | Part A | 1 | [P→A] snapshot |
| SummaryCounts | child, 1:1 | typed totals: teaching totals, students mentored, journal counts, project summary, patent summary, book counts | 1 | [A], **PROVISIONAL typed** |
| **Teaching Entry** | child list | B1 "Courses handled during the Academic Year" | 0..n | [A] |
| **Student Achievement** | child list | B2 "Student achievements" | 0..n | [A] |
| **Project Guidance** | child list | B2(b) "Student projects guided" | 0..n | [A] |
| **FDP** | child list | B3(a) Workshops / FDPs / Seminars / Training | 0..n | [A] |
| **Certification** | child list | B3(b) Certifications | 0..n | [A] |
| **Administrative Role** | child list with `scope` = `INSTITUTE` or `DEPARTMENT` | B4(a) and B4(b) (identical columns, one entity) | 0..n each | [A] |
| **Administrative Event** | child list | B4(c) events / workshops / tours / trainings / guest lectures organised | 0..n | [A] |
| **Journal Publication** | child list | B5(a) | 0..n | [A] |
| **Conference Paper** | child list | B5(b) | 0..n | [A] |
| **Research Metric** | child list, unique per platform | B5(c) Research profile metrics | 0..3 | [A] |
| **Research Guidance** | child list | B5(d)(i) scholars / PG dissertations | 0..n | [A] |
| **PhD Progress** | child, 0..1 | B5(d)(ii) Own Ph.D. progress (if pursuing) | 0..1 | [A] |
| **Funded Project** | child list | B6 | 0..n | [A] |
| **Patent / IPR** | child list | B7(a) | 0..n | [A] |
| **Book / Chapter** | child list | B7(b) | 0..n | [A] |
| **Outreach Activity** | child list | B8 | 0..n | [A] |
| **Membership / Award** | child list | B9 | 0..n | [A] |
| **Other Contribution** | child, 1:1 | B10 two free-text areas (Department / Institute level). **Not scored** | 0..1 | [A] |
| **Score** | child, exactly 9 once scored | B11 score sheet. Criteria and cadre maxima from Annexure A | 0 or 9 | [S] backend |
| **Supporting Document** | separate context | B11 "Supporting documents enclosed" (11 types). Files | 0..n | Document Service |
| DocumentChecklistTick | child | the ticks of the same checklist, plus "Others: ____" text | 0..11 | [A] |
| **Declaration** | child, 0..1 | Declaration: Date, Place, Signature of Faculty. **Mechanism PROVISIONAL** | 0..1 | [A] |
| **HOD Review** | child (`Review`, role `HOD`) | "Recommendations of HoD" + "Head of the Department (Signature with Seal & Date)". **PROVISIONAL workflow** | 0..1 | [R] |
| **Principal Review** | child (`Review`, role `PRINCIPAL`) | "Remarks of the Principal" + "Principal (Signature with Seal & Date)". **PROVISIONAL workflow** | 0..1 | [R] |
| SectionFlag | child (**PROVISIONAL UI feature**) | not in the PDF: "nothing to report" per section | 0..n | [A] |
| ScoreCriterion, CadreMaxMarks | reference | Annexure A | 9 criteria × 5 cadres | Appraisal Service (seeded) |
| User, Role | identity | not in the PDF | | Auth Service |

Two modelling choices worth stating:
- **`Administrative Role` is one entity with a `scope`**, because "(a) Institute level roles" and "(b) Department level roles" have identical columns. The API still exposes them as two lists (`instituteRoles`, `departmentRoles`), matching the two PDF tables.
- **HOD Review and Principal Review are one `Review` entity with a `role`**: same shape (remarks, signer, date), two instances per appraisal at most.

## 5. Invariants

| # | Invariant | Status |
|---|---|---|
| 1 | At most one appraisal per (faculty, academic year) | firm (stated by the requirement) |
| 2 | An appraisal's `cadre` is a snapshot and is one of the 5 PDF cadres | firm |
| 3 | A scored appraisal has exactly 9 `Score` rows, one per criterion; `max_marks` come from Annexure A for the snapshot cadre; each cadre's maxima sum to 100 | firm (Annexure A) |
| 4 | There is no 10th criterion; "Any Other Contributions" never has a score row | firm (PDF) |
| 5 | `self_score` is never calculated by the frontend. The backend supplies it by a mechanism the PDF does not define | **PROVISIONAL** |
| 6 | `Research Metric` has at most one row per platform (3) | firm (PDF grid) |
| 7 | A `Review` exists at most once per role per appraisal | firm |
| 8 | A submitted appraisal is read-only for the faculty | `SUBMITTED` lock is firm for the UI; statuses beyond it are **PROVISIONAL** |
| 9 | Row `id`s are client-generated UUIDs and stable across saves | contract rule |
| 10 | Writes are guarded by an optimistic version | contract rule |

## 6. UI step → domain part (the steps are not entities)

| UI step | Domain part |
|---|---|
| 1 General Information | `GeneralInfo` |
| 2 Teaching & Learning | `TeachingEntry` list + teaching totals (`SummaryCounts`) |
| 3 Student Mentoring, Project Guidance & Achievements | `StudentAchievement`, `ProjectGuidance`, students-mentored total |
| 4 FDPs / Certifications | `Fdp`, `Certification` |
| 5 Administrative Responsibilities | `AdminRole` (×2 scopes), `AdminEvent` |
| 6 Research & Publications | `JournalPublication` (+ counts), `ConferencePaper`, `ResearchMetric`, `ResearchGuidance`, `PhdProgress` |
| 7 Funded Projects / Consultancy | `FundedProject` (+ summary) |
| 8 Patents, Books & IPR | `PatentIpr` (+ summary), `BookChapter` (+ counts) |
| 9 Outreach | `OutreachActivity` |
| 10 Professional Memberships, Awards & Recognitions | `MembershipAward` |
| 11 Any Other Contributions | `OtherContribution` |
| 12 Score Sheet & Supporting Documents | `Score` (read-only), `DocumentChecklistTick`, `SupportingDocument` |
| 13 Declaration | `Declaration` |
| 14 Recommendations of HoD | `Review(HOD)` (read-only for faculty) |
| 15 Remarks of the Principal | `Review(PRINCIPAL)` (read-only for faculty) |
| 16 Review & Submit | **no entity**: UI-only; triggers the `DRAFT → SUBMITTED` transition |

## 7. What is deliberately not modelled

- A scoring formula or rule engine (the PDF has none).
- An approval / review workflow engine, queues, delegation, return reasons (undefined by the PDF).
- Per-row evidence attachments (the first build had them; the PDF does not).
- Full department names, academic-year start/end dates, appraisal windows (not in the PDF).
