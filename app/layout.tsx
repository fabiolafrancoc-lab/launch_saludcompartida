import type { ReactNode } from 'react'

export const metadata = {
  title: 'SaludCompartida',
  description: 'Salud para tu familia en México. Doctor ahora mismo, terapia y acompañamiento 24/7.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
