import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  role: 'faculty' | 'admin'
  facultyRank?: 'Head' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer'
  firstName: string
  lastName: string
  department: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['faculty', 'admin'],
      default: 'faculty',
      required: true,
    },
    facultyRank: {
      type: String,
      enum: ['Head', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'],
      required: function (this: IUser) {
        return this.role === 'faculty'
      },
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      default: 'Computer Science',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ facultyRank: 1 })

export default mongoose.model<IUser>('User', UserSchema)
