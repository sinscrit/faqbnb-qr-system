import { createBrowserClient } from '@supabase/ssr'

// Simple client-side login
export async function signInSimple(email: string, password: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  console.log(`🔐 SIMPLE_AUTH: Attempting login for ${email}`)
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  console.log(`🔐 SIMPLE_AUTH: Login result:`, { 
    hasUser: !!data.user, 
    userId: data.user?.id,
    error: error?.message 
  })
  
  return { data, error }
}

// Simple client-side logout
export async function signOutSimple() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  console.log(`🔐 SIMPLE_AUTH: Signing out`)
  
  const { error } = await supabase.auth.signOut()
  
  console.log(`🔐 SIMPLE_AUTH: Signout result:`, { error: error?.message })
  
  return { error }
}