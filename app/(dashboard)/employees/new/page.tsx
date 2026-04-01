import { createEmployee } from '../actions'
import { EmployeeForm } from '@/components/employees/employee-form'

export default function NewEmployeePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Employee</h1>
        <p className="text-sm text-slate-500 mt-1">Fill in the employee&apos;s details below.</p>
      </div>
      <EmployeeForm action={createEmployee} submitLabel="Add Employee" />
    </div>
  )
}
