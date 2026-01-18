import { getServerUser } from '@/lib/simple-auth-server'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log(`🔐 SIMPLE_AUTH: API /me called`)
  
  try {
    const { user, error } = await getServerUser()
    
    if (error) {
      console.log(`🔐 SIMPLE_AUTH: User check failed:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    if (!user) {
      console.log(`🔐 SIMPLE_AUTH: No user found`)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    console.log(`🔐 SIMPLE_AUTH: User authenticated:`, user.email)
    return NextResponse.json({ user })
    
  } catch (error) {
    console.error(`🔐 SIMPLE_AUTH: Server error:`, error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}