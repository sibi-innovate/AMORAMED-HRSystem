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

  const { error: storageError } = await supabase.storage.from('employee-documents').remove([filePath])
  // Proceed if the file is already gone (not found); abort on other errors
  if (storageError && !storageError.message.includes('not found')) {
    return { error: storageError.message }
  }
  const { error } = await supabase.from('employee_documents').delete().eq('id', docId)
  if (error) return { error: error.message }

  revalidatePath(`/employees/${employeeId}`)
  return {}
}

export async function getSignedDocumentUrl(
  filePath: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data, error } = await supabase.storage
    .from('employee-documents')
    .createSignedUrl(filePath, 3600)
  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
