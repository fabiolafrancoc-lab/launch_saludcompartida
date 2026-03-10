import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const runtime = 'nodejs'

// CORS — this endpoint is called cross-origin from the Shopify store
const CORS = {
  'Access-Control-Allow-Origin': process.env.SHOPIFY_STORE_ORIGIN ?? '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function getSupabase() {
  const url = process.env.SUPABASE_URL_MAIN ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN ?? ''
  if (!url || !key) throw new Error('SUPABASE_URL_MAIN / SUPABASE_SERVICE_ROLE_KEY_MAIN no configurados')
  return createClient(url, key)
}

/** Generates a 6-char code using only unambiguous alphanumeric characters */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0 O 1 I L
  const charsLen = chars.length // 32 — power of 2, so no modulo bias
  let code = ''
  // Use rejection sampling to avoid any modulo bias
  while (code.length < 6) {
    const byte = crypto.randomBytes(1)[0]
    // Accept only bytes in the range [0, floor(256/charsLen)*charsLen)
    const limit = Math.floor(256 / charsLen) * charsLen
    if (byte < limit) code += chars[byte % charsLen]
  }
  return code
}

/** OPTIONS — preflight for CORS */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

/**
 * POST /api/registro
 *
 * Called by the Shopify registration form BEFORE checkout.
 * Creates a registration row in Supabase with two unique access codes
 * and returns the registrationId so it can be attached to the Shopify cart.
 *
 * Body (JSON):
 *   migrant_first_name, migrant_last_name, migrant_email, migrant_phone
 *   family_first_name,  family_last_name,  family_email,  family_phone
 *   plan_type  (optional, defaults to "familiar")
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const migrantEmail: string = (body.migrant_email ?? '').trim().toLowerCase()
    if (!migrantEmail) {
      return NextResponse.json(
        { success: false, error: 'El email del migrante es requerido' },
        { status: 400, headers: CORS }
      )
    }

    const supabase = getSupabase()

    // ── If a pending registration already exists for this email, reuse it ──
    // (prevents duplicate rows when the user clicks "back" from checkout)
    const { data: existing } = await supabase
      .from('registrations')
      .select('id, migrant_code, family_code, status')
      .eq('migrant_email', migrantEmail)
      .in('status', ['pending_payment', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          registrationId: existing.id,
          migrantCode: existing.migrant_code,
          familyCode: existing.family_code,
          alreadyExists: true,
        },
        { headers: CORS }
      )
    }

    // ── Generate two distinct codes ──────────────────────────────────────────
    let migrantCode = generateCode()
    let familyCode = generateCode()
    let attempts = 0
    while (migrantCode === familyCode && attempts < 10) {
      familyCode = generateCode()
      attempts++
    }

    // ── Insert registration ──────────────────────────────────────────────────
    const { data: registration, error: insertError } = await supabase
      .from('registrations')
      .insert({
        migrant_first_name: (body.migrant_first_name ?? '').trim(),
        migrant_last_name: (body.migrant_last_name ?? '').trim(),
        migrant_email: migrantEmail,
        migrant_phone: (body.migrant_phone ?? '').replace(/\D/g, ''),
        migrant_country_code: '+1',
        family_first_name: (body.family_first_name ?? '').trim(),
        family_last_name: (body.family_last_name ?? '').trim(),
        family_email: (body.family_email ?? '').trim().toLowerCase(),
        family_phone: (body.family_phone ?? '').replace(/\D/g, ''),
        family_country_code: '+52',
        migrant_code: migrantCode,
        family_code: familyCode,
        status: 'pending_payment',
        plan_type: (body.plan_type ?? 'familiar').trim(),
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[/api/registro] Supabase insert error:', insertError.message)
      return NextResponse.json(
        { success: false, error: 'Error al guardar el registro. Intenta de nuevo.' },
        { status: 500, headers: CORS }
      )
    }

    return NextResponse.json(
      { success: true, registrationId: registration.id, migrantCode, familyCode },
      { headers: CORS }
    )
  } catch (err) {
    console.error('[/api/registro] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Error interno. Intenta de nuevo.' },
      { status: 500, headers: CORS }
    )
  }
}
