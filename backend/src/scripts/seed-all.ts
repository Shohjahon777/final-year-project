import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from '../models/User'
import Submission from '../models/Submission'
import Score from '../models/Score'
import Penalty from '../models/Penalty'
import Configuration from '../models/Configuration'
import { connectDB } from '../utils/db'

dotenv.config()

// Helper function to get current academic year
function getCurrentAcademicYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  if (month >= 9) {
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
}

// Configuration data
const defaultConfigs = [
  // Research base points
  { category: 'research', key: 'q1_base_points', value: 10, description: 'Base points for Q1 journal publication' },
  { category: 'research', key: 'q2_base_points', value: 8, description: 'Base points for Q2 journal publication' },
  { category: 'research', key: 'q3_base_points', value: 6, description: 'Base points for Q3 journal publication' },
  { category: 'research', key: 'q4_base_points', value: 4, description: 'Base points for Q4 journal publication' },
  { category: 'research', key: 'conference_international', value: 6, description: 'Points for international conference' },
  { category: 'research', key: 'conference_national', value: 3, description: 'Points for national conference' },
  { category: 'research', key: 'patent_base_points', value: 15, description: 'Base points for verified patent' },
  
  // Research multipliers
  { category: 'research', key: 'first_author_multiplier', value: 1.4, description: 'Multiplier for first author position' },
  { category: 'research', key: 'corresponding_multiplier', value: 1.2, description: 'Multiplier for corresponding author' },
  { category: 'research', key: 'student_coauthor_multiplier', value: 1.1, description: 'Multiplier when student is co-author' },
  
  // Teaching points
  { category: 'teaching', key: 'feedback_excellent', value: 3, description: 'Points for 80%+ student satisfaction' },
  { category: 'teaching', key: 'feedback_good', value: 1, description: 'Points for 70-79% student satisfaction' },
  { category: 'teaching', key: 'materials_upload', value: 2, description: 'Points per course for complete materials upload' },
  
  // Admin/Service points
  { category: 'admin', key: 'major_task', value: 8, description: 'Points for major administrative task' },
  { category: 'admin', key: 'medium_task', value: 4, description: 'Points for medium administrative task' },
  { category: 'admin', key: 'minor_task', value: 2, description: 'Points for minor administrative task' },
  
  // Outreach points
  { category: 'outreach', key: 'event_large', value: 3, description: 'Points for event with ~100 participants' },
  { category: 'outreach', key: 'event_medium', value: 2, description: 'Points for medium events' },
  { category: 'outreach', key: 'event_small', value: 1, description: 'Points for smaller events' },
  
  // Category ceilings
  { category: 'system', key: 'research_ceiling', value: 40, description: 'Maximum points for research category' },
  { category: 'system', key: 'teaching_ceiling', value: 30, description: 'Maximum points for teaching category' },
  { category: 'system', key: 'admin_ceiling', value: 20, description: 'Maximum points for admin category' },
  { category: 'system', key: 'outreach_ceiling', value: 10, description: 'Maximum points for outreach category' },
  
  // Outcome thresholds
  { category: 'system', key: 'outstanding_threshold', value: 80, description: 'Minimum score for outstanding outcome' },
  { category: 'system', key: 'satisfactory_threshold', value: 60, description: 'Minimum score for satisfactory outcome' },
  { category: 'system', key: 'improvement_threshold', value: 40, description: 'Minimum score for improvement plan outcome' },
]

// Faculty users data
const facultyUsers = [
  {
    email: 'john.smith@cau.edu',
    password: 'faculty123',
    firstName: 'John',
    lastName: 'Smith',
    role: 'faculty' as const,
    facultyRank: 'Professor' as const,
    department: 'Computer Science',
  },
  {
    email: 'sarah.johnson@cau.edu',
    password: 'faculty123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'faculty' as const,
    facultyRank: 'Associate Professor' as const,
    department: 'Computer Science',
  },
  {
    email: 'michael.chen@cau.edu',
    password: 'faculty123',
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'faculty' as const,
    facultyRank: 'Assistant Professor' as const,
    department: 'Computer Science',
  },
  {
    email: 'emily.davis@cau.edu',
    password: 'faculty123',
    firstName: 'Emily',
    lastName: 'Davis',
    role: 'faculty' as const,
    facultyRank: 'Lecturer' as const,
    department: 'Computer Science',
  },
  {
    email: 'robert.wilson@cau.edu',
    password: 'faculty123',
    firstName: 'Robert',
    lastName: 'Wilson',
    role: 'faculty' as const,
    facultyRank: 'Head' as const,
    department: 'Computer Science',
  },
]

// Submission templates
const submissionTemplates = [
  // Research submissions
  {
    category: 'research' as const,
    subcategory: 'journal',
    title: 'Machine Learning Applications in Healthcare',
    description: 'Published in Q1 journal IEEE Transactions',
    evidence: { type: 'link' as const, value: 'https://doi.org/10.1109/example1' },
    metadata: { journalTier: 'Q1', authorPosition: '1st', isCorresponding: true, hasStudentCoAuthor: true },
    calculatedPoints: 14.0,
  },
  {
    category: 'research' as const,
    subcategory: 'journal',
    title: 'Deep Learning for Natural Language Processing',
    description: 'Published in Q2 journal',
    evidence: { type: 'link' as const, value: 'https://doi.org/10.1016/example2' },
    metadata: { journalTier: 'Q2', authorPosition: '2nd', isCorresponding: false, hasStudentCoAuthor: false },
    calculatedPoints: 8.0,
  },
  {
    category: 'research' as const,
    subcategory: 'conference',
    title: 'AI in Computer Science Education',
    description: 'Presented at ACM SIGCSE Conference',
    evidence: { type: 'link' as const, value: 'https://dl.acm.org/example3' },
    metadata: { conferenceType: 'international', authorPosition: '1st' },
    calculatedPoints: 6.0,
  },
  // Teaching submissions
  {
    category: 'teaching' as const,
    subcategory: 'feedback',
    title: 'CS101 Introduction to Programming - Student Feedback',
    description: 'Student evaluation scores for Fall semester',
    evidence: { type: 'file' as const, value: 'feedback-cs101-fall.pdf' },
    metadata: { averageRating: 4.5, totalResponses: 45, semester: 'Fall 2024' },
    calculatedPoints: 8.5,
  },
  {
    category: 'teaching' as const,
    subcategory: 'materials',
    title: 'CS201 Data Structures - Course Materials',
    description: 'Complete course materials uploaded to LMS',
    evidence: { type: 'link' as const, value: 'https://lms.cau.edu/cs201' },
    metadata: { courseName: 'CS201', semester: 'Spring 2025' },
    calculatedPoints: 2.0,
  },
  // Admin submissions
  {
    category: 'admin' as const,
    subcategory: 'major',
    title: 'ABET Accreditation Committee',
    description: 'Served as committee member for ABET accreditation process',
    evidence: { type: 'text' as const, value: 'Committee meeting minutes and final accreditation report' },
    metadata: { taskType: 'major', duration: '12 months' },
    calculatedPoints: 8.0,
  },
  {
    category: 'admin' as const,
    subcategory: 'medium',
    title: 'Student Club Advisor',
    description: 'Faculty advisor for ACM Student Chapter',
    evidence: { type: 'text' as const, value: 'Club activity reports and meeting records' },
    metadata: { taskType: 'medium', duration: '6 months' },
    calculatedPoints: 4.0,
  },
  // Outreach submissions
  {
    category: 'outreach' as const,
    subcategory: 'event',
    title: 'Regional Tech Conference Speaker',
    description: 'Keynote speaker at Atlanta Tech Summit',
    evidence: { type: 'link' as const, value: 'https://techsummit.example.com/speakers' },
    metadata: { eventType: 'conference', audienceSize: 200 },
    calculatedPoints: 3.0,
  },
  {
    category: 'outreach' as const,
    subcategory: 'workshop',
    title: 'High School Coding Workshop',
    description: 'Conducted coding workshop for local high school students',
    evidence: { type: 'text' as const, value: 'Workshop attendance sheet and feedback forms' },
    metadata: { eventType: 'workshop', audienceSize: 50 },
    calculatedPoints: 2.0,
  },
]

async function seedAll() {
  try {
    await connectDB()
    const academicYear = getCurrentAcademicYear()
    
    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Submission.deleteMany({})
    await Score.deleteMany({})
    await Penalty.deleteMany({})
    await Configuration.deleteMany({})
    
    // 1. Seed Configurations
    console.log('⚙️  Seeding configurations...')
    for (const config of defaultConfigs) {
      await Configuration.create(config)
    }
    console.log(`   ✅ Created ${defaultConfigs.length} configurations`)
    
    // 2. Create Admin User
    console.log('👤 Creating admin user...')
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await User.create({
      email: 'admin@cau.edu',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      department: 'Computer Science',
      isActive: true,
    })
    console.log('   ✅ Admin created: admin@cau.edu / admin123')
    
    // 3. Create Faculty Users
    console.log('👥 Creating faculty users...')
    const createdFaculty: any[] = []
    for (const faculty of facultyUsers) {
      const hashedPassword = await bcrypt.hash(faculty.password, 10)
      const user = await User.create({
        ...faculty,
        password: hashedPassword,
        isActive: true,
      })
      createdFaculty.push(user)
      console.log(`   ✅ ${faculty.firstName} ${faculty.lastName} (${faculty.facultyRank})`)
    }
    
    // 4. Create Submissions for each faculty
    console.log('📝 Creating submissions...')
    const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'approved', 'approved', 'rejected']
    let submissionCount = 0
    
    for (const faculty of createdFaculty) {
      // Each faculty gets 4-6 random submissions
      const numSubmissions = Math.floor(Math.random() * 3) + 4
      const shuffledTemplates = [...submissionTemplates].sort(() => Math.random() - 0.5)
      
      for (let i = 0; i < numSubmissions && i < shuffledTemplates.length; i++) {
        const template = shuffledTemplates[i]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const daysAgo = Math.floor(Math.random() * 60)
        const submittedAt = new Date()
        submittedAt.setDate(submittedAt.getDate() - daysAgo)
        
        const submission: any = {
          userId: faculty._id,
          ...template,
          status,
          submittedAt,
        }
        
        if (status !== 'pending') {
          submission.reviewedAt = new Date(submittedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
          submission.reviewedBy = admin._id
          if (status === 'rejected') {
            submission.adminNotes = 'Insufficient evidence provided. Please resubmit with proper documentation.'
          }
        }
        
        await Submission.create(submission)
        submissionCount++
      }
    }
    console.log(`   ✅ Created ${submissionCount} submissions`)
    
    // 5. Create Scores for each faculty
    console.log('📊 Creating scores...')
    const outcomes: ('outstanding' | 'satisfactory' | 'improvement_plan' | 'contract_risk')[] = 
      ['outstanding', 'satisfactory', 'satisfactory', 'improvement_plan', 'contract_risk']
    
    for (let i = 0; i < createdFaculty.length; i++) {
      const faculty = createdFaculty[i]
      const outcome = outcomes[i]
      
      let research, teaching, admin, outreach, totalPenalties
      
      switch (outcome) {
        case 'outstanding':
          research = 35 + Math.random() * 5
          teaching = 25 + Math.random() * 5
          admin = 15 + Math.random() * 5
          outreach = 8 + Math.random() * 2
          totalPenalties = 0
          break
        case 'satisfactory':
          research = 25 + Math.random() * 10
          teaching = 18 + Math.random() * 7
          admin = 10 + Math.random() * 5
          outreach = 4 + Math.random() * 4
          totalPenalties = -Math.floor(Math.random() * 3)
          break
        case 'improvement_plan':
          research = 15 + Math.random() * 10
          teaching = 12 + Math.random() * 8
          admin = 8 + Math.random() * 5
          outreach = 2 + Math.random() * 3
          totalPenalties = -Math.floor(Math.random() * 5) - 2
          break
        default:
          research = 8 + Math.random() * 10
          teaching = 8 + Math.random() * 8
          admin = 4 + Math.random() * 5
          outreach = 1 + Math.random() * 2
          totalPenalties = -Math.floor(Math.random() * 8) - 3
      }
      
      const finalScore = Math.min(100, research + teaching + admin + outreach + totalPenalties)
      
      await Score.create({
        userId: faculty._id,
        academicYear,
        research: Math.round(research * 100) / 100,
        teaching: Math.round(teaching * 100) / 100,
        admin: Math.round(admin * 100) / 100,
        outreach: Math.round(outreach * 100) / 100,
        totalPenalties: Math.round(totalPenalties * 100) / 100,
        finalScore: Math.round(finalScore * 100) / 100,
        outcome,
        calculatedAt: new Date(),
      })
    }
    console.log(`   ✅ Created ${createdFaculty.length} faculty scores`)
    
    // 6. Create some penalties
    console.log('⚠️  Creating penalties...')
    const penaltyTypes: ('meeting' | 'deadline' | 'academic_dishonesty')[] = ['meeting', 'deadline']
    const penaltyDescriptions = [
      { type: 'meeting' as const, description: 'Missed department meeting', points: -2 },
      { type: 'meeting' as const, description: 'Missed 2 committee meetings', points: -3 },
      { type: 'deadline' as const, description: 'Late grade submission', points: -2 },
      { type: 'deadline' as const, description: 'Late submission of course materials', points: -1 },
    ]
    
    let penaltyCount = 0
    for (let i = 0; i < 3; i++) {
      const faculty = createdFaculty[Math.floor(Math.random() * createdFaculty.length)]
      const penaltyTemplate = penaltyDescriptions[Math.floor(Math.random() * penaltyDescriptions.length)]
      const daysAgo = Math.floor(Math.random() * 30) + 1
      const appliedAt = new Date()
      appliedAt.setDate(appliedAt.getDate() - daysAgo)
      
      await Penalty.create({
        userId: faculty._id,
        type: penaltyTemplate.type,
        description: penaltyTemplate.description,
        points: penaltyTemplate.points,
        appliedBy: admin._id,
        appliedAt,
        academicYear,
      })
      penaltyCount++
    }
    console.log(`   ✅ Created ${penaltyCount} penalties`)
    
    // Summary
    console.log('')
    console.log('=' .repeat(50))
    console.log('🎉 Database seeded successfully!')
    console.log('=' .repeat(50))
    console.log('')
    console.log('📋 Summary:')
    console.log(`   - Configurations: ${defaultConfigs.length}`)
    console.log(`   - Admin user: 1 (admin@cau.edu / admin123)`)
    console.log(`   - Faculty users: ${createdFaculty.length} (password: faculty123)`)
    console.log(`   - Submissions: ${submissionCount}`)
    console.log(`   - Scores: ${createdFaculty.length}`)
    console.log(`   - Penalties: ${penaltyCount}`)
    console.log('')
    console.log('🔐 Login Credentials:')
    console.log('   Admin:   admin@cau.edu / admin123')
    console.log('   Faculty: [email]@cau.edu / faculty123')
    console.log('')
    
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedAll()
