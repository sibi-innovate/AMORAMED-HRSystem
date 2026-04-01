import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmployeeStatusBadge } from '../employee-status-badge'

describe('EmployeeStatusBadge', () => {
  it('renders "Active" for active status', () => {
    render(<EmployeeStatusBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders "Resigned" for resigned status', () => {
    render(<EmployeeStatusBadge status="resigned" />)
    expect(screen.getByText('Resigned')).toBeInTheDocument()
  })

  it('renders "Terminated" for terminated status', () => {
    render(<EmployeeStatusBadge status="terminated" />)
    expect(screen.getByText('Terminated')).toBeInTheDocument()
  })

  it('renders "Inactive" for inactive status', () => {
    render(<EmployeeStatusBadge status="inactive" />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
