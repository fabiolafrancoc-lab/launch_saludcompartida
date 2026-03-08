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

## Variables de entorno en Vercel

Ir a: **Vercel → proyecto `launch_saludcompartida` → Settings → Environment Variables**

| Variable | Descripción | Requerida |
|---|---|---|
| `SUPABASE_URL_MAIN` | URL del proyecto Supabase MAIN (`mvp-saludcompartida`) | ✅ Sí |
| `SUPABASE_SERVICE_ROLE_KEY_MAIN` | Service role key del proyecto MAIN | ✅ Sí |
| `SUPABASE_URL_ALT` | URL del proyecto Supabase ALT (`launch-saludcompartida`) | Para legacy |
| `SUPABASE_SERVICE_ROLE_KEY_ALT` | Service role key del proyecto ALT | Para legacy |
| `SHOPIFY_WEBHOOK_SECRET` | Secreto para verificar webhooks de Shopify | ✅ Sí |
| `SHOPIFY_STORE_ORIGIN` | Dominio de la tienda Shopify (para CORS). Ej: `https://tu-tienda.myshopify.com` | Recomendado |
| `RESEND_API_KEY` | API key de Resend para enviar emails | ✅ Sí |
| `RESEND_FROM_EMAIL` | Email remitente. Default: `noreply@saludcompartida.app` | Opcional |
| `NEXT_PUBLIC_SUPABASE_URL` | Igual que `SUPABASE_URL_MAIN` (fallback client-side) | Opcional |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key del proyecto MAIN (fallback client-side) | Opcional |

> **MAIN vs ALT:** `_MAIN` = proyecto Supabase `mvp-saludcompartida` (tabla `registrations`).
> `_ALT` = proyecto Supabase `launch-saludcompartida` (tabla `shopify_orders`, solo para órdenes antiguas).

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

