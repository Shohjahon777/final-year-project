'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useMemo, useId } from 'react'
import { cn } from '@/lib/utils'

interface SparklineChartProps {
  data: { value: number }[]
  color: string
  fillColor: string
  className?: string
  width?: number
  height?: number
}

export function SparklineChart({ data, color, fillColor, className, width = 120, height = 40 }: SparklineChartProps) {
  // Generate stable unique ID for gradient using useId hook
  const gradientId = useId()

  // Normalize data to 0-100 range for consistent visualization
  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) {
      return Array.from({ length: 12 }, (_, i) => ({ index: i, value: 50 }))
    }
    
    const values = data.map(d => d.value)
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    const range = maxValue - minValue || 1
    
    return data.map((d, index) => ({
      index,
      value: range > 0 ? ((d.value - minValue) / range) * 100 : 50
    }))
  }, [data])

  // Clean gradient ID for use in SVG
  const cleanGradientId = gradientId.replace(/:/g, '-')

  return (
    <div className={cn("inline-block", className)} style={{ width: `${width}px`, height: `${height}px` }}>
      <AreaChart
        width={width}
        height={height}
        data={normalizedData}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <defs>
          <linearGradient id={cleanGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity={0.1} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="index" 
          hide 
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          hide 
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${cleanGradientId})`}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </div>
  )
}
