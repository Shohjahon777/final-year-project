'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Card, 
  CardContent 
} from '@/components/ui/card'
import {
  Mail,
  User,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Lock,
  Building2,
  ShieldAlert,
  GraduationCap,
  BadgeCheck,
  LayoutDashboard
} from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Constants ---
const FACULTY_RANKS = [
  'Head',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
] as const

const STEPS = [
  { id: 1, title: 'Credentials', subtitle: 'Login details', icon: Lock },
  { id: 2, title: 'Personal Info', subtitle: 'Identification', icon: User },
  { id: 3, title: 'Assignment', subtitle: 'Role & Dept', icon: Briefcase },
  { id: 4, title: 'Confirmation', subtitle: 'Review data', icon: BadgeCheck },
] as const

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'faculty' as 'faculty' | 'admin',
    facultyRank: '',
    department: 'Computer Science',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, user } = useAuth()
  const router = useRouter()

  // Animation state for smooth transitions
  const [direction, setDirection] = useState(1)

  // --- Logic ---

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Access Restricted</h1>
          <p className="text-gray-500 dark:text-gray-400">
            You do not have the required administrative privileges to access the registration portal.
          </p>
          <Button variant="outline" onClick={() => router.push('/')} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!formData.email) return 'Email address is required'
      if (!formData.email.includes('@')) return 'Please enter a valid email'
      if (!formData.password) return 'Password is required'
      if (formData.password.length < 6) return 'Password must be at least 6 characters'
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    }
    if (s === 2) {
      if (!formData.firstName?.trim()) return 'First name is required'
      if (!formData.lastName?.trim()) return 'Last name is required'
    }
    if (s === 3) {
      if (formData.role === 'faculty' && !formData.facultyRank) return 'Please select a faculty rank'
      if (!formData.department?.trim()) return 'Department is required'
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep(step)
    if (err) {
      setError(err)
      return
    }
    setError('')
    setDirection(1)
    setStep((s) => Math.min(4, s + 1))
  }

  const handleBack = () => {
    setError('')
    setDirection(-1)
    setStep((s) => Math.max(1, s - 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        facultyRank: formData.role === 'faculty' ? formData.facultyRank : undefined,
        department: formData.department,
      })
      router.push('/admin/users')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-gray-50 dark:bg-gray-950">
      {/* Main Container - Split Layout */}
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-12 min-h-[600px] border border-gray-100 dark:border-gray-800">
        
        {/* Left Sidebar - Navigation */}
        <div className="lg:col-span-4 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-100 dark:border-gray-800 p-8 flex flex-col justify-between relative overflow-hidden">
            
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                 <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                 <div className="absolute top-1/2 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-12">
                    <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Admin Portal</span>
                </div>

                <div className="space-y-6">
                    {STEPS.map((s, i) => {
                        const Icon = s.icon
                        const isActive = step === s.id
                        const isCompleted = step > s.id
                        
                        return (
                            <div key={s.id} className="relative group">
                                <div className={cn(
                                    "flex items-center gap-4 p-3 rounded-xl transition-all duration-300",
                                    isActive ? "bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700" : "opacity-60 hover:opacity-100"
                                )}>
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300",
                                        isActive ? "bg-primary/10 text-primary" : 
                                        isCompleted ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                    )}>
                                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className={cn("font-medium text-sm transition-colors", isActive ? "text-gray-900 dark:text-white" : "text-gray-500")}>
                                            {s.title}
                                        </p>
                                        <p className="text-xs text-gray-400 font-light">{s.subtitle}</p>
                                    </div>
                                </div>
                                {/* Vertical Connector Line */}
                                {i < STEPS.length - 1 && (
                                    <div className="absolute left-[27px] top-14 bottom-[-16px] w-[2px] bg-gray-100 dark:bg-gray-800 -z-10" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="relative z-10 pt-8">
                <p className="text-xs text-gray-400 leading-relaxed">
                    Creating a new user account grants system access. Ensure all role assignments adhere to university compliance policies.
                </p>
            </div>
        </div>

        {/* Right Content - Form Canvas */}
        <div className="lg:col-span-8 p-8 lg:p-12 flex flex-col justify-center relative">
            <div className="max-w-md mx-auto w-full">
                
                {/* Header for Mobile only */}
                <div className="lg:hidden mb-8 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Step {step} of 4</span>
                    <span className="text-sm font-semibold">{STEPS[step-1].title}</span>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {STEPS[step-1].title}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        {step === 4 ? "Please review the details below before creating the account." : "Enter the required information to proceed."}
                    </p>
                </div>

                <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }}>
                    
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 flex items-start gap-3 text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
                            <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {/* Step 1: Credentials */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="user@university.edu"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-9 h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="pl-9 h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pl-9 h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Personal Info */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        placeholder="e.g. Jane"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        placeholder="e.g. Doe"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg flex gap-3 text-sm text-blue-600 dark:text-blue-400">
                                <User className="h-5 w-5 shrink-0" />
                                <p>This name will appear on official documents and student facing portals. Please ensure correct spelling.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Role & Department */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div className="space-y-2">
                                <Label htmlFor="role">System Role</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['faculty', 'admin'].map((roleOption) => (
                                        <div 
                                            key={roleOption}
                                            onClick={() => setFormData(prev => ({ ...prev, role: roleOption as any }))}
                                            className={cn(
                                                "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-800",
                                                formData.role === roleOption 
                                                    ? "border-primary bg-primary/5 text-primary" 
                                                    : "border-gray-100 dark:border-gray-800 text-gray-500"
                                            )}
                                        >
                                            {roleOption === 'faculty' ? <GraduationCap className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                                            <span className="capitalize font-medium">{roleOption}</span>
                                        </div>
                                    ))}
                                </div>
                             </div>

                             {formData.role === 'faculty' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="facultyRank">Academic Rank</Label>
                                    <select
                                        id="facultyRank"
                                        name="facultyRank"
                                        value={formData.facultyRank}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800/50 dark:border-gray-800"
                                    >
                                        <option value="">Select Rank...</option>
                                        {FACULTY_RANKS.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                             )}

                             <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="pl-9 h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-all"
                                    />
                                </div>
                             </div>
                        </div>
                    )}

                    {/* Step 4: Preview */}
                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                                <CardContent className="pt-8 pb-8 px-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-500">
                                            {formData.firstName[0]}{formData.lastName[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{formData.firstName} {formData.lastName}</h3>
                                            <p className="text-sm text-gray-500">{formData.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Role</p>
                                            <p className="font-medium capitalize flex items-center gap-2 mt-1">
                                                {formData.role === 'admin' ? <ShieldAlert className="h-3 w-3 text-primary" /> : <GraduationCap className="h-3 w-3 text-primary" />}
                                                {formData.role}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Department</p>
                                            <p className="font-medium mt-1">{formData.department}</p>
                                        </div>
                                        {formData.role === 'faculty' && (
                                            <div className="col-span-2">
                                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Rank</p>
                                                <p className="font-medium mt-1">{formData.facultyRank}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            <p className="text-center text-xs text-gray-400 mt-6">
                                By clicking "Create Account", an email notification will be sent to the user.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleBack}
                            disabled={step === 1 || loading}
                            className={cn("text-gray-500 hover:text-gray-900 dark:hover:text-gray-100", step === 1 && "invisible")}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        {step < 4 ? (
                            <Button type="submit" onClick={handleNext} className="min-w-[120px] shadow-lg shadow-primary/20">
                                Continue
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={loading} className="min-w-[140px] shadow-lg shadow-primary/20">
                                {loading ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        Create Account
                                        <CheckCircle2 className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                </form>
            </div>
        </div>
      </div>
    </div>
  )
}