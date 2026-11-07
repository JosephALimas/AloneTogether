export const categories = [
  'Vivienda',
  'Alimentación',
  'Transporte',
  'Servicios',
  'Salud',
  'Educación',
  'Ocio',
  'Otros',
] as const
export type Category = (typeof categories)[number]
export type Expense = {
  id: string
  name: string
  category: Category
  amount: string
}

// Accept decimal amounts without silently rounding fractional cents or large values.
export function parseAmount(value: string): number | null {
  if (!/^\d{1,9}(?:[.,]\d{1,2})?$/.test(value.trim())) return null
  const [whole, fraction = ''] = value.trim().replace(',', '.').split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

export function summarizeBudget(
  income: number,
  expenses: { category: Category; amount: number }[],
  savings: number,
) {
  const breakdown = categories
    .map((category) => ({
      category,
      amount: expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0),
    }))
    .filter((item) => item.amount > 0)
  const totalExpenses = breakdown.reduce((sum, item) => sum + item.amount, 0)
  return {
    income,
    savings,
    breakdown,
    totalExpenses,
    available: income - totalExpenses - savings,
  }
}

export const money = (minor: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    minor / 100,
  )
