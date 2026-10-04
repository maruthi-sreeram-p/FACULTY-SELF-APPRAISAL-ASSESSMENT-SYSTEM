import axios from 'axios'
import { STEPS } from '../data/appraisalSchema'
import { fromContent } from '../contract/mapper'
import type {
  AcademicYearDto, ActivityDto, AppraisalContentDto, AppraisalDto, AppraisalSummaryDto, DocumentDto, FacultyProfileDto,
  NotificationDto, ProblemDto, ReportDto, SupportingDocumentType,
} from '../contract/dto'
import type { DashboardData } from '../types'
import { COMPLETABLE, stepState } from './completion'
import { mockAdapter } from './mockAdapter'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  timeout: 15000,
})

if (import.meta.env.VITE_USE_MOCK !== 'false') {
  api.defaults.adapter = mockAdapter
}

export const errorMessage = (e: unknown) => {
  if (axios.isAxiosError(e)) {
    const p = e.response?.data as Partial<ProblemDto> | undefined
    return p?.detail ?? p?.title ?? e.message
  }
  return e instanceof Error ? e.message : 'Something went wrong'
}

/** Statuses after which the faculty can no longer edit (SUBMITTED is certain; the rest are PROVISIONAL). */
export const LOCKED_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']

const get = <T>(url: string, params?: Record<string, unknown>) => api.get<T>(url, { params }).then((r) => r.data)

/** in-flight ensureAppraisal calls by academic year */
const ensuring = new Map<string, Promise<AppraisalDto>>()

/**
 * Every call below is a PROPOSED endpoint, REQUIRES BACKEND IMPLEMENTATION.
 * See docs/backend/api-contract.md. Base path: /api/v1.
 */
export const services = {
  profile: () => get<FacultyProfileDto>('/faculty/me'),
  academicYears: () => get<AcademicYearDto[]>('/academic-years'),

  appraisals: () => get<AppraisalSummaryDto[]>('/appraisals'),
  /** The faculty member's appraisal for a year, or null when none exists yet (status NOT_STARTED). */
  findAppraisal: async (academicYear: string): Promise<AppraisalDto | null> => {
    const list = await get<AppraisalSummaryDto[]>('/appraisals', { academicYear })
    return list[0] ? get<AppraisalDto>(`/appraisals/${list[0].id}`) : null
  },
  createAppraisal: (academicYear: string) => api.post<AppraisalDto>('/appraisals', { academicYear }).then((r) => r.data),
  /**
   * Opening the workflow for a year creates the DRAFT appraisal if it does not exist yet.
   * Idempotent: concurrent calls share one request, and a 409 from POST (it already exists, e.g. created
   * from another tab a moment earlier) is recovered by fetching the existing appraisal.
   */
  ensureAppraisal: (academicYear: string): Promise<AppraisalDto> => {
    const pending = ensuring.get(academicYear)
    if (pending) return pending
    const p = (async () => {
      const found = await services.findAppraisal(academicYear)
      if (found) return found
      try {
        return await services.createAppraisal(academicYear)
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 409) {
          const again = await services.findAppraisal(academicYear)
          if (again) return again
        }
        throw e
      }
    })().finally(() => ensuring.delete(academicYear))
    ensuring.set(academicYear, p)
    return p
  },
  /** Autosave: send only the changed sections. `version` is sent as If-Match. */
  patchAppraisal: (id: string, version: number, sections: Partial<AppraisalContentDto>) =>
    api.patch<AppraisalDto>(`/appraisals/${id}`, sections, { headers: { 'If-Match': String(version) } }).then((r) => r.data),
  submit: (id: string) => api.post<AppraisalDto>(`/appraisals/${id}/submit`).then((r) => r.data),
  activity: (id: string) => get<ActivityDto[]>(`/appraisals/${id}/activity`),

  documents: () => get<DocumentDto[]>('/documents'),
  /** Mock mode sends metadata only. The real endpoint is multipart (file + appraisalId + documentType). */
  addDocument: async (d: { fileName: string; contentType: string | null; sizeBytes: number; academicYear: string; documentType: SupportingDocumentType }) => {
    const appraisal = await services.ensureAppraisal(d.academicYear)
    return api.post<DocumentDto>('/documents', {
      appraisalId: appraisal.id, documentType: d.documentType, fileName: d.fileName, contentType: d.contentType, sizeBytes: d.sizeBytes,
    }).then((r) => r.data)
  },
  deleteDocument: (id: string) => api.delete(`/documents/${id}`).then((r) => r.data),

  notifications: () => get<NotificationDto[]>('/notifications'),
  markAllRead: () => api.post('/notifications/read-all').then((r) => r.data),
  reports: () => get<ReportDto[]>('/reports'),

  /** UI view model composed from the contract endpoints above (there is no dashboard endpoint). */
  dashboard: async (academicYear: string): Promise<DashboardData> => {
    const completable = STEPS.filter(COMPLETABLE)
    const a = await services.findAppraisal(academicYear)
    if (!a) {
      return {
        year: academicYear, status: 'NOT_STARTED', completion: 0, scoreSheet: null, documentCount: 0, activity: [],
        pendingSections: completable.map((s) => ({ stepId: s.id, title: s.title })),
      }
    }
    const [docs, activity] = await Promise.all([services.documents(), services.activity(a.id)])
    const data = fromContent(a)
    const pending = completable.filter((s) => stepState(s, data) !== 'complete')
    return {
      year: academicYear,
      status: a.status,
      completion: Math.round(((completable.length - pending.length) / completable.length) * 100),
      scoreSheet: a.scoreSheet,
      pendingSections: LOCKED_STATUSES.includes(a.status) ? [] : pending.map((s) => ({ stepId: s.id, title: s.title })),
      documentCount: docs.filter((d) => d.appraisalId === a.id).length,
      activity: activity.map((x) => ({ id: x.id, text: x.message, at: x.at })),
    }
  },
}
