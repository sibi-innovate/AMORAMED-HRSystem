'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { EmployeeStatusBadge } from './employee-status-badge'
import type { Employee, EmploymentStatus } from '@/types/database.types'

export function EmployeeTable({ employees }: { employees: Employee[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus | 'all'>('all')

  const filtered = employees.filter(e => {
    const matchesSearch = e.full_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.employment_status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as EmploymentStatus | 'all')}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="resigned">Resigned</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Monthly Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                No employees found.
              </TableCell>
            </TableRow>
          )}
          {filtered.map(emp => (
            <TableRow key={emp.id}>
              <TableCell className="font-medium">{emp.full_name}</TableCell>
              <TableCell>{emp.position ?? '—'}</TableCell>
              <TableCell>{emp.department ?? '—'}</TableCell>
              <TableCell className="capitalize">{emp.employment_type.replace(/_/g, ' ')}</TableCell>
              <TableCell>
                ₱{emp.monthly_rate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <EmployeeStatusBadge status={emp.employment_status} />
              </TableCell>
              <TableCell>
                <Link href={`/employees/${emp.id}`} className="text-sm text-blue-600 hover:underline">
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
