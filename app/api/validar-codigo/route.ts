import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getSupabaseMain() {
  const url = process.env.SUPABASE_URL_MAIN ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  if (!url || !key) return null
  return createClient(url, key)
}

function getSupabaseAlt() {
  const url = process.env.SUPABASE_URL_ALT ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY_ALT ?? ''
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * POST /api/validar-codigo
 *
 * Validates a 6-character access code.
 * Search order:
 *   1. MAIN Supabase → table `registrations`  (codes from our registration form)
 *   2. ALT  Supabase → table `shopify_orders` (legacy codes from older Shopify orders)
 *
 * Returns { success: true, user: { type, userName, email } }
 * or      { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    // Validate format — must be exactly 6 uppercase alphanumeric chars
    if (!code || !/^[A-Z0-9]{6}$/i.test(String(code))) {
      return NextResponse.json({ success: false, error: 'El código debe tener exactamente 6 caracteres.' })
    }

    const normalizedCode = String(code).toUpperCase().trim()

    // ── 1. Search in MAIN Supabase — table: registrations ───────────────────
    const mainClient = getSupabaseMain()
    if (mainClient) {
      const { data: reg } = await mainClient
        .from('registrations')
        .select('*')
        .or(`migrant_code.eq.${normalizedCode},family_code.eq.${normalizedCode}`)
        .maybeSingle()

      if (reg) {
        // Account must be active (payment completed)
        if (reg.status && reg.status !== 'active') {
          return NextResponse.json({
            success: false,
            error:
              reg.status === 'pending_payment'
                ? 'Tu pago aún no se ha completado. Revisa tu correo para terminar el proceso.'
                : 'Cuenta inactiva. Contacta soporte: contacto@saludcompartida.com',
          })
        }

        const isMigrant = reg.migrant_code === normalizedCode
        const userName = isMigrant
          ? [reg.migrant_first_name, reg.migrant_last_name].filter(Boolean).join(' ').trim()
          : [reg.family_first_name, reg.family_last_name].filter(Boolean).join(' ').trim()

        return NextResponse.json({
          success: true,
          user: {
            type: isMigrant ? 'migrant' : 'family',
            userName: userName || 'Usuario',
            migrantName: [reg.migrant_first_name, reg.migrant_last_name].filter(Boolean).join(' ').trim(),
            familyName: [reg.family_first_name, reg.family_last_name].filter(Boolean).join(' ').trim(),
            email: isMigrant ? reg.migrant_email : reg.family_email,
            planType: reg.plan_type ?? 'Plan Familiar',
          },
        })
      }
    }

    // ── 2. Search in ALT Supabase — table: shopify_orders (legacy) ───────────
    const altClient = getSupabaseAlt() ?? mainClient
    if (altClient) {
      const { data: order } = await altClient
        .from('shopify_orders')
        .select('*')
        .or(`mvp_migrant_code.eq.${normalizedCode},mvp_family_code.eq.${normalizedCode}`)
        .maybeSingle()

      if (order) {
        if (order.financial_status && order.financial_status !== 'paid') {
          return NextResponse.json({
            success: false,
            error: 'Pago pendiente. Contacta soporte: contacto@saludcompartida.com',
          })
        }

        const isMigrant = order.mvp_migrant_code === normalizedCode
        const userName = isMigrant
          ? [order.customer_first_name, order.customer_last_name].filter(Boolean).join(' ').trim()
          : [order.family_first_name, order.family_last_name].filter(Boolean).join(' ').trim()

        return NextResponse.json({
          success: true,
          user: {
            type: isMigrant ? 'migrant' : 'family',
            userName: userName || 'Usuario',
            email: isMigrant ? order.customer_email : order.family_email,
            planType: order.plan_type ?? 'Plan Familiar',
          },
        })
      }
    }

    // ── 3. Not found in any source ───────────────────────────────────────────
    if (!mainClient && !altClient) {
      // No database credentials configured at all — admin needs to set env vars
      console.error('[/api/validar-codigo] No Supabase credentials configured.')
      return NextResponse.json({
        success: false,
        error: 'Servicio no disponible. Contacta soporte: contacto@saludcompartida.com',
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Código no encontrado. Verifica que lo copiaste correctamente e intenta de nuevo.',
    })
  } catch (err) {
    console.error('[/api/validar-codigo] Unexpected error:', err)
    return NextResponse.json({
      success: false,
      error: 'Error de conexión. Por favor intenta de nuevo.',
    })
  }
}
