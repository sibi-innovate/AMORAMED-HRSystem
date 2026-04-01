import { AttendanceStatus } from '@/types/database.types'

/**
 * Converts a time string (HH:MM format) to minutes since midnight
 * @param time Time string in HH:MM format (e.g., "07:00", "16:30")
 * @returns Number of minutes since midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

interface AttendanceFields {
  tardiness_minutes: number
  undertime_minutes: number
  overtime_hours: number
  is_overtime: boolean
}

/**
 * Computes attendance fields (tardiness, undertime, OT) based on status and times
 *
 * Business rules:
 * - Work schedule: 7:00 AM (420 min) – 4:00 PM (960 min)
 * - present: tardiness if timeIn > 07:00; undertime if timeOut < 16:00; OT if timeOut > 16:00
 * - half_day_am: tardiness applies; undertime does NOT (intentional); OT still applies
 * - half_day_pm: tardiness does NOT apply (intentional late start); undertime applies; OT still applies
 * - absent / on_leave: all zeros
 *
 * @param status The attendance status
 * @param timeIn Time in (HH:MM format), nullable for absent/on_leave
 * @param timeOut Time out (HH:MM format), nullable for absent/on_leave
 * @returns Object with tardiness_minutes, undertime_minutes, overtime_hours, is_overtime
 */
export function computeAttendanceFields(
  status: AttendanceStatus,
  timeIn: string | null,
  timeOut: string | null
): AttendanceFields {
  // For absent and on_leave, return all zeros
  if (status === 'absent' || status === 'on_leave') {
    return {
      tardiness_minutes: 0,
      undertime_minutes: 0,
      overtime_hours: 0,
      is_overtime: false,
    }
  }

  // Work schedule constants
  const SHIFT_START = 420 // 7:00 AM in minutes
  const SHIFT_END = 960 // 4:00 PM in minutes

  let tardiness_minutes = 0
  let undertime_minutes = 0
  let overtime_hours = 0
  let is_overtime = false

  // Parse times - they should never be null for present/half_day statuses in normal usage,
  // but handle gracefully
  const timeInMinutes = timeIn ? parseTimeToMinutes(timeIn) : SHIFT_START
  const timeOutMinutes = timeOut ? parseTimeToMinutes(timeOut) : SHIFT_END

  // Calculate tardiness (only for present and half_day_am)
  if (status === 'present' || status === 'half_day_am') {
    if (timeInMinutes > SHIFT_START) {
      tardiness_minutes = timeInMinutes - SHIFT_START
    }
  }

  // Calculate undertime (only for present and half_day_pm)
  if (status === 'present' || status === 'half_day_pm') {
    if (timeOutMinutes < SHIFT_END) {
      undertime_minutes = SHIFT_END - timeOutMinutes
    }
  }

  // Calculate overtime (applies to all active statuses)
  if (timeOutMinutes > SHIFT_END) {
    const overtimeMinutes = timeOutMinutes - SHIFT_END
    overtime_hours = overtimeMinutes / 60
    is_overtime = true
  }

  return {
    tardiness_minutes,
    undertime_minutes,
    overtime_hours,
    is_overtime,
  }
}
