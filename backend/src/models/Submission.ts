import mongoose, { Schema, Document } from 'mongoose'
import { getCurrentAcademicYear } from '../utils/academicYear'

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId
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
  academicYear: string // e.g., "2025-2026"
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: mongoose.Types.ObjectId
}

const SubmissionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['research', 'teaching', 'admin', 'outreach'],
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    evidence: {
      type: {
        type: String,
        enum: ['link', 'file', 'text'],
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    calculatedPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    adjustedPoints: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'changes_requested'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
      index: true,
      default: getCurrentAcademicYear,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
SubmissionSchema.index({ userId: 1, status: 1 })
SubmissionSchema.index({ category: 1, status: 1 })
SubmissionSchema.index({ submittedAt: -1 })
SubmissionSchema.index({ userId: 1, academicYear: 1 })
SubmissionSchema.index({ academicYear: 1, status: 1 })

export default mongoose.model<ISubmission>('Submission', SubmissionSchema)
