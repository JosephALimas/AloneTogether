import { spawn, execFileSync } from 'node:child_process'
import { mkdtempSync, openSync, closeSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const wrapper = resolve(root, 'scripts/cloud/wget-local-health')
const container = 'supabase_auth_alonetogether'
const log = join(
  mkdtempSync(join(tmpdir(), 'alonetogether-supabase-')),
  'start.log',
)
// CLI startup output can contain local credentials; retain it in a private directory.
const output = openSync(log, 'w', 0o600)
const child = spawn(
  resolve(root, 'node_modules/.bin/supabase'),
  [
    'start',
    '-x',
    'realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor',
  ],
  { cwd: root, stdio: ['ignore', output, output] },
)
closeSync(output)
let finished = false
let patchedId
let patchError
const completion = new Promise((resolveExit) => {
  child.on('error', (error) => {
    console.error(error.message)
    finished = true
    resolveExit(1)
  })
  child.on('close', (code) => {
    finished = true
    resolveExit(code ?? 1)
  })
})
const docker = (args) =>
  execFileSync('docker', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
while (!finished) {
  let id
  try {
    id = docker(['inspect', '--format', '{{.Id}}', container]).trim()
  } catch {
    /* Not created yet. */
  }
  if (id && id !== patchedId) {
    try {
      docker(['cp', wrapper, `${id}:/usr/local/bin/wget`])
      patchedId = id
      patchError = undefined
    } catch (error) {
      patchError = error.message
    }
  }
  await new Promise((done) => setTimeout(done, 500))
}
const code = await completion
if (code !== 0) {
  console.error(`Supabase startup failed. Private diagnostic log: ${log}`)
  if (patchError)
    console.error('Could not install the loopback healthcheck helper.')
  process.exitCode = code
} else {
  console.log('Supabase local stack started with health checks enabled.')
}
