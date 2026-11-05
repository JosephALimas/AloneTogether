# AloneTogether — documento de arquitectura inicial

**Estado:** propuesta para iniciar un proyecto nuevo.  
**Objetivo:** ayudar a una persona que vive sola a organizar tareas cotidianas en un solo lugar, sin obligarla a configurar todos los módulos desde el primer día.

## 1. Producto y alcance

AloneTogether reúne herramientas prácticas para cocinar, conocer la ciudad y administrar dinero. La pantalla de inicio muestra acciones próximas y accesos a los módulos activados por la persona. Cada módulo debe ser útil por sí solo; los datos compartidos se limitan a cuenta, preferencias, ubicación aproximada y recordatorios.

### Primera versión (MVP)

| Módulo | Función inicial | Fuera del MVP |
| --- | --- | --- |
| Cuenta y perfil | Registro, inicio de sesión, recuperación, ciudad, moneda y módulos preferidos | Redes sociales y perfiles públicos |
| Recetas | Catálogo curado, búsqueda por tiempo/ingredientes, porciones, favoritos y lista de compras manual | Generación automática de recetas y cálculo nutricional clínico |
| Ciudad | Mapa y listado de lugares útiles por categoría, búsqueda, ficha, enlace a navegación externa | Rastreo continuo, rutas propias y reseñas abiertas |
| Gastos | Registro manual de ingresos/gastos, categorías, resumen mensual y exportación CSV | Conexión bancaria, pagos y asesoría financiera |
| Presupuestos | Límites mensuales por categoría, disponible y alertas locales sencillas | Predicciones complejas y presupuestos compartidos |
| Inicio | Resumen de presupuesto, recetas guardadas y lugares favoritos | Motor de recomendaciones personalizado |

**Usuarios iniciales:** una persona adulta con teléfono Android o navegador móvil. Diseñar también para escritorio web. Idioma inicial: español. Moneda, formato de fecha y ciudad se eligen en el perfil; no fijarlos en el código.

## 2. Principios de arquitectura

1. **Un proyecto nuevo:** usar este repositorio como referencia, no mezclar cuentas, tablas, migraciones ni identidad de marca con Muscle Atlas.
2. **Monolito modular en el cliente:** un solo frontend con carpetas por dominio. Evitar microservicios hasta que exista una necesidad medible.
3. **Backend administrado:** Supabase Auth, PostgreSQL y políticas RLS. Añadir funciones de servidor únicamente para operaciones que requieran secretos, proveedores externos o trabajo programado.
4. **Datos privados por defecto:** la información financiera y la ubicación guardada pertenecen a una cuenta. La ubicación precisa se solicita solo al usar el mapa y no se almacena en el MVP.
5. **Contenido separado de datos personales:** recetas y puntos de interés publicados son de lectura; gastos, presupuestos y favoritos son privados.
6. **Interfaces reemplazables:** el mapa y el catálogo de lugares pasan por adaptadores para poder cambiar proveedor sin reescribir pantallas.

## 3. Infraestructura propuesta

Partir del mismo patrón técnico que el proyecto actual:

- **Web:** React + TypeScript + Vite + React Router, rutas y componentes cargados por módulo.
- **Móvil Android:** Capacitor sobre la misma aplicación web. Validar en dispositivo los permisos de ubicación, enlaces externos y retorno de autenticación.
- **Identidad y datos:** Supabase Auth y PostgreSQL; migraciones SQL versionadas, RLS y pruebas de aislamiento entre usuarios.
- **Desarrollo local:** Node, npm, Supabase CLI y Docker, con `.env.example` que incluya solo configuración pública.
- **Calidad:** ESLint, Prettier, Vitest para reglas de dominio, Playwright para recorridos críticos y pruebas SQL para RLS.
- **Entrega:** hosting estático para web, proyecto Supabase separado por entorno, y compilación Android mediante Capacitor. Definir el proveedor de hosting y distribución al implementar.

No copiar el modelo 3D ni las dependencias de Three.js: son específicas del producto original. La aplicación nueva conserva el patrón de infraestructura, no sus activos.

```text
Navegador / Android (Capacitor)
          |
          v
React: shell, rutas, módulos, estado de sesión
          |
          +--> Supabase Auth
          +--> PostgreSQL + RLS (datos privados y catálogos)
          +--> Adaptador de mapas --> proveedor de mapas/lugares
          +--> Funciones de servidor (solo cuando sean necesarias)
```

## 4. Organización del código

```text
alonetogether/
  src/
    app/                 rutas, proveedores, navegación, página de inicio
    features/
      auth/              sesión y acceso
      profile/           preferencias y ciudad
      recipes/           catálogo, favoritos, compras
      city/              mapa, lugares, categorías
      expenses/          movimientos y resúmenes
      budgets/           límites y alertas
    shared/
      ui/                componentes reutilizables
      lib/               fechas, moneda, validación
      types/             contratos compartidos mínimos
    services/
      supabase.ts
      maps/              interfaz y adaptador del proveedor elegido
  supabase/
    migrations/          esquema, restricciones, índices y RLS
    tests/               permisos y reglas de datos
  e2e/                   viajes completos de usuario
  docs/                  decisiones, contenido y operación
  android/               generado y mantenido por Capacitor
```

Cada módulo contiene sus componentes, consultas, tipos y reglas de negocio. `shared` solo recibe piezas usadas realmente por varios módulos. Evitar que una pantalla consulte directamente tablas de otro módulo; exponer funciones de repositorio o selectores.

## 5. Modelo de datos inicial

Todas las tablas privadas usan `user_id` ligado a `auth.users.id`; las referencias se eliminan o anonimizan según la política de cuenta. Guardar importes como **enteros en la unidad menor** de la moneda (por ejemplo, centavos), con `currency_code` ISO 4217. No usar `float` para dinero.

| Tabla | Campos principales | Acceso |
| --- | --- | --- |
| `profiles` | `user_id`, `display_name`, `city_id`, `currency_code`, `locale`, `created_at` | Solo dueño |
| `module_preferences` | `user_id`, `module_key`, `enabled` | Solo dueño |
| `recipes` | `id`, `title`, `description`, `minutes`, `servings`, `steps`, `status` | Lectura de publicadas; edición administrativa |
| `recipe_ingredients` | `recipe_id`, `name`, `quantity`, `unit`, `optional` | Igual que recetas |
| `recipe_favorites` | `user_id`, `recipe_id`, `created_at` | Solo dueño |
| `shopping_items` | `id`, `user_id`, `text`, `quantity`, `unit`, `checked` | Solo dueño |
| `cities` | `id`, `name`, `country_code`, `timezone` | Lectura pública |
| `places` | `id`, `city_id`, `name`, `category`, `latitude`, `longitude`, `address`, `source`, `verified_at`, `status` | Lectura de aprobados; edición administrativa |
| `place_favorites` | `user_id`, `place_id` | Solo dueño |
| `expense_categories` | `id`, `user_id` nullable para categorías base, `name`, `kind` | Base pública o solo dueño |
| `transactions` | `id`, `user_id`, `kind`, `amount_minor`, `currency_code`, `category_id`, `occurred_on`, `note`, `created_at` | Solo dueño |
| `budgets` | `id`, `user_id`, `category_id`, `month`, `limit_minor`, `currency_code` | Solo dueño |

**Restricciones:** `amount_minor > 0`, `limit_minor >= 0`; `kind` es ingreso o gasto; una fila de presupuesto por usuario/categoría/mes; fechas de movimiento independientes de zona horaria; claves foráneas e índices en `user_id`, `occurred_on`, `month`, `city_id` y `category`. Los agregados de presupuesto suman solo gastos de la misma moneda y mes. Si se admite más de una moneda por cuenta, el presupuesto deberá separar monedas o convertirlas con una fuente de tipo de cambio explícita; para el MVP se usa una moneda por perfil y se impide mezclarla en movimientos activos.

## 6. Seguridad, privacidad y confianza

- Activar RLS en **todas** las tablas privadas. Políticas `SELECT`, `INSERT`, `UPDATE` y `DELETE` verifican `auth.uid() = user_id`; el cliente no puede asignar datos a otro usuario.
- Usar la clave publicable en el frontend. Guardar claves de servicio y de proveedores que lo requieran únicamente en funciones o configuración del servidor.
- Validar en interfaz y base de datos cantidades, fechas, longitudes y valores admitidos. Las reglas financieras críticas deben tener restricciones o funciones SQL, no depender solo de React.
- No registrar importes, notas, correos o coordenadas precisas en analítica ni logs. Definir retención y mecanismo para exportar/eliminar datos antes del lanzamiento público.
- Solicitar ubicación del dispositivo de forma contextual y opcional. Permitir elegir ciudad manualmente. Mostrar fecha de verificación y fuente de lugares cuando corresponda.
- Las recetas necesitan revisión editorial de ingredientes, medidas, pasos y advertencias básicas de alérgenos; no presentarlas como consejo médico.
- La sección financiera muestra seguimiento personal; evitar promesas de asesoría fiscal o de inversión.

## 7. Mapa y fuentes de contenido

El mapa necesita una decisión de proveedor antes de implementarse. Evaluar cobertura de la primera ciudad, licencias, cuotas, atribución, uso en WebView de Android y costo al crecer. Definir una interfaz `MapProvider` con operaciones para mostrar marcadores, centrar el mapa y abrir navegación externa. El catálogo `places` es propio y curado para el MVP; no asumir que una API de mapas concede guardar o redistribuir sus resultados. Incluir vista de lista para accesibilidad y cuando el mapa falle.

Para recetas, empezar con un catálogo pequeño revisado y versionado. Puede sembrarse desde archivos JSON durante desarrollo y migrarse a tablas de lectura cuando exista un flujo editorial. Registrar procedencia y licencia de texto e imágenes. Evitar copiar contenido de terceros sin derechos de uso.

## 8. Flujos principales

1. **Alta:** crear cuenta → verificar correo → elegir ciudad y moneda → activar módulos → entrar al inicio.
2. **Cocina:** filtrar recetas → abrir pasos → ajustar porciones → guardar o añadir ingredientes a compras.
3. **Ciudad:** elegir categoría → ver mapa/lista → abrir ficha → enviar dirección a navegación externa.
4. **Gastos:** añadir movimiento → ver total mensual por categoría → editar o borrar → exportar CSV.
5. **Presupuesto:** fijar límite por categoría y mes → comparar gasto registrado → mostrar disponible y exceso.

Los módulos sin datos deben tener una acción inicial clara. El inicio no debe bloquearse si un módulo o proveedor de mapas falla.

## 9. API y estado del cliente

Usar repositorios tipados por módulo (`RecipeRepository`, `TransactionRepository`, etc.) que encapsulen consultas Supabase. El estado de sesión es global; filtros, formularios y navegación son locales a su módulo. Los resúmenes de gastos se calculan a partir de consultas acotadas por usuario y mes; si el volumen exige optimización, pasar a una vista o función SQL con RLS y pruebas. Paginación desde el inicio para movimientos y lugares. Evitar caché persistente de datos financieros hasta definir cifrado, cierre de sesión y borrado local.

## 10. Pruebas y criterios de salida

| Nivel | Comprobación necesaria |
| --- | --- |
| Dominio | Sumas en unidades menores, límites mensuales, cambio de mes, validación de movimientos y porciones |
| Base de datos | Un usuario no lee ni modifica datos de otro; restricciones e índices esenciales funcionan |
| Navegador | Registro, onboarding, receta, lugar, gasto, presupuesto, exportación y sesión vencida |
| Android real | Autenticación y retorno, permiso de ubicación, mapa/lista, enlaces de navegación y teclado |
| Accesibilidad | Navegación por teclado, etiquetas, contraste, lector de pantalla y alternativa al mapa |

Antes de producción: copia y restauración de base de datos comprobadas, políticas RLS auditadas, configuración de dominios/deep links, monitoreo de errores sin datos sensibles y revisión de costos del proveedor de mapas.

## 11. Plan de implementación

| Fase | Entregable verificable |
| --- | --- |
| 0. Definición | Primera ciudad, público, proveedor de mapas, identidad visual, contenido inicial y criterios del MVP |
| 1. Base | Repositorio nuevo, React/Vite/TypeScript, rutas, diseño móvil, Supabase local, autenticación, perfil, CI y despliegue de prueba |
| 2. Vida diaria | Recetas, favoritos, lista de compras y contenido revisado |
| 3. Ciudad | Catálogo curado, mapa/lista, fichas, navegación externa y permisos opcionales |
| 4. Finanzas | Movimientos, categorías, resúmenes, presupuestos y exportación CSV |
| 5. Lanzamiento | Pruebas integrales, accesibilidad, privacidad, copias de seguridad, Android y publicación |

El orden 2–4 puede cambiar según qué problema resuelva primero el producto. En cada fase entregar una experiencia completa y probarla con usuarios antes de ampliar funciones.

## 12. Decisiones pendientes antes de escribir código

1. Ciudad y país iniciales; determinan mapa, lugares, moneda y tratamiento de datos.
2. Plataforma de salida: solo web, Android, o ambas desde el primer lanzamiento.
3. Proveedor de mapas y presupuesto mensual permitido para sus cuotas.
4. Responsable y proceso de revisión de recetas y lugares.
5. Alcance de la cuenta: uso individual ahora; posible hogar compartido después requeriría otro modelo de permisos.
6. Política de eliminación, exportación y recuperación de datos personales.

## 13. Primer trabajo concreto

Crear un repositorio `alonetogether` independiente. Copiar únicamente la configuración base de Vite/TypeScript, lint, pruebas, Supabase local, rutas de autenticación y Capacitor como referencia; renombrar `appId`, dominios y textos. Diseñar las primeras migraciones (`profiles`, preferencias, transacciones y presupuestos) con RLS y pruebas de aislamiento. Construir una pantalla inicial con módulos activables y una primera experiencia completa. No reutilizar las migraciones, los datos ni la instancia Supabase del proyecto de entrenamiento.
