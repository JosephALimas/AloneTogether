# AloneTogether

Base inicial de la aplicación web. La arquitectura y el alcance están en [ALONETOGETHER_ARQUITECTURA.md](ALONETOGETHER_ARQUITECTURA.md).

## Requisitos

- Node.js 22 y npm
- Docker y Supabase CLI para la base de datos local

## Arranque

```bash
npm ci
npx supabase start
npm run env:local
```

El comando `env:local` guarda solo la URL y la clave publicable en `.env.local` (ignorado por Git). AloneTogether usa los puertos 55321-55326 para convivir con otros proyectos Supabase locales. Después:

```bash
npm run dev
```

La interfaz abre en `http://localhost:5173`. El registro requiere confirmar el correo. Los mensajes locales aparecen en Mailpit: `http://127.0.0.1:55324`.

## Entorno en la nube

En la imagen preparada, activa Node.js 22 antes de ejecutar los comandos:

```bash
export PATH=/workspace/.tools/node_modules/.bin:$PATH
cd /workspace/AloneTogether
npm run supabase:start:cloud
npm run env:local
npm run smoke:auth
npm run dev -- --host 0.0.0.0
```

`supabase:start:cloud` inicia PostgreSQL, API, Auth y Mailpit. Excluye Studio,
Realtime, Storage, Edge Functions y analítica para reducir el consumo de disco
con el controlador Docker `vfs`. La inicialización del esquema todavía puede
necesitar imágenes de Realtime y Storage. Para trabajar en esos servicios,
revisa el espacio disponible y usa el arranque completo en un entorno con
capacidad suficiente.

El comando instala un pequeño adaptador de `wget` en el contenedor local de
Auth: solo su comprobación exacta de salud en `127.0.0.1:9999` evita el proxy.
Esto corrige el comportamiento de BusyBox `wget`, que ignora `NO_PROXY`.
Las demás peticiones conservan el proxy; las comprobaciones de salud y TLS
siguen habilitadas. El adaptador se vuelve a instalar si se recrea el contenedor.
El script requiere acceso al socket de Docker y a la configuración de usuario
de Supabase; en Codex puede necesitar ejecutarse fuera del sandbox aprobado.

Para detener el conjunto sin borrar sus datos, ejecuta `npx supabase stop`.
Para reiniciarlo, repite `npm run supabase:start:cloud` y `npm run env:local`.
Los registros de arranque se guardan en un directorio temporal privado porque
la salida de Supabase puede contener credenciales locales. No compartas ese
archivo sin revisarlo. No se necesitan credenciales de Supabase alojado.

## Comprobaciones

```bash
npm run lint
npm run build
npm test
npm run smoke:auth
```

`smoke:auth` crea una cuenta temporal, confirma el correo, inicia sesión y borra la cuenta. La migración inicial está en `supabase/migrations`. Las claves privadas nunca van en archivos `VITE_*`.

## Siguientes pasos

Completar onboarding y estado de sesión; agregar pruebas de aislamiento RLS; definir la primera ciudad y el proveedor de mapas antes de integrar lugares. La estructura `features/` crece por dominio a medida que se implementan las experiencias.
