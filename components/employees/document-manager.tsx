'use client'

import { useTransition, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSignedDocumentUrl } from '@/app/(dashboard)/employees/actions'
import type { EmployeeDocument } from '@/types/database.types'

interface DocumentManagerProps {
  employeeId: string
  documents: EmployeeDocument[]
  uploadAction: (formData: FormData) => Promise<{ error?: string }>
  deleteAction: (docId: string, filePath: string, employeeId: string) => Promise<{ error?: string }>
}

export function DocumentManager({
  employeeId,
  documents,
  uploadAction,
  deleteAction,
}: DocumentManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploadError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await uploadAction(formData)
      if (result?.error) {
        setUploadError(result.error)
      } else {
        formRef.current?.reset()
      }
    })
  }

  async function handleDownload(filePath: string, label: string) {
    const { url, error } = await getSignedDocumentUrl(filePath)
    if (error || !url) return
    const a = document.createElement('a')
    a.href = url
    a.download = label
    a.click()
  }

  function handleDelete(docId: string, filePath: string) {
    startTransition(async () => {
      await deleteAction(docId, filePath, employeeId)
    })
  }

  return (
    <div className="space-y-6">
      <form ref={formRef} onSubmit={handleUpload} className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-700">Upload Document</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Label *</Label>
            <Input name="label" placeholder="e.g. Resume, NBI Clearance" required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">File *</Label>
            <Input type="file" name="file" required />
          </div>
        </div>
        {uploadError && (
          <p className="text-sm text-red-600">{uploadError}</p>
        )}
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">
          Documents ({documents.length})
        </h3>
        {documents.length === 0 && (
          <p className="text-sm text-slate-400 py-4">No documents uploaded yet.</p>
        )}
        {documents.map(doc => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{doc.label}</p>
              <p className="text-xs text-slate-400">
                {new Date(doc.uploaded_at).toLocaleDateString('en-PH', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(doc.file_url, doc.label)}
                disabled={isPending}
              >
                Download
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() => handleDelete(doc.id, doc.file_url)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
