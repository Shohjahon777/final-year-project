import Configuration from '../models/Configuration'
import { ISubmission } from '../models/Submission'
import { IUser } from '../models/User'
import { AppError } from '../middleware/error.middleware'

/**
 * Scoring Service
 *
 * Implements the complete faculty evaluation scoring logic with:
 * - Base points from configuration
 * - Authorship multipliers (first/middle/last/corresponding)
 * - Student co-author bonuses
 * - Expectation multipliers by faculty rank
 * - Category-specific rules
 */
export class ScoringService {
  /**
   * Calculate points for any submission based on category
   */
  async calculatePoints(submission: Partial<ISubmission>, user: IUser): Promise<number> {
    const { category, subcategory } = submission

    if (!category || !subcategory) {
      throw new AppError('Category and subcategory are required', 400)
    }

    switch (category) {
      case 'research':
        return this.calculateResearchPoints(submission, user)
      case 'teaching':
        return this.calculateTeachingPoints(submission, user)
      case 'admin':
        return this.calculateAdminPoints(submission, user)
      case 'outreach':
        return this.calculateOutreachPoints(submission, user)
      default:
        throw new AppError('Invalid category', 400)
    }
  }

  /**
   * Calculate Research & Publications points
   *
   * Handles:
   * - Journal publications (Q1/Q2/Q3/Q4)
   * - Conference papers
   * - Books & chapters
   * - Patents
   * - Research groups
   * - Funding
   *
   * Applies:
   * - Authorship multipliers
   * - Corresponding author bonus
   * - Student co-author bonus
   * - Expectation multipliers by rank
   */
  async calculateResearchPoints(submission: Partial<ISubmission>, user: IUser): Promise<number> {
    const { subcategory, metadata = {} } = submission
    if (!subcategory) throw new AppError('Subcategory is required', 400)
    let points = 0

    // Get base points from configuration
    const configKey = `research.${subcategory}`
    const config = await Configuration.findOne({
      category: 'research',
      key: subcategory
    })

    if (!config) {
      // Default base points if config not found
      const defaults: Record<string, number> = {
        'journal_q1': 14,
        'journal_q2': 10,
        'journal_q3': 6,
        'journal_q4': 4,
        'conference_international': 6,
        'conference_national': 3,
        'book': 8,
        'book_chapter': 4,
        'patent': 10,
        'research_group_initiate': 3,
        'research_group_running': 5,
        'research_group_student_pub': 3,
        'funding_major': 25,
        'funding_minor': 10,
      }
      points = defaults[subcategory] || 0
    } else {
      points = config.value as number
    }

    // Apply authorship multipliers (for papers only)
    if (subcategory.includes('journal') || subcategory.includes('conference')) {
      const authorPosition = metadata.authorPosition as string | undefined

      if (authorPosition === 'first' || authorPosition === 'last') {
        // First or last author gets full points (×1.0)
        points = points * 1.0
      } else if (authorPosition === 'middle') {
        // Middle author gets 70% of points
        points = points * 0.7
      }

      // Corresponding author bonus (×1.2 additional)
      if (metadata.isCorresponding === true) {
        points = points * 1.2
      }

      // Student co-author bonus (×1.1 additional)
      if (metadata.hasStudentCoauthor === true) {
        points = points * 1.1
      }
    }

    // Apply co-PI multiplier for funding
    if (subcategory.includes('funding') && metadata.role === 'co-pi') {
      points = points * 0.3
    }

    // Apply expectation multiplier based on faculty rank
    points = await this.applyExpectationMultiplier(points, user.facultyRank ?? 'Lecturer', 'research')

    return Math.round(points * 100) / 100
  }

  /**
   * Calculate Teaching & Learning points
   *
   * Handles:
   * - Student feedback scores
   * - Course development (new vs existing)
   * - Material uploads
   * - Syllabus creation
   */
  async calculateTeachingPoints(submission: Partial<ISubmission>, user: IUser): Promise<number> {
    const { subcategory, metadata = {} } = submission
    if (!subcategory) throw new AppError('Subcategory is required', 400)
    let points = 0

    // Get base points from configuration
    const config = await Configuration.findOne({
      category: 'teaching',
      key: subcategory
    })

    if (!config) {
      // Default base points
      const defaults: Record<string, number> = {
        'feedback_high': 3,        // 80%+ satisfaction
        'feedback_medium': 1,      // 70-79% satisfaction
        'course_new': 3,           // New course development
        'course_existing': 1,      // Previously taught course
        'materials_upload': 2,     // Upload complete materials
        'syllabus_create': 1,      // Per module
      }
      points = defaults[subcategory] || 0
    } else {
      points = config.value as number
    }

    // For syllabus, multiply by number of modules
    if (subcategory === 'syllabus_create' && metadata.moduleCount) {
      points = points * (metadata.moduleCount as number)
    }

    // Apply expectation multiplier
    points = await this.applyExpectationMultiplier(points, user.facultyRank ?? 'Lecturer', 'teaching')

    return Math.round(points * 100) / 100
  }

  /**
   * Calculate Administrative & Service points
   *
   * Handles:
   * - Major tasks (accreditation, program revision)
   * - Medium tasks (clubs, events)
   * - Minor tasks (committees, reviewing, volunteering)
   */
  async calculateAdminPoints(submission: Partial<ISubmission>, user: IUser): Promise<number> {
    const { subcategory, metadata = {} } = submission
    if (!subcategory) throw new AppError('Subcategory is required', 400)
    let points = 0

    // Get base points from configuration
    const config = await Configuration.findOne({
      category: 'admin',
      key: subcategory
    })

    if (!config) {
      // Default base points
      const defaults: Record<string, number> = {
        'accreditation_leadership': 20,
        'program_revision': 20,
        'club_running': 5,
        'club_initiate': 3,
        'event_large': 4,          // 100+ students
        'event_medium': 1.5,       // 50-99 students
        'exam_review': 3,
        'committee_member': 3,
        'volunteering_per_hour': 0.1,
      }
      points = defaults[subcategory] || 0
    } else {
      points = config.value as number
    }

    // For volunteering, multiply by hours
    if (subcategory === 'volunteering_per_hour' && metadata.hours) {
      points = points * (metadata.hours as number)
    }

    // Apply expectation multiplier
    points = await this.applyExpectationMultiplier(points, user.facultyRank ?? 'Lecturer', 'admin')

    return Math.round(points * 100) / 100
  }

  /**
   * Calculate Community & Outreach points
   *
   * Handles:
   * - Events representing CAU
   * - Public lectures, workshops
   * - School visits, STEM fairs
   */
  async calculateOutreachPoints(submission: Partial<ISubmission>, user: IUser): Promise<number> {
    const { subcategory, metadata = {} } = submission
    if (!subcategory) throw new AppError('Subcategory is required', 400)
    let points = 0

    // Get base points from configuration
    const config = await Configuration.findOne({
      category: 'outreach',
      key: subcategory
    })

    if (!config) {
      // Default base points
      const defaults: Record<string, number> = {
        'event_large': 3,          // ~100 participants
        'event_medium': 2,         // 50-99 participants
        'event_small': 0.5,        // <50 participants
        'workshop': 2,
        'school_visit': 1,
        'stem_fair': 2,
      }
      points = defaults[subcategory] || 0
    } else {
      points = config.value as number
    }

    // Apply expectation multiplier
    points = await this.applyExpectationMultiplier(points, user.facultyRank ?? 'Lecturer', 'outreach')

    return Math.round(points * 100) / 100
  }

  /**
   * Apply expectation multiplier based on faculty rank
   *
   * Expectation levels and multipliers:
   * - Great: ×1.0 (meeting high expectations)
   * - Good: ×1.2 (exceeding good expectations)
   * - Average: ×1.4 (exceeding average expectations)
   * - Below Average: ×1.5 (exceeding low expectations)
   *
   * Rank expectations (from README):
   * - Head: Research=Average, Admin=Great, Teaching=Great
   * - Professor: Research=Great, Admin=Great, Teaching=Good
   * - Associate Professor: Research=Good, Admin=Good, Teaching=Good
   * - Assistant Professor: Research=Average, Admin=Average, Teaching=Great
   * - Lecturer: Research=Below Average, Admin=Average, Teaching=Great
   */
  private async applyExpectationMultiplier(
    points: number,
    rank: string,
    category: 'research' | 'teaching' | 'admin' | 'outreach'
  ): Promise<number> {
    // Expectation profile by rank and category
    const expectations: Record<string, Record<string, 'Great' | 'Good' | 'Average' | 'Below Average'>> = {
      'Head': {
        research: 'Average',
        teaching: 'Great',
        admin: 'Great',
        outreach: 'Average',
      },
      'Professor': {
        research: 'Great',
        teaching: 'Good',
        admin: 'Great',
        outreach: 'Good',
      },
      'Associate Professor': {
        research: 'Good',
        teaching: 'Good',
        admin: 'Good',
        outreach: 'Good',
      },
      'Assistant Professor': {
        research: 'Average',
        teaching: 'Great',
        admin: 'Average',
        outreach: 'Average',
      },
      'Lecturer': {
        research: 'Below Average',
        teaching: 'Great',
        admin: 'Average',
        outreach: 'Below Average',
      },
    }

    // Multiplier values
    const multipliers: Record<string, number> = {
      'Great': 1.0,
      'Good': 1.2,
      'Average': 1.4,
      'Below Average': 1.5,
    }

    const expectation = expectations[rank]?.[category]
    if (!expectation) {
      // Default to no multiplier if rank not found
      return points
    }

    const multiplier = multipliers[expectation] || 1.0

    return points * multiplier
  }

  /**
   * Validate submission metadata based on category and subcategory
   * Returns validation errors if any
   */
  validateMetadata(category: string, subcategory: string, metadata: Record<string, any>): string[] {
    const errors: string[] = []

    if (category === 'research') {
      // Journal and conference papers require authorship info
      if (subcategory.includes('journal') || subcategory.includes('conference')) {
        if (!metadata.authorPosition) {
          errors.push('Author position is required (first, middle, last)')
        }
        if (typeof metadata.isCorresponding !== 'boolean') {
          errors.push('Corresponding author status is required (true/false)')
        }
        if (typeof metadata.hasStudentCoauthor !== 'boolean') {
          errors.push('Student co-author status is required (true/false)')
        }
      }

      // Patents require verification
      if (subcategory === 'patent') {
        if (!metadata.patentNumber) {
          errors.push('Patent number is required')
        }
        if (!metadata.registry) {
          errors.push('Patent registry is required (USPTO, WIPO, EPO, UKIPO)')
        }
      }

      // Funding requires amount
      if (subcategory.includes('funding')) {
        if (!metadata.amount || metadata.amount <= 0) {
          errors.push('Funding amount is required and must be positive')
        }
        if (!metadata.role) {
          errors.push('Role is required (pi or co-pi)')
        }
      }
    }

    if (category === 'teaching') {
      // Syllabus requires module count
      if (subcategory === 'syllabus_create') {
        if (!metadata.moduleCount || metadata.moduleCount <= 0) {
          errors.push('Module count is required and must be positive')
        }
      }
    }

    if (category === 'admin') {
      // Volunteering requires hours
      if (subcategory === 'volunteering_per_hour') {
        if (!metadata.hours || metadata.hours <= 0) {
          errors.push('Hours are required and must be positive')
        }
      }
    }

    return errors
  }
}

// Export singleton instance
export const scoringService = new ScoringService()
