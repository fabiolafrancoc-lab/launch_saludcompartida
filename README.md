# launch_saludcompartida — `www.saludcompartida.app`

Aplicación Next.js que sirve la landing page de SaludCompartida y las APIs necesarias para el flujo de registro, validación de códigos y activación de suscripciones vía Shopify.

---

## Checklist de despliegue

| # | Acción | Dónde | Estado |
|---|---|---|---|
| 1 | Mergear este PR a `main` | GitHub → Pull requests | ⬜ Pendiente |
| 2 | Agregar las variables del `.env.example` | Vercel → Settings → Environment Variables | ⬜ Pendiente |
| 3 | Crear webhook `orders/paid` apuntando a `https://www.saludcompartida.app/api/webhooks/shopify` y copiar el Signing Secret como `SHOPIFY_WEBHOOK_SECRET` | Shopify Admin → Configuración → Notificaciones → Webhooks | ⬜ Pendiente |
| 4 | Subir `SHOPIFY/sections/main-redirect-registro.liquid` al tema | Shopify Admin → Online Store → Themes → Edit code → sections/ | ⬜ Pendiente |
| 5 | Agregar entradas de `SHOPIFY/config/settings_schema_entries.json` al `config/settings_schema.json` del tema | Shopify Admin → Online Store → Themes → Edit code → config/ | ⬜ Pendiente |
| 6 | Configurar los IDs del tema (Storefront Token, Variant ID, Selling Plan ID) | Shopify Admin → Online Store → Themes → Customize → Theme settings | ⬜ Pendiente |

> Los pasos 1-3 son los bloqueantes principales. Los pasos 4-6 son cambios en el **tema Shopify** (no en Vercel).

---

## ¿No funciona nada? Diagnóstico rápido

### Paso 1 — Verificar configuración en Vercel

Después de hacer el deploy, abre esta URL en el navegador:

```
https://www.saludcompartida.app/api/health
```

El endpoint responde en JSON e indica exactamente qué variables están faltando **y si la conexión a Supabase funciona realmente**:

```json
{
  "status": "missing_env_vars",
  "missing_required": ["supabase_main", "shopify_webhook", "resend_email"],
  "supabase_connected": null,
  "instructions": "Agregar las variables faltantes en: Vercel → proyecto → Settings → Environment Variables → y luego hacer Redeploy."
}
```

Si las variables están configuradas pero la BD falla, verás:

```json
{
  "status": "supabase_connection_failed",
  "missing_required": [],
  "supabase_connected": false,
  "supabase_error": "...",
  "instructions": "Verificar que SUPABASE_URL_MAIN y SUPABASE_SERVICE_ROLE_KEY_MAIN sean correctas en Vercel..."
}
```

Si el `status` es `"ok"` y `supabase_connected` es `true`, las variables están configuradas **y la conexión a la base de datos funciona**.

### Paso 2 — Agregar las variables en Vercel

1. Ir a [vercel.com](https://vercel.com) → seleccionar el proyecto `launch_saludcompartida`
2. Click en **Settings** → **Environment Variables**
3. Agregar cada variable listada abajo (ver detalles en `.env.example`)
4. Hacer **Redeploy** (Deployments → botón "..." → Redeploy)

### Paso 3 — Verificar de nuevo

Volver a abrir `https://www.saludcompartida.app/api/health` — debe mostrar `"status": "ok"`.

> **Nota:** Vercel **no** necesita instalar ningún paquete adicional. Solo necesita las variables de entorno. El `npm install` se ejecuta automáticamente en cada deploy y ya incluye todo lo necesario (`@supabase/supabase-js`, `next`, `react`).

---

## Por qué este repositorio existe

Vercel sugirió crear un repositorio limpio (`launch_saludcompartida`) porque el repositorio anterior (`MVP-SaludCompartida`) tenía muchas referencias a archivos inexistentes, variables sin conectar y código de pruebas mezclado con producción. **Este repositorio ES la app de producción.**

---

## Cómo funciona el flujo completo

### El problema que se estaba dando

```
ANTES (roto):
Usuario llena formulario Shopify
  → Cart API (sin datos explícitos del cliente)
  → Shopify Checkout usa datos de sesión iniciada ← ERROR: email incorrecto
  → Pago completo
  → Webhook busca registro por email (email incorrecto) → no encuentra nada
  → Código enviado por mail era de OTRA persona (o no se enviaba)
```

### El flujo correcto (ahora)

```
AHORA (correcto):
1. Usuario llena formulario Shopify
   ↓
2. Formulario llama POST https://www.saludcompartida.app/api/registro
   → Crea registro en Supabase con los datos DEL FORMULARIO
   → Genera 2 códigos únicos (migrant_code, family_code)
   → Guarda con status='pending_payment'
   → Devuelve: { registrationId, migrantCode, familyCode }
   ↓
3. Formulario crea carrito vía Storefront API con:
   → buyerIdentity.email = email del formulario (EXPLÍCITO, no de sesión)
   → buyerIdentity.phone, firstName, lastName del formulario
   → cart attribute: registration_id = registrationId del paso 2
   ↓
4. Usuario completa pago en Shopify Checkout
   ↓
5. Shopify llama POST https://www.saludcompartida.app/api/webhooks/shopify
   → Verifica firma HMAC
   → Lee registration_id del atributo del carrito
   → Busca el registro en Supabase por ID (SIEMPRE encuentra el correcto)
   → Actualiza status='active'
   → Envía email con los códigos a migrante Y familiar
   ↓
6. Usuario entra a www.saludcompartida.app
   → Ingresa su código de 6 caracteres
   → /api/validar-codigo lo verifica en Supabase
   → Redirige a /dashboard con sus beneficios
```

**Nota de Shopify:** Shopify NO crea códigos de autenticación. Los códigos los creamos nosotros en Supabase, en el paso 2, ANTES del pago.

---

## APIs en este repositorio

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/registro` | POST | Crea registro en Supabase + genera códigos. Llamado por el formulario Shopify. |
| `/api/validar-codigo` | POST | Valida un código de 6 caracteres. Busca en `registrations` (MAIN) y `shopify_orders` (ALT). |
| `/api/webhooks/shopify` | POST | Recibe `orders/paid` de Shopify. Activa la cuenta y envía emails con códigos. |

---

## Variables de entorno en Vercel — dónde encontrar cada valor

Ir a: **[vercel.com](https://vercel.com) → proyecto `launch_saludcompartida` → Settings → Environment Variables**

Agrega cada variable de la tabla siguiente. Después de agregar todas, haz **Redeploy**.

| Variable | Requerida | Dónde encontrarla |
|---|---|---|
| `SUPABASE_URL_MAIN` | ✅ Sí | Ver §1 abajo |
| `SUPABASE_SERVICE_ROLE_KEY_MAIN` | ✅ Sí | Ver §1 abajo |
| `SHOPIFY_WEBHOOK_SECRET` | ✅ Sí | Ver §2 abajo |
| `RESEND_API_KEY` | ✅ Sí | Ver §3 abajo |
| `SHOPIFY_STORE_ORIGIN` | Recomendado | Ver §4 abajo |
| `RESEND_FROM_EMAIL` | Opcional | Ver §3 abajo |
| `SUPABASE_URL_ALT` | Solo si hay órdenes antiguas | Ver §5 abajo |
| `SUPABASE_SERVICE_ROLE_KEY_ALT` | Solo si hay órdenes antiguas | Ver §5 abajo |
| `NEXT_PUBLIC_SUPABASE_URL` | Opcional | Mismo valor que `SUPABASE_URL_MAIN` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Opcional | Ver §1 abajo (anon key, NO service role) |

---

### §1 — Supabase: `SUPABASE_URL_MAIN` y `SUPABASE_SERVICE_ROLE_KEY_MAIN`

> Este es el paso más importante. Sin estas dos variables **nada funciona**.

> 💡 **Atajo:** Si ya tienes el `NEXT_PUBLIC_SUPABASE_ANON_KEY`, puedes leer la URL del proyecto directamente del JWT sin entrar a Supabase:
> el campo `ref` del payload es el ID del proyecto, y la URL es `https://<ref>.supabase.co`.
>
> **Para este proyecto:**
> ```
> SUPABASE_URL_MAIN      = https://nuqwqshfaeygpstcfjnh.supabase.co
> NEXT_PUBLIC_SUPABASE_URL = https://nuqwqshfaeygpstcfjnh.supabase.co
> ```
> Solo falta obtener la `service_role` key (paso 3 abajo).

1. Entrar a [supabase.com](https://supabase.com) → seleccionar el proyecto **`mvp-saludcompartida`**
2. En el menú izquierdo hacer click en **Project Settings** (ícono de engranaje ⚙️)
3. Click en **Data API** (antes llamado "API")
4. Copiar los valores:

| Variable en Vercel | Dónde en Supabase | Valor para este proyecto |
|---|---|---|
| `SUPABASE_URL_MAIN` | **Project URL** | `https://nuqwqshfaeygpstcfjnh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_URL` | mismo que arriba | `https://nuqwqshfaeygpstcfjnh.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY_MAIN` | "Project API keys" → fila **`service_role`** | `eyJ...` (copiar desde Supabase) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "Project API keys" → fila **`anon`** | ✅ Ya configurado |

> ⚠️ **No confundir**: la `service_role` key y la `anon` key son tokens **distintos**. La `service_role` ignora RLS — es la que necesita el servidor para leer y escribir datos. La `anon` key es pública.
>
> El campo `service_role` lo verás en la misma pantalla "Data API", justo debajo de la `anon` key. Tiene que decir `service_role` en la etiqueta.

---

### §2 — Shopify webhook: `SHOPIFY_WEBHOOK_SECRET`

1. Entrar a **Shopify Admin** → **Configuración** (Settings) → **Notificaciones** (Notifications)
2. Bajar hasta la sección **Webhooks** → click en **Crear webhook** (Create webhook)
3. Llenar:
   - **Evento:** `Pago de pedido` (orders/paid)
   - **Formato:** JSON
   - **URL:** `https://www.saludcompartida.app/api/webhooks/shopify`
   - **Versión API:** `2024-10`
4. Click en **Guardar**
5. Shopify muestra un banner con el **Signing Secret** (empieza con `shpss_...`)
6. Copiar ese valor como `SHOPIFY_WEBHOOK_SECRET` en Vercel

> ⚠️ El Signing Secret **solo se muestra una vez** después de crear el webhook. Si lo pierdes, tienes que eliminar el webhook y crear uno nuevo.

---

### §3 — Resend (emails): `RESEND_API_KEY` y `RESEND_FROM_EMAIL`

1. Entrar a [resend.com](https://resend.com) → hacer login (o crear cuenta gratis)
2. En el menú izquierdo: **API Keys** → **Create API Key**
   - Nombre: `saludcompartida-production`
   - Permission: **Full access**
3. Copiar la key generada (empieza con `re_...`) como `RESEND_API_KEY` en Vercel

Para `RESEND_FROM_EMAIL`:
- Si ya tienes el dominio `saludcompartida.app` verificado en Resend: usa `noreply@saludcompartida.app`
- Si NO has verificado el dominio aún:
  1. En Resend: **Domains** → **Add Domain** → ingresar `saludcompartida.app`
  2. Resend te dará registros DNS (TXT/MX) que debes agregar en tu proveedor de dominio
  3. Una vez verificado, usar `noreply@saludcompartida.app`
  - (Alternativa temporal para pruebas: Resend provee `onboarding@resend.dev` — funciona sin verificar dominio pero solo puede enviar a tu propio email)

---

### §4 — Dominio Shopify: `SHOPIFY_STORE_ORIGIN`

Esta variable controla qué dominio puede llamar a `/api/registro` (CORS).

- Si tu tienda es `mi-tienda.myshopify.com`, el valor es: `https://mi-tienda.myshopify.com`
- Si tienes dominio personalizado como `tienda.saludcompartida.app`, el valor es: `https://tienda.saludcompartida.app`
- Si no estás segura, puedes poner `*` temporalmente (permite cualquier origen)

---

### §5 — Supabase ALT (solo órdenes antiguas): `SUPABASE_URL_ALT` y `SUPABASE_SERVICE_ROLE_KEY_ALT`

> Solo necesitas esto si tienes órdenes creadas **antes** de implementar el formulario `/api/registro`. Si todas tus ventas futuras usarán el nuevo formulario, puedes dejar estas variables en blanco.

Mismo proceso que §1, pero seleccionando el proyecto **`launch-saludcompartida`** en Supabase.

---

### Tabla de Shopify (Theme Settings): `shopify_storefront_token`, `shopify_variant_basico`, `shopify_selling_plan_basico`

Estos valores NO van en Vercel — van en el tema de Shopify (**Online Store → Themes → Customize → Theme settings**):

**`shopify_storefront_token`** (Storefront API Access Token):
1. Shopify Admin → **Apps** → **Develop apps** (o "App development" en la esquina superior derecha)
2. Click en tu app → **API credentials**
3. En la sección "Storefront API access token" → copiar el token

**`shopify_variant_basico`** (Variant ID del plan, solo el número):
1. Shopify Admin → **Catálogo** (Products) → seleccionar tu producto de suscripción
2. Bajar a la sección **Variants** → click en la variante del plan
3. Mirar la URL del navegador: `.../variants/`**`42695875788877`** ← ese número es el Variant ID

**`shopify_selling_plan_basico`** (Selling Plan ID, solo el número):
1. Shopify Admin → **Apps** → tu app de suscripciones (ej. "Subscriptions by Recharge" o "Shopify Subscriptions")
2. Abrir el plan de suscripción mensual
3. Mirar la URL: `.../selling_plans/`**`7685865549`** ← ese número es el Selling Plan ID

> **Alternativa para encontrar los IDs:** En Shopify Admin → **Settings** → **Apps and sales channels** → seleccionar tu app de subscriptions → ver los plan IDs en la configuración de la app.

---

## Formulario de Shopify (`SHOPIFY/sections/main-redirect-registro.liquid`)

> ✅ **Ya aplicado** — El archivo `SHOPIFY/sections/main-redirect-registro.liquid` ya contiene la implementación actualizada. Subir este archivo al tema Shopify en: **Online Store → Themes → Edit code → sections/**.

El flujo implementado:
1. Llamar primero a `/api/registro` para crear el registro en Supabase (obtiene `registrationId`)
2. Crear el carrito con Storefront API pasando `buyerIdentity` explícito (email del formulario) y el `registration_id` como atributo de línea

La función `handleRegistroSubmit` en el archivo ya implementa este flujo con validación de configuración:

```javascript
// ─── Fragmento de handleRegistroSubmit (ver archivo completo en SHOPIFY/sections/main-redirect-registro.liquid) ───
//
// Dentro del bloque try{}, después de PASO 1 (llamar /api/registro y obtener registrationId):
//
// ── PASO 2: Crear carrito con Storefront API ──────────────────────────────────
const storefrontToken = '{{ settings.shopify_storefront_token }}';
const variantId       = '{{ settings.shopify_variant_basico }}';
const sellingPlanId   = '{{ settings.shopify_selling_plan_basico }}';
// ↑ Configurar en: Shopify Admin → Online Store → Themes → Customize → Theme settings
//   Variant ID: Shopify Admin → Catálogo → Productos → [Plan Básico] → editar variante → URL
//   Selling Plan ID: Shopify Admin → Aplicaciones → Subscriptions → tu plan

if (!storefrontToken || !variantId || !sellingPlanId) {
  throw new Error('El formulario no está configurado correctamente. Contacta al administrador.');
}

const variantGid     = `gid://shopify/ProductVariant/${variantId}`;
const sellingPlanGid = `gid://shopify/SellingPlan/${sellingPlanId}`;
```

### Agregar en Theme Settings (`config/settings_schema.json`)

Copiar las entradas de `SHOPIFY/config/settings_schema_entries.json` dentro del array del último objeto `{ "name": "..." }` en `config/settings_schema.json`:

```json
{
  "type": "text",
  "id": "shopify_storefront_token",
  "label": "Storefront API Access Token",
  "info": "Token público para crear carritos. Encontrar en: Shopify Admin → Apps → Develop apps → tu app → API credentials → Storefront API access token"
},
{
  "type": "text",
  "id": "shopify_variant_basico",
  "label": "Variant ID — Plan Básico (solo el número)",
  "info": "Encontrar en: Shopify Admin → Catálogo → Productos → [Plan Básico] → editar variante → el número al final de la URL. Ejemplo: 42695875788877"
},
{
  "type": "text",
  "id": "shopify_selling_plan_basico",
  "label": "Selling Plan ID — Plan Básico (solo el número)",
  "info": "Encontrar en: Shopify Admin → Aplicaciones → Subscriptions → tu plan de suscripción. Ejemplo: 7685865549"
}
```

### Registrar el webhook en Shopify

En **Shopify Admin → Configuración → Notificaciones → Webhooks**:

| Campo | Valor |
|---|---|
| Evento | `Pago de pedido` (`orders/paid`) |
| Formato | JSON |
| URL | `https://www.saludcompartida.app/api/webhooks/shopify` |
| Versión API | `2024-10` |

Después de guardar, Shopify muestra el **Signing Secret** — copiar ese valor como variable de entorno `SHOPIFY_WEBHOOK_SECRET` en Vercel.

---

## Estructura del proyecto

```
launch_saludcompartida/
├── app/
│   ├── layout.tsx                    ← HTML raíz
│   ├── page.tsx                      ← Landing page dinámica (validación de código)
│   ├── dashboard/
│   │   └── page.tsx                  ← Panel del usuario después de validar el código
│   └── api/
│       ├── registro/
│       │   └── route.ts              ← POST: crea registro en Supabase + genera códigos
│       ├── validar-codigo/
│       │   └── route.ts              ← POST: valida código de acceso
│       └── webhooks/
│           └── shopify/
│               └── route.ts          ← POST: recibe orders/paid → activa cuenta → envía emails
├── public/
│   └── saludcompartida-dark-no-tagline.png  ← Logo (agregar este archivo)
├── .env.example                      ← Variables de entorno requeridas
├── next.config.js
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## Logo

El archivo `/public/saludcompartida-dark-no-tagline.png` debe subirse al repositorio.
Si no está disponible, la landing muestra "SaludCompartida" en texto automáticamente.

---

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con los valores reales de Supabase, Resend y Shopify

# 3. Correr en local
npm run dev
# → http://localhost:3000
```

