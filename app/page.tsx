'use client'
import React, { useState, useEffect, useRef } from 'react'
import { VALIDATION_CACHE_KEY } from './lib/validation-cache'

/* ── Pain card (antes / ahora) ─────────────────────────────────────────────── */
function PainCard({ icon, pain, fix, fixColor }: {
  icon: React.ReactNode; pain: string; fix: string; fixColor: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(20,30,50,0.9))'
          : 'linear-gradient(135deg, rgba(20,30,50,0.7), rgba(15,22,38,0.7))',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: '18px', padding: '22px 20px',
        textAlign: 'left' as const,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ marginTop: '2px', minWidth: '26px' }}>{icon}</div>
        <div>
          <p style={{ fontSize: '14px', color: '#94A3B8', textDecoration: 'line-through', marginBottom: '8px', lineHeight: '1.5' }}>
            {pain}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l4 4 8-8" stroke={fixColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontSize: '14px', fontWeight: '700', color: fixColor, lineHeight: '1.5' }}>{fix}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Benefit card ───────────────────────────────────────────────────────────── */
function BenefitCard({ gradient, border, accent, icon, title, desc, badge }: {
  gradient: string; border: string; accent: string; icon: React.ReactNode
  title: string; desc: string; badge: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: gradient,
        border: `1px solid ${hovered ? accent : border}`,
        borderRadius: '20px', padding: '26px 22px',
        textAlign: 'left' as const,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px ${accent}30` : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'all 0.25s ease',
        position: 'relative' as const, overflow: 'hidden' as const,
      }}
    >
      {hovered && (
        <div style={{
          position: 'absolute' as const, top: '-30px', right: '-30px',
          width: '100px', height: '100px',
          background: `radial-gradient(circle, ${accent}18, transparent 70%)`,
          pointerEvents: 'none' as const,
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '54px', height: '54px', minWidth: '54px', borderRadius: '14px',
          background: `linear-gradient(135deg, ${accent}18, ${accent}06)`,
          border: `1px solid ${accent}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.25s',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#F1F5F9', margin: 0 }}>{title}</h3>
            <span style={{
              fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
              background: `${accent}16`, color: accent, border: `1px solid ${accent}28`, whiteSpace: 'nowrap' as const,
            }}>{badge}</span>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.65', color: '#94A3B8', margin: 0 }}>{desc}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)
  const [imgError, setImgError] = useState(false)
  const navigating = useRef(false)

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const handleActivar = async () => {
    const trimmed = codigo.trim().toUpperCase()
    if (!trimmed) { setError('Por favor ingresa tu código de acceso'); return }
    if (trimmed.length !== 6) { setError('El código debe tener exactamente 6 caracteres'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/validar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })
      const data = await res.json()
      if (data.success && data.user &&
          (data.user.type === 'migrant' || data.user.type === 'family') &&
          typeof data.user.userName === 'string') {
        // Store validated result so the dashboard can skip the second API call
        try {
          sessionStorage.setItem(VALIDATION_CACHE_KEY, JSON.stringify({ code: trimmed, user: data.user, ts: Date.now() }))
        } catch { /* sessionStorage might be unavailable (private mode) — ignore */ }
        navigating.current = true
        window.location.href = `/dashboard?code=${trimmed}`
      } else {
        setError(data.error || 'Código no encontrado. Verifica e intenta de nuevo.')
      }
    } catch {
      setError('Error de conexión. Por favor intenta de nuevo.')
    } finally {
      // Keep the spinner showing while navigating away; only reset on failure
      if (!navigating.current) setLoading(false)
    }
  }

  const xIcon = (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="10" fill="none" stroke="#f87171" strokeWidth="1.8" />
      <path d="M9 9l8 8M17 9l-8 8" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", color: '#fff', overflowX: 'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(170deg,#080f1a 0%,#0d1829 50%,#111827 100%)', padding: '24px 24px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Logo */}
        <div style={{ position: 'absolute', top: '20px', left: '24px', zIndex: 10 }}>
          {!imgError ? (
            <img
              src="/saludcompartida-dark-no-tagline.png"
              alt="SaludCompartida"
              style={{ height: '40px', objectFit: 'contain' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.5px' }}>
              SaludCompartida
            </span>
          )}
        </div>

        {/* Glows */}
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse,rgba(236,72,153,0.14) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(ellipse,rgba(6,182,212,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

        {/* Heart icon */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '22px', background: 'linear-gradient(135deg,rgba(236,72,153,0.2),rgba(236,72,153,0.06))', border: '1px solid rgba(236,72,153,0.35)', marginBottom: '24px', opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.8)', transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <path d="M17 29s-12-7.5-12-16a7 7 0 0 1 12-4.9A7 7 0 0 1 29 13c0 8.5-12 16-12 16z" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinejoin="round" />
            <path d="M17 29s-12-7.5-12-16a7 7 0 0 1 12-4.9A7 7 0 0 1 29 13c0 8.5-12 16-12 16z" fill="rgba(236,72,153,0.15)" />
          </svg>
        </div>

        {/* Eyebrow */}
        <p style={{ fontSize: '13px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#EC4899', fontWeight: '700', marginBottom: '18px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.5s ease 0.15s' }}>
          Alguien que te quiere te regaló esto
        </p>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(30px,8vw,52px)', fontWeight: '800', lineHeight: '1.12', marginBottom: '20px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.55s ease 0.25s' }}>
          <span style={{ background: 'linear-gradient(135deg,#ffffff 0%,#fbcfe8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Cada familia<br />es una historia,<br />
          </span>
          <span style={{ background: 'linear-gradient(135deg,#06B6D4 0%,#EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            la tuya empieza aquí.
          </span>
        </h1>

        {/* Subhead */}
        <p style={{ fontSize: '17px', lineHeight: '1.7', color: '#CBD5E1', maxWidth: '380px', margin: '0 auto 36px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.5s ease 0.35s' }}>
          Ya no tienes que madrugar para un turno. Ya no tienes que esperar meses.
          Ya tienes doctor,{' '}
          <span style={{ color: '#a5f3fc', fontWeight: '600' }}>ahora mismo.</span>
        </p>

        {/* ── Code input card ─────────────────────────────────────────────────── */}
        <div style={{ maxWidth: '440px', margin: '0 auto', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.55s ease 0.45s' }}>
          <div style={{ background: 'linear-gradient(145deg,#1a2540,#141e33)', borderRadius: '24px', padding: '32px 28px', border: '1px solid rgba(236,72,153,0.2)', boxShadow: '0 0 60px rgba(236,72,153,0.07),0 24px 48px rgba(0,0,0,0.5)', position: 'relative' }}>
            {/* Accent top line */}
            <div style={{ position: 'absolute', top: 0, left: '28px', right: '28px', height: '2px', background: 'linear-gradient(90deg,transparent,#EC4899,#06B6D4,transparent)', borderRadius: '2px' }} />

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Tu código de acceso
            </label>

            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && handleActivar()}
              placeholder="Ej: A3B7K9"
              maxLength={6}
              style={{ width: '100%', boxSizing: 'border-box', padding: '18px 20px', fontSize: '20px', fontWeight: '700', letterSpacing: '4px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.04)', border: error ? '2px solid #f87171' : '2px solid rgba(236,72,153,0.25)', borderRadius: '14px', color: '#fff', outline: 'none', caretColor: '#EC4899', transition: 'border-color 0.2s,box-shadow 0.2s' }}
              onFocus={(e) => { e.target.style.borderColor = '#EC4899'; e.target.style.boxShadow = '0 0 0 4px rgba(236,72,153,0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = error ? '#f87171' : 'rgba(236,72,153,0.25)'; e.target.style.boxShadow = 'none' }}
            />

            {error && (
              <p style={{ color: '#f87171', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>{error}</p>
            )}

            <button
              onClick={handleActivar}
              disabled={loading}
              style={{ width: '100%', marginTop: '18px', padding: '18px', fontSize: '16px', fontWeight: '700', borderRadius: '14px', border: 'none', cursor: loading ? 'default' : 'pointer', background: loading ? 'rgba(236,72,153,0.4)' : 'linear-gradient(135deg,#EC4899 0%,#be185d 100%)', color: '#fff', boxShadow: loading ? 'none' : '0 8px 28px rgba(236,72,153,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d="M10 2a8 8 0 0 1 8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Verificando tu código…
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 10l5 5 9-9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Activar mi Acceso
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: '#475569' }}>
              Tu código tiene 6 caracteres — llegó en tu WhatsApp o correo
            </p>
          </div>
        </div>
      </div>

      {/* ── PAIN SECTION ─────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(180deg,#111827 0%,#0d1420 100%)', padding: '56px 24px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', color: '#475569', fontWeight: '600', marginBottom: '16px' }}>Esto cambia hoy</p>
        <h2 style={{ fontSize: 'clamp(22px,5vw,34px)', fontWeight: '800', color: '#F1F5F9', lineHeight: '1.2', marginBottom: '12px' }}>
          Lo que ya no tienes<br />que volver a vivir
        </h2>
        <p style={{ color: '#64748B', fontSize: '15px', maxWidth: '400px', margin: '0 auto 40px' }}>
          Millones de familias en México lo sufren cada día. Tú ya no.
        </p>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '14px' }}>
          {[
            { pain: 'Madrugar a las 5 AM para un turno', fix: 'Consulta en minutos, desde tu casa', fixColor: '#34D399' },
            { pain: 'Esperar 6 meses para ver un especialista', fix: 'Médico disponible hoy, sin cita previa', fixColor: '#34D399' },
            { pain: '4 horas de fila para que el doctor no llegue', fix: 'Tu tiempo vale — atención garantizada', fixColor: '#34D399' },
            { pain: 'Sentirte sola cuando te sientes mal', fix: 'Tienes a alguien que te llama y te escucha', fixColor: '#EC4899' },
          ].map((item, i) => <PainCard key={i} icon={xIcon} {...item} />)}
        </div>
      </div>

      {/* ── BENEFITS SECTION ─────────────────────────────────────────────────── */}
      <div style={{ background: '#0d1420', padding: '16px 24px 56px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', color: '#475569', fontWeight: '600', marginBottom: '16px' }}>Tu nuevo servicio</p>
        <h2 style={{ fontSize: 'clamp(22px,5vw,34px)', fontWeight: '800', color: '#F1F5F9', lineHeight: '1.2', marginBottom: '12px' }}>
          Todo lo que ahora<br /><span style={{ color: '#06B6D4' }}>tienes a tu alcance</span>
        </h2>
        <p style={{ color: '#64748B', fontSize: '15px', maxWidth: '380px', margin: '0 auto 40px' }}>Sin filas. Sin burocracia. Sin gastar de más.</p>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px' }}>
          {[
            {
              accent: '#06B6D4', gradient: 'linear-gradient(135deg,rgba(6,182,212,0.1),rgba(6,182,212,0.03))', border: 'rgba(6,182,212,0.2)',
              icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M15 4C9.5 4 5 8.5 5 14c0 4.2 2.5 7.8 6.2 9.5l1 .5H15h2.8l1-.5C22.5 21.8 25 18.2 25 14c0-5.5-4.5-10-10-10z" fill="none" stroke="#06B6D4" strokeWidth="1.8" /><path d="M11 14h8M15 10v8" stroke="#06B6D4" strokeWidth="2.2" strokeLinecap="round" /></svg>,
              title: 'Doctor ahora mismo', desc: 'Consulta con médicos certificados por videollamada o chat, cualquier día, a cualquier hora. Sin filas. Sin traslado.', badge: 'Ilimitado · 24/7',
            },
            {
              accent: '#818CF8', gradient: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.03))', border: 'rgba(99,102,241,0.2)',
              icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="11" r="5" fill="none" stroke="#818CF8" strokeWidth="1.8" /><path d="M7 25c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" /><path d="M21 8.5l2.5 2.5-5 5" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
              title: 'Terapia para ti', desc: 'Una sesión semanal con psicólogo certificado. Porque tu salud mental importa tanto como tu salud física. Sin listas de espera.', badge: '1 sesión / semana',
            },
            {
              accent: '#EC4899', gradient: 'linear-gradient(135deg,rgba(236,72,153,0.1),rgba(236,72,153,0.03))', border: 'rgba(236,72,153,0.2)',
              icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="5" y="10" width="14" height="14" rx="4" fill="none" stroke="#EC4899" strokeWidth="1.8" /><path d="M9 10V8a6 6 0 0 1 12 0v8" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="17" r="2.2" fill="#EC4899" /><path d="M12 19.2v2.3" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round" /><path d="M22 11c2 1.5 3 3.8 3 6" stroke="#EC4899" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" /></svg>,
              title: 'Lupita te llama', desc: 'Tu compañera de bienestar te llama para saber cómo estás. No estás sola. Alguien siempre está pendiente de ti.', badge: 'Tu compañera de IA',
            },
            {
              accent: '#34D399', gradient: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.03))', border: 'rgba(16,185,129,0.2)',
              icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="10" fill="none" stroke="#34D399" strokeWidth="1.8" /><path d="M15 10v5l4 2.5" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
              title: 'Tu tiempo, respetado', desc: 'Atención inmediata. Nunca más perder el día en una clínica. Nunca más que tu jefe se moleste. Tú decides cuándo.', badge: 'Sin esperas',
            },
          ].map((b, i) => <BenefitCard key={i} {...b} />)}
        </div>
      </div>

      {/* ── STATS STRIP ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.06),rgba(236,72,153,0.06))', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '36px', maxWidth: '560px', margin: '0 auto' }}>
          {[{ num: '100%', label: 'gratis para ti' }, { num: '24/7', label: 'médico disponible' }, { num: '0 filas', label: 'nunca más' }, { num: '1/semana', label: 'sesión de terapia' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg,#06B6D4,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.num}</div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EMOTIONAL CLOSE ──────────────────────────────────────────────────── */}
      <div style={{ padding: '56px 24px', textAlign: 'center', background: 'linear-gradient(180deg,#0d1420 0%,#080f1a 100%)' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'linear-gradient(145deg,#1a2540,#141e33)', borderRadius: '24px', padding: '36px 28px', border: '1px solid rgba(236,72,153,0.15)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: 'radial-gradient(circle,rgba(236,72,153,0.1),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg,rgba(236,72,153,0.2),rgba(236,72,153,0.06))', border: '1px solid rgba(236,72,153,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 2l2.5 5 5.5.8-4 3.9.9 5.5L13 15.8l-4.9 2.2.9-5.5-4-3.9 5.5-.8L13 2z" fill="rgba(236,72,153,0.2)" stroke="#EC4899" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', color: '#EC4899', fontWeight: '700', marginBottom: '16px' }}>Esto no fue casualidad</p>
          <p style={{ fontSize: '18px', lineHeight: '1.75', color: '#CBD5E1', fontStyle: 'italic', marginBottom: '24px' }}>
            "Alguien que trabaja lejos, que extraña estar contigo, que se desvela pensando en tu salud —
            decidió que merecías lo mejor."{' '}<br /><br />
            <span style={{ color: '#f9a8d4', fontStyle: 'normal', fontWeight: '700' }}>Ese regalo ya es tuyo. Actívalo hoy.</span>
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ width: '100%', padding: '18px', fontSize: '16px', fontWeight: '700', borderRadius: '14px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#EC4899 0%,#be185d 100%)', color: '#fff', boxShadow: '0 8px 28px rgba(236,72,153,0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l2 4.5 5 .7-3.5 3.4.8 5L10 13.2l-4.3 2 .8-5L3 6.7l5-.7L10 2z" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            Activar mi Acceso
          </button>
        </div>
        <p style={{ color: '#1e293b', fontSize: '12px', marginTop: '36px' }}>
          SaludCompartida · contacto@saludcompartida.com · saludcompartida.app
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #334155; letter-spacing: 2px; font-size: 16px; font-weight: 400; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
