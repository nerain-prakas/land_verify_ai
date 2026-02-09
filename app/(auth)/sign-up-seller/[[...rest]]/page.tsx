'use client'

import { SignUp } from '@clerk/nextjs'

export default function SellerSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Seller Sign Up</h1>
          <p className="mt-2 text-gray-600">
            Create an account to list and verify your land with AI
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
            signInUrl="/sign-in-seller"
            redirectUrl="/dashboard"
            afterSignUpUrl="/dashboard"
            unsafeMetadata={{
              role: 'SELLER'
            }}
          />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Are you a buyer?{' '}
            <a
              href="/sign-up-buyer"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Sign up as Buyer
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
