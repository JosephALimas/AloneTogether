# AloneTogether

Base inicial de la aplicación web. La arquitectura y el alcance están en [ALONETOGETHER_ARQUITECTURA.md](ALONETOGETHER_ARQUITECTURA.md).

## Requisitos

- Node.js 22 y npm
- Docker y Supabase CLI para la base de datos local

## Arranque

```bash
npm install
npx supabase start
npm run env:local
```

El comando `env:local` guarda solo la URL y la clave publicable en `.env.local` (ignorado por Git). AloneTogether usa los puertos 55321-55326 para convivir con otros proyectos Supabase locales. Después:

```bash
npm run dev
```

La interfaz abre en `http://localhost:5173`. El registro requiere confirmar el correo. Los mensajes locales aparecen en Mailpit: `http://127.0.0.1:55324`.

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
