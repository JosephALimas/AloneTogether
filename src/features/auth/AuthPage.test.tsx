// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../app/App'

describe('access view switching', () => {
  it('replaces the form instead of stacking copies', () => {
    window.scrollTo = vi.fn()
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Crear una cuenta' }))
      expect(screen.getByRole('heading', { name: 'Crea tu espacio' })).toBeTruthy()
      expect(container.querySelectorAll('.auth-layout')).toHaveLength(1)
      expect(container.querySelectorAll('.auth-form')).toHaveLength(1)

      fireEvent.click(screen.getByRole('button', { name: /Volver a iniciar sesión/ }))
      expect(screen.getByRole('heading', { name: 'Qué gusto verte de nuevo' })).toBeTruthy()
      expect(container.querySelectorAll('.auth-layout')).toHaveLength(1)
      expect(container.querySelectorAll('.auth-form')).toHaveLength(1)
    }
  })
})
