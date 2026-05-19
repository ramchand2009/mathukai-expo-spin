import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Banu Herbals Spin Wheel',
  description: 'Spin & win landing page for Banu Herbals visitors.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
