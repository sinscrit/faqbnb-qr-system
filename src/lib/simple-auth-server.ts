import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Simple server-side authentication
export async function getServerUser() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  
  console.log(`🔐 SIMPLE_AUTH: Server user check:`, { 
    hasUser: !!user, 
    userId: user?.id, 
    email: user?.email,
    error: error?.message 
  })
  
  return { user, error }
}