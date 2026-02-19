import Configuration from '../models/Configuration'

const ACADEMIC_YEAR_CONFIG_KEY = 'app.current_academic_year'
const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/

/**
 * Get current academic year from date (format: YYYY-YYYY). Sept–Aug.
 */
export function getCurrentAcademicYearFromDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  if (month >= 9) {
    return `${year}-${year + 1}`
  }
  return `${year - 1}-${year}`
}

/**
 * Get current academic year: admin can override via config key app.current_academic_year (value: YYYY-YYYY).
 * Otherwise uses date-based year. Use this in both admin and faculty services so scores use the same year.
 */
export async function getCurrentAcademicYear(): Promise<string> {
  const config = await Configuration.findOne({ key: ACADEMIC_YEAR_CONFIG_KEY }).lean()
  if (config && typeof config.value === 'string' && ACADEMIC_YEAR_REGEX.test(config.value)) {
    return config.value
  }
  return getCurrentAcademicYearFromDate()
}
