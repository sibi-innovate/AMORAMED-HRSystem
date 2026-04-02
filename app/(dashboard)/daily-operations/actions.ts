'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { computeAttendanceFields } from '@/lib/attendance'
import type { AttendanceStatus } from '@/types/database.types'

export interface AttendanceRowInput {
  employee_id: string
  status: AttendanceStatus
  time_in: string | null
  time_out: string | null
  notes: string | null
}

export async function saveAttendanceRecords(
  date: string,
  rows: AttendanceRowInput[],
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const today = new Date().toISOString().split('T')[0]
  if (date > today) return { error: 'Cannot save attendance for a future date' }

  const { data: holiday } = await supabase
    .from('holidays')
    .select('type')
    .eq('date', date)
    .maybeSingle()

  const is_holiday = !!holiday
  const holiday_type = holiday?.type ?? null

  const records = rows.map(row => {
    const computed = computeAttendanceFields(row.status, row.time_in, row.time_out)
    return {
      employee_id: row.employee_id,
      date,
      status: row.status,
      time_in: row.time_in || null,
      time_out: row.time_out || null,
      is_overtime: computed.is_overtime,
      overtime_hours: computed.overtime_hours,
      is_holiday,
      holiday_type,
      tardiness_minutes: computed.tardiness_minutes,
      undertime_minutes: computed.undertime_minutes,
      notes: row.notes,
    }
  })

  const { error } = await supabase
    .from('attendance_records')
    .upsert(records, { onConflict: 'employee_id,date' })

  if (error) return { error: error.message }
  revalidatePath('/daily-operations')
  revalidatePath('/dashboard')
  return {}
}
