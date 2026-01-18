'use client'

import { useState } from 'react'
import { signInSimple } from '@/lib/simple-auth-client'
import { useRouter } from 'next/navigation'

export default function SimpleLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log(`🔐 SIMPLE_AUTH: Starting login process`)

    try {
      const { data, error } = await signInSimple(email, password)

      if (error) {
        console.error(`🔐 SIMPLE_AUTH: Login failed:`, error.message)
        setError(error.message)
      } else if (data.user) {
        console.log(`🔐 SIMPLE_AUTH: Login successful, redirecting to admin`)
        // Simple redirect - no complex state management
        window.location.href = '/simple-admin'
      } else {
        console.error(`🔐 SIMPLE_AUTH: Login failed: No user returned`)
        setError('Login failed: No user returned')
      }
    } catch (err) {
      console.error(`🔐 SIMPLE_AUTH: Login error:`, err)
      setError('Login failed: Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Simple Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Testing basic authentication
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Back to Home
            </button>
          </div>
        </form>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">🔧 Simple Auth Approach</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>✅ No complex state management</li>
            <li>✅ No race conditions or mutexes</li>
            <li>✅ Direct Supabase integration</li>
            <li>✅ Standard cookie-based sessions</li>
            <li>✅ Simple page redirects</li>
          </ul>
        </div>
      </div>
    </div>
  )
}