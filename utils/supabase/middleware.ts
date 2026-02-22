import { supabase } from './client'

export async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function requireAuth() {
  const session = await checkAuth()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
