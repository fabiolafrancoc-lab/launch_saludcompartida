'use client'

const WA_DOCTOR = 'https://wa.me/525610178639?text=Hola%2C+quiero+iniciar+una+consulta+m%C3%A9dica+con+SaludCompartida'

const SPECIALTIES = [
  '🏥 Medicina general',
  '👶 Pediatría',
  '🌸 Ginecología y obstetricia',
  '🍎 Nutrición y obesidad',
  '💊 Dermatología',
  '🧬 Geriatría',
]

const STEPS = [
  { n: '1', text: 'Escríbenos por WhatsApp o abre el chat en la app' },
  { n: '2', text: 'Describe brevemente tus síntomas al médico' },
  { n: '3', text: 'Recibe tu consulta por videollamada o chat en minutos' },
]

export default function Doctor() {
  return (
    <div style={{ padding: '24px 20px 12px', maxWidth: '520px', margin: '0 auto' }}>

      {/* Hero card */}
      <div style={{
        background: 'linear-gradient(145deg,#1a2540,#141e33)',
        border: '1px solid rgba(236,72,153,0.25)',
        borderRadius: '20px',
        padding: '28px 24px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🩺</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F1F5F9', marginBottom: '10px' }}>
          Doctor ahora mismo
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: '1.65', marginBottom: '24px' }}>
          Consulta con un médico certificado en minutos.
          Sin cita, sin filas, sin salir de casa — disponible las&nbsp;24&nbsp;horas.
        </p>
        <a
          href={WA_DOCTOR}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#EC4899,#be185d)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            padding: '16px 32px',
            borderRadius: '14px',
            textDecoration: 'none',
            boxShadow: '0 8px 28px rgba(236,72,153,0.35)',
          }}
        >
          Iniciar consulta →
        </a>
      </div>

      {/* How it works */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px 20px 8px',
        marginBottom: '20px',
      }}>
        <p style={{ color: '#64748B', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
          Cómo funciona
        </p>
        {STEPS.map((s) => (
          <div key={s.n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              minWidth: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg,rgba(236,72,153,0.3),rgba(236,72,153,0.1))',
              border: '1px solid rgba(236,72,153,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#EC4899',
            }}>
              {s.n}
            </div>
            <p style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: '1.6', paddingTop: '4px' }}>{s.text}</p>
          </div>
        ))}
      </div>

      {/* Specialties */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <p style={{ color: '#64748B', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
          Especialidades disponibles
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {SPECIALTIES.map((s, i) => (
            <div key={i} style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.5' }}>{s}</div>
          ))}
        </div>
      </div>

    </div>
  )
}
