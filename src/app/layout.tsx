import './globals.css'
import type { Metadata } from 'next'
import { fontBody, fontDisplay } from './fonts'

export const metadata: Metadata = {
  title: 'Geoscope',
  description: 'Inspired by R. Buckminster Fuller',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontBody.variable} ${fontDisplay.variable}`}>
      <body>{children}</body>
    </html>
  )
}