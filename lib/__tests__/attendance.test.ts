import { describe, it, expect } from 'vitest'
import { parseTimeToMinutes, computeAttendanceFields } from '../attendance'

describe('parseTimeToMinutes', () => {
  it('converts 07:00 to 420', () => {
    expect(parseTimeToMinutes('07:00')).toBe(420)
  })

  it('converts 16:00 to 960', () => {
    expect(parseTimeToMinutes('16:00')).toBe(960)
  })

  it('converts 07:30 to 450', () => {
    expect(parseTimeToMinutes('07:30')).toBe(450)
  })

  it('converts 07:37 to 457', () => {
    expect(parseTimeToMinutes('07:37')).toBe(457)
  })
})

describe('computeAttendanceFields', () => {
  it('returns all zeros for absent status', () => {
    const result = computeAttendanceFields('absent', null, null)
    expect(result).toEqual({ tardiness_minutes: 0, undertime_minutes: 0, overtime_hours: 0, is_overtime: false })
  })

  it('returns all zeros for on_leave status', () => {
    const result = computeAttendanceFields('on_leave', null, null)
    expect(result).toEqual({ tardiness_minutes: 0, undertime_minutes: 0, overtime_hours: 0, is_overtime: false })
  })

  it('computes tardiness when present and time_in is after 07:00', () => {
    const result = computeAttendanceFields('present', '07:15', '16:00')
    expect(result.tardiness_minutes).toBe(15)
    expect(result.undertime_minutes).toBe(0)
  })

  it('no tardiness when time_in is exactly 07:00', () => {
    const result = computeAttendanceFields('present', '07:00', '16:00')
    expect(result.tardiness_minutes).toBe(0)
  })

  it('computes undertime when present and time_out is before 16:00', () => {
    const result = computeAttendanceFields('present', '07:00', '15:30')
    expect(result.undertime_minutes).toBe(30)
    expect(result.tardiness_minutes).toBe(0)
  })

  it('computes overtime hours when time_out is after 16:00', () => {
    const result = computeAttendanceFields('present', '07:00', '17:00')
    expect(result.overtime_hours).toBe(1)
    expect(result.is_overtime).toBe(true)
    expect(result.undertime_minutes).toBe(0)
  })

  it('no tardiness for half_day_pm status', () => {
    const result = computeAttendanceFields('half_day_pm', '12:00', '16:00')
    expect(result.tardiness_minutes).toBe(0)
  })

  it('no undertime for half_day_am status', () => {
    const result = computeAttendanceFields('half_day_am', '07:00', '12:00')
    expect(result.undertime_minutes).toBe(0)
  })

  it('computes undertime for half_day_pm when time_out is before 16:00', () => {
    // half_day_pm starts at noon, expected to stay until 4 PM — leaving at 15:00 = 60 min undertime
    const result = computeAttendanceFields('half_day_pm', '12:00', '15:00')
    expect(result.undertime_minutes).toBe(60)
    expect(result.tardiness_minutes).toBe(0)
  })

  it('overtime still applies for half_day_am', () => {
    const result = computeAttendanceFields('half_day_am', '07:00', '17:00')
    expect(result.overtime_hours).toBe(1)
    expect(result.is_overtime).toBe(true)
  })
})
