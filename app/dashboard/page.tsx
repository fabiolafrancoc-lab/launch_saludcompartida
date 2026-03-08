'use client'
import { useEffect, useState } from 'react'

interface UserInfo {
  type: 'migrant' | 'family'
  userName: string
  email?: string
  planType?: string
}

const BENEFITS = [
  { icon: '🩺', label: 'Doctor 24/7 por videollamada o chat' },
  { icon: '🧠', label: '1 sesión de terapia por semana' },
  { icon: '💊', label: 'Descuentos en farmacias hasta 75%' },
  { icon: '💜', label: 'Acompañamiento personalizado (Lupita)' },
]

export default function DashboardPage() {
  const [code, setCode] = useState<string | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
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
        <p style={{ color: '#f87171', fontSize: '16px', maxWidth: '360px', lineHeight: '1.6' }}>{error}</p>
        <a
          href="/"
          style={{ color: '#EC4899', fontWeight: 700, textDecoration: 'none', fontSize: '15px' }}
        >
          ← Volver al inicio
        </a>
      </div>
    )
  }

  /* ── Success ───────────────────────────────────────────────────────────── */
  const firstName = (user?.userName ?? '').split(' ')[0]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#111827',
        color: '#fff',
        fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
        padding: '32px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ marginBottom: '28px' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px' }}>
            SaludCompartida
          </span>
        </div>

        {/* Welcome */}
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
        <h1 style={{ fontSize: 'clamp(22px,5vw,30px)', fontWeight: 800, marginBottom: '8px' }}>
          ¡Bienvenida{user?.type === 'family' ? '' : 'o'}, {firstName}!
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '15px', marginBottom: '32px', lineHeight: '1.6' }}>
          Tu código{' '}
          <strong style={{ color: '#EC4899', letterSpacing: '3px', fontFamily: 'monospace' }}>
            {code}
          </strong>{' '}
          está activo.
        </p>

        {/* Benefits */}
        <div
          style={{
            background: 'linear-gradient(145deg,#1a2540,#141e33)',
            borderRadius: '20px',
            padding: '28px 24px',
            border: '1px solid rgba(236,72,153,0.2)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            marginBottom: '24px',
          }}
        >
          <p
            style={{
              color: '#64748B',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            Tus beneficios activos
          </p>
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 0',
                borderBottom:
                  i < BENEFITS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '22px', minWidth: '28px' }}>{b.icon}</span>
              <span style={{ fontSize: '14px', color: '#CBD5E1' }}>{b.label}</span>
              <span style={{ marginLeft: 'auto', color: '#34D399', fontSize: '16px' }}>✓</span>
            </div>
          ))}
        </div>

        <p style={{ color: '#475569', fontSize: '13px' }}>
          ¿Dudas? WhatsApp:{' '}
          <a
            href="https://wa.me/525610178639"
            style={{ color: '#EC4899', textDecoration: 'none', fontWeight: 600 }}
          >
            +52 56 1017 8639
          </a>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
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
