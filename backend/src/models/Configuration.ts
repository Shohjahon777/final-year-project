import mongoose, { Schema, Document } from 'mongoose'

export interface IConfiguration extends Document {
  category: string
  key: string
  value: number | string | boolean
  description?: string
  updatedAt: Date
  updatedBy?: mongoose.Types.ObjectId
}

const ConfigurationSchema: Schema = new Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: false,
  }
)

// Indexes
ConfigurationSchema.index({ key: 1 })
ConfigurationSchema.index({ category: 1 })

export default mongoose.model<IConfiguration>('Configuration', ConfigurationSchema)
