import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mathukai Organic Expo Spin Wheel',
  description: 'Expo spin & win landing page for Mathukai Organic visitors.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
