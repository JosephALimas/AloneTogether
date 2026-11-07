import { useLayoutEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthPage } from '../features/auth/AuthPage'
import { BrandLogo } from '../shared/ui/BrandLogo'
import { HomePage } from './HomePage'
import { BudgetPage } from '../features/budgets/BudgetPage'

const destinations = [
  {
    path: 'menu-semanal',
    title: 'Menú semanal',
    description: 'Aquí podrás organizar tus comidas de la semana.',
  },
  {
    path: 'presupuesto',
    title: 'Presupuesto',
    description: 'Aquí podrás planear y revisar tus límites mensuales.',
  },
  {
    path: 'gastos',
    title: 'Gestión de gastos',
    description: 'Aquí podrás registrar y consultar tus movimientos.',
  },
  {
    path: 'perfil',
    title: 'Perfil',
    description: 'Aquí podrás consultar y editar tus datos personales.',
  },
  {
    path: 'configuracion',
    title: 'Configuración',
    description: 'Aquí podrás ajustar tus preferencias.',
  },
  {
    path: 'recetas',
    title: 'Recetas',
    description: 'Aquí podrás explorar recetas.',
  },
  {
    path: 'ciudad',
    title: 'Ciudad',
    description: 'Aquí podrás encontrar lugares útiles.',
  },
  {
    path: 'presupuestos',
    title: 'Presupuestos',
    description: 'Aquí podrás consultar tus presupuestos.',
  },
] as const

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
  const isFullPage = ['/', '/acceso', '/inicio'].includes(location.pathname)

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [location.key])

  return (
    <>
      {!isFullPage && (
        <header className="site-header">
          <Link className="brand" to="/inicio">
            <BrandLogo className="brand-logo" />
          </Link>
          <nav aria-label="Navegación principal">
            <Link to="/inicio">Inicio</Link>
          </nav>
        </header>
      )}
      <Routes location={location} key={location.key}>
        <Route path="/" element={<AuthPage />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/acceso" element={<AuthPage />} />
        <Route path="/presupuesto" element={<BudgetPage />} />
        <Route
          path="/presupuestos"
          element={<Navigate to="/presupuesto" replace />}
        />
        {destinations
          .filter(
            (module) =>
              module.path !== 'presupuesto' && module.path !== 'presupuestos',
          )
          .map((module) => (
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
