'use client'
import { useEffect, useState } from 'react'
import { VALIDATION_CACHE_KEY, VALIDATION_CACHE_TTL_MS } from '../lib/validation-cache'
import DashboardMexico from '@/components/DashboardMexico'

interface UserInfo {
  type: 'migrant' | 'family'
  userName: string
  email?: string
  planType?: string
}

/** Returns true only if obj has the shape required by UserInfo */
function isValidUserInfo(obj: unknown): obj is UserInfo {
  if (!obj || typeof obj !== 'object') return false
  const u = obj as Record<string, unknown>
  return (
    (u.type === 'migrant' || u.type === 'family') &&
    typeof u.userName === 'string' &&
    u.userName.length > 0
  )
}

const centeredPage: React.CSSProperties = {
  minHeight: '100vh',
  background: '#111827',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '12px',
  color: '#fff',
  fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
}

export default function DashboardPage() {
  const [code, setCode] = useState<string | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // ── 1. Fast path: use validated data stored by the landing page ──────────
    //    This avoids a second API call for the common case (user came from /).
    try {
      const stored = sessionStorage.getItem(VALIDATION_CACHE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as { code?: string; user?: UserInfo; ts?: number }
        sessionStorage.removeItem(VALIDATION_CACHE_KEY)
        if (
          parsed.code &&
          isValidUserInfo(parsed.user) &&
          typeof parsed.ts === 'number' &&
          Date.now() - parsed.ts < VALIDATION_CACHE_TTL_MS
        ) {
          setCode(parsed.code)
          setUser(parsed.user)
          setLoading(false)
          return
        }
      }
    } catch { /* sessionStorage unavailable (private mode / SSR guard) — fall through */ }

    // ── 2. Slow path: re-validate via API (direct navigation / refresh) ──────
    const params = new URLSearchParams(window.location.search)
    const c = (params.get('code') ?? '').toUpperCase().trim()
    setCode(c)

    if (!c) {
      setError('No se encontró un código. Regresa al inicio e ingrésalo de nuevo.')
      setLoading(false)
      return
    }

    fetch('/api/validar-codigo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: c }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.user)
        else setError(data.error ?? 'Código inválido.')
      })
      .catch(() => setError('Error de conexión. Por favor intenta de nuevo.'))
      .finally(() => setLoading(false))
  }, [])

  /* ── Loading ───────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={centeredPage}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#94A3B8', fontSize: '16px' }}>Verificando tu código…</p>
      </div>
    )
  }

  /* ── Error ─────────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div style={{ ...centeredPage, flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: '40px' }}>🔒</div>
        <p style={{ color: '#f87171', fontSize: '16px', maxWidth: '360px', lineHeight: '1.6' }}>
          {error}
        </p>
        <a
          href="/"
          style={{ color: '#EC4899', fontWeight: 700, textDecoration: 'none', fontSize: '15px' }}
        >
          ← Volver al inicio
        </a>
      </div>
    )
  }

  /* ── Dashboard ─────────────────────────────────────────────────────────── */
  return <DashboardMexico user={user} code={code} />
}

