import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockGetUser,
  mockFrom,
  mockUpsert,
  mockMaybeSingle,
  mockSelect,
  mockEq,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockUpsert: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockSelect: vi.fn(),
  mockEq: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { saveAttendanceRecords } from '../actions'

describe('saveAttendanceRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // holidays query chain: from('holidays').select('type').eq('date', date).maybeSingle()
    mockMaybeSingle.mockResolvedValue({ data: null })
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle })
    mockSelect.mockReturnValue({ eq: mockEq })
    // attendance_records query chain: from('attendance_records').upsert(...)
    mockUpsert.mockResolvedValue({ error: null })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'holidays') return { select: mockSelect }
      if (table === 'attendance_records') return { upsert: mockUpsert }
      return {}
    })
  })

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await saveAttendanceRecords('2026-04-01', [])
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('upserts records and returns empty object on success', async () => {
    const { revalidatePath } = await import('next/cache')
    const rows = [
      { employee_id: 'emp-1', status: 'present' as const, time_in: '07:00', time_out: '16:00', notes: null },
    ]
    const result = await saveAttendanceRecords('2026-04-01', rows)
    expect(mockUpsert).toHaveBeenCalledOnce()
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/daily-operations')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('returns error when date is in the future', async () => {
    const futureDate = '2099-01-01'
    const result = await saveAttendanceRecords(futureDate, [])
    expect(result).toEqual({ error: 'Cannot save attendance for a future date' })
  })

  it('sets is_holiday true when date matches a holiday', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { type: 'regular' } })
    const rows = [
      { employee_id: 'emp-1', status: 'present' as const, time_in: '07:00', time_out: '16:00', notes: null },
    ]
    await saveAttendanceRecords('2026-03-26', rows)
    const upsertArg = mockUpsert.mock.calls[0][0]
    expect(upsertArg[0].is_holiday).toBe(true)
    expect(upsertArg[0].holiday_type).toBe('regular')
  })

  it('returns error when upsert fails', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'DB error' } })
    const result = await saveAttendanceRecords('2026-04-01', [
      { employee_id: 'emp-1', status: 'present' as const, time_in: '07:00', time_out: '16:00', notes: null },
    ])
    expect(result).toEqual({ error: 'DB error' })
  })
})
