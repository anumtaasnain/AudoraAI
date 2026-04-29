import { api } from './api';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data: Record<string, string>) =>
    api.post<any>('/auth/register', data),
  login: (email: string, password: string) =>
    api.post<any>('/auth/login', { email, password }),
  logout: (refreshToken: string) =>
    api.post<any>('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) =>
    api.post<any>('/auth/refresh', { refreshToken }),
  getMe: () => api.get<any>('/auth/me'),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardService = {
  getSummary: () => api.get<any>('/dashboard/summary'),
  getActivity: () => api.get<any>('/dashboard/activity'),
  getEngagementTrend: () => api.get<any>('/dashboard/engagement-trend'),
};

// ─── Attendees ────────────────────────────────────────────────────────────────
export const attendeeService = {
  getAttendees: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<any>(`/attendees${query ? `?${query}` : ''}`);
  },
  getAttendee: (id: string) => api.get<any>(`/attendees/${id}`),
  getScore: (id: string) => api.get<any>(`/attendees/${id}/score`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsService = {
  getOverview: () => api.get<any>('/analytics/overview'),
  getEngagementByIndustry: () => api.get<any>('/analytics/engagement-by-industry'),
  getSegmentation: () => api.get<any>('/analytics/segmentation'),
  getRoiTrend: () => api.get<any>('/analytics/roi-trend'),
  getFunnel: () => api.get<any>('/analytics/funnel'),
  getEngagementTrend: () => api.get<any>('/analytics/engagement-trend'),
};

// ─── Sponsors ─────────────────────────────────────────────────────────────────
export const sponsorService = {
  getLeads: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<any>(`/sponsors/leads${query ? `?${query}` : ''}`);
  },
  getLead: (id: string) => api.get<any>(`/sponsors/leads/${id}`),
  updateLeadStatus: (id: string, status: string) =>
    api.patch<any>(`/sponsors/leads/${id}/status`, { status }),
  getMetrics: () => api.get<any>('/sponsors/metrics'),
  getConversionTrend: () => api.get<any>('/sponsors/conversion-trend'),
  getLeadQuality: () => api.get<any>('/sponsors/lead-quality'),
  generateLeads: () => api.post<any>('/sponsors/generate-leads'),
};

// ─── Events ───────────────────────────────────────────────────────────────────
export const eventService = {
  getEvents: () => api.get<any>('/events'),
  getEvent: (id: string) => api.get<any>(`/events/${id}`),
  createEvent: (data: Record<string, unknown>) => api.post<any>('/events', data),
  updateEvent: (id: string, data: Record<string, unknown>) => api.patch<any>(`/events/${id}`, data),
  deleteEvent: (id: string) => api.delete<any>(`/events/${id}`),
  updateEventStatus: (id: string, status: string) => api.patch<any>(`/events/${id}/status`, { status }),
  registerForEvent: (id: string) => api.post<any>(`/events/${id}/register`),
  getRegistrations: () => api.get<any>('/events/registrations'),
  updateRegistrationStatus: (id: string, status: string) => api.patch<any>(`/events/registrations/${id}/status`, { status }),
};
