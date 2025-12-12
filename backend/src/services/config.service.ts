import Configuration, { IConfiguration } from '../models/Configuration'
import { AppError } from '../middleware/error.middleware'

/**
 * Get all configurations
 */
export async function getAllConfigurations() {
  const configs = await Configuration.find().sort({ category: 1, key: 1 }).lean()
  
  // Group by category
  const grouped: Record<string, Record<string, any>> = {}
  for (const config of configs) {
    if (!grouped[config.category]) {
      grouped[config.category] = {}
    }
    grouped[config.category][config.key] = {
      value: config.value,
      description: config.description,
      updatedAt: config.updatedAt,
    }
  }
  
  return grouped
}

/**
 * Get configurations by category
 */
export async function getConfigurationsByCategory(category: string) {
  const configs = await Configuration.find({ category }).sort({ key: 1 }).lean()
  
  const result: Record<string, any> = {}
  for (const config of configs) {
    result[config.key] = {
      value: config.value,
      description: config.description,
      updatedAt: config.updatedAt,
    }
  }
  
  return result
}

/**
 * Get a single configuration by key
 */
export async function getConfigurationByKey(key: string) {
  const config = await Configuration.findOne({ key }).lean()
  
  if (!config) {
    throw new AppError(`Configuration "${key}" not found`, 404)
  }
  
  return config
}

/**
 * Update a configuration
 */
export async function updateConfiguration(
  key: string,
  value: number | string | boolean,
  updatedBy: string
) {
  const config = await Configuration.findOneAndUpdate(
    { key },
    {
      value,
      updatedAt: new Date(),
      updatedBy,
    },
    { new: true }
  )
  
  if (!config) {
    throw new AppError(`Configuration "${key}" not found`, 404)
  }
  
  return config
}

/**
 * Create a new configuration (for seeding)
 */
export async function createConfiguration(data: {
  category: string
  key: string
  value: number | string | boolean
  description?: string
}) {
  const existing = await Configuration.findOne({ key: data.key })
  if (existing) {
    throw new AppError(`Configuration "${data.key}" already exists`, 400)
  }
  
  const config = new Configuration({
    category: data.category,
    key: data.key,
    value: data.value,
    description: data.description,
    updatedAt: new Date(),
  })
  
  await config.save()
  return config
}

/**
 * Get rank multipliers
 */
export async function getMultipliers() {
  const configs = await Configuration.find({ category: 'multipliers' }).lean()
  
  const multipliers: Record<string, number> = {}
  for (const config of configs) {
    multipliers[config.key] = config.value as number
  }
  
  return multipliers
}

/**
 * Get category ceilings
 */
export async function getCeilings() {
  const configs = await Configuration.find({ category: 'ceilings' }).lean()
  
  const ceilings: Record<string, number> = {}
  for (const config of configs) {
    ceilings[config.key] = config.value as number
  }
  
  return ceilings
}

/**
 * Get research point values
 */
export async function getResearchPoints() {
  const configs = await Configuration.find({ category: 'research' }).lean()
  
  const points: Record<string, number> = {}
  for (const config of configs) {
    points[config.key] = config.value as number
  }
  
  return points
}

/**
 * Seed default configurations if they don't exist
 */
export async function seedDefaultConfigurations() {
  const defaultConfigs = [
    // Category ceilings
    { category: 'ceilings', key: 'research_ceiling', value: 40, description: 'Maximum research points' },
    { category: 'ceilings', key: 'teaching_ceiling', value: 30, description: 'Maximum teaching points' },
    { category: 'ceilings', key: 'admin_ceiling', value: 20, description: 'Maximum administrative points' },
    { category: 'ceilings', key: 'outreach_ceiling', value: 10, description: 'Maximum outreach points' },
    
    // Research points
    { category: 'research', key: 'journal_q1', value: 14, description: 'Points for Q1 journal publication' },
    { category: 'research', key: 'journal_q2', value: 10, description: 'Points for Q2 journal publication' },
    { category: 'research', key: 'journal_q3', value: 6, description: 'Points for Q3 journal publication' },
    { category: 'research', key: 'journal_q4', value: 4, description: 'Points for Q4 journal publication' },
    { category: 'research', key: 'conference_international', value: 6, description: 'Points for international conference' },
    { category: 'research', key: 'conference_national', value: 3, description: 'Points for national conference' },
    { category: 'research', key: 'book_chapter', value: 4, description: 'Points for book chapter' },
    { category: 'research', key: 'patent', value: 10, description: 'Points for patent' },
    
    // Research multipliers
    { category: 'multipliers', key: 'first_author', value: 1.4, description: 'Multiplier for first author' },
    { category: 'multipliers', key: 'corresponding_author', value: 1.2, description: 'Multiplier for corresponding author' },
    { category: 'multipliers', key: 'student_coauthor', value: 1.1, description: 'Multiplier for student co-author' },
    
    // Rank multipliers
    { category: 'multipliers', key: 'rank_head', value: 1.0, description: 'Multiplier for Head' },
    { category: 'multipliers', key: 'rank_professor', value: 1.1, description: 'Multiplier for Professor' },
    { category: 'multipliers', key: 'rank_associate_professor', value: 1.2, description: 'Multiplier for Associate Professor' },
    { category: 'multipliers', key: 'rank_assistant_professor', value: 1.4, description: 'Multiplier for Assistant Professor' },
    { category: 'multipliers', key: 'rank_lecturer', value: 1.5, description: 'Multiplier for Lecturer' },
    
    // Teaching points
    { category: 'teaching', key: 'feedback_base', value: 2, description: 'Base points for feedback' },
    { category: 'teaching', key: 'feedback_per_point', value: 2, description: 'Points per rating point above 3.0' },
    { category: 'teaching', key: 'new_course', value: 3, description: 'Points for new course development' },
    { category: 'teaching', key: 'syllabus_update', value: 1, description: 'Points for syllabus update' },
    
    // Admin points
    { category: 'admin', key: 'major_task', value: 8, description: 'Points for major administrative task' },
    { category: 'admin', key: 'medium_task', value: 4, description: 'Points for medium administrative task' },
    { category: 'admin', key: 'minor_task', value: 2, description: 'Points for minor administrative task' },
    
    // Outreach points
    { category: 'outreach', key: 'conference_speaker', value: 3, description: 'Points for conference speaking' },
    { category: 'outreach', key: 'workshop', value: 2, description: 'Points for workshop/training' },
    { category: 'outreach', key: 'media', value: 2, description: 'Points for media appearance' },
    { category: 'outreach', key: 'community_event', value: 1, description: 'Points for community event' },
    
    // Penalty points
    { category: 'penalties', key: 'meeting_absence', value: -2, description: 'Penalty for meeting absence' },
    { category: 'penalties', key: 'late_submission', value: -3, description: 'Penalty for late submission' },
    { category: 'penalties', key: 'academic_dishonesty', value: -10, description: 'Penalty for academic dishonesty' },
  ]
  
  for (const config of defaultConfigs) {
    const existing = await Configuration.findOne({ key: config.key })
    if (!existing) {
      await Configuration.create({
        ...config,
        updatedAt: new Date(),
      })
    }
  }
  
  return { message: 'Default configurations seeded' }
}
