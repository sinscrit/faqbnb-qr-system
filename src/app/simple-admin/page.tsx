'use client'

import { useState, useEffect } from 'react'
import { signOutSimple } from '@/lib/simple-auth-client'
import { useRouter } from 'next/navigation'

export default function SimpleAdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/simple-auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        console.log(`🔐 SIMPLE_AUTH: Admin page loaded for user:`, userData.user?.email)
      } else {
        console.log(`🔐 SIMPLE_AUTH: Not authenticated, redirecting to login`)
        router.push('/simple-login')
      }
    } catch (error) {
      console.error(`🔐 SIMPLE_AUTH: Auth check failed:`, error)
      router.push('/simple-login')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await signOutSimple()
    router.push('/simple-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Checking authentication...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Simple Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h2 className="text-lg font-semibold text-green-800">✅ Authentication Working!</h2>
              <p className="text-green-700">Welcome, {user.email}!</p>
              <p className="text-sm text-green-600">User ID: {user.id}</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="text-lg font-semibold text-blue-800">🎯 Next Steps</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Test QR code PDF generation</li>
                <li>Add proper admin functionality</li>
                <li>Replace complex auth system completely</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="text-lg font-semibold text-yellow-800">🔐 Simple Auth Status</h3>
              <div className="text-yellow-700 space-y-1">
                <div>✅ Client-side authentication: Working</div>
                <div>✅ Server-side authentication: Working</div>
                <div>✅ Cookie session: Propagating correctly</div>
                <div>✅ No complex state management needed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}