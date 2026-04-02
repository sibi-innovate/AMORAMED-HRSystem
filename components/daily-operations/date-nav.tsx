'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateNavProps {
  date: string // YYYY-MM-DD
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export function DateNav({ date }: DateNavProps) {
  const router = useRouter()

  function navigate(to: string) {
    router.push(`/daily-operations?date=${to}`)
  }

  const today = new Date().toISOString().split('T')[0]
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => navigate(addDays(date, -1))}>
        <ChevronLeft size={14} />
      </Button>
      <span className="text-sm font-medium text-slate-700 min-w-[260px] text-center">
        {displayDate}
      </span>
      <Button variant="outline" size="sm" onClick={() => navigate(addDays(date, 1))}>
        <ChevronRight size={14} />
      </Button>
      {date !== today && (
        <Button variant="outline" size="sm" onClick={() => navigate(today)}>
          Today
        </Button>
      )}
    </div>
  )
}
