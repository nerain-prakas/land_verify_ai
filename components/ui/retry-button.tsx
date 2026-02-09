'use client'

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Retry Connection
    </button>
  )
}
