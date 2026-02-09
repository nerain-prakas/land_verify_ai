import { SignIn } from '@clerk/nextjs'

export default function BuyerSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Sign In</h1>
          <p className="mt-2 text-gray-600">
            Access your account to explore verified land listings
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-xl">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none",
              },
            }}
            signUpUrl="/sign-up-buyer"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Are you a seller?{' '}
            <a
              href="/sign-in-seller"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in as Seller
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
