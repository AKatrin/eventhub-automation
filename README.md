# EventHub Automation Framework — BDD (Cucumber) + Playwright + TypeScript

Framework híbrido de automatización para la aplicación de práctica **EventHub**
([web](https://eventhub.rahulshettyacademy.com/login) ·
[API](https://api.eventhub.rahulshettyacademy.com/api)).

La capa **UI se especifica en Gherkin y se ejecuta con Cucumber**; la capa **API
se ejecuta con Playwright Test**. Ambas comparten los page objects, los clientes
API tipados, la configuración por entorno y el logging centralizado con Winston.

El flujo de **login** queda cubierto de punta a punta: se valida la interfaz web,
el JWT persistido en `localStorage` y el mismo token contra `GET /auth/me`.

---

## 1. Tecnologías y versiones

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 26.13.0 LTS | Runtime (mínimo requerido: `>=20.19.0`) |
| npm | 11.20.0 | Gestor de dependencias |
| @cucumber/cucumber | 13.3.0 | Runner BDD, hooks, World y reportes HTML/JSON/JUnit |
| tsx | 4.23.15 | Ejecución directa de step definitions y hooks en TypeScript |
| @playwright/test | 1.64.1 | Automatización del navegador, `APIRequestContext`, API tests y reportes |
| TypeScript | 7.0.2 | Tipado estricto (`strict`, `noUncheckedIndexedAccess`) |
| Winston | 3.19.0 | Logging a consola y archivos |
| dotenv | 18.0.9 | Carga de variables por entorno |
| cross-env | 10.1.0 | Variables de entorno multiplataforma en los scripts npm |
| allure-playwright | 3.14.0 | Reporter Allure para los tests de API |
| allure-commandline | 2.46.1 | Generación/apertura del reporte Allure (requiere Java) |

> Las versiones están fijadas en `package.json` con rangos compatibles (`^`).
> `package-lock.json` garantiza instalaciones reproducibles.

---

## 2. Características principales

- **UI en BDD**: escenarios legibles en `features/login.feature`, implementados
  con step definitions tipados en TypeScript.
- **Cucumber World por escenario**: cada escenario crea su propio navegador,
  contexto y `APIRequestContext`, evitando fugas de cookies o tokens.
- **Híbrido Web + API**: la UI usa Cucumber; la API usa el proyecto `api` de
  Playwright. Ambos reutilizan el mismo código de negocio.
- **Page Object Model**: `LoginPage` y `HomePage` heredan de `BasePage`.
- **Cliente API tipado**: `EventHubApi` agrupa `AuthApiClient`,
  `EventsApiClient` y `BookingsApiClient`, todos sobre el `request` nativo de
  Playwright.
- **Logging Winston**: consola + archivo combinado + archivo de errores; los
  payloads, respuestas, tiempos y errores quedan registrados. Credenciales y
  tokens se **enmascaran** automáticamente.
- **Evidencias BDD**: el reporte HTML de Cucumber incluye capturas de pantalla,
  JSON de respuestas API y el **log completo de cada escenario**.
- **Evidencias API**: Playwright HTML y Allure con adjuntos, video y trace.
- **Configuración por entorno**: `.env`, `.env.<TEST_ENV>` y variables del shell.
- **Tipado estricto** y validación de tipos con `tsc --noEmit`.

---

## 3. Prerrequisitos

1. **Node.js 20.19+** (probado con 26.13.0 LTS) y npm.
2. **Navegadores de Playwright** (se descargan con un comando).
3. **Java 8+** *(solo si se desea generar/abrir el reporte Allure de API)*.
   Verificar con `java -version`.
4. Credenciales de práctica de EventHub (las del proyecto ya están configuradas).

---

## 4. Instalación

```bash
# 1. Instalar dependencias (Cucumber, Playwright, Winston, tsx...)
npm install

# 2. Descargar Chromium para Playwright
npx playwright install chromium

# 3. Crear el archivo de entorno local
#    Git Bash / macOS / Linux:
cp .env.example .env
#    PowerShell:
#    Copy-Item .env.example .env
```

> En este repositorio ya se incluye un `.env` funcional para la cuenta de
> práctica. En un proyecto real, `.env` no se versiona (está en `.gitignore`).

### Variables de entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `TEST_ENV` | `local` | Nombre del entorno; carga `.env.<TEST_ENV>` |
| `BASE_URL` | `https://eventhub.rahulshettyacademy.com` | Aplicación web |
| `API_BASE_URL` | `https://api.eventhub.rahulshettyacademy.com/api` | API REST |
| `API_TIMEOUT_MS` | `15000` | Timeout de solicitudes API |
| `EVENTHUB_EMAIL` | `are-test@mailsac.com` | Usuario de prueba |
| `EVENTHUB_PASSWORD` | `Control123.` | Password de prueba |
| `LOG_LEVEL` | `http` | Nivel Winston: `error`, `warn`, `info`, `http`, `debug`… |
| `LOG_DIR` | `logs` | Carpeta de archivos de log |
| `HEADED` | `false` | `true` abre el navegador en modo visible (Cucumber) |
| `PWDEBUG` | — | `1` activa el modo debug de Playwright en modo visible |

**Precedencia:** variables del shell > `.env.<TEST_ENV>` > `.env` > defaults del código.

> `LOG_LEVEL=http` es necesario para ver las peticiones/respuestas HTTP. El nivel
> `http` de Winston es más verboso que `info`; si se usa `info`, los logs de API
> se omiten (los `warn`/`error` se siguen mostrando).

---

## 5. Estructura del proyecto

```text
eventhub-playwright/
├── .env                          # Configuración local (no versionada)
├── .env.example                  # Plantilla de configuración
├── .gitignore
├── cucumber.js                   # Configuración de Cucumber y perfiles
├── package.json
├── package-lock.json
├── playwright.config.ts          # Proyecto API, reporters, trazas y evidencias
├── tsconfig.json                 # TypeScript estricto
├── README.md
│
├── features/                     # Capa BDD (UI)
│   ├── login.feature             # Escenarios Gherkin de autenticación
│   ├── step_definitions/
│   │   └── login.steps.ts        # Implementación de los pasos
│   └── support/
│       ├── world.ts              # World: browser, page objects, API y logger
│       └── hooks.ts              # Before/After, timeouts y evidencias
│
├── src/
│   ├── api/
│   │   ├── EventHubApi.ts        # Fachada: auth + events + bookings
│   │   ├── clients/
│   │   │   ├── ApiClient.ts      # Wrapper de APIRequestContext + logging
│   │   │   ├── AuthApiClient.ts  # /auth/login, /auth/register, /auth/me
│   │   │   ├── EventsApiClient.ts
│   │   │   └── BookingsApiClient.ts
│   │   └── models/
│   │       ├── api.types.ts      # ApiResult, ApiSuccess, ApiFailure, Pagination
│   │       ├── auth.types.ts
│   │       ├── event.types.ts
│   │       └── booking.types.ts
│   ├── config/
│   │   ├── env.config.ts         # Carga y validación de variables
│   │   └── global-setup.ts       # Limpia allure-results/allure-report por ejecución
│   ├── data/
│   │   └── test-data.ts          # Credenciales, textos esperados y datos API
│   ├── fixtures/
│   │   └── test.fixture.ts       # Fixtures de Playwright para la capa API
│   ├── pages/
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── HomePage.ts
│   └── utils/
│       ├── assertions.ts         # expect con timeout de 20s para BDD
│       ├── logger.ts             # Winston + enmascarado + captura por escenario
│       └── evidence.ts           # Adjuntos para los tests de API
│
├── tests/
│   └── api/
│       ├── auth.spec.ts          # Login, credenciales inválidas, /auth/me
│       └── events.spec.ts        # GET /events autenticado
│
├── scripts/
│   └── open-report.mjs           # Abre el reporte HTML de Cucumber
│
├── logs/                         # Generado en ejecución (ignorado por git)
├── reports/                      # Reporte Cucumber HTML/JSON/JUnit (ignorado)
├── test-results/                 # Traces, videos y screenshots de API (ignorado)
├── playwright-report/            # Reporte HTML de API (ignorado)
├── allure-results/               # Resultados Allure de API (ignorado)
└── allure-report/                # Reporte Allure generado (ignorado)
```

---

## 6. Arquitectura

### 6.1 Capa UI — Cucumber + Page Object Model

```text
login.feature
     ↓
Cucumber runner  →  hooks (Before/After)  →  EventHubWorld
                                                ↓
                                 LoginPage / HomePage
                                                ↓
                                     Playwright Page
```

- `features/login.feature` describe el comportamiento en Gherkin.
- `features/step_definitions/login.steps.ts` traduce cada paso a acciones de
  negocio; no contiene selectores.
- `EventHubWorld` es el estado compartido del escenario: navegador, contexto,
  página, page objects, `APIRequestContext` y logger.
- Los hooks `Before`/`After` crean y liberan los recursos, capturan el log y
  adjuntan evidencias al reporte.
- `BasePage` centraliza navegación, esperas, screenshots y logging.
- `LoginPage` encapsula `#email`, `#password`, `#login-btn` y las aserciones de
  error/URL.
- `HomePage` valida URL, hero, sección destacada, email del header
  (`data-testid="user-email-display"`) y logout.
- `src/utils/assertions.ts` exporta un `expect` con timeout de 20 s: Cucumber no
  hereda el `expect.timeout` de `playwright.config.ts`, y este margen absorbe los
  arranques en frío de la aplicación de práctica.

### 6.2 Capa API — Playwright Test

```text
Test  →  EventHubApi  →  AuthApiClient / EventsApiClient / BookingsApiClient
                                  ↓
                         Playwright APIRequestContext
```

- Cada cliente hereda de `ApiClient`, que centraliza:
  - construcción de URL y headers (`Authorization: Bearer <jwt>`),
  - `failOnStatusCode: false` para poder **assertar** respuestas 4xx,
  - parseo JSON tolerante a respuestas vacías/texto,
  - logging de request/response con duración y enmascarado de secretos.
- `EventHubApi.login()` autentica y propaga el token a todos los clientes.
- Los tipos reflejan los envelopes reales: `{ success, data|user|token, error }`.

### 6.3 World y hooks

`features/support/world.ts` crea, por escenario:

| Recurso | Detalle |
|---|---|
| `browser` | Chromium; visible si `HEADED=true` o `PWDEBUG=1` |
| `context` | `baseURL`, viewport, timeouts, `ignoreHTTPSErrors` |
| `page` | Página nueva para el escenario |
| `loginPage` / `homePage` | Page objects reutilizables |
| `api` | `EventHubApi` con `APIRequestContext` propio |
| `logCapture` | Transporte Winston en memoria |

`features/support/hooks.ts`:

- `Before`: registra el inicio del escenario y arranca los recursos.
- `After`: registra el resultado, adjunta screenshot en fallos, adjunta el log y
  libera todo en un bloque `finally`.

### 6.4 Logging (Winston)

- **Consola**: nivel configurable, con color.
- **Archivo combinado**: `logs/eventhub-YYYY-MM-DD.log`.
- **Archivo de errores**: `logs/eventhub-error-YYYY-MM-DD.log`.
- Rotación por tamaño (10 MB, 14 archivos).
- Prefijos útiles: `BDD SCENARIO START`, `BDD SCENARIO END`, `UI NAVIGATE`,
  `API REQUEST`, `API RESPONSE`, `STEP`, `UI ASSERT VISIBLE`.
- **Enmascarado automático** de `password`, `token`, `authorization`, `secret`
  y `apiKey` en cualquier nivel del objeto logueado.
- Cada escenario adjunta su log completo al reporte HTML de Cucumber; cada test
  de API lo adjunta al reporte de Playwright.

Ejemplo de salida:

```text
2026-11-04T01:50:43.236Z INFO  Using configured EventHub test account {"email":"are-test@mailsac.com"}
2026-11-04T01:50:49.165Z HTTP  API REQUEST  GET https://api.eventhub.../auth/me {"headers":{"Authorization":"Bearer eyJhb..."}}
2026-11-04T01:50:50.813Z HTTP  API RESPONSE GET https://api.eventhub.../auth/me -> 200 (1647 ms)
  {"body":{"success":true,"user":{"userId":18133,"email":"are-test@mailsac.com"}}}
```

---

## 7. Casos de prueba incluidos

### UI — BDD (`features/login.feature`)

Tags: `@ui`, `@authentication`, `@smoke`, `@login`, `@positive`/`@negative`.

1. **Sign in with valid credentials and validate the session through the API**
   - `Given` abre `/login`.
   - `When` envía las credenciales configuradas.
   - `Then` valida home autenticado (URL `/`, hero, “Featured Events”).
   - `And` valida el email del usuario en el header.
   - `And` lee `eventhub_token` de `localStorage` y lo valida con `GET /auth/me`.
   - Adjunta screenshot y JSON de la respuesta.

2. **Reject an invalid password without creating a session**
   - `When` envía la cuenta configurada con un password inválido.
   - `Then` valida el toast “Invalid email or password”.
   - `And` confirma que permanece en `/login`.
   - `And` confirma que **no** se guardó JWT en `localStorage`.

### API — Playwright (`tests/api/`)

1. `POST /auth/login` → 200, JWT con formato válido y perfil de usuario.
2. `POST /auth/login` con password inválido → **400** + mensaje de error.
3. `GET /auth/me` sin token → **401** `Unauthorized`.
4. `GET /events` con sesión autenticada → 200, lista de eventos y datos coherentes.

> Nota de la API real: credenciales inválidas en `/auth/login` responden **400**;
> una petición sin token a un endpoint protegido responde **401**.

### Endpoints mapeados

| Método | Endpoint | Cliente |
|---|---|---|
| `POST` | `/auth/login` | `AuthApiClient.login` |
| `POST` | `/auth/register` | `AuthApiClient.register` |
| `GET` | `/auth/me` | `AuthApiClient.me` |
| `GET` | `/events` | `EventsApiClient.list` |
| `GET` | `/events/:id` | `EventsApiClient.getById` |
| `POST` | `/events` | `EventsApiClient.create` |
| `PUT` | `/events/:id` | `EventsApiClient.update` |
| `DELETE` | `/events/:id` | `EventsApiClient.delete` |
| `GET` | `/bookings` | `BookingsApiClient.list` |
| `GET` | `/bookings/:id` | `BookingsApiClient.getById` |
| `POST` | `/bookings` | `BookingsApiClient.create` |
| `DELETE` | `/bookings/:id` | `BookingsApiClient.cancel` |
| `GET` | `/config` | *(UI, configuración pública)* |

---

## 8. Ejecución

```bash
# Suite completa: API (Playwright) + UI (Cucumber)
npm test

# Solo UI en BDD
npm run test:bdd

# Solo los escenarios etiquetados @login
npm run test:login

# Solo smoke: API @smoke + escenarios BDD @smoke
npm run test:smoke

# Solo API (Playwright)
npm run test:api

# UI con navegador visible
npm run test:bdd:headed

# Modo debug (PWDEBUG=1 + navegador visible)
npm run test:bdd:debug

# Validación de tipos
npm run typecheck

# Abrir el reporte HTML de Cucumber
npm run report:bdd

# Abrir el reporte HTML de Playwright (API)
npm run report

# Generar y abrir Allure (API, requiere Java)
npm run report:allure
```

### Filtros útiles de Cucumber

```bash
# Por tag
npx cucumber-js --tags "@smoke and not @negative"

# Por archivo de feature
npx cucumber-js features/login.feature

# Por nombre de escenario
npx cucumber-js --name "valid credentials"

# Perfil definido en cucumber.js
npx cucumber-js --profile smoke
```

### Filtros útiles de Playwright (API)

```bash
# Un archivo concreto
npx playwright test tests/api/auth.spec.ts

# Por título
npx playwright test -g "valid JWT"

# Reintentar solo los fallidos
npx playwright test --last-failed

# Ver la traza de un fallo
npx playwright show-trace test-results/<carpeta>/trace.zip
```

> Los escenarios BDD se ejecutan secuencialmente porque cada uno abre un
> navegador. Para paralelizar, ajustar `parallel` en `cucumber.js`.

---

## 9. Reportes y evidencias

### Cucumber HTML (UI)

Se genera en `reports/cucumber-report.html`:

```bash
npm run report:bdd
```

Incluye:

- escenarios, pasos y estado,
- screenshots adjuntos (`home-page-after-login`, `failure-screenshot`),
- JSON de la respuesta de `GET /auth/me`,
- **`execution-log.txt`**: log Winston completo del escenario,
- tags y duración.

También se generan:

```text
reports/cucumber-report.json   # integración con otras herramientas
reports/cucumber-report.xml    # JUnit para CI
```

### Playwright HTML y Allure (API)

```bash
npm run report
npm run report:allure
```

Incluyen pasos (`test.step`), adjuntos JSON, video/trace en fallos y el
`execution-log` de cada test. Allure requiere Java en el `PATH`.

### Archivos de log

```text
logs/eventhub-YYYY-MM-DD.log        # Todos los niveles configurados
logs/eventhub-error-YYYY-MM-DD.log  # Solo errores
```

---

## 10. Cómo extender el framework

### Nuevo escenario BDD

1. Añadir el escenario en `features/*.feature` con tags coherentes.
2. Implementar los pasos en `features/step_definitions/`.
3. Reutilizar `this.loginPage`, `this.homePage`, `this.api` y `this.page` del
   `EventHubWorld`; no crear navegadores dentro de los pasos.
4. Ejecutar `npm run typecheck` y `npm run test:bdd`.

Ejemplo de step:

```ts
import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { EventHubWorld } from '../support/world';

Then('the logout button should be visible', async function (this: EventHubWorld) {
  await expect(this.homePage.logoutButton).toBeVisible();
});
```

### Nuevo page object

1. Crear `src/pages/EventsPage.ts` extendiendo `BasePage`.
2. Declarar locators en el constructor (preferir roles, labels y `data-testid`).
3. Exponer métodos de negocio (`searchEvent`, `openEvent`, `expectEventVisible`).
4. Instanciarlo en `EventHubWorld.initialise()` y usarlo desde los steps.

### Nuevo endpoint

1. Añadir el modelo en `src/api/models/`.
2. Crear/ampliar el cliente en `src/api/clients/` usando `this.send<T>()`.
3. Exponerlo en `EventHubApi` si aplica.
4. Consumirlo desde `tests/api/` o desde un step BDD.

### Nuevo test de API

```ts
import { test, expect } from '../../src/fixtures/test.fixture';

test('@smoke GET /events returns events', async ({ api, logger }, testInfo) => {
  const response = await api.events.list({ limit: 5 });

  expect(response.status).toBe(200);
  logger.info('Events returned', { count: response.body.data.length });
});
```

---

## 11. CI/CD (GitHub Actions + GitHub Pages)

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

Se dispara en `push` a `main`/`master`, en `pull_request` y manualmente
(`workflow_dispatch`). API y UI se ejecutan **en paralelo**:

| Job | Qué ejecuta | Artefactos |
|---|---|---|
| `api` | `npm run typecheck` + `npm run test:api` (Playwright, sin navegador) y genera Allure | `api-playwright-report`, `api-allure-report`, `api-logs` |
| `ui` | instala Chromium y ejecuta `npm run test:bdd` (Cucumber) | `ui-cucumber-report`, `ui-logs` |
| `deploy-reports` | descarga los reportes, construye `site/` con `scripts/build-pages.mjs` y publica en GitHub Pages | — |

La página publicada (`https://<usuario>.github.io/<repo>/`) incluye enlaces a:

- **API · Playwright HTML** (`api/playwright/`)
- **API · Allure** (`api/allure/`)
- **UI · Cucumber** (`ui/cucumber-report.html`)

y un resumen con el estado de cada job (passed/failed), rama, commit y número
de ejecución. Aunque un job falle, `deploy-reports` se ejecuta igual
(`if: always()`) para que el fallo sea inspeccionable; si un reporte no se
generó, su tarjeta aparece como “No disponible”.

Los artefactos completos quedan descargables en la pestaña **Actions** de cada
ejecución (reportes: 30 días, logs: 7 días). Los logs no se publican en Pages
porque pueden contener emails y datos de eventos.

### Configuración inicial (una sola vez)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   Ya está habilitado en este repositorio; si se recrea o se hace fork, hay que
   activarlo manualmente (el `GITHUB_TOKEN` por defecto no puede habilitarlo).
2. (Opcional) **Settings → Secrets and variables → Actions**: crear
   `EVENTHUB_EMAIL` y `EVENTHUB_PASSWORD`. Si no existen, se usan las
   credenciales de práctica por defecto de `src/config/env.config.ts`.
3. Push a `main`/`master` y revisar la pestaña **Actions**.

En CI el workflow define `CI=true` y `TEST_ENV=ci`; no hay `.env` en el
runner, por lo que `playwright.config.ts` activa `retries: 2`, `workers: 2` y
`forbidOnly` para la capa API. La carpeta `site/` (ensamblado de Pages) está
ignorada por git.

---

## 12. Troubleshooting

| Síntoma | Causa / solución |
|---|---|
| `Cannot find module 'tsx/cjs'` | Ejecutar `npm install` (tsx es dependencia de desarrollo) |
| `Undefined step` en Cucumber | Revisar `require`/`paths` en `cucumber.js` y el texto exacto del paso |
| `Executable doesn't exist` | Ejecutar `npx playwright install chromium` |
| No aparecen logs de API | `LOG_LEVEL` debe ser `http` (o más verboso), no `info` |
| Allure falla al generar | Verificar `java -version`; instalar JRE/JDK 8+ |
| No se cargan las variables del `.env` | Verificar `TEST_ENV` y que el archivo exista en la raíz |
| El login UI no redirige | Verificar credenciales y conectividad con la API; revisar `logs/` |
| Error 400 en login API | Credenciales inválidas o password < 6 caracteres |
| El navegador no se abre en headed | Usar `npm run test:bdd:headed` o `HEADED=true` |
| El reporte Cucumber no se abre | Ejecutar `npm run test:bdd` y luego `npm run report:bdd` |

---

## 13. Seguridad

- Las credenciales de este repositorio son de una **aplicación pública de
  práctica**; no usar cuentas reales.
- `.env` está ignorado por git. En CI, inyectar secretos como variables de entorno.
- Winston enmascara passwords y tokens antes de escribir en consola, archivos o
  adjuntos.
- Los archivos de log y los reportes pueden contener emails y datos de eventos:
  tratarlos como artefactos internos.

---

## 14. Comandos rápidos (TL;DR)

```bash
npm install
npx playwright install chromium
npm test                 # API (Playwright) + UI (Cucumber BDD)
npm run test:bdd         # Solo UI BDD
npm run report:bdd       # Reporte HTML de Cucumber
npm run report           # Reporte HTML de Playwright (API)
npm run report:allure    # Reporte Allure de API (requiere Java)
```
