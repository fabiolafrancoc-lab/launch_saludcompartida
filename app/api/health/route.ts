import { NextResponse } from 'next/server'

/**
 * GET /api/health
 *
 * Diagnóstico rápido del servidor — muestra qué variables de entorno están
 * configuradas en Vercel sin exponer sus valores.
 *
 * Útil para verificar la configuración cuando el equipo reporta que
 * "no funciona nada". Visitar: https://www.saludcompartida.app/api/health
 */
export async function GET() {
  const checks = {
    supabase_main: {
      url: !!process.env.SUPABASE_URL_MAIN,
      key: !!process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN,
      ok:  !!process.env.SUPABASE_URL_MAIN && !!process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN,
      required: true,
      used_by: ['/api/registro', '/api/validar-codigo', '/api/webhooks/shopify'],
    },
    supabase_alt: {
      url: !!process.env.SUPABASE_URL_ALT,
      key: !!process.env.SUPABASE_SERVICE_ROLE_KEY_ALT,
      ok:  !!process.env.SUPABASE_URL_ALT && !!process.env.SUPABASE_SERVICE_ROLE_KEY_ALT,
      required: false,
      used_by: ['/api/validar-codigo (fallback para shopify_orders legados)'],
    },
    shopify_webhook: {
      ok: !!process.env.SHOPIFY_WEBHOOK_SECRET,
      required: true,
      used_by: ['/api/webhooks/shopify'],
    },
    shopify_cors: {
      ok: !!process.env.SHOPIFY_STORE_ORIGIN,
      required: false,
      used_by: ['/api/registro (CORS, default: *)'],
    },
    resend_email: {
      ok: !!process.env.RESEND_API_KEY,
      required: true,
      used_by: ['/api/webhooks/shopify (envío de emails con códigos)'],
    },
  }

  const missingRequired = Object.entries(checks)
    .filter(([, v]) => v.required && !v.ok)
    .map(([k]) => k)

  const status = missingRequired.length === 0 ? 'ok' : 'missing_env_vars'

  return NextResponse.json(
    {
      status,
      missing_required: missingRequired,
      checks,
      instructions:
        missingRequired.length > 0
          ? 'Agregar las variables faltantes en: Vercel → proyecto → Settings → Environment Variables → y luego hacer Redeploy.'
          : 'Todas las variables requeridas están configuradas.',
    },
    { status: missingRequired.length === 0 ? 200 : 503 }
  )
}
