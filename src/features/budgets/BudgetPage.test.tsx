// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { BudgetPage } from './BudgetPage'

afterEach(cleanup)
function setup() {
  render(
    <MemoryRouter>
      <BudgetPage />
    </MemoryRouter>,
  )
  fireEvent.change(screen.getByLabelText('Ingreso promedio mensual'), {
    target: { value: '20000' },
  })
  fireEvent.change(screen.getByLabelText('Concepto'), {
    target: { value: 'Renta' },
  })
  fireEvent.change(screen.getByLabelText('Importe mensual (MXN)'), {
    target: { value: '6000' },
  })
}

describe('budget form', () => {
  it('calculates a plan, updates expenses and clears an outdated result', () => {
    setup()
    fireEvent.change(
      screen.getByLabelText('Meta de ahorro mensual (opcional)'),
      { target: { value: '2000' } },
    )
    fireEvent.click(
      screen.getByRole('button', { name: /Calcular mi presupuesto/ }),
    )
    expect(screen.getByText('$12,000.00')).toBeTruthy()
    expect(screen.getByText('30.0% de tu ingreso')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '+ Agregar gasto' }))
    expect(screen.queryByText('$12,000.00')).toBeNull()
    expect(screen.getAllByLabelText('Concepto')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar gasto 2' }))
    expect(screen.getAllByLabelText('Concepto')).toHaveLength(1)
  })
  it('reports a deficit when expenses and savings exceed income', () => {
    setup()
    fireEvent.change(screen.getByLabelText('Ingreso promedio mensual'), {
      target: { value: '5000' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /Calcular mi presupuesto/ }),
    )
    expect(screen.getByText('Falta por cubrir')).toBeTruthy()
    expect(screen.getByText('$1,000.00')).toBeTruthy()
    expect(screen.getByText('120.0% de tu ingreso')).toBeTruthy()
  })
  it('rejects invalid data and supports a plan without expenses', () => {
    setup()
    fireEvent.change(screen.getByLabelText('Importe mensual (MXN)'), {
      target: { value: '-50' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /Calcular mi presupuesto/ }),
    )
    expect(screen.getByRole('alert')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar gasto 1' }))
    fireEvent.click(
      screen.getByRole('button', { name: /Calcular mi presupuesto/ }),
    )
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('No agregaste gastos.')).toBeTruthy()
    expect(screen.getAllByText('$20,000.00')).toHaveLength(2)
  })
})
