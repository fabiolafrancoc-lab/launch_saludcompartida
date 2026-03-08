# launch_saludcompartida — `www.saludcompartida.app`

Aplicación Next.js que sirve la landing page de SaludCompartida y las APIs necesarias para el flujo de registro, validación de códigos y activación de suscripciones vía Shopify.

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

## Actualización requerida en el formulario de Shopify

El formulario en `SHOPIFY/sections/main-redirect-registro.liquid` debe reemplazar el bloque `handleRegistroSubmit` con el siguiente código. El cambio clave es:
1. Llamar primero a `/api/registro` para crear el registro en Supabase
2. Luego crear el carrito con Storefront API pasando `buyerIdentity` con los datos del formulario

```javascript
// ─── Reemplazar la función handleRegistroSubmit completa ───────────────────
async function handleRegistroSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('form-registro');
  const fd   = new FormData(form);

  // Datos del migrante (del formulario — NO de la sesión Shopify)
  const migrant = {
    first_name: (fd.get('nombre') || '').trim(),
    last_name:  (fd.get('apellido_paterno') || '').trim(),
    email:      (fd.get('email') || '').trim(),
    phone:      (fd.get('telefono') || '').trim(),
    birthdate:  fd.get('fecha_nacimiento'),
    plan:       fd.get('plan') || 'basico',
  };

  // Datos de la familia (primer beneficiario)
  const family = {
    first_name: (fd.get('ben1_nombre') || '').trim(),
    last_name:  (fd.get('ben1_apellido') || '').trim(),
    email:      (fd.get('ben1_email') || '').trim(),
    phone:      (fd.get('ben1_telefono') || '').trim(),
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Procesando...'; }

  try {
    // ── PASO 1: Crear registro en Supabase y obtener los códigos ────────────
    const regRes = await fetch('https://www.saludcompartida.app/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        migrant_first_name: migrant.first_name,
        migrant_last_name:  migrant.last_name,
        migrant_email:      migrant.email,
        migrant_phone:      migrant.phone,
        family_first_name:  family.first_name,
        family_last_name:   family.last_name,
        family_email:       family.email,
        family_phone:       family.phone,
        plan_type:          migrant.plan,
      }),
    });
    const regData = await regRes.json();
    if (!regData.success) throw new Error(regData.error || 'Error al crear registro');

    const registrationId = regData.registrationId;

    // ── PASO 2: Crear carrito con Storefront API ─────────────────────────────
    // buyerIdentity asegura que el email del FORMULARIO se use en el checkout,
    // independientemente de si hay una sesión Shopify activa.
    const storefrontToken = '{{ settings.shopify_storefront_token }}';
    const variantGid = `gid://shopify/ProductVariant/{{ settings.shopify_variant_basico | default: 42695875788877 }}`;
    const sellingPlanGid = `gid://shopify/SellingPlan/{{ settings.shopify_selling_plan_basico | default: 7685865549 }}`;
    // ↑ Encontrar estos IDs en: Shopify Admin → Catálogo → Productos → [Plan Básico]
    //   El Variant ID está en la URL al editar la variante.
    //   El Selling Plan ID está en: Aplicaciones → Subscriptions → tu plan.

    const cartMutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }
    `;
    const cartVariables = {
      input: {
        lines: [{
          merchandiseId: variantGid,
          quantity: 1,
          sellingPlanId: sellingPlanGid,
          attributes: [
            { key: 'registration_id',  value: registrationId },
            { key: 'Nombre migrante',  value: migrant.first_name + ' ' + migrant.last_name },
            { key: 'Email migrante',   value: migrant.email },
          ],
        }],
        buyerIdentity: {
          email:       migrant.email,      // ← explícito del formulario
          phone:       migrant.phone,
          countryCode: 'US',
          deliveryAddressPreferences: [],
        },
        note: `Migrante: ${migrant.first_name} ${migrant.last_name} | ` +
              `Email: ${migrant.email} | ` +
              `Familia: ${family.first_name} ${family.last_name} | ` +
              `Plan: ${migrant.plan} | ` +
              `registration_id: ${registrationId}`,
      },
    };

    const cartRes = await fetch('/api/2024-10/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({ query: cartMutation, variables: cartVariables }),
    });
    const cartData = await cartRes.json();
    const checkoutUrl = cartData?.data?.cartCreate?.cart?.checkoutUrl;
    if (!checkoutUrl) {
      const errMsg = cartData?.data?.cartCreate?.userErrors?.[0]?.message || 'Error al preparar el carrito';
      throw new Error(errMsg);
    }

    // ── PASO 3: Redirigir al checkout de Shopify ─────────────────────────────
    window.location.href = checkoutUrl;

  } catch (err) {
    console.error('Checkout error:', err);
    const msg = err instanceof Error ? err.message : 'Ocurrió un error. Por favor intenta de nuevo.';
    let errEl = document.getElementById('sc-checkout-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.id = 'sc-checkout-error';
      errEl.style.cssText = 'color:#f87171;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);border-radius:8px;padding:12px 16px;margin-top:12px;font-size:14px;';
      form.appendChild(errEl);
    }
    errEl.textContent = msg;
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Continuar al pago — Primer mes GRATIS'; }
  }
}
```

### También agregar en Theme Settings (`config/settings_schema.json`)

```json
{
  "type": "text",
  "id": "shopify_storefront_token",
  "label": "Storefront API Access Token",
  "info": "Encontrar en: Shopify Admin → Apps → Develop apps → tu app → API credentials → Storefront API access token"
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

