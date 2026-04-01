'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Employee } from '@/types/database.types'

interface EmployeeFormProps {
  initial?: Partial<Employee>
  action: (formData: FormData) => Promise<{ error?: string }>
  submitLabel: string
  redirectTo?: string
}

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ' +
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={`space-y-1${span2 ? ' sm:col-span-2' : ''}`}>
      <Label className="text-xs text-slate-600">{label}</Label>
      {children}
    </div>
  )
}

export function EmployeeForm({ initial, action, submitLabel, redirectTo = '/employees' }: EmployeeFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        router.push(redirectTo)
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Personal Information">
        <Field label="Full Name *">
          <Input name="full_name" required defaultValue={initial?.full_name ?? ''} />
        </Field>
        <Field label="Birthday">
          <Input type="date" name="birthday" defaultValue={initial?.birthday ?? ''} />
        </Field>
        <Field label="Sex">
          <select name="sex" defaultValue={initial?.sex ?? ''} className={selectClass}>
            <option value="">— Select —</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
        <Field label="Marital Status">
          <select name="marital_status" defaultValue={initial?.marital_status ?? ''} className={selectClass}>
            <option value="">— Select —</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
          </select>
        </Field>
        <Field label="Address" span2>
          <Input name="address" defaultValue={initial?.address ?? ''} />
        </Field>
        <Field label="Contact Number">
          <Input name="contact_number" defaultValue={initial?.contact_number ?? ''} />
        </Field>
      </Section>

      <Section title="Emergency Contact">
        <Field label="Name">
          <Input name="emergency_contact_name" defaultValue={initial?.emergency_contact_name ?? ''} />
        </Field>
        <Field label="Number">
          <Input name="emergency_contact_number" defaultValue={initial?.emergency_contact_number ?? ''} />
        </Field>
      </Section>

      <Section title="Employment Details">
        <Field label="Position">
          <Input name="position" defaultValue={initial?.position ?? ''} />
        </Field>
        <Field label="Department">
          <Input name="department" defaultValue={initial?.department ?? ''} />
        </Field>
        <Field label="Employment Type *">
          <select name="employment_type" required defaultValue={initial?.employment_type ?? 'regular'} className={selectClass}>
            <option value="regular">Regular</option>
            <option value="part_time">Part-Time</option>
            <option value="contractual">Contractual</option>
            <option value="licensed_professional">Licensed Professional</option>
          </select>
        </Field>
        <Field label="Classification *">
          <select name="employee_classification" required defaultValue={initial?.employee_classification ?? 'direct_labor'} className={selectClass}>
            <option value="direct_labor">Direct Labor</option>
            <option value="general_salaries">General Salaries</option>
          </select>
        </Field>
        <Field label="Date Hired">
          <Input type="date" name="date_hired" defaultValue={initial?.date_hired ?? ''} />
        </Field>
        <Field label="Date Regularized">
          <Input type="date" name="date_regularized" defaultValue={initial?.date_regularized ?? ''} />
        </Field>
        <Field label="Employment Status *">
          <select name="employment_status" required defaultValue={initial?.employment_status ?? 'active'} className={selectClass}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="resigned">Resigned</option>
            <option value="terminated">Terminated</option>
          </select>
        </Field>
        <Field label="Monthly Rate (₱) *">
          <Input
            type="number"
            step="0.01"
            min="0"
            name="monthly_rate"
            required
            defaultValue={initial?.monthly_rate ?? ''}
          />
        </Field>
      </Section>

      <Section title="Government IDs">
        <Field label="SSS Number">
          <Input name="sss_number" defaultValue={initial?.sss_number ?? ''} />
        </Field>
        <Field label="PhilHealth Number">
          <Input name="philhealth_number" defaultValue={initial?.philhealth_number ?? ''} />
        </Field>
        <Field label="Pag-IBIG Number">
          <Input name="pagibig_number" defaultValue={initial?.pagibig_number ?? ''} />
        </Field>
        <Field label="TIN">
          <Input name="tin" defaultValue={initial?.tin ?? ''} />
        </Field>
      </Section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md">
          Saved successfully.
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
