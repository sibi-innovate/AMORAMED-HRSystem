import { Badge } from '@/components/ui/badge'
import type { EmploymentStatus } from '@/types/database.types'

const statusConfig: Record<EmploymentStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}> = {
  active:     { label: 'Active',     variant: 'default' },
  inactive:   { label: 'Inactive',   variant: 'secondary' },
  resigned:   { label: 'Resigned',   variant: 'outline' },
  terminated: { label: 'Terminated', variant: 'destructive' },
}

export function EmployeeStatusBadge({ status }: { status: EmploymentStatus }) {
  const { label, variant } = statusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}
