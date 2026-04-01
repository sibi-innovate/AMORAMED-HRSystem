export type EmploymentType = 'regular' | 'part_time' | 'contractual' | 'licensed_professional'
export type EmployeeClassification = 'direct_labor' | 'general_salaries'
export type EmploymentStatus = 'active' | 'inactive' | 'resigned' | 'terminated'
export type Sex = 'male' | 'female'
export type MaritalStatus = 'single' | 'married' | 'widowed' | 'separated'
export type UserRole = 'admin' | 'manager' | 'owner'
export type AttendanceStatus = 'present' | 'absent' | 'half_day_am' | 'half_day_pm' | 'on_leave'
export type HolidayType = 'regular' | 'special'
export type LeaveType = 'sil' | 'sl' | 'maternity' | 'paternity' | 'solo_parent'
export type PayrollStatus = 'draft' | 'finalized'
export type EvaluatorType = 'self' | 'peer' | 'supervisor'
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'
export type CycleStatus = 'open' | 'closed'

export interface Employee {
  id: string
  full_name: string
  birthday: string | null
  address: string | null
  contact_number: string | null
  emergency_contact_name: string | null
  emergency_contact_number: string | null
  position: string | null
  department: string | null
  employment_type: EmploymentType
  employee_classification: EmployeeClassification
  sex: Sex | null
  marital_status: MaritalStatus | null
  date_hired: string | null
  date_regularized: string | null
  employment_status: EmploymentStatus
  monthly_rate: number
  sss_number: string | null
  philhealth_number: string | null
  pagibig_number: string | null
  tin: string | null
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  employee_id: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface Holiday {
  id: string
  name: string
  date: string
  type: HolidayType
  is_recurring: boolean
  created_at: string
}

export interface AttendanceRecord {
  id: string
  employee_id: string
  date: string
  status: AttendanceStatus
  time_in: string | null
  time_out: string | null
  is_overtime: boolean
  overtime_hours: number
  is_holiday: boolean
  holiday_type: HolidayType | null
  tardiness_minutes: number
  undertime_minutes: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LeaveCredit {
  id: string
  employee_id: string
  leave_type: LeaveType
  year: number
  total_credits: number
  used_credits: number
  remaining_credits: number
  updated_at: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  number_of_days: number
  filed_by: string | null
  notes: string | null
  status: 'approved' | 'cancelled'
  created_at: string
}

export interface PayrollRun {
  id: string
  period_label: string
  period_start: string
  period_end: string
  pay_date: string
  status: PayrollStatus
  created_by: string | null
  created_at: string
  finalized_at: string | null
}

export interface PayrollItem {
  id: string
  payroll_run_id: string
  employee_id: string
  basic_pay: number
  saturday_regular_pay: number
  saturday_premium_pay: number
  overtime_pay: number
  holiday_pay: number
  gross_pay: number
  tardiness_deduction: number
  absence_deduction: number
  sss_employee: number
  philhealth_employee: number
  pagibig_employee: number
  withholding_tax: number
  total_deductions: number
  net_pay: number
  created_at: string
}

export interface GovernmentContribution {
  id: string
  employee_id: string
  month: number
  year: number
  sss_employee: number
  sss_employer: number
  philhealth_employee: number
  philhealth_employer: number
  pagibig_employee: number
  pagibig_employer: number
  bir_withheld: number
  created_at: string
}

export interface PerformanceCycle {
  id: string
  quarter: Quarter
  year: number
  status: CycleStatus
  created_at: string
}

export interface EmployeeDocument {
  id: string
  label: string
  file_url: string
  uploaded_at: string
}

export interface PerformanceEvaluation {
  id: string
  cycle_id: string
  employee_id: string
  evaluator_id: string | null
  evaluator_type: EvaluatorType
  work_quality: number | null
  punctuality: number | null
  teamwork: number | null
  job_knowledge: number | null
  initiative: number | null
  average_score: number | null
  comments: string | null
  submitted_at: string
}
