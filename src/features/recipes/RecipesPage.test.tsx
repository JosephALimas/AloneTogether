// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../app/App'
import { readCollection, storageKey } from './recipes'

beforeEach(() => {
  localStorage.clear()
  window.scrollTo = vi.fn()
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
function open(path = '/recetas') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}
function fillRecipe() {
  for (const [label, value] of [
    ['Nombre de la receta', 'Sopa de casa'],
    ['Tiempo total (minutos)', '20'],
    ['Porciones', '2'],
    ['Ingredientes', '2 zanahorias\n1 litro de agua'],
    ['Materiales y utensilios', 'Olla\nCuchillo'],
    [
      'Paso a paso',
      'Lava y corta las zanahorias.\nHierve hasta que estén tiernas.',
    ],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } })
}
describe('recipes module', () => {
  it('saves favorites, filters them, and restores them after returning', () => {
    const view = open()
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Agregar a favoritas: Pasta con tomate y albahaca',
      }),
    )
    fireEvent.click(screen.getByRole('link', { name: 'Favoritas' }))
    expect(screen.getByText('1 receta para ti')).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: 'Arroz con verduras en una olla' }),
    ).toBeNull()
    expect(readCollection().favorites).toEqual(['pasta-tomate'])
    view.unmount()
    open('/recetas?vista=favoritas')
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Quitar de favoritas: Pasta con tomate y albahaca',
      }),
    )
    expect(screen.getByText('Aquí van tus favoritas')).toBeTruthy()
  })
  it('creates and persists a recipe with ingredients, materials and ordered steps', () => {
    const view = open('/recetas/nueva')
    fillRecipe()
    fireEvent.click(screen.getByRole('button', { name: 'Guardar mi receta →' }))
    expect(screen.getByRole('heading', { name: 'Sopa de casa' })).toBeTruthy()
    expect(screen.getByLabelText('2 zanahorias')).toBeTruthy()
    expect(screen.getByText('Olla')).toBeTruthy()
    expect(screen.getByText('Hierve hasta que estén tiernas.')).toBeTruthy()
    const saved = readCollection().recipes[0]
    expect(saved.steps).toHaveLength(2)
    view.unmount()
    open(`/recetas/${saved.id}`)
    expect(screen.getByRole('heading', { name: 'Sopa de casa' })).toBeTruthy()
  })
  it('validates required fields and does not create an incomplete recipe', () => {
    open('/recetas/nueva')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar mi receta →' }))
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(localStorage.getItem(storageKey)).toBeNull()
  })
  it('shows storage failures and preserves form content for retry', () => {
    open('/recetas/nueva')
    fillRecipe()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded')
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar mi receta →' }))
    expect(screen.getByRole('alert').textContent).toContain(
      'No se pudo guardar',
    )
    expect(
      (screen.getByLabelText('Nombre de la receta') as HTMLInputElement).value,
    ).toBe('Sopa de casa')
  })
  it('protects unreadable storage and renders an unavailable recipe state', () => {
    localStorage.setItem(storageKey, '{broken')
    open('/recetas/missing')
    expect(
      screen.getByRole('heading', { name: 'No encontramos esta receta' }),
    ).toBeTruthy()
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(localStorage.getItem(storageKey)).toBe('{broken')
  })
  it('keeps search focused and finds recipes by ingredient without accents', () => {
    open()
    const search = screen.getByRole('searchbox')
    search.focus()
    fireEvent.change(search, { target: { value: 'platano' } })
    expect(document.activeElement).toBe(search)
    expect(screen.getByText('1 receta para ti')).toBeTruthy()
    const card = screen.getByRole('article')
    expect(
      within(card).getByRole('heading', { name: 'Avena cremosa con plátano' }),
    ).toBeTruthy()
  })
})
