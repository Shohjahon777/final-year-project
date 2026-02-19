// MongoDB Initialization Script
// This script runs when MongoDB container starts for the first time

// Get environment variables with defaults
const dbName = process.env.MONGO_DB || 'faculty_evaluation';
const adminUser = process.env.MONGO_ROOT_USER || 'admin';

// Switch to the application database
db = db.getSiblingDB(dbName);

// Create indexes for better performance
print('Creating indexes...');

// Users collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1, isActive: 1 });
db.users.createIndex({ department: 1, facultyRank: 1 });

// Submissions collection indexes
db.submissions.createIndex({ userId: 1, status: 1 });
db.submissions.createIndex({ category: 1, status: 1 });
db.submissions.createIndex({ submittedAt: -1 });
db.submissions.createIndex({ userId: 1, submittedAt: -1 });
db.submissions.createIndex({ status: 1, submittedAt: -1 });

// Scores collection indexes
db.scores.createIndex({ userId: 1, academicYear: 1 }, { unique: true });
db.scores.createIndex({ academicYear: 1, finalScore: -1 });
db.scores.createIndex({ outcome: 1 });

// Penalties collection indexes
db.penalties.createIndex({ userId: 1, academicYear: 1 });
db.penalties.createIndex({ appliedAt: -1 });
db.penalties.createIndex({ type: 1 });

// Configurations collection indexes
db.configurations.createIndex({ key: 1 }, { unique: true });
db.configurations.createIndex({ category: 1 });

print('Indexes created successfully!');
print('Database initialization complete for: ' + dbName);
