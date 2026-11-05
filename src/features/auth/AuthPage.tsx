import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabase'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) { setMessage('Configura Supabase en .env.local para activar el acceso.'); return }
    setBusy(true)
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setMessage(result.error ? result.error.message : mode === 'signup' ? 'Revisa tu correo para confirmar tu cuenta.' : 'Sesión iniciada.')
    setBusy(false)
  }

  return <main className="container narrow"><Link to="/">← Inicio</Link><h1>{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</h1><form onSubmit={submit}><label>Correo electrónico<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Contraseña<input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} /></label><button disabled={busy}>{busy ? 'Espera…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button></form>{message && <p role="status">{message}</p>}<button className="text-button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage('') }}>{mode === 'login' ? 'Crear una cuenta' : 'Ya tengo cuenta'}</button></main>
}
