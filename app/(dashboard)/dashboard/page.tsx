import { createServerSupabaseClient } from '@/lib/supabase/server'
import { HeadcountWidget } from '@/components/dashboard/headcount-widget'
import { AbsencesWidget } from '@/components/dashboard/absences-widget'
import { UpcomingPayrollWidget } from '@/components/dashboard/upcoming-payroll-widget'
import { ContributionsReminderWidget } from '@/components/dashboard/contributions-reminder-widget'
import { getNextPayPeriod } from '@/lib/payroll-dates'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Active employee count
  const { count: headcount } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('employment_status', 'active')

  // Today's absences
  const { data: absentRecords } = await supabase
    .from('attendance_records')
    .select('employee_id, employees(id, full_name)')
    .eq('date', todayStr)
    .eq('status', 'absent')

  const absentEmployees = (absentRecords ?? []).map((r: any) => ({
    id: r.employees.id,
    full_name: r.employees.full_name,
  }))

  // Next pay period
  const payPeriod = getNextPayPeriod(today)

  // Government contributions due dates (fixed monthly schedule)
  const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][today.getMonth()]
  const contributions = [
    { label: 'SSS', dueDate: `${monthName} 31` },
    { label: 'PhilHealth', dueDate: `${monthName} 31` },
    { label: 'Pag-IBIG', dueDate: `${monthName} 15` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          {today.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HeadcountWidget count={headcount ?? 0} />
        <AbsencesWidget
          date={today.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
          absentEmployees={absentEmployees}
        />
        <UpcomingPayrollWidget
          payDate={payPeriod.payDate}
          periodLabel={payPeriod.periodLabel}
          daysUntilPayday={payPeriod.daysUntilPayday}
        />
        <ContributionsReminderWidget contributions={contributions} />
      </div>
    </div>
  )
}
