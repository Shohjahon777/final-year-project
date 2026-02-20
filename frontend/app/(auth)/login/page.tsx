'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OAuthButton } from '@/components/auth/OAuthButton'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { Sparkles, TrendingUp, Shield, Users } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const { login } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        if (userData.mustChangePassword === true) {
          router.replace('/change-password')
          return
        }
        if (userData.role === 'admin') {
          router.replace('/admin')
          return
        }
      }
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setError('')
    setOauthLoading('google')
    console.log('Google OAuth - To be implemented')
    setTimeout(() => {
      setOauthLoading(null)
      setError('Google OAuth integration coming soon!')
    }, 500)
  }

  const handleGitHubLogin = () => {
    setError('')
    setOauthLoading('github')
    console.log('GitHub OAuth - To be implemented')
    setTimeout(() => {
      setOauthLoading(null)
      setError('GitHub OAuth integration coming soon!')
    }, 500)
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary-500/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl animate-blob opacity-70 dark:opacity-20"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl animate-blob animation-delay-2000 opacity-70 dark:opacity-20"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl animate-blob animation-delay-4000 opacity-70 dark:opacity-20"></div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-400/40 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400/40 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-400/40 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-2/3 right-1/3 w-4 h-4 border border-primary-400/30 rounded animate-spin-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 border border-purple-400/30 rotate-45 animate-pulse"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-900 dark:from-primary-900 dark:via-purple-900 dark:to-gray-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]"></div>

        {/* Floating Shapes Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/10 rounded-2xl rotate-12 animate-float-slow"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-white/10 rounded-full animate-float-slow animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-lg rotate-45 animate-float-slow animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
          {/* Logo with Glow */}
          <div className="flex items-center gap-3 mb-16 group">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
              {mounted && (
                <Image
                  src="/CAU-white.png"
                  alt="CAU Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                CAU
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </h2>
              <p className="text-sm text-white/80">Central Asian University</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium text-white">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                Secure & Modern Platform
              </div>
              <h1 className="text-4xl font-bold text-white leading-tight">
                Faculty Evaluation
                <span className="block text-3xl bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mt-1">
                  Made Simple
                </span>
              </h1>
              <p className="text-lg text-white/80">
                Department of Computer Science
              </p>
            </div>

            {/* Stats Cards with Glassmorphism */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-xs text-white/60">Faculty Members</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-purple-200" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">98%</div>
                    <div className="text-xs text-white/60">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List with Icons */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all">
                  <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">Real-time Analytics</div>
                  <div className="text-xs text-white/60">Track your performance instantly</div>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">Transparent Scoring</div>
                  <div className="text-xs text-white/60">Fair and objective evaluation</div>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all">
                  <Shield className="w-4 h-4 text-purple-300" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">Enterprise Security</div>
                  <div className="text-xs text-white/60">Your data is always protected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            © 2026 Central Asian University
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
              {mounted && (
                <Image
                  src={theme === 'dark' ? '/CAU-white.png' : '/CAU-color.png'}
                  alt="CAU Logo"
                  width={56}
                  height={56}
                  className="object-contain"
                  priority
                />
              )}
            </div>
          </div>

          {/* Engineering Logo above card */}
          <div className="flex justify-center mb-6">
            {mounted && (
              <Image
                src={theme === 'dark' ? '/engineering-white.png' : '/engineering.png'}
                alt="Engineering Logo"
                width={200}
                height={100}
                className="object-contain"
                priority
              />
            )}
          </div>

          {/* Glassmorphic Card */}
          <Card className="border shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 relative overflow-hidden">
            {/* Decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>

            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Welcome back
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className="w-1 h-1 bg-primary-500 rounded-full inline-block"></span>
                Sign in to continue to your dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 animate-shake">
                  {error}
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@cau.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || oauthLoading !== null}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || oauthLoading !== null}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300"
                  disabled={loading || oauthLoading !== null}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading || oauthLoading !== null}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                    <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                    <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                    <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
                </button>

                <button
                  onClick={handleGitHubLogin}
                  disabled={loading || oauthLoading !== null}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <svg className="w-5 h-5 fill-current text-gray-700 dark:text-gray-300" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub</span>
                </button>
              </div>

              {/* Footer */}
              <div className="pt-2 text-center border-t border-gray-200 dark:border-gray-700 mt-4">
                <p className="text-xs text-muted-foreground">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Terms
                  </a>
                  {' · '}
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Privacy
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Footer */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
              © 2026 Central Asian University
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
