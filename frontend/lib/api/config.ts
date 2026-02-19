import apiClient from './client'

const ACADEMIC_YEAR_KEY = 'app.current_academic_year'
const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/

/**
 * Date-based current academic year (Sept–Aug). Used as fallback when config is missing.
 */
function getCurrentAcademicYearFromDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  if (month >= 9) {
    return `${year}-${year + 1}`
  }
  return `${year - 1}-${year}`
}

/**
 * Get current academic year from API (config key app.current_academic_year).
 * Falls back to date-derived value on 404 or invalid response.
 */
export async function getCurrentAcademicYear(): Promise<string> {
  try {
    const response = await apiClient.get<{ success: boolean; data: { value?: unknown } }>(
      `/config/key/${ACADEMIC_YEAR_KEY}`
    )
    const value = response.data?.data?.value
    if (typeof value === 'string' && ACADEMIC_YEAR_REGEX.test(value)) {
      return value
    }
  } catch {
    // 404 or network error: use date-based fallback
  }
  return getCurrentAcademicYearFromDate()
}
