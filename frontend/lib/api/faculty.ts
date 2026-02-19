import apiClient from './client'

export interface DashboardData {
  scores: {
    research: number
    teaching: number
    admin: number
    outreach: number
    totalPenalties: number
    finalScore: number
    outcome: 'outstanding' | 'satisfactory' | 'improvement_plan' | 'contract_risk'
  }
  pendingSubmissions: number
  approvedSubmissions: number
  rejectedSubmissions: number
  recentPenalties: Array<{
    _id: string
    type: string
    description: string
    points: number
    appliedAt: string
  }>
}

export interface Submission {
  _id: string
  userId: string
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
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  adminNotes?: string
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface SubmissionFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  category?: 'research' | 'teaching' | 'admin' | 'outreach'
  page?: number
  limit?: number
}

export interface CreateSubmissionData {
  category: 'research' | 'teaching' | 'admin' | 'outreach'
  subcategory: string
  title: string
  description?: string
  evidence: {
    type: 'link' | 'file' | 'text'
    value: string
  }
  metadata?: Record<string, any>
}

// Faculty API functions
export const facultyApi = {
  // Get dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get('/faculty/dashboard')
    return response.data.data
  },

  // Get submissions
  getSubmissions: async (filters?: SubmissionFilters) => {
    const response = await apiClient.get('/faculty/submissions', {
      params: filters,
    })
    return response.data.data
  },

  // Get single submission
  getSubmission: async (id: string): Promise<Submission> => {
    const response = await apiClient.get(`/faculty/submissions/${id}`)
    return response.data.data.submission
  },

  // Create submission
  createSubmission: async (data: CreateSubmissionData): Promise<Submission> => {
    const response = await apiClient.post('/faculty/submissions', data)
    return response.data.data.submission
  },

  // Update submission
  updateSubmission: async (
    id: string,
    data: Partial<CreateSubmissionData>
  ): Promise<Submission> => {
    const response = await apiClient.put(`/faculty/submissions/${id}`, data)
    return response.data.data.submission
  },

  // Delete submission
  deleteSubmission: async (id: string): Promise<void> => {
    await apiClient.delete(`/faculty/submissions/${id}`)
  },

  // Get scores
  getScores: async () => {
    const response = await apiClient.get('/faculty/scores')
    return response.data.data.scores
  },

  // Get penalties
  getPenalties: async () => {
    const response = await apiClient.get('/faculty/penalties')
    return response.data.data.penalties
  },
}
