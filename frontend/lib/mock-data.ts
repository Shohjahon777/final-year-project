// Mock data for UI development before backend integration

// Type definitions
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
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
  adminNotes?: string
}

export const mockDashboardData = {
  scores: {
    research: 26.43,
    teaching: 18.5,
    admin: 12.0,
    outreach: 5.0,
    totalPenalties: -4.0,
    finalScore: 57.93,
    outcome: 'satisfactory' as const,
  },
  pendingSubmissions: 3,
  approvedSubmissions: 12,
  rejectedSubmissions: 1,
  recentPenalties: [
    {
      _id: '1',
      type: 'meeting',
      description: 'Missed 3 department meetings',
      points: -2,
      appliedAt: '2025-01-15T10:00:00Z',
    },
    {
      _id: '2',
      type: 'deadline',
      description: 'Late submission by 48 hours',
      points: -2,
      appliedAt: '2025-01-10T14:30:00Z',
    },
  ],
}

export const mockSubmissions = [
  {
    _id: '1',
    userId: 'user1',
    category: 'research' as const,
    subcategory: 'journal',
    title: 'Machine Learning Applications in Education',
    description: 'Published in Q2 journal as first author',
    evidence: {
      type: 'link' as const,
      value: 'https://doi.org/10.1234/example',
    },
    metadata: {
      journalTier: 'Q2',
      authorPosition: '1st',
      isCorresponding: true,
      hasStudentCoAuthor: true,
    },
    calculatedPoints: 13.55,
    status: 'approved' as const,
    submittedAt: '2025-01-20T10:00:00Z',
    reviewedAt: '2025-01-22T15:00:00Z',
  },
  {
    _id: '2',
    userId: 'user1',
    category: 'research' as const,
    subcategory: 'conference',
    title: 'AI in Computer Science Education',
    description: 'Presented at international conference',
    evidence: {
      type: 'link' as const,
      value: 'https://conference.example.com/paper123',
    },
    metadata: {
      conferenceType: 'international',
      authorPosition: '2nd',
    },
    calculatedPoints: 5.0,
    status: 'pending' as const,
    submittedAt: '2025-01-25T09:00:00Z',
  },
  {
    _id: '3',
    userId: 'user1',
    category: 'teaching' as const,
    subcategory: 'feedback',
    title: 'CS101 Student Feedback',
    description: 'Average rating: 4.5/5.0',
    evidence: {
      type: 'file' as const,
      value: 'feedback-report-2025.pdf',
    },
    metadata: {
      averageRating: 4.5,
      totalResponses: 45,
      semester: 'Fall 2024',
    },
    calculatedPoints: 8.5,
    status: 'approved' as const,
    submittedAt: '2025-01-15T11:00:00Z',
    reviewedAt: '2025-01-16T10:00:00Z',
  },
  {
    _id: '4',
    userId: 'user1',
    category: 'admin' as const,
    subcategory: 'major',
    title: 'Accreditation Committee Member',
    description: 'Served on ABET accreditation committee',
    evidence: {
      type: 'text' as const,
      value: 'Committee meeting minutes and reports',
    },
    metadata: {
      taskType: 'major',
      duration: '6 months',
    },
    calculatedPoints: 6.0,
    status: 'approved' as const,
    submittedAt: '2025-01-10T08:00:00Z',
    reviewedAt: '2025-01-12T14:00:00Z',
  },
  {
    _id: '5',
    userId: 'user1',
    category: 'outreach' as const,
    subcategory: 'event',
    title: 'Tech Conference Speaker',
    description: 'Presented at regional tech conference representing CAU',
    evidence: {
      type: 'link' as const,
      value: 'https://techconf.example.com/speakers',
    },
    metadata: {
      eventType: 'conference',
      audienceSize: 200,
    },
    calculatedPoints: 3.0,
    status: 'pending' as const,
    submittedAt: '2025-01-28T16:00:00Z',
  },
  {
    _id: '6',
    userId: 'user1',
    category: 'research' as const,
    subcategory: 'journal',
    title: 'Data Structures Optimization',
    description: 'Q3 journal publication',
    evidence: {
      type: 'link' as const,
      value: 'https://doi.org/10.5678/example',
    },
    metadata: {
      journalTier: 'Q3',
      authorPosition: '3rd',
    },
    calculatedPoints: 4.0,
    status: 'rejected' as const,
    adminNotes: 'Insufficient evidence provided',
    submittedAt: '2025-01-05T10:00:00Z',
    reviewedAt: '2025-01-08T12:00:00Z',
  },
]

export const mockScores = [
  {
    _id: '1',
    userId: 'user1',
    academicYear: '2024-2025',
    research: 26.43,
    teaching: 18.5,
    admin: 12.0,
    outreach: 5.0,
    totalPenalties: -4.0,
    finalScore: 57.93,
    outcome: 'satisfactory' as const,
    calculatedAt: '2025-01-20T10:00:00Z',
  },
  {
    _id: '2',
    userId: 'user1',
    academicYear: '2023-2024',
    research: 32.0,
    teaching: 22.0,
    admin: 15.0,
    outreach: 8.0,
    totalPenalties: -2.0,
    finalScore: 75.0,
    outcome: 'outstanding' as const,
    calculatedAt: '2024-08-30T10:00:00Z',
  },
]

export const mockPenalties = [
  {
    _id: '1',
    userId: 'user1',
    type: 'meeting' as const,
    description: 'Missed 3 department meetings',
    points: -2,
    appliedBy: 'admin1',
    appliedAt: '2025-01-15T10:00:00Z',
    academicYear: '2024-2025',
  },
  {
    _id: '2',
    userId: 'user1',
    type: 'deadline' as const,
    description: 'Late submission by 48 hours',
    points: -2,
    appliedBy: 'admin1',
    appliedAt: '2025-01-10T14:30:00Z',
    academicYear: '2024-2025',
  },
]

// Helper functions to filter mock data
export const getMockSubmissions = (filters?: {
  status?: string
  category?: string
  page?: number
  limit?: number
}) => {
  let filtered = [...mockSubmissions]

  if (filters?.status) {
    filtered = filtered.filter((s) => s.status === filters.status)
  }

  if (filters?.category) {
    filtered = filtered.filter((s) => s.category === filters.category)
  }

  const page = filters?.page || 1
  const limit = filters?.limit || 10
  const skip = (page - 1) * limit

  const submissions = filtered.slice(skip, skip + limit)
  const total = filtered.length

  return {
    submissions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}
