'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from './button'

interface DrawerContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  fullscreen: boolean
  setFullscreen: (fullscreen: boolean) => void
}

const DrawerContext = React.createContext<DrawerContextValue | undefined>(undefined)

function useDrawer() {
  const context = React.useContext(DrawerContext)
  if (!context) {
    throw new Error('Drawer components must be used within a Drawer')
  }
  return context
}

// ----- Root Drawer Component -----
interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  defaultFullscreen?: boolean
}

function Drawer({ open, onOpenChange, children, defaultFullscreen = false }: DrawerProps) {
  const [fullscreen, setFullscreen] = React.useState(defaultFullscreen)
  const [mounted, setMounted] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)

  // Ensure we're on the client side for portal
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Handle open/close animations
  React.useEffect(() => {
    if (open) {
      // Opening: show immediately, then animate in
      setIsVisible(true)
      // Small delay to ensure DOM is ready before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      // Closing: animate out, then hide
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [open])

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Reset fullscreen when drawer closes
  React.useEffect(() => {
    if (!open) {
      setFullscreen(defaultFullscreen)
    }
  }, [open, defaultFullscreen])

  if (!isVisible || !mounted) return null

  const drawerContent = (
    <DrawerContext.Provider value={{ open, setOpen: onOpenChange, fullscreen, setFullscreen }}>
      {/* Overlay with fade animation */}
      <div
        className={cn(
          'fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300 ease-out',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Drawer Panel with slide animation */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed top-0 right-0 z-[100] flex flex-col bg-white dark:bg-gray-900 shadow-2xl h-screen',
          'transition-transform duration-300 ease-out',
          'w-[90vw] md:w-[60vw] lg:w-[50vw]',
          fullscreen ? 'w-full md:w-full lg:w-full max-w-none' : 'max-w-4xl',
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {children}
      </div>
    </DrawerContext.Provider>
  )

  // Use portal to render at document body level
  return createPortal(drawerContent, document.body)
}

// ----- Drawer Header -----
interface DrawerHeaderProps {
  children: React.ReactNode
  className?: string
  showFullscreenToggle?: boolean
  breadcrumb?: string
}

function DrawerHeader({ children, className, showFullscreenToggle = true, breadcrumb }: DrawerHeaderProps) {
  const { setOpen, fullscreen, setFullscreen } = useDrawer()

  return (
    <div className={cn('flex-shrink-0 border-b border-gray-200 dark:border-gray-800', className)}>
      {/* Top bar with controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          {showFullscreenToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setFullscreen(!fullscreen)}
              title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
          {breadcrumb && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{breadcrumb}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {/* Title area */}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  )
}

// ----- Drawer Title -----
interface DrawerTitleProps {
  children: React.ReactNode
  className?: string
}

function DrawerTitle({ children, className }: DrawerTitleProps) {
  return (
    <h2 className={cn('text-xl font-semibold text-gray-900 dark:text-gray-50', className)}>
      {children}
    </h2>
  )
}

// ----- Drawer Description -----
interface DrawerDescriptionProps {
  children: React.ReactNode
  className?: string
}

function DrawerDescription({ children, className }: DrawerDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}>
      {children}
    </p>
  )
}

// ----- Drawer Content -----
interface DrawerContentProps {
  children: React.ReactNode
  className?: string
}

function DrawerContent({ children, className }: DrawerContentProps) {
  return (
    <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)}>
      {children}
    </div>
  )
}

// ----- Drawer Footer -----
interface DrawerFooterProps {
  children: React.ReactNode
  className?: string
}

function DrawerFooter({ children, className }: DrawerFooterProps) {
  return (
    <div className={cn(
      'flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4',
      'border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50',
      className
    )}>
      {children}
    </div>
  )
}

// ----- Drawer Section -----
interface DrawerSectionProps {
  icon?: React.ReactNode
  label: string
  children: React.ReactNode
  className?: string
}

function DrawerSection({ icon, label, children, className }: DrawerSectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span>{label}</span>
      </div>
      <div>{children}</div>
    </div>
  )
}

// ----- Drawer Metadata -----
interface DrawerMetadataItem {
  icon?: React.ReactNode
  label: string
  value: React.ReactNode
}

interface DrawerMetadataProps {
  items: DrawerMetadataItem[]
  className?: string
}

function DrawerMetadata({ items, className }: DrawerMetadataProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          {item.icon && (
            <span className="text-gray-400 mt-0.5">{item.icon}</span>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-50">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ----- Drawer Tabs -----
interface DrawerTab {
  id: string
  label: string
  count?: number
}

interface DrawerTabsProps {
  tabs: DrawerTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

function DrawerTabs({ tabs, activeTab, onTabChange, className }: DrawerTabsProps) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-gray-200 dark:border-gray-800', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors relative',
            activeTab === tab.id
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          )}
        >
          <span className="flex items-center gap-1.5">
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              )}>
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
          )}
        </button>
      ))}
    </div>
  )
}

// ----- Drawer Attachments -----
interface DrawerAttachment {
  name: string
  type: 'link' | 'file' | 'text'
  value: string
  size?: string
}

interface DrawerAttachmentsProps {
  attachments: DrawerAttachment[]
  onDownloadAll?: () => void
  className?: string
}

function DrawerAttachments({ attachments, onDownloadAll, className }: DrawerAttachmentsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
        </span>
        {onDownloadAll && attachments.length > 1 && (
          <Button variant="ghost" size="sm" onClick={onDownloadAll} className="text-primary-600">
            Download All
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                {attachment.name}
              </p>
              {attachment.size && (
                <p className="text-xs text-gray-500">{attachment.size}</p>
              )}
            </div>
            {attachment.type === 'link' && (
              <a
                href={attachment.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 text-xs"
              >
                Open
              </a>
            )}
            {attachment.type === 'file' && (
              <button className="text-primary-600 hover:text-primary-700 text-xs">
                Download
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ----- Drawer Info Row (compact metadata display) -----
interface DrawerInfoRowProps {
  icon?: React.ReactNode
  label: string
  children: React.ReactNode
  className?: string
}

function DrawerInfoRow({ icon, label, children, className }: DrawerInfoRowProps) {
  return (
    <div className={cn('flex items-center py-2', className)}>
      <div className="flex items-center gap-2 w-32 flex-shrink-0">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className="flex-1 text-sm text-gray-900 dark:text-gray-50">{children}</div>
    </div>
  )
}

export {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerContent,
  DrawerFooter,
  DrawerSection,
  DrawerMetadata,
  DrawerTabs,
  DrawerAttachments,
  DrawerInfoRow,
  useDrawer,
}
