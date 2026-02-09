'use client'

import { SignUp } from '@clerk/nextjs'

export default function BuyerSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Sign Up</h1>
          <p className="mt-2 text-gray-600">
            Create an account to explore AI-verified land listings
          </p>
        </div>
        
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none",
              },
            }}
            signInUrl="/sign-in-buyer"
            redirectUrl="/explore"
            afterSignUpUrl="/explore"
            unsafeMetadata={{
              role: 'BUYER'
            }}
          />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Are you a seller?{' '}
            <a
              href="/sign-up-seller"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up as Seller
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
