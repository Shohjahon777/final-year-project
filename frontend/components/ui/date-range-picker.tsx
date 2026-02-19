'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DateRange {
  start: string // YYYY-MM-DD
  end: string   // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  minDate?: string // YYYY-MM-DD — days before this are disabled
  placeholder?: string
  className?: string
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

function daysBetween(a: string, b: string) {
  return Math.ceil((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000) + 1
}

function formatRange(start: string, end: string) {
  const fmt = (s: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(s + 'T00:00:00').toLocaleDateString('en-US', opts)
  if (!start) return ''
  if (!end) return fmt(start, { month: 'short', day: 'numeric', year: 'numeric' })
  const s = fmt(start, { month: 'short', day: 'numeric' })
  const e = fmt(end,   { month: 'short', day: 'numeric', year: 'numeric' })
  return `${s} – ${e}`
}

export function DateRangePicker({
  value,
  onChange,
  minDate,
  placeholder = 'Select date range',
  className,
}: DateRangePickerProps) {
  const today     = toDateStr(new Date())
  const minD      = minDate ?? today

  const [open, setOpen]           = useState(false)
  const [hovered, setHovered]     = useState<string | null>(null)
  const [phase, setPhase]         = useState<'start' | 'end'>('start')
  const [viewYear, setViewYear]   = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  // Fixed-position coords for the dropdown so it escapes any overflow:hidden ancestor
  const [dropPos, setDropPos]     = useState({ top: 0, left: 0, width: 0 })

  const triggerRef = useRef<HTMLDivElement>(null)
  const dropRef    = useRef<HTMLDivElement>(null)

  // Recalculate dropdown position relative to viewport
  const recalcPos = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    // Flip up if not enough space below
    const spaceBelow = window.innerHeight - r.bottom
    const dropH = dropRef.current?.offsetHeight ?? 380
    const top = spaceBelow < dropH + 8 ? r.top - dropH - 6 : r.bottom + 6
    setDropPos({ top, left: r.left, width: r.width })
  }, [])

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropRef.current   && !dropRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Recalculate on scroll / resize while open
  useEffect(() => {
    if (!open) return
    recalcPos()
    window.addEventListener('scroll', recalcPos, true)
    window.addEventListener('resize', recalcPos)
    return () => {
      window.removeEventListener('scroll', recalcPos, true)
      window.removeEventListener('resize', recalcPos)
    }
  }, [open, recalcPos])

  // Reset phase when picker opens
  useEffect(() => {
    if (open) setPhase(value.start ? 'end' : 'start')
  }, [open])

  // Calendar math
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()  // 0=Sun
  const daysInMonth     = new Date(viewYear, viewMonth + 1, 0).getDate()
  const totalCells      = firstDayOfMonth + daysInMonth
  const totalRows       = Math.ceil(totalCells / 7)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function handleDayClick(dateStr: string) {
    if (phase === 'start') {
      onChange({ start: dateStr, end: '' })
      setPhase('end')
    } else {
      if (value.start && dateStr < value.start) {
        onChange({ start: dateStr, end: value.start })
      } else {
        onChange({ start: value.start, end: dateStr })
      }
      setPhase('start')
      setOpen(false)
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange({ start: '', end: '' })
    setPhase('start')
  }

  function getDayMeta(dateStr: string) {
    const { start, end } = value
    const effectiveEnd = (phase === 'end' && hovered) ? hovered : end
    const lo = start && effectiveEnd ? (start <= effectiveEnd ? start : effectiveEnd) : ''
    const hi = start && effectiveEnd ? (start <= effectiveEnd ? effectiveEnd : start) : ''

    const isStart     = !!start && dateStr === start
    const isEnd       = !!end   && dateStr === end
    const isPending   = phase === 'end' && !!hovered && dateStr === hovered && !end
    const inRange     = !!lo && !!hi && dateStr > lo && dateStr < hi
    const isDisabled  = dateStr < minD
    const isToday     = dateStr === today

    // Does the range span across this cell (for the horizontal bar)?
    const barLeft  = inRange || isEnd   || (isStart && (effectiveEnd ?? '') > dateStr)
    const barRight = inRange || isStart || (isEnd   && start < dateStr)

    return { isStart, isEnd, inRange, isPending, isDisabled, isToday, barLeft, barRight }
  }

  const hasValue  = !!value.start
  const hasFull   = !!value.start && !!value.end
  const displayText = hasValue ? formatRange(value.start, value.end) : ''
  const durationLabel = hasFull
    ? `${daysBetween(value.start, value.end)} day${daysBetween(value.start, value.end) !== 1 ? 's' : ''}`
    : phase === 'end' && value.start
    ? 'Pick end date'
    : null

  return (
    <div className={cn('relative', className)}>

      {/* ── Trigger (div, not button — avoids nested <button> when used inside a form) ── */}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={() => { recalcPos(); setOpen(o => !o) }}
        onKeyDown={(e) => e.key === 'Enter' && (recalcPos(), setOpen(o => !o))}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-sm text-left transition-all select-none cursor-pointer',
          open
            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-gray-900'
            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600',
        )}
      >
        <CalendarDays className={cn('h-4 w-4 flex-shrink-0', hasValue ? 'text-primary-500' : 'text-gray-400')} />

        <span className={cn('flex-1', hasValue ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-400')}>
          {hasValue ? displayText : placeholder}
        </span>

        {durationLabel && (
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded font-medium',
            hasFull
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
          )}>
            {durationLabel}
          </span>
        )}

        {hasValue && (
          <button
            title='clear'
            type="button"
            onClick={clear}
            className="h-5 w-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* ── Calendar dropdown — fixed so it escapes overflow:hidden ancestors ── */}
      {open && (
        <div
          ref={dropRef}
          style={{ top: dropPos.top, left: dropPos.left }}
          className="fixed z-[9999] w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        >

          {/* Phase hint */}
          <div className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b border-gray-100 dark:border-gray-800',
            phase === 'start'
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
          )}>
            <div className={cn(
              'h-1.5 w-1.5 rounded-full',
              phase === 'start' ? 'bg-primary-500' : 'bg-amber-500'
            )} />
            {phase === 'start' ? 'Select start date' : 'Select end date'}
          </div>

          <div className="p-3">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                title="Previous month"
                type="button"
                onClick={prevMonth}
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                title="Next month"
                type="button"
                onClick={nextMonth}
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: totalRows * 7 }, (_, i) => {
                const dayNum = i - firstDayOfMonth + 1
                if (dayNum < 1 || dayNum > daysInMonth) {
                  return <div key={i} className="h-8" />
                }

                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                const { isStart, isEnd, inRange, isPending, isDisabled, isToday, barLeft, barRight } = getDayMeta(dateStr)
                const isEdge = isStart || isEnd || isPending

                return (
                  <div key={i} className="relative h-8 flex items-center justify-center">
                    {/* Range bar (horizontal fill behind the circle) */}
                    {(inRange || (isEdge && (barLeft || barRight))) && (
                      <div className={cn(
                        'absolute inset-y-1 bg-primary-50 dark:bg-primary-900/25',
                        // left half or full
                        barLeft && barRight ? 'inset-x-0' :
                        barLeft            ? 'left-0 right-1/2' :
                        barRight           ? 'left-1/2 right-0' : ''
                      )} />
                    )}

                    {/* Day circle */}
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDayClick(dateStr)}
                      onMouseEnter={() => phase === 'end' && setHovered(dateStr)}
                      onMouseLeave={() => setHovered(null)}
                      className={cn(
                        'relative z-10 h-7 w-7 flex items-center justify-center rounded-full text-sm font-medium transition-all focus:outline-none',
                        isDisabled && 'opacity-30 cursor-not-allowed',
                        (isStart || isEnd) && 'bg-primary-600 text-white shadow-sm',
                        isPending && !isEnd && 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 ring-1 ring-primary-400',
                        inRange && !isEdge && 'text-primary-700 dark:text-primary-300',
                        isToday && !isEdge && !inRange && 'ring-1 ring-primary-400 text-primary-600 dark:text-primary-400',
                        !isEdge && !inRange && !isToday && !isDisabled && 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                      )}
                    >
                      {dayNum}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer — selected range summary */}
          {(value.start || value.end) && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-x-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {value.start ? new Date(value.start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </span>
                <span>→</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {value.end ? new Date(value.end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </span>
              </div>
              {hasFull && (
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                  {daysBetween(value.start, value.end)} day{daysBetween(value.start, value.end) !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
