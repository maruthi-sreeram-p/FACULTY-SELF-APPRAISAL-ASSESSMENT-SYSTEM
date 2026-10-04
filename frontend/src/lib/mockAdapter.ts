import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { STEPS } from '../data/appraisalSchema'
import { completionPercent, stepState, COMPLETABLE } from './completion'
import type {
  AppraisalDraft, AppraisalSummary, DashboardData, DocumentItem, NotificationItem, Profile, ReportItem,
} from '../types'

/**
 * Local stand-in for the backend so the UI can run on its own.
 * Enabled with VITE_USE_MOCK=true. Everything here (including the sample
 * score) is placeholder data: the real backend is the source of truth.
 */

const KEY = 'mock-db-v2'
const CURRENT_YEAR = '2025-26'

interface Db {
  drafts: Record<string, AppraisalDraft>
  documents: DocumentItem[]
  notifications: NotificationItem[]
}

const profile: Profile = {
  id: 'f-001',
  name: 'P. Maruthi Sreeram',
  email: 'maruthi.sreeram@college.example',
  designation: 'Assistant Professor',
  cadre: 'Assistant Professor',
  department: 'Computer Science & Engineering',
  employeeId: 'FAC-1042',
  avatarUrl: null,
}

const reports: ReportItem[] = []

const emptyDraft = (year: string): AppraisalDraft => ({
  year, status: 'not_started', updatedAt: null, data: {}, scores: null,
})

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  const now = Date.now()
  return {
    drafts: { [CURRENT_YEAR]: emptyDraft(CURRENT_YEAR) },
    documents: [],
    notifications: [
      { id: 'n1', title: 'Appraisal window open', body: `The ${CURRENT_YEAR} self-appraisal is open for submissions.`, at: new Date(now - 864e5).toISOString(), read: false },
      { id: 'n2', title: 'Welcome', body: 'Save drafts at any time; you can return and continue later.', at: new Date(now - 3 * 864e5).toISOString(), read: true },
    ],
  }
}
const save = (db: Db) => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* ignore */ } }

const draftFor = (db: Db, year: string) => (db.drafts[year] ??= emptyDraft(year))

function summary(d: AppraisalDraft): AppraisalSummary {
  return { year: d.year, status: d.status, completion: completionPercent(STEPS, d.data), updatedAt: d.updatedAt }
}

function dashboard(db: Db, year: string): DashboardData {
  const d = draftFor(db, year)
  const pending = STEPS.filter(COMPLETABLE)
    .filter((s) => stepState(s, d.data) !== 'complete')
    .map((s) => ({ stepId: s.id, title: s.title }))
  const activity: DashboardData['activity'] = []
  if (d.updatedAt) activity.push({ id: 'a1', text: 'Draft saved', at: d.updatedAt })
  if (d.status === 'submitted') activity.push({ id: 'a2', text: 'Appraisal submitted', at: d.updatedAt! })
  db.documents.filter((x) => x.year === year).slice(-3).forEach((x) =>
    activity.push({ id: 'doc' + x.id, text: `Uploaded ${x.name}`, at: x.uploadedAt }))
  activity.sort((a, b) => +new Date(b.at) - +new Date(a.at))
  return {
    year, status: d.status, completion: completionPercent(STEPS, d.data), scores: d.scores,
    pendingSections: d.status === 'not_started' || d.status === 'draft' ? pending : [],
    documentCount: db.documents.filter((x) => x.year === year).length,
    activity,
  }
}

function route(config: InternalAxiosRequestConfig): unknown {
  const method = (config.method ?? 'get').toLowerCase()
  const url = (config.url ?? '').split('?')[0]
  const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : config.data
  const db = load()
  let m: RegExpMatchArray | null

  if (method === 'get' && url === '/profile') return profile
  if (method === 'get' && url === '/dashboard') return dashboard(db, config.params?.year ?? CURRENT_YEAR)
  if (method === 'get' && url === '/appraisals') {
    const years = Array.from(new Set([CURRENT_YEAR, ...Object.keys(db.drafts)]))
    return years.sort().reverse().map((y) => summary(draftFor(db, y)))
  }
  if ((m = url.match(/^\/appraisals\/([^/]+)$/)) && method === 'get') return draftFor(db, m[1])
  if ((m = url.match(/^\/appraisals\/([^/]+)\/draft$/)) && method === 'put') {
    const d = draftFor(db, m[1])
    if (d.status === 'submitted') throw { status: 409, message: 'This appraisal has already been submitted.' }
    d.data = body.data
    d.status = 'draft'
    d.updatedAt = new Date().toISOString()
    save(db)
    return d
  }
  if ((m = url.match(/^\/appraisals\/([^/]+)\/submit$/)) && method === 'post') {
    const d = draftFor(db, m[1])
    d.status = 'submitted'
    d.updatedAt = new Date().toISOString()
    save(db)
    return d
  }
  if (method === 'get' && url === '/documents') return db.documents
  if (method === 'post' && url === '/documents') {
    const item: DocumentItem = { id: crypto.randomUUID(), uploadedAt: new Date().toISOString(), ...body }
    db.documents.push(item)
    save(db)
    return item
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
  throw { status: 404, message: `No mock route for ${method.toUpperCase()} ${url}` }
}

export const mockAdapter: AxiosAdapter = (config) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = route(config)
        resolve({ data, status: 200, statusText: 'OK', headers: {}, config })
      } catch (e) {
        const err = e as { status?: number; message?: string }
        const status = err.status ?? 500
        reject(new AxiosError(err.message ?? 'Mock error', String(status), config, null, {
          data: { message: err.message }, status, statusText: '', headers: {}, config,
        }))
      }
    }, 350)
  })
