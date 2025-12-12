import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Configuration from '../models/Configuration'
import { connectDB } from '../utils/db'

dotenv.config()

const defaultConfigs = [
  // Research base points
  { category: 'research', key: 'q1_base_points', value: 10, description: 'Base points for Q1 journal publication' },
  { category: 'research', key: 'q2_base_points', value: 8, description: 'Base points for Q2 journal publication' },
  { category: 'research', key: 'q3_base_points', value: 6, description: 'Base points for Q3 journal publication' },
  { category: 'research', key: 'q4_base_points', value: 4, description: 'Base points for Q4 journal publication' },
  { category: 'research', key: 'conference_base_points', value: 3, description: 'Base points for conference publication' },
  { category: 'research', key: 'book_base_points', value: 8, description: 'Base points for book publication' },
  { category: 'research', key: 'book_chapter_base_points', value: 2, description: 'Base points for book chapter' },
  { category: 'research', key: 'patent_base_points', value: 15, description: 'Base points for verified patent' },
  { category: 'research', key: 'research_group_initiate', value: 3, description: 'Points for initiating research group' },
  { category: 'research', key: 'research_group_running', value: 5, description: 'Points for running research group per semester' },
  { category: 'research', key: 'student_publication_bonus', value: 3, description: 'Bonus points when student publishes as 1st author' },
  { category: 'research', key: 'funding_large', value: 25, description: 'Points for funding > $20,000 as PI' },
  { category: 'research', key: 'funding_small', value: 10, description: 'Points for funding < $20,000 as PI' },
  { category: 'research', key: 'funding_co_pi_multiplier', value: 0.3, description: 'Multiplier for Co-PI funding' },
  
  // Research multipliers
  { category: 'research', key: 'middle_author_multiplier', value: 0.7, description: 'Multiplier for middle author position' },
  { category: 'research', key: 'corresponding_multiplier', value: 1.1, description: 'Multiplier for corresponding author' },
  { category: 'research', key: 'student_coauthor_multiplier', value: 1.1, description: 'Multiplier when student is co-author' },
  
  // Teaching points
  { category: 'teaching', key: 'feedback_excellent', value: 3, description: 'Points for 80%+ student satisfaction' },
  { category: 'teaching', key: 'feedback_good', value: 1, description: 'Points for 70-79% student satisfaction' },
  { category: 'teaching', key: 'feedback_poor_penalty', value: -2, description: 'Penalty for <60% student satisfaction' },
  { category: 'teaching', key: 'course_prep_previous', value: 1, description: 'Points for previously taught course' },
  { category: 'teaching', key: 'course_prep_new', value: 2.5, description: 'Points for new course' },
  { category: 'teaching', key: 'materials_upload', value: 2, description: 'Points per course for complete materials upload' },
  { category: 'teaching', key: 'syllabus_per_module', value: 1, description: 'Points per module for syllabus creation' },
  { category: 'teaching', key: 'syllabus_missing_checkpoint', value: -0.5, description: 'Penalty per missing checkpoint' },
  { category: 'teaching', key: 'failure_rate_penalty', value: -2, description: 'Penalty if >40% students fail' },
  
  // Admin/Service points
  { category: 'admin', key: 'major_task_accreditation', value: 20, description: 'Points for accreditation leadership' },
  { category: 'admin', key: 'major_task_program_revision', value: 20, description: 'Points for program revision committee' },
  { category: 'admin', key: 'medium_club_running', value: 5, description: 'Points per semester for running a club' },
  { category: 'admin', key: 'medium_club_initiate', value: 3, description: 'Points for initiating a club' },
  { category: 'admin', key: 'medium_event_large', value: 4, description: 'Points for event with 100+ students' },
  { category: 'admin', key: 'medium_event_medium', value: 1.5, description: 'Points for event with 50-99 students' },
  { category: 'admin', key: 'minor_exam_review', value: 3, description: 'Points per semester for reviewing exam questions' },
  { category: 'admin', key: 'minor_committee', value: 3, description: 'Base points for committee membership (3-5 range)' },
  { category: 'admin', key: 'minor_volunteering', value: 0.1, description: 'Points per hour for volunteering' },
  
  // Outreach points
  { category: 'outreach', key: 'event_large', value: 3, description: 'Points for event with ~100 participants' },
  { category: 'outreach', key: 'event_small', value: 0.5, description: 'Base points for smaller events (0.5-2 range)' },
  
  // Category ceilings
  { category: 'system', key: 'research_ceiling', value: 40, description: 'Maximum points for research category' },
  { category: 'system', key: 'teaching_ceiling', value: 30, description: 'Maximum points for teaching category' },
  { category: 'system', key: 'admin_ceiling', value: 20, description: 'Maximum points for admin category' },
  { category: 'system', key: 'outreach_ceiling', value: 10, description: 'Maximum points for outreach category' },
  
  // Outcome thresholds
  { category: 'system', key: 'outstanding_threshold', value: 80, description: 'Minimum score for outstanding outcome' },
  { category: 'system', key: 'satisfactory_threshold', value: 60, description: 'Minimum score for satisfactory outcome' },
  { category: 'system', key: 'improvement_plan_threshold', value: 50, description: 'Minimum score for improvement plan outcome' },
  
  // Expectation multipliers by rank
  { category: 'multipliers', key: 'head_research', value: 1.4, description: 'Research multiplier for Head (Average expectation)' },
  { category: 'multipliers', key: 'head_admin', value: 1.0, description: 'Admin multiplier for Head (Great expectation)' },
  { category: 'multipliers', key: 'head_student', value: 1.0, description: 'Student satisfaction multiplier for Head (Great expectation)' },
  
  { category: 'multipliers', key: 'professor_research', value: 1.0, description: 'Research multiplier for Professor (Great expectation)' },
  { category: 'multipliers', key: 'professor_admin', value: 1.0, description: 'Admin multiplier for Professor (Great expectation)' },
  { category: 'multipliers', key: 'professor_student', value: 1.2, description: 'Student satisfaction multiplier for Professor (Good expectation)' },
  
  { category: 'multipliers', key: 'associate_research', value: 1.2, description: 'Research multiplier for Associate Professor (Good expectation)' },
  { category: 'multipliers', key: 'associate_admin', value: 1.2, description: 'Admin multiplier for Associate Professor (Good expectation)' },
  { category: 'multipliers', key: 'associate_student', value: 1.2, description: 'Student satisfaction multiplier for Associate Professor (Good expectation)' },
  
  { category: 'multipliers', key: 'assistant_research', value: 1.4, description: 'Research multiplier for Assistant Professor (Average expectation)' },
  { category: 'multipliers', key: 'assistant_admin', value: 1.4, description: 'Admin multiplier for Assistant Professor (Average expectation)' },
  { category: 'multipliers', key: 'assistant_student', value: 1.0, description: 'Student satisfaction multiplier for Assistant Professor (Great expectation)' },
  
  { category: 'multipliers', key: 'lecturer_research', value: 1.5, description: 'Research multiplier for Lecturer (Below Average expectation)' },
  { category: 'multipliers', key: 'lecturer_admin', value: 1.4, description: 'Admin multiplier for Lecturer (Average expectation)' },
  { category: 'multipliers', key: 'lecturer_student', value: 1.0, description: 'Student satisfaction multiplier for Lecturer (Great expectation)' },
]

async function seedConfigurations() {
  try {
    await connectDB()
    
    console.log('🌱 Seeding default configurations...')
    
    for (const config of defaultConfigs) {
      await Configuration.findOneAndUpdate(
        { key: config.key },
        config,
        { upsert: true, new: true }
      )
    }
    
    console.log(`✅ Seeded ${defaultConfigs.length} configurations`)
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding configurations:', error)
    process.exit(1)
  }
}

seedConfigurations()
