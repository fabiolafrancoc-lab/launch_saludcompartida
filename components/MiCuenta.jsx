'use client'

const WA_SUPPORT = 'https://wa.me/525610178639?text=Hola%2C+tengo+una+pregunta+sobre+mi+cuenta+SaludCompartida'

export default function MiCuenta({ user, code }) {
  const firstName = (user?.userName ?? '').split(' ')[0] || 'Usuario'
  const isFamily = user?.type === 'family'

  const INFO_ROWS = [
    { label: 'Nombre', value: user?.userName || '—' },
    { label: 'Tipo de usuario', value: isFamily ? '👨‍👩‍👧 Familiar (México)' : '✈️ Migrante (EE.UU.)' },
    { label: 'Plan', value: user?.planType || 'Plan Familiar' },
    ...(user?.email ? [{ label: 'Correo', value: user.email }] : []),
  ]

  return (
    <div style={{ padding: '24px 20px 12px', maxWidth: '520px', margin: '0 auto' }}>

      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(145deg,#1a2540,#141e33)',
        border: '1px solid rgba(236,72,153,0.2)',
        borderRadius: '20px',
        padding: '28px 24px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F1F5F9', marginBottom: '8px' }}>
          ¡Hola, {firstName}!
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '20px' }}>
          Tu cuenta SaludCompartida está activa.
        </p>

        {/* Code display */}
        <div style={{
          background: 'rgba(236,72,153,0.08)',
          border: '1px solid rgba(236,72,153,0.25)',
          borderRadius: '14px',
          padding: '16px 20px',
        }}>
          <p style={{ color: '#64748B', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
            Tu código de acceso
          </p>
          <p style={{
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '8px',
            color: '#EC4899',
            fontFamily: 'monospace',
          }}>
            {code || '——'}
          </p>
          <p style={{ color: '#475569', fontSize: '12px', marginTop: '8px' }}>
            Guárdalo — lo necesitas para entrar cada vez
          </p>
        </div>
      </div>

      {/* Account info */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <p style={{ color: '#64748B', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
          Información de cuenta
        </p>
        {INFO_ROWS.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
              paddingBottom: i < INFO_ROWS.length - 1 ? '14px' : 0,
              marginBottom: i < INFO_ROWS.length - 1 ? '14px' : 0,
              borderBottom: i < INFO_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
          >
            <span style={{ color: '#64748B', fontSize: '13px', whiteSpace: 'nowrap' }}>{row.label}</span>
            <span style={{ color: '#CBD5E1', fontSize: '13px', fontWeight: 600, textAlign: 'right', wordBreak: 'break-all' }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Support */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '14px' }}>
          ¿Dudas o problemas con tu cuenta?
        </p>
        <a
          href={WA_SUPPORT}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(37,211,102,0.12)',
            border: '1px solid rgba(37,211,102,0.3)',
            color: '#25d366',
            fontWeight: 700,
            fontSize: '14px',
            padding: '12px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Contactar soporte
        </a>
        <p style={{ color: '#475569', fontSize: '12px', marginTop: '12px' }}>
          También puedes escribir a{' '}
          <a href="mailto:contacto@saludcompartida.com" style={{ color: '#EC4899', textDecoration: 'none' }}>
            contacto@saludcompartida.com
          </a>
        </p>
      </div>

    </div>
  )
}
