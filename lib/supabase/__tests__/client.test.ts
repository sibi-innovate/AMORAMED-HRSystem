import { describe, it, expect, vi } from 'vitest'

// Mock the supabase-js module
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth: {}, from: vi.fn() })),
}))

describe('createBrowserClient', () => {
  it('returns a supabase client object with auth and from', async () => {
    const { createBrowserSupabaseClient } = await import('../client')
    const client = createBrowserSupabaseClient()
    expect(client).toHaveProperty('auth')
    expect(client).toHaveProperty('from')
  })
})
