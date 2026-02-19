'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FileImageUpload } from '@/components/ui/file-image-upload'
import { cn } from '@/lib/utils'
import apiClient from '@/lib/api/client'
import { facultyApi } from '@/lib/api/faculty'
import { 
  ArrowLeft, 
  BookOpen, 
  Calculator,
  FileText, 
  Info,
  Link as LinkIcon,
  Megaphone,
  Upload,
} from 'lucide-react'

// Professors self-submit only Research and Outreach; Teaching and Administrative are evaluated by the department.
type Category = 'research' | 'outreach'
type EvidenceType = 'link' | 'file' | 'text'

// Point calculation rules (simplified for demo)
const pointRules = {
  research: {
    journal: { Q1: 14, Q2: 10, Q3: 6, Q4: 4 },
    conference: { international: 6, national: 3 },
    multipliers: {
      firstAuthor: 1.4,
      corresponding: 1.2,
      studentCoAuthor: 1.1,
    }
  },
  teaching: {
    feedback: { base: 2, perPoint: 2 }, // 2 points per rating point above 3.0
  },
  admin: {
    major: 8,
    medium: 4,
    minor: 2,
  },
  outreach: {
    event: 3,
    workshop: 2,
    seminar: 2,
  }
}

const categoryConfig: Record<Category, { icon: typeof BookOpen; label: string; maxPoints: number }> = {
  research: { icon: BookOpen, label: 'Research', maxPoints: 40 },
  outreach: { icon: Megaphone, label: 'Outreach', maxPoints: 10 },
}

const ALLOWED_CATEGORIES: Category[] = ['research', 'outreach']

function NewSubmissionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const initialCategory = searchParams.get('category') as Category | null
  const [category, setCategory] = useState<Category>(
    initialCategory && ALLOWED_CATEGORIES.includes(initialCategory) ? initialCategory : 'research'
  )
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subcategory: '',
    evidenceType: 'link' as EvidenceType,
    evidenceValue: '',
    metadata: {} as Record<string, any>,
  })
  const [uploadError, setUploadError] = useState('')

  // Redirect invalid category (teaching/admin) to research
  useEffect(() => {
    const q = searchParams.get('category') as Category | null
    if (q && !ALLOWED_CATEGORIES.includes(q)) {
      router.replace('/dashboard/submissions/new?category=research')
    }
  }, [searchParams, router])

  useEffect(() => {
    setFormData({
      title: '',
      description: '',
      subcategory: '',
      evidenceType: 'link',
      evidenceValue: '',
      metadata: {},
    })
  }, [category])

  // Calculate points based on form data
  const calculatedPoints = useMemo(() => {
    let base = 0
    let multiplier = 1
    const breakdown: { label: string; value: number }[] = []

    if (category === 'research') {
      const tier = formData.metadata.journalTier
      if (tier && pointRules.research.journal[tier as keyof typeof pointRules.research.journal]) {
        base = pointRules.research.journal[tier as keyof typeof pointRules.research.journal]
        breakdown.push({ label: `${tier} Publication`, value: base })
      } else if (tier && pointRules.research.conference[tier as keyof typeof pointRules.research.conference]) {
        base = pointRules.research.conference[tier as keyof typeof pointRules.research.conference]
        breakdown.push({ label: `${tier} Conference`, value: base })
      }

      if (formData.metadata.authorPosition === '1st') {
        multiplier *= pointRules.research.multipliers.firstAuthor
        breakdown.push({ label: 'First Author', value: pointRules.research.multipliers.firstAuthor })
      }
      if (formData.metadata.isCorresponding) {
        multiplier *= pointRules.research.multipliers.corresponding
        breakdown.push({ label: 'Corresponding', value: pointRules.research.multipliers.corresponding })
      }
      if (formData.metadata.hasStudentCoAuthor) {
        multiplier *= pointRules.research.multipliers.studentCoAuthor
        breakdown.push({ label: 'Student Co-author', value: pointRules.research.multipliers.studentCoAuthor })
      }
    } else if (category === 'outreach') {
      base = 3 // Default outreach points
      breakdown.push({ label: 'Outreach Activity', value: base })
    }

    return {
      base,
      multiplier,
      total: base * multiplier,
      breakdown,
    }
  }, [category, formData.metadata])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.evidenceType === 'file' && !formData.evidenceValue) {
      setUploadError('Please upload a file first.')
      return
    }
    setLoading(true)
    setUploadError('')
    try {
      const subcategory =
        formData.subcategory ||
        (category === 'research' ? (formData.metadata.journalTier as string) || 'journal' : 'outreach')
      await facultyApi.createSubmission({
        category,
        subcategory,
        title: formData.title,
        description: formData.description || undefined,
        evidence: { type: formData.evidenceType, value: formData.evidenceValue },
        metadata: Object.keys(formData.metadata).length ? formData.metadata : undefined,
      })
      router.push('/dashboard/submissions')
    } catch (err: any) {
      setUploadError(err.response?.data?.message ?? 'Failed to create submission')
    } finally {
      setLoading(false)
    }
  }

  const updateMetadata = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }))
  }

  const handleUpload = async (file: File): Promise<string> => {
    setUploadError('')
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    const res = await apiClient.post<{ url: string }>('/upload', formDataUpload)
    const url = res.data.url
    setFormData((prev) => ({ ...prev, evidenceValue: url }))
    return url
  }

  const clearFile = () => {
    setFormData((prev) => ({ ...prev, evidenceValue: '' }))
    setUploadError('')
  }

  const renderCategoryFields = () => {
    switch (category) {
      case 'research':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Publication Type <span className="text-danger-500">*</span>
              </label>
              <select
                value={formData.metadata.journalTier || ''}
                onChange={(e) => updateMetadata('journalTier', e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                required
              >
                <option value="">Select type</option>
                <optgroup label="Journal Articles">
                  <option value="Q1">Q1 Journal (Highest Impact)</option>
                  <option value="Q2">Q2 Journal</option>
                  <option value="Q3">Q3 Journal</option>
                  <option value="Q4">Q4 Journal</option>
                </optgroup>
                <optgroup label="Conference Papers">
                <option value="international">International Conference</option>
                <option value="national">National Conference</option>
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Authorship Position <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['1st', '2nd', '3rd', 'co-author'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => updateMetadata('authorPosition', pos)}
                className={cn(
                      "py-2 px-3 text-sm rounded-md border transition-colors",
                      formData.metadata.authorPosition === pos
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                        : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
                )}
              >
                    {pos === 'co-author' ? 'Co-Author' : `${pos} Author`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.metadata.isCorresponding || false}
                  onChange={(e) => updateMetadata('isCorresponding', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Corresponding Author</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.metadata.hasStudentCoAuthor || false}
                  onChange={(e) => updateMetadata('hasStudentCoAuthor', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Student Co-Author</span>
              </label>
            </div>
          </div>
        )

      case 'outreach':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Activity Type <span className="text-danger-500">*</span>
              </label>
              <select
                value={formData.metadata.eventType || ''}
                onChange={(e) => updateMetadata('eventType', e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                required
              >
                <option value="">Select activity type</option>
                <option value="conference">Conference Presentation</option>
                <option value="workshop">Workshop/Training</option>
                <option value="seminar">Seminar/Lecture</option>
                <option value="media">Media Appearance</option>
                <option value="community">Community Event</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Audience Size (Approx.)
              </label>
              <Input
                type="number"
                value={formData.metadata.audienceSize || ''}
                onChange={(e) => updateMetadata('audienceSize', e.target.value === '' ? undefined : parseInt(e.target.value))}
                placeholder="e.g., 200"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const config = categoryConfig[category]
  const CategoryIcon = config.icon

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              New Submission
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Submit a new activity for evaluation
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection - Research and Outreach only; Teaching and Administrative are evaluated by the department */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="mb-4 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800 text-sm text-primary-800 dark:text-primary-200">
              Teaching and Administrative criteria are evaluated by your department and will appear in your score overview.
            </div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider">
              Category
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {(Object.entries(categoryConfig) as [Category, typeof categoryConfig.research][]).map(([key, cfg]) => {
                const Icon = cfg.icon
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left",
                      category === key
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 mb-2",
                      category === key ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"
                    )} />
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-50">{cfg.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Max {cfg.maxPoints} pts</div>
                  </button>
                )
              })}
              </div>
              </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider">
                  Basic Information
                </h2>
                <div className="space-y-4">
              <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Title <span className="text-danger-500">*</span>
                    </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter submission title"
                  required
                />
              </div>

              <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Description
                    </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[100px] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Provide additional details about your submission"
                />
              </div>
                </div>
              </div>

          {/* Category-Specific Fields */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider">
                  {config.label} Details
                </h2>
                {renderCategoryFields()}
              </div>

          {/* Evidence */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider">
                  Evidence
                </h2>
                <div className="space-y-4">
              <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Evidence Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'link', label: 'Link/URL', icon: LinkIcon },
                        { value: 'file', label: 'File', icon: Upload },
                        { value: 'text', label: 'Description', icon: FileText },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, evidenceType: opt.value as EvidenceType })}
                  className={cn(
                            "py-2 px-3 text-sm rounded-md border transition-colors flex items-center justify-center gap-2",
                            formData.evidenceType === opt.value
                              ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                              : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
                  )}
                >
                          <opt.icon className="h-4 w-4" />
                          {opt.label}
                        </button>
                      ))}
                    </div>
              </div>

              <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      {formData.evidenceType === 'link' ? 'URL' : formData.evidenceType === 'file' ? 'File' : 'Description'}
                      <span className="text-danger-500"> *</span>
                </label>
                {uploadError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">{uploadError}</p>
                )}
                {formData.evidenceType === 'text' ? (
                  <textarea
                    value={formData.evidenceValue}
                        onChange={(e) => setFormData({ ...formData, evidenceValue: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[80px] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:focus:border-primary-400 dark:focus:ring-primary-400/20"
                    placeholder="Describe your evidence"
                    required
                  />
                ) : formData.evidenceType === 'file' ? (
                  <FileImageUpload
                    value={formData.evidenceValue}
                    onUpload={handleUpload}
                    onClear={clearFile}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                    maxSizeMB={10}
                    disabled={loading}
                    error={uploadError}
                    valueImageBaseUrl={process.env.NEXT_PUBLIC_API_URL}
                    aria-label="Upload file or image as evidence"
                  />
                ) : (
                  <Input
                    type="url"
                    value={formData.evidenceValue}
                    onChange={(e) => setFormData({ ...formData, evidenceValue: e.target.value })}
                    placeholder="https://doi.org/..."
                    required
                  />
                )}
              </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Points Preview and Actions (stacked, no overlap) */}
            <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-900/30 rounded-lg p-6 shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                    Points Preview
                  </h3>
                </div>

                <div className="text-center mb-4">
                  <div className="text-4xl font-bold font-mono text-primary-700 dark:text-primary-300">
                    {calculatedPoints.total.toFixed(2)}
                  </div>
                  <div className="text-sm text-primary-600 dark:text-primary-400">Estimated Points</div>
                </div>

                {calculatedPoints.breakdown.length > 0 && (
                  <div className="border-t border-primary-200 dark:border-primary-900/30 pt-4 mt-4">
                    <div className="text-xs font-medium text-primary-800 dark:text-primary-200 uppercase mb-2">
                      Breakdown
                    </div>
                    <div className="space-y-2">
                      {calculatedPoints.breakdown.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-primary-700 dark:text-primary-300">{item.label}</span>
                          <span className="font-mono text-primary-900 dark:text-primary-100">
                            {typeof item.value === 'number' && item.value < 2 ? `×${item.value}` : item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-primary-200 dark:border-primary-900/30 pt-4 mt-4">
                  <div className="flex items-start gap-2 text-xs text-primary-700 dark:text-primary-300">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Final points may vary based on administrator review and verification.</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shrink-0">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => router.back()} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default function NewSubmissionPage() {
  return (
    <ProtectedRoute>
      <NewSubmissionContent />
    </ProtectedRoute>
  )
}
