'use client'

const WA_LUPITA = 'https://wa.me/525610178639?text=Hola+Lupita%2C+soy+usuaria+de+SaludCompartida+y+necesito+orientaci%C3%B3n'

const HELPS = [
  { icon: '📅', title: 'Agenda tus citas', desc: 'Te ayuda a agendar consultas médicas y sesiones de terapia' },
  { icon: '❓', title: 'Resuelve dudas', desc: 'Cualquier pregunta sobre tu plan, servicios o cómo usarlos' },
  { icon: '💊', title: 'Orientación médica', desc: 'Te orienta sobre qué servicio es el adecuado para ti' },
  { icon: '💜', title: 'Apoyo emocional', desc: 'Alguien que te escucha cuando lo necesitas, sin juicios' },
]

export default function Acompanamiento() {
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
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>💜</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F1F5F9', marginBottom: '10px' }}>
          Lupita, tu acompañante
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: '1.65', marginBottom: '24px' }}>
          Lupita está aquí para ti — responde tus preguntas, te ayuda a agendar
          y te acompaña en todo momento. No estás sola.
        </p>
        <a
          href={WA_LUPITA}
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
          Hablar con Lupita →
        </a>
      </div>

      {/* What Lupita helps with */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <p style={{ color: '#64748B', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
          Lupita te ayuda con
        </p>
        {HELPS.map((h, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              paddingBottom: i < HELPS.length - 1 ? '14px' : 0,
              marginBottom: i < HELPS.length - 1 ? '14px' : 0,
              borderBottom: i < HELPS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
          >
            <div style={{
              fontSize: '22px',
              minWidth: '36px',
              height: '36px',
              background: 'rgba(236,72,153,0.1)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {h.icon}
            </div>
            <div>
              <p style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 700, marginBottom: '3px' }}>{h.title}</p>
              <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.5' }}>{h.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Availability note */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(236,72,153,0.08),rgba(6,182,212,0.06))',
        border: '1px solid rgba(236,72,153,0.2)',
        borderRadius: '16px',
        padding: '18px 20px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#EC4899', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
          Disponible en WhatsApp
        </p>
        <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.6' }}>
          Escríbele en cualquier momento — Lupita responde durante el horario de atención
          y te deja mensajes para cuando regreses.
        </p>
      </div>

    </div>
  )
}
