import { Link } from 'react-router-dom'
import loneyGroup from '../../graphics/Cuatro Loneys en grupo juguetón.png'
import monogram from '../../graphics/Monograma AT en verde azulado.png'
import './HomePage.css'

const sections = [
  { path: '/menu-semanal', label: 'Menú semanal', tint: 'blue' },
  { path: '/presupuesto', label: 'Presupuesto', tint: 'yellow' },
  { path: '/gastos', label: 'Gestión de gastos', tint: 'green' },
] as const

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06A1.7 1.7 0 0 0 16 18.4a1.7 1.7 0 0 0-1 1.56V20h-2.5v-.04A1.7 1.7 0 0 0 11.5 18.4a1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.16 15a1.7 1.7 0 0 0-1.56-1H6.5v-2.5h.1A1.7 1.7 0 0 0 8.16 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.8-1.8.06.06A1.7 1.7 0 0 0 11.5 6a1.7 1.7 0 0 0 1-1.56V4.4H15v.04A1.7 1.7 0 0 0 16 6a1.7 1.7 0 0 0 1.88-.34l.06-.06 1.8 1.8-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1h.04v2.5h-.04A1.7 1.7 0 0 0 19.4 15Z"
        transform="translate(-1.5 -.2)"
      />
    </svg>
  )
}

export function HomePage() {
  return (
    <main className="home-page page-enter">
      <div className="home-shell">
        <header className="home-banner">
          <Link
            className="home-logo-link"
            to="/inicio"
            aria-label="Alone Together, inicio"
          >
            <img className="home-monogram" src={monogram} alt="" />
          </Link>
          <img
            className="home-loney-group"
            src={loneyGroup}
            alt="Cuatro Loneys juntos"
          />
          <nav className="home-account-nav" aria-label="Tu cuenta">
            <Link to="/perfil">
              <PersonIcon />
              <span>Perfil</span>
            </Link>
            <Link to="/configuracion">
              <SettingsIcon />
              <span>Configuración</span>
            </Link>
          </nav>
        </header>

        <nav className="home-module-nav" aria-label="Secciones principales">
          {sections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className={`home-module-link home-module-link--${section.tint}`}
            >
              <span className="home-module-dot" aria-hidden="true" />
              {section.label}
              <span className="home-module-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </nav>

        <section className="home-welcome" aria-labelledby="welcome-title">
          <p className="home-kicker">TE DAMOS LA BIENVENIDA</p>
          <h1 id="welcome-title">Qué gusto tenerte aquí.</h1>
          <p>
            Aquí podrás organizar tu menú semanal, consultar tu presupuesto y
            llevar el registro de tus gastos. Elige por dónde empezar.
          </p>
        </section>
      </div>
    </main>
  )
}
