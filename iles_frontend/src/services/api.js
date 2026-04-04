import axios from 'axios';
import { notifyError } from '../components/Common/AppToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Axios instance configured for our API
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // Make sure we have a refresh token before trying to refresh
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        notifyError('Session expired. Please login again.', { title: 'Session Expired' });
        return Promise.reject(refreshError);
      }
    }

    // Show error toast for user-friendly messages
    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'An error occurred';
    
    // Don't show toast for 401 errors (handled above)
    if (error.response?.status !== 401) {
      notifyError(errorMessage, { title: 'Request Failed' });
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      // If no refresh token, just clear local storage
      return Promise.resolve();
    }
    return api.post('/auth/logout/', { refresh: refreshToken });
  },
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  forgotPasswordRequest: (email) => api.post('/auth/forgot-password/request/', { email }),
  forgotPasswordConfirm: (payload) => api.post('/auth/forgot-password/confirm/', payload),
};


// Profile API endpoints
export const profileAPI = {
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return api.put('/auth/profile/', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  },
  getCompletion: () => api.get('/auth/profile/completion/'),
};

export const adminAPI = {
  getSupervisorApprovals: () => api.get('/auth/admin/approvals/'),
  updateSupervisorApproval: (userId, approved) =>
    api.patch(`/auth/admin/approvals/${userId}/`, { approved }),
};

export const supervisorAPI = {
  getSupervisors: (params = {}) => api.get('/auth/supervisors/', { params }),
  getWorkplaceSupervisors: () => api.get('/auth/supervisors/workplace/'),
  getAcademicSupervisors: () => api.get('/auth/supervisors/academic/'),
};

export const adminUsersAPI = {
  getUsers: (params = {}) => api.get('/auth/admin/profiles/', { params }),
  updateUser: (userId, payload) => api.patch(`/auth/admin/users/${userId}/`, payload),
};

export const placementsAPI = {
  getOrganizations: (params = {}) => api.get('/placements/organizations/', { params }),
  createOrganization: (payload) => api.post('/placements/organizations/', payload),
  getMyPlacements: () => api.get('/placements/student/'),
  getMyPlacement: (placementId) => api.get(`/placements/student/${placementId}/`),
  createDraftPlacement: (formData) =>
    api.post('/placements/student/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateDraftPlacement: (placementId, formData) =>
    api.patch(`/placements/student/${placementId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDraftPlacement: (placementId) => api.delete(`/placements/student/${placementId}/`),
  submitPlacement: (placementId) => api.post(`/placements/student/${placementId}/submit/`, {}),
  getAssignedPlacements: () => api.get('/placements/supervisor/assigned/'),
  assignWorkplaceSupervisor: (placementId, payload) =>
    api.patch(`/placements/student/${placementId}/workplace-supervisor/`, payload),
  getAvailableWorkplaceSupervisors: () => api.get('/auth/supervisors/workplace/'),
};

export const adminPlacementsAPI = {
  getPlacements: (params = {}) => api.get('/placements/admin/', { params }),
  decidePlacement: (placementId, payload) =>
    api.post(`/placements/admin/${placementId}/decision/`, payload),
  assignSupervisors: (placementId, payload) =>
    api.patch(`/placements/admin/${placementId}/supervisors/`, payload),
  refreshLifecycle: () => api.post('/placements/admin/lifecycle/refresh/', {}),
};

export const logbookAPI = {
  getStudentLogs: () => api.get('/logbook/student/'),
  createStudentLogDraft: (formData) =>
    api.post('/logbook/student/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStudentLogDraft: (logId, formData) =>
    api.patch(`/logbook/student/${logId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  submitStudentLog: (logId) => api.post(`/logbook/student/${logId}/submit/`, {}),
  resubmitStudentLog: (logId) => api.post(`/logbook/student/${logId}/resubmit/`, {}),
  getStudentProgress: () => api.get('/logbook/student/progress/'),

  getSupervisorLogs: (params = {}) => api.get('/logbook/supervisor/', { params }),
  startSupervisorLogReview: (logId) => api.post(`/logbook/supervisor/${logId}/start-review/`, {}),
  reviewSupervisorLog: (logId, payload) => api.post(`/logbook/supervisor/${logId}/review/`, payload),
  getLogAuditTrail: (logId) => api.get(`/logbook/audit/${logId}/`),

  getAdminOverview: () => api.get('/logbook/admin/overview/'),
};

export const evaluationsAPI = {
  getCriteria: () => api.get('/evaluations/criteria/'),
  createCriterion: (payload) => api.post('/evaluations/criteria/', payload),
  updateCriterion: (criterionId, payload) => api.patch(`/evaluations/criteria/${criterionId}/`, payload),

  getSupervisorEvaluations: () => api.get('/evaluations/supervisor/'),
  getSupervisorEvaluation: (evaluationId) => api.get(`/evaluations/supervisor/${evaluationId}/`),
  createSupervisorEvaluation: (payload) => api.post('/evaluations/supervisor/', payload),
  updateSupervisorEvaluation: (evaluationId, payload) =>
    api.patch(`/evaluations/supervisor/${evaluationId}/`, payload),
  submitSupervisorEvaluation: (evaluationId) =>
    api.post(`/evaluations/supervisor/${evaluationId}/submit/`, {}),
  finalizeSupervisorEvaluation: (evaluationId) =>
    api.post(`/evaluations/supervisor/${evaluationId}/finalize/`, {}),

  getStudentEvaluations: () => api.get('/evaluations/student/'),
  getStudentEvaluation: (evaluationId) => api.get(`/evaluations/student/${evaluationId}/`),

  computeAdminFinalScore: (payload) => api.post('/evaluations/final-scores/admin/compute/', payload),
  getAdminFinalScores: (params = {}) => api.get('/evaluations/final-scores/admin/', { params }),
  getStudentFinalScores: () => api.get('/evaluations/final-scores/student/'),
};

export const auditingAPI = {
  getAdminAuditLogs: (params = {}) => api.get('/auditing/admin/logs/', { params }),
  
  getNotifications: (params = {}) => api.get('/auditing/notifications/', { params }),
  getNotificationStats: () => api.get('/auditing/notifications/stats/'),
  markNotificationAsRead: (notificationId) => api.patch(`/auditing/notifications/${notificationId}/`, { is_read: true }),
  markAllNotificationsAsRead: () => api.post('/auditing/notifications/bulk-mark-read/', {}),
};

export default api;