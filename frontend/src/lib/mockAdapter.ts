import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { STEPS } from '../data/appraisalSchema'
import { fromContent, toContent } from '../contract/mapper'
import type {
  AcademicYearDto, ActivityDto, AppraisalContentDto, AppraisalDto, AppraisalSummaryDto, DocumentDto, FacultyProfileDto,
  NotificationDto, ReportDto,
} from '../contract/dto'
import { COMPLETABLE, stepState } from './completion'

/**
 * Local stand-in for the PROPOSED backend (docs/backend/api-contract.md). Enabled with VITE_USE_MOCK=true.
 * It stores and returns the same wire DTOs the real backend would (src/contract/dto.ts). Everything here,
 * including the sample profile, is placeholder data. The real backend is the source of truth.
 *
 * Deliberately NOT mocked: scoring. `scoreSheet` stays null because the PDF defines maximum marks but no way
 * to produce a self-score; HoD / Principal reviews are also null until a backend supplies them.
 */

const KEY = 'mock-db-v3'
const LOCKED = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']
const CONTENT_KEYS = Object.keys(toContent({})) as (keyof AppraisalContentDto)[]

interface Db {
  appraisals: AppraisalDto[]
  documents: DocumentDto[]
  notifications: NotificationDto[]
  activity: Record<string, ActivityDto[]>
}

const profile: FacultyProfileDto = {
  id: 'f-001',
  employeeId: 'FAC-1042',
  name: 'P. Maruthi Sreeram',
  email: 'maruthi.sreeram@college.example',
  contactNo: null,
  department: { code: 'CSE_IT', label: 'CSE / IT' },
  cadre: 'ASSISTANT_PROFESSOR',
  avatarUrl: null,
}

const years: AcademicYearDto[] = [
  { label: '2025-26', current: true },
  { label: '2024-25', current: false },
  { label: '2023-24', current: false },
]

const reports: ReportDto[] = []

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    appraisals: [],
    documents: [],
    activity: {},
    notifications: [
      { id: 'n1', title: 'Welcome', body: 'Your draft is saved automatically while you work. You can return and continue later.', createdAt: new Date(Date.now() - 864e5).toISOString(), read: false },
    ],
  }
}
const save = (db: Db) => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* ignore */ } }

class HttpError extends Error { constructor(public status: number, message: string) { super(message) } }

function log(db: Db, id: string, message: string, mergeWithPrevious = false) {
  const list = (db.activity[id] ??= [])
  if (mergeWithPrevious && list[0]?.message === message) { list[0].at = new Date().toISOString(); return }
  list.unshift({ id: crypto.randomUUID(), message, at: new Date().toISOString() })
}

function summary(a: AppraisalDto): AppraisalSummaryDto {
  const data = fromContent(a)
  const steps = STEPS.filter(COMPLETABLE)
  return {
    id: a.id, academicYear: a.academicYear, status: a.status, createdAt: a.createdAt, updatedAt: a.updatedAt, submittedAt: a.submittedAt,
    progress: { completedSections: steps.filter((s) => stepState(s, data) === 'complete').length, totalSections: steps.length },
  }
}

/** Creating an appraisal snapshots the faculty profile into Part A (generalInfo). */
function create(db: Db, academicYear: string): AppraisalDto {
  if (!years.some((y) => y.label === academicYear)) throw new HttpError(422, `Unknown academic year ${academicYear}`)
  if (db.appraisals.some((a) => a.academicYear === academicYear)) throw new HttpError(409, `An appraisal for ${academicYear} already exists`)
  const content = toContent({})
  content.generalInfo = {
    ...content.generalInfo,
    facultyName: profile.name, academicYear, employeeId: profile.employeeId, contactNo: profile.contactNo,
    departmentCode: profile.department?.code ?? null, cadre: profile.cadre, email: profile.email,
  }
  const now = new Date().toISOString()
  const a: AppraisalDto = {
    ...content, id: crypto.randomUUID(), facultyId: profile.id, academicYear, status: 'DRAFT', version: 1,
    createdAt: now, updatedAt: now, submittedAt: null, scoreSheet: null, reviews: { hod: null, principal: null },
  }
  db.appraisals.push(a)
  log(db, a.id, 'Appraisal started')
  return a
}

const find = (db: Db, id: string) => {
  const a = db.appraisals.find((x) => x.id === id)
  if (!a) throw new HttpError(404, 'Appraisal not found')
  return a
}

function route(config: InternalAxiosRequestConfig): unknown {
  const method = (config.method ?? 'get').toLowerCase()
  const url = (config.url ?? '').split('?')[0]
  const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : config.data
  const db = load()
  let m: RegExpMatchArray | null

  if (method === 'get' && url === '/faculty/me') return profile
  if (method === 'get' && url === '/academic-years') return years

  if (method === 'get' && url === '/appraisals') {
    const year = config.params?.academicYear
    return db.appraisals.filter((a) => !year || a.academicYear === year).map(summary)
      .sort((a, b) => b.academicYear.localeCompare(a.academicYear))
  }
  if (method === 'post' && url === '/appraisals') {
    const a = create(db, body?.academicYear)
    save(db)
    return a
  }
  if ((m = url.match(/^\/appraisals\/([^/]+)$/))) {
    const a = find(db, m[1])
    if (method === 'get') return a
    if (method === 'patch') {
      if (LOCKED.includes(a.status)) throw new HttpError(409, 'This appraisal has been submitted and can no longer be edited.')
      const ifMatch = Number(config.headers?.get?.('If-Match') ?? (config.headers as Record<string, unknown> | undefined)?.['If-Match'])
      if (ifMatch && ifMatch !== a.version) throw new HttpError(412, 'This appraisal was changed elsewhere. Reload to continue.')
      for (const k of Object.keys(body ?? {})) {
        if (!CONTENT_KEYS.includes(k as keyof AppraisalContentDto)) throw new HttpError(422, `Unknown section "${k}"`)
        ;(a as unknown as Record<string, unknown>)[k] = body[k]
      }
      a.generalInfo.academicYear = a.academicYear // set by the server, not editable
      a.version += 1
      a.updatedAt = new Date().toISOString()
      log(db, a.id, 'Draft saved', true)
      save(db)
      return a
    }
  }
  if ((m = url.match(/^\/appraisals\/([^/]+)\/submit$/)) && method === 'post') {
    const a = find(db, m[1])
    if (LOCKED.includes(a.status)) throw new HttpError(409, 'This appraisal has already been submitted.')
    a.status = 'SUBMITTED'
    a.submittedAt = a.updatedAt = new Date().toISOString()
    a.version += 1
    log(db, a.id, 'Appraisal submitted')
    save(db)
    return a
  }
  if ((m = url.match(/^\/appraisals\/([^/]+)\/activity$/)) && method === 'get') return db.activity[find(db, m[1]).id] ?? []
  if ((m = url.match(/^\/appraisals\/([^/]+)\/score-sheet$/)) && method === 'get') {
    const a = find(db, m[1])
    if (!a.scoreSheet) throw new HttpError(404, 'No score sheet has been produced yet')
    return a.scoreSheet
  }
  if ((m = url.match(/^\/appraisals\/([^/]+)\/reviews$/)) && method === 'get') return find(db, m[1]).reviews

  if (method === 'get' && url === '/documents') return db.documents
  if (method === 'post' && url === '/documents') {
    const a = find(db, body.appraisalId)
    const d: DocumentDto = {
      id: crypto.randomUUID(), appraisalId: a.id, academicYear: a.academicYear, documentType: body.documentType,
      fileName: body.fileName, contentType: body.contentType ?? null, sizeBytes: body.sizeBytes, uploadedAt: new Date().toISOString(),
    }
    db.documents.push(d)
    log(db, a.id, `Uploaded ${d.fileName}`)
    save(db)
    return d
  }
  if ((m = url.match(/^\/documents\/([^/]+)$/)) && method === 'delete') {
    db.documents = db.documents.filter((x) => x.id !== m![1])
    save(db)
    return { ok: true }
  }

  if (method === 'get' && url === '/notifications') return db.notifications
  if (method === 'post' && url === '/notifications/read-all') {
    db.notifications.forEach((n) => (n.read = true))
    save(db)
    return db.notifications
  }
  if (method === 'get' && url === '/reports') return reports
  throw new HttpError(404, `No mock route for ${method.toUpperCase()} ${url}`)
}

export const mockAdapter: AxiosAdapter = (config) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = route(config)
        resolve({ data, status: 200, statusText: 'OK', headers: {}, config })
      } catch (e) {
        const status = e instanceof HttpError ? e.status : 500
        const detail = e instanceof Error ? e.message : 'Mock error'
        reject(new AxiosError(detail, String(status), config, null, {
          data: { title: ({ 404: 'Not Found', 409: 'Conflict', 412: 'Precondition Failed', 422: 'Unprocessable Entity' } as Record<number, string>)[status] ?? 'Error', status, detail },
          status, statusText: '', headers: {}, config,
        }))
      }
    }, 300)
  })
