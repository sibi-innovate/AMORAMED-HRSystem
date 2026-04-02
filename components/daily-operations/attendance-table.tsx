'use client'

import { useState, useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { computeAttendanceFields } from '@/lib/attendance'
import type { Employee, AttendanceRecord, AttendanceStatus } from '@/types/database.types'
import type { AttendanceRowInput } from '@/app/(dashboard)/daily-operations/actions'

interface Props {
  date: string
  employees: Employee[]
  initialRecords: Record<string, AttendanceRecord>
  saveAction: (date: string, rows: AttendanceRowInput[]) => Promise<{ error?: string }>
}

interface RowState {
  status: AttendanceStatus
  time_in: string
  time_out: string
  notes: string
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'half_day_am', label: 'Half Day (AM)' },
  { value: 'half_day_pm', label: 'Half Day (PM)' },
  { value: 'on_leave', label: 'On Leave' },
]

function initRow(record: AttendanceRecord | undefined): RowState {
  return {
    status: record?.status ?? 'present',
    time_in: record?.time_in ?? '07:00',
    time_out: record?.time_out ?? '16:00',
    notes: record?.notes ?? '',
  }
}

function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function AttendanceTable({ date, employees, initialRecords, saveAction }: Props) {
  const [rows, setRows] = useState<Record<string, RowState>>(() => {
    const initial: Record<string, RowState> = {}
    for (const emp of employees) {
      initial[emp.id] = initRow(initialRecords[emp.id])
    }
    return initial
  })
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function updateRow(employeeId: string, field: keyof RowState, value: string) {
    setRows(prev => ({ ...prev, [employeeId]: { ...prev[employeeId], [field]: value } }))
    setSaved(false)
  }

  function handleSave() {
    setSaveError(null)
    setSaved(false)
    const rowInputs: AttendanceRowInput[] = employees.map(emp => {
      const row = rows[emp.id]
      const showTime = row.status !== 'absent' && row.status !== 'on_leave'
      return {
        employee_id: emp.id,
        status: row.status,
        time_in: showTime && row.time_in ? row.time_in : null,
        time_out: showTime && row.time_out ? row.time_out : null,
        notes: row.notes || null,
      }
    })
    startTransition(async () => {
      const result = await saveAction(date, rowInputs)
      if (result?.error) {
        setSaveError(result.error)
      } else {
        setSaved(true)
      }
    })
  }

  if (employees.length === 0) {
    return <p className="text-sm text-slate-400 py-4">No active employees found.</p>
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 pr-4 font-semibold text-slate-600 min-w-[160px]">Employee</th>
              <th className="text-left py-2 pr-3 font-semibold text-slate-600 min-w-[150px]">Status</th>
              <th className="text-left py-2 pr-3 font-semibold text-slate-600">Time In</th>
              <th className="text-left py-2 pr-3 font-semibold text-slate-600">Time Out</th>
              <th className="text-left py-2 pr-3 font-semibold text-slate-600">Tardiness</th>
              <th className="text-left py-2 pr-3 font-semibold text-slate-600">Undertime</th>
              <th className="text-left py-2 pr-3 font-semibold text-slate-600">OT Hours</th>
              <th className="text-left py-2 font-semibold text-slate-600 min-w-[140px]">Notes</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              const row = rows[emp.id]
              const showTime = row.status !== 'absent' && row.status !== 'on_leave'
              const computed = showTime
                ? computeAttendanceFields(row.status, row.time_in || null, row.time_out || null)
                : { tardiness_minutes: 0, undertime_minutes: 0, overtime_hours: 0, is_overtime: false }

              return (
                <tr key={emp.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-800">{emp.full_name}</td>
                  <td className="py-2 pr-3">
                    <Select
                      value={row.status}
                      onValueChange={val => updateRow(emp.id, 'status', val as AttendanceStatus)}
                    >
                      <SelectTrigger className="h-8 text-xs w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2 pr-3">
                    {showTime ? (
                      <Input
                        type="time"
                        value={row.time_in}
                        onChange={e => updateRow(emp.id, 'time_in', e.target.value)}
                        className="h-8 text-xs w-[110px]"
                      />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {showTime ? (
                      <Input
                        type="time"
                        value={row.time_out}
                        onChange={e => updateRow(emp.id, 'time_out', e.target.value)}
                        className="h-8 text-xs w-[110px]"
                      />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-slate-500 text-xs">
                    {computed.tardiness_minutes > 0
                      ? <span className="text-amber-600">{formatMinutes(computed.tardiness_minutes)}</span>
                      : '—'}
                  </td>
                  <td className="py-2 pr-3 text-slate-500 text-xs">
                    {computed.undertime_minutes > 0
                      ? <span className="text-amber-600">{formatMinutes(computed.undertime_minutes)}</span>
                      : '—'}
                  </td>
                  <td className="py-2 pr-3 text-slate-500 text-xs">
                    {computed.overtime_hours > 0
                      ? <span className="text-emerald-600">{computed.overtime_hours}h</span>
                      : '—'}
                  </td>
                  <td className="py-2">
                    <Input
                      value={row.notes}
                      onChange={e => updateRow(emp.id, 'notes', e.target.value)}
                      placeholder="optional"
                      className="h-8 text-xs"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Attendance'}
        </Button>
        {saved && <span className="text-sm text-emerald-600">Saved successfully.</span>}
        {saveError && <span className="text-sm text-red-600">{saveError}</span>}
      </div>
    </div>
  )
}
