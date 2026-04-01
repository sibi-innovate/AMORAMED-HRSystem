import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface HeadcountWidgetProps {
  count: number
}

export function HeadcountWidget({ count }: HeadcountWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">Active Employees</CardTitle>
        <Users size={16} className="text-slate-400" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-slate-900">{count}</p>
      </CardContent>
    </Card>
  )
}
