import { useState, type FormEvent } from 'react'
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  catalog,
  readCollection,
  storageKey,
  type Recipe,
  type RecipeCollection,
} from './recipes'
import './RecipesPage.css'

const symbols = ['🍝', '🥑', '🥣', '🍚']
export function RecipesPage() {
  const [loaded] = useState(() => {
    try {
      return { data: readCollection(), failed: false }
    } catch {
      return {
        data: { recipes: [], favorites: [] } as RecipeCollection,
        failed: true,
      }
    }
  })
  const [collection, setCollection] = useState(loaded.data)
  const [error, setError] = useState(
    loaded.failed
      ? 'No pudimos leer tus recetas guardadas. Para protegerlas, no guardaremos cambios hasta que recuperes el acceso al almacenamiento de este navegador.'
      : '',
  )
  const allRecipes = [...catalog, ...collection.recipes]
  function save(next: RecipeCollection) {
    if (loaded.failed) return false
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      setCollection(next)
      setError('')
      return true
    } catch {
      setError(
        'No se pudo guardar el cambio. Revisa el espacio y los permisos del navegador e inténtalo de nuevo.',
      )
      return false
    }
  }
  function toggleFavorite(id: string) {
    save({
      ...collection,
      favorites: collection.favorites.includes(id)
        ? collection.favorites.filter((favorite) => favorite !== id)
        : [...collection.favorites, id],
    })
  }
  return (
    <main className="container recipes-page page-enter">
      <Link className="recipes-back" to="/inicio">
        ← Volver a inicio
      </Link>
      <p className="eyebrow">Algo rico, hecho por ti</p>
      <Routes>
        <Route
          index
          element={
            <RecipeList
              recipes={allRecipes}
              favorites={collection.favorites}
              toggleFavorite={toggleFavorite}
            />
          }
        />
        <Route
          path="nueva"
          element={
            <RecipeForm
              save={(recipe) =>
                save({
                  ...collection,
                  recipes: [...collection.recipes, recipe],
                })
              }
            />
          }
        />
        <Route
          path=":recipeId"
          element={
            <RecipeDetail
              recipes={allRecipes}
              favorites={collection.favorites}
              toggleFavorite={toggleFavorite}
            />
          }
        />
        <Route path="*" element={<RecipeNotFound />} />
      </Routes>
      {error && (
        <p className="recipes-error" role="alert">
          {error}
        </p>
      )}
      <p className="recipes-storage-note">
        Tus recetas propias y favoritas se guardan solo en este navegador. No se
        sincronizan con tu cuenta ni con otros dispositivos. Si compartes este
        navegador, otras personas podrán verlas.
      </p>
    </main>
  )
}
function FavoriteButton({
  recipe,
  active,
  toggle,
}: {
  recipe: Recipe
  active: boolean
  toggle: (id: string) => void
}) {
  return (
    <button
      className={`recipe-favorite ${active ? 'is-active' : ''}`}
      type="button"
      aria-pressed={active}
      aria-label={`${active ? 'Quitar de' : 'Agregar a'} favoritas: ${recipe.title}`}
      onClick={() => toggle(recipe.id)}
    >
      <span aria-hidden="true">{active ? '♥' : '♡'}</span>
      <span>{active ? 'En favoritas' : 'Guardar favorita'}</span>
    </button>
  )
}
function RecipeList({
  recipes,
  favorites,
  toggleFavorite,
}: {
  recipes: Recipe[]
  favorites: string[]
  toggleFavorite: (id: string) => void
}) {
  const [params, setParams] = useSearchParams()
  const tab = params.get('vista') ?? 'todas'
  const [query, setQuery] = useState(params.get('buscar') ?? '')
  const normalized = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const filtered = recipes.filter(
    (recipe) =>
      (tab !== 'favoritas' || favorites.includes(recipe.id)) &&
      (tab !== 'mias' || recipe.own) &&
      normalized(`${recipe.title} ${recipe.ingredients.join(' ')}`).includes(
        normalized(query.trim()),
      ),
  )
  function search(value: string) {
    setQuery(value)
    const next = new URLSearchParams(params)
    if (value) next.set('buscar', value)
    else next.delete('buscar')
    setParams(next, { replace: true })
  }
  return (
    <>
      <div className="recipes-heading">
        <div>
          <h1>Tu próxima receta favorita.</h1>
          <p className="intro">
            Ideas sencillas para comer rico. Descubre algo nuevo o guarda esa
            receta que ya es muy tuya.
          </p>
        </div>
        <Link className="recipes-primary" to="/recetas/nueva">
          + Crear mi receta
        </Link>
      </div>
      <div className="recipes-toolbar">
        <nav className="recipes-tabs" aria-label="Colecciones de recetas">
          {[
            ['todas', 'Explorar'],
            ['favoritas', 'Favoritas'],
            ['mias', 'Mis recetas'],
          ].map(([value, label]) => (
            <Link
              key={value}
              to={`/recetas?${new URLSearchParams({ vista: value, ...(query ? { buscar: query } : {}) })}`}
              aria-current={tab === value ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <label className="recipes-search">
          Buscar por nombre o ingrediente
          <input
            type="search"
            placeholder="Prueba con tomate, avena…"
            value={query}
            onChange={(event) => search(event.target.value)}
          />
        </label>
      </div>
      <p className="recipes-count" role="status">
        {filtered.length}{' '}
        {filtered.length === 1 ? 'receta para ti' : 'recetas para ti'}
      </p>
      {filtered.length === 0 ? (
        <section className="recipes-empty">
          <span aria-hidden="true">🍽️</span>
          <h2>
            {query
              ? 'No encontramos esa receta'
              : tab === 'favoritas'
                ? 'Aquí van tus favoritas'
                : 'Tu recetario está por comenzar'}
          </h2>
          <p>
            {query
              ? 'Prueba con otro nombre o ingrediente, o cambia de colección.'
              : tab === 'favoritas'
                ? 'Guarda una receta con el corazón y la encontrarás aquí.'
                : 'Crea tu primera receta con sus ingredientes, utensilios y pasos.'}
          </p>
          <Link to={tab === 'mias' ? '/recetas/nueva' : '/recetas'}>
            {tab === 'mias' ? 'Crear una receta' : 'Ver todas las recetas'} →
          </Link>
        </section>
      ) : (
        <div className="recipes-grid">
          {filtered.map((recipe) => (
            <article className="recipe-card" key={recipe.id}>
              <Link
                className={`recipe-art recipe-tint-${
                  Math.max(
                    0,
                    catalog.findIndex((item) => item.id === recipe.id),
                  ) % 4
                }`}
                to={`/recetas/${recipe.id}`}
                aria-label={`Ver receta: ${recipe.title}`}
              >
                <span aria-hidden="true">
                  {recipe.own ? '🍽️' : symbols[catalog.indexOf(recipe)]}
                </span>
                <span className="recipe-badge">
                  {recipe.own ? 'Hecha por ti' : 'Para el día a día'}
                </span>
              </Link>
              <div className="recipe-card-body">
                <p className="recipe-meta">
                  {recipe.minutes} min · {recipe.servings}{' '}
                  {recipe.servings === 1 ? 'porción' : 'porciones'}
                </p>
                <h2>
                  <Link to={`/recetas/${recipe.id}`}>{recipe.title}</Link>
                </h2>
                <p>{recipe.description}</p>
                <FavoriteButton
                  recipe={recipe}
                  active={favorites.includes(recipe.id)}
                  toggle={toggleFavorite}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
function RecipeNotFound() {
  return (
    <section className="recipes-empty">
      <h1>No encontramos esta receta</h1>
      <p>
        Puede que se haya creado en otro navegador o que el enlace ya no esté
        disponible.
      </p>
      <Link to="/recetas">Volver al recetario →</Link>
    </section>
  )
}
function RecipeDetail({
  recipes,
  favorites,
  toggleFavorite,
}: {
  recipes: Recipe[]
  favorites: string[]
  toggleFavorite: (id: string) => void
}) {
  const { recipeId } = useParams()
  const recipe = recipes.find((item) => item.id === recipeId)
  if (!recipe) return <RecipeNotFound />
  return (
    <>
      <Link className="recipes-back" to="/recetas">
        ← Todas las recetas
      </Link>
      <div className="recipes-heading">
        <div>
          <p className="recipe-meta">
            {recipe.own ? 'Tu receta' : 'Del recetario'} · {recipe.minutes} min
            · {recipe.servings}{' '}
            {recipe.servings === 1 ? 'porción' : 'porciones'}
          </p>
          <h1>{recipe.title}</h1>
          <p className="intro">{recipe.description}</p>
        </div>
        <FavoriteButton
          recipe={recipe}
          active={favorites.includes(recipe.id)}
          toggle={toggleFavorite}
        />
      </div>
      <div className="recipe-detail-grid">
        <div>
          <section className="recipe-panel">
            <p className="eyebrow">Lo que vas a usar</p>
            <h2>Ingredientes</h2>
            <p>
              Para {recipe.servings}{' '}
              {recipe.servings === 1 ? 'porción' : 'porciones'}.
            </p>
            <ul className="recipe-checklist">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  <label>
                    <input type="checkbox" />
                    {ingredient}
                  </label>
                </li>
              ))}
            </ul>
          </section>
          <section className="recipe-panel">
            <h2>Materiales y utensilios</h2>
            <ul className="recipe-materials">
              {recipe.materials.map((material, index) => (
                <li key={index}>{material}</li>
              ))}
            </ul>
          </section>
        </div>
        <section className="recipe-panel recipe-steps">
          <p className="eyebrow">Sin complicaciones</p>
          <h2>Paso a paso</h2>
          <ol>
            {recipe.steps.map((step, index) => (
              <li key={index}>
                <span aria-hidden="true">{index + 1}</span>
                <div>
                  <h3>Paso {index + 1}</h3>
                  <p>{step}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}
function RecipeForm({ save }: { save: (recipe: Recipe) => boolean }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const text = (name: string) => String(data.get(name) ?? '').trim()
    const lines = (name: string) =>
      text(name)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    const title = text('title'),
      minutes = Number(text('minutes')),
      servings = Number(text('servings'))
    const ingredients = lines('ingredients'),
      materials = lines('materials'),
      steps = lines('steps')
    if (
      !title ||
      title.length > 100 ||
      !Number.isInteger(minutes) ||
      minutes <= 0 ||
      minutes > 1440 ||
      !Number.isInteger(servings) ||
      servings <= 0 ||
      servings > 100 ||
      [ingredients, materials, steps].some(
        (list) =>
          list.length === 0 ||
          list.length > 100 ||
          list.some((line) => line.length > 2000),
      )
    ) {
      setError(
        'Completa el nombre, un tiempo de 1 a 1440 minutos, de 1 a 100 porciones y al menos un ingrediente, un utensilio y un paso. Usa como máximo 100 líneas por lista y 2000 caracteres por línea.',
      )
      return
    }
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      title,
      description: text('description'),
      minutes,
      servings,
      ingredients,
      materials,
      steps,
      own: true,
    }
    if (save(recipe)) navigate(`/recetas/${recipe.id}`)
  }
  return (
    <>
      <Link className="recipes-back" to="/recetas">
        ← Volver al recetario
      </Link>
      <h1>Esa receta tan tuya.</h1>
      <p className="intro">
        Deja los ingredientes y los pasos por escrito para cocinarla otra vez,
        sin olvidar nada.
      </p>
      <form className="recipe-form" onSubmit={submit} noValidate>
        <section className="recipe-panel">
          <h2>Lo esencial</h2>
          <label>
            Nombre de la receta
            <input
              name="title"
              required
              maxLength={100}
              placeholder="Ej. La sopa de verduras de casa"
            />
          </label>
          <label>
            Descripción breve (opcional)
            <textarea
              name="description"
              maxLength={300}
              rows={2}
              placeholder="¿Qué hace especial a esta receta?"
            />
          </label>
          <div className="recipe-form-pair">
            <label>
              Tiempo total (minutos)
              <input
                name="minutes"
                type="number"
                min={1}
                max={1440}
                step={1}
                required
                placeholder="30"
              />
            </label>
            <label>
              Porciones
              <input
                name="servings"
                type="number"
                min={1}
                max={100}
                step={1}
                required
                placeholder="2"
              />
            </label>
          </div>
        </section>
        <section className="recipe-panel">
          <h2>Ingredientes y materiales</h2>
          <label>
            Ingredientes
            <textarea
              name="ingredients"
              required
              rows={5}
              placeholder={
                '1 taza de arroz\n2 tazas de agua\n½ cucharadita de sal'
              }
              aria-describedby="ingredients-help"
            />
          </label>
          <small id="ingredients-help">
            Un ingrediente por línea. Incluye su cantidad y unidad de medida.
          </small>
          <label>
            Materiales y utensilios
            <textarea
              name="materials"
              required
              rows={4}
              placeholder={'Olla con tapa\nTaza medidora\nCuchara'}
              aria-describedby="materials-help"
            />
          </label>
          <small id="materials-help">
            Un utensilio por línea. Incluye también los aparatos que necesitas.
          </small>
        </section>
        <section className="recipe-panel">
          <h2>La preparación</h2>
          <label>
            Paso a paso
            <textarea
              name="steps"
              required
              rows={7}
              placeholder={
                'Lava el arroz con agua fría.\nColoca el arroz y el agua en la olla.\nCocina tapado a fuego bajo hasta que esté tierno.'
              }
              aria-describedby="steps-help"
            />
          </label>
          <small id="steps-help">
            Escribe un paso por línea, en el orden de preparación. Incluye
            tiempos y temperaturas cuando corresponda.
          </small>
        </section>
        {error && (
          <p className="recipes-error" role="alert">
            {error}
          </p>
        )}
        <div className="recipe-form-actions">
          <Link to="/recetas">Cancelar</Link>
          <button className="recipes-primary" type="submit">
            Guardar mi receta →
          </button>
        </div>
      </form>
    </>
  )
}
