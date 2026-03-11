'use client'

import { useState } from 'react'
import Doctor from './Doctor'
import Terapia from './Terapia'
import Acompanamiento from './Acompanamiento'
import Ahorro from './Ahorro'
import MiCuenta from './MiCuenta'

const TABS = [
  { id: 'doctor',   label: 'Doctor',   icon: '🩺' },
  { id: 'terapia',  label: 'Terapia',  icon: '🧠' },
  { id: 'lupita',   label: 'Lupita',   icon: '💜' },
  { id: 'ahorro',   label: 'Ahorro',   icon: '💊' },
  { id: 'cuenta',   label: 'Mi Cuenta', icon: '👤' },
]

export default function DashboardMexico({ user, code }) {
  const [activeTab, setActiveTab] = useState('doctor')

  const firstName = (user?.userName ?? '').split(' ')[0] || 'Usuario'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111827',
      color: '#fff',
      fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Top header ───────────────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(180deg,#0d1420 0%,#111827 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.5px' }}>
          Salud<span style={{ color: '#EC4899' }}>Compartida</span>
        </span>
        <div style={{
          background: 'rgba(52,211,153,0.12)',
          border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: '20px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
          <span style={{ color: '#34D399', fontSize: '12px', fontWeight: 600 }}>Activo</span>
        </div>
      </header>

      {/* ── Greeting strip ───────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 20px 10px',
        background: '#111827',
      }}>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>
          Hola, <strong style={{ color: '#F1F5F9' }}>{firstName}</strong> 👋
        </p>
      </div>

      {/* ── Scrollable content area ──────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        {activeTab === 'doctor'  && <Doctor />}
        {activeTab === 'terapia' && <Terapia />}
        {activeTab === 'lupita'  && <Acompanamiento />}
        {activeTab === 'ahorro'  && <Ahorro />}
        {activeTab === 'cuenta'  && <MiCuenta user={user} code={code} />}
      </main>

      {/* ── Bottom navigation ────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(13,20,32,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 20,
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px 12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                gap: '4px',
                transition: 'opacity 0.15s',
                opacity: isActive ? 1 : 0.55,
                position: 'relative',
              }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#EC4899',
                }} />
              )}
              <span style={{ fontSize: '22px', lineHeight: 1 }}>{tab.icon}</span>
              <span style={{
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#EC4899' : '#64748B',
                letterSpacing: '0.3px',
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
