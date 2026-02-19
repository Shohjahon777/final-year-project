import mongoose, { Schema, Document } from 'mongoose'

export interface IVacation extends Document {
  userId: mongoose.Types.ObjectId
  startDate: Date
  endDate: Date
  reason: string
  type: 'annual' | 'sick' | 'unpaid' | 'other'
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  adminComment?: string
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const VacationSchema = new Schema<IVacation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['annual', 'sick', 'unpaid', 'other'],
      default: 'annual',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    adminComment: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

VacationSchema.index({ userId: 1 })
VacationSchema.index({ status: 1 })
VacationSchema.index({ startDate: 1 })

export default mongoose.model<IVacation>('Vacation', VacationSchema)
