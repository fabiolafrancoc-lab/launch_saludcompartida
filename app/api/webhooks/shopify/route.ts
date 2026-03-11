import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getSupabase() {
  const url = process.env.SUPABASE_URL_MAIN ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN ?? ''
  if (!url || !key) throw new Error('SUPABASE_URL_MAIN / SUPABASE_SERVICE_ROLE_KEY_MAIN no configurados')
  return createClient(url, key)
}

function verifyHmac(rawBody: string, hmacHeader: string | null, secret: string): boolean {
  if (!hmacHeader) return false
  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
  // Compare base64 strings — both must be decoded from base64 for a safe comparison
  const sig = Buffer.from(hmacHeader, 'base64')
  const comp = Buffer.from(digest, 'base64')
  if (sig.length !== comp.length) return false
  return crypto.timingSafeEqual(sig, comp)
}

/** Read a value from note_attributes or line_item properties */
function getOrderAttr(order: Record<string, unknown>, keys: string[]): string {
  type Attr = { name?: string; key?: string; value?: string }
  const noteAttrs = (order.note_attributes as Attr[] | undefined) ?? []
  const lineItems = (order.line_items as Array<{ properties?: Attr[] }> | undefined) ?? []
  const lineProps = lineItems.flatMap((item) => item.properties ?? [])
  const all = [...noteAttrs, ...lineProps]
  for (const key of keys) {
    const found = all.find((a) => (a.name ?? a.key ?? '').toLowerCase() === key.toLowerCase())
    if (found?.value) return found.value
  }
  return ''
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@saludcompartida.app'
  if (!apiKey || !to) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    })
  } catch (err) {
    console.error('[webhook/shopify] sendEmail error:', err)
  }
}

function codeBox(label: string, code: string, borderColor: string) {
  return `
    <div style="background:#1a2540;border:1px solid ${borderColor};border-radius:12px;padding:24px;margin:20px 0;text-align:center">
      <p style="color:#94A3B8;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px">${label}</p>
      <p style="font-size:34px;font-weight:700;letter-spacing:8px;color:#ffffff;margin:0">${code}</p>
    </div>`
}

/**
 * POST /api/webhooks/shopify
 *
 * Receives the `orders/paid` Shopify webhook.
 * Looks up the registration by `registration_id` (set as a cart attribute
 * when the Shopify form calls /api/registro before checkout).
 * Falls back to email lookup for legacy orders.
 * Activates the account and sends welcome emails with the access codes.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook/shopify] SHOPIFY_WEBHOOK_SECRET not set')
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  const rawBody = await req.text()
  if (!verifyHmac(rawBody, req.headers.get('x-shopify-hmac-sha256'), secret)) {
    return NextResponse.json({ ok: false, error: 'Firma inválida' }, { status: 401 })
  }

  const topic = req.headers.get('x-shopify-topic')
  if (topic && topic !== 'orders/paid') {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const order = JSON.parse(rawBody) as Record<string, unknown>

  if ((order.financial_status as string) !== 'paid') {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const supabase = getSupabase()

  // ── 1. Look up registration by registration_id attribute (most reliable) ──
  //    This attribute is set when the Shopify form calls /api/registro first.
  let registration: Record<string, string> | null = null

  const registrationId = getOrderAttr(order, ['registration_id'])
  if (registrationId) {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .maybeSingle()
    registration = data
  }

  // ── 2. Fallback: look up by migrant email from the order ─────────────────
  //    Used for legacy orders that don't have registration_id attribute.
  if (!registration) {
    const email = (order.email as string) || (order.customer as Record<string, string> | undefined)?.email || ''
    if (email) {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .or(`migrant_email.eq.${email},family_email.eq.${email}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      registration = data
    }
  }

  if (!registration) {
    console.error('[webhook/shopify] No registration found for order', order.id)
    return NextResponse.json({ ok: false, error: 'Registro no encontrado' }, { status: 404 })
  }

  // ── 3. Activate registration ─────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('registrations')
    .update({ status: 'active', payment_completed_at: new Date().toISOString() })
    .eq('id', registration.id)

  if (updateError) {
    // Return 500 so Shopify retries the webhook instead of silently skipping
    console.error('[webhook/shopify] Failed to activate registration:', registration.id, updateError.message)
    return NextResponse.json({ ok: false, error: 'Failed to activate registration' }, { status: 500 })
  }

  const migrantName =
    [registration.migrant_first_name, registration.migrant_last_name].filter(Boolean).join(' ').trim() ||
    'Migrante'
  const familyName =
    [registration.family_first_name, registration.family_last_name].filter(Boolean).join(' ').trim() ||
    'Familiar'
  const migrantCode = registration.migrant_code
  const familyCode = registration.family_code
  const appUrl = 'https://www.saludcompartida.app'

  // ── 4. Send welcome email to migrant (USA) ───────────────────────────────
  if (registration.migrant_email) {
    await sendEmail({
      to: registration.migrant_email,
      subject: '🎉 ¡Tu suscripción SaludCompartida está activa! — Tus códigos de acceso',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111827;color:#fff;padding:32px;border-radius:16px">
          <h2 style="color:#EC4899;margin-top:0">¡Hola, ${migrantName}! 🎉</h2>
          <p style="color:#CBD5E1;line-height:1.7">
            Tu pago fue procesado correctamente. Ya tienes acceso a SaludCompartida.<br>
            Guarda bien estos códigos — los necesitarás para entrar.
          </p>
          ${codeBox('TU CÓDIGO DE ACCESO (EE.UU.)', migrantCode, 'rgba(236,72,153,0.4)')}
          ${codeBox(`CÓDIGO PARA ${familyName} (MÉXICO)`, familyCode, 'rgba(6,182,212,0.4)')}
          <p style="color:#CBD5E1;line-height:1.7">
            1. Entra a <a href="${appUrl}" style="color:#EC4899;font-weight:700">${appUrl}</a><br>
            2. Ingresa tu código <strong style="letter-spacing:3px;color:#fff">${migrantCode}</strong><br>
            3. Comparte el código <strong style="letter-spacing:3px;color:#a5f3fc">${familyCode}</strong> con ${familyName} en México
          </p>
          <p style="color:#64748B;font-size:12px;margin-top:24px;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px">
            ¿Tienes dudas? Escríbenos a <a href="mailto:contacto@saludcompartida.com" style="color:#EC4899">contacto@saludcompartida.com</a>
          </p>
        </div>`,
    })
  }

  // ── 5. Send welcome email to family member (México) ─────────────────────
  if (registration.family_email) {
    await sendEmail({
      to: registration.family_email,
      subject: `🎉 ${migrantName} te regaló SaludCompartida — Tu código de acceso`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111827;color:#fff;padding:32px;border-radius:16px">
          <h2 style="color:#06B6D4;margin-top:0">¡Hola, ${familyName}! 🎉</h2>
          <p style="color:#CBD5E1;line-height:1.7">
            <strong>${migrantName}</strong> te ha regalado acceso a SaludCompartida —
            doctor disponible 24/7, terapia semanal y acompañamiento personalizado.
          </p>
          ${codeBox('TU CÓDIGO DE ACCESO (MÉXICO)', familyCode, 'rgba(6,182,212,0.4)')}
          <p style="color:#CBD5E1;line-height:1.7">
            1. Entra a <a href="${appUrl}" style="color:#EC4899;font-weight:700">${appUrl}</a><br>
            2. Ingresa tu código <strong style="letter-spacing:3px;color:#a5f3fc">${familyCode}</strong><br>
            3. ¡Y empieza a usar tus beneficios hoy mismo!
          </p>
          <p style="color:#64748B;font-size:12px;margin-top:24px;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px">
            ¿Tienes dudas? Escríbenos a <a href="mailto:contacto@saludcompartida.com" style="color:#EC4899">contacto@saludcompartida.com</a>
          </p>
        </div>`,
    })
  }

  return NextResponse.json({ ok: true })
}
