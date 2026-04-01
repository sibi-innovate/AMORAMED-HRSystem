import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CalendarCheck,
  Palmtree,
  Banknote,
  Star,
  BarChart3,
  Settings,
} from 'lucide-react'
import { SidebarNavItem } from './sidebar-nav-item'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { href: '/daily-operations', label: 'Daily Operations', icon: <ClipboardList size={16} /> },
  { href: '/employees', label: 'Employees', icon: <Users size={16} /> },
  { href: '/attendance', label: 'Attendance', icon: <CalendarCheck size={16} /> },
  { href: '/leaves', label: 'Leave Management', icon: <Palmtree size={16} /> },
  { href: '/payroll', label: 'Payroll', icon: <Banknote size={16} /> },
  { href: '/performance', label: 'Performance', icon: <Star size={16} /> },
  { href: '/reports', label: 'Reports', icon: <BarChart3 size={16} /> },
  { href: '/settings', label: 'Settings', icon: <Settings size={16} /> },
]

export function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-slate-200 flex flex-col">
      <div className="px-4 py-5 border-b border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AMORAMED</p>
        <p className="text-sm font-bold text-slate-800 mt-0.5">HR System</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  )
}
