'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OAuthButton } from '@/components/auth/OAuthButton'

interface Particle {
  left: string
  top: string
  animationDelay: string
  animationDuration: string
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const { login } = useAuth()
  const router = useRouter()

  // Generate particles only on client to avoid hydration mismatch
  useEffect(() => {
    const generatedParticles: Particle[] = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${10 + Math.random() * 10}s`,
    }))
    setParticles(generatedParticles)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // Get user from localStorage to check role for redirect
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        // Redirect based on role
        if (userData.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setError('')
    setOauthLoading('google')
    // TODO: Implement Google OAuth
    console.log('Google OAuth - To be implemented')
    setTimeout(() => {
      setOauthLoading(null)
      setError('Google OAuth integration coming soon!')
    }, 500)
  }

  const handleGitHubLogin = () => {
    setError('')
    setOauthLoading('github')
    // TODO: Implement GitHub OAuth
    console.log('GitHub OAuth - To be implemented')
    setTimeout(() => {
      setOauthLoading(null)
      setError('GitHub OAuth integration coming soon!')
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Enhanced Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-primary-900/20 dark:via-background dark:to-secondary-900/20">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] animate-grid-pulse"></div>
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(49,130,206,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(49,130,206,0.05),transparent_70%)]"></div>
      </div>

      {/* Enhanced Floating Orbs with More Movement */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob dark:opacity-15 dark:mix-blend-normal"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-secondary-500/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000 dark:opacity-15 dark:mix-blend-normal"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-primary-600/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000 dark:opacity-15 dark:mix-blend-normal"></div>
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-success-500/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-6000 dark:opacity-10 dark:mix-blend-normal"></div>

      {/* Animated Particles - Client-side only to avoid hydration mismatch */}
      {particles.length > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary-500/40 rounded-full animate-float"
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

      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Visual */}
        <div className="hidden lg:flex flex-col items-start justify-center space-y-8 px-8 animate-fade-in">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500/10 dark:bg-primary-500/20 border border-primary-500/30 backdrop-blur-sm shadow-lg transition-colors duration-300 group">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                Faculty Evaluation System
              </span>
            </div>
            <div className="space-y-3">
              <h1 className="text-6xl font-extrabold tracking-tight text-foreground leading-tight">
                Welcome to{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    CAU
                  </span>
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full opacity-50"></span>
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
                Central Asian University - Department of Computer Science
              </p>
              <p className="text-lg text-muted-foreground/80 max-w-md leading-relaxed">
                A comprehensive platform for transparent, fair, and measurable faculty performance evaluation.
              </p>
            </div>
          </div>

          {/* Enhanced Feature Cards with Glassmorphism - Larger and Better Organized */}
          <div className="grid grid-cols-2 gap-5 w-full max-w-2xl">
            <div className="group p-7 rounded-xl bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary-500/80 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-transparent transition-all duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-500/10 dark:from-primary-500/30 dark:to-primary-500/20 flex items-center justify-center mb-4 transition-all duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Transparent</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Clear evaluation criteria</p>
              </div>
            </div>
            <div className="group p-7 rounded-xl bg-card/60 backdrop-blur-md border border-border/60 hover:border-secondary-500/80 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/0 to-secondary-500/0 group-hover:from-secondary-500/10 group-hover:to-transparent transition-all duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-secondary-500/20 to-secondary-500/10 dark:from-secondary-500/30 dark:to-secondary-500/20 flex items-center justify-center mb-4 transition-all duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base mb-2 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">Fair</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Objective scoring system</p>
              </div>
            </div>
            <div className="group p-7 rounded-xl bg-card/60 backdrop-blur-md border border-border/60 hover:border-success-500/80 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-success-500/0 to-success-500/0 group-hover:from-success-500/10 group-hover:to-transparent transition-all duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-success-500/20 to-success-500/10 dark:from-success-500/30 dark:to-success-500/20 flex items-center justify-center mb-4 transition-all duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base mb-2 group-hover:text-success-600 dark:group-hover:text-success-400 transition-colors">Measurable</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Data-driven insights</p>
              </div>
            </div>
            <div className="group p-7 rounded-xl bg-card/60 backdrop-blur-md border border-border/60 hover:border-warning-500/80 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-warning-500/0 to-warning-500/0 group-hover:from-warning-500/10 group-hover:to-transparent transition-all duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-warning-500/20 to-warning-500/10 dark:from-warning-500/30 dark:to-warning-500/20 flex items-center justify-center mb-4 transition-all duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base mb-2 group-hover:text-warning-600 dark:group-hover:text-warning-400 transition-colors">Secure</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Protected data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form with Glassmorphism */}
        <div className="w-full flex justify-center lg:justify-end animate-fade-in-up">
          <Card className="w-full max-w-md border-2 shadow-2xl backdrop-blur-xl bg-card/80 dark:bg-card/70 relative overflow-hidden">
            <CardHeader className="space-y-4 text-center pb-6 pt-8 bg-card/80 dark:bg-card/70">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 flex items-center justify-center mb-4 shadow-2xl relative">
                <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Sign in to access your faculty evaluation dashboard
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 bg-card dark:bg-card">
              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 animate-shake">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading || oauthLoading !== null}
                      className="h-12 bg-card dark:bg-card border-2 transition-all duration-300 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                    />
                    {email && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || oauthLoading !== null}
                    className="h-12 bg-card/80 dark:bg-card/70 backdrop-blur-sm border-2 transition-all duration-300 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 hover:from-primary-600 hover:via-primary-700 hover:to-secondary-600 shadow-2xl hover:shadow-primary-500/30 transition-all duration-300 relative overflow-hidden group"
                  disabled={loading || oauthLoading !== null}
                >
                  {loading ? (
                    <span className="flex items-center gap-3 relative z-10">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="relative z-10">Sign In</span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-4 text-muted-foreground font-medium">Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <OAuthButton
                  provider="google"
                  onClick={handleGoogleLogin}
                  disabled={loading || oauthLoading !== null}
                />
                <OAuthButton
                  provider="github"
                  onClick={handleGitHubLogin}
                  disabled={loading || oauthLoading !== null}
                />
              </div>

              {/* Footer */}
              <div className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
