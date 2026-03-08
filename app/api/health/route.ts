import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * GET /api/health
 *
 * Diagnóstico rápido del servidor — muestra qué variables de entorno están
 * configuradas en Vercel sin exponer sus valores, y verifica que la conexión
 * a Supabase funcione realmente.
 *
 * Útil para verificar la configuración cuando el equipo reporta que
 * "no funciona nada". Visitar: https://www.saludcompartida.app/api/health
 */
export async function GET() {
  // ── 1. Check env var presence ────────────────────────────────────────────
  const envChecks = {
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

  const missingRequired = Object.entries(envChecks)
    .filter(([, v]) => v.required && !v.ok)
    .map(([k]) => k)

  // ── 2. Test actual Supabase connectivity (only if vars are present) ──────
  let supabaseConnected: boolean | null = null
  let supabaseError: string | null = null

  if (envChecks.supabase_main.ok) {
    try {
      const client = createClient(
        process.env.SUPABASE_URL_MAIN!,
        process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN!
      )
      // Fetch at most 1 row to confirm the connection and table exist
      const { error } = await client.from('registrations').select('id').limit(1)
      if (error) {
        supabaseConnected = false
        supabaseError = error.message
      } else {
        supabaseConnected = true
      }
    } catch (err) {
      supabaseConnected = false
      supabaseError = err instanceof Error ? err.message : String(err)
    }
  }

  // ── 3. Determine overall status ──────────────────────────────────────────
  const envOk = missingRequired.length === 0
  // dbOk is true when the connection succeeded, or when we couldn't test it (env vars missing)
  const dbOk = supabaseConnected === true || supabaseConnected === null

  const status = !envOk
    ? 'missing_env_vars'
    : !dbOk
    ? 'supabase_connection_failed'
    : 'ok'

  let instructions: string
  if (!envOk) {
    instructions =
      'Agregar las variables faltantes en: Vercel → proyecto → Settings → Environment Variables → y luego hacer Redeploy.'
  } else if (!dbOk) {
    instructions =
      'Las variables de entorno están configuradas pero la conexión a Supabase falló. ' +
      'Verificar que SUPABASE_URL_MAIN y SUPABASE_SERVICE_ROLE_KEY_MAIN sean correctas en Vercel, y que el proyecto Supabase esté activo.'
  } else {
    instructions = 'Todo está configurado correctamente.'
  }

  return NextResponse.json(
    {
      status,
      missing_required: missingRequired,
      supabase_connected: supabaseConnected,
      ...(supabaseError ? { supabase_error: supabaseError } : {}),
      env_checks: envChecks,
      instructions,
    },
    { status: status === 'ok' ? 200 : 503 }
  )
}
