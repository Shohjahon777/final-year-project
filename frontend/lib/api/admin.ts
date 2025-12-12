import apiClient from './client'

// Types
export interface AdminDashboardData {
  stats: {
    totalFaculty: number
    pendingSubmissions: number
    averageScore: number
    atRiskCount: number
  }
  outcomeDistribution: Record<string, number>
  recentSubmissions: Array<{
    _id: string
    title: string
    category: string
    status: string
    submittedAt: string
    calculatedPoints: number
    userId: {
      _id: string
      firstName: string
      lastName: string
      email: string
    }
  }>
  recentPenalties: Array<{
    _id: string
    type: string
    description: string
    points: number
    appliedAt: string
    userId: {
      _id: string
      firstName: string
      lastName: string
    }
    appliedBy: {
      _id: string
      firstName: string
      lastName: string
    }
  }>
  academicYear: string
}

export interface Faculty {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'faculty'
  facultyRank?: string
  department?: string
  isActive: boolean
  currentScore?: {
    finalScore: number
    outcome: string
    research: number
    teaching: number
    admin: number
    outreach: number
    totalPenalties: number
  }
}

export interface FacultyFilters {
  search?: string
  department?: string
  rank?: string
  page?: number
  limit?: number
}

export interface FacultyDetail {
  user: Faculty
  scores: Array<{
    academicYear: string
    finalScore: number
    outcome: string
    research: number
    teaching: number
    admin: number
    outreach: number
    totalPenalties: number
  }>
  submissionCounts: Record<string, number>
  penalties: Array<{
    _id: string
    type: string
    description: string
    points: number
    appliedAt: string
    appliedBy: {
      firstName: string
      lastName: string
    }
  }>
}

export interface AdminSubmission {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    facultyRank?: string
    department?: string
  }
  category: 'research' | 'teaching' | 'admin' | 'outreach'
  subcategory: string
  title: string
  description?: string
  evidence: {
    type: 'link' | 'file' | 'text'
    value: string
  }
  metadata: Record<string, any>
  calculatedPoints: number
  adjustedPoints?: number
  status: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: {
    _id: string
    firstName: string
    lastName: string
  }
}

export interface SubmissionFilters {
  status?: string
  category?: string
  userId?: string
  page?: number
  limit?: number
}

export interface Penalty {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  type: 'meeting' | 'deadline' | 'academic_dishonesty'
  description: string
  points: number
  appliedAt: string
  evidence?: string
  academicYear: string
  appliedBy: {
    _id: string
    firstName: string
    lastName: string
  }
}

export interface PenaltyFilters {
  userId?: string
  type?: string
  academicYear?: string
  page?: number
  limit?: number
}

export interface CreatePenaltyData {
  userId: string
  type: 'meeting' | 'deadline' | 'academic_dishonesty'
  description: string
  points: number
  evidence?: string
}

export interface Score {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    facultyRank?: string
    department?: string
  }
  academicYear: string
  research: number
  teaching: number
  admin: number
  outreach: number
  totalPenalties: number
  finalScore: number
  outcome: 'outstanding' | 'satisfactory' | 'improvement_plan' | 'contract_risk'
}

export interface ScoreFilters {
  academicYear?: string
  outcome?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Admin API functions
export const adminApi = {
  // Dashboard
  getDashboard: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get('/admin/dashboard')
    return response.data.data
  },

  // Faculty Management
  getFaculty: async (filters?: FacultyFilters): Promise<{ faculty: Faculty[]; pagination: any }> => {
    const response = await apiClient.get('/admin/faculty', { params: filters })
    return response.data.data
  },

  getFacultyById: async (id: string): Promise<FacultyDetail> => {
    const response = await apiClient.get(`/admin/faculty/${id}`)
    return response.data.data
  },

  // Submission Management
  getSubmissions: async (
    filters?: SubmissionFilters
  ): Promise<{ submissions: AdminSubmission[]; pagination: any }> => {
    const response = await apiClient.get('/admin/submissions', { params: filters })
    return response.data.data
  },

  getSubmissionById: async (id: string): Promise<AdminSubmission> => {
    const response = await apiClient.get(`/admin/submissions/${id}`)
    return response.data.data.submission
  },

  approveSubmission: async (
    id: string,
    data: { notes?: string; adjustedPoints?: number }
  ): Promise<AdminSubmission> => {
    const response = await apiClient.put(`/admin/submissions/${id}/approve`, data)
    return response.data.data.submission
  },

  rejectSubmission: async (id: string, notes: string): Promise<AdminSubmission> => {
    const response = await apiClient.put(`/admin/submissions/${id}/reject`, { notes })
    return response.data.data.submission
  },

  adjustPoints: async (id: string, adjustedPoints: number): Promise<AdminSubmission> => {
    const response = await apiClient.put(`/admin/submissions/${id}/points`, { adjustedPoints })
    return response.data.data.submission
  },

  // Penalty Management
  getPenalties: async (
    filters?: PenaltyFilters
  ): Promise<{ penalties: Penalty[]; pagination: any }> => {
    const response = await apiClient.get('/admin/penalties', { params: filters })
    return response.data.data
  },

  createPenalty: async (data: CreatePenaltyData): Promise<Penalty> => {
    const response = await apiClient.post('/admin/penalties', data)
    return response.data.data.penalty
  },

  updatePenalty: async (
    id: string,
    data: Partial<CreatePenaltyData>
  ): Promise<Penalty> => {
    const response = await apiClient.put(`/admin/penalties/${id}`, data)
    return response.data.data.penalty
  },

  deletePenalty: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/penalties/${id}`)
  },

  // Scores
  getScores: async (filters?: ScoreFilters): Promise<{ scores: Score[]; pagination: any }> => {
    const response = await apiClient.get('/admin/scores', { params: filters })
    return response.data.data
  },

  recalculateScore: async (userId: string): Promise<any> => {
    const response = await apiClient.post(`/admin/scores/recalculate/${userId}`)
    return response.data.data.score
  },
}

// Config API functions
export interface ConfigValue {
  value: number | string | boolean
  description?: string
  updatedAt?: string
}

export interface ConfigData {
  [category: string]: {
    [key: string]: ConfigValue
  }
}

export const configApi = {
  getAll: async (): Promise<ConfigData> => {
    const response = await apiClient.get('/config')
    return response.data.data
  },

  getByCategory: async (category: string): Promise<Record<string, ConfigValue>> => {
    const response = await apiClient.get(`/config/category/${category}`)
    return response.data.data
  },

  getByKey: async (key: string): Promise<ConfigValue> => {
    const response = await apiClient.get(`/config/key/${key}`)
    return response.data.data
  },

  update: async (key: string, value: number | string | boolean): Promise<any> => {
    const response = await apiClient.put(`/config/${key}`, { value })
    return response.data.data
  },

  getMultipliers: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get('/config/multipliers')
    return response.data.data
  },

  getCeilings: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get('/config/ceilings')
    return response.data.data
  },

  seedDefaults: async (): Promise<void> => {
    await apiClient.post('/config/seed')
  },
}
