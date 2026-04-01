import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

interface ContributionDue {
  label: string
  dueDate: string
}

interface ContributionsReminderWidgetProps {
  contributions: ContributionDue[]
}

export function ContributionsReminderWidget({ contributions }: ContributionsReminderWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">Gov't Contributions Due</CardTitle>
        <Bell size={16} className="text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {contributions.map((c) => (
            <div key={c.label} className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{c.label}</span>
              <span className="text-xs text-slate-500">{c.dueDate}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
