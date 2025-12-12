'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Particle {
  left: string
  top: string
  animationDelay: string
  animationDuration: string
}

interface GradientBackgroundProps {
  /** Intensity of the effect: 'subtle' for dashboard, 'normal' for auth pages */
  intensity?: 'subtle' | 'normal'
  /** Whether to show floating particles */
  showParticles?: boolean
  /** Whether to show the grid pattern */
  showGrid?: boolean
  className?: string
}

export function GradientBackground({
  intensity = 'subtle',
  showParticles = true,
  showGrid = true,
  className,
}: GradientBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  // Generate particles only on client to avoid hydration mismatch
  useEffect(() => {
    if (!showParticles) return
    const particleCount = intensity === 'subtle' ? 12 : 20
    const generatedParticles: Particle[] = Array.from({ length: particleCount }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${15 + Math.random() * 15}s`,
    }))
    setParticles(generatedParticles)
  }, [showParticles, intensity])

  // Opacity modifiers based on intensity
  const isSubtle = intensity === 'subtle'
  const orbOpacity = isSubtle ? 'opacity-20 dark:opacity-[0.06]' : 'opacity-60 dark:opacity-15'
  const smallOrbOpacity = isSubtle ? 'opacity-15 dark:opacity-[0.04]' : 'opacity-50 dark:opacity-10'
  const particleOpacity = isSubtle ? 'bg-primary-500/20' : 'bg-primary-500/40'
  const gridOpacity = isSubtle ? 'opacity-30' : 'opacity-100'

  return (
    <div className={cn('fixed inset-0 pointer-events-none overflow-hidden', className)}>
      {/* Base gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-purple-50/30 dark:from-primary-950/20 dark:via-transparent dark:to-purple-950/10" />

      {/* Animated Grid Pattern */}
      {showGrid && (
        <div className={cn(
          "absolute inset-0",
          "bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)]",
          "dark:bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)]",
          "bg-[size:32px_32px]",
          "[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]",
          gridOpacity
        )} />
      )}

      {/* Radial Gradient Overlay */}
      <div className={cn(
        "absolute inset-0",
        isSubtle
          ? "bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.06),transparent_50%)]"
          : "bg-[radial-gradient(circle_at_50%_50%,rgba(49,130,206,0.1),transparent_70%)]",
        isSubtle
          ? "dark:bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.03),transparent_50%)]"
          : "dark:bg-[radial-gradient(circle_at_50%_50%,rgba(49,130,206,0.05),transparent_70%)]"
      )} />

      {/* Floating Orbs - Positioned to not interfere with content */}
      <div className={cn(
        "absolute -top-32 -right-32 w-[500px] h-[500px]",
        "bg-primary-400/30 dark:bg-primary-500/20",
        "rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[100px]",
        "animate-blob",
        orbOpacity
      )} />
      <div className={cn(
        "absolute top-1/3 -left-32 w-[400px] h-[400px]",
        "bg-purple-400/30 dark:bg-purple-500/20",
        "rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[100px]",
        "animate-blob animation-delay-2000",
        orbOpacity
      )} />
      <div className={cn(
        "absolute -bottom-32 left-1/3 w-[450px] h-[450px]",
        "bg-blue-400/30 dark:bg-blue-600/20",
        "rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[100px]",
        "animate-blob animation-delay-4000",
        orbOpacity
      )} />
      {/* Smaller accent orb */}
      <div className={cn(
        "absolute top-2/3 right-1/4 w-[250px] h-[250px]",
        "bg-green-400/20 dark:bg-emerald-500/15",
        "rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[80px]",
        "animate-blob animation-delay-2000",
        smallOrbOpacity
      )} />

      {/* Animated Particles - Client-side only */}
      {showParticles && particles.length > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 h-1 rounded-full animate-float",
                particleOpacity
              )}
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
