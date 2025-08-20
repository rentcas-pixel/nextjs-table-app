import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Viadukų užimtumas',
  description: 'Bridge occupancy management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lt">
      <body>{children}</body>
    </html>
  )
}

