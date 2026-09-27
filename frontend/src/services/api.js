import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const AI_BASE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:5001'

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role })
}

// Exam
export const examAPI = {
  startExam: (examName) => api.post('/exam/start', { examName }),
  endExam: (sessionId) => api.post(`/exam/end/${sessionId}`),
  logEvent: (sessionId, eventType, description, confidence) =>
    api.post('/exam/event', { sessionId, eventType, description, confidence }),
  getEvents: (sessionId) => api.get('/exam/events', { params: sessionId ? { sessionId } : {} }),
  getReports: () => api.get('/exam/reports')
}

// Admin
export const adminAPI = {
  getStudents: () => api.get('/admin/students'),
  getSessions: () => api.get('/admin/sessions'),
  getSessionDetails: (sessionId) => api.get(`/admin/sessions/${sessionId}`),
  getStats: () => api.get('/admin/stats')
}

// AI Detection
export const aiAPI = {
  detectAdvanced: async (imageBlob) => {
    const formData = new FormData()
    formData.append('image', imageBlob, 'frame.jpg')
    const res = await axios.post(`${AI_BASE_URL}/detect-advanced`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  detectAndReport: async (imageBlob, sessionId, authToken) => {
    const formData = new FormData()
    formData.append('image', imageBlob, 'frame.jpg')
    formData.append('session_id', sessionId)
    formData.append('auth_token', authToken)
    const res = await axios.post(`${AI_BASE_URL}/detect-and-report`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  }
}

export default api
