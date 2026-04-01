# Employee Records Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Employee Records module — list, create, edit, and document management.

**Architecture:** Server components fetch data and pass to client components. Server actions (in `actions.ts` with `'use server'` at file top) handle all mutations. Supabase Storage (private bucket `employee-documents`) stores files; storage RLS policies allow authenticated users to upload/read/delete. Employee detail page uses shadcn Tabs for Profile / Documents.

**Tech Stack:** Next.js 16 App Router, Supabase (DB + Storage), shadcn/ui (Button, Input, Label, Badge, Table, Tabs), TypeScript, Vitest + React Testing Library

---

## File Map

**New files:**
- `supabase/migrations/0002_storage_policies.sql` — RLS policies for storage.objects
- `app/(dashboard)/employees/page.tsx` — Employee list (server component)
- `app/(dashboard)/employees/new/page.tsx` — New employee page (server component)
- `app/(dashboard)/employees/[id]/page.tsx` — Detail/edit page (server component)
- `app/(dashboard)/employees/actions.ts` — Server actions: createEmployee, updateEmployee, uploadDocument, deleteDocument, getSignedDocumentUrl
- `app/(dashboard)/employees/__tests__/actions.test.ts` — Tests for server actions
- `components/employees/employee-status-badge.tsx` — Status badge component
- `components/employees/employee-table.tsx` — Client: search + filter + table
- `components/employees/employee-form.tsx` — Client: create/edit form
- `components/employees/document-manager.tsx` — Client: upload/list/delete documents
- `components/employees/__tests__/employee-status-badge.test.tsx` — Badge tests

**No existing files are modified.**

---

## Task 1: Install Tabs shadcn component + storage policies migration

**Files:**
- Create: `supabase/migrations/0002_storage_policies.sql`
- (shadcn CLI creates `components/ui/tabs.tsx`)

- [ ] **Step 1: Install Tabs component**

```bash
cd /Users/thezivieamora/Claude/amoramed-hr
npx shadcn@latest add tabs
```

Expected: `components/ui/tabs.tsx` created with no errors.

- [ ] **Step 2: Create storage policy migration file**

Create `supabase/migrations/0002_storage_policies.sql`:

```sql
-- Allow authenticated users to manage files in the employee-documents bucket

create policy "authenticated_can_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'employee-documents');

create policy "authenticated_can_read"
on storage.objects for select
to authenticated
using (bucket_id = 'employee-documents');

create policy "authenticated_can_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'employee-documents');
```

- [ ] **Step 3: Apply storage policies via Supabase MCP**

Ask Claude to apply `supabase/migrations/0002_storage_policies.sql` to the Supabase project using the MCP tool (project ID: `iwukjvmotuxvpqyqyjpa`).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0002_storage_policies.sql components/ui/tabs.tsx
git commit -m "feat: add tabs component and storage policies for employee documents"
```

---

## Task 2: Employee status badge (TDD) + list page

**Files:**
- Create: `components/employees/__tests__/employee-status-badge.test.tsx`
- Create: `components/employees/employee-status-badge.tsx`
- Create: `components/employees/employee-table.tsx`
- Create: `app/(dashboard)/employees/page.tsx`

- [ ] **Step 1: Write the failing badge test**

Create `components/employees/__tests__/employee-status-badge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmployeeStatusBadge } from '../employee-status-badge'

describe('EmployeeStatusBadge', () => {
  it('renders "Active" for active status', () => {
    render(<EmployeeStatusBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders "Resigned" for resigned status', () => {
    render(<EmployeeStatusBadge status="resigned" />)
    expect(screen.getByText('Resigned')).toBeInTheDocument()
  })

  it('renders "Terminated" for terminated status', () => {
    render(<EmployeeStatusBadge status="terminated" />)
    expect(screen.getByText('Terminated')).toBeInTheDocument()
  })

  it('renders "Inactive" for inactive status', () => {
    render(<EmployeeStatusBadge status="inactive" />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- components/employees/__tests__/employee-status-badge.test.tsx
```

Expected: FAIL — `Cannot find module '../employee-status-badge'`

- [ ] **Step 3: Implement EmployeeStatusBadge**

Create `components/employees/employee-status-badge.tsx`:

```tsx
import { Badge } from '@/components/ui/badge'
import type { EmploymentStatus } from '@/types/database.types'

const statusConfig: Record<EmploymentStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}> = {
  active:     { label: 'Active',     variant: 'default' },
  inactive:   { label: 'Inactive',   variant: 'secondary' },
  resigned:   { label: 'Resigned',   variant: 'outline' },
  terminated: { label: 'Terminated', variant: 'destructive' },
}

export function EmployeeStatusBadge({ status }: { status: EmploymentStatus }) {
  const { label, variant } = statusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- components/employees/__tests__/employee-status-badge.test.tsx
```

Expected: PASS — 4 tests

- [ ] **Step 5: Create EmployeeTable client component**

Create `components/employees/employee-table.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { EmployeeStatusBadge } from './employee-status-badge'
import type { Employee, EmploymentStatus } from '@/types/database.types'

export function EmployeeTable({ employees }: { employees: Employee[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus | 'all'>('all')

  const filtered = employees.filter(e => {
    const matchesSearch = e.full_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.employment_status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as EmploymentStatus | 'all')}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="resigned">Resigned</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Monthly Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                No employees found.
              </TableCell>
            </TableRow>
          )}
          {filtered.map(emp => (
            <TableRow key={emp.id}>
              <TableCell className="font-medium">{emp.full_name}</TableCell>
              <TableCell>{emp.position ?? '—'}</TableCell>
              <TableCell>{emp.department ?? '—'}</TableCell>
              <TableCell className="capitalize">{emp.employment_type.replace(/_/g, ' ')}</TableCell>
              <TableCell>
                ₱{emp.monthly_rate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <EmployeeStatusBadge status={emp.employment_status} />
              </TableCell>
              <TableCell>
                <Link href={`/employees/${emp.id}`} className="text-sm text-blue-600 hover:underline">
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 6: Create employees list page**

Create `app/(dashboard)/employees/page.tsx`:

```tsx
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EmployeeTable } from '@/components/employees/employee-table'
import type { Employee } from '@/types/database.types'

export default async function EmployeesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .order('full_name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500 mt-1">
            {(employees ?? []).length} total
          </p>
        </div>
        <Button asChild>
          <Link href="/employees/new">Add Employee</Link>
        </Button>
      </div>
      <EmployeeTable employees={(employees ?? []) as Employee[]} />
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add components/employees/ app/(dashboard)/employees/page.tsx
git commit -m "feat: add employee status badge and list page"
```

---

## Task 3: Create employee — server action + form + page (TDD)

**Files:**
- Create: `app/(dashboard)/employees/__tests__/actions.test.ts`
- Create: `app/(dashboard)/employees/actions.ts`
- Create: `components/employees/employee-form.tsx`
- Create: `app/(dashboard)/employees/new/page.tsx`

- [ ] **Step 1: Write failing action test**

Create `app/(dashboard)/employees/__tests__/actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
const mockUpdate = vi.fn().mockReturnThis()
const mockEq = vi.fn()
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createEmployee, updateEmployee } from '../actions'

describe('createEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({ insert: mockInsert })
    mockInsert.mockResolvedValue({ error: null })
  })

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await createEmployee(new FormData())
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('inserts employee and returns empty object on success', async () => {
    const fd = new FormData()
    fd.set('full_name', 'Juan dela Cruz')
    fd.set('employment_type', 'regular')
    fd.set('employee_classification', 'direct_labor')
    fd.set('employment_status', 'active')
    fd.set('monthly_rate', '25000')
    const result = await createEmployee(fd)
    expect(mockInsert).toHaveBeenCalledOnce()
    expect(result).toEqual({})
  })

  it('returns error when Supabase insert fails', async () => {
    mockFrom.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }) })
    const fd = new FormData()
    fd.set('full_name', 'Test')
    fd.set('employment_type', 'regular')
    fd.set('employee_classification', 'direct_labor')
    fd.set('monthly_rate', '0')
    const result = await createEmployee(fd)
    expect(result).toEqual({ error: 'DB error' })
  })
})

describe('updateEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await updateEmployee('emp-1', new FormData())
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('updates employee and returns empty object on success', async () => {
    const fd = new FormData()
    fd.set('full_name', 'Updated Name')
    fd.set('employment_type', 'regular')
    fd.set('employee_classification', 'direct_labor')
    fd.set('employment_status', 'active')
    fd.set('monthly_rate', '30000')
    const result = await updateEmployee('emp-1', fd)
    expect(mockUpdate).toHaveBeenCalledOnce()
    expect(mockEq).toHaveBeenCalledWith('id', 'emp-1')
    expect(result).toEqual({})
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- app/\(dashboard\)/employees/__tests__/actions.test.ts
```

Expected: FAIL — `Cannot find module '../actions'`

- [ ] **Step 3: Implement actions.ts**

Create `app/(dashboard)/employees/actions.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type {
  EmploymentType, EmployeeClassification, EmploymentStatus, Sex, MaritalStatus,
} from '@/types/database.types'

function str(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string | null)?.trim()
  return v || null
}

export async function createEmployee(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('employees').insert({
    full_name: (formData.get('full_name') as string).trim(),
    birthday: str(formData, 'birthday'),
    address: str(formData, 'address'),
    contact_number: str(formData, 'contact_number'),
    emergency_contact_name: str(formData, 'emergency_contact_name'),
    emergency_contact_number: str(formData, 'emergency_contact_number'),
    position: str(formData, 'position'),
    department: str(formData, 'department'),
    employment_type: formData.get('employment_type') as EmploymentType,
    employee_classification: formData.get('employee_classification') as EmployeeClassification,
    sex: (str(formData, 'sex') as Sex | null),
    marital_status: (str(formData, 'marital_status') as MaritalStatus | null),
    date_hired: str(formData, 'date_hired'),
    date_regularized: str(formData, 'date_regularized'),
    employment_status: (formData.get('employment_status') as EmploymentStatus) || 'active',
    monthly_rate: parseFloat(formData.get('monthly_rate') as string) || 0,
    sss_number: str(formData, 'sss_number'),
    philhealth_number: str(formData, 'philhealth_number'),
    pagibig_number: str(formData, 'pagibig_number'),
    tin: str(formData, 'tin'),
  })

  if (error) return { error: error.message }
  revalidatePath('/employees')
  return {}
}

export async function updateEmployee(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('employees').update({
    full_name: (formData.get('full_name') as string).trim(),
    birthday: str(formData, 'birthday'),
    address: str(formData, 'address'),
    contact_number: str(formData, 'contact_number'),
    emergency_contact_name: str(formData, 'emergency_contact_name'),
    emergency_contact_number: str(formData, 'emergency_contact_number'),
    position: str(formData, 'position'),
    department: str(formData, 'department'),
    employment_type: formData.get('employment_type') as EmploymentType,
    employee_classification: formData.get('employee_classification') as EmployeeClassification,
    sex: (str(formData, 'sex') as Sex | null),
    marital_status: (str(formData, 'marital_status') as MaritalStatus | null),
    date_hired: str(formData, 'date_hired'),
    date_regularized: str(formData, 'date_regularized'),
    employment_status: formData.get('employment_status') as EmploymentStatus,
    monthly_rate: parseFloat(formData.get('monthly_rate') as string) || 0,
    sss_number: str(formData, 'sss_number'),
    philhealth_number: str(formData, 'philhealth_number'),
    pagibig_number: str(formData, 'pagibig_number'),
    tin: str(formData, 'tin'),
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/employees')
  revalidatePath(`/employees/${id}`)
  return {}
}

export async function uploadDocument(
  employeeId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File
  const label = (formData.get('label') as string | null)?.trim()
  if (!file || file.size === 0) return { error: 'No file selected' }
  if (!label) return { error: 'Label is required' }

  const ext = file.name.split('.').pop()
  const path = `${employeeId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('employee-documents')
    .upload(path, await file.arrayBuffer(), { contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { error: dbError } = await supabase.from('employee_documents').insert({
    employee_id: employeeId,
    label,
    file_url: path,
  })

  if (dbError) {
    await supabase.storage.from('employee-documents').remove([path])
    return { error: dbError.message }
  }

  revalidatePath(`/employees/${employeeId}`)
  return {}
}

export async function deleteDocument(
  docId: string,
  filePath: string,
  employeeId: string,
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.storage.from('employee-documents').remove([filePath])
  const { error } = await supabase.from('employee_documents').delete().eq('id', docId)
  if (error) return { error: error.message }

  revalidatePath(`/employees/${employeeId}`)
  return {}
}

export async function getSignedDocumentUrl(
  filePath: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.storage
    .from('employee-documents')
    .createSignedUrl(filePath, 3600)
  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- app/\(dashboard\)/employees/__tests__/actions.test.ts
```

Expected: PASS — 5 tests

- [ ] **Step 5: Create EmployeeForm client component**

Create `components/employees/employee-form.tsx`:

```tsx
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
```

- [ ] **Step 6: Create New Employee page**

Create `app/(dashboard)/employees/new/page.tsx`:

```tsx
import { createEmployee } from '../actions'
import { EmployeeForm } from '@/components/employees/employee-form'

export default function NewEmployeePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Employee</h1>
        <p className="text-sm text-slate-500 mt-1">Fill in the employee's details below.</p>
      </div>
      <EmployeeForm action={createEmployee} submitLabel="Add Employee" />
    </div>
  )
}
```

- [ ] **Step 7: Run all tests**

```bash
npm run test:run
```

Expected: PASS — all tests (badge: 4, actions: 5, sidebar: 3, client: 1, payroll-dates: 3 = 16 total)

- [ ] **Step 8: Commit**

```bash
git add components/employees/employee-form.tsx components/employees/employee-table.tsx \
        app/\(dashboard\)/employees/actions.ts app/\(dashboard\)/employees/new/ \
        app/\(dashboard\)/employees/__tests__/
git commit -m "feat: add employee create action, form, and new employee page"
```

---

## Task 4: Employee detail and edit page

**Files:**
- Create: `app/(dashboard)/employees/[id]/page.tsx`

- [ ] **Step 1: Create employee detail page**

Create `app/(dashboard)/employees/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeForm } from '@/components/employees/employee-form'
import { DocumentManager } from '@/components/employees/document-manager'
import { updateEmployee, uploadDocument, deleteDocument } from '../actions'
import type { Employee } from '@/types/database.types'

interface EmployeeDocument {
  id: string
  label: string
  file_url: string
  uploaded_at: string
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (!employee) notFound()

  const { data: documents } = await supabase
    .from('employee_documents')
    .select('id, label, file_url, uploaded_at')
    .eq('employee_id', id)
    .order('uploaded_at', { ascending: false })

  const updateAction = updateEmployee.bind(null, id)
  const uploadAction = uploadDocument.bind(null, id)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{employee.full_name}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {employee.position ?? 'No position'}
          {employee.department ? ` · ${employee.department}` : ''}
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({(documents ?? []).length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="pt-6">
          <EmployeeForm
            initial={employee as Employee}
            action={updateAction}
            submitLabel="Save Changes"
            redirectTo={`/employees/${id}`}
          />
        </TabsContent>
        <TabsContent value="documents" className="pt-6">
          <DocumentManager
            employeeId={id}
            documents={(documents ?? []) as EmployeeDocument[]}
            uploadAction={uploadAction}
            deleteAction={deleteDocument}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
npm run test:run
```

Expected: PASS — all tests

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/employees/\[id\]/
git commit -m "feat: add employee detail and edit page with tabs"
```

---

## Task 5: Document manager component

**Files:**
- Create: `components/employees/document-manager.tsx`

- [ ] **Step 1: Create DocumentManager client component**

Create `components/employees/document-manager.tsx`:

```tsx
'use client'

import { useTransition, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSignedDocumentUrl } from '@/app/(dashboard)/employees/actions'

interface EmployeeDocument {
  id: string
  label: string
  file_url: string
  uploaded_at: string
}

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
```

- [ ] **Step 2: Run all tests**

```bash
npm run test:run
```

Expected: PASS — all tests

- [ ] **Step 3: Manual smoke test**

1. Run `npm run dev`
2. Go to `/employees` — should show empty table with "Add Employee" button
3. Click "Add Employee" — fill in required fields (Full Name, Employment Type, Classification, Monthly Rate) → Submit
4. Should redirect to `/employees` showing the new employee
5. Click "View" → verify Profile tab shows the employee's data, edit a field and "Save Changes"
6. Switch to "Documents" tab → upload a file → verify it appears → click Download → click Delete

- [ ] **Step 4: Commit**

```bash
git add components/employees/document-manager.tsx
git commit -m "feat: add document manager with upload, download, and delete"
```

---

## Self-Review

### Spec coverage
- ✅ Employee list with search and status filter
- ✅ Add employee form with all fields from the `employees` table
- ✅ Edit employee (same form, pre-filled)
- ✅ Employment status management (active/inactive/resigned/terminated)
- ✅ Document upload, download (signed URL), delete
- ✅ All three roles have full access (no role checks needed beyond auth)
- ✅ TDD for badge and actions

### Type consistency
- `EmployeeDocument` interface defined inline in both `[id]/page.tsx` and `document-manager.tsx` — identical shape, avoids a one-use abstraction
- `updateEmployee.bind(null, id)` produces `(formData: FormData) => Promise<{error?: string}>` — matches `EmployeeFormProps.action`
- `uploadDocument.bind(null, id)` produces `(formData: FormData) => Promise<{error?: string}>` — matches `DocumentManagerProps.uploadAction`
