import mongoose, { Schema, Document } from 'mongoose'

export interface IPenalty extends Document {
  userId: mongoose.Types.ObjectId
  type: 'meeting' | 'deadline' | 'academic_dishonesty'
  description: string
  points: number
  appliedBy: mongoose.Types.ObjectId
  appliedAt: Date
  evidence?: string
  academicYear: string
}

const PenaltySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['meeting', 'deadline', 'academic_dishonesty'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    points: {
      type: Number,
      required: true,
      max: 0, // Must be negative or zero
    },
    appliedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    evidence: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
PenaltySchema.index({ userId: 1, academicYear: 1 })
PenaltySchema.index({ type: 1 })
PenaltySchema.index({ appliedAt: -1 })

export default mongoose.model<IPenalty>('Penalty', PenaltySchema)
