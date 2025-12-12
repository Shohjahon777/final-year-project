import mongoose, { Schema, Document } from 'mongoose'

export interface IScore extends Document {
  userId: mongoose.Types.ObjectId
  academicYear: string
  research: number
  teaching: number
  admin: number
  outreach: number
  totalPenalties: number
  finalScore: number
  outcome: 'outstanding' | 'satisfactory' | 'improvement_plan' | 'contract_risk'
  calculatedAt: Date
  updatedAt: Date
}

const ScoreSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    },
    research: {
      type: Number,
      default: 0,
      min: 0,
      max: 40,
    },
    teaching: {
      type: Number,
      default: 0,
      min: 0,
      max: 30,
    },
    admin: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },
    outreach: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    totalPenalties: {
      type: Number,
      default: 0,
      max: 0, // Must be negative or zero
    },
    finalScore: {
      type: Number,
      required: true,
    },
    outcome: {
      type: String,
      enum: ['outstanding', 'satisfactory', 'improvement_plan', 'contract_risk'],
      required: true,
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
ScoreSchema.index({ userId: 1, academicYear: 1 }, { unique: true })
ScoreSchema.index({ academicYear: 1, outcome: 1 })
ScoreSchema.index({ finalScore: -1 })

export default mongoose.model<IScore>('Score', ScoreSchema)
