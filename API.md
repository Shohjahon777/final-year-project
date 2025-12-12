# API Documentation

**Faculty Evaluation System - RESTful API Reference**

This document provides comprehensive API endpoint documentation, including request/response formats, authentication, and error handling.

---

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Faculty](#faculty-endpoints)
  - [Admin](#admin-endpoints)
  - [Configuration](#configuration-endpoints)

---

## Base URL

The backend API runs on a separate server from the frontend.

```
Development: http://localhost:5000/api
Production: https://api.example.com/api
```

**Note**: The frontend (Next.js) runs on port 3000 and makes API calls to the backend (Express.js) on port 5000.

---

## Authentication

All protected endpoints require JWT authentication via Bearer token in the Authorization header.

```
Authorization: Bearer <token>
```

### Token Format

JWT tokens are issued upon successful login and expire after 7 days (configurable).

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Endpoints

### Authentication Endpoints

#### POST /api/auth/login

Login with email and password.

**Request Body**:
```json
{
  "email": "faculty@cau.edu",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "faculty@cau.edu",
      "role": "faculty",
      "firstName": "John",
      "lastName": "Doe",
      "facultyRank": "Assistant Professor"
    }
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}
```

---

#### POST /api/auth/register

Register new admin user (Admin only).

**Request Body**:
```json
{
  "email": "admin@cau.edu",
  "password": "securePassword123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "email": "admin@cau.edu",
      "role": "admin",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

---

#### GET /api/auth/me

Get current authenticated user.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "faculty@cau.edu",
      "role": "faculty",
      "firstName": "John",
      "lastName": "Doe",
      "facultyRank": "Assistant Professor",
      "department": "Computer Science"
    }
  }
}
```

---

### Faculty Endpoints

#### GET /api/faculty/dashboard

Get faculty dashboard data including current scores and summary.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "scores": {
      "research": 26.43,
      "teaching": 8.5,
      "admin": 9,
      "outreach": 3,
      "totalPenalties": -4,
      "finalScore": 42.93,
      "outcome": "contract_risk"
    },
    "pendingSubmissions": 3,
    "approvedSubmissions": 12,
    "rejectedSubmissions": 1,
    "recentPenalties": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "type": "meeting",
        "description": "Missed 3 meetings",
        "points": -2,
        "appliedAt": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

#### POST /api/faculty/submissions

Create new submission.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body** (Research Example):
```json
{
  "category": "research",
  "subcategory": "journal",
  "title": "Machine Learning in Education",
  "description": "Published in Q2 journal",
  "evidence": {
    "type": "link",
    "value": "https://doi.org/10.1234/example"
  },
  "metadata": {
    "journalTier": "Q2",
    "authorPosition": "1st",
    "isCorresponding": true,
    "hasStudentCoAuthor": true
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "submission": {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439011",
      "category": "research",
      "subcategory": "journal",
      "title": "Machine Learning in Education",
      "calculatedPoints": 13.55,
      "status": "pending",
      "submittedAt": "2025-01-20T10:00:00Z"
    }
  }
}
```

---

#### GET /api/faculty/submissions

Get all submissions for current faculty member.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `status` (optional): Filter by status (`pending`, `approved`, `rejected`)
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example**: `/api/faculty/submissions?status=pending&page=1&limit=10`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "category": "research",
        "subcategory": "journal",
        "title": "Machine Learning in Education",
        "calculatedPoints": 13.55,
        "status": "pending",
        "submittedAt": "2025-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 16,
      "pages": 2
    }
  }
}
```

---

#### GET /api/faculty/submissions/:id

Get submission details.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "submission": {
      "_id": "507f1f77bcf86cd799439014",
      "category": "research",
      "subcategory": "journal",
      "title": "Machine Learning in Education",
      "description": "Published in Q2 journal",
      "evidence": {
        "type": "link",
        "value": "https://doi.org/10.1234/example"
      },
      "metadata": {
        "journalTier": "Q2",
        "authorPosition": "1st",
        "isCorresponding": true,
        "hasStudentCoAuthor": true
      },
      "calculatedPoints": 13.55,
      "status": "pending",
      "submittedAt": "2025-01-20T10:00:00Z"
    }
  }
}
```

---

#### PUT /api/faculty/submissions/:id

Update submission (only if status is `pending`).

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "evidence": {
    "type": "link",
    "value": "https://new-link.com"
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "submission": {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Updated Title",
      "updatedAt": "2025-01-21T10:00:00Z"
    }
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": {
    "message": "Cannot edit submission that has been reviewed",
    "code": "SUBMISSION_LOCKED"
  }
}
```

---

#### DELETE /api/faculty/submissions/:id

Delete submission (only if status is `pending`).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Submission deleted successfully"
}
```

---

#### GET /api/faculty/scores

Get current score breakdown.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `academicYear` (optional): Academic year (default: current year)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "scores": {
      "research": 26.43,
      "teaching": 8.5,
      "admin": 9,
      "outreach": 3,
      "totalPenalties": -4,
      "finalScore": 42.93,
      "outcome": "contract_risk",
      "academicYear": "2025-2026"
    },
    "breakdown": {
      "research": [
        {
          "submissionId": "507f1f77bcf86cd799439014",
          "title": "Machine Learning in Education",
          "points": 13.55
        }
      ],
      "teaching": [],
      "admin": [],
      "outreach": []
    }
  }
}
```

---

#### GET /api/faculty/penalties

Get all penalties for current faculty member.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `academicYear` (optional): Academic year (default: current year)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "penalties": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "type": "meeting",
        "description": "Missed 3 meetings",
        "points": -2,
        "appliedAt": "2025-01-15T10:00:00Z",
        "appliedBy": {
          "_id": "507f1f77bcf86cd799439012",
          "firstName": "Admin",
          "lastName": "User"
        }
      }
    ],
    "totalPenalties": -4
  }
}
```

---

### Admin Endpoints

#### GET /api/admin/submissions

Get all submissions with filters.

**Headers**:
```
Authorization: Bearer <token>
Role: admin
```

**Query Parameters**:
- `status` (optional): Filter by status
- `category` (optional): Filter by category
- `userId` (optional): Filter by user
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response** (200):
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "firstName": "John",
          "lastName": "Doe",
          "email": "faculty@cau.edu"
        },
        "category": "research",
        "title": "Machine Learning in Education",
        "calculatedPoints": 13.55,
        "status": "pending",
        "submittedAt": "2025-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

---

#### PUT /api/admin/submissions/:id/approve

Approve submission.

**Headers**:
```
Authorization: Bearer <token>
Role: admin
```

**Request Body** (optional):
```json
{
  "notes": "Approved after review"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "submission": {
      "_id": "507f1f77bcf86cd799439014",
      "status": "approved",
      "reviewedAt": "2025-01-21T10:00:00Z",
      "reviewedBy": "507f1f77bcf86cd799439012"
    }
  }
}
```

---

#### PUT /api/admin/submissions/:id/reject

Reject submission.

**Headers**:
```
Authorization: Bearer <token>
Role: admin
```

**Request Body**:
```json
{
  "notes": "Evidence insufficient"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "submission": {
      "_id": "507f1f77bcf86cd799439014",
      "status": "rejected",
      "adminNotes": "Evidence insufficient",
      "reviewedAt": "2025-01-21T10:00:00Z"
    }
  }
}
```

---

#### PUT /api/admin/submissions/:id/adjust

Manually adjust points for a submission.

**Headers**:
```
Authorization: Bearer <token>
Role: admin
```

**Request Body**:
```json
{
  "adjustedPoints": 15.5,
  "notes": "Adjusted based on additional evidence"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "submission": {
      "_id": "507f1f77bcf86cd799439014",
      "calculatedPoints": 13.55,
      "adjustedPoints": 15.5,
      "adminNotes": "Adjusted based on additional evidence"
    }
  }
}
```

---

#### POST /api/admin/penalties

Apply penalty to faculty member.

**Headers**:
```
Authorization: Bearer <token>
Role: admin
```

**Request Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "meeting",
  "description": "Missed 3 meetings",
  "points": -2,
  "evidence": "Meeting attendance records"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "penalty": {
      "_id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439011",
      "type": "meeting",
      "description": "Missed 3 meetings",
      "points": -2,
      "appliedBy": "507f1f77bcf86cd799439012",
      "appliedAt": "2025-01-21T10:00:00Z"
    }
  }
}
```

---

#### GET /api/admin/faculty

Get all faculty members.

**Headers**:
```
Authorization: Bearer <token>
Role: admin
```

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `rank` (optional): Filter by faculty rank

**Response** (200):
```json
{
  "success": true,
  "data": {
    "faculty": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "email": "faculty@cau.edu",
        "firstName": "John",
        "lastName": "Doe",
        "facultyRank": "Assistant Professor",
        "department": "Computer Science"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

#### GET /api/admin/scores

Get all faculty scores.

**Headers**:
```
Authorization: Bearer <token>
Role: admin
```

**Query Parameters**:
- `academicYear` (optional): Academic year
- `outcome` (optional): Filter by outcome
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response** (200):
```json
{
  "success": true,
  "data": {
    "scores": [
      {
        "_id": "507f1f77bcf86cd799439016",
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "firstName": "John",
          "lastName": "Doe",
          "email": "faculty@cau.edu"
        },
        "research": 26.43,
        "teaching": 8.5,
        "admin": 9,
        "outreach": 3,
        "totalPenalties": -4,
        "finalScore": 42.93,
        "outcome": "contract_risk",
        "academicYear": "2025-2026"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

#### GET /api/admin/reports

Generate reports.

**Headers**:
```
Authorization: Bearer <token>
Role: admin
```

**Query Parameters**:
- `academicYear` (optional): Academic year
- `format` (optional): `json` or `csv` (default: `json`)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalFaculty": 25,
      "outstanding": 5,
      "satisfactory": 12,
      "improvementPlan": 6,
      "contractRisk": 2
    },
    "averageScores": {
      "research": 28.5,
      "teaching": 22.3,
      "admin": 15.2,
      "outreach": 6.8
    },
    "details": []
  }
}
```

---

### Configuration Endpoints

#### GET /api/config

Get all configurations.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `category` (optional): Filter by category

**Response** (200):
```json
{
  "success": true,
  "data": {
    "configurations": [
      {
        "_id": "507f1f77bcf86cd799439017",
        "category": "research",
        "key": "q1_base_points",
        "value": 10,
        "description": "Base points for Q1 journal publications"
      }
    ]
  }
}
```

---

#### PUT /api/config/:key

Update configuration value (Admin only).

**Headers**:
```
Authorization: Bearer <token>
Role: admin
```

**Request Body**:
```json
{
  "value": 12,
  "description": "Updated base points for Q1 journals"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "configuration": {
      "_id": "507f1f77bcf86cd799439017",
      "key": "q1_base_points",
      "value": 12,
      "updatedAt": "2025-01-21T10:00:00Z",
      "updatedBy": "507f1f77bcf86cd799439012"
    }
  }
}
```

---

#### GET /api/config/multipliers

Get expectation multipliers.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "multipliers": {
      "Great": 1.0,
      "Good": 1.2,
      "Average": 1.4,
      "Below Average": 1.5
    },
    "rankExpectations": {
      "Head": {
        "research": "Average",
        "admin": "Great",
        "studentSatisfaction": "Great"
      },
      "Professor": {
        "research": "Great",
        "admin": "Great",
        "studentSatisfaction": "Good"
      }
    }
  }
}
```

---

#### GET /api/config/ceilings

Get category ceilings.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "ceilings": {
      "research": 40,
      "teaching": 30,
      "admin": 20,
      "outreach": 10,
      "total": 100
    }
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Webhooks (Future)

Webhooks may be implemented for:
- Submission status changes
- Score updates
- Penalty applications

---

**Last Updated**: 2025  
**Version**: 1.0.0

