import axios from 'axios'
import { mockAdapter } from './mockAdapter'
import type {
  AppraisalDraft, AppraisalSummary, DashboardData, DocumentItem, NotificationItem, Profile, ReportItem, AppraisalData,
} from '../types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
})

if (import.meta.env.VITE_USE_MOCK !== 'false') {
  api.defaults.adapter = mockAdapter
}

export const errorMessage = (e: unknown) => {
  if (axios.isAxiosError(e)) return (e.response?.data as { message?: string } | undefined)?.message ?? e.message
  return e instanceof Error ? e.message : 'Something went wrong'
}

export const services = {
  profile: () => api.get<Profile>('/profile').then((r) => r.data),
  dashboard: (year: string) => api.get<DashboardData>('/dashboard', { params: { year } }).then((r) => r.data),
  appraisals: () => api.get<AppraisalSummary[]>('/appraisals').then((r) => r.data),
  appraisal: (year: string) => api.get<AppraisalDraft>(`/appraisals/${year}`).then((r) => r.data),
  saveDraft: (year: string, data: AppraisalData) =>
    api.put<AppraisalDraft>(`/appraisals/${year}/draft`, { data }).then((r) => r.data),
  submit: (year: string) => api.post<AppraisalDraft>(`/appraisals/${year}/submit`).then((r) => r.data),
  documents: () => api.get<DocumentItem[]>('/documents').then((r) => r.data),
  addDocument: (d: { name: string; size: number; year: string; category?: string }) =>
    api.post<DocumentItem>('/documents', d).then((r) => r.data),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`).then((r) => r.data),
  notifications: () => api.get<NotificationItem[]>('/notifications').then((r) => r.data),
  markAllRead: () => api.post('/notifications/read-all').then((r) => r.data),
  reports: () => api.get<ReportItem[]>('/reports').then((r) => r.data),
}
