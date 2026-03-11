'use client'

const WA_TERAPIA = 'https://wa.me/525610178639?text=Hola%2C+quiero+agendar+mi+sesi%C3%B3n+de+terapia+de+esta+semana'

const FOCUSES = [
  { icon: '😰', label: 'Ansiedad y estrés' },
  { icon: '💔', label: 'Duelo y pérdidas' },
  { icon: '✈️', label: 'Migración y adaptación' },
  { icon: '👨‍👩‍👧', label: 'Dinámicas familiares' },
  { icon: '😔', label: 'Depresión y ánimo bajo' },
  { icon: '💪', label: 'Autoestima y bienestar' },
]

export default function Terapia() {
  return (
    <div style={{ padding: '24px 20px 12px', maxWidth: '520px', margin: '0 auto' }}>

      {/* Hero card */}
      <div style={{
        background: 'linear-gradient(145deg,#1a2540,#141e33)',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: '20px',
        padding: '28px 24px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧠</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F1F5F9', marginBottom: '10px' }}>
          Tu sesión de terapia
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: '1.65', marginBottom: '8px' }}>
          1 sesión semanal incluida en tu plan con un psicólogo certificado.
          Confidencial, sin juicios, desde donde estés.
        </p>
        <div style={{
          display: 'inline-block',
          background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '20px',
          padding: '6px 16px',
          fontSize: '13px',
          color: '#a78bfa',
          fontWeight: 600,
          marginBottom: '24px',
        }}>
          1 sesión por semana incluida
        </div>
        <br />
        <a
          href={WA_TERAPIA}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            padding: '16px 32px',
            borderRadius: '14px',
            textDecoration: 'none',
            boxShadow: '0 8px 28px rgba(124,58,237,0.35)',
          }}
        >
          Agendar mi sesión →
        </a>
      </div>

      {/* Focus areas */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <p style={{ color: '#64748B', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
          Temas que puedes trabajar
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {FOCUSES.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div>
              <p style={{ color: '#CBD5E1', fontSize: '12px', lineHeight: '1.4' }}>{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '18px 20px',
      }}>
        <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.7' }}>
          💡 <strong style={{ color: '#CBD5E1' }}>¿Cómo empezar?</strong> Escríbenos por WhatsApp y te asignamos un terapeuta
          en menos de 24 horas. Las sesiones son por videollamada, en horario flexible.
        </p>
      </div>

    </div>
  )
}
