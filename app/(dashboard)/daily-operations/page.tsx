import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DateNav } from '@/components/daily-operations/date-nav'
import { AttendanceTable } from '@/components/daily-operations/attendance-table'
import { saveAttendanceRecords } from './actions'
import type { Employee, AttendanceRecord } from '@/types/database.types'

export default async function DailyOperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams
  const date = dateParam ?? new Date().toISOString().split('T')[0]

  const supabase = await createServerSupabaseClient()

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('employment_status', 'active')
    .order('full_name')

  const { data: records } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('date', date)

  const recordsMap: Record<string, AttendanceRecord> = {}
  for (const r of records ?? []) {
    recordsMap[r.employee_id] = r as AttendanceRecord
  }

  // Check if selected date is a holiday for the banner
  const { data: holiday } = await supabase
    .from('holidays')
    .select('name, type')
    .eq('date', date)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daily Operations</h1>
        <p className="text-sm text-slate-500 mt-1">Log daily attendance for all active employees</p>
      </div>

      <DateNav date={date} />

      {holiday && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <span className="font-semibold">
            {holiday.type === 'regular' ? 'Regular Holiday' : 'Special Non-Working Holiday'}:
          </span>
          <span>{holiday.name}</span>
        </div>
      )}

      <AttendanceTable
        date={date}
        employees={(employees ?? []) as Employee[]}
        initialRecords={recordsMap}
        saveAction={saveAttendanceRecords}
      />
    </div>
  )
}
