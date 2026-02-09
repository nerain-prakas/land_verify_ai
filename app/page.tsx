"use client"

import { Button } from '@/components/ui/button'
import { MapPin, Shield, Brain, Users } from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Land
            <span className="text-green-600"> Verification</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Revolutionary platform using Gemini 3 Pro multimodal AI to verify land certificates, 
            analyze property videos, and provide intelligent insights for secure land transactions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/role-selection">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get Started
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Explore Properties
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Document Analysis</h3>
            <p className="text-gray-600">
              Advanced OCR and authenticity verification using Gemini 3 Pro for land certificates.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Video Land Verification</h3>
            <p className="text-gray-600">
              Multimodal analysis of property walkthrough videos with terrain, soil, and boundary verification.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              AI-powered buyer-seller matching with automated meeting scheduling and due diligence.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-green-600">94%</div>
            <div className="text-gray-600">Verification Accuracy</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-blue-600">&lt;30s</div>
            <div className="text-gray-600">Document Processing</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-purple-600">&lt;2min</div>
            <div className="text-gray-600">Video Analysis</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-orange-600">24/7</div>
            <div className="text-gray-600">AI Assistant</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 LandVerify AI. Built for Gemini 3 Global Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}