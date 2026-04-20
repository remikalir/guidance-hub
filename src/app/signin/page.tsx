"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function SignInContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Duke branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-duke-blue rounded-2xl mb-4">
              <svg
                className="w-9 h-9 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Guidance Hub</h1>
            <p className="text-gray-500 text-sm mt-1">Duke University AI &amp; Education</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-center">
              <p className="text-red-700 text-sm">
                {error === "AccessDenied"
                  ? "Access is restricted to @duke.edu accounts."
                  : "An error occurred during sign in. Please try again."}
              </p>
            </div>
          )}

          {process.env.NEXT_PUBLIC_PROTOTYPE_MODE === "true" ? (
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700 text-center">
                Dev mode — enter any name to sign in
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) {
                    setLoading(true)
                    signIn("credentials", { name: name.trim(), callbackUrl: "/" })
                  }
                }}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-duke-blue/30 focus:border-duke-blue"
              />
              <button
                onClick={() => {
                  if (!name.trim()) return
                  setLoading(true)
                  signIn("credentials", { name: name.trim(), callbackUrl: "/" })
                }}
                disabled={!name.trim() || loading}
                className="w-full bg-duke-blue text-white py-3 rounded-xl font-medium hover:bg-duke-blue-dark transition-colors disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 bg-duke-blue text-white py-3 rounded-xl font-medium hover:bg-duke-blue-dark transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 0H0v11.4h11.4V0zM24 0H12.6v11.4H24V0zM11.4 12.6H0V24h11.4V12.6zM24 12.6H12.6V24H24V12.6z" />
              </svg>
              Sign in with Duke NetID
            </button>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">
            {process.env.NEXT_PUBLIC_PROTOTYPE_MODE === "true"
              ? "Dev accounts are local only and won't exist in production."
              : "Restricted to @duke.edu accounts only."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  )
}
