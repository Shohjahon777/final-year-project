'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { facultyApi } from '@/lib/api/faculty'
import type { Submission } from '@/lib/api/faculty'
import { ArrowLeft, Loader2 } from 'lucide-react'

type EvidenceType = 'link' | 'file' | 'text'

function EditSubmissionContent() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    evidenceType: 'link' as EvidenceType,
    evidenceValue: '',
    metadata: {} as Record<string, any>,
  })

  useEffect(() => {
    facultyApi
      .getSubmission(id)
      .then((s) => {
        setSubmission(s)
        setFormData({
          title: s.title,
          description: s.description ?? '',
          evidenceType: s.evidence.type as EvidenceType,
          evidenceValue: s.evidence.value,
          metadata: s.metadata ?? {},
        })
      })
      .catch(() => setError('Failed to load submission'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submission) return
    setSaving(true)
    setError(null)
    try {
      await facultyApi.updateSubmission(id, {
        title: formData.title,
        description: formData.description || undefined,
        evidence: { type: formData.evidenceType, value: formData.evidenceValue },
        metadata: Object.keys(formData.metadata).length ? formData.metadata : undefined,
      })
      router.push(`/dashboard/submissions/${id}`)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update submission')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !submission) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
          ) : (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Submission not found.</p>
              <Button variant="outline" onClick={() => router.push('/dashboard/submissions')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Submissions
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    )
  }

  if (submission.status !== 'pending' && submission.status !== 'changes_requested') {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-amber-800 dark:text-amber-200">
          Only pending or changes-requested submissions can be edited.
        </div>
        <Button variant="outline" className="mt-4" onClick={() => router.push(`/dashboard/submissions/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/submissions/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Edit Submission</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{submission.category}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Evidence <span className="text-red-500">*</span>
              </label>
              {formData.evidenceType === 'link' && (
                <Input
                  type="url"
                  value={formData.evidenceValue}
                  onChange={(e) => setFormData({ ...formData, evidenceValue: e.target.value })}
                  required
                  className="bg-white dark:bg-gray-900"
                />
              )}
              {formData.evidenceType === 'text' && (
                <textarea
                  value={formData.evidenceValue}
                  onChange={(e) => setFormData({ ...formData, evidenceValue: e.target.value })}
                  rows={3}
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
              )}
              {formData.evidenceType === 'file' && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current file: {formData.evidenceValue.replace(/^.*\//, '')}. To change, edit from the submissions list drawer.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/submissions/${id}`)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default function EditSubmissionPage() {
  return (
    <ProtectedRoute>
      <EditSubmissionContent />
    </ProtectedRoute>
  )
}
