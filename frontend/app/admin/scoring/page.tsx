'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Save,
  RefreshCw,
  FlaskConical,
  GraduationCap,
  Briefcase,
  Globe,
  Calculator,
  AlertTriangle,
} from 'lucide-react'
import { configApi, ConfigData } from '@/lib/api/admin'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

// Mock config data
const mockConfig: ConfigData = {
  ceilings: {
    research_ceiling: { value: 40, description: 'Maximum research points' },
    teaching_ceiling: { value: 30, description: 'Maximum teaching points' },
    admin_ceiling: { value: 20, description: 'Maximum administrative points' },
    outreach_ceiling: { value: 10, description: 'Maximum outreach points' },
  },
  research: {
    journal_q1: { value: 14, description: 'Points for Q1 journal publication' },
    journal_q2: { value: 10, description: 'Points for Q2 journal publication' },
    journal_q3: { value: 6, description: 'Points for Q3 journal publication' },
    journal_q4: { value: 4, description: 'Points for Q4 journal publication' },
    conference_international: { value: 6, description: 'Points for international conference' },
    conference_national: { value: 3, description: 'Points for national conference' },
    book_chapter: { value: 4, description: 'Points for book chapter' },
    patent: { value: 10, description: 'Points for patent' },
  },
  multipliers: {
    first_author: { value: 1.4, description: 'Multiplier for first author' },
    corresponding_author: { value: 1.2, description: 'Multiplier for corresponding author' },
    student_coauthor: { value: 1.1, description: 'Multiplier for student co-author' },
    rank_head: { value: 1.0, description: 'Multiplier for Head' },
    rank_professor: { value: 1.1, description: 'Multiplier for Professor' },
    rank_associate_professor: { value: 1.2, description: 'Multiplier for Associate Professor' },
    rank_assistant_professor: { value: 1.4, description: 'Multiplier for Assistant Professor' },
    rank_lecturer: { value: 1.5, description: 'Multiplier for Lecturer' },
  },
  teaching: {
    feedback_base: { value: 2, description: 'Base points for feedback' },
    feedback_per_point: { value: 2, description: 'Points per rating point above 3.0' },
    new_course: { value: 3, description: 'Points for new course development' },
    syllabus_update: { value: 1, description: 'Points for syllabus update' },
  },
  admin: {
    major_task: { value: 8, description: 'Points for major administrative task' },
    medium_task: { value: 4, description: 'Points for medium administrative task' },
    minor_task: { value: 2, description: 'Points for minor administrative task' },
  },
  outreach: {
    conference_speaker: { value: 3, description: 'Points for conference speaking' },
    workshop: { value: 2, description: 'Points for workshop/training' },
    media: { value: 2, description: 'Points for media appearance' },
    community_event: { value: 1, description: 'Points for community event' },
  },
  penalties: {
    meeting_absence: { value: -2, description: 'Penalty for meeting absence' },
    late_submission: { value: -3, description: 'Penalty for late submission' },
    academic_dishonesty: { value: -10, description: 'Penalty for academic dishonesty' },
  },
}

interface ConfigSection {
  key: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const sections: ConfigSection[] = [
  {
    key: 'ceilings',
    title: 'Category Ceilings',
    description: 'Maximum points per category',
    icon: <Calculator className="h-5 w-5" />,
    color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30',
  },
  {
    key: 'research',
    title: 'Research Points',
    description: 'Points for research activities',
    icon: <FlaskConical className="h-5 w-5" />,
    color: 'text-chart-research bg-chart-research/10',
  },
  {
    key: 'teaching',
    title: 'Teaching Points',
    description: 'Points for teaching activities',
    icon: <GraduationCap className="h-5 w-5" />,
    color: 'text-chart-teaching bg-chart-teaching/10',
  },
  {
    key: 'admin',
    title: 'Administrative Points',
    description: 'Points for administrative tasks',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'text-chart-admin bg-chart-admin/10',
  },
  {
    key: 'outreach',
    title: 'Outreach Points',
    description: 'Points for outreach activities',
    icon: <Globe className="h-5 w-5" />,
    color: 'text-chart-outreach bg-chart-outreach/10',
  },
  {
    key: 'multipliers',
    title: 'Multipliers',
    description: 'Point multipliers for authorship and rank',
    icon: <Calculator className="h-5 w-5" />,
    color: 'text-success-600 bg-success-100 dark:bg-success-900/30',
  },
  {
    key: 'penalties',
    title: 'Penalty Values',
    description: 'Default penalty point deductions',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-danger-600 bg-danger-100 dark:bg-danger-900/30',
  },
]

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AdminScoringPage() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changes, setChanges] = useState<Record<string, number | string>>({})
  const { success, error: showError } = useToast()

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const data = await configApi.getAll()
      setConfig(data)
    } catch (err) {
      // Use mock data
      setConfig(mockConfig)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleChange = (key: string, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      setChanges((prev) => ({ ...prev, [key]: numValue }))
    }
  }

  const getValue = (key: string, category: string): number | string => {
    if (changes[key] !== undefined) return changes[key]
    if (config?.[category]?.[key]) return config[category][key].value
    return ''
  }

  const hasChanges = Object.keys(changes).length > 0

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(changes)) {
        await configApi.update(key, value)
      }
      success('Settings Saved', 'Scoring rules have been updated successfully')
      setChanges({})
      fetchConfig()
    } catch (err) {
      showError('Save Failed', 'Could not save the scoring rules. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setChanges({})
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Scoring Rules</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure point values and multipliers for faculty evaluation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning-600" />
          <p className="text-sm text-warning-700 dark:text-warning-400">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </div>
      )}

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', section.color)}>
                  {section.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config?.[section.key] &&
                  Object.entries(config[section.key]).map(([key, configValue]) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatKey(key)}
                        </p>
                        {configValue.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {configValue.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step={section.key === 'multipliers' ? '0.1' : '1'}
                          value={getValue(key, section.key)}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className={cn(
                            'w-24 text-right',
                            changes[key] !== undefined && 'border-warning-500 bg-warning-50 dark:bg-warning-900/20'
                          )}
                        />
                        {section.key === 'multipliers' ? (
                          <span className="text-sm text-gray-500 w-8">×</span>
                        ) : (
                          <span className="text-sm text-gray-500 w-8">pts</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Calculator className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-50">How Scoring Works</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Faculty scores are calculated by summing points from approved submissions in each category
                (Research, Teaching, Administrative, Outreach). Each category has a maximum ceiling.
                Multipliers are applied based on authorship position and faculty rank. Penalties are
                deducted from the total score. The final score determines the faculty member's outcome.
              </p>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Outstanding</p>
                  <p className="font-semibold text-success-600">≥ 80 points</p>
                </div>
                <div>
                  <p className="text-gray-500">Satisfactory</p>
                  <p className="font-semibold text-primary-600">60-79 points</p>
                </div>
                <div>
                  <p className="text-gray-500">Improvement Plan</p>
                  <p className="font-semibold text-warning-600">40-59 points</p>
                </div>
                <div>
                  <p className="text-gray-500">Contract Risk</p>
                  <p className="font-semibold text-danger-600">&lt; 40 points</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
