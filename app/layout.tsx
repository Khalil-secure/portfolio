import type { Metadata } from 'next'
import { JetBrains_Mono, Syne } from 'next/font/google'
import './globals.css'

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-mono',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'Khalil Ghiati — Infrastructure & Security Engineer',
  description: 'Infrastructure · Zero Trust · Security · DevOps. Engineering graduate specialised in network infrastructure and cybersecurity.',
  openGraph: {
    title: 'Khalil Ghiati — Infrastructure & Security Engineer',
    description: 'Infrastructure · Zero Trust · Security · DevOps',
    url: 'https://portfolio-khalil-secure.vercel.app',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetbrains.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  )
}
