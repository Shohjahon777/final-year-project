'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Save,
  RefreshCw,
  FlaskConical,
  GraduationCap,
  Briefcase,
  Globe,
  AlertTriangle,
  Gauge,
  TrendingUp,
  Database,
} from 'lucide-react'
import { configApi, ConfigData } from '@/lib/api/admin'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

// Tabs — Ceilings has its own section above; Multipliers removed (ceilings already represent category weights)
const TABS = [
  { id: 'research',  label: 'Research',  icon: FlaskConical },
  { id: 'teaching',  label: 'Teaching',  icon: GraduationCap },
  { id: 'admin',     label: 'Admin',     icon: Briefcase },
  { id: 'outreach',  label: 'Outreach',  icon: Globe },
  { id: 'penalties', label: 'Penalties', icon: AlertTriangle },
] as const

const CEILING_KEYS = ['research_ceiling', 'teaching_ceiling', 'admin_ceiling', 'outreach_ceiling'] as const
const CEILING_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  research_ceiling: { label: 'Research', color: 'blue',   icon: <FlaskConical className="h-4 w-4" /> },
  teaching_ceiling: { label: 'Teaching', color: 'violet', icon: <GraduationCap className="h-4 w-4" /> },
  admin_ceiling:    { label: 'Admin',    color: 'slate',  icon: <Briefcase className="h-4 w-4" /> },
  outreach_ceiling: { label: 'Outreach', color: 'amber',  icon: <Globe className="h-4 w-4" /> },
}

const MAX_CEILING_DISPLAY = 50

function formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const colorStyles: Record<string, {
  border: string; bg: string; text: string; iconBg: string; trackBg: string
}> = {
  blue:   { border: 'border-blue-200 dark:border-blue-500/20',   bg: 'bg-blue-50 dark:bg-blue-950/25',   text: 'text-blue-600 dark:text-blue-400',   iconBg: 'bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',   trackBg: 'text-blue-200 dark:text-slate-800/50' },
  violet: { border: 'border-violet-200 dark:border-violet-500/20', bg: 'bg-violet-50 dark:bg-violet-950/25', text: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-100 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20', trackBg: 'text-violet-200 dark:text-slate-800/50' },
  slate:  { border: 'border-gray-200 dark:border-slate-500/20',   bg: 'bg-gray-50 dark:bg-gray-800/50',   text: 'text-gray-600 dark:text-slate-400',   iconBg: 'bg-gray-100 dark:bg-slate-500/10 border-gray-200 dark:border-slate-500/20',   trackBg: 'text-gray-300 dark:text-slate-800/50' },
  amber:  { border: 'border-amber-200 dark:border-amber-500/20',  bg: 'bg-amber-50 dark:bg-amber-950/25',  text: 'text-amber-600 dark:text-amber-400',  iconBg: 'bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',  trackBg: 'text-amber-200 dark:text-slate-800/50' },
}

// Friendly description for each tab when data is not yet seeded
const TAB_DESCRIPTIONS: Record<string, string> = {
  research:  'Points awarded per publication type (journals, conferences, patents)',
  teaching:  'Points awarded for teaching activities and student feedback',
  admin:     'Points awarded for administrative responsibilities',
  outreach:  'Points awarded for community and industry engagement',
  penalties: 'Default point deductions applied per penalty type',
}

export default function AdminScoringPage() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('research')
  const [changes, setChanges] = useState<Record<string, number | string>>({})
  const { success, error: showError } = useToast()

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const data = await configApi.getAll()
      setConfig(data)
    } catch {
      showError('Load failed', 'Could not fetch scoring configuration from server.')
      setConfig({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConfig() }, [])

  const handleChange = (key: string, value: string) => {
    if (value === '') {
      setChanges(prev => ({ ...prev, [key]: '' }))
    } else {
      const num = parseFloat(value)
      if (!isNaN(num)) setChanges(prev => ({ ...prev, [key]: num }))
    }
  }

  const getValue = (key: string, category: string): number | string => {
    if (changes[key] !== undefined) return changes[key]
    const val = config?.[category]?.[key]?.value
    if (val === undefined || val === null) return ''
    if (typeof val === 'boolean') return val ? '1' : '0'
    return val as number | string
  }

  const hasChanges = Object.keys(changes).length > 0

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(changes).map(([key, value]) => configApi.update(key, value as number))
      )
      success('Settings Saved', 'Scoring rules have been updated successfully.')
      setChanges({})
      fetchConfig()
    } catch {
      showError('Save Failed', 'Could not save scoring rules. Try initializing defaults first.')
    } finally {
      setSaving(false)
    }
  }

  const handleSeedDefaults = async () => {
    setSeeding(true)
    try {
      await configApi.seedDefaults()
      success('Defaults Initialized', 'All scoring configurations have been seeded with default values.')
      setChanges({})
      fetchConfig()
    } catch {
      showError('Seed Failed', 'Could not initialize default configurations.')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  const ceilingValues = CEILING_KEYS.map(k => ({
    key: k,
    value: Number(getValue(k, 'ceilings')) || 0,
    ...CEILING_META[k],
  }))

  const activeTabData = config?.[activeTab]
  const isTabEmpty = !activeTabData || Object.keys(activeTabData).length === 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Control Panel</h1>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wide font-medium mt-0.5">
            Scoring Configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Initialize defaults button — shown when any tab is empty */}
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            title="Seed all scoring rules with default values"
            className="h-8 px-3 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800/50 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5"
          >
            {seeding ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            ) : (
              <Database className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            {seeding ? 'Seeding…' : 'Init Defaults'}
          </button>
          <button
            onClick={() => setChanges({})}
            disabled={!hasChanges}
            className="h-8 px-3 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="h-8 px-3 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-400/30 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Unsaved changes warning */}
      {hasChanges && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-gradient-to-r dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-300 dark:border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            {Object.keys(changes).length} unsaved change{Object.keys(changes).length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Category Ceilings — standalone section (no duplicate tab) */}
      <section className="rounded-xl border border-gray-200 dark:border-slate-800/50 bg-white dark:bg-gray-900/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
            <Gauge className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Category Ceilings</h2>
          <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-medium">Max 100 pts total</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {ceilingValues.map(({ key, value, label, color, icon }) => {
            const percentage = Math.min(100, (value / MAX_CEILING_DISPLAY) * 100)
            const circumference = 2 * Math.PI * 20
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
            const cs = colorStyles[color] || colorStyles.blue

            return (
              <div key={key} className={cn('relative rounded-lg border p-2.5 overflow-hidden', cs.border, cs.bg)}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={cn('h-5 w-5 rounded border flex items-center justify-center', cs.iconBg)}>
                    <span className={cs.text}>{icon}</span>
                  </div>
                  <span className={cn('text-[10px] font-medium uppercase tracking-wide', cs.text)}>{label}</span>
                </div>

                <div className="absolute top-2 right-2">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" className={cs.trackBg} />
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeDasharray={strokeDasharray} className={cs.text} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn('text-[8px] font-bold', cs.text)}>{value}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <Input
                    type="number" min={0} max={100}
                    value={getValue(key, 'ceilings')}
                    onChange={e => handleChange(key, e.target.value)}
                    className={cn(
                      'h-7 w-16 font-mono text-center text-xs bg-white dark:bg-slate-800/30 border-gray-300 dark:border-slate-700/50',
                      changes[key] !== undefined && 'border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    )}
                  />
                  <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase">max</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Detailed Config Tabs (no Ceilings tab) */}
      <section className="rounded-xl border border-gray-200 dark:border-slate-800/50 bg-white dark:bg-gray-900/50 shadow-sm overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 dark:border-slate-800/50 bg-gray-50/80 dark:bg-slate-900/30 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isEmpty = !config?.[tab.id] || Object.keys(config[tab.id]).length === 0
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-all duration-200',
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-500/10'
                    : 'border-transparent text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/30'
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="tracking-tight">{tab.label}</span>
                {isEmpty && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Not yet configured" />
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-3 min-h-[260px]">
          {isTabEmpty ? (
            /* Empty state — tab not seeded yet */
            <div className="flex flex-col items-center justify-center h-52 text-center">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center mb-3">
                <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-1">No data in database</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-3">
                {TAB_DESCRIPTIONS[activeTab]}. Click <strong>Init Defaults</strong> to seed the default values.
              </p>
              <button
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="h-8 px-4 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                {seeding ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Database className="h-3.5 w-3.5" strokeWidth={1.5} />}
                Initialize Defaults
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(activeTabData!).map(([key, configValue]) => {
                const val = getValue(key, activeTab)
                const isPenalty = activeTab === 'penalties'
                const isChanged = changes[key] !== undefined

                return (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200',
                      isChanged
                        ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10'
                        : 'border-gray-200 dark:border-slate-800/50 bg-gray-50 dark:bg-slate-800/20 hover:bg-gray-100/80 dark:hover:bg-slate-800/30'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white tracking-tight">
                        {formatKey(key)}
                      </p>
                      {configValue.description && (
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 truncate">
                          {configValue.description}
                        </p>
                      )}
                      {configValue.updatedAt && (
                        <p className="text-[9px] text-gray-300 dark:text-slate-600 mt-0.5">
                          Last updated: {new Date(configValue.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Input
                        type="number"
                        step={1}
                        value={val}
                        onChange={e => handleChange(key, e.target.value)}
                        className={cn(
                          'w-20 h-7 text-right font-mono text-xs bg-white dark:bg-slate-800/50 border-gray-300 dark:border-slate-700/50',
                          isChanged && 'border-amber-400 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        )}
                      />
                      <span className={cn(
                        'text-[10px] w-6 font-medium',
                        isChanged ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-slate-400'
                      )}>
                        {'pts'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Outcome Bands — reference only */}
      <section className="rounded-xl border border-gray-200 dark:border-slate-800/50 bg-white dark:bg-gray-900/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Outcome Bands</h2>
          <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-medium">Performance Tiers</span>
        </div>

        <div className="relative h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700/50">
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-gradient-to-r from-red-100 dark:from-red-950/60 to-red-50 dark:to-red-900/60" style={{ minWidth: '25%' }} />
            <div className="flex-1 bg-gradient-to-r from-orange-100 dark:from-orange-950/60 to-orange-50 dark:to-orange-900/60" style={{ minWidth: '25%' }} />
            <div className="flex-1 bg-gradient-to-r from-blue-100 dark:from-blue-950/60 to-blue-50 dark:to-blue-900/60" style={{ minWidth: '25%' }} />
            <div className="flex-1 bg-gradient-to-r from-emerald-100 dark:from-emerald-950/60 to-emerald-50 dark:to-emerald-900/60" style={{ minWidth: '25%' }} />
          </div>
          <div className="absolute inset-0 flex">
            {[
              { label: 'Contract Risk', range: '< 50', color: 'text-red-600 dark:text-red-400', sub: 'text-red-500 dark:text-red-400/60' },
              { label: 'Improvement',   range: '50-59', color: 'text-orange-600 dark:text-orange-400', sub: 'text-orange-500 dark:text-orange-400/60' },
              { label: 'Satisfactory',  range: '60-79', color: 'text-blue-600 dark:text-blue-400', sub: 'text-blue-500 dark:text-blue-400/60' },
              { label: 'Outstanding',   range: '≥ 80',  color: 'text-emerald-600 dark:text-emerald-400', sub: 'text-emerald-500 dark:text-emerald-400/60' },
            ].map((band, i) => (
              <div key={band.label} className={cn(
                'flex-1 flex flex-col items-center justify-center text-center px-2',
                i < 3 && 'border-r border-gray-200/80 dark:border-slate-800/50'
              )} style={{ minWidth: '25%' }}>
                <p className={cn('text-[10px] font-bold uppercase tracking-wide', band.color)}>{band.label}</p>
                <p className={cn('text-[9px] font-mono mt-0.5', band.sub)}>{band.range}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
