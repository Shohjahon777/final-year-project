# Database Schema Documentation

**Faculty Evaluation System - MongoDB Schema Design**

This document provides detailed information about the database schema, models, relationships, and data structures used in the Faculty Evaluation System.

---

## Table of Contents

- [Database Overview](#database-overview)
- [Collections](#collections)
- [Models](#models)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Data Validation](#data-validation)
- [Migration Guide](#migration-guide)

---

## Database Overview

**Database Name**: `faculty-evaluation`  
**Database Type**: MongoDB (NoSQL)  
**ODM**: Mongoose

### Connection String Format

```
mongodb://localhost:27017/faculty-evaluation
# OR
mongodb+srv://username:password@cluster.mongodb.net/faculty-evaluation
```

---

## Collections

The database consists of 5 main collections:

1. **users** - Faculty and admin accounts
2. **submissions** - Faculty activity submissions
3. **configurations** - System configuration settings
4. **penalties** - Applied penalties
5. **scores** - Calculated scores and outcomes

---

## Models

### 1. User Model

**Collection**: `users`

**Schema**:

```typescript
{
  _id: ObjectId,
  email: string (required, unique, lowercase),
  password: string (required, hashed with bcrypt),
  role: 'faculty' | 'admin' (required, default: 'faculty'),
  facultyRank?: 'Head' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer',
  firstName: string (required),
  lastName: string (required),
  department: string (required, default: 'Computer Science'),
  isActive: boolean (default: true),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Mongoose Schema**:

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'faculty' | 'admin';
  facultyRank?: 'Head' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer';
  firstName: string;
  lastName: string;
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['faculty', 'admin'],
    default: 'faculty',
    required: true
  },
  facultyRank: {
    type: String,
    enum: ['Head', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'],
    required: function() {
      return this.role === 'faculty';
    }
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    default: 'Computer Science'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ facultyRank: 1 });

export default mongoose.model<IUser>('User', UserSchema);
```

---

### 2. Submission Model

**Collection**: `submissions`

**Schema**:

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  category: 'research' | 'teaching' | 'admin' | 'outreach' (required),
  subcategory: string (required),
  title: string (required),
  description: string,
  evidence: {
    type: 'link' | 'file' | 'text',
    value: string
  },
  metadata: {
    // Category-specific fields
    journalTier?: 'Q1' | 'Q2' | 'Q3' | 'Q4',
    authorPosition?: '1st' | 'last' | 'middle',
    isCorresponding?: boolean,
    hasStudentCoAuthor?: boolean,
    // ... other category-specific fields
  },
  calculatedPoints: number (default: 0),
  adjustedPoints?: number, // Admin-adjusted points
  status: 'pending' | 'approved' | 'rejected' (default: 'pending'),
  adminNotes?: string,
  submittedAt: Date (default: Date.now),
  reviewedAt?: Date,
  reviewedBy?: ObjectId (ref: 'User')
}
```

**Mongoose Schema**:

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  category: 'research' | 'teaching' | 'admin' | 'outreach';
  subcategory: string;
  title: string;
  description?: string;
  evidence: {
    type: 'link' | 'file' | 'text';
    value: string;
  };
  metadata: Record<string, any>;
  calculatedPoints: number;
  adjustedPoints?: number;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
}

const SubmissionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['research', 'teaching', 'admin', 'outreach'],
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  evidence: {
    type: {
      type: String,
      enum: ['link', 'file', 'text'],
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  calculatedPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  adjustedPoints: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
SubmissionSchema.index({ userId: 1, status: 1 });
SubmissionSchema.index({ category: 1, status: 1 });
SubmissionSchema.index({ submittedAt: -1 });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
```

---

### 3. Configuration Model

**Collection**: `configurations`

**Schema**:

```typescript
{
  _id: ObjectId,
  category: string (required),
  key: string (required, unique),
  value: number | string | boolean (required),
  description: string,
  updatedAt: Date (default: Date.now),
  updatedBy: ObjectId (ref: 'User')
}
```

**Mongoose Schema**:

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IConfiguration extends Document {
  category: string;
  key: string;
  value: number | string | boolean;
  description?: string;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const ConfigurationSchema: Schema = new Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Indexes
ConfigurationSchema.index({ category: 1 });
ConfigurationSchema.index({ key: 1 });

export default mongoose.model<IConfiguration>('Configuration', ConfigurationSchema);
```

**Default Configurations**:

```typescript
const defaultConfigs = [
  // Research base points
  { category: 'research', key: 'q1_base_points', value: 10 },
  { category: 'research', key: 'q2_base_points', value: 8 },
  { category: 'research', key: 'q3_base_points', value: 6 },
  { category: 'research', key: 'q4_base_points', value: 4 },
  { category: 'research', key: 'conference_base_points', value: 3 },
  
  // Multipliers
  { category: 'research', key: 'middle_author_multiplier', value: 0.7 },
  { category: 'research', key: 'corresponding_multiplier', value: 1.1 },
  { category: 'research', key: 'student_coauthor_multiplier', value: 1.1 },
  
  // Category ceilings
  { category: 'system', key: 'research_ceiling', value: 40 },
  { category: 'system', key: 'teaching_ceiling', value: 30 },
  { category: 'system', key: 'admin_ceiling', value: 20 },
  { category: 'system', key: 'outreach_ceiling', value: 10 },
  
  // Outcome thresholds
  { category: 'system', key: 'outstanding_threshold', value: 80 },
  { category: 'system', key: 'satisfactory_threshold', value: 60 },
  { category: 'system', key: 'improvement_plan_threshold', value: 50 }
];
```

---

### 4. Penalty Model

**Collection**: `penalties`

**Schema**:

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  type: 'meeting' | 'deadline' | 'academic_dishonesty' (required),
  description: string (required),
  points: number (required, negative value),
  appliedBy: ObjectId (ref: 'User', required),
  appliedAt: Date (default: Date.now),
  evidence?: string,
  academicYear: string (required, format: 'YYYY-YYYY')
}
```

**Mongoose Schema**:

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IPenalty extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'meeting' | 'deadline' | 'academic_dishonesty';
  description: string;
  points: number;
  appliedBy: mongoose.Types.ObjectId;
  appliedAt: Date;
  evidence?: string;
  academicYear: string;
}

const PenaltySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['meeting', 'deadline', 'academic_dishonesty'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    max: 0 // Must be negative or zero
  },
  appliedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  evidence: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  }
}, {
  timestamps: true
});

// Indexes
PenaltySchema.index({ userId: 1, academicYear: 1 });
PenaltySchema.index({ type: 1 });
PenaltySchema.index({ appliedAt: -1 });

export default mongoose.model<IPenalty>('Penalty', PenaltySchema);
```

---

### 5. Score Model

**Collection**: `scores`

**Schema**:

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  academicYear: string (required, format: 'YYYY-YYYY'),
  research: number (default: 0, max: 40),
  teaching: number (default: 0, max: 30),
  admin: number (default: 0, max: 20),
  outreach: number (default: 0, max: 10),
  totalPenalties: number (default: 0, max: 0),
  finalScore: number (required),
  outcome: 'outstanding' | 'satisfactory' | 'improvement_plan' | 'contract_risk' (required),
  calculatedAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Mongoose Schema**:

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IScore extends Document {
  userId: mongoose.Types.ObjectId;
  academicYear: string;
  research: number;
  teaching: number;
  admin: number;
  outreach: number;
  totalPenalties: number;
  finalScore: number;
  outcome: 'outstanding' | 'satisfactory' | 'improvement_plan' | 'contract_risk';
  calculatedAt: Date;
  updatedAt: Date;
}

const ScoreSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  research: {
    type: Number,
    default: 0,
    min: 0,
    max: 40
  },
  teaching: {
    type: Number,
    default: 0,
    min: 0,
    max: 30
  },
  admin: {
    type: Number,
    default: 0,
    min: 0,
    max: 20
  },
  outreach: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  totalPenalties: {
    type: Number,
    default: 0,
    max: 0 // Must be negative or zero
  },
  finalScore: {
    type: Number,
    required: true
  },
  outcome: {
    type: String,
    enum: ['outstanding', 'satisfactory', 'improvement_plan', 'contract_risk'],
    required: true
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
ScoreSchema.index({ userId: 1, academicYear: 1 }, { unique: true });
ScoreSchema.index({ academicYear: 1, outcome: 1 });
ScoreSchema.index({ finalScore: -1 });

export default mongoose.model<IScore>('Score', ScoreSchema);
```

---

## Relationships

### User → Submissions (One-to-Many)

```typescript
// Get all submissions for a user
const submissions = await Submission.find({ userId: user._id });
```

### User → Penalties (One-to-Many)

```typescript
// Get all penalties for a user
const penalties = await Penalty.find({ userId: user._id });
```

### User → Scores (One-to-Many)

```typescript
// Get all scores for a user
const scores = await Score.find({ userId: user._id });
```

### Submission → User (Many-to-One)

```typescript
// Populate user when fetching submissions
const submission = await Submission.findById(id).populate('userId');
```

### Penalty → User (Many-to-One)

```typescript
// Populate user and appliedBy when fetching penalties
const penalty = await Penalty.findById(id)
  .populate('userId')
  .populate('appliedBy');
```

---

## Indexes

### Performance Indexes

**Users Collection**:
- `email`: Unique index for fast lookups
- `role`: Index for filtering by role
- `facultyRank`: Index for filtering by rank

**Submissions Collection**:
- `userId + status`: Compound index for user's submissions by status
- `category + status`: Compound index for filtering by category
- `submittedAt`: Descending index for chronological sorting

**Penalties Collection**:
- `userId + academicYear`: Compound index for user's penalties by year
- `type`: Index for filtering by penalty type
- `appliedAt`: Descending index for chronological sorting

**Scores Collection**:
- `userId + academicYear`: Unique compound index (one score per user per year)
- `academicYear + outcome`: Compound index for reporting
- `finalScore`: Descending index for ranking

---

## Data Validation

### Pre-Save Hooks

**User Model**:
```typescript
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

**Submission Model**:
```typescript
SubmissionSchema.pre('save', function(next) {
  // Calculate points before saving
  if (this.isNew || this.isModified('metadata')) {
    this.calculatedPoints = calculatePoints(this);
  }
  next();
});
```

**Score Model**:
```typescript
ScoreSchema.pre('save', function(next) {
  // Ensure category ceilings
  this.research = Math.min(this.research, 40);
  this.teaching = Math.min(this.teaching, 30);
  this.admin = Math.min(this.admin, 20);
  this.outreach = Math.min(this.outreach, 10);
  
  // Calculate final score
  this.finalScore = this.research + this.teaching + this.admin + this.outreach + this.totalPenalties;
  
  // Determine outcome
  if (this.finalScore >= 80) {
    this.outcome = 'outstanding';
  } else if (this.finalScore >= 60) {
    this.outcome = 'satisfactory';
  } else if (this.finalScore >= 50) {
    this.outcome = 'improvement_plan';
  } else {
    this.outcome = 'contract_risk';
  }
  
  next();
});
```

---

## Migration Guide

### Initial Setup

1. **Create Database**:
```bash
mongosh
use faculty-evaluation
```

2. **Seed Default Configurations**:
```typescript
// scripts/seed-configs.ts
import mongoose from 'mongoose';
import Configuration from './models/Configuration';

const defaultConfigs = [
  // ... configurations from above
];

await Configuration.insertMany(defaultConfigs);
```

3. **Create Indexes**:
```typescript
// All indexes are created automatically by Mongoose
// Or manually:
await User.createIndexes();
await Submission.createIndexes();
await Penalty.createIndexes();
await Score.createIndexes();
```

### Data Migration Examples

**Adding New Field**:
```typescript
// Add new field to existing documents
await User.updateMany(
  { newField: { $exists: false } },
  { $set: { newField: 'defaultValue' } }
);
```

**Updating Academic Year Format**:
```typescript
// Convert old format to new format
await Score.updateMany(
  { academicYear: /^\d{4}$/ },
  [
    {
      $set: {
        academicYear: {
          $concat: [
            { $substr: ['$academicYear', 0, 4] },
            '-',
            { $toString: { $add: [{ $toInt: { $substr: ['$academicYear', 0, 4] } }, 1] } }
          ]
        }
      }
    }
  ]
);
```

---

## Best Practices

1. **Always use transactions** for multi-document operations
2. **Validate data** before saving
3. **Use indexes** for frequently queried fields
4. **Populate references** when needed, but be mindful of performance
5. **Use lean queries** for read-only operations
6. **Implement soft deletes** if needed (isActive flag)
7. **Log all admin actions** for audit trail

---

**Last Updated**: 2025  
**Version**: 1.0.0

