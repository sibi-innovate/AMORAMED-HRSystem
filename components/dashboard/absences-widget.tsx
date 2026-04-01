import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserX } from 'lucide-react'

interface AbsentEmployee {
  id: string
  full_name: string
}

interface AbsencesWidgetProps {
  date: string
  absentEmployees: AbsentEmployee[]
}

export function AbsencesWidget({ date, absentEmployees }: AbsencesWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          Absences Today
          <span className="ml-2 text-xs text-slate-400">{date}</span>
        </CardTitle>
        <UserX size={16} className="text-slate-400" />
      </CardHeader>
      <CardContent>
        {absentEmployees.length === 0 ? (
          <p className="text-sm text-slate-500">No absences recorded</p>
        ) : (
          <div className="space-y-1">
            {absentEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{emp.full_name}</span>
                <Badge variant="destructive" className="text-xs">Absent</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
