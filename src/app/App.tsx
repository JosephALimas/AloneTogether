import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from '../features/auth/AuthPage'

const modules = [
  { path: 'recetas', title: 'Recetas', description: 'Cocina algo práctico con lo que tienes.' },
  { path: 'ciudad', title: 'Ciudad', description: 'Encuentra lugares útiles cerca de ti.' },
  { path: 'gastos', title: 'Gastos', description: 'Registra y revisa tus movimientos.' },
  { path: 'presupuestos', title: 'Presupuestos', description: 'Planea tus límites mensuales.' },
] as const

function Home() {
  return <main className="container"><p className="eyebrow">Tu espacio cotidiano</p><h1>Un día a la vez, todo en un lugar.</h1><p className="intro">Elige por dónde empezar. Cada herramienta funciona a tu ritmo.</p><div className="grid">{modules.map((module) => <Link className="card" to={`/${module.path}`} key={module.path}><h2>{module.title}</h2><p>{module.description}</p><span>Explorar →</span></Link>)}</div></main>
}

function ModulePage({ title, description }: { title: string; description: string }) {
  return <main className="container"><Link to="/">← Inicio</Link><p className="eyebrow">AloneTogether</p><h1>{title}</h1><p className="intro">{description}</p><div className="notice">Estamos preparando esta herramienta. La base del proyecto ya está lista para desarrollarla.</div></main>
}

export function App() {
  return <><header className="site-header"><Link className="brand" to="/">AloneTogether</Link><nav aria-label="Navegación principal"><Link to="/">Inicio</Link><Link to="/acceso">Acceso</Link></nav></header><Routes><Route path="/" element={<Home />} /><Route path="/acceso" element={<AuthPage />} />{modules.map((module) => <Route key={module.path} path={`/${module.path}`} element={<ModulePage title={module.title} description={module.description} />} />)}<Route path="*" element={<Navigate to="/" replace />} /></Routes></>
}
