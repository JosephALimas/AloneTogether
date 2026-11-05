import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const status = JSON.parse(
  execFileSync('npx', ['supabase', 'status', '-o', 'json'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  }),
)
if (status.API_URL !== 'http://127.0.0.1:55321') {
  throw new Error('This smoke test only runs against local AloneTogether')
}

const config = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator), line.slice(separator + 1)]
    }),
)
const publicClient = createClient(
  config.VITE_SUPABASE_URL,
  config.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
)
const adminClient = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const email = `smoke-${randomUUID()}@example.test`
const password = `Aa1!${randomUUID()}`
let userId

try {
  const signup = await publicClient.auth.signUp({ email, password })
  if (signup.error || !signup.data.user)
    throw signup.error ?? new Error('No user returned')
  userId = signup.data.user.id
  if (signup.data.session)
    throw new Error('Expected email confirmation before sign-in')

  let message
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const inbox = await fetch(`${status.MAILPIT_URL}/api/v1/messages`).then(
      (r) => r.json(),
    )
    message = inbox.messages.find((item) =>
      JSON.stringify(item).includes(email),
    )
    if (message) break
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  if (!message) throw new Error('Confirmation email did not reach Mailpit')

  const detail = await fetch(
    `${status.MAILPIT_URL}/api/v1/message/${message.ID}`,
  ).then((r) => r.json())
  const body = `${detail.HTML ?? ''}\n${detail.Text ?? ''}`.replaceAll(
    '&amp;',
    '&',
  )
  const confirmUrl = body
    .match(/https?:\/\/[^\s"'<>]+/g)
    ?.find((url) => url.includes('/auth/v1/verify'))
  if (!confirmUrl) throw new Error('Confirmation link missing from email')
  const confirmation = await fetch(confirmUrl, { redirect: 'manual' })
  if (confirmation.status < 300 || confirmation.status >= 400) {
    throw new Error(`Email confirmation returned HTTP ${confirmation.status}`)
  }

  const login = await publicClient.auth.signInWithPassword({ email, password })
  if (login.error || !login.data.session)
    throw login.error ?? new Error('No session returned')
  console.log('Local signup, email confirmation, and login passed')
} finally {
  if (userId) {
    const cleanup = await adminClient.auth.admin.deleteUser(userId)
    if (cleanup.error)
      console.error(
        'Could not remove disposable local user:',
        cleanup.error.message,
      )
  }
}
