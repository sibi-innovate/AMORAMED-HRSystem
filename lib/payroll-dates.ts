interface PayPeriodResult {
  periodLabel: string
  payDate: string
  daysUntilPayday: number
  periodStart: Date
  periodEnd: Date
  payDateObj: Date
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDate(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatShortDate(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`
}

function lastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0)
}

function diffInDays(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((to.getTime() - from.getTime()) / msPerDay)
}

export function getNextPayPeriod(today: Date): PayPeriodResult {
  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()

  let periodStart: Date
  let periodEnd: Date
  let payDateObj: Date

  if (day >= 11 && day <= 25) {
    // Period 2: 11th–25th, paid last day of this month
    periodStart = new Date(year, month, 11)
    periodEnd = new Date(year, month, 25)
    payDateObj = lastDayOfMonth(year, month)
  } else {
    // Period 1: 26th–10th, paid 15th of next month
    if (day >= 26) {
      periodStart = new Date(year, month, 26)
      periodEnd = new Date(year + (month === 11 ? 1 : 0), (month + 1) % 12, 10)
      payDateObj = new Date(year + (month === 11 ? 1 : 0), (month + 1) % 12, 15)
    } else {
      // day <= 10: in the tail end of previous period
      periodStart = new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, 26)
      periodEnd = new Date(year, month, 10)
      payDateObj = new Date(year, month, 15)
    }
  }

  const periodLabel = `${formatShortDate(periodStart)} – ${formatShortDate(periodEnd)}, ${periodEnd.getFullYear()}`
  const payDate = formatDate(payDateObj)
  const daysUntilPayday = diffInDays(today, payDateObj)

  return { periodLabel, payDate, daysUntilPayday, periodStart, periodEnd, payDateObj }
}
