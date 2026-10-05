/**
 * API CONTRACT: PROPOSED, REQUIRES BACKEND IMPLEMENTATION.
 *
 * Wire types for the frontend ↔ backend boundary. Full description, field tables, validation and
 * endpoints: docs/backend/api-contract.md. Structure follows the Sri Vasavi "Faculty Self-Appraisal &
 * Assessment Report" PDF; nothing here is a scoring rule.
 *
 * Conventions: JSON camelCase · enums UPPER_SNAKE_CASE · dates "YYYY-MM-DD" · month-year "YYYY-MM" ·
 * ids are UUIDs · absent optional values are sent as null · money in rupees.
 *
 * Source of each value:  [P] Faculty Profile · [A] Appraisal (entered by faculty) · [S] backend scoring ·
 * [R] HoD / Principal review.  Items the PDF does not define are marked PROVISIONAL in the docs.
 */

/* ------------------------------ enums ------------------------------ */

/** NOT_STARTED = no appraisal exists yet for that faculty + year. Only DRAFT and SUBMITTED are certain;
 *  the rest are PROVISIONAL (the PDF defines no workflow). */
export type AppraisalStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'RETURNED' | 'REJECTED'

export type CadreCode = 'LECTURER' | 'ASSISTANT_PROFESSOR' | 'SENIOR_ASSISTANT_PROFESSOR' | 'ASSOCIATE_PROFESSOR' | 'PROFESSOR'
export type DepartmentCode = 'CE' | 'ME' | 'ECE_ECT' | 'EEE' | 'CSE_IT' | 'AIML_CAI_DS' | 'BSH' | 'MBA'
export type PhdStatus = 'AWARDED' | 'PURSUING' | 'NOT_APPLICABLE'
/** "Level (Inst / State / Nat / Intl)" */
export type Level = 'INST' | 'STATE' | 'NAT' | 'INTL'
/** "Level (Nat / Intl)" for conference papers */
export type ConferenceLevel = 'NAT' | 'INTL'
export type ProjectLevel = 'DIPLOMA' | 'UG' | 'PG'
export type ProjectOutcome = 'PAPER' | 'PATENT' | 'PROTOTYPE' | 'COMPETITION'
export type ProgramMode = 'OFFLINE' | 'ONLINE' | 'BLENDED'
export type CertificationPlatform = 'NPTEL' | 'SWAYAM' | 'COURSERA' | 'OTHER'
export type JournalIndexing = 'SCI' | 'SCOPUS' | 'UGC_CARE' | 'ABDC' | 'OTHERS'
export type ResearchPlatform = 'GOOGLE_SCHOLAR' | 'SCOPUS' | 'WEB_OF_SCIENCE'
export type GuidanceDegree = 'PHD' | 'MTECH' | 'MBA'
export type GuidanceStatus = 'REGISTERED' | 'SUBMITTED' | 'AWARDED'
export type PhdStage = 'COURSE_WORK' | 'COMPREHENSIVE_PROPOSAL' | 'SYNOPSIS_PRE_PHD' | 'THESIS_SUBMITTED' | 'VIVA_VOCE_COMPLETED'
export type FundedProjectType = 'RESEARCH' | 'CONSULTANCY'
export type FundedProjectStatus = 'SANCTIONED' | 'APPLIED'
export type IprType = 'DESIGN' | 'UTILITY' | 'COPYRIGHT'
export type IprStatus = 'FILED' | 'PUBLISHED' | 'GRANTED'
export type BookType = 'BOOK' | 'CHAPTER'
/** The nine scoring criteria of the score sheet. There is no tenth ("Any Other Contributions" is not scored). */
export type CriterionCode =
  | 'TEACHING_LEARNING' | 'STUDENT_MENTORING' | 'FDP_CERTIFICATIONS' | 'ADMINISTRATIVE' | 'RESEARCH_PUBLICATIONS'
  | 'FUNDED_PROJECTS' | 'PATENTS_BOOKS_IPR' | 'OUTREACH' | 'MEMBERSHIPS_AWARDS'
/** The "Supporting documents enclosed" checklist of the PDF. */
export type SupportingDocumentType =
  | 'COURSE_FILES_RESULT_ANALYSIS' | 'STUDENT_FEEDBACK_REPORTS' | 'MENTORING_RECORDS' | 'PUBLICATION_PROOFS'
  | 'PROJECT_SANCTION_LETTERS' | 'PATENT_BOOK_PROOFS' | 'FDP_COURSE_CERTIFICATES' | 'ROLE_APPOINTMENT_ORDERS'
  | 'EVENT_REPORTS' | 'AWARDS_MEMBERSHIP_PROOFS' | 'OTHERS'

/* ------------------------- faculty & reference ------------------------- */

export interface DepartmentDto { code: DepartmentCode; label: string }

/** GET /faculty/me [P] */
export interface FacultyProfileDto {
  id: string
  employeeId: string | null
  name: string
  email: string | null
  contactNo: string | null
  department: DepartmentDto | null
  cadre: CadreCode | null
  avatarUrl: string | null
}

/** GET /academic-years. The list of years is PROVISIONAL. */
export interface AcademicYearDto { label: string; current: boolean }

/* ------------------------- appraisal sections ------------------------- */

/** Part A. Prefilled from the Faculty Profile when the appraisal is created, then a snapshot owned by the appraisal. */
export interface GeneralInfoDto {
  facultyName: string                       // [P→A] required (UI rule)
  academicYear: string                      // [A] read-only, set by the server from the appraisal
  employeeId: string | null                 // [P→A]
  contactNo: string | null                  // [P→A]
  departmentCode: DepartmentCode | null     // [P→A] required (UI rule)
  cadre: CadreCode | null                   // [P→A] required (UI rule); selects the maximum marks
  highestQualification: string | null       // [P→A] "Highest Qualification & Specialization"
  phdStatus: PhdStatus | null               // [P→A]
  dateOfJoiningInstitution: string | null   // [P→A]
  dateOfJoiningPresentDesignation: string | null // [P→A]
  experienceTeachingYears: number | null
  experienceIndustryYears: number | null
  experienceResearchYears: number | null
  email: string | null                      // [P→A]
  researcherIds: string | null              // "ORCID / Scopus / Google Scholar / Vidwan ID"
}

export interface TeachingEntryDto {
  id: string
  courseCodeName: string | null             // "Course Code & Name (Theory / Lab)"
  programBranch: string | null
  semester: string | null                   // "Sem"
  numSections: number | null
  hoursPerWeek: number | null
  passPercent: number | null
  phase1FeedbackPercent: number | null
  phase2FeedbackPercent: number | null
}
export interface TeachingDto {
  entries: TeachingEntryDto[]
  /** PROVISIONAL: typed by faculty; the PDF does not say whether these are derived from the rows */
  summary: { totalTeachingLoadHrsPerWeek: number | null; averagePassPercent: number | null; averageFeedbackPercent: number | null }
}

export interface StudentAchievementDto {
  id: string; studentNameRollNo: string | null; achievement: string | null; level: Level | null; monthYear: string | null
}
export interface ProjectGuidedDto {
  id: string; level: ProjectLevel | null; projectTitle: string | null; numStudents: number | null; outcome: ProjectOutcome | null
}
export interface MentoringDto {
  summary: { totalStudentsMentored: number | null }
  achievements: StudentAchievementDto[]
  projectsGuided: ProjectGuidedDto[]
}

export interface FdpProgramDto {
  id: string; title: string | null; mode: ProgramMode | null; organizerVenue: string | null
  durationFrom: string | null; durationTo: string | null; numDays: number | null
}
export interface CertificationDto {
  id: string; platform: CertificationPlatform | null; courseTitle: string | null
  durationFrom: string | null; durationTo: string | null; durationWeeksHours: string | null; gradeScore: string | null
}
export interface FdpDto { programs: FdpProgramDto[]; certifications: CertificationDto[] }

export interface AdministrativeRoleDto { id: string; role: string | null; responsibility: string | null; period: string | null }
export interface AdministrativeEventDto {
  id: string; activityType: string | null; role: string | null; titleDetails: string | null
  durationFrom: string | null; durationTo: string | null; numBeneficiaries: number | null
}
export interface AdministrativeDto {
  instituteRoles: AdministrativeRoleDto[]
  departmentRoles: AdministrativeRoleDto[]
  events: AdministrativeEventDto[]
}

export interface JournalPublicationDto {
  id: string
  title: string | null                      // "Title of Paper (mark your position in author list)"
  journalName: string | null
  volIssuePage: string | null
  monthYear: string | null
  indexing: JournalIndexing | null
  doiIssn: string | null
}
export interface ConferencePaperDto {
  id: string; title: string | null; conferenceName: string | null; level: ConferenceLevel | null
  monthYear: string | null; venue: string | null; doiIndexedIn: string | null; numCitations: number | null
}
export interface ResearchMetricDto {
  platform: ResearchPlatform; totalPublications: number | null; totalCitations: number | null; hIndex: number | null; i10Index: number | null
}
export interface ResearchGuidanceDto {
  id: string; scholarName: string | null; degree: GuidanceDegree | null; universityRegNo: string | null
  status: GuidanceStatus | null; year: string | null
}
export interface OwnPhdProgressDto {
  universityCenter: string | null; yearOfRegistration: string | null; currentStage: PhdStage | null; progressDuringYear: string | null
}
export interface ResearchDto {
  /** PROVISIONAL: typed by faculty */
  journalCounts: { sciScie: number | null; scopus: number | null; ugcCareAbdc: number | null; others: number | null }
  journals: JournalPublicationDto[]
  conferences: ConferencePaperDto[]
  /** one row per platform that has values (max 3) */
  metrics: ResearchMetricDto[]
  guidance: ResearchGuidanceDto[]
  ownPhd: OwnPhdProgressDto
}

export interface FundedProjectDto {
  id: string; title: string | null; roleTeam: string | null; type: FundedProjectType | null
  fundingAgencyClient: string | null; amountRs: number | null; durationFrom: string | null; durationTo: string | null
  status: FundedProjectStatus | null; year: string | null
}
export interface FundedProjectsDto {
  /** PROVISIONAL: typed by faculty */
  summary: { sanctionedCount: number | null; appliedCount: number | null; totalAmountSanctionedRs: number | null; consultancyRevenueRs: number | null }
  entries: FundedProjectDto[]
}

export interface PatentDto {
  id: string; applicantsInventors: string | null; titleApplicationNo: string | null
  type: IprType | null; status: IprStatus | null; date: string | null
}
export interface BookChapterDto {
  id: string; authors: string | null; title: string | null; publisher: string | null; isbn: string | null
  monthYear: string | null; type: BookType | null
}
export interface IprDto {
  patentSummary: { filed: number | null; published: number | null; granted: number | null }
  patents: PatentDto[]
  bookSummary: { booksPublished: number | null; chaptersPublished: number | null }
  books: BookChapterDto[]
}

export interface OutreachActivityDto {
  id: string
  role: string | null                       // free text; the PDF's 11 roles are suggestions
  eventActivity: string | null
  organization: string | null
  venue: string | null
  date: string | null
}
export interface MembershipAwardDto { id: string; name: string | null; body: string | null; level: Level | null; year: string | null }

/** "Any Other Contributions": two free-text areas, not a table, not scored. */
export interface OtherContributionsDto { departmentLevel: string | null; instituteLevel: string | null }

/** Ticks of "Supporting documents enclosed" (files live in the Document Service). */
export interface SupportingDocumentsChecklistDto { enclosed: SupportingDocumentType[]; othersSpecify: string | null }

/** PROVISIONAL mechanism: the PDF has Date, Place and a handwritten signature. */
export interface DeclarationDto { declaredOn: string | null; place: string | null; signature: string | null }

/* --------------------------- the appraisal --------------------------- */

/** Everything the faculty edits. Each top-level key is a "section" that PATCH / PUT-section can address. */
export interface AppraisalContentDto {
  generalInfo: GeneralInfoDto
  teaching: TeachingDto
  mentoring: MentoringDto
  fdp: FdpDto
  administrative: AdministrativeDto
  research: ResearchDto
  fundedProjects: FundedProjectsDto
  ipr: IprDto
  outreach: { activities: OutreachActivityDto[] }
  membershipsAwards: { entries: MembershipAwardDto[] }
  otherContributions: OtherContributionsDto
  supportingDocuments: SupportingDocumentsChecklistDto
  declaration: DeclarationDto
  /** PROVISIONAL UI feature: block paths the faculty marked "nothing to report", e.g. "teaching.entries" */
  nothingToReport: string[]
}

export type AppraisalSectionKey = keyof AppraisalContentDto

/**
 * One scoring component of criteria B1 to B5 (CONFIRMED FROM SOURCE DOCUMENT: label and maximum).
 * Identity is `componentNo`, the position in the annexure listing for that cadre and criterion. Wording and
 * number of components differ by cadre, so never compare components across cadres by number.
 * `selfScore` is [S]; how it is produced is REQUIRES COLLEGE CONFIRMATION.
 */
export interface ComponentScoreDto {
  componentNo: number
  label: string
  maxMarks: number
  selfScore: number | null
}
export interface CriterionScoreDto {
  criterion: CriterionCode
  /** maximum marks for the appraisal's cadre (Annexure A) [S] */
  maxMarks: number
  /** null until the backend supplies it [S]. Whether it equals the sum of the components is REQUIRES COLLEGE CONFIRMATION */
  selfScore: number | null
  /** B1 to B5 have components; B6 to B9 have none defined, so `[]` (REQUIRES COLLEGE CONFIRMATION) */
  components: ComponentScoreDto[]
}
/** The scoring template (rule set + version) an appraisal is scored against. Templates are versioned and assigned per academic year. */
export interface ScoringTemplateRefDto { code: string; name: string; version: number }
/** [S] read-only for the frontend. The PDFs define maximum marks (criterion and component), not how a self-score is produced. */
export interface ScoreSheetDto {
  cadre: CadreCode
  scoringTemplate: ScoringTemplateRefDto
  maxScore: number
  selfScore: number | null
  criteria: CriterionScoreDto[]
}

/** GET /reference/scoring?academicYear=: the scoring template in force, as reference data. */
export interface ScoringReferenceDto {
  template: ScoringTemplateRefDto
  criteria: { code: CriterionCode; number: number; title: string }[]
  cadres: {
    cadre: CadreCode
    criteria: { criterion: CriterionCode; maxMarks: number; components: { componentNo: number; label: string; maxMarks: number }[] }[]
  }[]
}

/** [R] HoD recommendation / Principal remarks. The workflow is PROVISIONAL. */
export interface ReviewDto { remarks: string | null; signedByName: string | null; signedOn: string | null }

export interface AppraisalDto extends AppraisalContentDto {
  id: string
  facultyId: string
  academicYear: string
  status: AppraisalStatus
  /** optimistic-concurrency counter; send back as If-Match on PATCH */
  version: number
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  scoreSheet: ScoreSheetDto | null          // [S]
  reviews: { hod: ReviewDto | null; principal: ReviewDto | null } // [R]
}

/** PROVISIONAL: `progress` is computed by the backend from the provisional completeness rules; the UI may instead compute it. */
export interface AppraisalSummaryDto {
  id: string
  academicYear: string
  status: AppraisalStatus
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  progress: { completedSections: number; totalSections: number } | null
}

/* ------------------------ documents & misc ------------------------ */

export interface DocumentDto {
  id: string
  appraisalId: string
  academicYear: string
  documentType: SupportingDocumentType
  fileName: string
  contentType: string | null
  sizeBytes: number
  uploadedAt: string
}

export interface ActivityDto { id: string; message: string; at: string }
export interface NotificationDto { id: string; title: string; body: string; createdAt: string; read: boolean }
export interface ReportDto { id: string; appraisalId: string; academicYear: string; title: string; downloadUrl: string }

/** RFC 7807 problem+json with field-level errors. */
export interface ProblemDto {
  type?: string; title: string; status: number; detail?: string
  errors?: { path: string; message: string }[]
}
