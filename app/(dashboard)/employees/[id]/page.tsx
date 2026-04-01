import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeForm } from '@/components/employees/employee-form'
import { DocumentManager } from '@/components/employees/document-manager'
import { updateEmployee, uploadDocument, deleteDocument } from '../actions'
import type { Employee, EmployeeDocument } from '@/types/database.types'

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
