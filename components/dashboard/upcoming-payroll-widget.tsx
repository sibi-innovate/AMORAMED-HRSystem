import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Banknote } from 'lucide-react'

interface UpcomingPayrollWidgetProps {
  payDate: string
  periodLabel: string
  daysUntilPayday: number
}

export function UpcomingPayrollWidget({ payDate, periodLabel, daysUntilPayday }: UpcomingPayrollWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">Upcoming Payroll</CardTitle>
        <Banknote size={16} className="text-slate-400" />
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold text-slate-900">{payDate}</p>
        <p className="text-xs text-slate-500 mt-1">{periodLabel}</p>
        <p className="text-xs text-slate-400 mt-1">
          {daysUntilPayday === 0
            ? 'Pay day is today'
            : `${daysUntilPayday} day${daysUntilPayday !== 1 ? 's' : ''} away`}
        </p>
      </CardContent>
    </Card>
  )
}
