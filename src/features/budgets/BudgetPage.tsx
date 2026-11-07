import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  categories,
  money,
  parseAmount,
  summarizeBudget,
  type Expense,
} from './budget'
import './BudgetPage.css'

export function BudgetPage() {
  const nextId = useRef(1)
  const [income, setIncome] = useState('')
  const [savings, setSavings] = useState('')
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '0', name: '', category: 'Vivienda', amount: '' },
  ])
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReturnType<
    typeof summarizeBudget
  > | null>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)

  function invalidate() {
    setResult(null)
    setError('')
  }
  function updateExpense(id: string, patch: Partial<Expense>) {
    invalidate()
    setExpenses((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }
  function calculate(event: FormEvent) {
    event.preventDefault()
    const parsedIncome = parseAmount(income)
    const parsedSavings = savings.trim() === '' ? 0 : parseAmount(savings)
    const parsedExpenses = expenses.map((expense) => ({
      category: expense.category,
      amount: parseAmount(expense.amount),
    }))
    if (
      parsedIncome === null ||
      parsedIncome <= 0 ||
      parsedSavings === null ||
      expenses.some((expense) => !expense.name.trim()) ||
      parsedExpenses.some(
        (expense) => expense.amount === null || expense.amount <= 0,
      )
    ) {
      setError(
        'Revisa los importes: ingresa un ingreso mayor a cero, un nombre para cada gasto y cantidades positivas con hasta dos decimales. El ahorro puede ser cero.',
      )
      setResult(null)
      return
    }
    setError('')
    setResult(
      summarizeBudget(
        parsedIncome,
        parsedExpenses.map((expense) => ({
          category: expense.category,
          amount: expense.amount!,
        })),
        parsedSavings,
      ),
    )
    requestAnimationFrame(() => resultHeading.current?.focus())
  }

  return (
    <main className="container budget-page page-enter">
      <Link className="budget-back" to="/inicio">
        ← Volver a inicio
      </Link>
      <p className="eyebrow">Tu dinero, con más claridad</p>
      <h1>Hagamos espacio para tus planes.</h1>
      <p className="intro">
        Cuéntanos cuánto recibes y en qué gastas. Empecemos con un presupuesto
        que se adapte a tu día a día.
      </p>
      <div className="budget-layout">
        <form className="budget-form" onSubmit={calculate} noValidate>
          <section className="budget-panel" aria-labelledby="income-heading">
            <p className="budget-step">01 · Tu punto de partida</p>
            <h2 id="income-heading">¿Cuánto ganas al mes?</h2>
            <p>
              Usa el promedio que recibes después de impuestos. Si varía, toma
              como referencia los últimos tres meses.
            </p>
            <label htmlFor="budget-income">Ingreso promedio mensual</label>
            <div className="budget-amount">
              <span aria-hidden="true">$</span>
              <input
                id="budget-income"
                inputMode="decimal"
                placeholder="0.00"
                value={income}
                onChange={(event) => {
                  invalidate()
                  setIncome(event.target.value)
                }}
                aria-describedby="currency-note"
                required
                maxLength={12}
              />
              <span>MXN</span>
            </div>
            <small id="currency-note">
              Todos los importes son mensuales y en pesos mexicanos.
            </small>
          </section>
          <section className="budget-panel" aria-labelledby="expenses-heading">
            <p className="budget-step">02 · Tus compromisos</p>
            <h2 id="expenses-heading">¿En qué gastas?</h2>
            <p>
              Incluye gastos fijos y variables. Para pagos anuales, divide el
              total entre 12.
            </p>
            {expenses.length === 0 && (
              <p className="budget-empty">
                Sin gastos por ahora. Puedes agregar uno cuando lo necesites.
              </p>
            )}
            <div className="budget-expenses">
              {expenses.map((expense, index) => (
                <fieldset className="budget-expense" key={expense.id}>
                  <legend>Gasto {index + 1}</legend>
                  <div className="budget-expense-fields">
                    <label>
                      Concepto
                      <input
                        placeholder="Ej. Renta o supermercado"
                        value={expense.name}
                        onChange={(event) =>
                          updateExpense(expense.id, {
                            name: event.target.value,
                          })
                        }
                        required
                        maxLength={80}
                      />
                    </label>
                    <label>
                      Categoría
                      <select
                        aria-label="Categoría"
                        value={expense.category}
                        onChange={(event) =>
                          updateExpense(expense.id, {
                            category: event.target.value as Expense['category'],
                          })
                        }
                      >
                        {categories.map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Importe mensual (MXN)
                      <input
                        inputMode="decimal"
                        placeholder="0.00"
                        value={expense.amount}
                        onChange={(event) =>
                          updateExpense(expense.id, {
                            amount: event.target.value,
                          })
                        }
                        required
                        maxLength={12}
                      />
                    </label>
                    <button
                      className="budget-remove"
                      type="button"
                      aria-label={`Eliminar gasto ${index + 1}`}
                      onClick={() => {
                        invalidate()
                        setExpenses((rows) =>
                          rows.filter((row) => row.id !== expense.id),
                        )
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </fieldset>
              ))}
            </div>
            <button
              className="budget-secondary"
              type="button"
              onClick={() => {
                invalidate()
                setExpenses((rows) => [
                  ...rows,
                  {
                    id: String(nextId.current++),
                    name: '',
                    category: 'Otros',
                    amount: '',
                  },
                ])
              }}
            >
              + Agregar gasto
            </button>
          </section>
          <section className="budget-panel" aria-labelledby="savings-heading">
            <p className="budget-step">03 · Un espacio para ti</p>
            <h2 id="savings-heading">¿Cuánto te gustaría ahorrar?</h2>
            <p>
              Una meta pequeña también cuenta. Puedes dejarla en cero y decidir
              después.
            </p>
            <label htmlFor="budget-savings">
              Meta de ahorro mensual (opcional)
            </label>
            <div className="budget-amount">
              <span aria-hidden="true">$</span>
              <input
                id="budget-savings"
                inputMode="decimal"
                placeholder="0.00"
                value={savings}
                onChange={(event) => {
                  invalidate()
                  setSavings(event.target.value)
                }}
                maxLength={12}
              />
              <span>MXN</span>
            </div>
          </section>
          {error && (
            <p className="budget-error" role="alert">
              {error}
            </p>
          )}
          <button className="budget-primary" type="submit">
            Calcular mi presupuesto <span aria-hidden="true">→</span>
          </button>
          <p className="budget-session-note">
            Este es un ejercicio de planificación. Los datos no se guardan y se
            borran al salir o recargar la página.
          </p>
        </form>
        <aside className="budget-summary" aria-label="Resumen del presupuesto">
          <p className="budget-step">Tu panorama mensual</p>
          <h2 ref={resultHeading} tabIndex={-1}>
            Un plan, paso a paso.
          </h2>
          {!result ? (
            <>
              <p>
                Completa el formulario y calcula tu presupuesto para ver cómo se
                distribuye tu ingreso.
              </p>
              <div className="budget-summary-empty" aria-hidden="true">
                <span>Ingresos</span>
                <b>→</b>
                <span>Gastos + ahorro</span>
              </div>
              <p>
                Lo que quede estará disponible para imprevistos y otros planes.
              </p>
            </>
          ) : (
            <>
              <dl className="budget-totals">
                <div>
                  <dt>Ingreso mensual</dt>
                  <dd>{money(result.income)}</dd>
                </div>
                <div>
                  <dt>Gastos previstos</dt>
                  <dd>{money(result.totalExpenses)}</dd>
                </div>
                <div>
                  <dt>Meta de ahorro</dt>
                  <dd>{money(result.savings)}</dd>
                </div>
              </dl>
              <div
                className={`budget-available ${result.available < 0 ? 'is-negative' : ''}`}
              >
                <span>
                  {result.available < 0
                    ? 'Falta por cubrir'
                    : 'Disponible para distribuir'}
                </span>
                <strong>{money(Math.abs(result.available))}</strong>
                <p>
                  {result.available < 0
                    ? 'Tus gastos y tu meta de ahorro superan tu ingreso. Revisa los importes o ajusta tu meta para equilibrar el plan.'
                    : result.available === 0
                      ? 'Cada peso tiene un destino. Tu plan está equilibrado.'
                      : 'Puedes destinarlo a imprevistos, sumar al ahorro o reservarlo para otros gastos.'}
                </p>
              </div>
              <h3>Desglose por categoría</h3>
              {result.breakdown.length === 0 ? (
                <p>No agregaste gastos.</p>
              ) : (
                <ul className="budget-breakdown">
                  {result.breakdown.map((item) => (
                    <li key={item.category}>
                      <div>
                        <span>{item.category}</span>
                        <strong>{money(item.amount)}</strong>
                      </div>
                      <meter
                        min="0"
                        max={result.income}
                        value={Math.min(item.amount, result.income)}
                        aria-label={`${item.category}: ${((item.amount / result.income) * 100).toFixed(1)}% del ingreso`}
                      />
                      <small>
                        {((item.amount / result.income) * 100).toFixed(1)}% de
                        tu ingreso
                      </small>
                    </li>
                  ))}
                </ul>
              )}
              <p className="budget-session-note">
                Estos importes son estimaciones para planificar, no movimientos
                registrados.
              </p>
            </>
          )}
        </aside>
      </div>
    </main>
  )
}
