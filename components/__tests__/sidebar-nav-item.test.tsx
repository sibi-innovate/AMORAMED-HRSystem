import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

import { SidebarNavItem } from '../sidebar-nav-item'

describe('SidebarNavItem', () => {
  it('renders the label and link', () => {
    render(<SidebarNavItem href="/dashboard" label="Dashboard" icon={null} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard')
  })

  it('applies active styles when href matches pathname', () => {
    render(<SidebarNavItem href="/dashboard" label="Dashboard" icon={null} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('bg-slate-100')
  })

  it('does not apply active styles when href does not match pathname', () => {
    render(<SidebarNavItem href="/employees" label="Employees" icon={null} />)
    const link = screen.getByRole('link')
    expect(link.className).not.toContain('bg-slate-100')
  })
})
