'use client'

const WA_AHORRO = 'https://wa.me/525610178639?text=Hola%2C+quiero+usar+mi+descuento+en+farmacias+con+SaludCompartida'

const PHARMACIES = [
  'Farmacias del Ahorro',
  'Farmacias Benavides',
  'Farmacia Guadalajara',
  'Farmacias San Pablo',
  'Farmacias GI',
  'Y más de 10,000 puntos',
]

const STEPS = [
  { n: '1', text: 'Solicita tu tarjeta de descuento gratuita escribiéndonos por WhatsApp' },
  { n: '2', text: 'Preséntala en caja al pagar tus medicamentos' },
  { n: '3', text: 'El descuento se aplica automáticamente — sin trámites' },
]

export default function Ahorro() {
  return (
    <div style={{ padding: '24px 20px 12px', maxWidth: '520px', margin: '0 auto' }}>

      {/* Hero card */}
      <div style={{
        background: 'linear-gradient(145deg,#1a2540,#141e33)',
        border: '1px solid rgba(52,211,153,0.3)',
        borderRadius: '20px',
        padding: '28px 24px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>💊</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F1F5F9', marginBottom: '10px' }}>
          Descuentos en farmacias
        </h2>

        {/* Discount badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(52,211,153,0.12)',
          border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: '20px',
          padding: '8px 20px',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#34D399' }}>Hasta 75% off</span>
        </div>

        <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: '1.65', marginBottom: '24px' }}>
          Ahorra en medicamentos, vitaminas y productos de salud
          en toda la República Mexicana. Tu tarjeta de descuento es gratis.
        </p>
        <a
          href={WA_AHORRO}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#059669,#047857)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            padding: '16px 32px',
            borderRadius: '14px',
            textDecoration: 'none',
            boxShadow: '0 8px 28px rgba(5,150,105,0.35)',
          }}
        >
          Obtener tarjeta de descuento →
        </a>
      </div>

      {/* How to use */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px 20px 8px',
        marginBottom: '20px',
      }}>
        <p style={{ color: '#64748B', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
          Cómo usarlo
        </p>
        {STEPS.map((s) => (
          <div key={s.n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              minWidth: '28px', height: '28px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.15)',
              border: '1px solid rgba(52,211,153,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#34D399',
            }}>
              {s.n}
            </div>
            <p style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: '1.6', paddingTop: '4px' }}>{s.text}</p>
          </div>
        ))}
      </div>

      {/* Pharmacies */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <p style={{ color: '#64748B', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
          Farmacias participantes
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {PHARMACIES.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: '#94A3B8', fontSize: '13px',
            }}>
              <span style={{ color: '#34D399', fontSize: '12px' }}>✓</span>
              {p}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
