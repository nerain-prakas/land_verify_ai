"use client"

import { Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import VerificationWizard from '@/components/verification/VerificationWizard'

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-green-600" />
                <span className="font-bold text-xl text-gray-900">LandVerify AI</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/explore">
                <Button variant="outline">Explore Land</Button>
              </Link>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      <VerificationWizard />
    </div>
  )
}
