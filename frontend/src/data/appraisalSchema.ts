import type { BlockDef, FieldDef, Option, SectionDef, StepDef } from '../types'
import { CADRES } from './scoring'

/**
 * Form structure transcribed from the college's
 * "Faculty Self-Appraisal & Assessment Report" (Sri Vasavi Engineering College, 6 pages).
 *
 *  - Field labels, table columns, option wording and section order follow the PDF.
 *  - Every block `id` is its path in the API contract (see src/contract/dto.ts and docs/backend/api-contract.md),
 *    and every field `key` is the contract property name. Select values are contract enum codes.
 *  - Where the PDF prints a list of options in a column header (e.g. "Level (Inst / State / Nat / Intl)"),
 *    the label drops the parenthesis and the options become the selectable values.
 *  - Anything the PDF does NOT define is marked `provisional` (shown in the UI as "Provisional").
 *  - There are no scoring rules here. Scores come from the backend; see scoring.ts for the printed maximum marks.
 */

/* ---------------- field builders ---------------- */
type Opts = Partial<Omit<FieldDef, 'key' | 'label' | 'type'>>
const f = (type: FieldDef['type']) => (key: string, label: string, o: Opts = {}): FieldDef => ({ key, label, type, ...o })
const text = f('text')
const area = f('textarea')
const num = f('number')
const date = f('date')
const month = f('month')
const select = f('select')
const combo = f('combobox')
const range = f('daterange')

const count = (key: string, label: string, o: Opts = {}): FieldDef => num(key, label, { min: 0, step: 1, ...o })
const pct = (key: string, label: string, o: Opts = {}): FieldDef => num(key, label, { min: 0, max: 100, ...o })

/* ---------------- option lists (PDF wording, contract codes) ---------------- */
const o = (value: string, label: string, short?: string): Option => ({ value, label, short })

const LEVEL4: Option[] = [o('INST', 'Inst (Institute)', 'Inst'), o('STATE', 'State'), o('NAT', 'Nat (National)', 'Nat'), o('INTL', 'Intl (International)', 'Intl')]
const LEVEL2: Option[] = [o('NAT', 'Nat (National)', 'Nat'), o('INTL', 'Intl (International)', 'Intl')]
const DEPARTMENTS: Option[] = [
  o('CE', 'CE'), o('ME', 'ME'), o('ECE_ECT', 'ECE / ECT'), o('EEE', 'EEE'),
  o('CSE_IT', 'CSE / IT'), o('AIML_CAI_DS', 'AIML / CAI / DS'), o('BSH', 'BSH'), o('MBA', 'MBA'),
]
const CADRE_OPTIONS: Option[] = CADRES.map((c) => o(c.code, c.label))
const PHD_STATUS: Option[] = [o('AWARDED', 'Awarded'), o('PURSUING', 'Pursuing'), o('NOT_APPLICABLE', 'Not applicable')]
const PHD_STAGE: Option[] = [
  o('COURSE_WORK', 'Course work'), o('COMPREHENSIVE_PROPOSAL', 'Comprehensive / Proposal'), o('SYNOPSIS_PRE_PHD', 'Synopsis / Pre-Ph.D.'),
  o('THESIS_SUBMITTED', 'Thesis submitted'), o('VIVA_VOCE_COMPLETED', 'Viva-voce completed'),
]
const OUTREACH_ROLES = [
  'Conference Session Chair', 'Expert Lectures Delivered', 'Resource Person', 'Editorial Board Member',
  'Reviewer for Journals', 'External Examiner', 'External Thesis Evaluated', 'Visiting Researcher',
  'Industry Interaction or MoU', 'International Conferences Attended', 'Others',
]

/** UI-only rule, not in the PDF: the first (identifying) column of each table must be filled for a row to be saved. */
const REQ_NOTE = 'Which fields are required is a UI choice, not defined by the PDF.'
const TOTALS_NOTE = 'The PDF shows blanks for these totals. Whether they are typed in or derived from the table rows needs college confirmation.'

const table = (id: string, title: string, rowLabel: string, rowFields: FieldDef[]): BlockDef =>
  ({ kind: 'table', id, title, rowLabel, rowFields })

/* ---------------- sections ---------------- */
const SECTIONS = {
  general: [{
    id: 'general', title: 'Part A: General Information',
    blocks: [{
      kind: 'fields', id: 'generalInfo', mandatory: true, allowNone: false, columns: 2,
      provisional: `${REQ_NOTE} Only Name, Academic Year, Department / Branch and Designation (Cadre) are enforced. Whether these values stay editable after being prefilled from the faculty profile is also undefined.`,
      fields: [
        text('facultyName', 'Name of the Faculty', { required: true }),
        text('academicYear', 'Academic Year', { required: true, readOnly: true, hint: 'Set from the selected academic year.' }),
        text('employeeId', 'Employee ID'),
        text('contactNo', 'Contact No.', { placeholder: '+91 …' }),
        select('departmentCode', 'Department / Branch', { required: true, options: DEPARTMENTS }),
        select('cadre', 'Designation (Cadre)', { required: true, options: CADRE_OPTIONS, hint: 'Determines your maximum marks (Annexure A).' }),
        text('highestQualification', 'Highest Qualification & Specialization'),
        select('phdStatus', 'Ph.D. Status', { options: PHD_STATUS }),
        date('dateOfJoiningInstitution', 'Date of Joining (Institution)'),
        date('dateOfJoiningPresentDesignation', 'Date of Joining (Present Designation)'),
        num('experienceTeachingYears', 'Total Experience (Years): Teaching', { min: 0, step: 0.1 }),
        num('experienceIndustryYears', 'Total Experience (Years): Industry', { min: 0, step: 0.1 }),
        num('experienceResearchYears', 'Total Experience (Years): Research', { min: 0, step: 0.1 }),
        text('email', 'E-mail ID'),
        text('researcherIds', 'ORCID / Scopus / Google Scholar / Vidwan ID', { wide: true }),
      ],
    }],
  }] as SectionDef[],

  teaching: [{
    id: 'courses', title: '1. Teaching & Learning',
    blocks: [
      table('teaching.entries', 'Courses handled during the Academic Year', 'course', [
        text('courseCodeName', 'Course Code & Name (Theory / Lab)', { required: true, summary: true, wide: true, hint: 'Mention whether the course is Theory or Lab.' }),
        text('programBranch', 'Program & Branch', { summary: true }),
        text('semester', 'Sem', { summary: true }),
        count('numSections', 'No. of Sections', { summary: true }),
        num('hoursPerWeek', 'Hours / Week', { min: 0, summary: true }),
        pct('passPercent', 'Pass %', { summary: true }),
        pct('phase1FeedbackPercent', 'Phase-1 Feedback %', { summary: true }),
        pct('phase2FeedbackPercent', 'Phase-2 Feedback %', { summary: true }),
      ]),
      {
        kind: 'fields', id: 'teaching.summary', title: 'Totals', optional: true, columns: 3, provisional: TOTALS_NOTE,
        fields: [
          num('totalTeachingLoadHrsPerWeek', 'Total teaching load (Hrs/Week)', { min: 0 }),
          pct('averagePassPercent', 'Average Pass %'),
          pct('averageFeedbackPercent', 'Average Feedback % (Ph-1 & Ph-2)'),
        ],
      },
    ],
  }] as SectionDef[],

  mentoring: [
    {
      id: 'mentored', title: '(a) Student mentoring', tabLabel: '(a) Mentoring & achievements',
      blocks: [
        {
          kind: 'fields', id: 'mentoring.summary', title: 'Students mentored', optional: true, columns: 3,
          fields: [count('totalStudentsMentored', 'Total No. of Students Mentored')],
        },
        table('mentoring.achievements', 'Student achievements (mentees / project students)', 'achievement', [
          text('studentNameRollNo', 'Student Name & Roll No.', { required: true, summary: true }),
          combo('achievement', 'Achievement', {
            summary: true, hint: 'Placement / Hackathon / Paper / Award / GATE-CAT-GRE / Start-up',
            options: ['Placement', 'Hackathon', 'Paper', 'Award', 'GATE-CAT-GRE', 'Start-up'],
          }),
          select('level', 'Level', { summary: true, options: LEVEL4 }),
          month('monthYear', 'Month & Year', { summary: true }),
        ]),
      ],
    },
    {
      id: 'projects', title: '(b) Student projects guided (Diploma / UG / PG)', tabLabel: '(b) Projects guided',
      blocks: [
        table('mentoring.projectsGuided', 'Student projects guided (Diploma / UG / PG)', 'project', [
          select('level', 'Level', { summary: true, options: [o('DIPLOMA', 'Diploma'), o('UG', 'UG'), o('PG', 'PG')] }),
          text('projectTitle', 'Project Title', { required: true, summary: true, wide: true }),
          count('numStudents', 'No. of Students', { summary: true }),
          select('outcome', 'Outcome', { summary: true, options: [o('PAPER', 'Paper'), o('PATENT', 'Patent'), o('PROTOTYPE', 'Prototype'), o('COMPETITION', 'Competition')] }),
        ]),
      ],
    },
  ] as SectionDef[],

  fdp: [
    {
      id: 'programs', title: '(a) Workshops / FDPs / Seminars / Training programs attended', tabLabel: '(a) Workshops / FDPs',
      blocks: [
        table('fdp.programs', 'Workshops / FDPs / Seminars / Training programs attended', 'program', [
          text('title', 'Title of the Program', { required: true, summary: true, wide: true }),
          select('mode', 'Mode', { summary: true, options: [o('OFFLINE', 'Offline'), o('ONLINE', 'Online'), o('BLENDED', 'Blended')] }),
          text('organizerVenue', 'Organizing Institution / Venue', { summary: true }),
          range('duration', 'Duration (From–To)', { summary: true }),
          count('numDays', 'No. of Days', { summary: true }),
        ]),
      ],
    },
    {
      id: 'certs', title: '(b) Certifications', tabLabel: '(b) Certifications',
      blocks: [
        table('fdp.certifications', 'Certifications', 'certification', [
          select('platform', 'Platform', { summary: true, options: [o('NPTEL', 'NPTEL'), o('SWAYAM', 'Swayam'), o('COURSERA', 'Coursera'), o('OTHER', 'Other')] }),
          text('courseTitle', 'Title of the Course', { required: true, summary: true, wide: true }),
          range('duration', 'Duration (From–To)', { summary: true }),
          text('durationWeeksHours', 'No. of Weeks / Hours', { summary: true }),
          text('gradeScore', 'Grade / Score', { summary: true }),
        ]),
      ],
    },
  ] as SectionDef[],

  admin: [
    {
      id: 'institute', title: '(a) Institute level roles', tabLabel: '(a) Institute level',
      blocks: [
        table('administrative.instituteRoles', 'Institute level roles', 'role', [
          combo('role', 'Role', {
            required: true, summary: true,
            hint: 'e.g. NAAC/NBA criterion coordinator, IQAC, Exam Cell, Training & Placement, NSS/NCC, Anti-Ragging',
            options: ['NAAC/NBA criterion coordinator', 'IQAC', 'Exam Cell', 'Training & Placement', 'NSS/NCC', 'Anti-Ragging'],
          }),
          area('responsibility', 'Responsibility / Description', { summary: true }),
          text('period', 'Period', { summary: true }),
        ]),
      ],
    },
    {
      id: 'department', title: '(b) Department level roles', tabLabel: '(b) Department level',
      blocks: [
        table('administrative.departmentRoles', 'Department level roles', 'role', [
          combo('role', 'Role', {
            required: true, summary: true,
            hint: 'e.g. Class Coordinator, Module Coordinator, Lab In-charge, Time-table In-charge, NAAC/NBA criterion coordinator, IQAC, Exam Cell, Training & Placement, NSS/NCC, Anti-Ragging',
            options: ['Class Coordinator', 'Module Coordinator', 'Lab In-charge', 'Time-table In-charge', 'NAAC/NBA criterion coordinator', 'IQAC', 'Exam Cell', 'Training & Placement', 'NSS/NCC', 'Anti-Ragging'],
          }),
          area('responsibility', 'Responsibility / Description', { summary: true }),
          text('period', 'Period', { summary: true }),
        ]),
      ],
    },
    {
      id: 'events', title: '(c) Student workshops / events / tours / trainings / guest lectures organized / coordinated', tabLabel: '(c) Events organized',
      blocks: [
        table('administrative.events', 'Student workshops / events / tours / trainings / guest lectures organized / coordinated', 'event', [
          text('activityType', 'Type of Activity', { summary: true }),
          text('role', 'Role', { summary: true }),
          text('titleDetails', 'Title / Details of the Event', { required: true, summary: true, wide: true }),
          range('duration', 'Duration (From–To)', { summary: true }),
          count('numBeneficiaries', 'No. of Beneficiaries', { summary: true }),
        ]),
      ],
    },
  ] as SectionDef[],

  research: [
    {
      id: 'journals', title: '(a) Journal publications', tabLabel: '(a) Journals',
      blocks: [
        {
          kind: 'fields', id: 'research.journalCounts', title: 'Publication counts', optional: true, columns: 4, provisional: TOTALS_NOTE,
          fields: [count('sciScie', 'SCI/SCIE'), count('scopus', 'Scopus'), count('ugcCareAbdc', 'UGC-CARE / ABDC'), count('others', 'Others')],
        },
        table('research.journals', 'Journal publications', 'publication', [
          area('title', 'Title of Paper (mark your position in author list)', { required: true, summary: true, wide: true }),
          text('journalName', 'Name of the Journal', { summary: true }),
          text('volIssuePage', 'Vol. / Issue / Page No.'),
          month('monthYear', 'Month & Year', { summary: true }),
          select('indexing', 'Indexing', { summary: true, options: [o('SCI', 'SCI'), o('SCOPUS', 'Scopus'), o('UGC_CARE', 'UGC-CARE'), o('ABDC', 'ABDC'), o('OTHERS', 'Others')] }),
          text('doiIssn', 'DOI/ISSN'),
        ]),
      ],
    },
    {
      id: 'conferences', title: '(b) Conference papers presented', tabLabel: '(b) Conferences',
      blocks: [
        table('research.conferences', 'Conference papers presented', 'paper', [
          area('title', 'Title of the Paper', { required: true, summary: true, wide: true }),
          text('conferenceName', 'Name of the Conference', { summary: true }),
          select('level', 'Level', { summary: true, options: LEVEL2 }),
          month('monthYear', 'Month & Year', { summary: true }),
          text('venue', 'Venue'),
          text('doiIndexedIn', 'DOI / Indexed in'),
          count('numCitations', 'No. of Citations', { summary: true }),
        ]),
      ],
    },
    {
      id: 'metrics', title: '(c) Research profile metrics', tabLabel: '(c) Profile metrics',
      blocks: [{
        kind: 'matrix', id: 'research.metrics', rowHeader: 'Platform', rowKeyField: 'platform',
        rows: [{ key: 'GOOGLE_SCHOLAR', label: 'Google Scholar' }, { key: 'SCOPUS', label: 'Scopus' }, { key: 'WEB_OF_SCIENCE', label: 'Web of Science' }],
        cols: [
          { key: 'totalPublications', label: 'Total Publications' }, { key: 'totalCitations', label: 'Total Citations' },
          { key: 'hIndex', label: 'h-index' }, { key: 'i10Index', label: 'i10-index' },
        ],
      }],
    },
    {
      id: 'guidance', title: '(d) Research guidance and own Ph.D. progress', tabLabel: '(d) Guidance & own Ph.D.',
      blocks: [
        table('research.guidance', '(i) Research scholars / PG dissertations guided', 'scholar', [
          text('scholarName', 'Name of Scholar', { required: true, summary: true }),
          select('degree', 'Degree', { summary: true, options: [o('PHD', 'Ph.D.'), o('MTECH', 'M.Tech'), o('MBA', 'MBA')] }),
          text('universityRegNo', 'University / Reg. No.', { summary: true }),
          select('status', 'Status', { summary: true, options: [o('REGISTERED', 'Registered'), o('SUBMITTED', 'Submitted'), o('AWARDED', 'Awarded')] }),
          text('year', 'Year', { summary: true }),
        ]),
        {
          kind: 'fields', id: 'research.ownPhd', title: '(ii) Own Ph.D. progress (if pursuing)', optional: true, columns: 2,
          fields: [
            text('universityCenter', 'University / Center'),
            text('yearOfRegistration', 'Year of Registration'),
            select('currentStage', 'Current Stage', { options: PHD_STAGE, wide: true }),
            area('progressDuringYear', 'Progress during the year', { wide: true }),
          ],
        },
      ],
    },
  ] as SectionDef[],

  projects: [{
    id: 'projects', title: '6. Funded Projects / Consultancy',
    blocks: [
      {
        kind: 'fields', id: 'fundedProjects.summary', title: 'Summary', optional: true, columns: 4, provisional: TOTALS_NOTE,
        fields: [
          count('sanctionedCount', 'Sanctioned'), count('appliedCount', 'Applied'),
          num('totalAmountSanctionedRs', 'Total Amount Sanctioned (Rs.)', { min: 0 }),
          num('consultancyRevenueRs', 'Consultancy Revenue (Rs.)', { min: 0 }),
        ],
      },
      table('fundedProjects.entries', 'Funded projects / consultancy', 'project', [
        text('title', 'Title', { required: true, summary: true, wide: true }),
        text('roleTeam', 'Role (PI / Co-PI) & Team', { summary: true }),
        select('type', 'Type', { summary: true, options: [o('RESEARCH', 'Research'), o('CONSULTANCY', 'Consultancy')] }),
        text('fundingAgencyClient', 'Funding Agency / Client', { summary: true }),
        num('amountRs', 'Amount (Rs.)', { min: 0, summary: true }),
        range('duration', 'Duration (From–To)'),
        select('status', 'Status', { summary: true, options: [o('SANCTIONED', 'Sanctioned'), o('APPLIED', 'Applied')] }),
        text('year', 'Year', { summary: true }),
      ]),
    ],
  }] as SectionDef[],

  ipr: [
    {
      id: 'patents', title: '(a) Patents / Designs / Copyrights', tabLabel: '(a) Patents / Designs / Copyrights',
      blocks: [
        {
          kind: 'fields', id: 'ipr.patentSummary', title: 'Summary', optional: true, columns: 3, provisional: TOTALS_NOTE,
          fields: [count('filed', 'Filed'), count('published', 'Published'), count('granted', 'Granted')],
        },
        table('ipr.patents', 'Patents / Designs / Copyrights', 'patent', [
          text('applicantsInventors', 'Applicant / Inventor(s)', { summary: true }),
          text('titleApplicationNo', 'Title & Application / Patent No.', { required: true, summary: true, wide: true }),
          select('type', 'Type', { summary: true, options: [o('DESIGN', 'Design'), o('UTILITY', 'Utility'), o('COPYRIGHT', 'Copyright')] }),
          select('status', 'Status', { summary: true, options: [o('FILED', 'Filed'), o('PUBLISHED', 'Published'), o('GRANTED', 'Granted')] }),
          date('date', 'Date (DD-MM-YYYY)', { summary: true }),
        ]),
      ],
    },
    {
      id: 'books', title: '(b) Books / Book chapters', tabLabel: '(b) Books / Book chapters',
      blocks: [
        {
          kind: 'fields', id: 'ipr.bookSummary', title: 'Summary', optional: true, columns: 3, provisional: TOTALS_NOTE,
          fields: [count('booksPublished', 'No. of Books Published'), count('chaptersPublished', 'No. of Book Chapters Published')],
        },
        table('ipr.books', 'Books / Book chapters', 'book or chapter', [
          text('authors', 'Authors', { summary: true }),
          text('title', 'Title of the Book / Chapter', { required: true, summary: true, wide: true }),
          text('publisher', 'Publisher', { summary: true }),
          text('isbn', 'ISBN'),
          month('monthYear', 'Month & Year', { summary: true }),
          select('type', 'Type', { summary: true, options: [o('BOOK', 'Book'), o('CHAPTER', 'Chapter')] }),
        ]),
      ],
    },
  ] as SectionDef[],

  outreach: [{
    id: 'outreach', title: '8. Outreach',
    blocks: [
      table('outreach.activities', 'Outreach', 'activity', [
        combo('role', 'Role', {
          summary: true, options: OUTREACH_ROLES,
          hint: 'Role may be: ' + OUTREACH_ROLES.join(' / '),
        }),
        text('eventActivity', 'Event / Activity', { required: true, summary: true, wide: true }),
        text('organization', 'Name of the Organization / Institution', { summary: true }),
        text('venue', 'Venue', { summary: true }),
        date('date', 'Date', { summary: true }),
      ]),
    ],
  }] as SectionDef[],

  memberships: [{
    id: 'memberships', title: '9. Professional Memberships, Awards & Recognitions',
    blocks: [
      table('membershipsAwards.entries', 'Professional memberships, awards & recognitions', 'entry', [
        text('name', 'Membership / Award / Recognition', { required: true, summary: true, wide: true }),
        text('body', 'Professional / Awarding Body', { summary: true, hint: 'IEEE, CSI, ISTE, IE(I), etc.' }),
        select('level', 'Level', { summary: true, options: LEVEL4 }),
        text('year', 'Year', { summary: true }),
      ]),
    ],
  }] as SectionDef[],

  other: [{
    id: 'other', title: '10. Any Other Contributions',
    blocks: [{
      kind: 'fields', id: 'otherContributions', columns: 1, title: 'Any Other Contributions',
      fields: [
        area('departmentLevel', 'At Department level', { wide: true }),
        area('instituteLevel', 'At Institute level', { wide: true }),
      ],
    }],
  }] as SectionDef[],

  declaration: [{
    id: 'declaration', title: 'Declaration',
    blocks: [{
      kind: 'fields', id: 'declaration', mandatory: true, allowNone: false, columns: 2,
      note: 'I hereby declare that the information furnished in this report is true and correct to the best of my knowledge, and that supporting documents are available for verification.',
      provisional: 'The PDF has Date, Place and a handwritten signature. Entering the date and place and typing your name as the signature is a proposed digital substitute and needs college confirmation.',
      fields: [
        date('declaredOn', 'Date', { required: true }),
        text('place', 'Place', { required: true }),
        text('signature', 'Signature of Faculty', { required: true, wide: true, hint: 'Type your full name to sign.' }),
      ],
    }],
  }] as SectionDef[],
}

/* ---------------- steps (UI workflow mapped onto the PDF) ---------------- */
export const STEPS: StepDef[] = [
  { id: 'general', title: 'General Information', kind: 'sections', part: 'Part A', pdfRef: 'Part A', code: 'A',
    description: 'Details about you and the academic year.', sections: SECTIONS.general },
  { id: 'teaching', title: 'Teaching & Learning', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 1', code: 'B1',
    description: 'Courses handled during the academic year, with pass and feedback figures.', sections: SECTIONS.teaching },
  { id: 'mentoring', title: 'Student Mentoring, Project Guidance & Achievements', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 2', code: 'B2',
    description: 'Students mentored, their achievements and the projects you guided.', sections: SECTIONS.mentoring },
  { id: 'fdp', title: 'FDPs / Certifications', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 3', code: 'B3',
    description: 'Programs attended and certifications completed.', sections: SECTIONS.fdp },
  { id: 'admin', title: 'Administrative Responsibilities', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 4', code: 'B4',
    description: 'Institute and department roles, and student events you organized or coordinated.', sections: SECTIONS.admin },
  { id: 'research', title: 'Research & Publications', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 5', code: 'B5',
    description: 'Journals, conference papers, research profile metrics and research guidance.', sections: SECTIONS.research },
  { id: 'projects', title: 'Funded Projects / Consultancy', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 6', code: 'B6',
    description: 'Sanctioned and applied projects and consultancy.', sections: SECTIONS.projects },
  { id: 'ipr', title: 'Patents, Books & IPR', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 7', code: 'B7',
    description: 'Patents, designs, copyrights, books and book chapters.', sections: SECTIONS.ipr },
  { id: 'outreach', title: 'Outreach', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 8', code: 'B8',
    description: 'Lectures, committees, reviews and other outreach activity.', sections: SECTIONS.outreach },
  { id: 'memberships', title: 'Professional Memberships, Awards & Recognitions', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 9', code: 'B9',
    description: 'Memberships held and awards received.', sections: SECTIONS.memberships },
  { id: 'other', title: 'Any Other Contributions', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 10', code: 'B10',
    description: 'Contributions at department and institute level not covered above. This section has no score of its own.', sections: SECTIONS.other },
  { id: 'scores', title: 'Self-Appraisal Score Sheet & Supporting Documents', kind: 'scores', part: 'Part B', pdfRef: 'Part B · Section 11', code: 'B11',
    description: 'Maximum marks for your cadre, your self-score, and the supporting documents enclosed.' },
  { id: 'declaration', title: 'Declaration', kind: 'sections', part: 'Declaration & approvals', pdfRef: 'Declaration',
    description: 'Confirm the information furnished in this report.', sections: SECTIONS.declaration },
  { id: 'hod', title: 'Recommendations of HoD', kind: 'official', official: 'hod', part: 'Declaration & approvals', pdfRef: 'Recommendations of HoD',
    description: 'Completed by the Head of the Department. Shown here for reference.',
    provisional: 'The PDF has a remarks box and "Head of the Department (Signature with Seal & Date)". How the HoD completes this digitally (signature, seal, timing) is not defined and needs college confirmation.' },
  { id: 'principal', title: 'Remarks of the Principal', kind: 'official', official: 'principal', part: 'Declaration & approvals', pdfRef: 'Remarks of the Principal',
    description: 'Completed by the Principal. Shown here for reference.',
    provisional: 'The PDF has a remarks box and "Principal (Signature with Seal & Date)". How the Principal completes this digitally is not defined and needs college confirmation.' },
  { id: 'review', title: 'Review & Submit', kind: 'review', part: 'Submission', pdfRef: 'Not in the PDF (UI step)',
    description: 'Check every section before submitting.',
    provisional: 'This step is added by the application. The PDF does not define the submission or approval workflow.' },
]

export const stepById = (id: string) => STEPS.find((s) => s.id === id)

/** Form-state key for the "Supporting documents enclosed" ticks (step "scores"). Also the contract section name. */
export const SUPPORTING_DOCS_BLOCK = 'supportingDocuments'

export function allBlocks(step: StepDef): { section: SectionDef; block: BlockDef }[] {
  return (step.sections ?? []).flatMap((section) => section.blocks.map((block) => ({ section, block })))
}
