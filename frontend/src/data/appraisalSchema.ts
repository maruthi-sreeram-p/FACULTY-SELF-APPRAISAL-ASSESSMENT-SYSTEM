import type { BlockDef, FieldDef, Option, SectionDef, StepDef } from '../types'
import { CADRES } from './scoring'

/**
 * Form structure transcribed from the college's
 * "Faculty Self-Appraisal & Assessment Report" (Sri Vasavi Engineering College, 6 pages).
 *
 *  - Field names, table columns, option lists and section order follow the PDF.
 *  - Where the PDF prints a list of options in a column header (e.g. "Level (Inst / State / Nat / Intl)"),
 *    the label drops the parenthesis and the options become the selectable values.
 *  - Anything the PDF does NOT define is marked `provisional` (shown in the UI as "Provisional").
 *  - There are no scoring rules here. Scores come from the backend; see scoring.ts for the printed maximum marks.
 */

export const ACADEMIC_YEARS = ['2025-26', '2024-25', '2023-24']

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

/* ---------------- option lists straight from the PDF ---------------- */
const LEVEL4: Option[] = [
  { value: 'Inst', label: 'Inst (Institute)' }, { value: 'State', label: 'State' },
  { value: 'Nat', label: 'Nat (National)' }, { value: 'Intl', label: 'Intl (International)' },
]
const LEVEL2: Option[] = [{ value: 'Nat', label: 'Nat (National)' }, { value: 'Intl', label: 'Intl (International)' }]
const DEPARTMENTS = ['CE', 'ME', 'ECE / ECT', 'EEE', 'CSE / IT', 'AIML / CAI / DS', 'BSH', 'MBA']
const PHD_STATUS = ['Awarded', 'Pursuing', 'Not applicable']
const PHD_STAGE = ['Course work', 'Comprehensive / Proposal', 'Synopsis / Pre-Ph.D.', 'Thesis submitted', 'Viva-voce completed']
const OUTREACH_ROLES = [
  'Conference Session Chair', 'Expert Lectures Delivered', 'Resource Person', 'Editorial Board Member',
  'Reviewer for Journals', 'External Examiner', 'External Thesis Evaluated', 'Visiting Researcher',
  'Industry Interaction or MoU', 'International Conferences Attended', 'Others',
]

/** UI-only rule, not in the PDF: the first (identifying) column of each table must be filled for a row to be saved. */
const REQ_NOTE = 'Which fields are required is a UI choice, not defined by the PDF.'

/* ---------------- sections ---------------- */
const table = (id: string, title: string, rowLabel: string, rowFields: FieldDef[], extra: Partial<BlockDef> = {}): BlockDef =>
  ({ kind: 'table', id, title, rowLabel, rowFields, ...extra }) as BlockDef

const TOTALS_NOTE = 'The PDF shows blanks for these totals. Whether they are typed in or derived from the table rows needs college confirmation.'

const STEPS_SECTIONS = {
  general: [{
    id: 'general', title: 'Part A: General Information',
    blocks: [{
      kind: 'fields', id: 'general', mandatory: true, allowNone: false, columns: 2,
      provisional: `${REQ_NOTE} Only Name, Academic Year, Department / Branch and Designation (Cadre) are enforced.`,
      fields: [
        text('name', 'Name of the Faculty', { required: true }),
        text('academicYear', 'Academic Year', { required: true, placeholder: '2025-26' }),
        text('employeeId', 'Employee ID'),
        text('contactNo', 'Contact No.', { placeholder: '+91 …' }),
        select('department', 'Department / Branch', { required: true, options: DEPARTMENTS }),
        select('cadre', 'Designation (Cadre)', { required: true, options: [...CADRES], hint: 'Determines your maximum marks (Annexure A).' }),
        text('qualification', 'Highest Qualification & Specialization'),
        select('phdStatus', 'Ph.D. Status', { options: PHD_STATUS }),
        date('joiningInstitution', 'Date of Joining (Institution)'),
        date('joiningDesignation', 'Date of Joining (Present Designation)'),
        num('expTeaching', 'Total Experience (Years): Teaching', { min: 0, step: 0.1 }),
        num('expIndustry', 'Total Experience (Years): Industry', { min: 0, step: 0.1 }),
        num('expResearch', 'Total Experience (Years): Research', { min: 0, step: 0.1 }),
        text('email', 'E-mail ID'),
        text('researcherId', 'ORCID / Scopus / Google Scholar / Vidwan ID', { wide: true }),
      ],
    }],
  }] as SectionDef[],

  teaching: [{
    id: 'courses', title: '1. Teaching & Learning',
    blocks: [
      table('courses', 'Courses handled during the Academic Year', 'course', [
        text('course', 'Course Code & Name (Theory / Lab)', { required: true, summary: true, wide: true, hint: 'Mention whether the course is Theory or Lab.' }),
        text('program', 'Program & Branch', { summary: true }),
        text('sem', 'Sem', { summary: true }),
        count('sections', 'No. of Sections', { summary: true }),
        num('hours', 'Hours / Week', { min: 0, summary: true }),
        pct('passPct', 'Pass %', { summary: true }),
        pct('fb1', 'Phase-1 Feedback %', { summary: true }),
        pct('fb2', 'Phase-2 Feedback %', { summary: true }),
      ]),
      {
        kind: 'fields', id: 'totals', title: 'Totals', optional: true, columns: 3, provisional: TOTALS_NOTE,
        fields: [
          num('totalLoad', 'Total teaching load (Hrs/Week)', { min: 0 }),
          pct('avgPass', 'Average Pass %'),
          pct('avgFeedback', 'Average Feedback % (Ph-1 & Ph-2)'),
        ],
      },
    ],
  }] as SectionDef[],

  mentoring: [
    {
      id: 'mentored', title: '(a) Student mentoring', tabLabel: '(a) Mentoring & achievements',
      blocks: [
        {
          kind: 'fields', id: 'total', title: 'Students mentored', optional: true, columns: 3,
          fields: [count('totalMentored', 'Total No. of Students Mentored')],
        },
        table('achievements', 'Student achievements (mentees / project students)', 'achievement', [
          text('student', 'Student Name & Roll No.', { required: true, summary: true }),
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
        table('projects', 'Student projects guided (Diploma / UG / PG)', 'project', [
          select('level', 'Level', { summary: true, options: ['Diploma', 'UG', 'PG'] }),
          text('title', 'Project Title', { required: true, summary: true, wide: true }),
          count('students', 'No. of Students', { summary: true }),
          select('outcome', 'Outcome', { summary: true, options: ['Paper', 'Patent', 'Prototype', 'Competition'] }),
        ]),
      ],
    },
  ] as SectionDef[],

  fdp: [
    {
      id: 'programs', title: '(a) Workshops / FDPs / Seminars / Training programs attended', tabLabel: '(a) Workshops / FDPs',
      blocks: [
        table('programs', 'Workshops / FDPs / Seminars / Training programs attended', 'program', [
          text('title', 'Title of the Program', { required: true, summary: true, wide: true }),
          select('mode', 'Mode', { summary: true, options: ['Offline', 'Online', 'Blended'] }),
          text('venue', 'Organizing Institution / Venue', { summary: true }),
          range('duration', 'Duration (From–To)', { summary: true }),
          count('days', 'No. of Days', { summary: true }),
        ]),
      ],
    },
    {
      id: 'certs', title: '(b) Certifications', tabLabel: '(b) Certifications',
      blocks: [
        table('certs', 'Certifications', 'certification', [
          select('platform', 'Platform', { summary: true, options: ['NPTEL', 'Swayam', 'Coursera', 'Other'] }),
          text('title', 'Title of the Course', { required: true, summary: true, wide: true }),
          range('duration', 'Duration (From–To)', { summary: true }),
          text('weeksHours', 'No. of Weeks / Hours', { summary: true }),
          text('grade', 'Grade / Score', { summary: true }),
        ]),
      ],
    },
  ] as SectionDef[],

  admin: [
    {
      id: 'institute', title: '(a) Institute level roles', tabLabel: '(a) Institute level',
      blocks: [
        table('institute', 'Institute level roles', 'role', [
          combo('role', 'Role', {
            required: true, summary: true,
            hint: 'e.g. NAAC/NBA criterion coordinator, IQAC, Exam Cell, Training & Placement, NSS/NCC, Anti-Ragging',
            options: ['NAAC/NBA criterion coordinator', 'IQAC', 'Exam Cell', 'Training & Placement', 'NSS/NCC', 'Anti-Ragging'],
          }),
          area('description', 'Responsibility / Description', { summary: true }),
          text('period', 'Period', { summary: true }),
        ]),
      ],
    },
    {
      id: 'department', title: '(b) Department level roles', tabLabel: '(b) Department level',
      blocks: [
        table('department', 'Department level roles', 'role', [
          combo('role', 'Role', {
            required: true, summary: true,
            hint: 'e.g. Class Coordinator, Module Coordinator, Lab In-charge, Time-table In-charge, NAAC/NBA criterion coordinator, IQAC, Exam Cell, Training & Placement, NSS/NCC, Anti-Ragging',
            options: ['Class Coordinator', 'Module Coordinator', 'Lab In-charge', 'Time-table In-charge', 'NAAC/NBA criterion coordinator', 'IQAC', 'Exam Cell', 'Training & Placement', 'NSS/NCC', 'Anti-Ragging'],
          }),
          area('description', 'Responsibility / Description', { summary: true }),
          text('period', 'Period', { summary: true }),
        ]),
      ],
    },
    {
      id: 'events', title: '(c) Student workshops / events / tours / trainings / guest lectures organized / coordinated', tabLabel: '(c) Events organized',
      blocks: [
        table('events', 'Student workshops / events / tours / trainings / guest lectures organized / coordinated', 'event', [
          text('activityType', 'Type of Activity', { summary: true }),
          text('role', 'Role', { summary: true }),
          text('title', 'Title / Details of the Event', { required: true, summary: true, wide: true }),
          range('duration', 'Duration (From–To)', { summary: true }),
          count('beneficiaries', 'No. of Beneficiaries', { summary: true }),
        ]),
      ],
    },
  ] as SectionDef[],

  research: [
    {
      id: 'journals', title: '(a) Journal publications', tabLabel: '(a) Journals',
      blocks: [
        {
          kind: 'fields', id: 'journalCounts', title: 'Publication counts', optional: true, columns: 4, provisional: TOTALS_NOTE,
          fields: [count('sci', 'SCI/SCIE'), count('scopus', 'Scopus'), count('ugcCare', 'UGC-CARE / ABDC'), count('others', 'Others')],
        },
        table('journals', 'Journal publications', 'publication', [
          area('title', 'Title of Paper (mark your position in author list)', { required: true, summary: true, wide: true }),
          text('journal', 'Name of the Journal', { summary: true }),
          text('volIssuePage', 'Vol. / Issue / Page No.'),
          month('monthYear', 'Month & Year', { summary: true }),
          select('indexing', 'Indexing', { summary: true, options: ['SCI', 'Scopus', 'UGC-CARE', 'ABDC', 'Others'] }),
          text('doi', 'DOI/ISSN'),
        ]),
      ],
    },
    {
      id: 'conferences', title: '(b) Conference papers presented', tabLabel: '(b) Conferences',
      blocks: [
        table('conferences', 'Conference papers presented', 'paper', [
          area('title', 'Title of the Paper', { required: true, summary: true, wide: true }),
          text('conference', 'Name of the Conference', { summary: true }),
          select('level', 'Level', { summary: true, options: LEVEL2 }),
          month('monthYear', 'Month & Year', { summary: true }),
          text('venue', 'Venue'),
          text('doiIndexed', 'DOI / Indexed in'),
          count('citations', 'No. of Citations', { summary: true }),
        ]),
      ],
    },
    {
      id: 'metrics', title: '(c) Research profile metrics', tabLabel: '(c) Profile metrics',
      blocks: [{
        kind: 'matrix', id: 'metrics', rowHeader: 'Platform',
        rows: [{ key: 'scholar', label: 'Google Scholar' }, { key: 'scopus', label: 'Scopus' }, { key: 'wos', label: 'Web of Science' }],
        cols: [
          { key: 'publications', label: 'Total Publications' }, { key: 'citations', label: 'Total Citations' },
          { key: 'hIndex', label: 'h-index' }, { key: 'i10Index', label: 'i10-index' },
        ],
      }],
    },
    {
      id: 'guidance', title: '(d) Research guidance and own Ph.D. progress', tabLabel: '(d) Guidance & own Ph.D.',
      blocks: [
        table('scholars', '(i) Research scholars / PG dissertations guided', 'scholar', [
          text('name', 'Name of Scholar', { required: true, summary: true }),
          select('degree', 'Degree', { summary: true, options: ['Ph.D.', 'M.Tech', 'MBA'] }),
          text('university', 'University / Reg. No.', { summary: true }),
          select('status', 'Status', { summary: true, options: ['Registered', 'Submitted', 'Awarded'] }),
          text('year', 'Year', { summary: true }),
        ]),
        {
          kind: 'fields', id: 'ownPhd', title: '(ii) Own Ph.D. progress (if pursuing)', optional: true, columns: 2,
          fields: [
            text('university', 'University / Center'),
            text('regYear', 'Year of Registration'),
            select('stage', 'Current Stage', { options: PHD_STAGE, wide: true }),
            area('progress', 'Progress during the year', { wide: true }),
          ],
        },
      ],
    },
  ] as SectionDef[],

  projects: [{
    id: 'projects', title: '6. Funded Projects / Consultancy',
    blocks: [
      {
        kind: 'fields', id: 'projectCounts', title: 'Summary', optional: true, columns: 4, provisional: TOTALS_NOTE,
        fields: [
          count('sanctioned', 'Sanctioned'), count('applied', 'Applied'),
          num('amountSanctioned', 'Total Amount Sanctioned (Rs.)', { min: 0 }),
          num('consultancyRevenue', 'Consultancy Revenue (Rs.)', { min: 0 }),
        ],
      },
      table('projects', 'Funded projects / consultancy', 'project', [
        text('title', 'Title', { required: true, summary: true, wide: true }),
        text('role', 'Role (PI / Co-PI) & Team', { summary: true }),
        select('type', 'Type', { summary: true, options: ['Research', 'Consultancy'] }),
        text('agency', 'Funding Agency / Client', { summary: true }),
        num('amount', 'Amount (Rs.)', { min: 0, summary: true }),
        range('duration', 'Duration (From–To)'),
        select('status', 'Status', { summary: true, options: ['Sanctioned', 'Applied'] }),
        text('year', 'Year', { summary: true }),
      ]),
    ],
  }] as SectionDef[],

  ipr: [
    {
      id: 'patents', title: '(a) Patents / Designs / Copyrights', tabLabel: '(a) Patents / Designs / Copyrights',
      blocks: [
        {
          kind: 'fields', id: 'patentCounts', title: 'Summary', optional: true, columns: 3, provisional: TOTALS_NOTE,
          fields: [count('filed', 'Filed'), count('published', 'Published'), count('granted', 'Granted')],
        },
        table('patents', 'Patents / Designs / Copyrights', 'patent', [
          text('applicant', 'Applicant / Inventor(s)', { summary: true }),
          text('title', 'Title & Application / Patent No.', { required: true, summary: true, wide: true }),
          select('type', 'Type', { summary: true, options: ['Design', 'Utility', 'Copyright'] }),
          select('status', 'Status', { summary: true, options: ['Filed', 'Published', 'Granted'] }),
          date('date', 'Date (DD-MM-YYYY)', { summary: true }),
        ]),
      ],
    },
    {
      id: 'books', title: '(b) Books / Book chapters', tabLabel: '(b) Books / Book chapters',
      blocks: [
        {
          kind: 'fields', id: 'bookCounts', title: 'Summary', optional: true, columns: 3, provisional: TOTALS_NOTE,
          fields: [count('books', 'No. of Books Published'), count('chapters', 'No. of Book Chapters Published')],
        },
        table('books', 'Books / Book chapters', 'book or chapter', [
          text('authors', 'Authors', { summary: true }),
          text('title', 'Title of the Book / Chapter', { required: true, summary: true, wide: true }),
          text('publisher', 'Publisher', { summary: true }),
          text('isbn', 'ISBN'),
          month('monthYear', 'Month & Year', { summary: true }),
          select('type', 'Type', { summary: true, options: ['Book', 'Chapter'] }),
        ]),
      ],
    },
  ] as SectionDef[],

  outreach: [{
    id: 'outreach', title: '8. Outreach',
    blocks: [
      table('outreach', 'Outreach', 'activity', [
        combo('role', 'Role', {
          summary: true, options: OUTREACH_ROLES,
          hint: 'Role may be: ' + OUTREACH_ROLES.join(' / '),
        }),
        text('event', 'Event / Activity', { required: true, summary: true, wide: true }),
        text('organization', 'Name of the Organization / Institution', { summary: true }),
        text('venue', 'Venue', { summary: true }),
        date('date', 'Date', { summary: true }),
      ]),
    ],
  }] as SectionDef[],

  memberships: [{
    id: 'memberships', title: '9. Professional Memberships, Awards & Recognitions',
    blocks: [
      table('memberships', 'Professional memberships, awards & recognitions', 'entry', [
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
      kind: 'fields', id: 'other', columns: 1, title: 'Any Other Contributions',
      fields: [
        area('department', 'At Department level', { wide: true }),
        area('institute', 'At Institute level', { wide: true }),
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
        date('date', 'Date', { required: true }),
        text('place', 'Place', { required: true }),
        text('signature', 'Signature of Faculty', { required: true, wide: true, hint: 'Type your full name to sign.' }),
      ],
    }],
  }] as SectionDef[],
}

/* ---------------- steps (UI workflow mapped onto the PDF) ---------------- */
export const STEPS: StepDef[] = [
  { id: 'general', title: 'General Information', kind: 'sections', part: 'Part A', pdfRef: 'Part A', code: 'A',
    description: 'Details about you and the academic year.', sections: STEPS_SECTIONS.general },
  { id: 'teaching', title: 'Teaching & Learning', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 1', code: 'B1',
    description: 'Courses handled during the academic year, with pass and feedback figures.', sections: STEPS_SECTIONS.teaching },
  { id: 'mentoring', title: 'Student Mentoring, Project Guidance & Achievements', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 2', code: 'B2',
    description: 'Students mentored, their achievements and the projects you guided.', sections: STEPS_SECTIONS.mentoring },
  { id: 'fdp', title: 'FDPs / Certifications', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 3', code: 'B3',
    description: 'Programs attended and certifications completed.', sections: STEPS_SECTIONS.fdp },
  { id: 'admin', title: 'Administrative Responsibilities', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 4', code: 'B4',
    description: 'Institute and department roles, and student events you organized or coordinated.', sections: STEPS_SECTIONS.admin },
  { id: 'research', title: 'Research & Publications', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 5', code: 'B5',
    description: 'Journals, conference papers, research profile metrics and research guidance.', sections: STEPS_SECTIONS.research },
  { id: 'projects', title: 'Funded Projects / Consultancy', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 6', code: 'B6',
    description: 'Sanctioned and applied projects and consultancy.', sections: STEPS_SECTIONS.projects },
  { id: 'ipr', title: 'Patents, Books & IPR', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 7', code: 'B7',
    description: 'Patents, designs, copyrights, books and book chapters.', sections: STEPS_SECTIONS.ipr },
  { id: 'outreach', title: 'Outreach', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 8', code: 'B8',
    description: 'Lectures, committees, reviews and other outreach activity.', sections: STEPS_SECTIONS.outreach },
  { id: 'memberships', title: 'Professional Memberships, Awards & Recognitions', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 9', code: 'B9',
    description: 'Memberships held and awards received.', sections: STEPS_SECTIONS.memberships },
  { id: 'other', title: 'Any Other Contributions', kind: 'sections', part: 'Part B', pdfRef: 'Part B · Section 10', code: 'B10',
    description: 'Contributions at department and institute level not covered above. This section has no score of its own.', sections: STEPS_SECTIONS.other },
  { id: 'scores', title: 'Self-Appraisal Score Sheet & Supporting Documents', kind: 'scores', part: 'Part B', pdfRef: 'Part B · Section 11', code: 'B11',
    description: 'Maximum marks for your cadre, your self-score, and the supporting documents enclosed.' },
  { id: 'declaration', title: 'Declaration', kind: 'sections', part: 'Declaration & approvals', pdfRef: 'Declaration',
    description: 'Confirm the information furnished in this report.', sections: STEPS_SECTIONS.declaration },
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

export function allBlocks(step: StepDef): { section: SectionDef; block: BlockDef }[] {
  return (step.sections ?? []).flatMap((section) => section.blocks.map((block) => ({ section, block })))
}
