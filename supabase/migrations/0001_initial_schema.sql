-- =============================================
-- AMORAMED HR System — Initial Schema
-- =============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- =============================================
-- EMPLOYEES
-- =============================================
create table employees (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  birthday date,
  address text,
  contact_number text,
  emergency_contact_name text,
  emergency_contact_number text,
  position text,
  department text,
  employment_type text not null check (employment_type in ('regular','part_time','contractual','licensed_professional')),
  employee_classification text not null check (employee_classification in ('direct_labor','general_salaries')),
  sex text check (sex in ('male','female')),
  marital_status text check (marital_status in ('single','married','widowed','separated')),
  date_hired date,
  date_regularized date,
  employment_status text not null default 'active' check (employment_status in ('active','inactive','resigned','terminated')),
  monthly_rate numeric(10,2) not null default 0,
  sss_number text,
  philhealth_number text,
  pagibig_number text,
  tin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- EMPLOYEE DOCUMENTS
-- =============================================
create table employee_documents (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  label text not null,
  file_url text not null,
  uploaded_at timestamptz not null default now()
);

-- =============================================
-- USERS (linked to Supabase Auth)
-- =============================================
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id uuid references employees(id) on delete set null,
  role text not null check (role in ('admin','manager','owner')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================
-- HOLIDAYS
-- =============================================
create table holidays (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  date date not null,
  type text not null check (type in ('regular','special')),
  is_recurring boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seed Philippine Regular Holidays
insert into holidays (name, date, type, is_recurring) values
  ('New Year''s Day', '2026-01-01', 'regular', true),
  ('Araw ng Kagitingan', '2026-04-09', 'regular', true),
  ('Labor Day', '2026-05-01', 'regular', true),
  ('Independence Day', '2026-06-12', 'regular', true),
  ('National Heroes Day', '2026-08-31', 'regular', false),
  ('Bonifacio Day', '2026-11-30', 'regular', true),
  ('Christmas Day', '2026-12-25', 'regular', true),
  ('Rizal Day', '2026-12-30', 'regular', true);

-- =============================================
-- ATTENDANCE RECORDS
-- =============================================
create table attendance_records (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present','absent','half_day_am','half_day_pm','on_leave')),
  time_in time,
  time_out time,
  is_overtime boolean not null default false,
  overtime_hours numeric(4,2) not null default 0,
  is_holiday boolean not null default false,
  holiday_type text check (holiday_type in ('regular','special')),
  tardiness_minutes integer not null default 0,
  undertime_minutes integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(employee_id, date)
);

-- =============================================
-- LEAVE CREDITS
-- =============================================
create table leave_credits (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  leave_type text not null check (leave_type in ('sil','sl','maternity','paternity','solo_parent')),
  year integer not null,
  total_credits numeric(5,2) not null default 0,
  used_credits numeric(5,2) not null default 0,
  remaining_credits numeric(5,2) generated always as (total_credits - used_credits) stored,
  updated_at timestamptz not null default now(),
  unique(employee_id, leave_type, year)
);

-- =============================================
-- LEAVE REQUESTS
-- =============================================
create table leave_requests (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  leave_type text not null check (leave_type in ('sil','sl','maternity','paternity','solo_parent')),
  start_date date not null,
  end_date date not null,
  number_of_days numeric(5,2) not null,
  filed_by uuid references user_profiles(id),
  notes text,
  status text not null default 'approved' check (status in ('approved','cancelled')),
  created_at timestamptz not null default now()
);

-- =============================================
-- PAYROLL RUNS
-- =============================================
create table payroll_runs (
  id uuid primary key default uuid_generate_v4(),
  period_label text not null,
  period_start date not null,
  period_end date not null,
  pay_date date not null,
  status text not null default 'draft' check (status in ('draft','finalized')),
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  finalized_at timestamptz
);

-- =============================================
-- PAYROLL ITEMS (one row per employee per run)
-- =============================================
create table payroll_items (
  id uuid primary key default uuid_generate_v4(),
  payroll_run_id uuid not null references payroll_runs(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  -- Earnings
  basic_pay numeric(10,2) not null default 0,
  saturday_regular_pay numeric(10,2) not null default 0,
  saturday_premium_pay numeric(10,2) not null default 0,
  overtime_pay numeric(10,2) not null default 0,
  holiday_pay numeric(10,2) not null default 0,
  gross_pay numeric(10,2) not null default 0,
  -- Deductions
  tardiness_deduction numeric(10,2) not null default 0,
  absence_deduction numeric(10,2) not null default 0,
  sss_employee numeric(10,2) not null default 0,
  philhealth_employee numeric(10,2) not null default 0,
  pagibig_employee numeric(10,2) not null default 0,
  withholding_tax numeric(10,2) not null default 0,
  total_deductions numeric(10,2) not null default 0,
  net_pay numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(payroll_run_id, employee_id)
);

-- =============================================
-- GOVERNMENT CONTRIBUTIONS (monthly record)
-- =============================================
create table government_contributions (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null,
  sss_employee numeric(10,2) not null default 0,
  sss_employer numeric(10,2) not null default 0,
  philhealth_employee numeric(10,2) not null default 0,
  philhealth_employer numeric(10,2) not null default 0,
  pagibig_employee numeric(10,2) not null default 0,
  pagibig_employer numeric(10,2) not null default 0,
  bir_withheld numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(employee_id, month, year)
);

-- =============================================
-- PERFORMANCE CYCLES
-- =============================================
create table performance_cycles (
  id uuid primary key default uuid_generate_v4(),
  quarter text not null check (quarter in ('Q1','Q2','Q3','Q4')),
  year integer not null,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  unique(quarter, year)
);

-- =============================================
-- PERFORMANCE EVALUATIONS
-- =============================================
create table performance_evaluations (
  id uuid primary key default uuid_generate_v4(),
  cycle_id uuid not null references performance_cycles(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  evaluator_id uuid references user_profiles(id),
  evaluator_type text not null check (evaluator_type in ('self','peer','supervisor')),
  work_quality numeric(2,1) check (work_quality between 1 and 5),
  punctuality numeric(2,1) check (punctuality between 1 and 5),
  teamwork numeric(2,1) check (teamwork between 1 and 5),
  job_knowledge numeric(2,1) check (job_knowledge between 1 and 5),
  initiative numeric(2,1) check (initiative between 1 and 5),
  average_score numeric(3,2) generated always as (
    (work_quality + punctuality + teamwork + job_knowledge + initiative) / 5.0
  ) stored,
  comments text,
  submitted_at timestamptz not null default now()
);

-- =============================================
-- AUTO-UPDATE updated_at TRIGGER
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger employees_updated_at
  before update on employees
  for each row execute function update_updated_at();

create trigger attendance_updated_at
  before update on attendance_records
  for each row execute function update_updated_at();
