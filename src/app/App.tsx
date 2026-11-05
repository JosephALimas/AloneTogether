import { useLayoutEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthPage } from '../features/auth/AuthPage'
import { BrandLogo } from '../shared/ui/BrandLogo'

const modules = [
  {
    path: 'recetas',
    title: 'Recetas',
    description: 'Cocina algo práctico con lo que tienes.',
  },
  {
    path: 'ciudad',
    title: 'Ciudad',
    description: 'Encuentra lugares útiles cerca de ti.',
  },
  {
    path: 'gastos',
    title: 'Gastos',
    description: 'Registra y revisa tus movimientos.',
  },
  {
    path: 'presupuestos',
    title: 'Presupuestos',
    description: 'Planea tus límites mensuales.',
  },
] as const

function Home() {
  return (
    <main className="container page-enter">
      <p className="eyebrow">Tu espacio cotidiano</p>
      <h1>Un día a la vez, todo en un lugar.</h1>
      <p className="intro">
        Elige por dónde empezar. Cada herramienta funciona a tu ritmo.
      </p>
      <div className="grid">
        {modules.map((module) => (
          <Link className="card" to={`/${module.path}`} key={module.path}>
            <h2>{module.title}</h2>
            <p>{module.description}</p>
            <span>Explorar →</span>
          </Link>
        ))}
      </div>
    </main>
  )
}

function ModulePage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <main className="container page-enter">
      <Link to="/inicio">← Inicio</Link>
      <p className="eyebrow">AloneTogether</p>
      <h1>{title}</h1>
      <p className="intro">{description}</p>
      <div className="notice">
        Estamos preparando esta herramienta. La base del proyecto ya está lista
        para desarrollarla.
      </div>
    </main>
  )
}

export function App() {
  const location = useLocation()
  const isAuthPage = ['/', '/acceso'].includes(location.pathname)

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [location.key])

  return (
    <>
      {!isAuthPage && (
        <header className="site-header">
          <Link className="brand" to="/inicio">
            <BrandLogo className="brand-logo" />
          </Link>
          <nav aria-label="Navegación principal">
            <Link to="/inicio">Inicio</Link>
            <Link to="/acceso">Acceso</Link>
          </nav>
        </header>
      )}
      <Routes location={location} key={location.key}>
        <Route path="/" element={<AuthPage />} />
        <Route path="/inicio" element={<Home />} />
        <Route path="/acceso" element={<AuthPage />} />
        {modules.map((module) => (
          <Route
            key={module.path}
            path={`/${module.path}`}
            element={
              <ModulePage
                title={module.title}
                description={module.description}
              />
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/acceso" replace />} />
      </Routes>
    </>
  )
}
