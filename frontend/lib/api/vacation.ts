import { apiClient } from './client'

export interface VacationUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  department?: string
  facultyRank?: string
}

export interface Vacation {
  _id: string
  userId: VacationUser
  startDate: string
  endDate: string
  reason: string
  type: 'annual' | 'sick' | 'unpaid' | 'other'
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  adminComment?: string
  reviewedBy?: VacationUser
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface VacationListResponse {
  vacations: Vacation[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export const vacationApi = {
  // Faculty: submit request
  async createRequest(data: {
    startDate: string
    endDate: string
    reason: string
    type: 'annual' | 'sick' | 'unpaid' | 'other'
  }): Promise<Vacation> {
    const res = await apiClient.post('/vacations', data)
    return res.data.data
  },

  // Faculty: get own requests
  async getMyRequests(): Promise<Vacation[]> {
    const res = await apiClient.get('/vacations/my')
    return res.data.data
  },

  // Admin: get all requests
  async getAllRequests(params?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<VacationListResponse> {
    const res = await apiClient.get('/vacations', { params })
    return res.data.data
  },

  // Faculty: cancel own pending request
  async cancelRequest(id: string): Promise<Vacation> {
    const res = await apiClient.delete(`/vacations/${id}`)
    return res.data.data
  },

  // Admin: approve or reject
  async reviewRequest(
    id: string,
    action: 'approved' | 'rejected',
    comment?: string
  ): Promise<Vacation> {
    const res = await apiClient.patch(`/vacations/${id}/review`, { action, comment })
    return res.data.data
  },
}
