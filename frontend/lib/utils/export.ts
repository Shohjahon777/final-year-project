/**
 * Export Utilities
 * Functions for exporting data to various formats
 */

/**
 * Export array of objects to CSV
 */
export function exportToCSV(data: any[], filename: string, columns?: { key: string; label: string }[]) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  // Determine columns
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }))

  // Create CSV header
  const header = cols.map(col => `"${col.label}"`).join(',')

  // Create CSV rows
  const rows = data.map(item =>
    cols
      .map(col => {
        const value = getNestedValue(item, col.key)
        // Escape quotes and wrap in quotes
        const escaped = String(value ?? '').replace(/"/g, '""')
        return `"${escaped}"`
      })
      .join(',')
  )

  // Combine header and rows
  const csv = [header, ...rows].join('\n')

  // Create and download file
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

/**
 * Export to Excel-compatible CSV (with UTF-8 BOM)
 */
export function exportToExcel(data: any[], filename: string, columns?: { key: string; label: string }[]) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  // Determine columns
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }))

  // Create CSV with UTF-8 BOM for Excel compatibility
  const header = cols.map(col => `"${col.label}"`).join(',')
  const rows = data.map(item =>
    cols
      .map(col => {
        const value = getNestedValue(item, col.key)
        const escaped = String(value ?? '').replace(/"/g, '""')
        return `"${escaped}"`
      })
      .join(',')
  )

  const csv = '\uFEFF' + [header, ...rows].join('\n') // UTF-8 BOM

  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

/**
 * Export to JSON
 */
export function exportToJSON(data: any[], filename: string) {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, `${filename}.json`, 'application/json')
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

/**
 * Get nested object value by dot notation path
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Format date for export
 */
export function formatExportDate(date: string | Date): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Flatten nested objects for export
 */
export function flattenForExport(obj: any, prefix = ''): any {
  const flattened: any = {}

  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
      Object.assign(flattened, flattenForExport(obj[key], prefix + key + '.'))
    } else {
      flattened[prefix + key] = obj[key]
    }
  }

  return flattened
}
