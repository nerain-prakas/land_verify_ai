import React from "react";
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ToastProvider } from '@/components/ui/use-toast'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LandVerify AI - AI-Powered Land Verification Platform',
  description: 'Revolutionizing land transactions with AI-powered verification, multimodal analysis, and blockchain security.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}