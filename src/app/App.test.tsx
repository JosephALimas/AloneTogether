import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './App'

function renderRoute(path: string) {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('app routes', () => {
  it('renders only access content at /acceso', () => {
    const html = renderRoute('/acceso')
    expect(html).toContain('Qué gusto verte de nuevo')
    expect(html).not.toContain('Qué gusto tenerte aquí.')
    expect(html).not.toContain('Un día a la vez')
  })

  it('opens directly on access content at /', () => {
    const html = renderRoute('/')
    expect(html).toContain('Qué gusto verte de nuevo')
    expect(html).not.toContain('Qué gusto tenerte aquí.')
  })

  it('renders the module home at /inicio', () => {
    const html = renderRoute('/inicio')
    expect(html).toContain('Qué gusto tenerte aquí.')
    expect(html).toContain('Menú semanal')
    expect(html).toContain('Presupuesto')
    expect(html).toContain('Gestión de gastos')
    expect(html).not.toContain('Qué gusto verte de nuevo')
  })
})
