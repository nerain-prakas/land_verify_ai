import { SignIn } from '@clerk/nextjs'

export default function SellerSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Seller Sign In</h1>
          <p className="mt-2 text-gray-600">
            Access your dashboard to manage land listings
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
            signUpUrl="/sign-up-seller"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Are you a buyer?{' '}
            <a
              href="/sign-in-buyer"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Sign in as Buyer
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
