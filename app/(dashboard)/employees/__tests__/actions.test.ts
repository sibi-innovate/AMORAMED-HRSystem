import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockInsert,
  mockUpdate,
  mockEq,
  mockGetUser,
  mockFrom,
} = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockUpdate: vi.fn().mockReturnThis(),
  mockEq: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}))

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
