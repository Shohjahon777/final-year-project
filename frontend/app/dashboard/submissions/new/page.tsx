'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, 
  BookOpen, 
  Briefcase, 
  Calculator,
  FileText, 
  GraduationCap, 
  Info,
  Link as LinkIcon,
  Megaphone,
  Upload
} from 'lucide-react'

type Category = 'research' | 'teaching' | 'admin' | 'outreach'
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

const categoryConfig = {
  research: { icon: BookOpen, label: 'Research', maxPoints: 40 },
  teaching: { icon: GraduationCap, label: 'Teaching', maxPoints: 30 },
  admin: { icon: Briefcase, label: 'Administrative', maxPoints: 20 },
  outreach: { icon: Megaphone, label: 'Outreach', maxPoints: 10 },
}

function NewSubmissionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<Category>(
    (searchParams.get('category') as Category) || 'research'
  )
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subcategory: '',
    evidenceType: 'link' as EvidenceType,
    evidenceValue: '',
    metadata: {} as Record<string, any>,
  })

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
    } else if (category === 'teaching') {
      const rating = formData.metadata.averageRating || 0
      if (rating > 3) {
        base = pointRules.teaching.feedback.base + (rating - 3) * pointRules.teaching.feedback.perPoint
        breakdown.push({ label: `Rating ${rating}/5.0`, value: base })
      }
    } else if (category === 'admin') {
      const taskType = formData.metadata.taskType as keyof typeof pointRules.admin
      if (taskType && pointRules.admin[taskType]) {
        base = pointRules.admin[taskType]
        breakdown.push({ label: `${taskType} Task`, value: base })
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
    setLoading(true)
    setTimeout(() => {
      console.log('Submission data:', { category, ...formData, calculatedPoints: calculatedPoints.total })
      setLoading(false)
      router.push('/dashboard/submissions')
    }, 1000)
  }

  const updateMetadata = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }))
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
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Corresponding Author</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.metadata.hasStudentCoAuthor || false}
                  onChange={(e) => updateMetadata('hasStudentCoAuthor', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Student Co-Author</span>
              </label>
            </div>
          </div>
        )

      case 'teaching':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Average Rating <span className="text-danger-500">*</span>
                </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.metadata.averageRating || ''}
                onChange={(e) => updateMetadata('averageRating', parseFloat(e.target.value))}
                placeholder="e.g., 4.5"
              />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Total Responses
                </label>
              <Input
                type="number"
                value={formData.metadata.totalResponses || ''}
                onChange={(e) => updateMetadata('totalResponses', parseInt(e.target.value))}
                placeholder="e.g., 45"
              />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Semester/Term
              </label>
              <Input
                value={formData.metadata.semester || ''}
                onChange={(e) => updateMetadata('semester', e.target.value)}
                placeholder="e.g., Fall 2024"
              />
            </div>
          </div>
        )

      case 'admin':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Task Complexity <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'major', label: 'Major', desc: '8 points', example: 'e.g., Accreditation' },
                  { value: 'medium', label: 'Medium', desc: '4 points', example: 'e.g., Committee Chair' },
                  { value: 'minor', label: 'Minor', desc: '2 points', example: 'e.g., Event Support' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateMetadata('taskType', opt.value)}
                className={cn(
                      "p-3 text-left rounded-md border transition-colors",
                      formData.metadata.taskType === opt.value
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-300 hover:border-gray-400 dark:border-gray-700"
                )}
              >
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-50">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                    <div className="text-xs text-gray-400 mt-1">{opt.example}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Duration
              </label>
              <Input
                value={formData.metadata.duration || ''}
                onChange={(e) => updateMetadata('duration', e.target.value)}
                placeholder="e.g., 6 months"
              />
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
                onChange={(e) => updateMetadata('audienceSize', parseInt(e.target.value))}
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
          {/* Category Selection */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider">
              Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                      category === key ? "text-primary-600" : "text-gray-400"
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
                              : "border-gray-300 hover:border-gray-400 dark:border-gray-700"
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
                {formData.evidenceType === 'text' ? (
                  <textarea
                    value={formData.evidenceValue}
                        onChange={(e) => setFormData({ ...formData, evidenceValue: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[80px] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Describe your evidence"
                    required
                  />
                ) : (
                  <Input
                    type={formData.evidenceType === 'link' ? 'url' : 'text'}
                    value={formData.evidenceValue}
                        onChange={(e) => setFormData({ ...formData, evidenceValue: e.target.value })}
                        placeholder={formData.evidenceType === 'link' ? 'https://doi.org/...' : 'Select file...'}
                    required
                  />
                )}
              </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Points Calculator */}
            <div className="space-y-6">
              <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-900/30 rounded-lg p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-primary-600" />
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

              {/* Submit Actions */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
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
