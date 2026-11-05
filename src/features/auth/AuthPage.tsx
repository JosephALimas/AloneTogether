import { FormEvent, useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { BrandLogo } from '../../shared/ui/BrandLogo'
import blueLoney from '../../../graphics/Loney asoma junto al círculo azul.png'
import './AuthPage.css'

type Mode = 'login' | 'signup' | 'recovery' | 'reset'
const copy: Record<Mode, [string, string, string]> = {
  login: [
    'Qué gusto verte de nuevo',
    'Entra a tu espacio para continuar a tu ritmo.',
    'Entrar a mi espacio',
  ],
  signup: [
    'Crea tu espacio',
    'Una cuenta para guardar lo que es importante para ti.',
    'Crear cuenta',
  ],
  recovery: [
    'Recupera tu acceso',
    'Te enviaremos un enlace para elegir una nueva contraseña.',
    'Enviar enlace',
  ],
  reset: [
    'Elige una nueva contraseña',
    'Usa al menos 8 caracteres para proteger tu cuenta.',
    'Guardar contraseña',
  ],
}

function errorMessage(message: string) {
  if (/invalid login credentials/i.test(message))
    return 'El correo o la contraseña no coinciden.'
  if (/email not confirmed/i.test(message))
    return 'Confirma tu correo antes de entrar.'
  if (/user already registered/i.test(message))
    return 'Ya existe una cuenta con este correo.'
  if (/password should be at least/i.test(message))
    return 'La contraseña debe tener al menos 8 caracteres.'
  return 'No pudimos completar la solicitud. Inténtalo de nuevo.'
}

export function AuthPage() {
  const navigate = useNavigate()
  const emailId = useId()
  const passwordId = useId()
  const confirmId = useId()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success'
    text: string
  } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get('modo') === 'restablecer'
    )
      setMode('reset')
    if (!supabase) return
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('reset')
    })
    return () => subscription.unsubscribe()
  }, [])

  function changeMode(next: Mode) {
    setMode(next)
    setPassword('')
    setConfirmPassword('')
    setFeedback(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    if (!supabase) {
      setFeedback({
        type: 'error',
        text: 'El acceso aún no está configurado. Agrega las credenciales públicas de Supabase en .env.local.',
      })
      return
    }
    if (
      (mode === 'signup' || mode === 'reset') &&
      password !== confirmPassword
    ) {
      setFeedback({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }
    setBusy(true)
    try {
      if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${window.location.origin}/acceso?modo=restablecer` },
        )
        if (error) throw error
        setFeedback({
          type: 'success',
          text: 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.',
        })
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        navigate('/inicio', { replace: true })
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (error) throw error
        setFeedback({
          type: 'success',
          text: 'Revisa tu correo para confirmar tu cuenta. Después podrás entrar.',
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        navigate('/inicio', { replace: true })
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        text: errorMessage(error instanceof Error ? error.message : ''),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-layout" key={`layout-${mode}`}>
        <BrandLogo className="auth-brand" />
        <section className="auth-card" aria-labelledby="auth-title">
          <p className="auth-eyebrow">TU ESPACIO</p>
          <h1 id="auth-title">{copy[mode][0]}</h1>
          <div className="auth-intro">
            <p className="auth-description">{copy[mode][1]}</p>
          </div>
          <form onSubmit={submit} className="auth-form">
            {mode !== 'reset' && (
              <div className="auth-field">
                <label htmlFor={emailId}>Correo electrónico</label>
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  disabled={busy}
                />
              </div>
            )}
            {mode !== 'recovery' && (
              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor={passwordId}>
                    {mode === 'reset' ? 'Nueva contraseña' : 'Contraseña'}
                  </label>
                  {mode === 'login' && (
                    <button
                      className="auth-inline-link"
                      type="button"
                      onClick={() => changeMode('recovery')}
                    >
                      ¿La olvidaste?
                    </button>
                  )}
                </div>
                <div className="auth-password">
                  <input
                    id={passwordId}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                    required
                    minLength={mode === 'login' ? 1 : 8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === 'login' ? 'Tu contraseña' : 'Mínimo 8 caracteres'
                    }
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="auth-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
            )}
            {(mode === 'signup' || mode === 'reset') && (
              <div className="auth-field">
                <label htmlFor={confirmId}>Confirmar contraseña</label>
                <input
                  id={confirmId}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  disabled={busy}
                />
              </div>
            )}
            {feedback && (
              <p
                className={`auth-feedback auth-feedback--${feedback.type}`}
                role={feedback.type === 'error' ? 'alert' : 'status'}
              >
                {feedback.text}
              </p>
            )}
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? 'Un momento…' : copy[mode][2]}
            </button>
          </form>
          <div className="auth-footer">
            {mode === 'login' ? (
              <p>
                ¿Aún no tienes cuenta?{' '}
                <button type="button" onClick={() => changeMode('signup')}>
                  Crear una cuenta
                </button>
              </p>
            ) : (
              <button type="button" onClick={() => changeMode('login')}>
                ← Volver a iniciar sesión
              </button>
            )}
          </div>
        </section>
        <p className="auth-note">
          Un lugar para organizar tu día, a tu manera.
        </p>
      </div>
      <img
        key={`sidekick-${mode}`}
        className="auth-sidekick"
        src={blueLoney}
        alt="Loney asoma junto a un círculo azul"
      />
    </main>
  )
}
