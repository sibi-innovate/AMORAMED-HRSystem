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
