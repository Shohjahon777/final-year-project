import axios from 'axios'

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (url) return url
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.warn('NEXT_PUBLIC_API_URL is not set. API requests may fail. Set it at build time.')
  }
  return 'http://localhost:5000/api'
}

const API_URL = getApiUrl()

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor: add auth token; for FormData, omit Content-Type so browser sets multipart boundary
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth: forgot / reset password (public)
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email })
  return data
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword })
  return data
}

export default apiClient
